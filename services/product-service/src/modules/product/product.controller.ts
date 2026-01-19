import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  SearchProductDto,
  ProductResponseDto,
} from './dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and list products' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  async search(
    @Query() searchDto: SearchProductDto
  ): Promise<{ items: ProductResponseDto[]; total: number }> {
    return this.productService.findAll(searchDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  async getFeatured(@Query('limit') limit: number = 10): Promise<ProductResponseDto[]> {
    return this.productService.getFeaturedProducts(limit);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', type: 'string' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  async getByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ): Promise<{ items: ProductResponseDto[]; total: number }> {
    return this.productService.getProductsByCategory(categoryId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async getById(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }

  @Get('sku/:sku')
  @ApiOperation({ summary: 'Get product by SKU' })
  @ApiParam({ name: 'sku', type: 'string' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async getBySku(@Param('sku') sku: string): Promise<ProductResponseDto> {
    return this.productService.findBySku(sku);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204 })
  async delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id);
  }

  @Put(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number
  ): Promise<ProductResponseDto> {
    return this.productService.updateStock(id, quantity);
  }
}
