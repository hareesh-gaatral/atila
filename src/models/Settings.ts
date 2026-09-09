import mongoose, { Schema, Document } from 'mongoose';
import { ISettings } from '@/types';

const SettingsSchema = new Schema<ISettings & Document>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'json'], default: 'text' },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings & Document>('Settings', SettingsSchema);
