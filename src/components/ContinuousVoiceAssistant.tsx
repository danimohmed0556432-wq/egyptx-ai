'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';



export default function ContinuousVoiceAssistant() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechPauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTranscriptRef = useRef<string>('');
  const isRecognitionActiveRef = useRef<boolean>(false);
  const lastCmdTime = useRef<number>(0);
  const lastCmdKeyRef = useRef<string>('');
  const lastAiTranscriptRef = useRef<string>('');
  const lastAiTimeRef = useRef<number>(0);
  const aiInFlightRef = useRef<boolean>(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const [isListeningUI, setIsListeningUI] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [micLangOverride, setMicLangOverride] = useState<'auto' | 'ar-EG' | 'en-US'>('auto');
  const micLangOverrideRef = useRef<'auto' | 'ar-EG' | 'en-US'>('auto');
  const localeRef = useRef<string>(locale || 'en');

  useEffect(() => {
    localeRef.current = locale || 'en';
  }, [locale]);

  useEffect(() => {
    micLangOverrideRef.current = micLangOverride;
  }, [micLangOverride]);

  const showToast = (message: string) => {
    if (!message) return;
    setStatusToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setStatusToast(null);
    }, 4500);
  };

  const speakConfirmation = (text: string) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const isAr = /[\u0600-\u06FF]/.test(text);
      utterance.lang = isAr ? 'ar-SA' : 'en-US';
      const voices = synth.getVoices();
      const langPrefix = isAr ? 'ar' : 'en';
      const preferred =
        voices.find(
          (v) =>
            v.lang.toLowerCase().includes(langPrefix) &&
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online'))
        ) || voices.find((v) => v.lang.toLowerCase().includes(langPrefix));
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.05;
      synth.speak(utterance);
    } catch {
      // Ignore TTS errors
    }
  };

  // ── 1. DYNAMIC MULTILINGUAL RECOGNITION (The "Ears") ──
  const updateRecognitionLanguage = () => {
    if (micLangOverrideRef.current !== 'auto') {
      return micLangOverrideRef.current;
    }
    const activeLang = (
      localeRef.current ||
      (typeof document !== 'undefined' ? document.documentElement.lang : '') ||
      'en'
    ).toLowerCase();
    const langMap: Record<string, string> = {
      ar: 'ar-EG',
      en: 'en-US',
      fr: 'fr-FR',
      de: 'de-DE',
      it: 'it-IT',
      es: 'es-ES',
      zh: 'zh-CN',
      ru: 'ru-RU',
    };
    const prefix = activeLang.slice(0, 2);
    return langMap[prefix] || 'en-US';
  };

  // Helper for restarting recognition cleanly without overlapping instances
  const startRecognition = () => {
    if (!isListeningRef.current || !recognitionRef.current) return;
    if (isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      isRecognitionActiveRef.current = false;
    }
    try {
      recognitionRef.current.lang = updateRecognitionLanguage();
      recognitionRef.current.start();
    } catch {
      // Ignore if already active
    }
  };



  // Trilingual TTS Greeting before starting mic (Premium Voice Selection & Arabic Fallback)
  const playGreeting = (): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      const synth = window.speechSynthesis;
      synth.cancel();

      let hasResolved = false;
      const safeResolve = () => {
        if (!hasResolved) {
          hasResolved = true;
          resolve();
        }
      };

      const speak = () => {
        const voices = synth.getVoices();
        const htmlLang = (typeof document !== 'undefined' && document.documentElement.lang?.toLowerCase()) || 'en';
        const utterance = new SpeechSynthesisUtterance();

        // Helper to find the most modern, natural-sounding AI voice available
        const getPremiumVoice = (langCode: string) => {
          const available = voices.filter(v => v.lang.toLowerCase().includes(langCode));
          if (!available.length) return null;
          // Prioritize Neural, Online, Google, or Apple Siri voices for that modern AI feel
          return (
            available.find(v => 
              v.name.includes('Natural') || 
              v.name.includes('Online') || 
              v.name.includes('Google') || 
              v.name.includes('Siri')
            ) || available[0]
          );
        };

        if (htmlLang.includes('ar')) {
          // Phonetic spelling so the Arabic TTS pronounces "EgyptX AI" correctly and elegantly
          utterance.text = "مرحباً بك في إيجيبت إكس إيه آي، كيف يمكنني مساعدتك اليوم؟";
          utterance.lang = 'ar-SA';
          utterance.voice = getPremiumVoice('ar');
        } else if (htmlLang.includes('fr')) {
          utterance.text = "Bienvenue sur EgyptX AI, comment puis-je vous aider aujourd'hui ?";
          utterance.lang = 'fr-FR';
          utterance.voice = getPremiumVoice('fr');
        } else {
          // Spaced out so English TTS pronounces A-I as letters, not a word
          utterance.text = "Welcome to Egypt X A. I., how can I help you today?";
          utterance.lang = 'en-US';
          utterance.voice = getPremiumVoice('en');
        }

        // If no voice is found for the language (e.g., Arabic missing from OS), resolve immediately to prevent freezing
        if (htmlLang.includes('ar') && !utterance.voice) {
          console.warn("Arabic TTS voice not found on this device.");
          safeResolve();
          return;
        }

        utterance.rate = 1.05; // Slightly faster for a snappier, modern feel
        utterance.pitch = 1.1; // Slightly higher pitch for a friendlier tone

        utterance.onend = safeResolve;
        utterance.onerror = safeResolve;
        synth.speak(utterance);
      };

      if (synth.getVoices().length > 0) {
        speak();
      } else {
        synth.onvoiceschanged = speak;
        setTimeout(safeResolve, 800); // Safety fallback
      }
    });
  };

  // Central activation and deactivation with single-speaker noise isolation
  const activateAssistant = async () => {
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      isRecognitionActiveRef.current = false;
    }
    isListeningRef.current = true;
    setIsListeningUI(true);
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }
    } catch {
      // Fall back to SpeechRecognition default mic if getUserMedia is restricted
    }
    await playGreeting();
    if (isListeningRef.current) {
      startRecognition();
    }
  };

  const deactivateAssistant = () => {
    isListeningRef.current = false;
    isRecognitionActiveRef.current = false;
    setIsListeningUI(false);
    setLiveTranscript('');
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (speechPauseTimerRef.current) clearTimeout(speechPauseTimerRef.current);
    pendingTranscriptRef.current = '';
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // ── TEXT NORMALIZATION HELPER ──
  const normalizeText = (text: string): string => {
    if (!text) return '';
    let normalized = text.toLowerCase().trim();

    // 1. Replace ['أ','إ','آ'] with 'ا'
    normalized = normalized.replace(/[أإآ]/g, 'ا');

    // 2. Replace 'ة' with 'ه', and 'ى' with 'ي'
    normalized = normalized.replace(/ة/g, 'ه').replace(/ى/g, 'ي');

    // 3. Remove Arabic diacritics / tashkeel
    normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, '');

    // 4. Remove 'ال' prefix from words
    normalized = normalized.replace(/(^|\s)ال/g, '$1');

    // 5. Trim spaces and punctuation
    normalized = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()؟?،!]/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  };

  type VoiceAction = {
    type: string;
    path?: string;
    menu?: string;
    fieldHint?: string;
    value?: string;
    label?: string;
    code?: string;
    mode?: string;
    direction?: string;
  };

  const BILINGUAL_ALIASES: Record<string, string[]> = {
    luxor: ['luxor', 'الأقصر', 'الاقصر', 'اقصر'],
    aswan: ['aswan', 'أسوان', 'اسوان'],
    cairo: ['cairo', 'القاهرة', 'القاهره', 'قاهره'],
    giza: ['giza', 'الجيزة', 'الجيزه', 'جيزه'],
    alexandria: ['alexandria', 'alex', 'الإسكندرية', 'الاسكندرية', 'اسكندرية', 'اسكندريه'],
    sharm: ['sharm', 'sharm el sheikh', 'شرم الشيخ', 'شرم'],
    hurghada: ['hurghada', 'الغردقة', 'الغردقه'],
    siwa: ['siwa', 'سيوة', 'سيوه'],
    next: ['next', 'continue', 'التالي', 'التالى', 'استمرار'],
    generate: ['generate', 'create', 'plan', 'إنشاء', 'انشاء', 'توليد', 'اصنع', 'خطط'],
    'find route': ['find route', 'get route', 'navigate', 'ابحث عن المسار', 'إيجاد المسار', 'ايجاد المسار', 'احسب المسار'],
    identify: ['identify', 'scan', 'analyze', 'تعرف', 'تحليل', 'افحص'],
    'start call': ['start call', 'call', 'ابدأ المكالمة', 'ابدا المكالمة', 'اتصل'],
    solo: ['solo', 'فردي', 'وحدي', 'سولو'],
    couple: ['couple', 'زوجين', 'رومانسي'],
    family: ['family', 'عائلة', 'عائلي', 'اسرة'],
    group: ['group', 'مجموعة', 'مجموعه', 'اصدقاء'],
  };

  const sleepMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const isElementVisible = (el: HTMLElement): boolean => {
    if (el.closest('[data-voice-ui="true"]')) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const collectVisibleElements = () => {
    if (typeof document === 'undefined') return [];
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(
        'input, textarea, select, button, [role="button"], [role="tab"], [role="option"]'
      )
    ).filter(isElementVisible);

    return els.slice(0, 45).map((el) => {
      const inp = el as HTMLInputElement;
      const labelText =
        el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent?.trim();
      return {
        tag: el.tagName.toLowerCase(),
        type: inp.type || undefined,
        name: inp.name || undefined,
        id: el.id || undefined,
        placeholder: inp.placeholder || undefined,
        ariaLabel: el.getAttribute('aria-label') || undefined,
        label: labelText || undefined,
        text: el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 60) || undefined,
      };
    });
  };

  const setReactInputValue = (el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    const proto =
      el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(el, value);
    } else {
      el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const executeFillInput = (fieldHint: string, value: string): boolean => {
    const hint = (fieldHint || '').toLowerCase();
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
    ).filter((el) => {
      const inp = el as HTMLInputElement;
      if (inp.type === 'hidden' || inp.type === 'checkbox' || inp.type === 'radio' || inp.type === 'file') {
        return false;
      }
      return isElementVisible(el);
    });
    if (!inputs.length) return false;

    const getMeta = (el: HTMLInputElement | HTMLTextAreaElement) => {
      const inp = el as HTMLInputElement;
      const assocLabel =
        el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent;
      const parentLabel = el.closest('label')?.textContent;
      return [
        inp.type,
        inp.name,
        el.id,
        inp.placeholder,
        el.getAttribute('aria-label'),
        assocLabel,
        parentLabel,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    };

    let target: HTMLInputElement | HTMLTextAreaElement | undefined;

    if (hint === 'startdate' || hint === 'enddate' || /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const dateInputs = inputs.filter((el) => (el as HTMLInputElement).type === 'date');
      if (dateInputs.length > 0) {
        if (hint === 'enddate' && dateInputs.length > 1) {
          target = dateInputs[1];
        } else if (hint === 'startdate') {
          target = dateInputs[0];
        } else {
          target = dateInputs.find((el) => getMeta(el).includes(hint)) || dateInputs[0];
        }
      }
    }

    if (!target) {
      const hintKeywords: Record<string, string[]> = {
        startdate: ['start', 'from', 'checkin', 'check-in', 'بداية', 'من', 'وصول'],
        enddate: ['end', 'to', 'checkout', 'check-out', 'نهاية', 'إلى', 'مغادرة'],
        budget: ['budget', 'price', 'cost', 'money', 'ميزانية', 'ميزانيه', 'تكلفة', '500', '$'],
        travelers: ['traveler', 'guest', 'person', 'people', 'مسافر', 'أشخاص', 'افراد'],
        destination: ['destination', 'city', 'place', 'to', 'where', 'وجهة', 'مدينة', 'مكان', 'أين'],
        search: ['search', 'query', 'find', 'where', 'destination', 'بحث', 'ابحث', 'أين'],
        chat: ['message', 'ask', 'chat', 'type', 'رسالة', 'اسأل', 'دردشة'],
      };
      const keys = hintKeywords[hint] || [hint];
      target =
        inputs.find((el) => {
          const meta = getMeta(el);
          return keys.some((k) => meta.includes(k));
        }) ||
        (hint === 'search' || hint === 'destination' || hint === 'chat'
          ? inputs.find((el) => (el as HTMLInputElement).type === 'text' || (el as HTMLInputElement).type === 'search' || el.tagName === 'TEXTAREA')
          : undefined);
    }

    if (!target) return false;
    target.focus();
    setReactInputValue(target, value);
    return true;
  };

  const executeSelectOrClick = (label: string): boolean => {
    const rawLabel = (label || '').trim();
    if (!rawLabel) return false;
    const normLabel = normalizeText(rawLabel);

    const expandedTargets = new Set<string>([normLabel, rawLabel.toLowerCase()]);
    for (const [key, aliases] of Object.entries(BILINGUAL_ALIASES)) {
      if (
        normLabel === key ||
        aliases.some((a) => normalizeText(a) === normLabel || normLabel.includes(normalizeText(a)))
      ) {
        aliases.forEach((a) => expandedTargets.add(normalizeText(a)));
      }
    }

    // 1. Check <select> elements for matching <option>
    const selects = Array.from(document.querySelectorAll<HTMLSelectElement>('select')).filter(isElementVisible);
    for (const sel of selects) {
      const opt = Array.from(sel.options).find((o) => {
        const oNorm = normalizeText(o.textContent || o.value || '');
        return Array.from(expandedTargets).some((t) => oNorm && (oNorm === t || oNorm.includes(t)));
      });
      if (opt) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
        if (setter) setter.call(sel, opt.value);
        else sel.value = opt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    // 2. Match visible clickable elements
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, a, [role="button"], [role="tab"], [role="option"], label, div.cursor-pointer, span.cursor-pointer'
      )
    ).filter(isElementVisible);

    let bestMatch: HTMLElement | null = null;
    let bestScore = 0;

    for (const el of candidates) {
      const text =
        el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        el.textContent ||
        '';
      const elNorm = normalizeText(text);
      if (!elNorm) continue;

      for (const t of expandedTargets) {
        if (!t) continue;
        if (elNorm === t) {
          bestMatch = el;
          bestScore = 3;
          break;
        }
        if (elNorm.includes(t) && bestScore < 2) {
          bestMatch = el;
          bestScore = 2;
        }
      }
      if (bestScore === 3) break;
    }

    if (!bestMatch) return false;
    bestMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    bestMatch.focus();
    bestMatch.dispatchEvent(
      new MouseEvent('click', { view: window, bubbles: true, cancelable: true, buttons: 1 })
    );
    try {
      bestMatch.click();
    } catch {}
    return true;
  };

  const normalizeNavPath = (path: string): string => {
    const p = (path || '/').trim().toLowerCase();
    const aliasMap: Record<string, string> = {
      '/smart-navigator': '/navigator',
      '/vision-guide': '/ai-guide',
      '/concierge': '/bookings',
      '/egypt-life': '/news',
      '/kids-mode': '/kids',
      '/ai-planner': '/planner',
      '/hieroglyph': '/hieroglyph-scanner',
      '/vr': '/vr-egypt',
    };
    return aliasMap[p] || p;
  };

  const executeAiActions = async (actions: VoiceAction[], reply: string) => {
    const executedSummary: string[] = [];

    for (const action of actions) {
      const type = String(action.type || '').toUpperCase();
      if (type === 'NAVIGATE' && action.path) {
        const targetPath = normalizeNavPath(action.path);
        router.push(targetPath);
        executedSummary.push(`Opened ${targetPath}`);
        await sleepMs(650);
        continue;
      }

      if (type === 'OPEN_MENU' && action.menu) {
        const menuKey = action.menu.toLowerCase();
        window.dispatchEvent(new CustomEvent('egyptx:open-nav-menu', { detail: { menu: menuKey } }));
        executedSummary.push(`Menu: ${menuKey}`);
      } else if (type === 'FILL_INPUT' && action.value !== undefined) {
        const ok = executeFillInput(action.fieldHint || 'search', String(action.value));
        if (ok) executedSummary.push(`Set ${action.fieldHint || 'field'}: ${action.value}`);
      } else if (type === 'SELECT_OPTION' && action.label) {
        const ok = executeSelectOrClick(action.label);
        if (ok) executedSummary.push(`Selected ${action.label}`);
      } else if (type === 'CLICK_BUTTON' && action.label) {
        const ok = executeSelectOrClick(action.label);
        if (ok) executedSummary.push(`Clicked ${action.label}`);
      } else if (type === 'SET_LANGUAGE' && action.code) {
        setLocale(action.code.toLowerCase());
        executedSummary.push(`Language: ${action.code.toUpperCase()}`);
      } else if (type === 'SET_THEME' && action.mode) {
        const wantDark = action.mode.toLowerCase() === 'dark';
        document.documentElement.classList.toggle('dark', wantDark);
        try {
          localStorage.setItem('theme', wantDark ? 'dark' : 'light');
        } catch {}
        executedSummary.push(`Theme: ${wantDark ? 'Dark' : 'Light'}`);
      } else if (type === 'SCROLL' && action.direction) {
        const dir = action.direction.toLowerCase();
        if (dir === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
        else if (dir === 'up') window.scrollBy({ top: -700, behavior: 'smooth' });
        else window.scrollBy({ top: 700, behavior: 'smooth' });
        executedSummary.push(`Scrolled ${dir}`);
      }

      await sleepMs(400);
    }

    const toastText =
      executedSummary.length > 0
        ? `Executed: ${executedSummary.join(', ')}`
        : reply || 'Command processed';
    showToast(toastText);
    if (reply) {
      speakConfirmation(reply);
    }
  };

  const runAiVoiceCommand = async (rawTranscript: string) => {
    const trimmed = rawTranscript.trim();
    if (!trimmed || aiInFlightRef.current) return;
    const now = Date.now();
    if (trimmed === lastAiTranscriptRef.current && now - lastAiTimeRef.current < 2500) {
      return;
    }

    aiInFlightRef.current = true;
    lastAiTranscriptRef.current = trimmed;
    lastAiTimeRef.current = now;
    showToast('Understanding command...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const d = new Date();
      const localToday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: trimmed,
          currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
          language: locale || document.documentElement.lang || 'en',
          visibleElements: collectVisibleElements(),
          today: localToday,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        showToast('Could not parse voice command');
        return;
      }

      const data = await res.json();
      const actions: VoiceAction[] = Array.isArray(data?.actions) ? data.actions : [];
      const reply = typeof data?.reply === 'string' ? data.reply : '';

      if (actions.length > 0) {
        await executeAiActions(actions, reply);
      } else if (reply) {
        showToast(reply);
        speakConfirmation(reply);
      }
    } catch (err: any) {
      showToast(err?.name === 'AbortError' ? 'Voice command timed out' : 'Voice command request failed');
    } finally {
      clearTimeout(timeoutId);
      aiInFlightRef.current = false;
    }
  };

  // ── 6. ZERO-LAG INTENT ENGINE & 300MS DEBOUNCING ──
  const processCommand = (rawTranscript: string, isFinal = false) => {
    const raw = rawTranscript.trim();
    if (raw.length < 2) return;

    const norm = normalizeText(raw);
    if (!norm || norm.length < 2) return;
    const isAr = (document.documentElement.lang || 'en').toLowerCase().includes('ar');

    const now = Date.now();
    // 300ms debounce lock per executed command to prevent double-firing on interim results
    if (now - lastCmdTime.current < 300) return;
    if (norm === lastCmdKeyRef.current && now - lastCmdTime.current < 1500) return;

    const markExecuted = (key: string) => {
      lastCmdTime.current = Date.now();
      lastCmdKeyRef.current = key;
    };

    // ── 6a. CLOSE AI INTENT ──
    if (
      norm.includes('اقفل المساعد') ||
      norm.includes('اغلق المساعد') ||
      norm.includes('اقفل الصوت') ||
      norm.includes('stop ai') ||
      norm.includes('close ai') ||
      norm.includes('fermer ia') ||
      norm.includes('fermer assistant') ||
      norm.includes('arrete assistant') ||
      norm.includes('arrête assistant')
    ) {
      deactivateAssistant();
      return;
    }

    // ── 6b. CLOSE MODAL / CARD INTENT ──
    if (
      norm.includes('اقفل الكارت') ||
      norm.includes('اغلق الكارت') ||
      norm.includes('اقفل النافذة') ||
      norm.includes('اغلق النافذة') ||
      norm.includes('اقفل المودال') ||
      norm.includes('close card') ||
      norm.includes('close modal') ||
      norm.includes('fermer la carte') ||
      norm.includes('fermer le modal')
    ) {
      const closeBtn = document.querySelector<HTMLElement>(
        'button[aria-label*="close" i], button[aria-label*="إغلاق" i], button[aria-label*="fermer" i], .modal-close, [role="dialog"] button'
      );
      if (closeBtn) {
        closeBtn.click();
      } else {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      }
      return;
    }

    // General Stop / Close command
    if (
      norm === 'اقفل' ||
      norm === 'اغلق' ||
      norm === 'close' ||
      norm === 'stop' ||
      norm === 'fermer' ||
      norm === 'arrete' ||
      norm === 'arrête'
    ) {
      const closeBtn = document.querySelector<HTMLElement>(
        'button[aria-label*="close" i], button[aria-label*="إغلاق" i], button[aria-label*="fermer" i], .modal-close'
      );
      if (closeBtn) {
        closeBtn.click();
      } else {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        deactivateAssistant();
      }
      return;
    }

    // ── AI PLANNER INTELLIGENT ROUTING ──
    const normalizedTranscript = norm;
    if (typeof window !== 'undefined' && window.location.pathname.includes('/planner')) {
      let matched = false;

      // 1. Handle Number Inputs (Travelers & Budget)
      // Extracts digits from voice command (e.g., "5 travelers", "budget 2000")
      const numbers = normalizedTranscript.match(/\d+/g);
      
      if (normalizedTranscript.includes('traveler') || normalizedTranscript.includes('مسافر') || normalizedTranscript.includes('اشخاص') || normalizedTranscript.includes('افراد')) {
        const travelerInput = document.querySelector<HTMLInputElement>('input[placeholder*="Traveler" i], input[type="number"]:first-of-type');
        if (travelerInput && numbers) {
          const val = numbers[0];
          const proto = Object.getPrototypeOf(travelerInput);
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) setter.call(travelerInput, val);
          else travelerInput.value = val;
          travelerInput.dispatchEvent(new Event('input', { bubbles: true }));
          travelerInput.dispatchEvent(new Event('change', { bubbles: true }));
          matched = true;
        }
      }

      if (normalizedTranscript.includes('budget') || normalizedTranscript.includes('ميزانية') || normalizedTranscript.includes('ميزانيه')) {
        const budgetInput = document.querySelector<HTMLInputElement>('input[placeholder*="Budget" i], input[placeholder*="500" i], input[type="text"]');
        if (budgetInput && numbers) {
          const val = numbers[numbers.length - 1]; // usually the last number in "budget is 2000"
          const proto = Object.getPrototypeOf(budgetInput);
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) setter.call(budgetInput, val);
          else budgetInput.value = val;
          budgetInput.dispatchEvent(new Event('input', { bubbles: true }));
          budgetInput.dispatchEvent(new Event('change', { bubbles: true }));
          matched = true;
        }
      }

      // 2. Handle Trip Duration Slider (Days)
      // E.g., "5 days" or "خمس ايام" (Fallback handling for single digit if no match)
      if (normalizedTranscript.includes('day') || normalizedTranscript.includes('يوم') || normalizedTranscript.includes('ايام')) {
        const slider = document.querySelector<HTMLInputElement>('input[type="range"]');
        if (slider && numbers) {
          const val = numbers[0];
          const proto = Object.getPrototypeOf(slider);
          const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (setter) setter.call(slider, val);
          else slider.value = val;
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
          // Dispatch custom event to sync separated React state directly
          window.dispatchEvent(new CustomEvent('update-duration-slider', { detail: numbers[0] }));
          matched = true;
        }
      }

      // 3. Handle Travel Style Cards (Robust React Click)
      const styles = [
        { keys: ['solo', 'independent', 'وحدي', 'سولو', 'مفرد'], selector: 'Solo' },
        { keys: ['couple', 'romantic', 'زوجين', 'كابل', 'رومانسي'], selector: 'Couple' },
        { keys: ['family', 'kids', 'عائلة', 'اسرة', 'أطفال'], selector: 'Family' },
        { keys: ['group', 'friends', 'مجموعة', 'اصدقاء', 'جروب'], selector: 'Group' }
      ];

      styles.forEach(style => {
        if (style.keys.some(k => normalizedTranscript.includes(k))) {
          // Find all potential text containers
          const elements = Array.from(document.querySelectorAll<HTMLElement>('h3, h4, span, p, div, button'));
          // Find the specific element that matches the text
          const target = elements.find(el => el.textContent?.trim().toLowerCase() === style.selector.toLowerCase()) ||
                         elements.find(el => el.textContent?.toLowerCase().includes(style.selector.toLowerCase()));
          
          if (target) {
            // Find the parent card container (button, cursor-pointer, role="button", or element itself)
            const clickableCard = (target.closest('button, .cursor-pointer, [role="button"]') || target) as HTMLElement;
            
            // Dispatch a real mouse event to force React's SyntheticEvent to fire
            clickableCard.dispatchEvent(new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
              buttons: 1
            }));

            // Fallback standard DOM click
            try { clickableCard.click(); } catch {}
            
            matched = true;
          }
        }
      });

      // If a specific planner command was executed, return early to prevent fallback to generic omni-click
      if (matched) return;
    }

    // ── 6c. MEDIA ICONS & VIDEO PLAYING ──
    if (
      norm.includes('فيديو') ||
      norm.includes('شغل') ||
      norm.includes('video') ||
      norm.includes('lire') ||
      norm.includes('play')
    ) {
      const playElement = document.querySelector<HTMLElement>(
        'video, [class*="play" i], [aria-label*="play" i], [aria-label*="تشغيل" i], .cursor-pointer svg, button svg'
      );

      if (playElement) {
        const targetEl = (playElement.closest('button, a, div.cursor-pointer') || playElement) as HTMLElement;
        targetEl.click();
        return;
      }
    }

    const hasWholePhrase = (text: string, phrases: string[]): boolean => {
      const padded = ` ${text} `;
      return phrases.some((p) => padded.includes(` ${p} `));
    };

    // ── 6d. SILENT NAVIGATION (Clear Whole-Word / Phrase Matching) ──
    if (hasWholePhrase(norm, ['انزل', 'تحت', 'scroll down', 'down', 'descendre'])) {
      markExecuted('scroll-down');
      window.scrollBy({ top: 700, behavior: 'smooth' });
      return;
    }

    if (hasWholePhrase(norm, ['اطلع', 'فوق', 'scroll up', 'up', 'monter'])) {
      markExecuted('scroll-up');
      window.scrollBy({ top: -700, behavior: 'smooth' });
      return;
    }

    if (hasWholePhrase(norm, ['ارجع', 'للخلف', 'go back', 'back', 'retour'])) {
      markExecuted('go-back');
      setTimeout(() => window.history.back(), 100);
      return;
    }

    // ── PHARAOH AVATAR ON/OFF ──
    if (
      norm.includes('pharaoh avatar') ||
      norm.includes('avatar') ||
      norm.includes('افاتار') ||
      norm.includes('الافاتار') ||
      norm.includes('الفرعون')
    ) {
      const turnOff = norm.includes('off') || norm.includes('hide') || norm.includes('close') || norm.includes('اقفل') || norm.includes('اخفي') || norm.includes('اوقف');
      const turnOn = norm.includes('on') || norm.includes('show') || norm.includes('open') || norm.includes('شغل') || norm.includes('افتح') || norm.includes('اظهر');
      markExecuted('avatar');
      window.dispatchEvent(
        new CustomEvent('egyptx:toggle-pharaoh-avatar', {
          detail: turnOff ? { active: false } : turnOn ? { active: true } : undefined,
        })
      );
      return;
    }

    // ── DARK / LIGHT MODE TOGGLE ──
    if (
      norm.includes('dark mode') ||
      norm.includes('light mode') ||
      norm.includes('الوضع الليلي') ||
      norm.includes('الوضع الداكن') ||
      norm.includes('الوضع النهاري') ||
      norm.includes('الوضع الفاتح')
    ) {
      markExecuted('theme');
      const root = document.documentElement;
      const wantDark = norm.includes('dark') || norm.includes('ليلي') || norm.includes('داكن');
      const wantLight = norm.includes('light') || norm.includes('نهاري') || norm.includes('فاتح');
      const nextDark = wantDark ? true : wantLight ? false : !root.classList.contains('dark');
      root.classList.toggle('dark', nextDark);
      try {
        localStorage.setItem('theme', nextDark ? 'dark' : 'light');
      } catch {}
      return;
    }

    // ── SIMPLE FAST-PATH GUARD ──
    // Only fast-path simple single-intent commands; multi-step or form commands go to /api/voice-command
    const isComplexOrMultiStep =
      norm.split(/\s+/).length > 4 ||
      /\d/.test(norm) ||
      /\b(and|then|with|set|fill|budget|date|start|end|search|tomorrow|next)\b/.test(norm) ||
      /(وابحث|واختار|واملا|ميزانيه|تاريخ|بدايه|نهايه|بكره|غدا|ابحث|املا|غير)/.test(norm);

    // ── NAVBAR DROPDOWN MENUS (AR & EN) ──
    if (!isComplexOrMultiStep) {
      const menuCommands: Array<{ menu: string; keys: string[] }> = [
        {
          menu: 'experiences',
          keys: ['open experiences', 'show experiences', 'experiences menu', 'افتح تجارب', 'افتح قائمه تجارب', 'قائمه تجارب'],
        },
        {
          menu: 'explore',
          keys: ['open explore', 'show explore', 'explore menu', 'افتح استكشف', 'افتح قائمه استكشف'],
        },
        {
          menu: 'egypt-life',
          keys: ['open egypt life', 'show egypt life', 'egypt life menu', 'افتح حياه مصر', 'قائمه حياه مصر'],
        },
        {
          menu: 'official',
          keys: ['open official', 'show official', 'official menu', 'افتح جهات رسميه', 'افتح رسميه'],
        },
        {
          menu: 'language',
          keys: ['open language', 'show language', 'language menu', 'افتح لغه', 'قائمه لغه'],
        },
      ];
      for (const mc of menuCommands) {
        if (mc.keys.some((k) => norm.includes(k))) {
          markExecuted(`menu-${mc.menu}`);
          window.dispatchEvent(new CustomEvent('egyptx:open-nav-menu', { detail: { menu: mc.menu } }));
          showToast(`Menu: ${mc.menu}`);
          return;
        }
      }
    }

    // ── LANGUAGE SWITCHING (EN, AR, FR, DE, IT, ES, ZH, RU) ──
    if (!isComplexOrMultiStep) {
      const langCommands: Array<{ code: string; keys: string[] }> = [
        { code: 'ar', keys: ['arabic', 'عربي', 'عربيه', 'عربية'] },
        { code: 'en', keys: ['english', 'انجليزي', 'انجليزيه', 'انجليزية'] },
        { code: 'fr', keys: ['french', 'francais', 'français', 'فرنسي', 'فرنسيه'] },
        { code: 'de', keys: ['german', 'deutsch', 'الماني', 'المانيه'] },
        { code: 'it', keys: ['italian', 'italiano', 'ايطالي', 'ايطاليه'] },
        { code: 'es', keys: ['spanish', 'espanol', 'español', 'اسباني', 'اسبانيه'] },
        { code: 'zh', keys: ['chinese', 'mandarin', 'صيني', 'صينيه'] },
        { code: 'ru', keys: ['russian', 'روسي', 'روسيه'] },
      ];
      for (const lc of langCommands) {
        if (hasWholePhrase(norm, lc.keys)) {
          markExecuted(`lang-${lc.code}`);
          setLocale(lc.code);
          showToast(`Language: ${lc.code.toUpperCase()}`);
          return;
        }
      }

      // ── FULL-SITE ROUTE NAVIGATION (AR & EN, INCLUDING ALL EXPERIENCES SUB-PAGES) ──
      const routeCommands: Array<{ path: string; keys: string[] }> = [
        { path: '/vr-egypt', keys: ['vr egypt', 'vr', 'virtual reality', 'واقع افتراضي', 'في ار', 'جوله افتراضيه'] },
        { path: '/navigator', keys: ['smart navigator', 'navigator', 'navigation', 'ملاحه ذكيه', 'ملاحه', 'خريطه', 'افتح خريطه'] },
        { path: '/ai-guide', keys: ['vision guide', 'ai guide', 'مرشد رؤيه', 'مرشد ذكي', 'مرشد بصري', 'صور اثر'] },
        { path: '/hieroglyph-scanner', keys: ['hieroglyph scanner', 'hieroglyph', 'هيروغليف', 'هيروغليفي', 'ترجم هيروغليفي', 'ماسح هيروغليف'] },
        { path: '/slang', keys: ['egyptspeak', 'egypt speak', 'slang', 'عاميه', 'عاميه مصريه'] },
        { path: '/memory-core', keys: ['memory core', 'memories', 'ذكريات'] },
        { path: '/bookings', keys: ['concierge', 'bookings', 'حجوزات', 'فنادق'] },
        { path: '/news', keys: ['egypt life', 'news', 'اخبار', 'حياه مصر'] },
        { path: '/kids', keys: ['kids mode', 'kids', 'اطفال', 'وضع اطفال'] },
        { path: '/command-center', keys: ['command center', 'مركز قياده', 'غرفه عمليات'] },
        { path: '/planner', keys: ['ai planner', 'planner', 'مخطط', 'مخطط رحلات'] },
        { path: '/explore', keys: ['explore', 'explore egypt', 'استكشف', 'استكشاف'] },
        { path: '/', keys: ['go home', 'home', 'رئيسيه', 'صفحه رئيسيه'] },
      ];
      for (const rc of routeCommands) {
        if (hasWholePhrase(norm, rc.keys)) {
          markExecuted(`nav-${rc.path}`);
          router.push(rc.path);
          showToast(`Opened ${rc.path}`);
          return;
        }
      }
    }

    // ── 6e. TYPE-SAFE AI PLANNER (Magic Fill) ──
    const hasPlannerVerb =
      norm.includes('رحل') ||
      norm.includes('سفر') ||
      norm.includes('ميزاني') ||
      norm.includes('دولار') ||
      norm.includes('جنيه') ||
      norm.includes('trip') ||
      norm.includes('budget') ||
      norm.includes('voyage') ||
      (norm.includes('ايام') && norm.includes('لمده')) ||
      (norm.includes('days') && norm.includes('for')) ||
      (norm.includes('jours') && norm.includes('pour'));

    if (hasPlannerVerb) {
      let extractedCountry = '';
      let extractedDays = 0;
      let extractedBudget = 0;

      const countryMatch =
        raw.match(/(?:من|from|de)\s+([^\s,،.]+)/i) ||
        raw.match(/(?:إلى|الى|to|vers)\s+([^\s,،.]+)/i);
      if (countryMatch && countryMatch[1]) {
        extractedCountry = countryMatch[1].trim();
      }

      const daysMatch =
        raw.match(/(\d+)\s*(?:أيام|ايام|يوم|days?|jours?)/i) ||
        raw.match(/(?:لمدة|خلال|for|pendant|durant)\s*(\d+)/i);

      if (daysMatch && daysMatch[1]) {
        extractedDays = parseInt(daysMatch[1], 10);
      } else {
        const wordsMap: Record<string, number> = {
          يوم: 1,
          يومين: 2,
          ثلاثه: 3,
          ثلاث: 3,
          اربعه: 4,
          اربع: 4,
          خمسه: 5,
          خمس: 5,
          سته: 6,
          ست: 6,
          سبعه: 7,
          سبع: 7,
          ثمانيه: 8,
          ثماني: 8,
          تسعه: 9,
          تسع: 9,
          عشره: 10,
          عشر: 10
        };
        for (const [w, count] of Object.entries(wordsMap)) {
          if (norm.includes(w)) {
            extractedDays = count;
            break;
          }
        }
      }

      const budgetMatch =
        raw.match(/(\d+[\d,.]*)\s*(?:دولار|جنيه|dollars?|euros?|le|\$|€|budget)/i) ||
        raw.match(/(?:ميزانية|ميزانيه|budget|بميزانية|بميزانيه)\s*(?:قدرها|of|de)?\s*(\d+[\d,.]*)/i);

      if (budgetMatch && budgetMatch[1]) {
        extractedBudget = parseInt(budgetMatch[1].replace(/[,.]/g, ''), 10) || 0;
      }

      if (extractedCountry || extractedDays > 0 || extractedBudget > 0) {
        window.dispatchEvent(
          new CustomEvent('voice-fill-planner', {
            detail: {
              country: extractedCountry,
              days: extractedDays,
              budget: extractedBudget,
              raw
            }
          })
        );
        return;
      }
    }

    // ── 6f. VR SPATIAL CARDS & ELEMENT CLICKING ──
    const hasClickVerb =
      norm.includes('افتح') ||
      norm.includes('اختار') ||
      norm.includes('دوس') ||
      norm.includes('اضغط') ||
      norm.includes('انقر') ||
      norm.includes('click') ||
      norm.includes('open') ||
      norm.includes('select') ||
      norm.includes('choose') ||
      norm.includes('ouvre') ||
      norm.includes('choisis') ||
      norm.includes('clique');

    if (hasClickVerb) {
      // Spatial VR Card Matching: "الاول/التاني/الثالث/first/second/premier" + left/right
      let targetIndex = -1;
      if (norm.includes('اول') || norm.includes('first') || norm.includes('premier') || norm.includes('1')) {
        targetIndex = 0;
      } else if (norm.includes('تاني') || norm.includes('ثاني') || norm.includes('second') || norm.includes('deuxieme') || norm.includes('deuxième') || norm.includes('2')) {
        targetIndex = 1;
      } else if (norm.includes('تالت') || norm.includes('ثالث') || norm.includes('third') || norm.includes('troisieme') || norm.includes('troisième') || norm.includes('3')) {
        targetIndex = 2;
      } else if (norm.includes('رابع') || norm.includes('fourth') || norm.includes('quatrieme') || norm.includes('quatrième') || norm.includes('4')) {
        targetIndex = 3;
      } else if (norm.includes('خامس') || norm.includes('fifth') || norm.includes('cinquieme') || norm.includes('cinquième') || norm.includes('5')) {
        targetIndex = 4;
      } else if (norm.includes('سادس') || norm.includes('sixth') || norm.includes('sixieme') || norm.includes('sixième') || norm.includes('6')) {
        targetIndex = 5;
      }

      if (targetIndex !== -1) {
        let items = Array.from(
          document.querySelectorAll<HTMLElement>(
            'img, video, .video-card, [role="button"], div.cursor-pointer, .clickable, button, a'
          )
        ).filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 30 && rect.height > 30;
        });

        const isRtl = document.documentElement.dir === 'rtl' || isAr;
        const wantsRight = norm.includes('يمين') || norm.includes('right') || norm.includes('droite');
        const wantsLeft = norm.includes('شمال') || norm.includes('يسار') || norm.includes('left') || norm.includes('gauche');

        if (wantsRight) {
          if (!isRtl) items = items.reverse();
        } else if (wantsLeft) {
          if (isRtl) items = items.reverse();
        }

        if (items[targetIndex]) {
          const targetEl = (items[targetIndex].closest('button, a, div.cursor-pointer, [role="button"]') || items[targetIndex]) as HTMLElement;
          targetEl.focus();
          targetEl.click();
          return;
        }
      }

      // Text-Based Strict Clicking
      const clickTriggers = [
        'اضغط علي', 'اضغط على', 'اضغط',
        'دوس علي', 'دوس على', 'دوس',
        'افتح', 'اختار', 'انقر علي', 'انقر على',
        'click on', 'click', 'choose', 'select', 'open',
        'ouvre', 'choisis', 'clique sur', 'clique'
      ];
      let clickTarget = '';

      for (const trigger of clickTriggers) {
        const idx = raw.toLowerCase().indexOf(trigger);
        if (idx !== -1) {
          clickTarget = raw.slice(idx + trigger.length).trim();
          break;
        }
      }

      if (clickTarget) {
        const normalizedTarget = normalizeText(clickTarget);
        if (normalizedTarget && normalizedTarget !== 'فيديو' && normalizedTarget !== 'صوره' && normalizedTarget !== 'حاجه' && normalizedTarget !== 'video') {
          const candidates = Array.from(
            document.querySelectorAll<HTMLElement>(
              'button, a, [role="button"], [role="option"], [role="combobox"], [role="checkbox"], li, input, select, label, img, div.cursor-pointer, .clickable'
            )
          );

          for (const el of candidates) {
            const rawElText = (
              el.textContent ||
              el.getAttribute('aria-label') ||
              el.getAttribute('placeholder') ||
              el.getAttribute('alt') ||
              (el as HTMLInputElement).value ||
              ''
            ).toLowerCase();

            const normElText = normalizeText(rawElText);

            if (normElText && (normElText.includes(normalizedTarget) || normalizedTarget.includes(normElText))) {
              const targetEl = (el.closest('button, a, li, label, [role="option"], div.cursor-pointer') || el) as HTMLElement;
              targetEl.focus();
              targetEl.click();
              return;
            }
          }
        }
      }
    }

    // ── 7. UNIVERSAL AI VOICE ACTION PARSER (Complex / Multi-Step / Form-Filling) ──
    if (isFinal) {
      markExecuted(`ai-${norm.slice(0, 32)}`);
      void runAiVoiceCommand(raw);
    }
  };


  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const resultsLen = event.results.length;
      const lastResult = event.results[resultsLen - 1];

      if (lastResult && lastResult[0]) {
        const confidence = typeof lastResult[0].confidence === 'number' ? lastResult[0].confidence : 1;
        // Reject noisy or low-confidence fragments
        if (confidence > 0 && confidence < 0.55) {
          return;
        }

        const transcript = String(lastResult[0].transcript || '').trim();
        if (transcript.length < 2) return;

        setLiveTranscript(transcript);

        // Buffer transcript and wait for a natural 650ms speech-pause window
        // so full multi-word commands are captured without cutting the user off
        pendingTranscriptRef.current = transcript;
        if (speechPauseTimerRef.current) clearTimeout(speechPauseTimerRef.current);
        speechPauseTimerRef.current = setTimeout(() => {
          const finalPhrase = pendingTranscriptRef.current.trim();
          pendingTranscriptRef.current = '';
          setLiveTranscript('');
          if (finalPhrase.length >= 2) {
            processCommand(finalPhrase, true);
          }
        }, 650);
      }
    };

    recognition.onstart = () => {
      isRecognitionActiveRef.current = true;
      setIsListeningUI(true);
    };

    recognition.onerror = (event: any) => {
      isRecognitionActiveRef.current = false;
      if (event.error === 'not-allowed') {
        isListeningRef.current = false;
        setIsListeningUI(false);
        console.warn('SpeechRecognition: Microphone access blocked.');
      }
    };

    // onend restart guard with 300ms cooldown and isListening check
    recognition.onend = () => {
      isRecognitionActiveRef.current = false;
      if (!isListeningRef.current) {
        setIsListeningUI(false);
      } else {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            startRecognition();
          }
        }, 300);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 2: Start continuous listening
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        activateAssistant();
      }

      // Alt + 3: Hard-stop recognition and TTS
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        deactivateAssistant();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      isListeningRef.current = false;
      isRecognitionActiveRef.current = false;
      setIsListeningUI(false);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (speechPauseTimerRef.current) clearTimeout(speechPauseTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── TRIPLE-TAP GESTURE ACTIVATION ──
  // 3 rapid taps on any empty area (within 600ms) activates the voice assistant.
  // Taps on interactive elements (buttons, inputs, links…) are ignored.
  useEffect(() => {
    let tapCount = 0;
    let tapTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleTripleTap = (e: MouseEvent) => {
      // Ignore taps on interactive elements so normal UI clicks still work
      const target = e.target as Element;
      if (target.closest('button, input, textarea, a, [role="button"], select')) {
        return;
      }

      tapCount++;

      if (tapCount === 3) {
        tapCount = 0;
        if (tapTimeout) clearTimeout(tapTimeout);
        // Only activate if not already listening
        if (!isListeningRef.current) {
          activateAssistant();
        }
      } else {
        // Reset tap counter if 600ms pass without a third tap
        if (tapTimeout) clearTimeout(tapTimeout);
        tapTimeout = setTimeout(() => {
          tapCount = 0;
        }, 600);
      }
    };

    document.addEventListener('click', handleTripleTap);

    return () => {
      document.removeEventListener('click', handleTripleTap);
      if (tapTimeout) clearTimeout(tapTimeout);
    };
  }, []);

  // Sync recognition language immediately when site locale or mic override changes
  useEffect(() => {
    if (!recognitionRef.current) return;
    const nextLang = updateRecognitionLanguage();
    recognitionRef.current.lang = nextLang;
    if (isListeningRef.current) {
      startRecognition();
    }
  }, [locale, micLangOverride]);

  const effectiveMicLang =
    micLangOverride !== 'auto'
      ? micLangOverride
      : (locale || 'en').toLowerCase().startsWith('ar')
      ? 'ar-EG'
      : 'en-US';

  return (
    <>
      {/* ── DESKTOP VOICE STATUS BAR: LIVE TRANSCRIPT + [AR / EN] MIC TOGGLE (HIDDEN ON MOBILE) ── */}
      {(isListeningUI || liveTranscript || statusToast) && (
        <div
          data-voice-ui="true"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 max-w-[92vw]"
        >
          {(liveTranscript || statusToast) && (
            <div className="pointer-events-none px-4 py-2 rounded-full bg-[#080705]/95 border border-[#D6A044]/60 text-[#F5EFE6] text-xs font-medium tracking-wide shadow-[0_8px_30px_rgba(0,0,0,0.65)] backdrop-blur-md truncate max-w-[70vw]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D6A044] mr-2 align-middle animate-pulse" />
              <span className="align-middle">
                {liveTranscript ? `Heard: "${liveTranscript}"` : statusToast}
              </span>
            </div>
          )}

          {isListeningUI && (
            <div className="hidden md:flex items-center rounded-full bg-[#080705]/95 border border-[#D6A044]/60 p-0.5 shadow-[0_8px_30px_rgba(0,0,0,0.65)] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMicLangOverride('ar-EG')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-colors cursor-pointer ${
                  effectiveMicLang === 'ar-EG'
                    ? 'bg-[#D6A044] text-[#080705]'
                    : 'text-[#F5EFE6]/70 hover:text-[#F5EFE6]'
                }`}
              >
                AR
              </button>
              <button
                type="button"
                onClick={() => setMicLangOverride('en-US')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-colors cursor-pointer ${
                  effectiveMicLang === 'en-US'
                    ? 'bg-[#D6A044] text-[#080705]'
                    : 'text-[#F5EFE6]/70 hover:text-[#F5EFE6]'
                }`}
              >
                EN
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 4. LIQUID SIRI-STYLE PULSING GRADIENT GLOW (No Text / No Icons) ── */}
      {isListeningUI && (
        <>
          {/* Subtle full-screen edge glow to make the whole screen feel alive */}
          <div className="fixed inset-0 z-[9998] pointer-events-none shadow-[inset_0_0_80px_rgba(168,85,247,0.15)] animate-pulse" style={{ animationDuration: '3s' }} />

          {/* Dynamic Liquid Glowing Wave at the bottom edge */}
          <div className="fixed bottom-0 left-0 right-0 h-40 z-[9999] pointer-events-none flex justify-center items-end overflow-hidden mix-blend-screen">
            
            {/* Outer wide glow */}
            <div 
              className="absolute bottom-0 w-[60vw] h-[150px] bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-yellow-500/40 rounded-[100%] blur-[60px] animate-pulse translate-y-1/2" 
              style={{ animationDuration: '2.5s' }} 
            />
            
            {/* Inner intense morphing glow */}
            <div 
              className="absolute bottom-0 w-[40vw] h-[100px] bg-gradient-to-r from-blue-400/60 via-fuchsia-500/60 to-amber-400/60 rounded-[100%] blur-[40px] animate-pulse translate-y-1/2" 
              style={{ animationDuration: '1.8s', animationDirection: 'alternate-reverse' }} 
            />

            {/* Core bright light */}
            <div 
              className="absolute bottom-0 w-[20vw] h-[50px] bg-white/30 rounded-[100%] blur-[20px] animate-pulse translate-y-1/2" 
              style={{ animationDuration: '1s' }} 
            />
            
          </div>
        </>
      )}

    </>
  );
}
