import mongoose, { Schema, Document } from 'mongoose';
import { ISection } from '@/types';

// Flexible item subschema. `strict: false` lets each section type store the
// exact shape it needs (e.g. testimonials add `designation` + `rating`,
// services add `link`, hero stats add `value`/`label`, nav links add `href`).
// Unknown fields are stored as-is so the JSON content used by the public site
// round-trips through MongoDB without losing data.
const SectionItemSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    icon: { type: String },
    link: { type: String },
    id: { type: String },
    designation: { type: String },
    rating: { type: Number },
  },
  { strict: false, _id: false }
);

const SECTION_TYPES = [
  'hero',
  'about',
  'services',
  'features',
  'team',
  'testimonials',
  'faq',
  'gallery',
  'contact',
  'cta',
  'banner',
  'text',
  'custom',
  // Site-level content blocks driven by JSON defaults in src/data/json.
  'navbar',
  'footer',
  'marquee',
  'procurement-wheel',
  'services-catalog',
] as const;

const SectionSchema = new Schema<ISection & Document>(
  {
    pageTitle: { type: String, required: true },
    pageSlug: { type: String, required: true },
    sectionType: {
      type: String,
      required: true,
      enum: SECTION_TYPES,
    },
    title: { type: String },
    subtitle: { type: String },
    content: { type: String },
    imageUrl: { type: String },
    buttonText: { type: String },
    buttonLink: { type: String },
    button2Text: { type: String },
    button2Link: { type: String },
    viewDetailsText: { type: String },
    items: [SectionItemSchema],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false }
);

SectionSchema.index({ pageSlug: 1, order: 1 });
SectionSchema.index({ pageSlug: 1, sectionType: 1 });

export default mongoose.models.Section || mongoose.model<ISection & Document>('Section', SectionSchema);
