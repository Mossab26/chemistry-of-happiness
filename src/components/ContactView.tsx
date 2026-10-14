import React, { useState } from 'react';
import { Mail, Instagram, Facebook, MapPin, Copy, Check, Send, Sparkles, MessageSquare } from 'lucide-react';
import { OFFICIAL_CLUB_PROFILE } from '../data/clubData';
import { ClubLogo } from './ClubLogo';

export const ContactView: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setFormSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 py-6">
        <div className="flex justify-center mb-3">
          <ClubLogo size="lg" variant="gold" />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] text-xs font-bold">
          <Sparkles className="w-4 h-4 text-[#e5c158]" />
          <span>القنوات الرسمية المعتمدة</span>
        </div>
        <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-white">تواصل مع نادي كيمياء السعادة</h1>
        <p className="font-arabic-body text-sm sm:text-base text-[#d8c8b4] max-w-xl mx-auto leading-relaxed">
          يسرنا تواصلكم واستفساراتكم حول الأنشطة، الورشات القادمة، أو الانضمام إلى عائلة النادي.
        </p>
      </div>

      {/* Official Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Email */}
        <div className="luxury-card rounded-2xl p-6 shadow-xl flex flex-col justify-between group transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-amiri font-bold text-white text-lg">البريد الإلكتروني</h3>
            <p className="text-xs text-[#9c8974] mt-1">للمراسلات الرسمية والأكاديمية</p>
            <p className="mt-3 text-xs font-mono text-[#e5c158] break-all select-all">
              {OFFICIAL_CLUB_PROFILE.contact.email}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c5a059]/20 flex items-center gap-2">
            <a
              href={`mailto:${OFFICIAL_CLUB_PROFILE.contact.email}`}
              className="flex-1 text-center py-2.5 bg-gradient-to-r from-[#b8934a] to-[#c5a059] hover:from-[#c5a059] hover:to-[#e5c158] text-[#140d09] rounded-xl text-xs font-bold transition-all shadow-md shadow-[#c5a059]/20"
            >
              إرسال بريد
            </a>
            <button
              onClick={() => handleCopy('email', OFFICIAL_CLUB_PROFILE.contact.email)}
              className="p-2 bg-[#231710] hover:bg-[#2c1d14] text-[#d8c8b4] rounded-xl transition-all border border-[#c5a059]/30"
              title="نسخ البريد"
            >
              {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Instagram */}
        <div className="luxury-card rounded-2xl p-6 shadow-xl flex flex-col justify-between group transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] flex items-center justify-center mb-4">
              <Instagram className="w-6 h-6" />
            </div>
            <h3 className="font-amiri font-bold text-white text-lg">إنستغرام</h3>
            <p className="text-xs text-[#9c8974] mt-1">تغطيات مصورة وفيديوهات الأنشطة</p>
            <p className="mt-3 text-xs font-mono text-[#e5c158] break-all select-all">
              @{OFFICIAL_CLUB_PROFILE.contact.instagram}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c5a059]/20 flex items-center gap-2">
            <a
              href={`https://instagram.com/${OFFICIAL_CLUB_PROFILE.contact.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 bg-[#261911] hover:bg-[#34241b] text-[#e5c158] border border-[#c5a059]/40 rounded-xl text-xs font-bold transition-all"
            >
              زيارة الحساب
            </a>
            <button
              onClick={() => handleCopy('insta', OFFICIAL_CLUB_PROFILE.contact.instagram)}
              className="p-2 bg-[#231710] hover:bg-[#2c1d14] text-[#d8c8b4] rounded-xl transition-all border border-[#c5a059]/30"
              title="نسخ المعرّف"
            >
              {copiedField === 'insta' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Facebook */}
        <div className="luxury-card rounded-2xl p-6 shadow-xl flex flex-col justify-between group transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] flex items-center justify-center mb-4">
              <Facebook className="w-6 h-6" />
            </div>
            <h3 className="font-amiri font-bold text-white text-lg">صفحة فيسبوك</h3>
            <p className="text-xs text-[#9c8974] mt-1">الدروس، الملخصات والإعلانات</p>
            <p className="mt-3 text-xs font-semibold text-[#f7f2ea] select-all">
              {OFFICIAL_CLUB_PROFILE.contact.facebook}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c5a059]/20 flex items-center gap-2">
            <button
              onClick={() => handleCopy('fb', OFFICIAL_CLUB_PROFILE.contact.facebook)}
              className="w-full py-2.5 bg-[#261911] hover:bg-[#34241b] text-[#e5c158] border border-[#c5a059]/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {copiedField === 'fb' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedField === 'fb' ? 'تم نسخ اسم الصفحة' : 'نسخ اسم الصفحة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campus Location Card & Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="luxury-card rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 text-[#e5c158] font-bold mb-3">
              <MapPin className="w-5 h-5" />
              <span className="font-amiri text-base">المقر الأكاديمي</span>
            </div>
            <h3 className="font-amiri text-xl font-bold text-white">جامعة فرحات عباس سطيف 1</h3>
            <p className="font-arabic-body text-xs sm:text-sm text-[#d8c8b4] mt-2 leading-relaxed">
              ولاية سطيف، الجزائر.<br />
              مجمع العلوم والتقنية (الباز) وكليات الهندسة.<br />
              النادي ينشط داخل الكليات، المدرجات، والساحات الجامعية بالتنسيق مع مصلحة النشاطات العلمية والثقافية.
            </p>
          </div>

          <div className="p-4 bg-[#140d09] border border-[#c5a059]/25 rounded-2xl text-xs text-[#9c8974]">
            <span className="font-bold text-[#c5a059] block mb-1">الشعار الأكاديمي:</span>
            <span className="font-cinzel text-[#e5c158] font-semibold">Never Ever Settle</span>
          </div>
        </div>

        {/* Message Form */}
        <div className="luxury-card rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2.5 text-white font-bold mb-4">
            <MessageSquare className="w-5 h-5 text-[#e5c158]" />
            <span className="font-amiri text-lg">رسالة مباشرة إلى إدارة النادي</span>
          </div>

          {formSubmitted ? (
            <div className="p-6 bg-[#261911] border border-[#c5a059]/50 rounded-2xl text-center space-y-2 animate-fadeIn">
              <div className="w-10 h-10 bg-[#e5c158]/20 text-[#e5c158] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#e5c158] text-sm">تم إرسال رسالتك بنجاح!</h4>
              <p className="text-xs text-[#d8c8b4]">سيتواصل معك مسؤولو نادي كيمياء السعادة قريباً.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#c5a059] block mb-1">الاسم واللقب</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="محمد سطيفي"
                  className="w-full bg-[#140d09] border border-[#c5a059]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#f7f2ea] placeholder-[#8c7762] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#c5a059] block mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@univ-setif.dz"
                  className="w-full bg-[#140d09] border border-[#c5a059]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#f7f2ea] placeholder-[#8c7762] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#c5a059] block mb-1">نص الرسالة أو الاستفسار</label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="أود الاستفسار حول الانضمام للورشة القادمة..."
                  className="w-full bg-[#140d09] border border-[#c5a059]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#f7f2ea] placeholder-[#8c7762] focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#b8934a] to-[#c5a059] hover:from-[#c5a059] hover:to-[#e5c158] text-[#140d09] rounded-xl text-xs font-bold transition-all shadow-md shadow-[#c5a059]/20 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 rotate-180" />
                <span>إرسال الرسالة</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
