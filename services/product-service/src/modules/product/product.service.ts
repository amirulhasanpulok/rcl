import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product, ProductDocument } from '@/entities/product.schema';
import {
  CreateProductDto,
  UpdateProductDto,
  SearchProductDto,
} from './dto/product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingProduct = await this.productModel.findOne({
      sku: createProductDto.sku,
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    const product = new this.productModel(createProductDto);
    const savedProduct = await product.save();

    // Emit product.created event
    this.eventEmitter.emit('product.created', {
      productId: savedProduct._id,
      sku: savedProduct.sku,
      name: savedProduct.name,
      price: savedProduct.price,
      categoryIds: savedProduct.categoryIds,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Product created: ${savedProduct.sku}`);
    return savedProduct;
  }

  async findAll(searchDto: SearchProductDto): Promise<{ items: Product[]; total: number }> {
    const {
      query,
      categoryIds,
      minPrice,
      maxPrice,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchDto;

    const filters: any = { isActive: true };

    // Text search
    if (query) {
      filters.$text = { $search: query };
    }

    // Category filter
    if (categoryIds && categoryIds.length > 0) {
      filters.categoryIds = { $in: categoryIds };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) {
        filters.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filters.price.$lte = maxPrice;
      }
    }

    // Tags filter
    if (tags && tags.length > 0) {
      filters.tags = { $in: tags };
    }

    const skip = (page - 1) * limit;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      this.productModel
        .find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filters),
    ]);

    return { items: items as Product[], total };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productModel.findOne({ sku });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true }
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Emit product.updated event
    this.eventEmitter.emit('product.updated', {
      productId: product._id,
      sku: product.sku,
      name: product.name,
      changes: Object.keys(updateProductDto),
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Product updated: ${product.sku}`);
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await this.productModel.findByIdAndDelete(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Emit product.deleted event
    this.eventEmitter.emit('product.deleted', {
      productId: product._id,
      sku: product.sku,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Product deleted: ${product.sku}`);
  }

  async updateStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      { quantity },
      { new: true }
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    this.eventEmitter.emit('product.stock.updated', {
      productId: product._id,
      quantity: product.quantity,
      timestamp: new Date().toISOString(),
    });

    return product;
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    return this.productModel
      .find({
        isFeatured: true,
        isActive: true,
        publishedAt: { $lte: new Date() },
      })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();
  }

  async getProductsByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: Product[]; total: number }> {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel
        .find({
          categoryIds: categoryId,
          isActive: true,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments({
        categoryIds: categoryId,
        isActive: true,
      }),
    ]);

    return { items: items as Product[], total };
  }
}
