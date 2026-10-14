/**
 * Client-Side Knowledge Engine for Rafiq Al-Saada (رفيق السعادة)
 * Powers instant 0ms responses on GitHub Pages and static deployments
 * 100% Offline, no external server or API keys required.
 */
import { ACTIVITIES_REGISTRY, OFFICIAL_CLUB_PROFILE, ActivityRecord } from '../data/clubData';

export interface ChatReply {
  text: string;
  sources: string[];
}

// Local Search algorithm across all 49 activities and official club profile
export function searchClientKnowledgeBase(query: string, limit = 5): {
  matchedActivities: ActivityRecord[];
  relevantNotes: string[];
} {
  const q = query.toLowerCase().trim();
  const normalizedQ = q
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/[ةه]/g, 'ه');

  const terms = normalizedQ.split(/\s+/).filter(t => t.length > 1);

  const scored = ACTIVITIES_REGISTRY.map(act => {
    let score = 0;
    const normTitle = act.displayTitle.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
    const normRaw = act.rawTitle.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
    const normDesc = act.fullDescription.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/[ةه]/g, 'ه');
    const presenters = act.supervisorsAndPresenters.join(' ').toLowerCase();
    const aliases = act.aliases.join(' ').toLowerCase();

    if (normTitle.includes(normalizedQ) || normRaw.includes(normalizedQ)) score += 15;
    if (normDesc.includes(normalizedQ)) score += 8;

    for (const term of terms) {
      if (normTitle.includes(term)) score += 6;
      if (normRaw.includes(term)) score += 4;
      if (normDesc.includes(term)) score += 3;
      if (presenters.includes(term)) score += 5;
      if (aliases.includes(term)) score += 6;
    }

    if (q.includes(act.year.toString())) score += 2;

    return { act, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter(s => s.score > 0).slice(0, limit).map(s => s.act);

  const notes: string[] = [];
  if (normalizedQ.includes('تاسيس') || normalizedQ.includes('رئيس') || normalizedQ.includes('سميره') || normalizedQ.includes('عقون')) {
    notes.push(OFFICIAL_CLUB_PROFILE.discrepancyNotes);
  }
  if (normalizedQ.includes('هدف') || normalizedQ.includes('اهداف')) {
    notes.push('أهداف النادي: ' + OFFICIAL_CLUB_PROFILE.objectives.join(' | '));
  }
  if (normalizedQ.includes('اسم') || normalizedQ.includes('غزالي') || normalizedQ.includes('كيمياء السعاده')) {
    notes.push('سبب التسمية: ' + OFFICIAL_CLUB_PROFILE.namePhilosophy);
  }
  if (normalizedQ.includes('تواصل') || normalizedQ.includes('ايميل') || normalizedQ.includes('انستغرام') || normalizedQ.includes('فيسبوك')) {
    notes.push(`قنوات التواصل: البريد: ${OFFICIAL_CLUB_PROFILE.contact.email} | إنستغرام: ${OFFICIAL_CLUB_PROFILE.contact.instagram}`);
  }

  return { matchedActivities: matched, relevantNotes: notes };
}

/**
 * Generate warm, human, conversational peer responses in Algerian Darija/Arabic
 * Following strict guidelines:
 * - Friendly university peer tone
 * - No mentioning the archive, documents, or PDF files
 * - Truthful and accurate facts based on official data
 */
export function generateClientResponse(
  query: string,
  history: Array<{ role: string; content: string }> = []
): ChatReply {
  const q = query.toLowerCase().trim();
  const qNorm = q
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/[ةه]/g, 'ه');

  const { matchedActivities } = searchClientKnowledgeBase(query, 4);

  // 1. Check for conversation follow-up context
  let lastMentionedActivity: ActivityRecord | null = null;
  if (history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const prevText = history[i].content;
      const found = ACTIVITIES_REGISTRY.find(a => prevText.includes(a.displayTitle) || prevText.includes(a.rawTitle));
      if (found) {
        lastMentionedActivity = found;
        break;
      }
    }
  }

  // Follow-up context queries (e.g. "وين دارو النشاط؟", "وقتاش كان؟", "شكون قدمها؟")
  if (lastMentionedActivity) {
    if (qNorm.includes('وين') || qNorm.includes('مكان') || qNorm.includes('اين')) {
      return {
        text: `نشاط "${lastMentionedActivity.displayTitle}" أقيم في ${lastMentionedActivity.location} بتاريخ ${lastMentionedActivity.date} 😊.`,
        sources: []
      };
    }
    if (qNorm.includes('وقتاش') || qNorm.includes('متى') || qNorm.includes('تاريخ')) {
      return {
        text: `نشاط "${lastMentionedActivity.displayTitle}" كان يوم ${lastMentionedActivity.date} في ${lastMentionedActivity.location}.`,
        sources: []
      };
    }
    if (qNorm.includes('شكون قدم') || qNorm.includes('شكون اثر') || qNorm.includes('المؤطر') || qNorm.includes('من قدم')) {
      const pres = lastMentionedActivity.supervisorsAndPresenters.length > 0
        ? lastMentionedActivity.supervisorsAndPresenters.join(' و ')
        : 'أعضاء النادي المتميزين';
      return {
        text: `نشاط "${lastMentionedActivity.displayTitle}" أطرو وقدمو ${pres}.`,
        sources: []
      };
    }
  }

  // 2. Greetings and casual friendly conversation
  const greetings = ['السلام عليكم', 'سلام', 'صباح الخير', 'مساء الخير', 'أهلا', 'اهلين', 'مرحبا', 'واش راك', 'كاش جديد', 'hello', 'hi', 'coucou'];
  if (greetings.some(g => q.includes(g)) && q.length < 35) {
    return {
      text: 'وعليكم السلام ورحمة الله! أهلاً بيك زميلي، واش راك؟ أنا رفيق السعادة، في واش نقدر نعاونك اليوم بخصوص نادي كيمياء السعادة وأنشطتنا؟ 😊',
      sources: []
    };
  }

  // 3. Humor / Daily friendly remarks
  if (qNorm.includes('شكرا') || qNorm.includes('يعطيك الصحه') || qNorm.includes('صحيت') || qNorm.includes('merci')) {
    return {
      text: 'بلا مزية زميلي! أنا هنا دايماً في الخدمة، ربي يوفقك في قرايتك وفي مسيرتك الجامعية 💚.',
      sources: []
    };
  }

  if (qNorm.includes('شكون انت') || qNorm.includes('شكون راك') || qNorm.includes('عرف بنفسك')) {
    return {
      text: 'أنا «رفيق السعادة»، المساعد الطلابي الودود لنادي كيمياء السعادة بجامعة سطيف 1. نجاوبك ونعاونك تتعرف على كل أنشطتنا، ورشاتنا، وناس النادي بكل عفوية وصدق 😊.',
      sources: []
    };
  }

  // 4. Founding, President & Supervisors
  if (qNorm.includes('رئيس') || qNorm.includes('شكون وراء') || (qNorm.includes('تاسس') && (qNorm.includes('شكون') || qNorm.includes('كيفاش')))) {
    return {
      text: `تأسس نادي كيمياء السعادة يوم 21 أبريل 2024 بجامعة فرحات عباس سطيف 1 تحت إشراف الأستاذ ابن عيسى عاطف، ورئيسة النادي الرسمية والمعتمدة هي الطالبة عقون سميرة، ومعاها خياط إيناس كنائبة رئيس وعميرة آية كأمينة للمكتب ✨.`,
      sources: []
    };
  }

  if (qNorm.includes('مشرف') || qNorm.includes('استاذ النادي') || qNorm.includes('عاطف')) {
    return {
      text: `المشرف على نادي كيمياء السعادة هو الأستاذ ابن عيسى عاطف، وهو اللي يرافق الطلبة ويأطر الورشات والأنشطة العلمية بالجامعة 😊.`,
      sources: []
    };
  }

  // 5. Specific Pope Visit Activity
  if (qNorm.includes('بابا') || qNorm.includes('فاتيكان')) {
    return {
      text: 'إيه، شارك نادي كيمياء السعادة في استقبال بابا الفاتيكان بالجزائر يومي 12 و13 أفريل 2026، وكان النشاط في العاصمة ضمن المشاركات الوطنية المتميزة للنادي 😊.',
      sources: []
    };
  }

  // 6. National AI Robot competition in Tebessa & Best Club Award
  if (qNorm.includes('تبسه') || qNorm.includes('مسابقه') || qNorm.includes('انشط نادي') || qNorm.includes('جائزه') || qNorm.includes('روبوت')) {
    return {
      text: 'نادي كيمياء السعادة فاز في المسابقة الوطنية للنوادي العلمية بتبسة بمشروع الروبوت المكتبي الذكي، وتُوّج أيضاً بلقب «أنشط نادٍ بجامعة فرحات عباس سطيف 1» في يوم الطالب 19 ماي 2026 🏆🎉!',
      sources: []
    };
  }

  // 7. 2026 Activities
  if (q.includes('2026') && (qNorm.includes('نشاط') || qNorm.includes('انشط') || qNorm.includes('واش دار') || qNorm.includes('واش كاين'))) {
    return {
      text: 'في عام 2026 النادي دار 17 نشاطاً رائعاً! من أبرزها:\n• معرض التنوع الثقافي "وجعلناكم شعوباً وقبائل لتعارفوا".\n• حملة التشجير الوطنية بالموان (غرس 5 ملايين شجرة).\n• ورشة الذكاء الاصطناعي 2 حول نماذج LLM والوكلاء الأذكياء، وورشة الإلكترونيات 2، وورشة PowerPoint.\n• المشاركة في استقبال بابا الفاتيكان بالجزائر العاصمة.\n• الفوز في المسابقة الوطنية للنوادي العلمية بتبسة، والتتويج بلقب «أنشط نادٍ بسطيف 1» 🏆!',
      sources: []
    };
  }

  // 8. 2024 Activities
  if (q.includes('2024') && (qNorm.includes('نشاط') || qNorm.includes('انشط') || qNorm.includes('واش دار'))) {
    return {
      text: 'في 2024، تأسس النادي في 21 أبريل، ومن أهم النشاطات اللي نظمناها:\n• أول نشاط "أرواح تسوثني" للتدريب على مناقشة المذكرات.\n• حملة النظافة "بيك وبيا جامعتنا تبقى نقية 1".\n• نشاط "كن طالب" في اليوم العالمي لعدد أفوغادرو.\n• تكريم عمال الجامعة، وندوة "من الفكرة إلى التخرج"، ومحاضرة "واش ندير بقرايتي" مع د. بن توهامي دحمان.',
      sources: []
    };
  }

  // 9. 2025 Activities
  if (q.includes('2025') && (qNorm.includes('نشاط') || qNorm.includes('انشط') || qNorm.includes('واش دار'))) {
    return {
      text: 'في 2025 كان كاين 23 نشاطاً كبيراً، منها:\n• نشاط "صندوق السعادة" وشجرة البصمات.\n• ورشات الذكاء الاصطناعي 1، الأردوينو 1 و2، الإلكترونيات التطبيقية، والمونتاج 1 و2.\n• نشاط "استوقفتني آية" في رمضان، وحملة التشجير مع والي سطيف، وزيارة مكتب الدراسات CEERI.',
      sources: []
    };
  }

  // 10. General Activities summary
  if (qNorm.includes('انشطتنا') || (qNorm.includes('نشاط') && (qNorm.includes('احكيلي') || qNorm.includes('واش هوما') || qNorm.includes('واش درتو')))) {
    return {
      text: 'نادي كيمياء السعادة عندو 49 نشاطاً مسجلاً من 2024 حتى 2026 تشمل ورشات علمية وتكنولوجية، مبادرات بيئية وتشجير، زيارات ميدانية، ومسابقات وطنية واستقبال للطلبة الجدد. واش من مجال تحب نحكي لك عليه بالتفصيل؟ 😊',
      sources: []
    };
  }

  // 11. Club identity & Overview
  if (qNorm.includes('واش هو') || qNorm.includes('شكون نتوما') || qNorm.includes('من نحن') || qNorm.includes('تعريف')) {
    return {
      text: `نادي كيمياء السعادة هو نادٍ علمي ثقافي بجامعة فرحات عباس سطيف 1، تأسس في 21 أبريل 2024 برئاسة الطالبة عقون سميرة وتحت إشراف الأستاذ ابن عيسى عاطف. هدفنا مساعدة الطلبة وتطوير مهاراتهم، وشعارنا الدائم هو: "${OFFICIAL_CLUB_PROFILE.motto}" ✨.`,
      sources: []
    };
  }

  // 12. Ghazali Philosophy
  if (qNorm.includes('اسم') || qNorm.includes('غزالي') || qNorm.includes('علاش كيمياء') || qNorm.includes('فلسف')) {
    return {
      text: 'اسم نادينا مستوحى من كتاب "كيمياء السعادة" للإمام أبو حامد الغزالي، اللي شبه فيه السعادة الحقيقية بكيمياء باطنية تحول القلب من الجهل إلى النور ومن القلق إلى الطمأنينة عبر العلم والعمل الصالح، وحنا أخذنا هذي الفلسفة لتطوير الذات والنجاح الدراسي والإنساني في الجامعة 💚.',
      sources: []
    };
  }

  // 13. Contact
  if (qNorm.includes('تواصل') || qNorm.includes('اتصال') || qNorm.includes('ايميل') || qNorm.includes('انستغرام') || qNorm.includes('فيسبوك')) {
    return {
      text: `تقدر تتواصل مع النادي مباشرة عبر:\n📧 البريد: ${OFFICIAL_CLUB_PROFILE.contact.email}\n📸 إنستغرام: @${OFFICIAL_CLUB_PROFILE.contact.instagram}\n📘 فيسبوك: ${OFFICIAL_CLUB_PROFILE.contact.facebook}\n📍 ومقرنا في جامعة سطيف 1 (مجمع الباز)، مرحباً بيك في أي وقت!`,
      sources: []
    };
  }

  // 14. Workshops
  if (qNorm.includes('ورشات') || qNorm.includes('ورشه') || qNorm.includes('تكوين') || qNorm.includes('اردوينو') || qNorm.includes('الكترونيات')) {
    return {
      text: 'نظمنا ورشات تطبيقية رائعة:\n• ورشات الذكاء الاصطناعي (AI 1 في 2025 وAI 2 في 2026 حول نماذج LLM والوكلاء الأذكياء مع الأستاذ المشرف).\n• ورشات الأردوينو 1 و2 مع الطالب أمين بلعطاش.\n• ورشات الإلكترونيات الأساسية والتطبيقية.\n• ورشات المونتاج والتصميم مع أنيس لعجال وهديل عياد، وورشة PowerPoint، وSpeaking Class في Mercia School. واش من ورشة تحب تعرف تفاصيلها؟',
      sources: []
    };
  }

  // 15. Match specific activity if found
  if (matchedActivities.length > 0) {
    const act = matchedActivities[0];
    const pres = act.supervisorsAndPresenters.length > 0 ? ` بتأطير ${act.supervisorsAndPresenters.join(' و ')}` : '';
    const loc = act.location ? ` في ${act.location}` : '';
    return {
      text: `إيه، نشاط "${act.displayTitle}" أقيم يوم ${act.date}${loc}${pres}.\n\n${act.shortSummary || act.fullDescription} 😊`,
      sources: []
    };
  }

  // 16. Polite, honest friendly fallback
  return {
    text: 'ما عنديش معلومة مؤكدة على هذي النقطة، نقدر نعاونك في حاجة أخرى بخصوص أنشطة النادي أو ورشاتو؟ 😊',
    sources: []
  };
}
