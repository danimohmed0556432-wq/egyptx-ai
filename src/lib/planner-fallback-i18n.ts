import { PlannerLocale } from './planner-preferences';

export interface PlannerResultUI {
  saveTrip: string;
  saving: string;
  saved: string;
  bookJourney: string;
  confirmDayPass: string;
  bookThisDay: string;
  exploreMorePrompt: string;
  updatingLanguage: string;
  travelersUnit: string;
  budgetSuffix: string;
  flexible: string;
  styleSuffix: string;
}

const RESULT_UI: Record<PlannerLocale, PlannerResultUI> = {
  en: {
    saveTrip: 'Save Trip',
    saving: 'Saving...',
    saved: 'Saved!',
    bookJourney: 'Register / Book this Journey',
    confirmDayPass: 'Confirm Day {day} ({city}) Pass with EgyptX Smart Guide',
    bookThisDay: 'Book This Day Plan',
    exploreMorePrompt: 'Want to explore more of Egypt?',
    updatingLanguage: 'Translating your itinerary...',
    travelersUnit: 'Travelers',
    budgetSuffix: 'Budget',
    flexible: 'Flexible',
    styleSuffix: 'Style',
  },
  ar: {
    saveTrip: 'حفظ الرحلة',
    saving: 'جاري الحفظ...',
    saved: 'تم الحفظ',
    bookJourney: 'تسجيل / حجز الرحلة',
    confirmDayPass: 'تأكيد تصريح زيارة اليوم {day} ({city}) مع مرشد EgyptX',
    bookThisDay: 'تسجيل / حجز هذا اليوم',
    exploreMorePrompt: 'هل تود استكشاف المزيد من معالم مصر؟',
    updatingLanguage: 'جاري تحديث برنامج الرحلة باللغة المختارة...',
    travelersUnit: 'مسافر',
    budgetSuffix: 'الميزانية',
    flexible: 'مرنة',
    styleSuffix: 'النمط',
  },
  fr: {
    saveTrip: 'Enregistrer',
    saving: 'Enregistrement...',
    saved: 'Enregistré',
    bookJourney: 'Réserver ce voyage',
    confirmDayPass: 'Confirmer le pass Jour {day} ({city}) avec le guide EgyptX',
    bookThisDay: 'Réserver cette journée',
    exploreMorePrompt: 'Envie de découvrir davantage l’Égypte ?',
    updatingLanguage: 'Traduction de votre itinéraire...',
    travelersUnit: 'Voyageurs',
    budgetSuffix: 'Budget',
    flexible: 'Flexible',
    styleSuffix: 'Style',
  },
  de: {
    saveTrip: 'Reise speichern',
    saving: 'Speichern...',
    saved: 'Gespeichert',
    bookJourney: 'Reise registrieren / buchen',
    confirmDayPass: 'Tag-{day}-Pass ({city}) mit EgyptX Guide bestätigen',
    bookThisDay: 'Diesen Tag buchen',
    exploreMorePrompt: 'Möchten Sie mehr von Ägypten entdecken?',
    updatingLanguage: 'Reiseplan wird übersetzt...',
    travelersUnit: 'Reisende',
    budgetSuffix: 'Budget',
    flexible: 'Flexibel',
    styleSuffix: 'Stil',
  },
  it: {
    saveTrip: 'Salva viaggio',
    saving: 'Salvataggio...',
    saved: 'Salvato',
    bookJourney: 'Prenota questo viaggio',
    confirmDayPass: 'Conferma pass Giorno {day} ({city}) con guida EgyptX',
    bookThisDay: 'Prenota questa giornata',
    exploreMorePrompt: 'Vuoi esplorare di più l’Egitto?',
    updatingLanguage: 'Traduzione dell’itinerario in corso...',
    travelersUnit: 'Viaggiatori',
    budgetSuffix: 'Budget',
    flexible: 'Flessibile',
    styleSuffix: 'Stile',
  },
  es: {
    saveTrip: 'Guardar viaje',
    saving: 'Guardando...',
    saved: 'Guardado',
    bookJourney: 'Reservar este viaje',
    confirmDayPass: 'Confirmar pase Día {day} ({city}) con guía EgyptX',
    bookThisDay: 'Reservar este día',
    exploreMorePrompt: '¿Quieres explorar más de Egipto?',
    updatingLanguage: 'Traduciendo tu itinerario...',
    travelersUnit: 'Viajeros',
    budgetSuffix: 'Presupuesto',
    flexible: 'Flexible',
    styleSuffix: 'Estilo',
  },
  zh: {
    saveTrip: '保存行程',
    saving: '保存中...',
    saved: '已保存',
    bookJourney: '预订此行程',
    confirmDayPass: '确认第 {day} 天（{city}）EgyptX 智能导游通行证',
    bookThisDay: '预订当日行程',
    exploreMorePrompt: '想探索更多埃及精彩吗？',
    updatingLanguage: '正在切换您的行程语言...',
    travelersUnit: '位旅客',
    budgetSuffix: '预算',
    flexible: '灵活',
    styleSuffix: '风格',
  },
  ru: {
    saveTrip: 'Сохранить',
    saving: 'Сохранение...',
    saved: 'Сохранено',
    bookJourney: 'Забронировать поездку',
    confirmDayPass: 'Подтвердить пропуск День {day} ({city}) с гидом EgyptX',
    bookThisDay: 'Забронировать этот день',
    exploreMorePrompt: 'Хотите увидеть больше достопримечательностей Египта?',
    updatingLanguage: 'Перевод маршрута...',
    travelersUnit: 'Путешественников',
    budgetSuffix: 'Бюджет',
    flexible: 'Гибкий',
    styleSuffix: 'Стиль',
  },
};

export function getPlannerResultUI(locale?: string): PlannerResultUI {
  const key = (locale || 'en').slice(0, 2).toLowerCase() as PlannerLocale;
  return RESULT_UI[key] || RESULT_UI.en;
}

const CITY_NAMES: Record<string, Record<PlannerLocale, string>> = {
  Cairo: { en: 'Cairo', ar: 'القاهرة', fr: 'Le Caire', de: 'Kairo', it: 'Il Cairo', es: 'El Cairo', zh: '开罗', ru: 'Каир' },
  Giza: { en: 'Giza', ar: 'الجيزة', fr: 'Gizeh', de: 'Gizeh', it: 'Giza', es: 'Guiza', zh: '吉萨', ru: 'Гиза' },
  Luxor: { en: 'Luxor', ar: 'الأقصر', fr: 'Louxor', de: 'Luxor', it: 'Luxor', es: 'Lúxor', zh: '卢克索', ru: 'Луксор' },
  Aswan: { en: 'Aswan', ar: 'أسوان', fr: 'Assouan', de: 'Assuan', it: 'Assuan', es: 'Asuán', zh: '阿斯旺', ru: 'Асуан' },
  Alexandria: { en: 'Alexandria', ar: 'الإسكندرية', fr: 'Alexandrie', de: 'Alexandria', it: 'Alessandria', es: 'Alejandría', zh: '亚历山大', ru: 'Александрия' },
  Hurghada: { en: 'Hurghada', ar: 'الغردقة', fr: 'Hurghada', de: 'Hurghada', it: 'Hurghada', es: 'Hurgada', zh: '赫尔格达', ru: 'Хургада' },
  'Sharm El-Sheikh': { en: 'Sharm El-Sheikh', ar: 'شرم الشيخ', fr: 'Charm el-Cheikh', de: 'Scharm el-Scheich', it: 'Sharm el-Sheikh', es: 'Sharm el-Sheikh', zh: '沙姆沙伊赫', ru: 'Шарм-эш-Шейх' },
  Siwa: { en: 'Siwa', ar: 'سيوة', fr: 'Siwa', de: 'Siwa', it: 'Siwa', es: 'Siwa', zh: '锡瓦', ru: 'Сива' },
};

export function localizeCityName(city: string, locale: PlannerLocale): string {
  const trimmed = city.trim();
  const match = Object.keys(CITY_NAMES).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase()
  );
  return match ? CITY_NAMES[match][locale] || trimmed : trimmed;
}

interface FallbackTemplateBundle {
  catHistorical: string;
  catCulture: string;
  catRelaxation: string;
  heritageTitle: (city: string) => string;
  heritageDesc: (city: string) => string;
  cultureTitle: (city: string) => string;
  remoteWorkTitle: (city: string) => string;
  cultureDesc: (city: string) => string;
  nileTitle: string;
  nileDesc: (city: string) => string;
  transportCar: string;
  transportWalk: string;
  transportBoat: string;
  tipEasy: string;
  tipEarly: string;
  tipDietary: string;
  tipTea: string;
  tipPhoto: string;
  fact1: (city: string) => string;
  fact2: string;
  fact3: string;
  whyEasy: string;
  whyClustered: string;
  whyRemote: string;
  whyDietary: string;
  whyBalanced: string;
  whyGolden: string;
  whyEvening: string;
}

const FALLBACK_BY_LOCALE: Record<PlannerLocale, FallbackTemplateBundle> = {
  en: {
    catHistorical: 'Historical',
    catCulture: 'Culture',
    catRelaxation: 'Relaxation',
    heritageTitle: (c) => `${c} Heritage Exploration`,
    heritageDesc: (c) => `Discover the monumental landmarks, archaeological treasures, and rich legacy of ${c}.`,
    cultureTitle: (c) => `${c} Cultural Journey`,
    remoteWorkTitle: (c) => `${c} Quiet Lounge & Cultural Break`,
    cultureDesc: (c) => `Experience authentic Egyptian crafts, local culinary traditions, and guided museum collections in ${c}.`,
    nileTitle: 'Nile Sunset & Evening Promenade',
    nileDesc: (c) => `Unwind with an evening stroll along the waterfront or take a traditional felucca sail in ${c}.`,
    transportCar: 'Private A/C Car (15-20 mins)',
    transportWalk: 'Short Walk (10 mins)',
    transportBoat: 'Traditional Felucca Boat',
    tipEasy: 'Request shaded drop-off near the main gate to minimize walking.',
    tipEarly: 'Arrive early to enjoy cooler temperatures and quieter galleries.',
    tipDietary: 'Try fresh vegetarian koshary, ful, and hibiscus tea.',
    tipTea: 'Sample authentic Egyptian mint tea and local crafts.',
    tipPhoto: 'Sunset on the Nile offers warm golden-hour lighting.',
    fact1: (c) => `${c} has stood as a crossroad of civilization for millennia.`,
    fact2: 'Traditional Egyptian hospitality dates back to ancient times.',
    fact3: 'The Nile River has nurtured Egyptian civilization for over 5,000 years.',
    whyEasy: 'Accessible route with minimal walking and comfortable rest stops.',
    whyClustered: 'Geographically clustered flagship landmark matching your selected interests.',
    whyRemote: 'Quiet afternoon stop ideal for remote work with reliable Wi-Fi.',
    whyDietary: 'Authentic Egyptian vegetarian dining and relaxed cultural immersion.',
    whyBalanced: 'Balanced afternoon cultural stop aligned with your travel rhythm.',
    whyGolden: 'Timed specifically for golden-hour Nile photography.',
    whyEvening: 'Relaxing evening promenade suited to your daily rhythm.',
  },
  ar: {
    catHistorical: 'تاريخي',
    catCulture: 'ثقافي',
    catRelaxation: 'استجمام',
    heritageTitle: (c) => `استكشاف معالم ${c} التراثية`,
    heritageDesc: (c) => `اكتشف أبرز المعالم الأثرية والكنوز التاريخية العريقة في ${c}.`,
    cultureTitle: (c) => `جولة ثقافية في ${c}`,
    remoteWorkTitle: (c) => `استراحة هادئة للعمل والثقافة في ${c}`,
    cultureDesc: (c) => `استمتع بالحرف اليدوية المصرية الأصيلة والمأكولات التراثية والمجموعات المتحفية في ${c}.`,
    nileTitle: 'جولة الغروب وكورنيش النيل المسائي',
    nileDesc: (c) => `استمتع بنزهة مسائية هادئة على ضفاف النيل أو رحلة فلوكة تقليدية في ${c}.`,
    transportCar: 'سيارة خاصة مكيفة (15-20 دقيقة)',
    transportWalk: 'مشي خفيف (10 دقائق)',
    transportBoat: 'فلوكة نيلية تقليدية',
    tipEasy: 'اطلب التوصيل حتى البوابة الرئيسية لتقليل مسافة المشي.',
    tipEarly: 'الوصول مبكراً يمنحك أجواءً هادئة ودرجة حرارة لطيفة.',
    tipDietary: 'جرّب الكشري النباتي الطازج والفول وشاي الكركديه.',
    tipTea: 'استمتع بالشاي المصري بالنعناع والأسواق التراثية.',
    tipPhoto: 'وقت الغروب على النيل مثالي لالتقاط صور طبيعية مذهلة.',
    fact1: (c) => `تُعد ${c} ملتقى للحضارات عبر آلاف السنين.`,
    fact2: 'تعود تقاليد الضيافة المصرية الأصيلة إلى العصور القديمة.',
    fact3: 'احتضن نهر النيل الحضارة المصرية لأكثر من 5,000 عام.',
    whyEasy: 'مسار مريح بأقل مجهود مشي مع فترات راحة مناسبة.',
    whyClustered: 'معلم رئيسي ضمن نفس النطاق الجغرافي دون تنقلات مرهقة.',
    whyRemote: 'فترة هادئة مناسبة للعمل أونلاين مع إنترنت مستقر.',
    whyDietary: 'خيارات طعام نباتية مصرية أصيلة وتجربة ثقافية مريحة.',
    whyBalanced: 'تجربة ثقافية متوازنة تناسب إيقاع رحلتك.',
    whyGolden: 'توقيت مثالي لتصوير الغروب على النيل بأفضل إضاءة.',
    whyEvening: 'أجواء مسائية هادئة تناسب جميع الأعمار.',
  },
  fr: {
    catHistorical: 'Historique',
    catCulture: 'Culture',
    catRelaxation: 'Détente',
    heritageTitle: (c) => `Découverte patrimoniale à ${c}`,
    heritageDesc: (c) => `Explorez les monuments emblématiques et les trésors archéologiques de ${c}.`,
    cultureTitle: (c) => `Parcours culturel à ${c}`,
    remoteWorkTitle: (c) => `Pause café calme & culture à ${c}`,
    cultureDesc: (c) => `Découvrez l’artisanat égyptien, les saveurs locales et les musées de ${c}.`,
    nileTitle: 'Coucher de soleil sur le Nil et promenade',
    nileDesc: (c) => `Détendez-vous lors d’une promenade au bord du Nil ou en felouque traditionnelle à ${c}.`,
    transportCar: 'Voiture climatisée privée (15-20 min)',
    transportWalk: 'Courte marche (10 min)',
    transportBoat: 'Felouque traditionnelle',
    tipEasy: 'Demandez une dépose devant l’entrée principale pour limiter la marche.',
    tipEarly: 'Arrivez tôt pour profiter de la fraîcheur et du calme.',
    tipDietary: 'Goûtez au kochari végétarien frais et au thé à l’hibiscus.',
    tipTea: 'Savourez un thé à la menthe égyptien authentique.',
    tipPhoto: 'Le coucher du soleil sur le Nil offre une lumière dorée idéale.',
    fact1: (c) => `${c} est un carrefour millénaire de civilisations.`,
    fact2: 'L’hospitalité égyptienne remonte à l’Antiquité.',
    fact3: 'Le Nil nourrit la civilisation égyptienne depuis plus de 5 000 ans.',
    whyEasy: 'Itinéraire accessible avec peu de marche et des pauses confortables.',
    whyClustered: 'Site majeur regroupé géographiquement selon vos centres d’intérêt.',
    whyRemote: 'Pause calme l’après-midi idéale pour le télétravail avec Wi-Fi.',
    whyDietary: 'Cuisine égyptienne végétarienne authentique et visite détendue.',
    whyBalanced: 'Étape culturelle équilibrée adaptée à votre rythme.',
    whyGolden: 'Programmé spécialement pour la lumière dorée du coucher de soleil.',
    whyEvening: 'Promenade du soir paisible adaptée à votre rythme.',
  },
  de: {
    catHistorical: 'Historisch',
    catCulture: 'Kultur',
    catRelaxation: 'Entspannung',
    heritageTitle: (c) => `Kulturerbe-Entdeckung in ${c}`,
    heritageDesc: (c) => `Entdecken Sie die bedeutenden Monumente und archäologischen Schätze von ${c}.`,
    cultureTitle: (c) => `Kulturelle Reise in ${c}`,
    remoteWorkTitle: (c) => `Ruhige Lounge & Kulturpause in ${c}`,
    cultureDesc: (c) => `Erleben Sie ägyptisches Kunsthandwerk, lokale Küche und Museen in ${c}.`,
    nileTitle: 'Nil-Sonnenuntergang & Abendpromenade',
    nileDesc: (c) => `Entspannen Sie bei einem Spaziergang am Nil oder einer Felukenfahrt in ${c}.`,
    transportCar: 'Privates klimatisiertes Auto (15-20 Min.)',
    transportWalk: 'Kurzer Spaziergang (10 Min.)',
    transportBoat: 'Traditionelle Feluke',
    tipEasy: 'Nutzen Sie den Haupteingang-Drop-off für minimale Gehstrecken.',
    tipEarly: 'Kommen Sie früh für angenehme Temperaturen und ruhige Hallen.',
    tipDietary: 'Probieren Sie frisches vegetarisches Koshari und Hibiskustee.',
    tipTea: 'Genießen Sie authentischen ägyptischen Minztee.',
    tipPhoto: 'Der Sonnenuntergang am Nil bietet perfektes Licht zur Goldenen Stunde.',
    fact1: (c) => `${c} ist seit Jahrtausenden ein Knotenpunkt der Zivilisationen.`,
    fact2: 'Die traditionelle ägyptische Gastfreundschaft reicht bis in die Antike zurück.',
    fact3: 'Der Nil nährt die ägyptische Zivilisation seit über 5.000 Jahren.',
    whyEasy: 'Barrierearme Route mit kurzen Wegen und erholsamen Pausen.',
    whyClustered: 'Räumlich gebündeltes Highlight passend zu Ihren Interessen.',
    whyRemote: 'Ruhiger Nachmittagsstopp mit stabilem WLAN für Remote-Work.',
    whyDietary: 'Authentische vegetarische Küche und entspannte Kultur.',
    whyBalanced: 'Ausgewogener Kulturstopp passend zu Ihrem Tagesrhythmus.',
    whyGolden: 'Ideal getaktet für Fotografie zur Goldenen Stunde am Nil.',
    whyEvening: 'Entspannte Abendpromenade passend zu Ihrem Rhythmus.',
  },
  it: {
    catHistorical: 'Storico',
    catCulture: 'Cultura',
    catRelaxation: 'Relax',
    heritageTitle: (c) => `Esplorazione storica a ${c}`,
    heritageDesc: (c) => `Scopri i monumenti iconici, i tesori archeologici e la storia millenaria di ${c}.`,
    cultureTitle: (c) => `Percorso culturale a ${c}`,
    remoteWorkTitle: (c) => `Pausa tranquilla e cultura a ${c}`,
    cultureDesc: (c) => `Vivi l’artigianato egiziano, le tradizioni culinarie locali e i musei di ${c}.`,
    nileTitle: 'Tramonto sul Nilo e passeggiata serale',
    nileDesc: (c) => `Rilassati con una passeggiata sul lungofiume o un giro in feluca tradizionale a ${c}.`,
    transportCar: 'Auto privata con A/C (15-20 min)',
    transportWalk: 'Breve passeggiata (10 min)',
    transportBoat: 'Feluca tradizionale',
    tipEasy: 'Richiedi l’accesso diretto al cancello principale per camminare poco.',
    tipEarly: 'Arriva presto per goderti il clima fresco e meno folla.',
    tipDietary: 'Assaggia koshary vegetariano fresco, ful e tè all’ibisco.',
    tipTea: 'Gusta l’autentico tè alla menta egiziano.',
    tipPhoto: 'Il tramonto sul Nilo offre una luce dorata perfetta per le foto.',
    fact1: (c) => `${c} è da millenni un crocevia di grandi civiltà.`,
    fact2: 'L’ospitalità egiziana affonda le sue radici nell’antichità.',
    fact3: 'Il fiume Nilo nutre la civiltà egiziana da oltre 5.000 anni.',
    whyEasy: 'Percorso accessibile con poca camminata e soste confortevoli.',
    whyClustered: 'Attrazione principale nella stessa area geografica, senza spostamenti faticosi.',
    whyRemote: 'Sosta pomeridiana tranquilla ideale per lavorare da remoto con Wi-Fi.',
    whyDietary: 'Cucina egiziana vegetariana autentica e visita rilassata.',
    whyBalanced: 'Tappa culturale equilibrata in linea con il tuo ritmo.',
    whyGolden: 'Orario studiato per la fotografia al tramonto sul Nilo.',
    whyEvening: 'Passeggiata serale rilassante adatta al tuo ritmo quotidiano.',
  },
  es: {
    catHistorical: 'Histórico',
    catCulture: 'Cultura',
    catRelaxation: 'Relajación',
    heritageTitle: (c) => `Exploración patrimonial en ${c}`,
    heritageDesc: (c) => `Descubre los monumentos históricos y tesoros arqueológicos de ${c}.`,
    cultureTitle: (c) => `Recorrido cultural en ${c}`,
    remoteWorkTitle: (c) => `Pausa tranquila y cultura en ${c}`,
    cultureDesc: (c) => `Disfruta de la artesanía egipcia, la gastronomía local y los museos de ${c}.`,
    nileTitle: 'Atardecer en el Nilo y paseo nocturno',
    nileDesc: (c) => `Relájate con un paseo junto al río o en faluca tradicional en ${c}.`,
    transportCar: 'Coche privado con A/C (15-20 min)',
    transportWalk: 'Caminata corta (10 min)',
    transportBoat: 'Faluca tradicional',
    tipEasy: 'Solicita acceso directo en la puerta principal para caminar menos.',
    tipEarly: 'Llega temprano para disfrutar de temperaturas más frescas.',
    tipDietary: 'Prueba koshary vegetariano fresco, ful y té de hibisco.',
    tipTea: 'Degusta un auténtico té de menta egipcio.',
    tipPhoto: 'El atardecer en el Nilo ofrece una luz dorada espectacular.',
    fact1: (c) => `${c} ha sido un cruce de civilizaciones durante milenios.`,
    fact2: 'La hospitalidad egipcia se remonta a la época antigua.',
    fact3: 'El río Nilo ha nutrido la civilización egipcia por más de 5,000 años.',
    whyEasy: 'Ruta accesible con poca caminata y pausas cómodas.',
    whyClustered: 'Monumento clave agrupado geográficamente según tus intereses.',
    whyRemote: 'Parada tranquila por la tarde ideal para teletrabajo con Wi-Fi.',
    whyDietary: 'Gastronomía vegetariana auténtica e inmersión cultural tranquila.',
    whyBalanced: 'Parada cultural equilibrada acorde a tu ritmo de viaje.',
    whyGolden: 'Programado especialmente para fotografía en la hora dorada.',
    whyEvening: 'Paseo vespertino relajante adaptado a tu ritmo diario.',
  },
  zh: {
    catHistorical: '历史遗迹',
    catCulture: '文化体验',
    catRelaxation: '休闲观光',
    heritageTitle: (c) => `${c} 历史遗产探索`,
    heritageDesc: (c) => `探索 ${c} 宏伟的历史古迹、考古瑰宝与千年文明传承。`,
    cultureTitle: (c) => `${c} 文化之旅`,
    remoteWorkTitle: (c) => `${c} 安静办公与文化小憩`,
    cultureDesc: (c) => `在 ${c} 体验地道埃及手工艺、传统美食与精选博物馆藏品。`,
    nileTitle: '尼罗河日落与晚间漫步',
    nileDesc: (c) => `在 ${c} 沿着尼罗河畔悠闲漫步，或乘坐传统三角帆船欣赏日落。`,
    transportCar: '空调专车（约 15-20 分钟）',
    transportWalk: '轻松步行（10 分钟）',
    transportBoat: '传统尼罗河三角帆船',
    tipEasy: '可在主入口附近下车，大幅减少步行距离。',
    tipEarly: '建议早间抵达，避开高温与高峰人流。',
    tipDietary: '推荐品尝新鲜素食库沙里、蚕豆泥与洛神花茶。',
    tipTea: '不妨品尝一杯地道埃及薄荷茶。',
    tipPhoto: '尼罗河日落时分的金色光线非常适合摄影。',
    fact1: (c) => `${c} 数千年来一直是人类文明的重要交汇点。`,
    fact2: '埃及热情好客的传统可追溯至古埃及时代。',
    fact3: '尼罗河五千多年来一直孕育着埃及文明。',
    whyEasy: '无障碍轻松路线，步行极少并配有舒适休息时间。',
    whyClustered: '同城地理集中安排，契合您的深度兴趣且不折腾。',
    whyRemote: '午后安静休憩站，配备稳定 Wi-Fi 适合远程办公。',
    whyDietary: '提供地道埃及素食选择与轻松文化体验。',
    whyBalanced: '节奏均衡的文化体验，贴合您的出行作息。',
    whyGolden: '专为尼罗河日落黄金摄影时段安排。',
    whyEvening: '轻松惬意的晚间散步，适合您的每日节奏。',
  },
  ru: {
    catHistorical: 'История',
    catCulture: 'Культура',
    catRelaxation: 'Отдых',
    heritageTitle: (c) => `Исследование наследия: ${c}`,
    heritageDesc: (c) => `Откройте величественные памятники, археологические сокровища и богатое прошлое города ${c}.`,
    cultureTitle: (c) => `Культурное путешествие: ${c}`,
    remoteWorkTitle: (c) => `Спокойная лаунж-пауза и культура: ${c}`,
    cultureDesc: (c) => `Познакомьтесь с египетскими ремёслами, местной кухней и музеями города ${c}.`,
    nileTitle: 'Закат на Ниле и вечерняя прогулка',
    nileDesc: (c) => `Отдохните на вечерней прогулке по набережной или прокатитесь на традиционной фелуке в городе ${c}.`,
    transportCar: 'Частный авто с кондиционером (15-20 мин)',
    transportWalk: 'Короткая прогулка (10 мин)',
    transportBoat: 'Традиционная фелука',
    tipEasy: 'Попросите подвезти ко входу, чтобы свести ходьбу к минимуму.',
    tipEarly: 'Приезжайте пораньше, чтобы избежать дневной жары.',
    tipDietary: 'Попробуйте свежий вегетарианский кошари и чай каркаде.',
    tipTea: 'Насладитесь настоящим египетским мятным чаем.',
    tipPhoto: 'Закат на Ниле дарит идеальный золотой свет для фото.',
    fact1: (c) => `${c} на протяжении тысячелетий был перекрёстком цивилизаций.`,
    fact2: 'Традиции египетского гостеприимства уходят корнями в глубокую древность.',
    fact3: 'Река Нил питает египетскую цивилизацию более 5 000 лет.',
    whyEasy: 'Доступный маршрут с минимумом ходьбы и комфортными паузами.',
    whyClustered: 'Ключевой объект в той же локации в соответствии с вашими интересами.',
    whyRemote: 'Спокойный дневной перерыв с надёжным Wi-Fi для удалённой работы.',
    whyDietary: 'Аутентичная вегетарианская кухня и спокойное знакомство с культурой.',
    whyBalanced: 'Сбалансированная культурная остановка в вашем ритме.',
    whyGolden: 'Время выбрано специально для съёмки заката на Ниле.',
    whyEvening: 'Спокойная вечерняя прогулка в удобном для вас ритме.',
  },
};

export function buildLocalizedFallbackDay(params: {
  dayNumber: number;
  rawCity: string;
  locale: PlannerLocale;
  perDayBudget: number;
  dailyRhythm?: string;
  mobilityPace?: string;
  commitments?: string[];
  imageUrls: [string, string, string];
}) {
  const {
    dayNumber,
    rawCity,
    locale,
    perDayBudget,
    dailyRhythm,
    mobilityPace,
    commitments = [],
    imageUrls,
  } = params;

  const tpl = FALLBACK_BY_LOCALE[locale] || FALLBACK_BY_LOCALE.en;
  const city = localizeCityName(rawCity, locale);

  const morningCost = `$${Math.max(20, Math.round(perDayBudget * 0.4))}`;
  const afternoonCost = `$${Math.max(15, Math.round(perDayBudget * 0.3))}`;
  const eveningCost = `$${Math.max(15, Math.round(perDayBudget * 0.3))}`;

  const morningTime =
    dailyRhythm === 'early_bird'
      ? '07:30 AM'
      : dailyRhythm === 'night_owl'
      ? '10:30 AM'
      : '09:00 AM';
  const afternoonTime = commitments.includes('remote_work')
    ? '02:30 PM'
    : dailyRhythm === 'early_bird'
    ? '01:00 PM'
    : '02:00 PM';
  const eveningTime = commitments.includes('golden_hour')
    ? '05:00 PM'
    : dailyRhythm === 'night_owl'
    ? '07:30 PM'
    : '06:30 PM';

  const isEasyOrSenior =
    mobilityPace === 'easy' || commitments.includes('senior_friendly');

  const why1 = isEasyOrSenior ? tpl.whyEasy : tpl.whyClustered;
  const why2 = commitments.includes('remote_work')
    ? tpl.whyRemote
    : commitments.includes('dietary_care')
    ? tpl.whyDietary
    : tpl.whyBalanced;
  const why3 = commitments.includes('golden_hour') ? tpl.whyGolden : tpl.whyEvening;

  return {
    day: dayNumber,
    city,
    activities: [
      {
        time: morningTime,
        name: tpl.heritageTitle(city),
        title: tpl.heritageTitle(city),
        description: tpl.heritageDesc(city),
        type: tpl.catHistorical,
        imagePath: imageUrls[0],
        image_search_query: `${rawCity} ancient temple landmark Egypt`,
        transport: tpl.transportCar,
        transport_mode: tpl.transportCar,
        transport_tip: `~$4 USD`,
        estimated_cost_usd: morningCost,
        cost: morningCost,
        tip: isEasyOrSenior ? tpl.tipEasy : tpl.tipEarly,
        fact: tpl.fact1(city),
        whyMatches: why1,
      },
      {
        time: afternoonTime,
        name: commitments.includes('remote_work')
          ? tpl.remoteWorkTitle(city)
          : tpl.cultureTitle(city),
        title: commitments.includes('remote_work')
          ? tpl.remoteWorkTitle(city)
          : tpl.cultureTitle(city),
        description: tpl.cultureDesc(city),
        type: tpl.catCulture,
        imagePath: imageUrls[1],
        image_search_query: `${rawCity} museum heritage Egypt`,
        transport: tpl.transportWalk,
        transport_mode: tpl.transportWalk,
        estimated_cost_usd: afternoonCost,
        cost: afternoonCost,
        tip: commitments.includes('dietary_care') ? tpl.tipDietary : tpl.tipTea,
        fact: tpl.fact2,
        whyMatches: why2,
      },
      {
        time: eveningTime,
        name: tpl.nileTitle,
        title: tpl.nileTitle,
        description: tpl.nileDesc(city),
        type: tpl.catRelaxation,
        imagePath: imageUrls[2],
        image_search_query: `Nile River sunset ${rawCity} Egypt`,
        transport: tpl.transportBoat,
        transport_mode: tpl.transportBoat,
        estimated_cost_usd: eveningCost,
        cost: eveningCost,
        tip: tpl.tipPhoto,
        fact: tpl.fact3,
        whyMatches: why3,
      },
    ],
  };
}
