import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { ACTIVITIES_REGISTRY, OFFICIAL_CLUB_PROFILE, KNOWLEDGE_DISCREPANCIES, ActivityRecord } from './src/data/clubData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory writable state seeded from authoritative records
let activitiesDb: ActivityRecord[] = [...ACTIVITIES_REGISTRY];
let clubProfileDb = { ...OFFICIAL_CLUB_PROFILE };
let discrepanciesDb = [...KNOWLEDGE_DISCREPANCIES];
let adminLogs: Array<{ timestamp: string; action: string; details: string }> = [];

// Initialize Google GenAI if key is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- Grounded Retriever Helper ----------------
function searchKnowledgeBase(query: string, limit = 5): { matchedActivities: ActivityRecord[]; relevantNotes: string[] } {
  const q = query.toLowerCase().trim();
  const normalizedQ = q.replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');

  const scored = activitiesDb.map(act => {
    let score = 0;
    const titleNorm = act.displayTitle.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
    const descNorm = act.fullDescription.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
    const presenterNorm = act.supervisorsAndPresenters.join(' ').toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');

    // Title match
    if (titleNorm.includes(normalizedQ) || normalizedQ.includes(titleNorm)) score += 10;
    // Year match
    if (q.includes(act.year.toString())) score += 3;
    // Category match
    if (normalizedQ.includes('ورش') && act.isWorkshop) score += 4;
    if ((normalizedQ.includes('بيئ') || normalizedQ.includes('تشجير') || normalizedQ.includes('نظاف')) && act.category === 'بيئة وتطوع') score += 4;
    if ((normalizedQ.includes('استقبال') || normalizedQ.includes('جدد') || normalizedQ.includes('توجيه')) && act.category === 'توجيه واستقبال الطلبة') score += 4;
    if ((normalizedQ.includes('زيار') || normalizedQ.includes('مصنع') || normalizedQ.includes('مكتب')) && act.category === 'زيارات ميدانية') score += 4;
    if ((normalizedQ.includes('مسابق') || normalizedQ.includes('روبوت') || normalizedQ.includes('تبس')) && act.category === 'مسابقات ومعارض') score += 5;

    // Word-by-word token match
    const tokens = normalizedQ.split(/\s+/).filter(t => t.length > 2);
    for (const t of tokens) {
      if (titleNorm.includes(t)) score += 3;
      if (descNorm.includes(t)) score += 1;
      if (presenterNorm.includes(t)) score += 3;
      if (act.aliases.some(a => a.toLowerCase().includes(t))) score += 2;
    }

    return { act, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter(s => s.score > 0).slice(0, limit).map(s => s.act);

  const notes: string[] = [];
  if (normalizedQ.includes('تاسيس') || normalizedQ.includes('رئيس') || normalizedQ.includes('سميره') || normalizedQ.includes('عقون')) {
    notes.push(clubProfileDb.discrepancyNotes);
  }
  if (normalizedQ.includes('هدف') || normalizedQ.includes('اهداف')) {
    notes.push('أهداف النادي: ' + clubProfileDb.objectives.join(' | '));
  }
  if (normalizedQ.includes('اسم') || normalizedQ.includes('غزالي') || normalizedQ.includes('كيمياء السعاده')) {
    notes.push('سبب التسمية: ' + clubProfileDb.namePhilosophy);
  }
  if (normalizedQ.includes('تواصل') || normalizedQ.includes('ايميل') || normalizedQ.includes('انستغرام') || normalizedQ.includes('فيسبوك')) {
    notes.push(`قنوات التواصل الرسمية: البريد: ${clubProfileDb.contact.email} | إنستغرام: ${clubProfileDb.contact.instagram} | فيسبوك: ${clubProfileDb.contact.facebook}`);
  }

  return { matchedActivities: matched, relevantNotes: notes };
}

// ---------------- Deterministic Fallback Generator in Natural Algerian Darija ----------------
function generateGroundedFallback(query: string, conversationHistory: Array<{ role: string; content: string }>): { text: string; sources: string[] } {
  const { matchedActivities, relevantNotes } = searchKnowledgeBase(query, 5);
  const q = query.toLowerCase().trim();
  const qNorm = q.replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');

  // Find the last mentioned activity in conversation history for contextual follow-up
  let lastMentionedActivity: ActivityRecord | null = null;
  if (conversationHistory.length > 0) {
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const prevText = conversationHistory[i].content;
      const found = activitiesDb.find(a => prevText.includes(a.displayTitle) || prevText.includes(a.rawTitle));
      if (found) {
        lastMentionedActivity = found;
        break;
      }
    }
  }

  // 1. Natural friendly greetings & casual pleasantries
  const greetings = ['السلام عليكم', 'سلام', 'صباح الخير', 'مساء الخير', 'أهلا', 'اهلين', 'مرحبا', 'واش راك', 'كاش جديد', 'hello', 'hi'];
  if (greetings.some(g => q.includes(g)) && q.length < 30) {
    return {
      text: 'وعليكم السلام ورحمة الله! أهلاً بيك زميلي، واش راك؟ أنا رفيق السعادة، في واش نقدر نعاونك بخصوص نادي كيمياء السعادة وأنشطتنا؟ 😊',
      sources: []
    };
  }

  // 2. Follow-up context queries (e.g. "وين دارو النشاط؟", "وقتاش كان؟", "شكون قدمها؟")
  if (lastMentionedActivity) {
    if (qNorm.includes('وين') || qNorm.includes('مكان') || qNorm.includes('اين')) {
      return {
        text: `نشاط "${lastMentionedActivity.displayTitle}" كان في ${lastMentionedActivity.location} بتاريخ ${lastMentionedActivity.date} 😊.`,
        sources: []
      };
    }
    if (qNorm.includes('وقتاش') || qNorm.includes('متى') || qNorm.includes('تاريخ')) {
      return {
        text: `أقيم نشاط "${lastMentionedActivity.displayTitle}" يوم ${lastMentionedActivity.date} في ${lastMentionedActivity.location}.`,
        sources: []
      };
    }
    if (qNorm.includes('شكون قدم') || qNorm.includes('شكون اثر') || qNorm.includes('المؤطر')) {
      const pres = lastMentionedActivity.supervisorsAndPresenters.length > 0 
        ? lastMentionedActivity.supervisorsAndPresenters.join(' و ')
        : 'أعضاء النادي المتميزين';
      return {
        text: `نشاط "${lastMentionedActivity.displayTitle}" أطرو وقدمو ${pres}.`,
        sources: []
      };
    }
  }

  // 3. Question on club supervisor
  if (qNorm.includes('مشرف') || qNorm.includes('استاذ النادي') || qNorm.includes('عاطف')) {
    return {
      text: 'المشرف على نادي كيمياء السعادة هو الأستاذ ابن عيسى عاطف، وهو اللي يرافق الطلبة ويأطر الورشات والأنشطة العلمية في الجامعة 😊.',
      sources: []
    };
  }

  // 4. Question on president / founders
  if (qNorm.includes('رئيس') || qNorm.includes('شكون وراء') || (qNorm.includes('تاسس') && (qNorm.includes('شكون') || qNorm.includes('كيفاش')))) {
    return {
      text: 'تأسس نادي كيمياء السعادة يوم 21 أبريل 2024 تحت إشراف الأستاذ ابن عيسى عاطف، ورئيسة النادي هي الطالبة عقون سميرة، ومعاها خياط إيناس كنائبة رئيس وعميرة آية كأمينة للمكتب ✨.',
      sources: []
    };
  }

  // 5. Question on 2026 activities specifically
  if (q.includes('2026') && (qNorm.includes('نشاط') || qNorm.includes('انشط') || qNorm.includes('واش دار') || qNorm.includes('واش كاين'))) {
    return {
      text: 'في عام 2026 النادي دار 17 نشاطاً متميزاً! من أبرزها:\n• معرض التنوع الثقافي "وجعلناكم شعوباً وقبائل لتعارفوا".\n• حملة التشجير الوطنية بالموان (غرس 5 ملايين شجرة).\n• ورشات PowerPoint، وورشة الذكاء الاصطناعي 2 حول نماذج LLM والوكلاء الأذكياء، وورشة الإلكترونيات 2.\n• المشاركة في استقبال بابا الفاتيكان بالجزائر العاصمة.\n• الفوز في المسابقة الوطنية للنوادي العلمية بتبسة بمشروع الروبوت المكتبي الذكي.\n• والتتويج بلقب «أنشط نادٍ بجامعة فرحات عباس سطيف 1» في يوم الطالب 19 ماي 🏆!',
      sources: []
    };
  }

  // 6. Question on 2024 activities
  if (q.includes('2024') && (qNorm.includes('نشاط') || qNorm.includes('انشط') || qNorm.includes('واش دار'))) {
    return {
      text: 'في 2024، كانت بداية النادي وتأسيسه في 21 أبريل، ومن أهم النشاطات اللي نظمناها:\n• أول نشاط "أرواح تسوثني" للتدريب على مناقشة المذكرات.\n• حملة النظافة "بيك وبيا جامعتنا تبقى نقية 1".\n• نشاط "كن طالب" في اليوم العالمي لعدد أفوغادرو.\n• تكريم عمال الجامعة، وندوة "من الفكرة إلى التخرج"، ومحاضرة "واش ندير بقرايتي" مع د. بن توهامي دحمان.',
      sources: []
    };
  }

  // 7. Question on 2025 activities
  if (q.includes('2025') && (qNorm.includes('نشاط') || qNorm.includes('انشط') || qNorm.includes('واش دار'))) {
    return {
      text: 'في 2025 كان كاين 23 نشاطاً كبيراً، منها:\n• نشاط "صندوق السعادة" وشجرة البصمات.\n• ورشات الذكاء الاصطناعي 1، الأردوينو 1 و2، الإلكترونيات مع الأستاذ وفي محل Smart Tech، والمونتاج 1 و2.\n• نشاط "استوقفتني آية" في رمضان، وحملة التشجير مع والي سطيف، وزيارة مكتب الدراسات CEERI.',
      sources: []
    };
  }

  // 8. General question about club activities
  if (qNorm.includes('انشطتنا') || (qNorm.includes('نشاط') && (qNorm.includes('احكيلي') || qNorm.includes('واش هوما')))) {
    return {
      text: 'نادي كيمياء السعادة عندو 49 نشاطاً مسجلاً من 2024 حتى 2026 تشمل ورشات علمية (ذكاء اصطناعي، إلكترونيات، أردوينو، مونتاج، BMC)، مبادرات بيئية وتشجير، زيارات ميدانية لمصانع ومكاتب دراسات، واستقبال وتوجيه الطلبة الجدد. واش من مجال تحب نحكي لك عليه بالتفصيل؟ 😊',
      sources: []
    };
  }

  // 9. Question on club identity
  if (qNorm.includes('واش هو') || qNorm.includes('شكون نتوما') || qNorm.includes('من نحن') || qNorm.includes('تعريف')) {
    return {
      text: `نادي كيمياء السعادة هو نادٍ علمي ثقافي بجامعة فرحات عباس سطيف 1، تأسس في 21 أبريل 2024 برئاسة الطالبة عقون سميرة وتحت إشراف الأستاذ ابن عيسى عاطف. هدفنا مساعدة الطلبة وتطوير مهاراتهم، وشعارنا الدائم هو: "${clubProfileDb.motto}" ✨.`,
      sources: []
    };
  }

  // 10. Question on club name inspiration (Al-Ghazali)
  if (qNorm.includes('اسم') || qNorm.includes('غزالي') || qNorm.includes('علاش كيمياء')) {
    return {
      text: 'اسم نادينا مستوحى من كتاب "كيمياء السعادة" للإمام أبو حامد الغزالي، اللي شبه فيه السعادة الحقيقية بكيمياء باطنية تحول القلب من الجهل إلى النور ومن القلق إلى الطمأنينة عبر العلم والعمل الصالح، وحنا أخذنا هذي الفلسفة لتطوير الذات والنجاح الدراسي والإنساني في الجامعة 💚.',
      sources: []
    };
  }

  // 11. Question on contact channels
  if (qNorm.includes('تواصل') || qNorm.includes('اتصال') || qNorm.includes('ايميل') || qNorm.includes('فيسبوك') || qNorm.includes('انستغرام')) {
    return {
      text: `تقدر تتواصل مع النادي مباشرة عبر:\n📧 البريد الإلكتروني: ${clubProfileDb.contact.email}\n📸 إنستغرام: @${clubProfileDb.contact.instagram}\n📘 فيسبوك: ${clubProfileDb.contact.facebook}\n📍 ومقرنا في جامعة سطيف 1 (مجمع الباز / كليات الهندسة والعلوم) مرحباً بيك في أي وقت!`,
      sources: []
    };
  }

  // 12. Question on workshops
  if (qNorm.includes('ورشات') || qNorm.includes('ورشه') || qNorm.includes('تكوين')) {
    return {
      text: 'نظمنا ورشات تطبيقية رائعة:\n• ورشات الذكاء الاصطناعي (AI 1 في 2025 وAI 2 في 2026 حول نماذج LLM والوكلاء الأذكياء مع الأستاذ المشرف).\n• ورشات الأردوينو 1 و2 مع الطالب أمين بلعطاش.\n• ورشات الإلكترونيات الأساسية والتطبيقية.\n• ورشات المونتاج والتصميم مع أنيس لعجال وهديل عياد، وورشة PowerPoint، وSpeaking Class في Mercia School. واش من ورشة تحب تعرف تفاصيلها؟',
      sources: []
    };
  }

  // 13. If user explicitly asks about something unknown
  if (qNorm.includes('حاجة ما تعرفهاش') || qNorm.includes('ما تعرفش') || qNorm.includes('شيء لا تعرفه')) {
    return {
      text: 'أنا هنا باش نعاونك في كل ما يتعلق بنادي كيمياء السعادة وأنشطتو وورشاتو وناسو. إذا كانت حاجة خارجة على النادي أو معلومة ما عنديش تفاصيل مؤكدة عليها، نقولهالك بصراحة وما نخترعش عليك، نقدر نعاونك في حاجة تخص النادي؟ 😊',
      sources: []
    };
  }

  // 14. Matched specific activity in a natural, friendly student tone
  if (matchedActivities.length > 0) {
    const act = matchedActivities[0];
    const pres = act.supervisorsAndPresenters.length > 0 ? ` بتأطير ${act.supervisorsAndPresenters.join(' و ')}` : '';
    const loc = act.location ? ` في ${act.location}` : '';
    return {
      text: `إيه، نشاط "${act.displayTitle}" أقيم يوم ${act.date}${loc}${pres}.\n\n${act.shortSummary || act.fullDescription} 😊`,
      sources: []
    };
  }

  // 15. Natural fallback when information is unconfirmed or unknown
  return {
    text: 'ما عنديش معلومة مؤكدة على هذي النقطة، نقدر نعاونك في حاجة أخرى بخصوص أنشطة النادي أو ورشاتو؟ 😊',
    sources: []
  };
}

// ---------------- API Routes ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(aiClient),
    activitiesCount: activitiesDb.length,
    timestamp: new Date().toISOString()
  });
});

// Club Info
app.get('/api/club-info', (req, res) => {
  res.json(clubProfileDb);
});

app.put('/api/club-info', (req, res) => {
  const { authKey, data } = req.body;
  if (authKey !== 'happiness2026' && authKey !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'غير مصرح لك بتعديل بيانات النادي' });
  }
  clubProfileDb = { ...clubProfileDb, ...data };
  adminLogs.push({
    timestamp: new Date().toISOString(),
    action: 'UPDATE_CLUB_INFO',
    details: 'تم تحديث معلومات النادي الرسمية من لوحة الإدارة'
  });
  res.json({ success: true, profile: clubProfileDb });
});

// Activities
app.get('/api/activities', (req, res) => {
  const { year, category, search, workshop } = req.query;
  let results = [...activitiesDb];

  if (year) {
    results = results.filter(a => a.year === parseInt(year as string, 10));
  }
  if (category) {
    results = results.filter(a => a.category === category);
  }
  if (workshop === 'true') {
    results = results.filter(a => a.isWorkshop);
  }
  if (search) {
    const s = (search as string).toLowerCase().trim();
    const sNorm = s.replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
    results = results.filter(a => {
      const title = a.displayTitle.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
      const desc = a.fullDescription.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
      const presenters = a.supervisorsAndPresenters.join(' ').toLowerCase();
      const aliases = a.aliases.join(' ').toLowerCase();
      return title.includes(sNorm) || desc.includes(sNorm) || presenters.includes(s) || aliases.includes(s);
    });
  }

  res.json({
    total: results.length,
    activities: results
  });
});

app.get('/api/activities/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const act = activitiesDb.find(a => a.id === id);
  if (!act) {
    return res.status(404).json({ error: 'النشاط غير موجود' });
  }
  res.json(act);
});

// Admin update activity
app.put('/api/activities/:id', (req, res) => {
  const { authKey, updates } = req.body;
  if (authKey !== 'happiness2026' && authKey !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'كلمة مرور الإدارة غير صحيحة' });
  }
  const id = parseInt(req.params.id, 10);
  const idx = activitiesDb.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'النشاط غير موجود' });
  }
  activitiesDb[idx] = { ...activitiesDb[idx], ...updates };
  adminLogs.push({
    timestamp: new Date().toISOString(),
    action: `UPDATE_ACTIVITY_${id}`,
    details: `تم تحديث النشاط: ${activitiesDb[idx].displayTitle}`
  });
  res.json({ success: true, activity: activitiesDb[idx] });
});

// Admin create new activity
app.post('/api/activities', (req, res) => {
  const { authKey, activity } = req.body;
  if (authKey !== 'happiness2026' && authKey !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'كلمة مرور الإدارة غير صحيحة' });
  }
  const nextId = Math.max(...activitiesDb.map(a => a.id), 0) + 1;
  const newRecord: ActivityRecord = {
    id: nextId,
    rawTitle: activity.rawTitle || activity.displayTitle,
    displayTitle: activity.displayTitle,
    aliases: activity.aliases || [],
    year: activity.year || 2026,
    date: activity.date || 'غير موثق في الأرشيف',
    location: activity.location || 'جامعة فرحات عباس سطيف 1',
    category: activity.category || 'ثقافة ومناسبات',
    fullDescription: activity.fullDescription || '',
    shortSummary: activity.shortSummary || '',
    objectives: activity.objectives || [],
    supervisorsAndPresenters: activity.supervisorsAndPresenters || [],
    outcomes: activity.outcomes || '',
    sourceArchive: activity.sourceArchive || 'سجل إضافي معتمد من الإدارة',
    pdfPages: activity.pdfPages || 'إدخال إداري مباشر',
    verificationStatus: 'قيد مراجعة الإدارة',
    isWorkshop: Boolean(activity.isWorkshop)
  };
  activitiesDb.push(newRecord);
  adminLogs.push({
    timestamp: new Date().toISOString(),
    action: 'CREATE_ACTIVITY',
    details: `تم إضافة نشاط جديد: ${newRecord.displayTitle}`
  });
  res.json({ success: true, activity: newRecord });
});

// Discrepancies and audit
app.get('/api/conflicts', (req, res) => {
  res.json({
    discrepancies: discrepanciesDb,
    logs: adminLogs
  });
});

app.post('/api/conflicts/:id/resolve', (req, res) => {
  const { authKey, resolutionNote } = req.body;
  if (authKey !== 'happiness2026' && authKey !== process.env.ADMIN_PIN) {
    return res.status(401).json({ error: 'كلمة مرور الإدارة غير صحيحة' });
  }
  const id = req.params.id;
  const item = discrepanciesDb.find(d => d.id === id);
  if (item) {
    item.adminResolutionNote = resolutionNote;
    item.status = 'تمت المراجعة والاعتماد الإداري';
    adminLogs.push({
      timestamp: new Date().toISOString(),
      action: `RESOLVE_CONFLICT_${id}`,
      details: `تم اعتماد الملاحظة الإدارية للتعارض: ${id}`
    });
  }
  res.json({ success: true, discrepancies: discrepanciesDb });
});

// Admin login verification
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'happiness2026' || (process.env.ADMIN_PIN && password === process.env.ADMIN_PIN)) {
    res.json({ success: true, message: 'مرحباً بك في لوحة تحكم نادي كيمياء السعادة' });
  } else {
    res.status(401).json({ success: false, error: 'كلمة المرور غير صحيحة' });
  }
});

// Conversational AI (Chat)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'الرجاء إرسال نص السؤال' });
    }

    const { matchedActivities, relevantNotes } = searchKnowledgeBase(message, 4);

    // Internal context preparation (used strictly for internal verification and grounding)
    const contextFragments = matchedActivities.map(a => 
      `[نشاط: "${a.displayTitle}" (${a.year}) | التاريخ: ${a.date} | المكان: ${a.location} | المؤطرون: ${a.supervisorsAndPresenters.join(', ')} | ملخص: ${a.shortSummary} | تفاصيل: ${a.fullDescription}]`
    ).join('\n\n');

    const profileContext = `[معلومات النادي]:
الاسم: ${clubProfileDb.nameArabic} (${clubProfileDb.nameEnglish})
المؤسسة: ${clubProfileDb.institution}
تاريخ التأسيس: ${clubProfileDb.foundationDate}
الأستاذ المشرف: ${clubProfileDb.supervisor}
رئيسة النادي: عقون سميرة | نائبة الرئيس: خياط إيناس | أمينة المكتب: عميرة آية
شعار النادي: "${clubProfileDb.motto}"
أهداف النادي: ${clubProfileDb.objectives.join('; ')}
سبب التسمية: ${clubProfileDb.namePhilosophy}
قنوات التواصل: البريد: ${clubProfileDb.contact.email} | إنستغرام: @${clubProfileDb.contact.instagram} | فيسبوك: ${clubProfileDb.contact.facebook}
`;

    const isFormalReportRequest = message.includes('تقرير رسمي') || message.includes('توثيق رسمي') || message.includes('تقرير إداري');

    // If Gemini client is active, run through Gemini 3.8 Flash
    if (aiClient) {
      try {
        const systemPrompt = `أنت «رفيق السعادة» (Rafiq Al-Saada)، مساعد ودود وزميل جامعي متعاون للطلبة في نادي كيمياء السعادة (The Chemistry of Happiness Club) بجامعة فرحات عباس سطيف 1، الجزائر.

الهدف الأساسي:
أنت لست محرك بحث جافاً يعرض تقارير عن الوثائق، بل صديق وزميل جامعي متعاون يتحدث مع الطلبة بطريقة طبيعية وإنسانية ودافئة.

1. أسلوب المحادثة:
- تحدث بأسلوب إنساني، دافئ، عفوي، وودود، كأنك زميل جامعي متعاون ومقرب.
- استعمل الدارجة الجزائرية بشكل طبيعي عندما يتحدث بها المستخدم، واستعمل العربية الفصحى أو لغة المستخدم عندما يناسب ذلك.
- أجب مباشرة عن السؤال، دون مقدمات رسمية أو عبارات تقنية غير ضرورية.
- اجعل الردود مختصرة ومفيدة وواضحة، مع تقديم تفاصيل إضافية عند الحاجة.
- تفاعل مع التحيات والمزاح والأسئلة اليومية بشكل طبيعي وعفوي، ولا تحوّل كل محادثة إلى بحث أكاديمي جاف.
- تذكّر سياق المحادثة السابقة عند الإجابة عن الأسئلة المتتابعة.

2. استعمال معلومات النادي:
- استعمل المعلومات الداخلية المرفقة أدناه لفهم الحقائق والتحقق منها داخلياً فقط.
- يُمنع منعاً باتاً ذكر الأرشيف أو ملفات PDF أو الوثائق أو قاعدة المعرفة في ردودك العادية، بما في ذلك عبارات مثل:
  «حسب الأرشيف»، «وفقًا للوثائق»، «حسب الملف»، «وجدت في الأرشيف»، «تشير الوثائق إلى»، «في السجلات»، أو أي تعبير مشابه.
- لا تعرض أبداً أرقام الصفحات أو أسماء الملفات أو تفاصيل استخراج المعلومات للمستخدم.
- عندما يسأل الطالب عن نشاط، أجب مباشرة عن اسمه وتاريخه ومكانه وتفاصيله المتاحة، بأسلوب محادثة طبيعي دافئ.
- مثال ممتاز: بدلًا من «حسب الأرشيف الرسمي للنادي، نشاط المشاركة في استقبال بابا الفاتيكان...»، قل: «إيه، شارك نادي كيمياء السعادة في استقبال بابا الفاتيكان بالجزائر يومي 12 و13 أفريل 2026، وكان النشاط في العاصمة 😊».
- لا تستخدم صيغة التقارير الرسمية إلا إذا طلب المستخدم تقريرًا أو توثيقًا رسميًا صراحةً.

3. الدقة والصدق:
- تحقّق داخليًا من المعلومات قبل الإجابة بالاعتماد على البيانات المرفقة.
- لا تخترع أحداثًا أو تواريخ أو أسماء أو معلومات غير مؤكدة.
- إذا لم تتوفر المعلومة، قل بشكل طبيعي: «ما عنديش معلومة مؤكدة على هذي النقطة، نقدر نعاونك في حاجة أخرى؟ 😊»
- إذا كانت المعلومات ناقصة، أجب بالجزء المؤكد فقط.
- لا تدّعِ أنك تحققت من مصادر خارجية أو من مصادر غير موجودة.
- رئيسة النادي الرسمية والمعتمدة عند التأسيس هي الطالبة «عقون سميرة» (Samira Aggoun)، ونائبة الرئيس «خياط إيناس»، وأمينة المكتب «عميرة آية»، والمشرف هو «الأستاذ ابن عيسى عاطف».
- شعار النادي: "Never Ever Settle".

المعلومات الداخلية للفهم والتحقق (لا تذكر اسم المصدر أو كلمة "أرشيف" للمستخدم):
${profileContext}

${relevantNotes.length > 0 ? 'ملاحظات داخلية:\n' + relevantNotes.join('\n') + '\n\n' : ''}
${contextFragments ? 'بيانات الأنشطة الداخلية:\n' + contextFragments : 'لا توجد أنشطة مطابقة مباشرة.'}
`;

        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const turn of history.slice(-6)) {
            contents.push({
              role: turn.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: turn.content }]
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.6,
            topP: 0.95
          }
        });

        let replyText = response.text || 'عذراً، ما قدرتش نتحصل على الإجابة درك، تقدر تعاود تسقسيني؟';

        // Post-processing guard to ensure no leakage of archive/PDF phrases in normal chat
        if (!isFormalReportRequest) {
          replyText = replyText
            .replace(/حسب الأرشيف( الرسمي)?( للنادي)?/g, 'كما نعرف')
            .replace(/وفق(اً|ا)? للوثائق( الرسمية)?/g, '')
            .replace(/حسب الملف(ات)?/g, '')
            .replace(/وجدت في الأرشيف/g, '')
            .replace(/تشير الوثائق إلى/g, '')
            .replace(/حسب قاعدة المعرفة/g, '')
            .replace(/\(ص\s*\d+\)/g, '')
            .replace(/\(الصفحة\s*\d+\)/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
        }

        return res.json({
          reply: replyText,
          sources: isFormalReportRequest ? matchedActivities.map(a => `${a.displayTitle} (${a.date})`) : [],
          mode: 'gemini-3.8-flash',
          matchedCount: matchedActivities.length
        });
      } catch (geminiError: any) {
        console.error('Gemini API call failed, falling back to grounded retriever:', geminiError?.message);
      }
    }

    // High quality deterministic grounded fallback
    const fallback = generateGroundedFallback(message, Array.isArray(history) ? history : []);
    return res.json({
      reply: fallback.text,
      sources: fallback.sources,
      mode: 'grounded-retriever-fallback',
      matchedCount: matchedActivities.length
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: 'حدث خطأ في معالجة السؤال',
      details: err?.message
    });
  }
});

// Text-to-Speech (TTS) Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'النص مطلوب للتوليد الصوتي' });
    }

    // If Gemini client available, generate speech with gemini-3.8-flash-lite-tts
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: text.slice(0, 400), // bounded size
                  speechMetadata: {
                    style: 'Warm, clear, and friendly Arabic companion'
                  }
                }
              ]
            }
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' }
              }
            }
          }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({
            audioUrl: `data:audio/wav;base64,${base64Audio}`,
            type: 'gemini-tts'
          });
        }
      } catch (ttsErr: any) {
        console.log('Gemini TTS fallback to browser speech synthesis:', ttsErr?.message);
      }
    }

    // Signal client to use Browser SpeechSynthesis with Arabic voice
    res.json({
      useBrowserSpeech: true,
      textToSpeak: text
    });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل التوليد الصوتي', details: err?.message });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Dev mode with Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Chemistry of Happiness Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
