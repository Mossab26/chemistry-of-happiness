import React, { useState } from 'react';
import { Cpu, Terminal, Video, Presentation, Sparkles, Clock, MapPin, ChevronLeft } from 'lucide-react';
import { WORKSHOPS_LIST, ActivityRecord } from '../data/clubData';

interface WorkshopsViewProps {
  onAskAboutWorkshop?: (title: string) => void;
}

export const WorkshopsView: React.FC<WorkshopsViewProps> = ({ onAskAboutWorkshop }) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<ActivityRecord | null>(null);

  const workshopCategories = [
    {
      title: 'الذكاء الاصطناعي والتقنيات الحديثة',
      icon: <Cpu className="w-5 h-5 text-[#e5c158]" />,
      items: WORKSHOPS_LIST.filter(w => w.rawTitle.includes('AI') || w.displayTitle.includes('الذكاء الاصطناعي'))
    },
    {
      title: 'الإلكترونيات والتحكم والأردوينو',
      icon: <Terminal className="w-5 h-5 text-[#c5a059]" />,
      items: WORKSHOPS_LIST.filter(w => w.rawTitle.includes('اوردوينو') || w.rawTitle.includes('الإلكثرونيات') || w.rawTitle.includes('الإلكترونيات'))
    },
    {
      title: 'المونتاج والتصميم الرقمي',
      icon: <Video className="w-5 h-5 text-[#d8c8b4]" />,
      items: WORKSHOPS_LIST.filter(w => w.rawTitle.includes('المونتاج') || w.rawTitle.includes('الكانفا'))
    },
    {
      title: 'ريادة الأعمال والعروض والمهارات اللغوية',
      icon: <Presentation className="w-5 h-5 text-[#e5c158]" />,
      items: WORKSHOPS_LIST.filter(w => w.rawTitle.includes('PowerPoint') || w.rawTitle.includes('BMC') || w.rawTitle.includes('الإلقاء') || w.rawTitle.includes('mercia') || w.rawTitle.includes('Practical Knowledge'))
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 luxury-card border border-[#c5a059]/35 overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>التكوين الأكاديمي والتقني • 13 ورشة عمل موثقة</span>
          </div>
          <h2 className="font-amiri text-2xl sm:text-4xl font-bold text-white">
            الورشات والدورات التكوينية لنادي كيمياء السعادة
          </h2>
          <p className="font-arabic-body mt-2 text-sm sm:text-base text-[#d8c8b4] leading-relaxed">
            محطات تدريبية عملية وتطبيقية نقلت المعرفة إلى أرض الواقع في الذكاء الاصطناعي، المتحكمات الدقيقة، الإلكترونيات، المونتاج، وريادة الأعمال تحت إشراف نخبة من الأساتذة والطلبة المتميزين.
          </p>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="space-y-8">
        {workshopCategories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-[#c5a059]/25">
              <div className="p-2 rounded-xl bg-[#241710] border border-[#c5a059]/30">
                {cat.icon}
              </div>
              <h3 className="font-amiri text-xl font-bold text-[#f7f2ea]">{cat.title}</h3>
              <span className="font-cinzel text-xs font-bold text-[#c5a059] bg-[#241710] border border-[#c5a059]/30 px-2.5 py-0.5 rounded-full">
                {cat.items.length} WORKSHOPS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cat.items.map((w) => (
                <div
                  key={w.id}
                  className="luxury-card rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="font-cinzel text-xs font-bold text-[#e5c158] bg-[#2a1b12] border border-[#c5a059]/40 px-2 py-0.5 rounded-md">
                        #{w.id}
                      </span>
                      <span className="font-cinzel text-xs font-bold text-[#d8c8b4] bg-[#241710] border border-[#c5a059]/20 px-2 py-0.5 rounded-md">
                        {w.year}
                      </span>
                    </div>

                    <h4 className="font-amiri font-bold text-white text-lg group-hover:text-[#e5c158] transition-colors leading-snug">
                      {w.displayTitle}
                    </h4>

                    <p className="font-arabic-body mt-2 text-xs text-[#d8c8b4] line-clamp-3 leading-relaxed">
                      {w.shortSummary || w.fullDescription}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#c5a059]/20 space-y-1.5 text-xs text-[#9c8974]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                        <span>{w.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                        <span className="truncate">{w.location}</span>
                      </div>
                      {w.supervisorsAndPresenters.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#e5c158] font-bold">المؤطر:</span>
                          <span className="truncate font-medium text-[#f7f2ea]">{w.supervisorsAndPresenters.join('، ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#c5a059]/20 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedWorkshop(w)}
                      className="text-xs font-bold text-[#e5c158] hover:text-white flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-[#231710] transition-all"
                    >
                      <span>تفاصيل الورشة</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {onAskAboutWorkshop && (
                      <button
                        onClick={() => onAskAboutWorkshop(w.displayTitle)}
                        className="text-[11px] bg-[#231710] hover:bg-[#2e1f16] hover:text-[#e5c158] text-[#d8c8b4] px-2.5 py-1.5 rounded-lg border border-[#c5a059]/30 transition-all"
                      >
                        اسأل المساعد
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Workshop Modal Detail */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="luxury-card border-2 border-[#c5a059]/50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedWorkshop(null)}
              className="absolute left-6 top-6 p-2 rounded-full bg-[#241710] hover:bg-[#322016] text-[#9c8974] hover:text-white"
            >
              ✕
            </button>

            <span className="font-cinzel text-xs font-bold text-[#e5c158] bg-[#2a1b12] border border-[#c5a059]/40 px-2.5 py-0.5 rounded-md">
              ورشة تكوينية #{selectedWorkshop.id} • {selectedWorkshop.year}
            </span>

            <h3 className="font-amiri text-2xl md:text-3xl font-bold text-white mt-3">
              {selectedWorkshop.displayTitle}
            </h3>

            <div className="mt-4 p-4 bg-[#140d09] rounded-2xl border border-[#c5a059]/25 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#9c8974] font-bold block mb-1">التاريخ:</span>
                <span className="text-white">{selectedWorkshop.date}</span>
              </div>
              <div>
                <span className="text-[#9c8974] font-bold block mb-1">المكان:</span>
                <span className="text-white">{selectedWorkshop.location}</span>
              </div>
              <div>
                <span className="text-[#9c8974] font-bold block mb-1">المؤطر:</span>
                <span className="text-[#e5c158] font-bold">{selectedWorkshop.supervisorsAndPresenters.join('، ')}</span>
              </div>
              <div>
                <span className="text-[#9c8974] font-bold block mb-1">التوثيق الأرشيفي:</span>
                <span className="text-[#c5a059]">{selectedWorkshop.sourceArchive} ({selectedWorkshop.pdfPages})</span>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="font-amiri text-base font-bold text-[#e5c158] mb-2">المحتوى التكويني والتطبيقي:</h4>
              <p className="font-arabic-body text-sm text-[#f7f2ea] p-4 bg-[#140d09]/70 rounded-2xl border border-[#c5a059]/25 leading-relaxed whitespace-pre-wrap">
                {selectedWorkshop.fullDescription}
              </p>
            </div>

            {selectedWorkshop.outcomes && (
              <div className="mt-4">
                <h4 className="font-amiri text-base font-bold text-[#e5c158] mb-2">مخرجات الورشة:</h4>
                <p className="font-arabic-body text-xs text-[#d8c8b4] bg-[#231710] p-3 rounded-xl border border-[#c5a059]/20 leading-relaxed">
                  {selectedWorkshop.outcomes}
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#c5a059]/20 flex justify-end">
              <button
                onClick={() => {
                  const title = selectedWorkshop.displayTitle;
                  setSelectedWorkshop(null);
                  if (onAskAboutWorkshop) onAskAboutWorkshop(title);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#b8934a] to-[#c5a059] text-[#140d09] text-xs font-bold rounded-xl transition-all"
              >
                اسأل رفيق السعادة عن هذه الورشة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
