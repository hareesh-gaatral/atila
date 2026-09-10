import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import { getServices, getSettings } from '@/lib/cache';

export const metadata: Metadata = {
  title: 'Our Services | ATILA Procurement Platform',
  description:
    'Explore ATILA procurement solutions — Purchase Management, Vendor Management, O2C - Order to Cash Cycle, Spend Analytics, Approval Workflows and Compliance.',
};

// ISR so a service added from the admin panel appears here (and a revalidatePath
// after every admin save) without a developer rebuild.
export const revalidate = 60;

export default async function ServicesPage() {
  const settings = await getSettings();
  const services = await getServices();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <Navbar settings={settings} />
      <main>
        {/* Hero */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block bg-teal-600/10 dark:bg-teal-400/20 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              What We Offer
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy dark:text-slate-50 mb-4">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              End-to-end procurement solutions that streamline sourcing, purchasing, vendor
              management and compliance — built for modern enterprises.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-white dark:bg-[#0f172a] transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-card-hover transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-teal-600/10 dark:bg-teal-400/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-teal-500 dark:group-hover:bg-teal-400 transition">
                    <span className="text-2xl group-hover:text-white transition">{service.icon}</span>
                  </div>
                  <h2 className="text-xl font-bold text-navy dark:text-slate-50 mb-2">{service.title}</h2>
                  {service.tagline && (
                    <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-3">{service.tagline}</p>
                  )}
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-5">{service.description || service.shortDescription}</p>
                  <div className="inline-flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-sm group-hover:gap-3 transition-all">
                    View Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-navy to-[#1a3b5c]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Need a Custom Procurement Solution?</h2>
            <p className="text-xl text-white/80 mb-8">Talk to our experts and see how ATILA fits your workflows.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white font-semibold px-8 py-4 rounded-lg transition-all">
              Contact Us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
