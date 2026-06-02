import React, { useState } from 'react';
import { ShieldCheck, Mail, MapPin, Users, Award, Briefcase, Heart, Send, CheckCircle2, Globe, ArrowLeft, MessageSquare, Phone, Info } from 'lucide-react';

interface CompanyPagesProps {
  view: 'about' | 'privacy' | 'contact';
  onNavigate: (path: string) => void;
}

export default function CompanyPages({ view, onNavigate }: CompanyPagesProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API contact request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-8 group cursor-pointer focus:outline-hidden"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Creative Station
      </button>

      {view === 'about' && (
        <div id="about-us-page" className="space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
              Our Journey
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              About Custom DB QR Generator
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              We started with a simple belief: QR codes don't have to be boring black-and-white grids. They can be dynamic, artistic extensions of your visual and corporate brand identity.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="block text-3xl font-black text-indigo-600">14K+</span>
              <span className="block text-xs font-extrabold text-slate-800 tracking-wide uppercase font-mono">Monthly Campaigns</span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Businesses trust us to build high-performance vector schemas monthly.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="block text-3xl font-black text-indigo-600">99.9%</span>
              <span className="block text-xs font-extrabold text-slate-800 tracking-wide uppercase font-mono">Scan Accuracy</span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Robust Reed-Solomon error correction keeps high scan-rates on all devices.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="block text-3xl font-black text-indigo-600">100%</span>
              <span className="block text-xs font-extrabold text-slate-800 tracking-wide uppercase font-mono">Local Encryption</span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Your credentials are kept safely encrypted and never leave your sandbox.
              </p>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900">Our Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-950">Pristine Aesthetic Layouts</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We select beautiful custom color gradients, sleek eye frames, and tailored dots for ultimate branding value.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-950">Developer-First Mentality</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Designed to easily fit modern full-stack workflows with local decoupled sandboxes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-950">Uncompromising Integrity</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Our platform executes local operations immediately and securely with transparent cookie and data handling.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-950">End-User Experience</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We guarantee friction-free scanning triggers on iOS, Android, and other hardware readers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl space-y-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Our Operations</span>
            <h3 className="text-lg font-extrabold">Powered by iSolutions ICo</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Custom DB QR Generator is designed and developed by **iSolutions ICo**. We specialize in high-availability web tools, responsive UX designs, and robust systems aimed at making marketing technology accessible to everyone.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-indigo-400" /> isolutionsico.com</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-indigo-400" /> admin@isolutionsico.com</span>
            </div>
          </div>
        </div>
      )}

      {view === 'privacy' && (
        <div id="privacy-policy-page" className="space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
              Compliance & Security
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Last Updated: June 2, 2026
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                1. Data Encryption and Local Storage
              </h2>
              <p>
                All QR parameters, designs, and user compositions are fully encrypted in your local sandbox. Some static selections utilize <code>localStorage</code> to maintain preferences. No custom branding designs or configurations are stored permanently on arbitrary networks without explicit action.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                2. Real-Time Scan Analytics
              </h2>
              <p>
                For dynamic tracked campaigns, our databases securely log scans (including system user-agents, metadata, timestamp records, etc.) purely to compile performance charts in the <strong>Scan Analytics</strong> section. These metrics do not gather absolute personal identification.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                3. Third-Party Service Integrations
              </h2>
              <p>
                This platform includes options to redirect parameters to platforms like WhatsApp, Email clients, WiFi modules, or social profiles. These third parties implement their own custom guidelines and security configurations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                4. Reach Out For Inquiries
              </h2>
              <p>
                If you have questions, inquiries, or would like to request file/data deletion, reach out instantly to our compliance contact at <span className="font-semibold text-indigo-600">admin@isolutionsico.com</span>.
              </p>
            </section>
          </div>
        </div>
      )}

      {view === 'contact' && (
        <div id="contact-us-page" className="space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest inline-block">
              Get In Touch
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Contact Us
            </h1>
            <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
              Have a question about our QR tools, dynamic links, or custom templates? Reach out to us, and we will get back to you immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Contact Details Info Panel */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Our Details</h2>
                
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Feedback & Inquiry</span>
                    <a href="mailto:admin@isolutionsico.com" className="text-xs font-semibold text-slate-800 hover:text-indigo-650 transition-colors">
                      admin@isolutionsico.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Corporate Division</span>
                    <span className="text-xs font-semibold text-slate-800">
                      iSolutions ICo
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Location Node</span>
                    <span className="text-xs font-semibold text-slate-800 leading-normal block">
                      Global Tech Hub, Digital Solutions Area
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Banner Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-400 font-mono tracking-wide uppercase">Encrypted Inboxes</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We review incoming inquiries within 24 business hours. All submissions are kept private and confidential in compliance with modern secure storage requirements.
                </p>
              </div>
            </div>

            {/* Interactive Contact Form Panel */}
            <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              {isSubmitted ? (
                <div id="contact-success-panel" className="text-center py-10 px-4 space-y-4 animate-scale-in">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-650 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">Message Submitted Successfully!</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Thank you for reaching out. A representative from **iSolutions ICo** will inspect your feedback and reply to your e-mail shortly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-2 py-2 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form id="contact-form-component" onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Send A Message</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="Inquiry or Partnership Topic"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Message Body</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Detail your requirements so our staff can provide precision guidance..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full text-xs py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-slate-900 hover:shadow-lg disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-100"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Sending Request...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
