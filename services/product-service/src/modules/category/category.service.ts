import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '@/entities/category.schema';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>
  ) {}

  async create(name: string, slug: string, description?: string): Promise<Category> {
    const category = new this.categoryModel({
      name,
      slug,
      description,
    });

    const savedCategory = await category.save();
    this.logger.log(`Category created: ${slug}`);
    return savedCategory;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find({ isActive: true }).sort({ displayOrder: 1 });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    const category = await this.categoryModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    this.logger.log(`Category updated: ${category.slug}`);
    return category;
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Category not found');
    }

    this.logger.log(`Category deleted: ${result.slug}`);
  }

  async getTree(): Promise<Category[]> {
    return this.categoryModel
      .find({ isActive: true, parentId: null })
      .sort({ displayOrder: 1 });
  }
}
