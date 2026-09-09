import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import DynamicSection from '@/components/frontend/DynamicSection';
import { notFound } from 'next/navigation';
import { getPageData } from '@/lib/cache';

export const revalidate = 60;

export default async function DynamicPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getPageData(params.slug);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <Navbar settings={{}} />
      <main>
        {data.sections.map((section: any) => (
          <DynamicSection key={section._id} data={section} />
        ))}
      </main>
      <Footer settings={{}} />
    </div>
  );
}
