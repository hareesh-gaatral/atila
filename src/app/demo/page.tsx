'use client';

import { useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import siteSettings from '@/data/settings.json';

export default function DemoPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string; company?: string; phone?: string; message?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    const errors: { [k: string]: string } = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email';
    if (!formData.company.trim()) errors.company = 'Company is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    if (formData.phone.trim() && !/^\+?[\d\s\-\(\)]{7,20}$/.test(formData.phone.trim())) errors.phone = 'Enter a valid phone number';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
        body: JSON.stringify({
          ...formData,
          message: `[Demo Request] ${formData.message}\nCompany: ${formData.company}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to send message');
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <Navbar settings={siteSettings} />
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block bg-teal-600/10 dark:bg-teal-400/20 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Schedule a Demo
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy dark:text-slate-50 mb-4">
              See ATILA in <span className="gradient-text">Action</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Book a personalised walkthrough and discover how ATILA can streamline your procurement,
              vendor and contract workflows.
            </p>
          </div>
        </section>

        {/* Demo Request Content */}
        <section id="demo" className="py-16 bg-white dark:bg-[#0f172a] transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: What you'll see + Contact Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-navy dark:text-slate-50 mb-4">
                    What You&apos;ll See in the Demo
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { title: 'Purchase Management', desc: 'Create POs, approvals and three-way matching in minutes.' },
                      { title: 'Vendor Management', desc: 'Onboard, validate and monitor vendors end-to-end.' },
                      { title: 'Contract Lifecycle', desc: 'Author, negotiate, approve and track contracts digitally.' },
                      { title: 'Spend Analytics', desc: 'Real-time dashboards that uncover savings opportunities.' },
                    ].map((item) => (
                      <li key={item.title} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-500">
                        <span className="w-10 h-10 bg-teal-600/10 dark:bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0 text-teal-700 dark:text-teal-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <div>
                          <h4 className="font-semibold text-teal-700 dark:text-teal-400">{item.title}</h4>
                          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick contact info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-navy dark:text-slate-50">Prefer to talk?</h3>
                  <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm">
                    <p className="flex items-center gap-3">
                      <span className="text-teal-600 dark:text-teal-400">✉</span>
                      <a href={`mailto:${siteSettings.email}`} className="hover:text-teal-700 dark:hover:text-teal-400 transition">{siteSettings.email}</a>
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-teal-600 dark:text-teal-400">✆</span>
                      <a href={`tel:${siteSettings.phone}`} className="hover:text-teal-700 dark:hover:text-teal-400 transition">+91 {siteSettings.phone.replace('91-', '')}</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Demo Request Form */}
              <div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-8 md:p-10 border border-slate-200 dark:border-slate-700 transition-colors duration-500">
                  <h3 className="text-xl font-bold text-navy dark:text-slate-50 mb-2">Request a Demo</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                    Fill in your details and our team will get back to you within one business day.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Full Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className={`${inputClass} ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          value={formData.name}
                          onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (validationErrors.name) setValidationErrors({ ...validationErrors, name: '' }); }}
                          required
                        />
                        {validationErrors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Work Email</label>
                        <input
                          type="email"
                          placeholder="john@company.com"
                          className={`${inputClass} ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          value={formData.email}
                          onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (validationErrors.email) setValidationErrors({ ...validationErrors, email: '' }); }}
                          required
                        />
                        {validationErrors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Company</label>
                        <input
                          type="text"
                          placeholder="Company Pvt. Ltd."
                          className={`${inputClass} ${validationErrors.company ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          value={formData.company}
                          onChange={(e) => { setFormData({ ...formData, company: e.target.value }); if (validationErrors.company) setValidationErrors({ ...validationErrors, company: '' }); }}
                          required
                        />
                        {validationErrors.company && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.company}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          className={`${inputClass} ${validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                          value={formData.phone}
                          onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if (validationErrors.phone) setValidationErrors({ ...validationErrors, phone: '' }); }}
                        />
                        {validationErrors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">What would you like to see?</label>
                      <textarea
                        placeholder="e.g. Vendor onboarding, purchase approvals, spend analytics..."
                        rows={5}
                        className={`${inputClass} resize-none ${validationErrors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                        value={formData.message}
                        onChange={(e) => { setFormData({ ...formData, message: e.target.value }); if (validationErrors.message) setValidationErrors({ ...validationErrors, message: '' }); }}
                      />
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
                      {submitting ? 'Sending...' : submitted ? '✓ Request Received!' : 'Schedule a Demo'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={siteSettings} />
    </div>
  );
}