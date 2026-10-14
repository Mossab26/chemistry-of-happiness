import React from 'react';
import { Sparkles, Compass, Target, BookOpen, Award, CheckCircle, Shield, Heart } from 'lucide-react';
import { OFFICIAL_CLUB_PROFILE } from '../data/clubData';
import { ClubLogo } from './ClubLogo';

export const AboutClub: React.FC = () => {
  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Luxury Academic Hero Header */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center mb-4">
          <ClubLogo size="xl" variant="gold" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] text-xs font-bold">
          <Sparkles className="w-4 h-4 text-[#e5c158]" />
          <span>الهوية والرسالة الأكاديمية</span>
        </div>

        <h1 className="font-amiri text-4xl sm:text-6xl font-bold text-[#f7f2ea] tracking-tight">
          نادي كيمياء السعادة
        </h1>
        <p className="font-cinzel text-base sm:text-lg text-[#c5a059] font-semibold tracking-wider">
          THE CHEMISTRY OF HAPPINESS CLUB
        </p>

        <p className="font-arabic-body text-sm sm:text-base text-[#d8c8b4] max-w-2xl mx-auto leading-relaxed">
          نادي علمي ثقافي بجامعة فرحات عباس سطيف 1، الجزائر. نجمع بين التحصيل الأكاديمي الرصين، المهارات التقنية الحديثة، والعمل الإنساني التشاركي بروح التميّز.
        </p>

        {/* Motto Banner in Minimal Luxury Serif */}
        <div className="pt-3">
          <div className="inline-block px-6 py-2.5 rounded-2xl bg-[#1e130d] border border-[#c5a059]/40 shadow-xl shadow-black/60">
            <span className="text-xs text-[#9c8974] ml-2">الشعار الأكاديمي:</span>
            <span className="font-cinzel text-sm sm:text-base text-[#e5c158] font-bold tracking-widest">
              NEVER EVER SETTLE
            </span>
          </div>
        </div>
      </div>

      {/* Profile Key Identity Cards in Luxury Dark Brown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="luxury-card rounded-2xl p-5 space-y-1.5 shadow-md">
          <span className="text-xs font-bold text-[#9c8974]">تاريخ التأسيس:</span>
          <p className="font-amiri text-lg font-bold text-white">{OFFICIAL_CLUB_PROFILE.foundationDate}</p>
          <span className="text-[11px] text-[#c5a059]">جامعة سطيف 1</span>
        </div>

        <div className="luxury-card rounded-2xl p-5 space-y-1.5 shadow-md">
          <span className="text-xs font-bold text-[#9c8974]">الأستاذ المشرف:</span>
          <p className="font-amiri text-lg font-bold text-white">{OFFICIAL_CLUB_PROFILE.supervisor.split('—')[0]}</p>
          <span className="text-[11px] text-[#c5a059]">تأطير بيداغوجي وعلمي مستمر</span>
        </div>

        <div className="luxury-card rounded-2xl p-5 space-y-1.5 shadow-md">
          <span className="text-xs font-bold text-[#9c8974]">رئيسة النادي:</span>
          <p className="font-amiri text-lg font-bold text-[#e5c158]">عقون سميرة (Samira Aggoun)</p>
          <span className="text-[11px] text-[#c5a059]">المكتب التنفيذي التأسيسي</span>
        </div>

        <div className="luxury-card rounded-2xl p-5 space-y-1.5 shadow-md">
          <span className="text-xs font-bold text-[#9c8974]">أبرز تتويج:</span>
          <p className="font-amiri text-lg font-bold text-white">أنشط نادٍ بالجامعة</p>
          <span className="text-[11px] text-[#e5c158]">يوم الطالب (19 ماي 2026)</span>
        </div>
      </div>

      {/* Official Executive Board Notice */}
      <div className="luxury-card rounded-3xl p-6 sm:p-7 shadow-xl space-y-3 border-r-4 border-r-[#c5a059]">
        <div className="flex items-center gap-2.5 text-[#e5c158] font-bold text-base">
          <CheckCircle className="w-5 h-5 shrink-0 text-[#e5c158]" />
          <span className="font-amiri text-lg">الهيئة التنفيذية التأسيسية المعتمدة رسمياً (أرشيف 2024 - ص 4):</span>
        </div>
        <p className="text-xs sm:text-sm text-[#d8c8b4] leading-relaxed">
          وفقاً لمحضر الاجتماع التأسيسي الرسمي المنعقد يوم 21 أبريل 2024 بحضور رئيس مصلحة النشاطات العلمية والثقافية وتحت إشراف الأستاذ المشرف ابن عيسى عاطف:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-[#170e0a] p-4 rounded-xl border border-[#c5a059]/30 text-xs space-y-1">
            <span className="font-bold text-[#c5a059] block">رئيس النادي:</span>
            <p className="text-white font-amiri font-bold text-base">عقون سميرة</p>
            <span className="font-cinzel text-[#9c8974] text-[11px]">Samira Aggoun</span>
          </div>
          <div className="bg-[#170e0a] p-4 rounded-xl border border-[#c5a059]/30 text-xs space-y-1">
            <span className="font-bold text-[#c5a059] block">نائب الرئيس:</span>
            <p className="text-white font-amiri font-bold text-base">خياط إيناس</p>
            <span className="font-cinzel text-[#9c8974] text-[11px]">Inas Khayat</span>
          </div>
          <div className="bg-[#170e0a] p-4 rounded-xl border border-[#c5a059]/30 text-xs space-y-1">
            <span className="font-bold text-[#c5a059] block">أمين المكتب:</span>
            <p className="text-white font-amiri font-bold text-base">عميرة آية</p>
            <span className="font-cinzel text-[#9c8974] text-[11px]">Aya Oumira</span>
          </div>
        </div>
      </div>

      {/* Who We Are */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#261911] border border-[#c5a059]/40 text-[#e5c158]">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="font-amiri text-2xl font-bold text-white">من نحن؟</h2>
        </div>
        <p className="font-arabic-body text-sm sm:text-base text-[#d8c8b4] leading-relaxed whitespace-pre-wrap">
          {OFFICIAL_CLUB_PROFILE.whoWeAreProofread}
        </p>
      </div>

      {/* Why The Chemistry of Happiness? */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 bg-gradient-to-br from-[#1c130e] via-[#241710] to-[#170e0a]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#261911] border border-[#c5a059]/40 text-[#e5c158]">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="font-amiri text-2xl font-bold text-white">لماذا اسم «كيمياء السعادة»؟</h2>
        </div>
        <div className="font-arabic-body text-sm sm:text-base text-[#d8c8b4] leading-relaxed space-y-3">
          <p>{OFFICIAL_CLUB_PROFILE.namePhilosophy}</p>
        </div>
      </div>

      {/* Objectives */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#261911] border border-[#c5a059]/40 text-[#e5c158]">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="font-amiri text-2xl font-bold text-white">أهداف النادي الأربعة الأساسية</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFICIAL_CLUB_PROFILE.objectives.map((obj, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#170e0a]/90 border border-[#c5a059]/25 flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-xl bg-[#2a1c13] border border-[#c5a059]/40 text-[#e5c158] flex items-center justify-center font-bold text-sm shrink-0">
                {idx + 1}
              </div>
              <p className="font-arabic-body text-xs sm:text-sm text-[#f7f2ea] leading-relaxed">
                {obj}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Documented Milestones */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#261911] border border-[#c5a059]/40 text-[#e5c158]">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="font-amiri text-2xl font-bold text-white">إنجازات ومحطات بارزة (2024 - 2026)</h2>
        </div>

        <div className="space-y-3">
          {OFFICIAL_CLUB_PROFILE.keyAchievements.map((ach, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#170e0a]/70 border border-[#c5a059]/20 flex items-center gap-3"
            >
              <CheckCircle className="w-4 h-4 text-[#e5c158] shrink-0" />
              <span className="font-arabic-body text-xs sm:text-sm text-[#d8c8b4] font-medium">{ach}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
