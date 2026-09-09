'use client';

import { useState } from 'react';
import contactContent from '@/data/json/contact.json';

interface ContactSectionProps {
  data?: {
    title?: string;
    subtitle?: string;
    content?: string;
    heading?: string;
    formHeading?: string;
    mapUrl?: string;
    infoCards?: Array<{ label?: string; type?: string }>;
    defaults?: { email?: string; phone?: string; address?: string };
    form?: Record<string, any>;
  };
  settings?: Record<string, string>;
}

export default function ContactSection({ data, settings }: ContactSectionProps) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string; phone?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults = { ...contactContent.defaults, ...data?.defaults };
  const email = settings?.email || defaults.email;
  const phone = settings?.phone || defaults.phone;
  const address = settings?.address || defaults.address;
  const infoCards = data?.infoCards?.length ? data.infoCards : contactContent.infoCards;
  const form = { ...contactContent.form, ...data?.form };
  const title = data?.title || contactContent.title;
  const subtitle = data?.subtitle || contactContent.subtitle;
  const content = data?.content || contactContent.content;
  const heading = data?.heading || contactContent.heading;
  const formHeading = data?.formHeading || contactContent.formHeading;
  const mapUrl = data?.mapUrl || contactContent.mapUrl;

  const iconFor = (type?: string) => {
    switch (type) {
      case 'address':
        return (
          <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to send message');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const validateField = (name: string, value: string) => {
    const errors: { [k: string]: string } = {};
    if (name === 'name' && !value.trim()) errors.name = 'Name is required';
    if (name === 'email') {
      if (!value.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) errors.email = 'Enter a valid email address';
    }
    if (name === 'message' && !value.trim()) errors.message = 'Message is required';
    if (name === 'phone' && value.trim()) {
      if (!/^\+?[\d\s\-\(\)]{7,20}$/.test(value.trim())) errors.phone = 'Enter a valid phone number';
    }
    return errors[name] || '';
  };

  const validateForm = () => {
    const errors: { [k: string]: string } = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email';
    if (!formData.message.trim()) errors.message = 'Message is required';
    if (formData.phone.trim() && !/^\+?[\d\s\-\(\)]{7,20}$/.test(formData.phone.trim())) errors.phone = 'Enter a valid phone number';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const valueFor = (type?: string) => {
    switch (type) {
      case 'address': return address;
      case 'phone': return phone;
      case 'email': return email;
      default: return '';
    }
  };

  const hrefFor = (type?: string) => {
    switch (type) {
      case 'phone': return `tel:${phone}`;
      case 'email': return `mailto:${email}`;
      default: return undefined;
    }
  };

  return (
    <section id="contact" className="py-12 bg-white dark:bg-[#0f172a] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {subtitle && (
            <p className="text-teal-600 dark:text-teal-400 text-sm font-semibold mb-2 uppercase tracking-wider">{subtitle}</p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-navy dark:text-slate-50">{title}</h2>
          {content && (
            <p className="text-slate-600 dark:text-slate-300 mt-4 max-w-xl mx-auto">{content}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-navy dark:text-slate-50">{heading}</h3>
            {infoCards.map((card, i) => {
              const href = hrefFor(card.type);
              return (
                <div key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card transition-colors">
                  <div className="w-12 h-12 bg-teal-600/10 dark:bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                    {iconFor(card.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy dark:text-slate-200 mb-1">{card.label}</h4>
                    {href ? (
                      <a href={href} className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed hover:text-teal-700 dark:hover:text-teal-400 transition">
                        {valueFor(card.type)}
                      </a>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{valueFor(card.type)}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Google Map */}
            <div className="rounded-xl overflow-hidden shadow-card border border-slate-200 dark:border-slate-700">
              <iframe
                src={mapUrl}
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-8 md:p-10 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-navy dark:text-slate-50 mb-6">{formHeading}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{form.name?.label}</label>
                  <input type="text" placeholder={form.name?.placeholder} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'}`} value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (validationErrors.name) setValidationErrors({ ...validationErrors, name: '' }); }} required />
                  {validationErrors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{form.email?.label}</label>
                  <input type="email" placeholder={form.email?.placeholder} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'}`} value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (validationErrors.email) setValidationErrors({ ...validationErrors, email: '' }); }} required />
                  {validationErrors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{form.phone?.label}</label>
                <input type="tel" placeholder={form.phone?.placeholder} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'}`} value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if (validationErrors.phone) setValidationErrors({ ...validationErrors, phone: '' }); }} />
                {validationErrors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{form.message?.label}</label>
                <textarea placeholder={form.message?.placeholder} rows={5} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none ${validationErrors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700'}`} value={formData.message} onChange={(e) => { setFormData({ ...formData, message: e.target.value }); if (validationErrors.message) setValidationErrors({ ...validationErrors, message: '' }); }} required />
                {validationErrors.message && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.message}</p>}
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-400 dark:hover:bg-teal-400 dark:disabled:bg-slate-700 dark:disabled:hover:bg-slate-700 text-white font-semibold px-8 py-4 rounded-lg transition-all"
              >
                {submitting ? 'Sending...' : submitted ? form.successText : form.submitText}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
