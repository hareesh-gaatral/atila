import mongoose, { Schema, Document } from 'mongoose';
import { IService, IServicePage, IServiceStep } from '@/types';

/**
 * A product/service offered by ATILA. One document drives four surfaces:
 *
 *   - the home-page "Our Solutions" card,
 *   - the /services index card,
 *   - the navigation dropdown (when `showInMenu`), and
 *   - the dynamic /services/[slug] detail page.
 *
 * `page.sections` is an ordered list of enabled detail-page regions
 * ('steps' | 'benefits' | 'features' | 'howItWorks' | 'cta'); the matching
 * data lives in `page.steps / benefits / features / howItWorks / cta`. Keeping
 * the content next to the card fields means an admin manages one service
 * instead of several disconnected Section documents.
 */

// Flexible step subschema (mirrors the alternate image/text walkthrough that
// every existing service detail page uses today). strict:false lets the data
// round-trip even if a future service adds per-step extras.
const StepSchema = new Schema<IServiceStep>(
  {
    num: { type: String },
    title: { type: String },
    description: { type: String },
    points: { type: [String], default: [] },
    result: { type: String },
    image: { type: String },
  },
  { strict: false, _id: false }
);

const PageSchema = new Schema<IServicePage>(
  {
    // Ordered, enabled detail-page regions.
    sections: { type: [String], default: ['steps', 'cta'] },
    steps: { type: [StepSchema], default: [] },
    keyPoints: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    features: { type: [String], default: [] },
    howItWorks: { type: [String], default: [] },
    cta: {
      type: new Schema(
        {
          heading: { type: String },
          text: { type: String },
          buttonText: { type: String },
          buttonHref: { type: String },
          secondaryText: { type: String },
          secondaryHref: { type: String },
        },
        { strict: false, _id: false }
      ),
      default: () => ({}),
    },
  },
  { strict: false, _id: false }
);

const ServiceSchema = new Schema<IService & Document>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    tagline: { type: String },
    shortDescription: { type: String },
    description: { type: String },
    icon: { type: String },
    image: { type: String },
    showInMenu: { type: Boolean, default: true },
    menuOrder: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    ogImage: { type: String },
    page: { type: PageSchema, default: () => ({}) },
  },
  { timestamps: true, strict: false }
);

ServiceSchema.index({ slug: 1 }, { unique: true });
ServiceSchema.index({ isPublished: 1, isArchived: 1, order: 1, menuOrder: 1 });

export default mongoose.models.Service ||
  mongoose.model<IService & Document>('Service', ServiceSchema);
