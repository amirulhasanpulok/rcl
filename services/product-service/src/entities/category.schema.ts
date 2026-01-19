import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
  collection: 'categories',
})
export class Category {
  @Prop({ default: uuid })
  _id: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: String, default: null })
  parentId?: string;

  @Prop({ type: [String], default: [] })
  children: string[];

  @Prop({ type: String, default: null })
  image?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  displayOrder: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ slug: 1, isActive: 1 });
