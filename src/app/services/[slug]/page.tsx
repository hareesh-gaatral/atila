import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { getSettings, getServices, getServiceBySlug } from '@/lib/cache';
import type { IService, IServicePage, IServiceStep } from '@/types';

export const revalidate = 60;

type Props = {
  params: { slug: string };
};

// Best-effort static params from the DB so published pages are pre-rendered.
// Brand-new services added by an admin are served on-demand (dynamicParams is
// true by default), so no developer file is ever needed for a new service.
export async function generateStaticParams() {
  try {
    const services = await getServices();
    return services.map((service) => ({ slug: service.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  if (!service) return { title: 'Service Not Found' };
  const title = service.metaTitle || `${service.title} | ATILA Procurement Platform`;
  const description = service.metaDescription || service.description || service.shortDescription || '';
  return {
    title,
    description,
    openGraph: service.ogImage
      ? { title, description, images: [{ url: service.ogImage }] }
      : { title, description },
  };
}

// ---------------------------------------------------------------------------
// Reusable region renderers. Each mirrors the existing /services/[slug] design;
// they render only when the corresponding block is enabled (page.sections) AND
// has content, so a service page is built purely from its DB record.
// ---------------------------------------------------------------------------

/** Extract a URL string from a value that may be a string or a { url } object (MongoDB CMS pattern). */
function toImageUrl(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.url) return val.url;
  return '';
}

function WalkthroughRegion({ steps }: { steps: IServiceStep[] }) {
  return (
    <section className="py-16 bg-white dark:bg-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-20">
          {steps.map((section, i) => (
            <div key={i} className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                {toImageUrl(section.image) ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 group">
                    <img
                      src={toImageUrl(section.image)}
                      alt={section.title || ''}
                      className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {section.num && (
                      <div className="absolute top-4 left-4 bg-[#1e3a5f] text-white text-sm font-bold px-3 py-1 rounded-full">
                        {section.num}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 h-[300px] bg-gradient-to-br from-navy/5 to-teal-500/10 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow flex items-center justify-center text-3xl">
                      📋
                    </div>
                    {section.num && (
                      <div className="absolute top-4 left-4 bg-[#1e3a5f] text-white text-sm font-bold px-3 py-1 rounded-full">
                        {section.num}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                {section.num && (
                  <span className="text-teal-600 dark:text-teal-400 text-sm font-semibold uppercase tracking-wider">Step {section.num}</span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-slate-50 mt-2 mb-4">{section.title}</h2>
                {section.description && (
                  <p className="text-slate-600 dark:text-slate-300 mb-4">{section.description}</p>
                )}
                {Array.isArray(section.points) && section.points.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {section.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-600 dark:text-slate-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.result && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border-l-4 border-teal-500">
                    <p className="text-sm font-semibold text-navy dark:text-slate-50">
                      <span className="text-teal-600 dark:text-teal-400">Result: </span>{section.result}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function KeyPointsRegion({ points }: { points: string[] }) {
  return (
    <section className="py-16 bg-white dark:bg-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">Highlights</p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">Key Points at a Glance</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {points.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <span className="w-6 h-6 bg-teal-600/10 dark:bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsRegion({ benefits }: { benefits: string[] }) {
  return (
    <section className="py-16 bg-white dark:bg-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">Key Benefits</p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">Why You&apos;ll Love It</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="w-10 h-10 bg-teal-600/10 dark:bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesRegion({ features }: { features: string[] }) {
  return (
    <section className="py-16 bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">Everything Included</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksRegion({ steps }: { steps: string[] }) {
  return (
    <section className="py-16 bg-white dark:bg-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">Simple, Governed Process</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="h-full bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 bg-navy dark:bg-teal-500 rounded-full flex items-center justify-center text-white font-bold mb-4">
                  {i + 1}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaRegion({ cta, title }: { cta: NonNullable<IServicePage['cta']>; title: string }) {
  const heading = cta.heading || `Ready to Streamline ${title}?`;
  const text = cta.text || 'Talk to our procurement experts today.';
  const buttonText = cta.buttonText || 'Contact / Enquiry';
  const buttonHref = cta.buttonHref || '/contact';
  const secondaryText = cta.secondaryText || 'Ask a Question';
  const secondaryHref = cta.secondaryHref || '/#contact';
  return (
    <section className="py-16 bg-gradient-to-r from-navy to-[#1a3b5c]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{heading}</h2>
        {text && <p className="text-xl text-white/80 mb-8">{text}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={buttonHref}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white font-semibold px-8 py-4 rounded-lg transition-all"
          >
            {buttonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-all"
          >
            {secondaryText}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function ServiceDetailPage({ params }: Props) {
  const [service, settings] = await Promise.all([
    getServiceBySlug(params.slug),
    getSettings(),
  ]);

  if (!service) notFound();

  const page = service.page || {};
  const order = Array.isArray(page.sections) && page.sections.length ? page.sections : (['steps', 'cta'] as any[]);
  const steps = page.steps || [];
  const keyPoints = page.keyPoints || [];
  const benefits = page.benefits || [];
  const features = page.features || [];
  const howItWorks = page.howItWorks || [];
  const cta = page.cta || {};

  // Each enabled region rendered in the admin-chosen order (page.sections).
  // Empty regions are skipped; the CTA renders once enabled.
  const regions: Record<string, ReactNode> = {
    steps: steps.length > 0 ? <WalkthroughRegion steps={steps} /> : null,
    keyPoints: keyPoints.length > 0 ? <KeyPointsRegion points={keyPoints} /> : null,
    benefits: benefits.length > 0 ? <BenefitsRegion benefits={benefits} /> : null,
    features: features.length > 0 ? <FeaturesRegion features={features} /> : null,
    howItWorks: howItWorks.length > 0 ? <HowItWorksRegion steps={howItWorks} /> : null,
    cta: <CtaRegion cta={cta} title={service.title} />,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <Navbar settings={settings} />
      <main>
        {/* Hero */}
        <section className="relative py-12 bg-gradient-to-br from-navy to-[#1a3b5c] dark:from-[#0f172a] dark:to-[#1e293b] overflow-hidden pt-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Services
            </Link>
            <div className="flex items-start gap-4">
              {service.icon && (
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{service.icon}</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{service.title}</h1>
                {service.tagline && <p className="text-lg text-teal-300 dark:text-teal-400 font-semibold mb-2">{service.tagline}</p>}
                <p className="text-base text-white/80 max-w-2xl leading-relaxed">{service.description || service.shortDescription}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic content regions — rendered in the admin-chosen order. */}
        {order.map((type) => regions[type] || null)}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
