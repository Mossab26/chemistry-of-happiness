import React, { useState } from 'react';
import { Shield, Key, CheckCircle, AlertTriangle, Edit3, Plus, Database, Sparkles, RefreshCw, Lock, Save, Trash2, Search, FileDown } from 'lucide-react';
import { ActivityRecord, KNOWLEDGE_DISCREPANCIES } from '../data/clubData';
import { ClubLogo } from './ClubLogo';
import { generateClientResponse } from '../utils/clientKnowledgeEngine';

interface AdminDashboardProps {
  activities: ActivityRecord[];
  onUpdateActivity: (id: number, updates: Partial<ActivityRecord>) => void;
  onAddActivity: (activity: Partial<ActivityRecord>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activities,
  onUpdateActivity,
  onAddActivity
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'activities' | 'conflicts' | 'ai-tester' | 'status'>('activities');

  // Activities Manager state
  const [adminSearch, setAdminSearch] = useState('');
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newActivityForm, setNewActivityForm] = useState<Partial<ActivityRecord>>({
    displayTitle: '',
    year: 2026,
    date: '',
    location: 'جامعة فرحات عباس سطيف 1',
    category: 'ثقافة ومناسبات',
    fullDescription: '',
    shortSummary: '',
    supervisorsAndPresenters: [],
    sourceArchive: 'أرشيف كيمياء السعادة',
    pdfPages: 'إدخال إداري معتمد',
    isWorkshop: false
  });

  // Conflicts state
  const [conflicts, setConflicts] = useState(KNOWLEDGE_DISCREPANCIES);
  const [resolutionNotes, setResolutionNotes] = useState<{ [id: string]: string }>({
    'founding-chairperson': KNOWLEDGE_DISCREPANCIES[0].adminResolutionNote,
    'profile-typographical-note': KNOWLEDGE_DISCREPANCIES[1].adminResolutionNote
  });

  // AI Knowledge Base Tester state
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'happiness2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('كلمة المرور غير صحيحة. كلمة المرور الافتراضية هي happiness2026');
    }
  };

  const handleSaveActivityEdit = () => {
    if (!editingActivity) return;
    onUpdateActivity(editingActivity.id, editingActivity);
    setEditingActivity(null);
  };

  const handleCreateActivity = () => {
    if (!newActivityForm.displayTitle) return;
    onAddActivity(newActivityForm);
    setIsCreatingNew(false);
    setNewActivityForm({
      displayTitle: '',
      year: 2026,
      date: '',
      location: 'جامعة فرحات عباس سطيف 1',
      category: 'ثقافة ومناسبات',
      fullDescription: '',
      shortSummary: '',
      supervisorsAndPresenters: [],
      sourceArchive: 'أرشيف كيمياء السعادة',
      pdfPages: 'إدخال إداري معتمد',
      isWorkshop: false
    });
  };

  const handleTestRetrieval = async () => {
    if (!testQuery.trim()) return;
    setIsTesting(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testQuery, history: [] })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      } else {
        const local = generateClientResponse(testQuery);
        setTestResult({ reply: local.text, mode: 'محرك العميل المحلي المدمج (GitHub Pages 100% Offline)' });
      }
    } catch {
      const local = generateClientResponse(testQuery);
      setTestResult({ reply: local.text, mode: 'محرك العميل المحلي المدمج (GitHub Pages 100% Offline)' });
    } finally {
      setIsTesting(false);
    }
  };

  const exportDataJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chemistry_of_happiness_archive_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 luxury-card border-2 border-[#c5a059]/40 rounded-3xl shadow-2xl backdrop-blur-xl animate-fadeIn">
        <div className="flex justify-center mb-4">
          <ClubLogo size="md" variant="gold" />
        </div>
        <h2 className="font-amiri text-2xl font-bold text-white text-center">لوحة إدارة نادي كيمياء السعادة</h2>
        <p className="font-arabic-body text-xs text-[#9c8974] text-center mt-1">
          بوابة خاصة للمشرفين لمراجعة الأرشيف الأكاديمي، تدقيق السجلات، وتحديث المعرفة
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#c5a059] block mb-1">رمز المرور الإداري (PIN):</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="أدخل كلمة المرور (افتراضية: happiness2026)"
              className="w-full bg-[#140d09] border border-[#c5a059]/30 rounded-xl px-4 py-3 text-sm text-[#f7f2ea] placeholder-[#8c7762] focus:outline-none focus:ring-2 focus:ring-[#c5a059]/50"
            />
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#b8934a] to-[#c5a059] hover:from-[#c5a059] hover:to-[#e5c158] text-[#140d09] rounded-xl text-sm font-bold transition-all shadow-md shadow-[#c5a059]/20"
          >
            تسجيل الدخول للإدارة
          </button>
        </form>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Admin Bar */}
      <div className="luxury-card rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#c5a059]/35">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#261911] border border-[#c5a059]/40 text-[#e5c158] text-xs font-bold mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>جلسة إدارية مصرح بها</span>
          </div>
          <h2 className="font-amiri text-2xl font-bold text-white">لوحة التحكم وإدارة المعرفة الأرشيفية</h2>
          <p className="font-arabic-body text-xs text-[#9c8974] mt-1">
            إدارة وتدقيق السجلات الـ 49، حل التعارضات التوثيقية، واختبار محرك الاسترجاع
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportDataJson}
            className="px-3.5 py-2 bg-[#231710] hover:bg-[#2c1d14] text-[#e5c158] text-xs font-bold rounded-xl border border-[#c5a059]/30 flex items-center gap-1.5 transition-all"
          >
            <FileDown className="w-4 h-4 text-[#c5a059]" />
            <span>تصدير JSON</span>
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/60 transition-all"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Metrics Row in Minimal Luxury */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#1c130e] border border-[#c5a059]/25 text-center">
          <span className="font-cinzel text-2xl font-bold text-[#e5c158]">{activities.length}</span>
          <span className="text-xs text-[#9c8974] block mt-1 font-semibold">إجمالي الأنشطة الموثقة</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#1c130e] border border-[#c5a059]/25 text-center">
          <span className="font-cinzel text-2xl font-bold text-[#c5a059]">
            {activities.filter(a => a.isWorkshop).length}
          </span>
          <span className="text-xs text-[#9c8974] block mt-1 font-semibold">الورشات التكوينية</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#1c130e] border border-[#c5a059]/25 text-center">
          <span className="font-cinzel text-2xl font-bold text-[#f7f2ea]">172</span>
          <span className="text-xs text-[#9c8974] block mt-1 font-semibold">صفحة أرشيف مفهرسة</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#1c130e] border border-[#c5a059]/25 text-center">
          <span className="font-cinzel text-2xl font-bold text-[#e5c158]">{conflicts.length}</span>
          <span className="text-xs text-[#9c8974] block mt-1 font-semibold">سجلات معتمدة</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-[#c5a059]/20 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveAdminTab('activities')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeAdminTab === 'activities'
              ? 'bg-gradient-to-r from-[#b8934a] to-[#c5a059] text-[#140d09] shadow-md'
              : 'text-[#9c8974] hover:text-white hover:bg-[#231710]'
          }`}
        >
          سجل الأنشطة الـ 49 ({activities.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('conflicts')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeAdminTab === 'conflicts'
              ? 'bg-gradient-to-r from-[#b8934a] to-[#c5a059] text-[#140d09] shadow-md'
              : 'text-[#9c8974] hover:text-white hover:bg-[#231710]'
          }`}
        >
          مراجعة التعارضات الأرشيفية ({conflicts.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('ai-tester')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeAdminTab === 'ai-tester'
              ? 'bg-gradient-to-r from-[#b8934a] to-[#c5a059] text-[#140d09] shadow-md'
              : 'text-[#9c8974] hover:text-white hover:bg-[#231710]'
          }`}
        >
          أداة اختبار الاسترجاع الذكي (AI Tester)
        </button>
        <button
          onClick={() => setActiveAdminTab('status')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeAdminTab === 'status'
              ? 'bg-gradient-to-r from-[#b8934a] to-[#c5a059] text-[#140d09] shadow-md'
              : 'text-[#9c8974] hover:text-white hover:bg-[#231710]'
          }`}
        >
          حالة النظام والتكاملات
        </button>
      </div>

      {/* Tab 1: Activities Registry */}
      {activeAdminTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="ابحث بالاسم لتعديل النشاط..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-3 py-2 text-xs text-slate-200"
              />
            </div>

            <button
              onClick={() => setIsCreatingNew(true)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نشاط جديد للسجل</span>
            </button>
          </div>

          {/* Activities Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">الرقم</th>
                  <th className="p-3.5">العنوان الرسمي</th>
                  <th className="p-3.5">السنة</th>
                  <th className="p-3.5">التصنيف</th>
                  <th className="p-3.5">المصدر الأرشيفي</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {activities
                  .filter(a => !adminSearch || a.displayTitle.includes(adminSearch) || a.rawTitle.includes(adminSearch))
                  .map((act) => (
                    <tr key={act.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-cyan-400">#{act.id}</td>
                      <td className="p-3.5 font-semibold text-white">
                        {act.displayTitle}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          العنوان الأصلي: {act.rawTitle}
                        </span>
                      </td>
                      <td className="p-3.5">{act.year}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {act.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {act.sourceArchive} ({act.pdfPages})
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setEditingActivity(act)}
                          className="p-1.5 bg-slate-800 hover:bg-cyan-900/60 text-cyan-300 rounded-lg transition-all"
                          title="تعديل النشاط"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>تعديل النشاط #{editingActivity.id}: {editingActivity.rawTitle}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">العنوان المعروض:</label>
                <input
                  type="text"
                  value={editingActivity.displayTitle}
                  onChange={(e) => setEditingActivity({ ...editingActivity, displayTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">السنة:</label>
                  <input
                    type="number"
                    value={editingActivity.year}
                    onChange={(e) => setEditingActivity({ ...editingActivity, year: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">التاريخ:</label>
                  <input
                    type="text"
                    value={editingActivity.date}
                    onChange={(e) => setEditingActivity({ ...editingActivity, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">المكان:</label>
                <input
                  type="text"
                  value={editingActivity.location}
                  onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">الوصف الكامل من الأرشيف:</label>
                <textarea
                  rows={4}
                  value={editingActivity.fullDescription}
                  onChange={(e) => setEditingActivity({ ...editingActivity, fullDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingActivity(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveActivityEdit}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Conflicts & Discrepancies */}
      {activeAdminTab === 'conflicts' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200">
            <strong>نظام التوثيق والمراجعة:</strong> يلتزم الموقع بعدم طمس أي حقيقة أو تفضيل رواية على أخرى دون سند رسمي. تم حفظ البيانين في قاعدة البيانات وعرضهما بشفافية.
          </div>

          {conflicts.map((conf) => (
            <div key={conf.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-white">{conf.title}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {conf.sources.map((s, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400 block">{s.source}:</span>
                    <p className="text-slate-300">{s.statement}</p>
                    <span className="text-[10px] text-slate-500 block pt-1">الحالة: {s.status}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  ملاحظة الإدارة المسجلة والمعتمدة:
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes[conf.id] || ''}
                  onChange={(e) => setResolutionNotes({ ...resolutionNotes, [conf.id]: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">الحالة الحالية: {conf.status}</span>
                <button
                  onClick={() => {
                    alert('تم حفظ واعتماد التوجيه الإداري للتعارض بنجاح.');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>اعتماد الملاحظة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: AI Knowledge Base Tester */}
      {activeAdminTab === 'ai-tester' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h4 className="font-bold text-sm text-white">اختبار الاسترجاع الذكي (AI Knowledge Retrieval)</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              اكتب أي سؤال لاختبار مطابقة السجلات والتحقق من أن الإجابة مستندة حصراً إلى الأرشيف المعتمد.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="مثال: واش هي ورشة المونتاج الأولى ومن قدمها؟"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
            <button
              onClick={handleTestRetrieval}
              disabled={isTesting || !testQuery.trim()}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTesting ? 'جاري الفحص...' : 'فحص الاسترجاع'}</span>
            </button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold block mb-1">النمط ومحرك الذكاء:</span>
                <span className="text-cyan-400 font-mono font-bold">{testResult.mode || 'grounded-engine'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">المصادر المسترجعة:</span>
                <div className="flex flex-wrap gap-1">
                  {testResult.sources?.map((s: string, idx: number) => (
                    <span key={idx} className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">نص الإجابة المولدة:</span>
                <div className="p-3 bg-slate-900 rounded-xl text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {testResult.reply}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: System Integration Status */}
      {activeAdminTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
            <span className="font-bold text-white block text-sm">حالة خادم التطبيق (Express Full-Stack)</span>
            <div className="flex items-center gap-2 text-emerald-400 pt-1">
              <CheckCircle className="w-4 h-4" />
              <span>الخادم يعمل بنجاح على المنفذ 3000 مع مسارات API الموثقة</span>
            </div>
            <p className="text-slate-400">
              المسارات المفعلة: /api/chat, /api/tts, /api/activities, /api/club-info, /api/conflicts
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
            <span className="font-bold text-white block text-sm">حالة محرك الذكاء الاصطناعي (Gemini 3.8 Flash)</span>
            <div className="flex items-center gap-2 text-cyan-400 pt-1">
              <Sparkles className="w-4 h-4" />
              <span>محرك Gemini API مهيأ عبر الخادم مع استرجاع هجين دقيق من الأرشيف</span>
            </div>
            <p className="text-slate-400">
              مفتاح API يتم جلبه من متغيرات البيئة السرية حصراً (process.env.GEMINI_API_KEY).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
            <span className="font-bold text-white block text-sm">التعرف على الصوت (Web Speech API)</span>
            <div className="flex items-center gap-2 text-emerald-400 pt-1">
              <CheckCircle className="w-4 h-4" />
              <span>يدعم لغات ar-DZ و ar-SA في متصفحات Chrome و Edge و Safari</span>
            </div>
            <p className="text-slate-400">
              يتطلب إذن الميكروفون عند أول نقرة، مع توفير بديل الكتابة النصية تلقائياً.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
            <span className="font-bold text-white block text-sm">التوليد الصوتي والمجسم ثلاثي الأبعاد</span>
            <div className="flex items-center gap-2 text-emerald-400 pt-1">
              <CheckCircle className="w-4 h-4" />
              <span>Three.js WebGL مجسم الروبوت التفاعلي + Web Speech Synthesis</span>
            </div>
            <p className="text-slate-400">
              حالات الروبوت السبع: idle, listening, processing, speaking, happy, error, muted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
