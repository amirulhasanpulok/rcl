import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from './category.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  async create(
    @Body('name') name: string,
    @Body('slug') slug: string,
    @Body('description') description?: string
  ) {
    return this.categoryService.create(name, slug, description);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  async getTree() {
    return this.categoryService.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  async update(@Param('id') id: string, @Body() updates: any) {
    return this.categoryService.update(id, updates);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  async delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}
