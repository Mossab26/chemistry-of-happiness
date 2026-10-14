import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { RobotMascot, RobotState } from './components/RobotMascot';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ActivitiesExplorer } from './components/ActivitiesExplorer';
import { WorkshopsView } from './components/WorkshopsView';
import { ArchiveTimeline } from './components/ArchiveTimeline';
import { AboutClub } from './components/AboutClub';
import { ContactView } from './components/ContactView';
import { AdminDashboard } from './components/AdminDashboard';
import { ClubLogo } from './components/ClubLogo';
import { ACTIVITIES_REGISTRY, ActivityRecord } from './data/clubData';
import { Sparkles, Trophy, Cpu, Users, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [activitiesList, setActivitiesList] = useState<ActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('chemistry_happiness_custom_activities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return ACTIVITIES_REGISTRY;
  });

  // Sync activities from server if available (e.g. Full-stack mode)
  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.activities) && data.activities.length > 0) {
          setActivitiesList(data.activities);
        }
      })
      .catch(() => {
        // Static GitHub Pages mode - silently use local state
      });
  }, []);

  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const handleAskAbout = (query: string) => {
    setActiveTab('home');
    setTimeout(() => {
      const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputEl) {
        inputEl.value = `احكيلي على ${query}`;
        inputEl.focus();
      }
    }, 100);
  };

  const handleUpdateActivity = (id: number, updates: Partial<ActivityRecord>) => {
    setActivitiesList(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      try {
        localStorage.setItem('chemistry_happiness_custom_activities', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    fetch(`/api/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authKey: 'happiness2026', updates })
    }).catch(() => {
      // Offline / GitHub Pages
    });
  };

  const handleAddActivity = (newAct: Partial<ActivityRecord>) => {
    const nextId = Math.max(...activitiesList.map(a => a.id), 0) + 1;
    const fullNewRecord: ActivityRecord = {
      id: nextId,
      rawTitle: newAct.rawTitle || newAct.displayTitle || 'نشاط جديد',
      displayTitle: newAct.displayTitle || 'نشاط جديد',
      aliases: newAct.aliases || [],
      year: newAct.year || 2026,
      date: newAct.date || 'غير موثق',
      location: newAct.location || 'جامعة سطيف 1',
      category: newAct.category || 'ثقافة ومناسبات',
      fullDescription: newAct.fullDescription || '',
      shortSummary: newAct.shortSummary || '',
      objectives: newAct.objectives || [],
      supervisorsAndPresenters: newAct.supervisorsAndPresenters || [],
      outcomes: newAct.outcomes || '',
      sourceArchive: newAct.sourceArchive || 'إدخال إداري',
      pdfPages: newAct.pdfPages || 'لوحة الإدارة',
      verificationStatus: 'قيد مراجعة الإدارة',
      isWorkshop: Boolean(newAct.isWorkshop)
    };

    setActivitiesList(prev => {
      const updated = [...prev, fullNewRecord];
      try {
        localStorage.setItem('chemistry_happiness_custom_activities', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authKey: 'happiness2026', activity: fullNewRecord })
    }).catch(() => {
      // Offline / GitHub Pages
    });
  };

  return (
    <div className="min-h-screen bg-[#120b08] text-[#f7f2ea] flex flex-col selection:bg-[#c5a059] selection:text-[#120b08]">
      {/* Main Luxury Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        totalActivitiesCount={activitiesList.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* TAB A: HOME (الرئيسية مع رفيق السعادة والهوية الفاخرة) */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fadeIn">
            {/* Minimal Luxury Academic Hero Section */}
            <div className="relative rounded-3xl p-6 sm:p-12 luxury-card border border-[#c5a059]/35 overflow-hidden">
              {/* Subtle Warm Amber / Gold Illumination */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#96783c]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Right Column: Emblem, Titles & Club Identity */}
                <div className="lg:col-span-5 space-y-5 text-center lg:text-right">
                  {/* Official Club Logo Header */}
                  <div className="flex items-center justify-center lg:justify-start">
                    <ClubLogo size="lg" variant="gold" withArabic={false} />
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] text-xs font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#e5c158]" />
                    <span>نادي علمي ثقافي • جامعة فرحات عباس سطيف 1</span>
                  </div>

                  <h1 className="font-amiri text-3xl sm:text-5xl md:text-6xl font-bold text-[#f7f2ea] tracking-tight leading-tight">
                    نادي كيمياء السعادة
                  </h1>

                  <p className="font-cinzel text-xs sm:text-sm text-[#c5a059] tracking-widest font-semibold uppercase">
                    The Chemistry Of Happiness • Established 2024
                  </p>

                  <p className="font-arabic-body text-sm sm:text-base text-[#d8c8b4] leading-relaxed max-w-xl mx-auto lg:mx-0">
                    أهلاً بك في البوابة الأكاديمية الرسمية. استكشف تاريخ وأنشطة النادي، وتحدّث مع «رفيق السعادة» — رفيقك الجامعي الودود والذكي للإجابة عن كل استفساراتك حول النادي.
                  </p>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <button
                      onClick={() => setActiveTab('activities')}
                      className="px-5 py-3 bg-gradient-to-r from-[#b8934a] to-[#c5a059] hover:from-[#c5a059] hover:to-[#e5c158] text-[#140d09] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#c5a059]/20 flex items-center gap-2"
                    >
                      <span>استكشف الأنشطة الـ 49</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTab('about')}
                      className="px-5 py-3 bg-[#241710] hover:bg-[#322016] text-[#e5c158] rounded-xl text-xs font-bold border border-[#c5a059]/40 transition-all"
                    >
                      <span>فلسفة التسمية والرسالة</span>
                    </button>
                  </div>

                  {/* Official Motto in Classical Typography */}
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#1c120c] border border-[#c5a059]/30">
                      <span className="text-xs text-[#9c8974]">الشعار الرسمي:</span>
                      <strong className="font-cinzel text-xs sm:text-sm text-[#e5c158] tracking-wider">
                        Never Ever Settle
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Left Column: 3D Animated Companion Robot */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
                  <div className="relative">
                    <RobotMascot
                      state={robotState}
                      isMuted={isMuted}
                      onInteract={() => {
                        setRobotState('happy');
                        setTimeout(() => setRobotState('idle'), 2500);
                      }}
                    />
                  </div>
                  <p className="font-arabic-body text-[11px] text-[#9c8974] mt-1 select-none text-center">
                    مساعدك الذكي «رفيق السعادة» • انقر على الروبوت للتفاعل معه
                  </p>
                </div>
              </div>
            </div>

            {/* Conversation Window Section */}
            <div className="h-[620px] max-w-5xl mx-auto">
              <VoiceAssistant
                onRobotStateChange={setRobotState}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
              />
            </div>

            {/* Metrics Row in Minimal Luxury Style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <div
                onClick={() => setActiveTab('activities')}
                className="p-5 rounded-2xl luxury-card hover:luxury-card-highlight cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#2a1c13] border border-[#c5a059]/40 text-[#e5c158] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-cinzel text-2xl font-bold text-[#f7f2ea]">{activitiesList.length}</span>
                  <span className="text-xs text-[#9c8974] block font-semibold">نشاطاً مسجلاً</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('workshops')}
                className="p-5 rounded-2xl luxury-card hover:luxury-card-highlight cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#2a1c13] border border-[#c5a059]/40 text-[#e5c158] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-cinzel text-2xl font-bold text-[#f7f2ea]">
                    {activitiesList.filter(a => a.isWorkshop).length}
                  </span>
                  <span className="text-xs text-[#9c8974] block font-semibold">ورشة تكوينية</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('archive')}
                className="p-5 rounded-2xl luxury-card hover:luxury-card-highlight cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#2a1c13] border border-[#c5a059]/40 text-[#e5c158] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-cinzel text-2xl font-bold text-[#f7f2ea]">3</span>
                  <span className="text-xs text-[#9c8974] block font-semibold">سنوات توثيق (172 صفحة)</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('about')}
                className="p-5 rounded-2xl luxury-card hover:luxury-card-highlight cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#2a1c13] border border-[#c5a059]/40 text-[#e5c158] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-amiri text-sm font-bold text-[#e5c158]">أنشط نادٍ</span>
                  <span className="text-xs text-[#9c8974] block font-semibold">جامعة سطيف 1 (2026)</span>
                </div>
              </div>
            </div>

            {/* Milestones Preview with Thin Gold Borders */}
            <div className="luxury-card rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#c5a059]/20">
                <h3 className="font-amiri text-xl font-bold text-[#f7f2ea] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                  <span>محطات مضيئة من التاريخ الأكاديمي للنادي</span>
                </h3>
                <span className="font-cinzel text-xs text-[#c5a059]">HISTORICAL HIGHLIGHTS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => handleAskAbout('نشاط أرواح تسوثني')}
                  className="p-4 rounded-2xl bg-[#170e0a]/80 border border-[#c5a059]/25 hover:border-[#c5a059]/60 cursor-pointer transition-all"
                >
                  <span className="font-cinzel text-xs text-[#c5a059] font-bold">30 APRIL 2024</span>
                  <h4 className="font-amiri font-bold text-[#f7f2ea] text-base mt-1">نشاط أرواح تسوثني</h4>
                  <p className="text-xs text-[#d8c8b4] mt-1 line-clamp-2">
                    أول نشاط للنادي لكسر حاجز الخوف في تقديم المذكرات بمحاضرة ملهمة للأستاذ عاطف.
                  </p>
                </div>

                <div
                  onClick={() => handleAskAbout('المسابقة الوطنية للنوادي العلمية بتبسة')}
                  className="p-4 rounded-2xl bg-[#170e0a]/80 border border-[#c5a059]/25 hover:border-[#c5a059]/60 cursor-pointer transition-all"
                >
                  <span className="font-cinzel text-xs text-[#e5c158] font-bold">APRIL 2026</span>
                  <h4 className="font-amiri font-bold text-[#f7f2ea] text-base mt-1">مشروع الروبوت المكتبي الذكي</h4>
                  <p className="text-xs text-[#d8c8b4] mt-1 line-clamp-2">
                    المشاركة في المسابقة الوطنية للنوادي العلمية بتبسة والتتويج بين أفضل النوادي الفائزة.
                  </p>
                </div>

                <div
                  onClick={() => handleAskAbout('نشاط يوم الطالب والتتويج بأنشط نادي')}
                  className="p-4 rounded-2xl bg-[#170e0a]/80 border border-[#c5a059]/25 hover:border-[#c5a059]/60 cursor-pointer transition-all"
                >
                  <span className="font-cinzel text-xs text-[#c5a059] font-bold">19 MAY 2026</span>
                  <h4 className="font-amiri font-bold text-[#f7f2ea] text-base mt-1">التتويج بلقب أنشط نادٍ</h4>
                  <p className="text-xs text-[#d8c8b4] mt-1 line-clamp-2">
                    حصد لقب أنشط نادٍ بجامعة فرحات عباس سطيف 1 بحضور الوالي وإدارة الجامعة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: ABOUT */}
        {activeTab === 'about' && <AboutClub />}

        {/* TAB C: ACTIVITIES REGISTRY */}
        {activeTab === 'activities' && (
          <ActivitiesExplorer
            activities={activitiesList}
            onAskAboutActivity={handleAskAbout}
          />
        )}

        {/* TAB D: WORKSHOPS */}
        {activeTab === 'workshops' && (
          <WorkshopsView onAskAboutWorkshop={handleAskAbout} />
        )}

        {/* TAB E: ARCHIVE */}
        {activeTab === 'archive' && (
          <ArchiveTimeline
            activities={activitiesList}
            onSelectActivity={(act) => handleAskAbout(act.displayTitle)}
          />
        )}

        {/* TAB F: CONTACT */}
        {activeTab === 'contact' && <ContactView />}

        {/* TAB G: ADMIN */}
        {activeTab === 'admin' && (
          <AdminDashboard
            activities={activitiesList}
            onUpdateActivity={handleUpdateActivity}
            onAddActivity={handleAddActivity}
          />
        )}
      </main>

      {/* Luxury Footer with Official Logo */}
      <footer className="mt-20 border-t border-[#c5a059]/25 bg-[#140d09]/95 py-10 text-xs text-[#9c8974]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ClubLogo size="sm" variant="gold" />
            <div className="flex flex-col text-right">
              <span className="font-amiri font-bold text-sm text-[#f7f2ea]">نادي كيمياء السعادة</span>
              <span className="text-[11px] text-[#9c8974]">جامعة فرحات عباس سطيف 1، الجزائر</span>
            </div>
          </div>

          <div className="text-center font-cinzel text-xs text-[#c5a059] tracking-widest font-semibold">
            NEVER EVER SETTLE
          </div>

          <div className="flex items-center gap-4 text-[#d8c8b4]">
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-[#e5c158] transition-colors"
            >
              دخول الإدارة
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('contact')}
              className="hover:text-[#e5c158] transition-colors"
            >
              بيانات التواصل
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
