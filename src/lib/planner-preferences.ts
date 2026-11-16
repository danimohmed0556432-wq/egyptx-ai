export type PlannerLocale = 'en' | 'ar' | 'fr' | 'de' | 'it' | 'es' | 'zh' | 'ru';

export interface PreferenceOption {
  id: string;
  label: string;
}

export interface PlannerPreferencesBundle {
  optionalTag: string;
  mobilityPaceLabel: string;
  dailyRhythmLabel: string;
  commitmentsLabel: string;
  passionsLabel: string;
  whyMatchesLabel: string;
  mobilityOptions: PreferenceOption[];
  rhythmOptions: PreferenceOption[];
  commitmentOptions: PreferenceOption[];
  passionOptions: PreferenceOption[];
}

const PREFS_BY_LOCALE: Record<PlannerLocale, PlannerPreferencesBundle> = {
  en: {
    optionalTag: 'Optional 1-Tap',
    mobilityPaceLabel: 'Mobility & Pace',
    dailyRhythmLabel: 'Daily Rhythm',
    commitmentsLabel: 'Special Commitments',
    passionsLabel: 'Deep Passions',
    whyMatchesLabel: 'Why this matches you:',
    mobilityOptions: [
      { id: 'easy', label: 'Easy & Accessible (Minimal Walking/Stairs)' },
      { id: 'balanced', label: 'Balanced Explorer' },
      { id: 'active', label: 'Active & Adventurous' },
    ],
    rhythmOptions: [
      { id: 'early_bird', label: 'Early Bird (Sunrise & Morning)' },
      { id: 'balanced_day', label: 'Balanced Daytime' },
      { id: 'night_owl', label: 'Night Owl (Nile & Evening Nights)' },
    ],
    commitmentOptions: [
      { id: 'kid_friendly', label: 'Kid-Friendly Stops' },
      { id: 'senior_friendly', label: 'Senior-Friendly Comfort' },
      { id: 'remote_work', label: 'Remote Work / Wi-Fi Breaks' },
      { id: 'golden_hour', label: 'Golden-Hour Photography' },
      { id: 'dietary_care', label: 'Vegetarian / Dietary Care' },
    ],
    passionOptions: [
      { id: 'pharaonic_wonders', label: 'Pharaonic Wonders & Grand Museums' },
      { id: 'street_food', label: 'Authentic Street Food & Bazaars' },
      { id: 'red_sea', label: 'Red Sea Diving & Beaches' },
      { id: 'islamic_coptic', label: 'Islamic & Coptic Heritage' },
      { id: 'oases_desert', label: 'Oases & Desert Stargazing' },
      { id: 'modern_egypt', label: 'Modern Egypt & New Capital' },
    ],
  },
  ar: {
    optionalTag: 'اختياري بلمسة واحدة',
    mobilityPaceLabel: 'مستوى الحركة والإيقاع',
    dailyRhythmLabel: 'التوقيت المفضل يومياً',
    commitmentsLabel: 'التزامات واهتمامات خاصة',
    passionsLabel: 'شغفك السياحي الأعمق',
    whyMatchesLabel: 'لماذا يناسبك:',
    mobilityOptions: [
      { id: 'easy', label: 'مشي خفيف وبدون مجهود' },
      { id: 'balanced', label: 'إيقاع متوازن' },
      { id: 'active', label: 'مغامرة ونشاط عالي' },
    ],
    rhythmOptions: [
      { id: 'early_bird', label: 'صباحي مع الشروق' },
      { id: 'balanced_day', label: 'منتصف اليوم' },
      { id: 'night_owl', label: 'ليلي وأجواء السهر' },
    ],
    commitmentOptions: [
      { id: 'kid_friendly', label: 'مناسب للأطفال' },
      { id: 'senior_friendly', label: 'راحة لكبار السن' },
      { id: 'remote_work', label: 'فترات للعمل أونلاين' },
      { id: 'golden_hour', label: 'أماكن تصوير الغروب' },
      { id: 'dietary_care', label: 'أكل نباتي / خاص' },
    ],
    passionOptions: [
      { id: 'pharaonic_wonders', label: 'الآثار والمتاحف الكبرى' },
      { id: 'street_food', label: 'الأكل الشعبي والأسواق' },
      { id: 'red_sea', label: 'البحر والغوص والاستجمام' },
      { id: 'islamic_coptic', label: 'التراث الإسلامي والقبطي' },
      { id: 'oases_desert', label: 'الواحات والصحراء' },
      { id: 'modern_egypt', label: 'مصر الحديثة والعاصمة الإدارية' },
    ],
  },
  fr: {
    optionalTag: 'Optionnel en 1 clic',
    mobilityPaceLabel: 'Mobilité et rythme',
    dailyRhythmLabel: 'Rythme quotidien',
    commitmentsLabel: 'Besoins spécifiques',
    passionsLabel: 'Passions culturelles',
    whyMatchesLabel: 'Pourquoi cela vous correspond :',
    mobilityOptions: [
      { id: 'easy', label: 'Facile et accessible (peu de marche)' },
      { id: 'balanced', label: 'Explorateur équilibré' },
      { id: 'active', label: 'Actif et aventurier' },
    ],
    rhythmOptions: [
      { id: 'early_bird', label: 'Lève-tôt (lever du soleil et matin)' },
      { id: 'balanced_day', label: 'Journée équilibrée' },
      { id: 'night_owl', label: 'Noctambule (Nil et soirées)' },
    ],
    commitmentOptions: [
      { id: 'kid_friendly', label: 'Adapté aux enfants' },
      { id: 'senior_friendly', label: 'Confort pour les seniors' },
      { id: 'remote_work', label: 'Pauses télétravail / Wi-Fi' },
      { id: 'golden_hour', label: 'Photo à l’heure dorée' },
      { id: 'dietary_care', label: 'Végétarien / régime spécial' },
    ],
    passionOptions: [
      { id: 'pharaonic_wonders', label: 'Merveilles pharaoniques et musées' },
      { id: 'street_food', label: 'Street food et bazars authentiques' },
      { id: 'red_sea', label: 'Plongée et plages de la mer Rouge' },
      { id: 'islamic_coptic', label: 'Patrimoine islamique et copte' },
      { id: 'oases_desert', label: 'Oasis et nuits étoilées du désert' },
      { id: 'modern_egypt', label: 'Égypte moderne et nouvelle capitale' },
    ],
  },
  de: {
    optionalTag: 'Optional mit 1 Klick',
    mobilityPaceLabel: 'Mobilität & Tempo',
    dailyRhythmLabel: 'Tagesrhythmus',
    commitmentsLabel: 'Besondere Anforderungen',
    passionsLabel: 'Besondere Interessen',
    whyMatchesLabel: 'Warum das zu Ihnen passt:',
    mobilityOptions: [
      { id: 'easy', label: 'Leicht & barrierefrei (wenig Gehen)' },
      { id: 'balanced', label: 'Ausgewogener Entdecker' },
      { id: 'active', label: 'Aktiv & abenteuerlustig' },
    ],
    rhythmOptions: [
      { id: 'early_bird', label: 'Frühaufsteher (Sonnenaufgang)' },
      { id: 'balanced_day', label: 'Ausgewogener Tag' },
      { id: 'night_owl', label: 'Nachtschwärmer (Nil & Abende)' },
    ],
    commitmentOptions: [
      { id: 'kid_friendly', label: 'Kinderfreundliche Stopps' },
      { id: 'senior_friendly', label: 'Komfort für Senioren' },
      { id: 'remote_work', label: 'Remote-Work / WLAN-Pausen' },
      { id: 'golden_hour', label: 'Fotografie zur Goldenen Stunde' },
      { id: 'dietary_care', label: 'Vegetarisch / Sonderkost' },
    ],
    passionOptions: [
      { id: 'pharaonic_wonders', label: 'Pharaonenwunder & Große Museen' },
      { id: 'street_food', label: 'Authentisches Streetfood & Basare' },
      { id: 'red_sea', label: 'Rotes Meer Tauchen & Strände' },
      { id: 'islamic_coptic', label: 'Islamisches & koptisches Erbe' },
      { id: 'oases_desert', label: 'Oasen & Wüsten-Sternenhimmel' },
      { id: 'modern_egypt', label: 'Modernes Ägypten & Neue Hauptstadt' },
    ],
  },
  it: {
    optionalTag: 'Opzionale con 1 clic',
    mobilityPaceLabel: 'Mobilità e ritmo',
    dailyRhythmLabel: 'Ritmo quotidiano',
    commitmentsLabel: 'Esigenze specifiche',
    passionsLabel: 'Passioni principali',
    whyMatchesLabel: 'Perché fa per te:',
    mobilityOptions: [
      { id: 'easy', label: 'Facile e accessibile (poca camminata)' },
      { id: 'balanced', label: 'Esploratore equilibrato' },
      { id: 'active', label: 'Attivo e avventuroso' },
    ],
    rhythmOptions: [
      { id: 'early_bird', label: 'Mattiniero (alba e mattina)' },
      { id: 'balanced_day', label: 'Giornata equilibrata' },
      { id: 'night_owl', label: 'Nottambulo (Nilo e serate)' },
    ],
    commitmentOptions: [
      { id: 'kid_friendly', label: 'Adatto ai bambini' },
      { id: 'senior_friendly', label: 'Comfort per anziani' },
      { id: 'remote_work', label: 'Pause lavoro remoto / Wi-Fi' },
      { id: 'golden_hour', label: 'Foto al tramonto (Golden Hour)' },
      { id: 'dietary_care', label: 'Vegetariano / dieta speciale' },
    ],
    passionOptions: [
      { id: 'pharaonic_wonders', label: 'Meraviglie faraoniche e musei' },
      { id: 'street_food', label: 'Street food e bazar autentici' },
      { id: 'red_sea', label: 'Immersioni e spiagge del Mar Rosso' },
      { id: 'islamic_coptic', label: 'Patrimonio islamico e copto' },
      { id: 'oases_desert', label: 'Oasi e stelle nel deserto' },
      { id: 'modern_egypt', label: 'Egitto moderno e Nuova Capitale' },
    ],
  },
  es: {
    optionalTag: 'Opcional en 1 clic',
    mobilityPaceLabel: 'Movilidad y ritmo',
    dailyRhythmLabel: 'Ritmo diario',
    commitmentsLabel: 'Compromisos especiales',
    passionsLabel: 'Pasiones profundas',
    whyMatchesLabel: 'Por qué encaja contigo:',
    mobilityOptions: [
      { id: 'easy', label: 'Fácil y accesible (poca caminata)' },
      { id: 'balanced', label: 'Explorador equilibrado' },
      { id: 'active', label: 'Activo y aventurero' },
    ],
    rhythmOptions: [
      { id: 'early_bird', label: 'Madrugador (amanecer y mañana)' },
      { id: 'balanced_day', label: 'Día equilibrado' },
      { id: 'night_owl', label: 'Noctámbulo (Nilo y noches)' },
    ],
    commitmentOptions: [
      { id: 'kid_friendly', label: 'Paradas aptas para niños' },
      { id: 'senior_friendly', label: 'Comodidad para mayores' },
      { id: 'remote_work', label: 'Pausas de teletrabajo / Wi-Fi' },
      { id: 'golden_hour', label: 'Fotografía en la hora dorada' },
      { id: 'dietary_care', label: 'Vegetariano / dieta especial' },
    ],
    passionOptions: [
      { id: 'pharaonic_wonders', label: 'Maravillas faraónicas y museos' },
      { id: 'street_food', label: 'Comida callejera y bazares' },
      { id: 'red_sea', label: 'Buceo y playas del Mar Rojo' },
      { id: 'islamic_coptic', label: 'Patrimonio islámico y copto' },
      { id: 'oases_desert', label: 'Oasis y estrellas en el desierto' },
      { id: 'modern_egypt', label: 'Egipto moderno y Nueva Capital' },
    ],
  },
  zh: {
    optionalTag: '一键可选偏好',
    mobilityPaceLabel: '行动与节奏',
    dailyRhythmLabel: '每日作息偏好',
    commitmentsLabel: '特别需求',
    passionsLabel: '深度兴趣',
    whyMatchesLabel: '推荐理由：',
    mobilityOptions: [
      { id: 'easy', label: '轻松无障碍（少步行少台阶）' },
      { id: 'balanced', label: '均衡探索' },
      { id: 'active', label: '活力探险' },
    ],
    rhythmOptions: [
      { id: 'early_bird', label: '早起型（日出与清晨）' },
      { id: 'balanced_day', label: '日间均衡' },
      { id: 'night_owl', label: '夜游型（尼罗河与夜晚）' },
    ],
    commitmentOptions: [
      { id: 'kid_friendly', label: '亲子友好景点' },
      { id: 'senior_friendly', label: '长辈舒适关怀' },
      { id: 'remote_work', label: '远程办公 / Wi-Fi 休息' },
      { id: 'golden_hour', label: '日落黄金摄影' },
      { id: 'dietary_care', label: '素食 / 特殊饮食' },
    ],
    passionOptions: [
      { id: 'pharaonic_wonders', label: '法老奇迹与大博物馆' },
      { id: 'street_food', label: '地道街头美食与集市' },
      { id: 'red_sea', label: '红海潜水与海滩' },
      { id: 'islamic_coptic', label: '伊斯兰与科普特遗产' },
      { id: 'oases_desert', label: '绿洲与沙漠观星' },
      { id: 'modern_egypt', label: '现代埃及与新行政首都' },
    ],
  },
  ru: {
    optionalTag: 'Опционально в 1 клик',
    mobilityPaceLabel: 'Мобильность и темп',
    dailyRhythmLabel: 'Ритм дня',
    commitmentsLabel: 'Особые требования',
    passionsLabel: 'Глубокие интересы',
    whyMatchesLabel: 'Почему это вам подходит:',
    mobilityOptions: [
      { id: 'easy', label: 'Лёгкий и доступный (минимум ходьбы)' },
      { id: 'balanced', label: 'Сбалансированный темп' },
      { id: 'active', label: 'Активный и приключенческий' },
    ],
    rhythmOptions: [
      { id: 'early_bird', label: 'Ранняя пташка (рассвет и утро)' },
      { id: 'balanced_day', label: 'Сбалансированный день' },
      { id: 'night_owl', label: 'Сова (Нил и вечерние огни)' },
    ],
    commitmentOptions: [
      { id: 'kid_friendly', label: 'Подходит для детей' },
      { id: 'senior_friendly', label: 'Комфорт для пожилых' },
      { id: 'remote_work', label: 'Удалённая работа / Wi-Fi паузы' },
      { id: 'golden_hour', label: 'Съёмка на закате' },
      { id: 'dietary_care', label: 'Вегетарианское / особое питание' },
    ],
    passionOptions: [
      { id: 'pharaonic_wonders', label: 'Чудеса фараонов и великие музеи' },
      { id: 'street_food', label: 'Уличная еда и базары' },
      { id: 'red_sea', label: 'Дайвинг и пляжи Красного моря' },
      { id: 'islamic_coptic', label: 'Исламское и коптское наследие' },
      { id: 'oases_desert', label: 'Оазисы и звёздное небо пустыни' },
      { id: 'modern_egypt', label: 'Современный Египет и Новая столица' },
    ],
  },
};

export function getPlannerPreferences(locale?: string): PlannerPreferencesBundle {
  const key = (locale || 'en').slice(0, 2).toLowerCase() as PlannerLocale;
  return PREFS_BY_LOCALE[key] || PREFS_BY_LOCALE.en;
}
