'use client';

import { useState } from 'react';
import Navbar from '@/components/frontend/Navbar';
import Footer from '@/components/frontend/Footer';
import siteSettings from '@/data/settings.json';

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      <Navbar settings={siteSettings} />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-teal-600/10 dark:bg-teal-400/20 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            About Us
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-navy dark:text-slate-50 mb-4">
            About <span className="gradient-text">ATILA</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Intelligent Procurement for Modern Enterprises — Built by Aatral Technologies
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-white dark:bg-[#0f172a] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: About + Contact Info + Map */}
            <div className="space-y-8">
              {/* About Text */}
              <div>
                <h2 className="text-2xl font-bold text-navy dark:text-slate-50 mb-4">Who We Are</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  ATILA is a comprehensive procurement platform designed to streamline enterprise purchasing workflows.
                  Built by Aatral Technologies, ATILA reflects real-world enterprise procurement challenges and best practices
                  delivered through a modern, secure SaaS platform.
                </p>
              </div>

              {/* Contact Info Cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-navy dark:text-slate-50">Get In Touch</h3>

                {/* Address */}
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 transition-colors duration-500">
                  <div className="w-12 h-12 bg-teal-600/10 dark:bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy dark:text-slate-200 mb-1">Address</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {siteSettings.address}
                    </p>
                  </div>
                </div>

                {/* Call Us */}
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 transition-colors duration-500">
                  <div className="w-12 h-12 bg-teal-600/10 dark:bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy dark:text-slate-200 mb-1">Call Us</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{siteSettings.phone}</p>
                  </div>
                </div>

                {/* Email Us */}
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 transition-colors duration-500">
                  <div className="w-12 h-12 bg-teal-600/10 dark:bg-teal-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy dark:text-slate-200 mb-1">Email Us</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{siteSettings.email}</p>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="rounded-xl overflow-hidden shadow-card border border-slate-200 dark:border-slate-700 transition-colors duration-500">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.596168904294!2d77.6345!3d12.9116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1497c1e6c96d%3A0x502a35af3de9c70!2sHSR+Layout%2C+Bengaluru%2C+Karnataka!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                ></iframe>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors duration-500">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-navy dark:text-slate-200">Aatral Technologies India Pvt. Ltd.</span><br />
                    225, 1st floor, 13th Cross, 17th B Main Rd, 4th Sector, HSR Layout, Bengaluru, Karnataka
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-8 border border-slate-200 dark:border-slate-700 transition-colors duration-500">
                <h3 className="text-xl font-bold text-navy dark:text-slate-50 mb-6">Send Us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Your Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Your Email</label>
                      <input
                        type="email"
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Message</label>
                    <textarea
                      placeholder="Tell us about your procurement needs..."
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white font-semibold px-8 py-3.5 rounded-lg transition-all"
                  >
                    {submitted ? '✓ Message Sent!' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={siteSettings} />
    </div>
  );
}
