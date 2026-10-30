import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { getSettings, getServices, getServiceBySlug } from '@/lib/cache';
import type { IService, IServicePage, IServiceStep } from '@/types';
import VendorManagementProcessFlow from '@/components/frontend/VendorManagementProcessFlow';
import O2CProcessFlow from '@/components/frontend/O2CProcessFlow';

export const revalidate = 60;

type Props = {
  params: { slug: string };
};

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

function toImageUrl(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.url) return val.url;
  return '';
}

function WalkthroughRegion({ steps, isVendor }: { steps: IServiceStep[]; isVendor?: boolean }) {
  return (
    <section className="py-8 bg-white dark:bg-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={isVendor ? "space-y-8 md:space-y-10" : "space-y-12 md:space-y-14"}>
          {steps.map((section, i) => (
            <div
              key={i}
              className={
                isVendor
                  ? "grid md:grid-cols-2 gap-8 items-center p-5 md:p-7 rounded-2xl bg-white dark:bg-[#111c38] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all duration-300"
                  : "grid md:grid-cols-2 gap-8 md:gap-12 items-center"
              }
            >
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                {toImageUrl(section.image) ? (
                  isVendor ? (
                    <div className="relative rounded-2xl overflow-hidden shadow-md group border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1529] p-2.5 sm:p-4 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[560px] flex items-center justify-center hover:border-teal-500/40 hover:shadow-xl transition-all duration-300">
                      <img
                        src={toImageUrl(section.image)}
                        alt={section.title || ''}
                        className="w-full h-auto max-h-[520px] md:max-h-[580px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      {section.num && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-[#1e3a5f] to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border border-white/20 z-10">
                          {section.num}
                        </div>
                      )}
                    </div>
                  ) : (
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
                  )
                ) : (
                  <div className={`relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 ${isVendor ? 'h-[320px] md:h-[400px]' : 'h-[300px]'} bg-gradient-to-br from-navy/5 to-teal-500/10 flex items-center justify-center`}>
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

              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                {section.num && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Step {section.num}
                  </div>
                )}
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2.5 tracking-tight">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base mb-3.5 leading-relaxed">
                    {section.description}
                  </p>
                )}
                {Array.isArray(section.points) && section.points.length > 0 && (
                  <ul className="space-y-2 mb-3.5">
                    {section.points.map((point, j) => (
                      <li key={j} className="flex items-start gap-2.5 group/item">
                        <span className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800/80 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:border-teal-500 transition-colors">
                          <svg className="w-3 h-3 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.result && (
                  <div className="bg-gradient-to-r from-teal-50/90 via-emerald-50/40 to-transparent dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-transparent rounded-xl p-3 border-l-4 border-teal-500 dark:border-teal-400 shadow-xs">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-teal-700 dark:text-teal-400 uppercase text-xs tracking-wider mr-1.5">
                        Outcome:
                      </span>
                      {section.result}
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
    <section className="py-8 bg-white dark:bg-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5">
          <p className="text-teal-600 dark:text-teal-400 text-xs font-semibold mb-1 uppercase tracking-wider">Highlights</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Key Points at a Glance</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3 max-w-4xl mx-auto">
          {points.map((point, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-teal-500/40 hover:shadow-md transition-all duration-300"
            >
              <span className="w-5 h-5 bg-teal-500/15 dark:bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-teal-600 dark:text-teal-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsRegion({ benefits }: { benefits: string[] }) {
  return (
    <section className="py-8 bg-slate-50/60 dark:bg-[#0b1329] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5">
          <p className="text-teal-600 dark:text-teal-400 text-xs font-semibold mb-1 uppercase tracking-wider">Key Benefits</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Why You&apos;ll Love It</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-teal-500/40 hover:shadow-md transition-all duration-300"
            >
              <div className="w-8 h-8 bg-teal-500/10 dark:bg-teal-400/20 rounded-lg flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesRegion({ features }: { features: string[] }) {
  return (
    <section className="py-8 bg-white dark:bg-[#0f172a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5">
          <p className="text-teal-600 dark:text-teal-400 text-xs font-semibold mb-1 uppercase tracking-wider">Features</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Everything Included</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-slate-50/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 hover:border-teal-500/40 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-teal-500/10 dark:bg-teal-400/20 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{feature}</span>
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
    <section className="py-8 bg-slate-50/60 dark:bg-[#0b1329] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5">
          <p className="text-teal-600 dark:text-teal-400 text-xs font-semibold mb-1 uppercase tracking-wider">How It Works</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Simple, Governed Process</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="h-full bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700 hover:border-teal-500/40 hover:shadow-md transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-br from-[#1e3a5f] to-teal-600 text-white rounded-lg flex items-center justify-center text-sm font-bold mb-3 shadow-sm">
                  {i + 1}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{step}</p>
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
    <section className="py-8 bg-gradient-to-r from-[#0d223a] via-[#163558] to-[#0d223a] border-t border-teal-500/20 border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">{heading}</h2>
        {text && <p className="text-base text-slate-200/90 mb-4">{text}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={buttonHref}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            {buttonText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-2.5 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5"
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
  const steps: IServiceStep[] =
    (Array.isArray(page.steps) && page.steps.length > 0)
      ? page.steps
      : ((service as any).sections || []);

  const keyPoints: string[] =
    (Array.isArray(page.keyPoints) && page.keyPoints.length > 0)
      ? page.keyPoints
      : ((service as any).keyPoints || []);

  const benefits: string[] =
    (Array.isArray(page.benefits) && page.benefits.length > 0)
      ? page.benefits
      : ((service as any).benefits || []);

  const features: string[] =
    (Array.isArray(page.features) && page.features.length > 0)
      ? page.features
      : ((service as any).features || []);

  const howItWorks: string[] =
    (Array.isArray(page.howItWorks) && page.howItWorks.length > 0)
      ? page.howItWorks
      : ((service as any).howItWorks || []);

  const cta = (page.cta && Object.keys(page.cta).length > 0)
    ? page.cta
    : ((service as any).cta || {});

  const order: string[] =
    (Array.isArray(page.sections) && page.sections.length > 0 && typeof page.sections[0] === 'string')
      ? page.sections
      : (['steps', 'cta'] as string[]);

  const isVendor = params.slug === 'vendor-management';

  const regions: Record<string, ReactNode> = {
    steps: steps.length > 0 ? <WalkthroughRegion steps={steps} isVendor={isVendor} /> : null,
    keyPoints: keyPoints.length > 0 ? <KeyPointsRegion points={keyPoints} /> : null,
    benefits: benefits.length > 0 ? <BenefitsRegion benefits={benefits} /> : null,
    features: features.length > 0 ? <FeaturesRegion features={features} /> : null,
    howItWorks: howItWorks.length > 0 ? <HowItWorksRegion steps={howItWorks} /> : null,
    cta: <CtaRegion cta={cta} title={service.title} />,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1329] transition-colors duration-500">
      <Navbar settings={settings} />
      <main>
        <section className="relative pt-20 pb-8 bg-gradient-to-br from-[#0c1f38] via-[#132c4d] to-[#1c3e66] dark:from-[#080e1e] dark:via-[#0c1830] dark:to-[#122448] border-b border-teal-500/20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal-500 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 left-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 mb-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 hover:border-teal-400/50 shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              All Services
            </Link>
            <div className="flex items-start gap-4">
              {service.icon && (
                <div className="w-13 h-13 rounded-2xl bg-white/10 dark:bg-white/10 border border-white/20 shadow-md flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                  <span className="text-2xl">{service.icon}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-1.5 tracking-tight">
                  {service.title}
                </h1>
                {service.tagline && (
                  <p className="text-base md:text-lg font-semibold mb-1.5 bg-gradient-to-r from-teal-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                    {service.tagline}
                  </p>
                )}
                <p className="text-sm md:text-base text-slate-200/90 max-w-none leading-relaxed">
                  {service.description || service.shortDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        {order.map((type) => {
          if (type === 'cta') {
            return (
              <div key={type}>
                {params.slug === 'vendor-management' && (
                  <section className="py-6 md:py-8 bg-white dark:bg-[#0b1329] transition-colors border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <VendorManagementProcessFlow />
                    </div>
                  </section>
                )}
                {params.slug === 'order-to-cash' && (
                  <section className="py-6 md:py-8 bg-white dark:bg-[#0b1329] transition-colors border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <O2CProcessFlow />
                    </div>
                  </section>
                )}
                {regions[type]}
              </div>
            );
          }
          if (!regions[type]) return null;
          return <div key={type}>{regions[type]}</div>;
        })}

        {!order.includes('cta') && (
          <>
            {params.slug === 'vendor-management' && (
              <section className="py-6 md:py-8 bg-white dark:bg-[#0b1329] transition-colors border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <VendorManagementProcessFlow />
                </div>
              </section>
            )}
            {params.slug === 'order-to-cash' && (
              <section className="py-6 md:py-8 bg-white dark:bg-[#0b1329] transition-colors border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <O2CProcessFlow />
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
