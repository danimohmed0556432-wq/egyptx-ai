import { NextResponse } from 'next/server';
import { normalizeLocale } from '@/lib/i18n-ai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const COHERE_CHAT_URL = 'https://api.cohere.com/v2/chat';
const COHERE_VISION_MODEL = 'command-a-vision-07-2025';
const VISION_TIMEOUT_MS = 45000;

const CLASSIFICATION_LABELS = {
  authentic_inscription: {
    en: 'Authentic Epigraphic Inscription',
    ar: 'نقش هيروغليفي أثري أصيل',
    fr: 'Inscription épigraphique authentique',
    de: 'Authentische epigraphische Inschrift',
    it: 'Iscrizione epigrafica autentica',
    es: 'Inscripción epigráfica auténtica',
    zh: '真实古埃及铭文',
    ru: 'Подлинная эпиграфическая надпись',
  },
  modern_artwork: {
    en: 'Modern Hieroglyphic-Style Artwork',
    ar: 'عمل فني / إعلاني حديث مستوحى من الهيروغليفية',
    fr: 'Œuvre moderne de style hiéroglyphique',
    de: 'Modernes Kunstwerk im Hieroglyphen-Stil',
    it: 'Opera moderna in stile geroglifico',
    es: 'Obra moderna de estilo jeroglífico',
    zh: '现代仿象形文字艺术设计',
    ru: 'Современная стилизация под иероглифы',
  },
};

const UNAVAILABLE_ERRORS = {
  en: 'Vision AI service unavailable — please check API key configuration',
  ar: 'خدمة الذكاء الاصطناعي البصري غير متاحة حالياً — يرجى التحقق من إعداد مفتاح API',
  fr: 'Service Vision IA indisponible — veuillez vérifier la configuration de la clé API',
  de: 'Vision-KI-Dienst nicht verfügbar — bitte prüfen Sie die API-Schlüssel-Konfiguration',
  it: 'Servizio Vision AI non disponibile — verifica la configurazione della chiave API',
  es: 'Servicio Vision AI no disponible — verifica la configuración de la clave API',
  zh: '视觉 AI 服务不可用 — 请检查 API 密钥配置',
  ru: 'Сервис Vision ИИ недоступен — проверьте конфигурацию API-ключа',
};

function getClassificationLabel(classification, locale) {
  const loc = normalizeLocale(locale);
  const bucket =
    classification === 'modern_artwork'
      ? CLASSIFICATION_LABELS.modern_artwork
      : CLASSIFICATION_LABELS.authentic_inscription;
  return bucket[loc] || bucket.en;
}

function getUnavailableError(locale) {
  const loc = normalizeLocale(locale);
  return UNAVAILABLE_ERRORS[loc] || UNAVAILABLE_ERRORS.en;
}

const GARDINER_LEXICON = {
  F21: {
    unicode: '𓄔',
    phonetic: 'sDm',
    names: {
      en: 'Ear of Ox', ar: 'أذن ثور', fr: 'Oreille de bœuf', de: 'Rinderohr',
      it: 'Orecchio di bue', es: 'Oreja de buey', zh: '牛耳', ru: 'Ухо быка',
    },
    meanings: {
      en: 'hear / listen', ar: 'يسمع / إنصات', fr: 'entendre / écouter', de: 'hören / lauschen',
      it: 'udire / ascoltare', es: 'oír / escuchar', zh: '听见 / 聆听', ru: 'слышать / слушать',
    },
  },
  A1: {
    unicode: '𓀀',
    phonetic: 's',
    names: {
      en: 'Seated Man', ar: 'رجل جالس', fr: 'Homme assis', de: 'Sitzender Mann',
      it: 'Uomo seduto', es: 'Hombre sentado', zh: '坐姿男子', ru: 'Сидящий мужчина',
    },
    meanings: {
      en: 'man / person (determinative)', ar: 'رجل / شخص (مخصص)', fr: 'homme / personne', de: 'Mann / Person',
      it: 'uomo / persona', es: 'hombre / persona', zh: '男人 / 人', ru: 'мужчина / человек',
    },
  },
  S43: {
    unicode: '𓌃',
    phonetic: 'mdw',
    names: {
      en: 'Walking Stick', ar: 'عصا المشي', fr: 'Bâton de marche', de: 'Gehstock',
      it: 'Bastone da passeggio', es: 'Bastón', zh: '手杖', ru: 'Посох',
    },
    meanings: {
      en: 'speech / word / speak', ar: 'كلام / كلمة / يتحدث', fr: 'parole / mot', de: 'Rede / Wort',
      it: 'parola / discorso', es: 'palabra / habla', zh: '言语 / 话语', ru: 'речь / слово',
    },
  },
  D46: {
    unicode: '𓂧',
    phonetic: 'd',
    names: {
      en: 'Hand', ar: 'يد ممدودة', fr: 'Main', de: 'Hand',
      it: 'Mano', es: 'Mano', zh: '手', ru: 'Рука',
    },
    meanings: {
      en: 'give / phonetic d', ar: 'يعطي / صوت d', fr: 'donner / phonétique d', de: 'geben / Laut d',
      it: 'dare / fonetico d', es: 'dar / fonético d', zh: '给予 / 音 d', ru: 'давать / звук d',
    },
  },
  X1: {
    unicode: '𓏏',
    phonetic: 't',
    names: {
      en: 'Bread Loaf', ar: 'رغيف خبز', fr: 'Pain rond', de: 'Brotlaib',
      it: 'Pagnotta', es: 'Pan', zh: '面包', ru: 'Хлеб',
    },
    meanings: {
      en: 'bread / feminine t', ar: 'خبز / تاء التأنيث t', fr: 'pain / féminin t', de: 'Brot / feminin t',
      it: 'pane / femminile t', es: 'pan / femenino t', zh: '面包 / 阴性词尾 t', ru: 'хлеб / женский род t',
    },
  },
  S34: {
    unicode: '𓋹',
    phonetic: 'anx',
    names: {
      en: 'Ankh (Sandal Strap)', ar: 'عنخ (مفتاح الحياة)', fr: 'Ânkh (Croix de vie)', de: 'Anch (Lebensschleife)',
      it: 'Ankh (Chiave della vita)', es: 'Anj (Cruz de la vida)', zh: '安卡（生命之符）', ru: 'Анкх (Ключ жизни)',
    },
    meanings: {
      en: 'life', ar: 'الحياة', fr: 'vie', de: 'Leben',
      it: 'vita', es: 'vida', zh: '生命', ru: 'жизнь',
    },
  },
  U28: {
    unicode: '𓍑',
    phonetic: 'wDA',
    names: {
      en: 'Fire Drill', ar: 'مثقاب النار (وجا)', fr: 'Foret à feu', de: 'Feuerbohrer',
      it: 'Trapano da fuoco', es: 'Taladro de fuego', zh: '取火钻', ru: 'Огниво',
    },
    meanings: {
      en: 'prosperity / soundness', ar: 'الازدهار / السلامة', fr: 'prospérité / intégrité', de: 'Wohlstand / Heil',
      it: 'prosperità / integrità', es: 'prosperidad / bienestar', zh: '繁荣 / 健全', ru: 'процветание / благополучие',
    },
  },
  S29: {
    unicode: '𓋴',
    phonetic: 'snb / s',
    names: {
      en: 'Folded Cloth', ar: 'قماش مطوي (سنب)', fr: 'Tissu plié', de: 'Gefaltetes Tuch',
      it: 'Tessuto piegato', es: 'Tela doblada', zh: '折叠布', ru: 'Сложенная ткань',
    },
    meanings: {
      en: 'health / phonetic s', ar: 'الصحة / صوت s', fr: 'santé / phonétique s', de: 'Gesundheit / Laut s',
      it: 'salute / fonetico s', es: 'salud / fonético s', zh: '健康 / 音 s', ru: 'здоровье / звук s',
    },
  },
  I6: {
    unicode: '𓆎',
    phonetic: 'km',
    names: {
      en: 'Crocodile Scale', ar: 'حرشفة تمساح', fr: 'Écaille de crocodile', de: 'Krokodilschuppe',
      it: 'Squama di coccodrillo', es: 'Escama de cocodrilo', zh: '鳄鱼鳞', ru: 'Чешуя крокодила',
    },
    meanings: {
      en: 'black / fertile silt (km)', ar: 'أسود / طمي خصب', fr: 'noir / limon fertile', de: 'schwarz / fruchtbar',
      it: 'nero / limo fertile', es: 'negro / limo fértil', zh: '黑色 / 沃土', ru: 'чёрный / плодородный ил',
    },
  },
  G17: {
    unicode: '𓅓',
    phonetic: 'm',
    names: {
      en: 'Owl', ar: 'بومة', fr: 'Hibou', de: 'Eule',
      it: 'Gufo', es: 'Búho', zh: '猫头鹰', ru: 'Сова',
    },
    meanings: {
      en: 'in / from / as (m)', ar: 'في / من / مثل (m)', fr: 'dans / de (m)', de: 'in / aus (m)',
      it: 'in / da (m)', es: 'en / de (m)', zh: '在 / 从 (m)', ru: 'в / из (m)',
    },
  },
  O49: {
    unicode: '𓊖',
    phonetic: 'niwt',
    names: {
      en: 'Town Crossroads', ar: 'مفترق طرق (مدينة)', fr: 'Carrefour de ville', de: 'Stadtviertel / Kreuzung',
      it: 'Incrocio cittadino', es: 'Cruce de ciudad', zh: '城市十字路口', ru: 'Перекрёсток города',
    },
    meanings: {
      en: 'town / city / land', ar: 'مدينة / بلدة / أرض', fr: 'ville / cité', de: 'Stadt / Ortschaft',
      it: 'città / località', es: 'ciudad / pueblo', zh: '城市 / 城镇', ru: 'город / поселение',
    },
  },
  F35: {
    unicode: '𓄤',
    phonetic: 'nfr',
    names: {
      en: 'Heart and Windpipe', ar: 'القلب والقصبة الهوائية (نفر)', fr: 'Cœur et trachée', de: 'Herz und Luftröhre',
      it: 'Cuore e trachea', es: 'Corazón y tráquea', zh: '心脏与气管', ru: 'Сердце и трахея',
    },
    meanings: {
      en: 'good / beautiful / perfect', ar: 'جميل / طيب / كامل', fr: 'bon / beau / parfait', de: 'gut / schön / vollkommen',
      it: 'buono / bello / perfetto', es: 'bueno / hermoso / perfecto', zh: '美好 / 善良', ru: 'добрый / прекрасный',
    },
  },
  R4: {
    unicode: '𓊵',
    phonetic: 'Htp',
    names: {
      en: 'Offering Table', ar: 'مائدة قرابين (حتب)', fr: 'Table d’offrande', de: 'Opfertisch',
      it: 'Tavola delle offerte', es: 'Mesa de ofrendas', zh: '供桌', ru: 'Жертвенный стол',
    },
    meanings: {
      en: 'peace / offering / satisfied', ar: 'سلام / قربان / رضا', fr: 'paix / offrande', de: 'Frieden / Opfer',
      it: 'pace / offerta', es: 'paz / ofrenda', zh: '和平 / 祭品', ru: 'мир / подношение',
    },
  },
  Q3: {
    unicode: '𓊪',
    phonetic: 'p',
    names: {
      en: 'Stool / Reed Mat', ar: 'مقعد / حصيرة', fr: 'Tabouret', de: 'Hocker',
      it: 'Sgabello', es: 'Taburete', zh: '凳子', ru: 'Табурет',
    },
    meanings: {
      en: 'seat / phonetic p', ar: 'مقعد / صوت p', fr: 'siège / phonétique p', de: 'Sitz / Laut p',
      it: 'sedile / fonetico p', es: 'asiento / fonético p', zh: '座位 / 音 p', ru: 'сиденье / звук p',
    },
  },
  N5: {
    unicode: '𓇳',
    phonetic: 'ra / hrw',
    names: {
      en: 'Sun Disk', ar: 'قرص الشمس (رع)', fr: 'Disque solaire', de: 'Sonnenscheibe',
      it: 'Disco solare', es: 'Disco solar', zh: '太阳圆盘', ru: 'Солнечный диск',
    },
    meanings: {
      en: 'sun / day / Ra', ar: 'شمس / يوم / رع', fr: 'soleil / jour / Rê', de: 'Sonne / Tag / Re',
      it: 'sole / giorno / Ra', es: 'sol / día / Ra', zh: '太阳 / 白天 / 拉神', ru: 'солнце / день / Ра',
    },
  },
  L1: {
    unicode: '𓆣',
    phonetic: 'xpr',
    names: {
      en: 'Scarab Beetle', ar: 'جعران (خبر)', fr: 'Scarabée', de: 'Skarabäus',
      it: 'Scarabeo', es: 'Escarabajo', zh: '圣甲虫', ru: 'Скарабей',
    },
    meanings: {
      en: 'become / manifestation', ar: 'يتحول / تجلّي', fr: 'devenir / manifestation', de: 'werden / Erscheinung',
      it: 'divenire / manifestazione', es: 'devenir / manifestación', zh: '化生 / 显现', ru: 'становление / проявление',
    },
  },
  O1: {
    unicode: '𓉐',
    phonetic: 'pr',
    names: {
      en: 'House Plan', ar: 'مخطط بيت (بر)', fr: 'Plan de maison', de: 'Hausgrundriss',
      it: 'Pianta di casa', es: 'Plano de casa', zh: '房屋平面图', ru: 'План дома',
    },
    meanings: {
      en: 'house / go out', ar: 'بيت / يخرج', fr: 'maison / sortir', de: 'Haus / hinausgehen',
      it: 'casa / uscire', es: 'casa / salir', zh: '房屋 / 出去', ru: 'дом / выходить',
    },
  },
  D54: {
    unicode: '𓂻',
    phonetic: 'pri / iw',
    names: {
      en: 'Walking Legs', ar: 'ساقان تمشيان', fr: 'Jambes en marche', de: 'Gehende Beine',
      it: 'Gambe che camminano', es: 'Piernas caminando', zh: '行走的双腿', ru: 'Идущие ноги',
    },
    meanings: {
      en: 'go forth / walk / motion', ar: 'يخرج / يمشي / حركة', fr: 'sortir / marcher', de: 'hinausgehen / gehen',
      it: 'uscire / camminare', es: 'salir / caminar', zh: '外出 / 行走', ru: 'выходить / идти',
    },
  },
  Y3: {
    unicode: '𓏞',
    phonetic: 'sS',
    names: {
      en: 'Scribal Kit', ar: 'أدوات الكاتب', fr: 'Palette de scribe', de: 'Schreibzeug',
      it: 'Tavolozza dello scriba', es: 'Paleta de escriba', zh: '书吏文具', ru: 'Прибор писца',
    },
    meanings: {
      en: 'scribe / write / document', ar: 'كاتب / يكتب / وثيقة', fr: 'scribe / écrire', de: 'Schreiber / schreiben',
      it: 'scriba / scrivere', es: 'escriba / escribir', zh: '书吏 / 书写', ru: 'писец / писать',
    },
  },
  G1: {
    unicode: '𓄿',
    phonetic: 'A',
    names: {
      en: 'Egyptian Vulture', ar: 'نسر مصري', fr: 'Vautour percnoptère', de: 'Schmutzgeier',
      it: 'Avvoltoio egizio', es: 'Buitre egipcio', zh: '埃及秃鹫', ru: 'Египетский стервятник',
    },
    meanings: {
      en: 'phonetic A (aleph)', ar: 'صوت أليف (A)', fr: 'phonétique A', de: 'Laut A',
      it: 'fonetico A', es: 'fonético A', zh: '音 A', ru: 'звук A',
    },
  },
  N14: {
    unicode: '𓇼',
    phonetic: 'sbA / dwA',
    names: {
      en: 'Five-Pointed Star', ar: 'نجمة خماسية', fr: 'Étoile à cinq branches', de: 'Fünfzackiger Stern',
      it: 'Stella a cinque punte', es: 'Estrella de cinco puntas', zh: '五角星', ru: 'Пятиконечная звезда',
    },
    meanings: {
      en: 'star / morning / praise', ar: 'نجم / صباح / تسبيح', fr: 'étoile / matin', de: 'Stern / Morgen',
      it: 'stella / mattino', es: 'estrella / mañana', zh: '星星 / 清晨', ru: 'звезда / утро',
    },
  },
  D21: {
    unicode: '𓂋',
    phonetic: 'r',
    names: {
      en: 'Mouth', ar: 'فم', fr: 'Bouche', de: 'Mund',
      it: 'Bocca', es: 'Boca', zh: '嘴', ru: 'Рот',
    },
    meanings: {
      en: 'mouth / toward / to', ar: 'فم / إلى / نحو', fr: 'bouche / vers', de: 'Mund / zu',
      it: 'bocca / verso', es: 'boca / hacia', zh: '嘴 / 向', ru: 'рот / к',
    },
  },
  V28: {
    unicode: '𓎛',
    phonetic: 'H',
    names: {
      en: 'Wick of Twisted Flax', ar: 'فتيلة كتان مجدولة', fr: 'Mèche de lin tressée', de: 'Gedrehter Flachsdocht',
      it: 'Stoppino di lino intrecciato', es: 'Mecha de lino trenzado', zh: '捻亚麻灯芯', ru: 'Скрученный фитиль',
    },
    meanings: {
      en: 'phonetic H', ar: 'صوت ح (H)', fr: 'phonétique H', de: 'Laut H',
      it: 'fonetico H', es: 'fonético H', zh: '音 H', ru: 'звук H',
    },
  },
  D36: {
    unicode: '𓂝',
    phonetic: 'a',
    names: {
      en: 'Forearm', ar: 'ساعد', fr: 'Avant-bras', de: 'Unterarm',
      it: 'Avambraccio', es: 'Antebrazo', zh: '前臂', ru: 'Предплечье',
    },
    meanings: {
      en: 'arm / phonetic ayin', ar: 'ذراع / صوت ع (a)', fr: 'bras / phonétique a', de: 'Arm / Laut a',
      it: 'braccio / fonetico a', es: 'brazo / fonético a', zh: '手臂 / 音 a', ru: 'рука / звук a',
    },
  },
  N35: {
    unicode: '𓈖',
    phonetic: 'n',
    names: {
      en: 'Water Ripple', ar: 'موجة ماء', fr: 'Onde d’eau', de: 'Wasserlinie',
      it: 'Increspatura d’acqua', es: 'Onda de agua', zh: '水波纹', ru: 'Волна воды',
    },
    meanings: {
      en: 'to / for / of (n)', ar: 'إلى / لـ / من (n)', fr: 'à / pour / de (n)', de: 'zu / für (n)',
      it: 'a / per / di (n)', es: 'a / para / de (n)', zh: '向 / 为 (n)', ru: 'к / для (n)',
    },
  },
  M17: {
    unicode: '𓇋',
    phonetic: 'i',
    names: {
      en: 'Reed Leaf', ar: 'ورقة قصب', fr: 'Feuille de roseau', de: 'Schilfblatt',
      it: 'Foglia di canna', es: 'Hoja de junco', zh: '芦苇叶', ru: 'Лист тростника',
    },
    meanings: {
      en: 'phonetic i / y', ar: 'صوت ي (i)', fr: 'phonétique i', de: 'Laut i',
      it: 'fonetico i', es: 'fonético i', zh: '音 i', ru: 'звук i',
    },
  },
  I9: {
    unicode: '𓆑',
    phonetic: 'f',
    names: {
      en: 'Horned Viper', ar: 'أفعى مقرنة', fr: 'Vipère à cornes', de: 'Hornviper',
      it: 'Vipera cornuta', es: 'Víbora cornuda', zh: '角蝰', ru: 'Рогатая гадюка',
    },
    meanings: {
      en: 'he / his (f)', ar: 'هو / ضمير الغائب (f)', fr: 'il / son (f)', de: 'er / sein (f)',
      it: 'egli / suo (f)', es: 'él / su (f)', zh: '他 / 他的 (f)', ru: 'он / его (f)',
    },
  },
  S38: {
    unicode: '𓋾',
    phonetic: 'HqA',
    names: {
      en: 'Crook (Scepter)', ar: 'صولجان الحاكم (حقا)', fr: 'Sceptre héka', de: 'Krummstab',
      it: 'Scettro heka', es: 'Cayado heka', zh: '牧羊杖（统治）', ru: 'Жезл хекa',
    },
    meanings: {
      en: 'ruler / govern', ar: 'حاكم / يحكم', fr: 'souverain / gouverner', de: 'Herrscher / regieren',
      it: 'sovrano / governare', es: 'gobernante / regir', zh: '统治者', ru: 'правитель',
    },
  },
  M13: {
    unicode: '𓇅',
    phonetic: 'wAD',
    names: {
      en: 'Papyrus Stem', ar: 'ساق بردي (واج)', fr: 'Tige de papyrus', de: 'Papyrusstängel',
      it: 'Stelo di papiro', es: 'Tallo de papiro', zh: '纸莎草茎', ru: 'Стебель папируса',
    },
    meanings: {
      en: 'green / flourish', ar: 'أخضر / يزدهر', fr: 'vert / prospérer', de: 'grün / gedeihen',
      it: 'verde / prosperare', es: 'verde / florecer', zh: '绿色 / 繁茂', ru: 'зелёный / процветать',
    },
  },
  I10: {
    unicode: '𓆓',
    phonetic: 'D',
    names: {
      en: 'Cobra', ar: 'كوبرا (ج)', fr: 'Cobra', de: 'Kobra',
      it: 'Cobra', es: 'Cobra', zh: '眼镜蛇', ru: 'Кобра',
    },
    meanings: {
      en: 'speak / phonetic dj (D)', ar: 'يقول / صوت ج (D)', fr: 'dire / phonétique dj', de: 'sprechen / Laut D',
      it: 'dire / fonetico D', es: 'decir / fonético D', zh: '说 / 音 D', ru: 'говорить / звук D',
    },
  },
  Y5: {
    unicode: '𓏠',
    phonetic: 'mn',
    names: {
      en: 'Senet Game Board', ar: 'لوحة سينيت (من)', fr: 'Plateau de senet', de: 'Senet-Spielbrett',
      it: 'Tavoliere di senet', es: 'Tablero de senet', zh: '塞尼特棋盘', ru: 'Доска сенет',
    },
    meanings: {
      en: 'endure / remain', ar: 'يدوم / يثبت', fr: 'durer / demeurer', de: 'bleiben / bestehen',
      it: 'durare / rimanere', es: 'perdurar / permanecer', zh: '持久 / 稳固', ru: 'пребывать / вечный',
    },
  },
  G39: {
    unicode: '𓅭',
    phonetic: 'sA',
    names: {
      en: 'Pintail Duck', ar: 'بطة (سا)', fr: 'Canard pilet', de: 'Spießente',
      it: 'Codone', es: 'Ánade rabudo', zh: '针尾鸭', ru: 'Шилохвость',
    },
    meanings: {
      en: 'son / duck', ar: 'ابن / بطة', fr: 'fils / canard', de: 'Sohn / Ente',
      it: 'figlio / anatra', es: 'hijo / pato', zh: '儿子 / 鸭', ru: 'сын / утка',
    },
  },
  G26: {
    unicode: '𓅞',
    phonetic: 'DHwty',
    names: {
      en: 'Sacred Ibis on Standard', ar: 'أبو منجل المقدس', fr: 'Ibis sacré sur enseigne', de: 'Heiliger Ibis auf Standarte',
      it: 'Ibis sacro su stendardo', es: 'Ibis sagrado en estandarte', zh: '圣朱鹭', ru: 'Священный ибис',
    },
    meanings: {
      en: 'Thoth (god of wisdom)', ar: 'تحوت (رب الحكمة)', fr: 'Thot', de: 'Thoth',
      it: 'Thot', es: 'Tot', zh: '透特神', ru: 'Тот',
    },
  },
  D55: {
    unicode: '𓂼',
    phonetic: 'an',
    names: {
      en: 'Legs Walking Backwards', ar: 'ساقان تمشيان للخلف', fr: 'Jambes marchant à reculons', de: 'Rückwärts gehende Beine',
      it: 'Gambe che camminano indietro', es: 'Piernas caminando hacia atrás', zh: '倒走的双腿', ru: 'Идущие назад ноги',
    },
    meanings: {
      en: 'turn back / return', ar: 'يرجع / يعود', fr: 'revenir / retourner', de: 'zurückkehren',
      it: 'tornare indietro', es: 'regresar', zh: '返回', ru: 'возвращаться',
    },
  },
};

const KNOWN_INSCRIPTIONS = [
  {
    sequence: ['F21', 'A1', 'S43', 'D46', 'X1'],
    transliteration: 'sDm s mdw.t',
    translations: {
      en: 'The man hears the speech',
      ar: 'يسمع الرجل الكلام',
      fr: "L'homme entend la parole",
      de: 'Der Mann hört die Rede',
      it: "L'uomo ascolta il discorso",
      es: 'El hombre escucha el discurso',
      zh: '男子听见了话语',
      ru: 'Мужчина слышит речь',
    },
    purpose: {
      en: 'Middle Egyptian verbal clause (Verb sDm + Subject s + Object mdw.t)',
      ar: 'جملة فعلية في المصرية الوسطى (فعل sDm + فاعل s + مفعول mdw.t)',
      fr: 'Proposition verbale en moyen égyptien (sDm + s + mdw.t)',
      de: 'Mittelägyptischer Verbalsatz (sDm + s + mdw.t)',
      it: 'Frase verbale in medio egiziano (sDm + s + mdw.t)',
      es: 'Oración verbal en egipcio medio (sDm + s + mdw.t)',
      zh: '中古埃及语动词句 (sDm + s + mdw.t)',
      ru: 'Среднеегипетское глагольное предложение (sDm + s + mdw.t)',
    },
  },
  {
    sequence: ['S34', 'U28', 'S29'],
    transliteration: 'anx wDA snb',
    translations: {
      en: 'Life, Prosperity, Health',
      ar: 'الحياة، الازدهار، الصحة',
      fr: 'Vie, Prospérité, Santé',
      de: 'Leben, Heil, Gesundheit',
      it: 'Vita, Prosperità, Salute',
      es: 'Vida, Prosperidad, Salud',
      zh: '生命、繁荣、健康',
      ru: 'Жизнь, Процветание, Здоровье',
    },
    purpose: {
      en: 'Traditional Egyptian royal blessing formula (ankh wedja seneb)',
      ar: 'صيغة الدعاء الملكي المصري التقليدية (عنخ وجا سنب)',
      fr: 'Formule de bénédiction royale égyptienne traditionnelle',
      de: 'Traditionelle ägyptische Königssegensformel',
      it: 'Formula tradizionale di benedizione reale egizia',
      es: 'Fórmula tradicional de bendición real egipcia',
      zh: '古埃及传统王室祝福语',
      ru: 'Традиционная египетская царская формула благословения',
    },
  },
  {
    sequence: ['I6', 'G17', 'X1', 'O49'],
    transliteration: 'kmt',
    translations: {
      en: 'Kemet (Egypt)',
      ar: 'كمت (مصر / الأرض الخصبة)',
      fr: 'Kemet (Égypte)',
      de: 'Kemet (Ägypten)',
      it: 'Kemet (Egitto)',
      es: 'Kemet (Egipto)',
      zh: '凯麦特（古埃及）',
      ru: 'Кемет (Египет)',
    },
    purpose: {
      en: 'Ancient Egyptian endonym for Egypt ("The Black Land") with town determinative O49',
      ar: 'الاسم المصري القديم لمصر ("الأرض السوداء الخصبة") مع مخصص المدينة O49',
      fr: 'Endonyme égyptien antique pour l’Égypte (« La Terre Noire »)',
      de: 'Altägyptischer Name für Ägypten („Das Schwarze Land“)',
      it: 'Nome antico egizio dell’Egitto («La Terra Nera»)',
      es: 'Nombre egipcio antiguo de Egipto («La Tierra Negra»)',
      zh: '古埃及人对埃及的自称（“黑土地”）',
      ru: 'Древнеегипетское название Египта («Чёрная земля»)',
    },
  },
  {
    sequence: ['F35', 'R4', 'X1', 'Q3'],
    transliteration: 'nfr Htp',
    translations: {
      en: 'Good is Peace / Beautiful Offering',
      ar: 'جميل هو السلام / قربان طيب',
      fr: 'Bonne est la Paix / Belle Offrande',
      de: 'Gut ist der Frieden / Schönes Opfer',
      it: 'Buona è la Pace / Bella Offerta',
      es: 'Buena es la Paz / Hermosa Ofrenda',
      zh: '和平是美好的 / 丰盛的祭品',
      ru: 'Благ мир / Прекрасное подношение',
    },
    purpose: {
      en: 'Classical offering and peace phrase combining nfr (F35) and Htp (R4-X1-Q3)',
      ar: 'عبارة سلام وقرابين كلاسيكية تجمع بين نفر (F35) وحتب (R4-X1-Q3)',
      fr: 'Formule classique de paix et d’offrande (nfr Htp)',
      de: 'Klassische Friedens- und Opferformel (nfr Htp)',
      it: 'Formula classica di pace e offerta (nfr Htp)',
      es: 'Fórmula clásica de paz y ofrenda (nfr Htp)',
      zh: '经典和平与献祭短语 (nfr Htp)',
      ru: 'Классическая формула мира и подношения (nfr Htp)',
    },
  },
  {
    sequence: ['O1', 'D54', 'Y3', 'A1', 'G1', 'G17', 'N14', 'N5'],
    transliteration: 'pri sS m dwAw',
    translations: {
      en: 'The scribe goes forth in the morning',
      ar: 'يخرج الكاتب في الصباح',
      fr: 'Le scribe sort le matin',
      de: 'Der Schreiber geht am Morgen hinaus',
      it: 'Lo scriba esce al mattino',
      es: 'El escriba sale por la mañana',
      zh: '书吏在清晨外出',
      ru: 'Писец выходит утром',
    },
    purpose: {
      en: 'Middle Egyptian sentence: verb pri (O1-D54), subject sS (Y3-A1), adverbial phrase m dwAw (G17-N14-N5)',
      ar: 'جملة في المصرية الوسطى: الفعل pri (O1-D54)، الفاعل sS (Y3-A1)، وشبه الجملة m dwAw (G17-N14-N5)',
      fr: 'Phrase en moyen égyptien (pri sS m dwAw)',
      de: 'Mittelägyptischer Satz (pri sS m dwAw)',
      it: 'Frase in medio egiziano (pri sS m dwAw)',
      es: 'Oración en egipcio medio (pri sS m dwAw)',
      zh: '中古埃及语句子 (pri sS m dwAw)',
      ru: 'Среднеегипетское предложение (pri sS m dwAw)',
    },
  },
];

const NO_SIGNS_CONTEXT = {
  en: 'No authentic Gardiner hieroglyphic signs were detected in the image.',
  ar: 'لم يتم رصد علامات هيروغليفية حقيقية من قائمة غاردنر في الصورة.',
  fr: 'Aucun signe hiéroglyphique authentique de Gardiner détecté dans l’image.',
  de: 'Keine authentischen Gardiner-Hieroglyphen im Bild erkannt.',
  it: 'Nessun segno geroglifico autentico di Gardiner rilevato nell’immagine.',
  es: 'No se detectaron signos jeroglíficos auténticos de Gardiner en la imagen.',
  zh: '图像中未检测到真实的加德纳象形文字符号。',
  ru: 'Подлинные иероглифические знаки Гардинера на изображении не обнаружены.',
};

const LITERAL_READING_NOTE = {
  en: (n) => `Strict glyph-by-glyph reading of ${n} visually detected Gardiner sign(s).`,
  ar: (n) => `قراءة حرفية دقيقة لعدد ${n} علامة هيروغليفية مرئية من قائمة غاردنر.`,
  fr: (n) => `Lecture littérale signe par signe de ${n} signe(s) de Gardiner détecté(s).`,
  de: (n) => `Wörtliche Zeichen-für-Zeichen-Lesung von ${n} erkannten Gardiner-Zeichen.`,
  it: (n) => `Lettura letterale segno per segno di ${n} segni di Gardiner rilevati.`,
  es: (n) => `Lectura literal signo por signo de ${n} signo(s) de Gardiner detectados.`,
  zh: (n) => `对检测到的 ${n} 个加德纳符号进行的逐字直译。`,
  ru: (n) => `Дословное чтение знак за знаком (${n} обнаруж. знаков Гардинера).`,
};

function buildVisualExtractionPrompt() {
  return [
    'You are a strict Egyptological visual glyph counter and object describer.',
    'TASK: Count the exact number of distinct hieroglyphic glyphs visibly drawn in the image. Inspect ONLY the physically visible glyphs in reading order (exact count, zero extra signs).',
    '',
    'VISUAL-SHAPE REFERENCE KEY (GROUPED BY WHAT THE OBJECT LOOKS LIKE):',
    '- Body/Human: A1 (seated man), D21 (mouth), D36 (forearm), D46 (hand), D54 (walking legs)',
    '- Animal/Bird: F21 (animal/bovine ear), G1 (vulture/eagle), G17 (owl), G39 (duck), I6 (crocodile scale), I9 (horned viper), I10 (cobra), L1 (scarab beetle)',
    '- Objects/Symbols: S34 (ankh loop cross), U28 (fire drill / wedja), S29 (folded cloth), S43 (vertical staff / club / walking stick), S38 (crook), F35 (heart & windpipe / nefer), Y3 (scribal kit / writing palette), R4 (offering table), Q3 (rectangular stool), X1 (semicircular bread loaf / dome), O1 (house plan), O49 (crossroads circle / town), N5 (sun disk), N14 (five-pointed star), N35 (water ripple), M17 (reed leaf), V28 (twisted flax wick)',
    '',
    'RULES:',
    '- NEVER output more glyphs than are physically visible in the image. If there are 5 glyphs in the image, `glyphs` MUST have length 5.',
    '- NEVER invent, guess, or auto-complete signs that are not visibly drawn.',
    '- Classify as "authentic_inscription" if real Egyptian hieroglyphs (carved on stone/papyrus or rendered as digital/Unicode script) are visible, or "modern_artwork" ONLY if zero real Gardiner signs exist.',
    '- Do NOT generate stories, explanations, or translations.',
    '- Output ONLY raw valid JSON matching:',
    '  { "classification": "authentic_inscription" | "modern_artwork", "readingDirection": "ltr" | "rtl", "confidence": "92%", "glyphs": [ { "visualObject": "<short concrete English noun phrase describing what is drawn>", "candidateCode": "<best Gardiner code>" } ] }',
    '- If no real Gardiner signs are visible, return "glyphs": [].',
  ].join('\n');
}

function resolveVisualToGardinerCode(candidateCode, visualObject) {
  const desc = String(visualObject || '').toLowerCase();
  if (/\bear\b|bovine ear|ox ear/.test(desc)) return 'F21';
  if (/seated man|kneeling man|\bperson\b|seated figure/.test(desc)) return 'A1';
  if (/\bstaff\b|\bstick\b|\bclub\b|\bmace\b|\bbaton\b|\brod\b/.test(desc)) return 'S43';
  if (/\bhand\b|\bpalm\b/.test(desc)) return 'D46';
  if (/\bbread\b|\bloaf\b|semicircle|\bdome\b|half circle/.test(desc)) return 'X1';
  if (/\bankh\b|\blife\b|loop cross/.test(desc)) return 'S34';
  if (/fire drill|\bwedja\b/.test(desc)) return 'U28';
  if (/folded cloth|\bseneb\b|\bsenb\b/.test(desc)) return 'S29';
  if (/walking legs|\blegs\b/.test(desc)) return 'D54';
  if (/scribal|\bpalette\b|\bwriting\b/.test(desc)) return 'Y3';
  if (/\bvulture\b|\beagle\b/.test(desc)) return 'G1';
  if (/\bowl\b/.test(desc)) return 'G17';
  if (/\bhouse\b/.test(desc)) return 'O1';
  if (/\bmouth\b/.test(desc)) return 'D21';
  if (/\bstar\b/.test(desc)) return 'N14';
  if (/\bsun\b/.test(desc)) return 'N5';
  if (/\bscarab\b/.test(desc)) return 'L1';
  if (/\boffering\b/.test(desc)) return 'R4';
  if (/\bstool\b/.test(desc)) return 'Q3';
  if (/\btown\b|crossroads/.test(desc)) return 'O49';
  if (/crocodile/.test(desc)) return 'I6';
  if (/\bheart\b|\bnefer\b/.test(desc)) return 'F35';
  if (/water ripple|\bripple\b/.test(desc)) return 'N35';
  if (/horned viper|\bviper\b/.test(desc)) return 'I9';
  if (/\bcobra\b/.test(desc)) return 'I10';
  if (/reed leaf|\bleaf\b/.test(desc)) return 'M17';
  if (/forearm|\barm\b/.test(desc)) return 'D36';
  if (/twisted flax|\bflax\b|\bwick\b/.test(desc)) return 'V28';
  if (/\bduck\b/.test(desc)) return 'G39';
  if (/\bcrook\b/.test(desc)) return 'S38';

  const clean = String(candidateCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^[A-Z]{1,2}\d+[A-Z]?$/.test(clean)) {
    return clean;
  }
  return '';
}

function normalizeConfidence(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    return `${clamped}%`;
  }
  const str = String(value ?? '').trim();
  if (!str) return '85%';
  if (/^\d+(\.\d+)?$/.test(str)) {
    const clamped = Math.max(0, Math.min(100, Math.round(Number(str))));
    return `${clamped}%`;
  }
  return str;
}

function extractCodesFromVlmSigns(rawSigns) {
  if (!Array.isArray(rawSigns)) return [];
  const sorted = [...rawSigns].sort((a, b) => {
    const pa = typeof a === 'object' && a !== null && Number.isFinite(Number(a.position)) ? Number(a.position) : 0;
    const pb = typeof b === 'object' && b !== null && Number.isFinite(Number(b.position)) ? Number(b.position) : 0;
    return pa - pb;
  });

  const codes = [];
  for (const item of sorted) {
    if (typeof item === 'string') {
      const m = item.trim().match(/^([A-Z]{1,2}\d+[A-Z]?)/i);
      const resolved = resolveVisualToGardinerCode(m ? m[1] : item, item);
      if (resolved) codes.push(resolved);
    } else if (item && typeof item === 'object') {
      const rawCandidate = String(item.candidateCode || item.code || item.symbol || '').trim();
      const visualObj = String(item.visualObject || item.name || item.description || '').trim();
      const resolved = resolveVisualToGardinerCode(rawCandidate, visualObj);
      if (resolved) codes.push(resolved);
    }
  }
  return codes;
}

function formatSignEntry(code, locale) {
  const loc = normalizeLocale(locale);
  const entry = GARDINER_LEXICON[code];
  if (!entry) {
    return code;
  }
  const name = entry.names[loc] || entry.names.en;
  const meaning = entry.meanings[loc] || entry.meanings.en;
  return `${code} (${entry.unicode} · ${entry.phonetic}) - ${name}: ${meaning}`;
}

function decodeInscription(codes, locale) {
  const loc = normalizeLocale(locale);
  if (!codes.length) {
    const msg = NO_SIGNS_CONTEXT[loc] || NO_SIGNS_CONTEXT.en;
    return {
      transliteration: '',
      english_translation: NO_SIGNS_CONTEXT.en,
      arabic_translation: NO_SIGNS_CONTEXT.ar,
      localized_translation: msg,
      epigraphicPurpose: msg,
      contextMeaning: msg,
    };
  }

  const joined = codes.join(',');
  const matched = KNOWN_INSCRIPTIONS.find((item) => item.sequence.join(',') === joined);

  if (matched) {
    return {
      transliteration: matched.transliteration,
      english_translation: matched.translations.en,
      arabic_translation: matched.translations.ar,
      localized_translation: matched.translations[loc] || matched.translations.en,
      epigraphicPurpose: matched.purpose[loc] || matched.purpose.en,
      contextMeaning: matched.purpose[loc] || matched.purpose.en,
    };
  }

  const transliteration = codes
    .map((c) => GARDINER_LEXICON[c]?.phonetic || c)
    .join(' ');
  const enGloss = codes
    .map((c) => GARDINER_LEXICON[c]?.meanings?.en || c)
    .join(' · ');
  const arGloss = codes
    .map((c) => GARDINER_LEXICON[c]?.meanings?.ar || c)
    .join(' · ');
  const locGloss = codes
    .map((c) => {
      const entry = GARDINER_LEXICON[c];
      return entry ? (entry.meanings[loc] || entry.meanings.en) : c;
    })
    .join(' · ');

  const noteFn = LITERAL_READING_NOTE[loc] || LITERAL_READING_NOTE.en;
  const note = noteFn(codes.length);

  return {
    transliteration,
    english_translation: enGloss,
    arabic_translation: arGloss,
    localized_translation: locGloss,
    epigraphicPurpose: note,
    contextMeaning: note,
  };
}

function extractJsonObject(rawText) {
  const cleaned = String(rawText || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  if (!cleaned) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function parseImageDataUrl(req) {
  const formData = await req.formData();
  const image = formData.get('image');
  const language = normalizeLocale(
    String(formData.get('language') || formData.get('locale') || 'en').trim()
  );

  if (!image) {
    return { error: 'Image file is required in form data', status: 400, language };
  }

  if (
    image instanceof Blob ||
    (typeof image === 'object' && typeof image.arrayBuffer === 'function')
  ) {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (!buffer || buffer.length === 0) {
      return { error: 'Uploaded image buffer is empty', status: 400, language };
    }
    const rawType = typeof image.type === 'string' ? image.type.trim() : '';
    const mimeType =
      rawType && rawType.startsWith('image/') ? rawType : 'image/jpeg';
    return {
      dataUrl: `data:${mimeType};base64,${buffer.toString('base64')}`,
      base64: buffer.toString('base64'),
      mimeType,
      language,
    };
  }

  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (!trimmed) {
      return { error: 'Uploaded image string is empty', status: 400, language };
    }
    if (trimmed.startsWith('data:image/')) {
      const m = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      return {
        dataUrl: trimmed,
        mimeType: m?.[1] || 'image/jpeg',
        base64: m?.[2] || '',
        language,
      };
    }
    return {
      dataUrl: `data:image/jpeg;base64,${trimmed}`,
      mimeType: 'image/jpeg',
      base64: trimmed,
      language,
    };
  }

  return { error: 'Invalid image format provided', status: 400, language };
}

function formatVisionResult(parsed, language) {
  const loc = normalizeLocale(language);
  const codes = extractCodesFromVlmSigns(parsed.glyphs ?? parsed.signs ?? parsed.symbols);
  const classification =
    codes.length === 0 || parsed.classification === 'modern_artwork'
      ? 'modern_artwork'
      : 'authentic_inscription';
  const signs = codes.map((code) => formatSignEntry(code, loc));
  const decoded = decodeInscription(codes, loc);

  return {
    classification,
    classification_label: getClassificationLabel(classification, loc),
    readingDirection: parsed.readingDirection || 'ltr',
    transliteration: decoded.transliteration,
    epigraphicPurpose: decoded.epigraphicPurpose,
    historicalContext: decoded.contextMeaning,
    signs,
    symbols: signs,
    english_translation: decoded.english_translation,
    arabic_translation: decoded.arabic_translation,
    localized_translation: decoded.localized_translation,
    confidence: normalizeConfidence(parsed.confidence),
    context: {
      meaning: decoded.contextMeaning,
    },
  };
}

async function callCohereVision(apiKey, imageDataUrl, language) {
  const loc = normalizeLocale(language);
  const systemPrompt = buildVisualExtractionPrompt();
  const userText = 'Count every distinct hieroglyphic glyph visibly drawn in this image and return ONLY the JSON with readingDirection and glyphs[].';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

  try {
    const response = await fetch(COHERE_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: COHERE_VISION_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[hieroglyph-vision] Cohere ${COHERE_VISION_MODEL} HTTP ${response.status}:`, errText);
      throw new Error(`Cohere Vision (${COHERE_VISION_MODEL}) returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawContent =
      data?.message?.content?.[0]?.text ??
      (Array.isArray(data?.message?.content)
        ? data.message.content.map((b) => (typeof b?.text === 'string' ? b.text : '')).join('\n')
        : String(data?.message?.content || ''));
    const parsed = extractJsonObject(rawContent);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error(`Cohere Vision (${COHERE_VISION_MODEL}) returned non-JSON output`);
    }
    return formatVisionResult(parsed, language);
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildGracefulEmptyResult(language) {
  const loc = normalizeLocale(language);
  const msg = getUnavailableError(loc);
  return {
    classification: 'modern_artwork',
    classification_label: getClassificationLabel('modern_artwork', loc),
    transliteration: '',
    signs: [],
    symbols: [],
    english_translation: UNAVAILABLE_ERRORS.en,
    arabic_translation: UNAVAILABLE_ERRORS.ar,
    localized_translation: msg,
    confidence: '0%',
    context: {
      meaning: msg,
    },
  };
}

export async function POST(req) {
  let activeLang = 'en';
  try {
    const parsedInput = await parseImageDataUrl(req);
    activeLang = parsedInput.language || 'en';

    if (parsedInput.error) {
      return NextResponse.json(
        {
          ...buildGracefulEmptyResult(activeLang),
          english_translation: parsedInput.error,
          localized_translation: parsedInput.error,
        },
        { status: 200 }
      );
    }

    const cohereApiKey = (
      process.env.COHERE_API_KEY ||
      process.env['\uFEFFCOHERE_API_KEY'] ||
      ''
    ).trim();

    if (cohereApiKey && parsedInput.dataUrl) {
      try {
        const result = await callCohereVision(
          cohereApiKey,
          parsedInput.dataUrl,
          parsedInput.language
        );
        return NextResponse.json(result, { status: 200 });
      } catch (err) {
        console.warn('[hieroglyph-vision] Cohere Vision failed:', err?.message || err);
      }
    }

    return NextResponse.json(buildGracefulEmptyResult(activeLang), { status: 200 });
  } catch (error) {
    console.error('[translate-hieroglyph] Cohere Vision error:', error?.message || error);
    return NextResponse.json(buildGracefulEmptyResult(activeLang), { status: 200 });
  }
}
