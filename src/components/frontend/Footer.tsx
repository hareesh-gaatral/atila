'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import footerContent from '@/data/json/footer.json';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGlobalContent, mergeGlobalContent } from '@/store/slices/contentSlice';

interface FooterProps {
  settings: Record<string, string>;
}

export default function Footer({ settings }: FooterProps) {
  const dispatch = useAppDispatch();
  const { globalFooter, globalLoaded, globalLoading } = useAppSelector((state) => state.content);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchGlobalContent());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  // DB content merged over footer.json default (admin-editable footer).
  const content = mergeGlobalContent(globalFooter, footerContent);

  const currentYear = new Date().getFullYear();
  const contact = {
    ...content.contact,
    email: settings?.email || content.contact.email,
    phone: settings?.phone || content.contact.phone,
    address: settings?.address || content.contact.address,
  };

  return (
    <footer className="bg-[#0a1929] dark:bg-[#020617] text-white transition-colors duration-500 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Logo + Description */}
          <div className="md:col-span-2">
            <div className="mb-3">
              <img src={content.logo} alt={content.logoAlt} className="h-8 w-auto" />
            </div>
            <p className="text-slate-300 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
              {content.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">{content.quickLinksTitle}</h4>
            <ul className="space-y-1.5">
              {content.quickLinks.map((link: { href: string; label: string }) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-slate-300 hover:text-teal-400 dark:text-slate-400 dark:hover:text-teal-400 transition text-xs">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">{content.contactTitle}</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2 text-slate-300 dark:text-slate-400">
                <svg className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {contact.email}
              </li>
              <li className="flex items-center gap-2 text-slate-300 dark:text-slate-400">
                <svg className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {contact.phone}
              </li>
              <li className="flex items-start gap-2 text-slate-300 dark:text-slate-400">
                <svg className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {contact.address}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 dark:text-slate-500">
            <p>{content.bottom.copyrightPrefix} {currentYear} {content.bottom.copyrightText}</p>
            <div className="flex gap-6 mt-2 md:mt-0">
              <a href={content.bottom.privacyHref} className="hover:text-teal-400 transition">{content.bottom.privacyLabel}</a>
              <a href={content.bottom.termsHref} className="hover:text-teal-400 transition">{content.bottom.termsLabel}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
