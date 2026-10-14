import React, { useState, useMemo } from 'react';
import { Search, Calendar, MapPin, Users, Award, BookOpen, Filter, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ActivityRecord } from '../data/clubData';

interface ActivitiesExplorerProps {
  activities: ActivityRecord[];
  onAskAboutActivity?: (title: string) => void;
}

export const ActivitiesExplorer: React.FC<ActivitiesExplorerProps> = ({
  activities,
  onAskAboutActivity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    activities.forEach(a => set.add(a.category));
    return Array.from(set);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      if (selectedYear !== 'all' && act.year !== selectedYear) return false;
      if (selectedCategory !== 'all' && act.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase().trim();
        const sNorm = s.replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
        const titleNorm = act.displayTitle.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
        const descNorm = act.fullDescription.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
        const presenters = act.supervisorsAndPresenters.join(' ').toLowerCase();
        const aliases = act.aliases.join(' ').toLowerCase();
        const matches = titleNorm.includes(sNorm) || descNorm.includes(sNorm) || presenters.includes(s) || aliases.includes(s);
        if (!matches) return false;
      }
      return true;
    });
  }, [activities, selectedYear, selectedCategory, searchTerm]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner in Minimal Luxury Academic Style */}
      <div className="relative rounded-3xl p-6 sm:p-10 luxury-card border border-[#c5a059]/35 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] text-xs font-bold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>السجل الأكاديمي المعتمد • 49 نشاطاً موثقاً</span>
          </div>
          <h2 className="font-amiri text-2xl sm:text-4xl font-bold text-[#f7f2ea] tracking-tight">
            سجل أنشطة نادي كيمياء السعادة (2024 - 2026)
          </h2>
          <p className="font-arabic-body mt-2 text-sm sm:text-base text-[#d8c8b4] leading-relaxed">
            جميع الأنشطة الميدانية، الورشات التكوينية، المبادرات البيئية، والزيارات العلمية مستخرجة ومفهرسة بدقة من الأرشيف السنوي الرسمي مع ذكر المصادر والصفحات.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="luxury-card rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-lg space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9c8974]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث في الأنشطة، الورشات، المؤطرين، أو الكلمات الدلالية بالعربية أو الفرنسية..."
            className="w-full bg-[#140d09] border border-[#c5a059]/30 rounded-xl pr-12 pl-10 py-3 text-sm text-[#f7f2ea] placeholder-[#8c7762] focus:outline-none focus:ring-2 focus:ring-[#c5a059]/50 focus:border-[#c5a059] transition-all font-arabic-body"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8974] hover:text-[#f7f2ea]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Year Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-[#c5a059] font-bold shrink-0">السنة:</span>
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === 'all'
                  ? 'bg-gradient-to-r from-[#b8934a] to-[#c5a059] text-[#140d09] shadow-md shadow-[#c5a059]/20'
                  : 'bg-[#231710] text-[#d8c8b4] hover:bg-[#2c1d14] border border-[#c5a059]/20'
              }`}
            >
              الكل ({activities.length})
            </button>
            {[2024, 2025, 2026].map(yr => {
              const count = activities.filter(a => a.year === yr).length;
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? 'bg-gradient-to-r from-[#b8934a] to-[#c5a059] text-[#140d09] shadow-md shadow-[#c5a059]/20'
                      : 'bg-[#231710] text-[#d8c8b4] hover:bg-[#2c1d14] border border-[#c5a059]/20'
                  }`}
                >
                  {yr} ({count})
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#e5c158] shrink-0" />
            <span className="text-xs text-[#c5a059] font-bold shrink-0">التصنيف:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#231710] border border-[#c5a059]/30 text-[#f7f2ea] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
            >
              <option value="all">جميع التصنيفات</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className="luxury-card rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all"
          >
            <div>
              {/* Card Header: ID, Year & Category */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-cinzel text-xs font-bold text-[#e5c158] bg-[#2a1b12] border border-[#c5a059]/40 px-2 py-0.5 rounded-md">
                  #{act.id}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-cinzel text-[11px] bg-[#231710] text-[#d8c8b4] px-2 py-0.5 rounded-md font-semibold border border-[#c5a059]/20">
                    {act.year}
                  </span>
                  <span className="text-[11px] bg-[#2a1c13] text-[#e5c158] border border-[#c5a059]/30 px-2 py-0.5 rounded-md font-semibold">
                    {act.category}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-amiri font-bold text-[#f7f2ea] text-lg group-hover:text-[#e5c158] transition-colors leading-snug">
                {act.displayTitle}
              </h3>

              {/* Badge if available */}
              {act.highlightedBadge && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#e5c158] bg-[#2a1c13] border border-[#c5a059]/40 px-2.5 py-0.5 rounded-md">
                  <Award className="w-3 h-3 text-[#c5a059]" />
                  <span>{act.highlightedBadge}</span>
                </div>
              )}

              {/* Summary */}
              <p className="font-arabic-body mt-3 text-xs text-[#d8c8b4] line-clamp-3 leading-relaxed">
                {act.shortSummary || act.fullDescription}
              </p>

              {/* Key metadata chips */}
              <div className="mt-4 pt-3 border-t border-[#c5a059]/20 space-y-1.5 text-xs text-[#9c8974]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                  <span>{act.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                  <span className="truncate">{act.location}</span>
                </div>
                {act.supervisorsAndPresenters.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                    <span className="truncate text-[#d8c8b4] font-medium">{act.supervisorsAndPresenters.join('، ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-[#c5a059]/20 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedActivity(act)}
                className="text-xs font-bold text-[#e5c158] hover:text-white flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-[#231710] transition-all"
              >
                <span>التفاصيل والأرشيف</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {onAskAboutActivity && (
                <button
                  onClick={() => onAskAboutActivity(act.displayTitle)}
                  className="text-[11px] bg-[#231710] hover:bg-[#2e1f16] hover:text-[#e5c158] text-[#d8c8b4] px-2.5 py-1.5 rounded-lg border border-[#c5a059]/30 transition-all font-medium"
                >
                  اسأل الروبوت عنه
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12 luxury-card rounded-3xl p-8">
          <BookOpen className="w-12 h-12 text-[#9c8974] mx-auto mb-3" />
          <h3 className="font-amiri text-lg font-bold text-[#f7f2ea]">لا توجد أنشطة تطابق معايير البحث</h3>
          <p className="text-sm text-[#9c8974] mt-1">جرب تغيير كلمات البحث أو إعادة ضبط فلاتر السنة والتصنيف.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedYear('all');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#b8934a] to-[#c5a059] text-[#140d09] text-xs font-bold rounded-xl transition-all"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}

      {/* In-depth Activity Detail Modal in Minimal Luxury */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="luxury-card border-2 border-[#c5a059]/50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute left-6 top-6 p-2 rounded-full bg-[#241710] hover:bg-[#322016] text-[#9c8974] hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-cinzel text-xs font-bold text-[#e5c158] bg-[#2a1b12] border border-[#c5a059]/40 px-2.5 py-0.5 rounded-md">
                النشاط رقم #{selectedActivity.id}
              </span>
              <span className="font-cinzel text-xs bg-[#231710] text-[#d8c8b4] px-2 py-0.5 rounded-md font-bold border border-[#c5a059]/20">
                {selectedActivity.year}
              </span>
              <span className="text-xs bg-[#2a1c13] text-[#e5c158] border border-[#c5a059]/30 px-2 py-0.5 rounded-md font-bold">
                {selectedActivity.category}
              </span>
            </div>

            <h2 className="font-amiri text-2xl md:text-3xl font-bold text-white mt-2 leading-snug">
              {selectedActivity.displayTitle}
            </h2>

            {selectedActivity.highlightedBadge && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#e5c158] bg-[#2a1c13] border border-[#c5a059]/50 px-2.5 py-1 rounded-md">
                <Award className="w-4 h-4 text-[#c5a059]" />
                <span>{selectedActivity.highlightedBadge}</span>
              </div>
            )}

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 p-4 bg-[#140d09] rounded-2xl border border-[#c5a059]/25 text-xs">
              <div>
                <span className="text-[#9c8974] font-bold block mb-1">تاريخ النشاط:</span>
                <span className="text-[#f7f2ea] font-medium">{selectedActivity.date}</span>
              </div>
              <div>
                <span className="text-[#9c8974] font-bold block mb-1">المكان:</span>
                <span className="text-[#f7f2ea] font-medium">{selectedActivity.location}</span>
              </div>
              <div>
                <span className="text-[#9c8974] font-bold block mb-1">المؤطرون والمشرفون:</span>
                <span className="text-[#e5c158] font-medium">
                  {selectedActivity.supervisorsAndPresenters.length > 0
                    ? selectedActivity.supervisorsAndPresenters.join('، ')
                    : 'أعضاء النادي'}
                </span>
              </div>
              <div>
                <span className="text-[#9c8974] font-bold block mb-1">المصدر في الأرشيف:</span>
                <span className="text-[#c5a059] font-medium">
                  {selectedActivity.sourceArchive} ({selectedActivity.pdfPages})
                </span>
              </div>
            </div>

            {/* Full Archive Description */}
            <div className="mt-6">
              <h4 className="font-amiri text-base font-bold text-[#e5c158] mb-2">الوصف الكامل من وثائق الأرشيف:</h4>
              <div className="p-4 bg-[#140d09]/70 border border-[#c5a059]/25 rounded-2xl text-sm text-[#f7f2ea] leading-relaxed whitespace-pre-wrap font-arabic-body">
                {selectedActivity.fullDescription}
              </div>
            </div>

            {/* Objectives */}
            {selectedActivity.objectives.length > 0 && (
              <div className="mt-5">
                <h4 className="font-amiri text-base font-bold text-[#e5c158] mb-2">الأهداف المسطرة:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#d8c8b4] pr-1">
                  {selectedActivity.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Outcomes */}
            {selectedActivity.outcomes && (
              <div className="mt-5">
                <h4 className="font-amiri text-base font-bold text-[#e5c158] mb-2">النتائج والأثر الميداني:</h4>
                <p className="text-xs text-[#d8c8b4] bg-[#231710] p-3 rounded-xl border border-[#c5a059]/20 leading-relaxed font-arabic-body">
                  {selectedActivity.outcomes}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-[#c5a059]/20 flex items-center justify-between">
              <span className="text-xs text-[#9c8974]">
                حالة التوثيق: <span className="text-emerald-400 font-bold">{selectedActivity.verificationStatus}</span>
              </span>
              <button
                onClick={() => {
                  const title = selectedActivity.displayTitle;
                  setSelectedActivity(null);
                  if (onAskAboutActivity) onAskAboutActivity(title);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#b8934a] to-[#c5a059] hover:from-[#c5a059] hover:to-[#e5c158] text-[#140d09] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#c5a059]/20"
              >
                تحدث مع رفيق السعادة عن هذا النشاط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
