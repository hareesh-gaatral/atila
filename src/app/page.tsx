import Navbar from '@/components/frontend/Navbar';
import HeroSection from '@/components/frontend/HeroSection';
import MarqueeSection from '@/components/frontend/MarqueeSection';
import ProcurementWheel from '@/components/frontend/ProcurementWheel';
import Footer from '@/components/frontend/Footer';
import TestimonialsSection from '@/components/frontend/TestimonialsSection';
import FAQSection from '@/components/frontend/FAQSection';
import HomeContentHydrator from '@/components/frontend/HomeContentHydrator';
import ScrollReveal from '@/components/frontend/ScrollReveal';
import dynamic from 'next/dynamic';
import { getHomeData, getMarquee, getProcurementWheel, getServices } from '@/lib/cache';

export const revalidate = 60;

const AboutSection = dynamic(() => import('@/components/frontend/AboutSection'));
const ServicesSection = dynamic(() => import('@/components/frontend/ServicesSection'));
const FeaturesSection = dynamic(() => import('@/components/frontend/FeaturesSection'));
const CTASection = dynamic(() => import('@/components/frontend/CTASection'));
const ContactSection = dynamic(() => import('@/components/frontend/ContactSection'));

function renderSection(
  section: any,
  settings: Record<string, string>,
  services?: any[]
) {
  const key = section._id || section.sectionType;
  switch (section.sectionType) {
    case 'hero': return <HeroSection key={key} data={section} />;
    case 'about': return <AboutSection key={key} data={section} />;
    case 'services': return <ServicesSection key={key} data={section} services={services} />;
    case 'features': return <FeaturesSection key={key} data={section} />;
    case 'testimonials': return <TestimonialsSection key={key} data={section} />;
    case 'faq': return <FAQSection key={key} data={section} />;
    case 'cta': return <CTASection key={key} data={section} />;
    case 'contact': return <ContactSection key={key} data={section} settings={settings} />;
    default: return null;
  }
}

export default async function HomePage() {
  const [home, publishedServices, marquee, wheel] = await Promise.all([
    getHomeData(),
    getServices(),
    getMarquee(),
    getProcurementWheel(),
  ]);
  const { sections, settings } = home;

  const sectionByType: Record<string, any> = {};
  sections.forEach((s: any) => {
    if (!sectionByType[s.sectionType]) sectionByType[s.sectionType] = s;
  });

  const render = (type: string) =>
    renderSection(sectionByType[type] || { sectionType: type }, settings, publishedServices);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080e1e] transition-colors duration-500">
      <HomeContentHydrator sections={sections} settings={settings} />
      <Navbar settings={settings} />
      <main>
        {render('hero')}
        {marquee && <MarqueeSection content={marquee} />}
        {wheel && (
          <ScrollReveal>
            <ProcurementWheel content={wheel} />
          </ScrollReveal>
        )}
        <ScrollReveal>{render('about')}</ScrollReveal>
        <ScrollReveal>{render('services')}</ScrollReveal>
        <ScrollReveal>{render('features')}</ScrollReveal>
        <ScrollReveal>{render('faq')}</ScrollReveal>
        <ScrollReveal variant="zoom">{render('cta')}</ScrollReveal>
        <ScrollReveal>{render('contact')}</ScrollReveal>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
