import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Square, Trash2, Sparkles, BookOpen, AlertCircle, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RobotState } from './RobotMascot';
import { generateClientResponse } from '../utils/clientKnowledgeEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}

interface VoiceAssistantProps {
  onRobotStateChange: (state: RobotState) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

// Suggested questions directly for friendly peer chat
const SUGGESTED_QUESTIONS = [
  "واش هو نادي كيمياء السعادة؟",
  "كيفاش تأسس النادي وشكون هي رئيسته؟",
  "واش هي أهداف النادي؟",
  "احكيلي على أهم النشاطات اللي درتوها.",
  "واش هي الورشات اللي نظمتوها؟",
  "واش درتو في استقبال بابا الفاتيكان؟",
  "احكيلي على نشاط أرواح تسوثني.",
  "واش هي النشاطات البيئية تاعكم؟",
  "كيفاش نقدر نتواصل مع النادي؟"
];

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onRobotStateChange,
  isMuted,
  onToggleMute
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'سلام! واش راك؟ أنا «رفيق السعادة»، زميلك في نادي كيمياء السعادة بجامعة فرحات عباس سطيف 1. اسألني بالدارجة أو بالعربية على أي نشاط، ورشة، أو أي حاجة حاب تعرفها على النادي ونعاونك بكل فرح 😊',
      sources: [],
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition capability check
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ar-DZ'; // Algerian Arabic locale

        recognition.onstart = () => {
          setIsListening(true);
          setRecognitionError(null);
          onRobotStateChange('listening');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputQuery(transcript);
            handleSubmit(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          onRobotStateChange('idle');
          if (event.error === 'not-allowed') {
            setRecognitionError('لم يتم منح إذن الميكروفون في المتصفح. يمكنك تفعيله أو استخدام الكتابة النصية.');
          } else if (event.error === 'no-speech') {
            setRecognitionError('لم يتم رصد أي صوت، حاول مجدداً أو استعمل الكتابة.');
          } else {
            setRecognitionError(`تعذر التعرف على الصوت (${event.error})`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (!isProcessing && !isPlayingAudio) {
            onRobotStateChange('idle');
          }
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition initialization error:', e);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      stopAudioPlayback();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Audio Playback functions
  const stopAudioPlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    onRobotStateChange('idle');
  };

  const playSpeech = async (text: string) => {
    if (isMuted) return;
    stopAudioPlayback();

    try {
      setIsPlayingAudio(true);
      onRobotStateChange('speaking');

      // 1. Try server-side TTS
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const audio = new Audio(data.audioUrl);
          currentAudioRef.current = audio;
          audio.onended = () => {
            setIsPlayingAudio(false);
            onRobotStateChange('idle');
          };
          audio.onerror = () => {
            playBrowserSpeech(text);
          };
          await audio.play();
          return;
        }
      }

      // 2. Fallback to Browser SpeechSynthesis
      playBrowserSpeech(text);
    } catch (e) {
      console.warn('Speech playback error:', e);
      playBrowserSpeech(text);
    }
  };

  const playBrowserSpeech = (text: string) => {
    if (!('speechSynthesis' in window) || isMuted) {
      setIsPlayingAudio(false);
      onRobotStateChange('idle');
      return;
    }

    const cleanText = text.replace(/[*_#`[\]()]/g, ' ').replace(/\n+/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar')) || voices[0];
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    utterance.pitch = 1.02;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      onRobotStateChange('idle');
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      onRobotStateChange('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!speechSupported) {
      setRecognitionError('التعرف الصوتي غير مدعوم في متصفحك حالياً. يمكنك استخدام الكتابة النصية بكل سلاسة.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      onRobotStateChange('idle');
    } else {
      stopAudioPlayback();
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Failed to start recognition:', e);
      }
    }
  };

  // Submit Question
  const handleSubmit = async (queryToSubmit?: string) => {
    const text = (queryToSubmit || inputQuery).trim();
    if (!text || isProcessing) return;

    setInputQuery('');
    setRecognitionError(null);
    stopAudioPlayback();

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsProcessing(true);
    onRobotStateChange('processing');

    const historyPayload = newHistory.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    let botReply = '';
    let botSources: string[] = [];

    try {
      // 1. Attempt server chat API (Full-stack AI Studio mode)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload })
      });

      if (res.ok) {
        const data = await res.json();
        botReply = data.reply || '';
        botSources = Array.isArray(data.sources) ? data.sources : [];
      } else {
        // Non-200 (e.g. 404 on GitHub Pages static hosting): use Client Knowledge Engine
        const clientRes = generateClientResponse(text, historyPayload);
        botReply = clientRes.text;
        botSources = clientRes.sources;
      }
    } catch {
      // Offline / Static deployment on GitHub Pages: instant client-side knowledge engine
      const clientRes = generateClientResponse(text, historyPayload);
      botReply = clientRes.text;
      botSources = clientRes.sources;
    }

    if (!botReply) {
      const clientRes = generateClientResponse(text, historyPayload);
      botReply = clientRes.text;
      botSources = clientRes.sources;
    }

    const botMessage: Message = {
      id: 'msg-bot-' + Date.now(),
      role: 'assistant',
      content: botReply,
      sources: botSources,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMessage]);
    setIsProcessing(false);

    if (text.includes('أنشط نادي') || text.includes('تبسة') || text.includes('فائز')) {
      onRobotStateChange('happy');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.8 }, colors: ['#c5a059', '#e5c158', '#f7f2ea', '#96783c'] });
    }

    playSpeech(botReply);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    stopAudioPlayback();
    setMessages([
      {
        id: 'reset-' + Date.now(),
        role: 'assistant',
        content: 'أهلاً بيك من جديد! واش حاب تعرف على نادي كيمياء السعادة وأنشطتنا؟ أنا في الخدمة 😊',
        sources: [],
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-[#18100b]/90 border border-[#c5a059]/30 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Header Controls */}
      <div className="px-5 py-4 border-b border-[#c5a059]/25 flex items-center justify-between bg-[#120b08]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e5c158] animate-pulse shadow-sm shadow-[#e5c158]" />
          <h3 className="font-amiri font-bold text-[#f7f2ea] text-base md:text-lg flex items-center gap-2">
            محادثة رفيق السعادة
            <span className="text-[10px] font-sans text-[#e5c158] bg-[#2a1c13] border border-[#c5a059]/40 px-2 py-0.5 rounded-full font-bold">
              المساعد الطلابي الودود
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isPlayingAudio && (
            <button
              onClick={stopAudioPlayback}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 rounded-lg transition-all"
              title="إيقاف الصوت الحالي"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>إيقاف الصوت</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl transition-all border ${
              isMuted
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                : 'bg-[#261a13] text-[#e5c158] hover:bg-[#34241b] border-[#c5a059]/40'
            }`}
            title={isMuted ? 'تفعيل الصوت التلقائي' : 'كتم الصوت التلقائي'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={clearChat}
            className="p-2 text-[#d8c8b4] hover:text-rose-400 hover:bg-[#261a13] rounded-xl transition-all border border-transparent hover:border-[#c5a059]/30"
            title="مسح المحادثة والبدء من جديد"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recognition Error Banner */}
      {recognitionError && (
        <div className="mx-4 mt-3 p-3 bg-[#26150e] border border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-[#e5c158] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{recognitionError}</p>
          </div>
          <button
            onClick={() => setRecognitionError(null)}
            className="text-amber-400 hover:text-amber-200 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Conversation Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[88%] md:max-w-[82%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-[#96783c] via-[#b8934a] to-[#c5a059] text-[#120b08] font-medium rounded-br-none'
                    : 'bg-[#221610]/95 border border-[#c5a059]/30 text-[#f7f2ea] rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Sources citations for assistant replies when formally provided */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#c5a059]/20 flex flex-wrap items-center gap-1.5 text-xs text-[#e5c158] font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span className="text-[#d8c8b4]">المراجع المعتمدة:</span>
                    {msg.sources.map((src, idx) => (
                      <span key={idx} className="bg-[#140d09] px-2 py-0.5 rounded-md border border-[#c5a059]/30 text-[11px]">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Message metadata */}
              <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-[#9c8974]">
                <span>{msg.timestamp}</span>
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  className="opacity-0 group-hover:opacity-100 hover:text-[#e5c158] transition-opacity"
                  title="نسخ النص"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-3 bg-[#221610]/80 border border-[#c5a059]/30 px-4 py-3 rounded-2xl max-w-[70%]">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e5c158] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#e5c158] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#e5c158] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-[#e5c158]">رفيق السعادة يكتب لك...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-4 py-2 border-t border-[#c5a059]/20 bg-[#120b08]/50 overflow-x-auto scrollbar-none flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#e5c158] shrink-0" />
        <span className="text-xs text-[#c5a059] shrink-0 font-bold">أسئلة مقترحة:</span>
        <div className="flex gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(q)}
              className="text-xs whitespace-nowrap bg-[#241710] hover:bg-[#34241b] hover:text-[#e5c158] text-[#d8c8b4] px-3 py-1 rounded-full border border-[#c5a059]/30 hover:border-[#c5a059]/70 transition-all cursor-pointer font-arabic-body"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-[#c5a059]/25 bg-[#140d09]/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl transition-all shadow-lg flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40 ring-4 ring-rose-600/20'
                : speechSupported
                ? 'bg-[#2a1c13] hover:bg-[#38261b] text-[#e5c158] border border-[#c5a059]/50 hover:border-[#e5c158]'
                : 'bg-[#1c130e] text-[#6b5847] cursor-not-allowed border border-[#34241b]'
            }`}
            title={
              isListening
                ? 'جاري الاستماع... انقر للإيقاف'
                : speechSupported
                ? 'تحدث بالصوت (دارجة جزائرية أو عربية)'
                : 'التعرف الصوتي غير مدعوم في هذا المتصفح'
            }
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isListening ? 'تحدث الآن، جاري الاستماع...' : 'اكتب سؤالك بالدارجة أو العربية... (مثال: احكيلي على ورشة AI 2)'}
            disabled={isProcessing}
            className="flex-1 bg-[#1a110b] border border-[#c5a059]/30 rounded-2xl px-4 py-3 text-sm text-[#f7f2ea] placeholder-[#8c7762] focus:outline-none focus:ring-2 focus:ring-[#c5a059]/50 focus:border-[#c5a059] transition-all font-arabic-body"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="p-3 bg-gradient-to-r from-[#b8934a] to-[#c5a059] hover:from-[#c5a059] hover:to-[#e5c158] disabled:opacity-40 disabled:cursor-not-allowed text-[#140d09] font-bold rounded-2xl transition-all shadow-md shadow-[#c5a059]/20 shrink-0"
            title="إرسال السؤال"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>

        {/* Real Status footnote */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#9c8974] px-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${speechSupported ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{speechSupported ? 'التعرف الصوتي متاح (Web Speech)' : 'التعرف الصوتي غير متوفر (يُتاح النص)'}</span>
          </div>
          <div>
            <span className="font-cinzel text-[#c5a059]">Never Ever Settle</span>
          </div>
        </div>
      </div>
    </div>
  );
};
