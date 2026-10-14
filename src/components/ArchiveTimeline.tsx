import React, { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { ActivityRecord } from '../data/clubData';

interface ArchiveTimelineProps {
  activities: ActivityRecord[];
  onSelectActivity: (activity: ActivityRecord) => void;
}

export const ArchiveTimeline: React.FC<ArchiveTimelineProps> = ({
  activities,
  onSelectActivity
}) => {
  const [activeYearTab, setActiveYearTab] = useState<number>(2026);

  const yearsData = [
    {
      year: 2026,
      title: 'أرشيف عام 2026: سنة التتويج والتميز الوطني',
      description: 'شهد هذا العام التتويج بلقب «أنشط نادي بجامعة سطيف 1»، الفوز في المسابقة الوطنية بتبسة بمشروع الروبوت المكتبي الذكي، المشاركة في استقبال بابا الفاتيكان بالجزائر، وزيارة مصنع البطاريات ENPEC.',
      pagesRange: 'الصفحات 116 - 172 (57 صفحة)',
      badge: 'أنشط نادي بالجامعة'
    },
    {
      year: 2025,
      title: 'أرشيف عام 2025: الانطلاقة التكوينية الكبرى والميدانية',
      description: 'شهد تنظيم 23 نشاطاً متنوعاً منها ورشات الذكاء الاصطناعي والأردوينو والإلكترونيات والمونتاج، صندوق السعادة، حملة التشجير مع والي سطيف، وزيارة مكتب الدراسات CEERI.',
      pagesRange: 'الصفحات 36 - 115 (80 صفحة)',
      badge: '23 نشاطاً موثقاً'
    },
    {
      year: 2024,
      title: 'أرشيف عام 2024: التأسيس والانطلاقة المباركة',
      description: 'تأسيس النادي رسمياً في 21 أفريل 2024 برئاسة عقون سميرة، افتتاح المسيرة بأول نشاط «أرواح تسوثني»، حملة بيك وبيا 1، نشاط كن طالب بيوم أفوغادرو، وتكريم عمال الجامعة.',
      pagesRange: 'الصفحات 1 - 35 (35 صفحة)',
      badge: 'عام التأسيس'
    }
  ];

  const currentYearActivities = activities.filter(a => a.year === activeYearTab);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Overview Banner */}
      <div className="luxury-card rounded-3xl p-6 sm:p-10 border border-[#c5a059]/35 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] text-xs font-bold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>الأرشيف الوثائقي الثلاثي الكامل (172 صفحة)</span>
          </div>
          <h2 className="font-amiri text-2xl sm:text-4xl font-bold text-white">
            السجل التاريخي والكرونولوجي (2024 - 2026)
          </h2>
          <p className="font-arabic-body mt-2 text-sm sm:text-base text-[#d8c8b4] leading-relaxed">
            استكشف المسار الزمني والوثائقي لنادي كيمياء السعادة بجامعة فرحات عباس سطيف 1، مع الإحالة الدقيقة لصفحات تقارير الأنشطة السنوية والصور الميدانية.
          </p>
        </div>
      </div>

      {/* Year Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {yearsData.map((y) => {
          const count = activities.filter(a => a.year === y.year).length;
          const isSelected = activeYearTab === y.year;
          return (
            <button
              key={y.year}
              onClick={() => setActiveYearTab(y.year)}
              className={`p-6 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-[#2a1c13] to-[#1a110a] border-[#e5c158] shadow-xl shadow-black/80 ring-1 ring-[#e5c158]/50'
                  : 'bg-[#18100b]/80 border-[#c5a059]/20 hover:border-[#c5a059]/50 text-[#9c8974]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-cinzel text-3xl font-bold ${isSelected ? 'text-[#e5c158]' : 'text-slate-300'}`}>
                    {y.year}
                  </span>
                  <span className="font-cinzel text-xs bg-[#241710] text-[#c5a059] border border-[#c5a059]/30 px-3 py-1 rounded-full font-bold">
                    {count} ACTIVITIES
                  </span>
                </div>
                <h4 className={`font-amiri text-base font-bold ${isSelected ? 'text-[#f7f2ea]' : 'text-[#d8c8b4]'}`}>
                  {y.title.split(':')[0]}
                </h4>
                <p className="font-arabic-body text-xs text-[#9c8974] mt-1 line-clamp-2">
                  {y.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#c5a059]/20 flex items-center justify-between text-xs text-[#9c8974]">
                <span className="font-mono">{y.pagesRange}</span>
                <span className="text-[#c5a059] font-bold">{y.badge}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Activities Timeline for active year */}
      <div className="luxury-card rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#c5a059]/20">
          <div>
            <h3 className="font-amiri text-2xl font-bold text-white flex items-center gap-2">
              <span>أنشطة عام {activeYearTab} الموثقة</span>
              <span className="font-cinzel text-xs bg-[#261911] text-[#e5c158] border border-[#c5a059]/40 px-2.5 py-0.5 rounded-full font-bold">
                {currentYearActivities.length} ANNOTATED
              </span>
            </h3>
            <p className="font-arabic-body text-xs text-[#9c8974] mt-1">
              مرتبة حسب التوثيق الرسمي في دفتر أنشطة السنة الجامعية
            </p>
          </div>
        </div>

        {/* Chronological List */}
        <div className="space-y-4 relative before:absolute before:right-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#c5a059]/25">
          {currentYearActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => onSelectActivity(act)}
              className="relative pr-12 group cursor-pointer"
            >
              {/* Timeline Dot */}
              <div className="absolute right-4.5 top-5 w-3.5 h-3.5 rounded-full bg-[#18100b] border-2 border-[#c5a059] group-hover:bg-[#e5c158] group-hover:scale-125 transition-all shadow-sm shadow-[#c5a059]" />

              <div className="bg-[#140d09]/70 hover:bg-[#20140d] border border-[#c5a059]/20 hover:border-[#c5a059]/60 rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel text-xs font-bold text-[#e5c158]">#{act.id}</span>
                    <span className="text-xs text-[#9c8974] bg-[#231710] px-2 py-0.5 rounded-md font-semibold border border-[#c5a059]/20">
                      {act.date}
                    </span>
                    <span className="text-xs text-[#c5a059] bg-[#2a1c13] px-2 py-0.5 rounded-md font-semibold border border-[#c5a059]/30">
                      {act.category}
                    </span>
                    {act.highlightedBadge && (
                      <span className="text-xs text-[#e5c158] bg-[#2a1c13] border border-[#c5a059]/40 px-2 py-0.5 rounded-md font-bold">
                        {act.highlightedBadge}
                      </span>
                    )}
                  </div>

                  <h4 className="font-amiri font-bold text-lg text-white group-hover:text-[#e5c158] transition-colors">
                    {act.displayTitle}
                  </h4>

                  <p className="font-arabic-body text-xs text-[#d8c8b4] line-clamp-2">
                    {act.shortSummary || act.fullDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span className="text-xs text-[#c5a059] font-mono bg-[#231710] px-2.5 py-1 rounded-lg border border-[#c5a059]/30">
                    {act.pdfPages}
                  </span>
                  <button className="px-3.5 py-1.5 bg-[#231710] group-hover:bg-gradient-to-r group-hover:from-[#b8934a] group-hover:to-[#c5a059] group-hover:text-[#140d09] text-[#e5c158] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-[#c5a059]/30">
                    <span>عرض الأرشيف</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
