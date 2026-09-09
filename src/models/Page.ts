import mongoose, { Schema, Document } from 'mongoose';
import { IPage } from '@/types';

const PageSchema = new Schema<IPage & Document>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    sections: [{ type: String }],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Page || mongoose.model<IPage & Document>('Page', PageSchema);
