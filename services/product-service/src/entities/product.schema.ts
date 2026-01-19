import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type ProductDocument = Product & Document;

export class Variant {
  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Map, of: String, default: {} })
  attributes: Record<string, string>;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Number, default: 0 })
  compareAtPrice?: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;
}

@Schema({
  timestamps: true,
  collection: 'products',
})
export class Product {
  @Prop({ default: uuid })
  _id: string;

  @Prop({ required: true, unique: true, index: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: String, default: null })
  longDescription?: string;

  @Prop({ type: [String], required: true })
  categoryIds: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  price: number;

  @Prop({ type: Number, default: 0 })
  compareAtPrice?: number;

  @Prop({ type: Number, default: 0 })
  cost?: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: [{ type: Variant }], default: [] })
  variants: Variant[];

  @Prop({ type: Number, default: 0 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  reviewCount: number;

  @Prop({ type: Map, of: String, default: {} })
  seo?: Record<string, string>;

  @Prop({ type: Map, of: String, default: {} })
  customAttributes?: Record<string, string>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isFeatured: boolean;

  @Prop({ type: Date, default: null })
  publishedAt?: Date;

  @Prop({ type: Date, default: null })
  publishedUntil?: Date;

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @Prop({ type: Date, default: Date.now, index: true })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', slug: 'text', description: 'text' });
ProductSchema.index({ categoryIds: 1, isActive: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1, publishedAt: -1 });
