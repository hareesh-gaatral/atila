import mongoose, { Schema, Document } from 'mongoose';
import { IMedia } from '@/types';

const MediaSchema = new Schema<IMedia & Document>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model<IMedia & Document>('Media', MediaSchema);
