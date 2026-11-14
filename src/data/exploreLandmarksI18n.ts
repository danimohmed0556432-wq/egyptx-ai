export type ExploreLang = 'en' | 'ar' | 'fr' | 'de' | 'it' | 'es' | 'zh' | 'ru';

export interface LocalizedLandmark {
  name: string;
  description: string;
}

const LANDMARKS_I18N: Record<string, Partial<Record<ExploreLang, LocalizedLandmark>>> = {
  'Great Pyramid of Giza': {
    ar: { name: 'أهرامات الجيزة', description: 'العجيبة الوحيدة الباقية من عجائب الدنيا السبع القديمة، شُيّدت في عصر الأسرة الرابعة.' },
    fr: { name: 'Grande Pyramide de Gizeh', description: 'La dernière merveille du monde antique encore debout, édifiée sous la IVe dynastie.' },
    de: { name: 'Große Pyramide von Gizeh', description: 'Das letzte erhaltene Weltwunder der Antike, erbaut während der 4. Dynastie.' },
    it: { name: 'Grande Piramide di Giza', description: 'L’unica meraviglia del mondo antico ancora esistente, costruita durante la IV dinastia.' },
    es: { name: 'Gran Pirámide de Guiza', description: 'La última maravilla del mundo antiguo en pie, construida durante la dinastía IV.' },
    zh: { name: '吉萨大金字塔', description: '唯一保存至今的古代世界七大奇迹，建于古埃及第四王朝。' },
    ru: { name: 'Великая пирамида Гизы', description: 'Единственное сохранившееся чудо Древнего мира, построенное в эпоху IV династии.' },
  },
  'Egyptian Museum Cairo': {
    ar: { name: 'المتحف المصري بالتحرير', description: 'صرح تاريخي عريق يضم أكثر من 120 ألف قطعة أثرية فرعونية نادرة.' },
    fr: { name: 'Musée Égyptien du Caire', description: 'Institution historique abritant plus de 120 000 trésors pharaoniques.' },
    de: { name: 'Ägyptisches Museum Kairo', description: 'Historisches Museum mit über 120.000 pharaonischen Kunstschätzen.' },
    it: { name: 'Museo Egizio del Cairo', description: 'Storico museo neoclassico con oltre 120.000 reperti faraonici.' },
    es: { name: 'Museo Egipcio de El Cairo', description: 'Histórico museo neoclásico con más de 120.000 piezas faraónicas.' },
    zh: { name: '开罗埃及博物馆', description: '历史悠久的新古典主义博物馆，馆藏超过12万件法老时代珍宝。' },
    ru: { name: 'Египетский музей в Каире', description: 'Знаменитый музей, хранящий более 120 000 древнеегипетских артефактов.' },
  },
  'Karnak Temple': {
    ar: { name: 'معبد الكرنك', description: 'أكبر مجمع ديني ومعبد أثري شُيّد في التاريخ الإنساني بالأقصر.' },
    fr: { name: 'Temple de Karnak', description: 'Le plus vaste complexe religieux jamais érigé par l’humanité.' },
    de: { name: 'Tempel von Karnak', description: 'Der größte jemals von Menschenhand errichtete Sakralkomplex.' },
    it: { name: 'Tempio di Karnak', description: 'Il più grande complesso templare mai costruito dall’umanità.' },
    es: { name: 'Templo de Karnak', description: 'El mayor complejo religioso jamás construido por la humanidad.' },
    zh: { name: '卡尔纳克神庙', description: '人类历史上建造的最宏伟的宗教建筑群。' },
    ru: { name: 'Карнакский храм', description: 'Крупнейший храмовый комплекс древности, созданный человечеством.' },
  },
  'Abu Simbel Temples': {
    ar: { name: 'معابد أبو سمبل', description: 'تماثيل رمسيس الثاني العملاقة المنحوتة في صخر الجبل على ضفاف بحيرة ناصر.' },
    fr: { name: 'Temples d’Abou Simbel', description: 'Colosses rupestres de Ramsès II dominant les rives du lac Nasser.' },
    de: { name: 'Tempel von Abu Simbel', description: 'Monumentale Felsentempel Ramses’ II. am Ufer des Nassersees.' },
    it: { name: 'Templi di Abu Simbel', description: 'Colossi rupestri di Ramesse II affacciati sul lago Nasser.' },
    es: { name: 'Templos de Abu Simbel', description: 'Colosos excavados en la roca de Ramsés II junto al lago Nasser.' },
    zh: { name: '阿布辛贝神庙', description: '依山凿刻的拉美西斯二世巨像神庙，守护着纳赛尔湖畔。' },
    ru: { name: 'Храмы Абу-Симбела', description: 'Величественные скальные храмы Рамсеса II на берегу озера Насер.' },
  },
  'Valley of the Kings': {
    ar: { name: 'وادي الملوك', description: 'الجبانة الملكية التي تضم مقابر فراعنة الدولة الحديثة المنحوتة في جبال طيبة.' },
    fr: { name: 'Vallée des Rois', description: 'Nécropole royale creusée au cœur des collines thébaines.' },
    de: { name: 'Tal der Könige', description: 'Königliche Nekropole in den Felsen der thebanischen Berge.' },
    it: { name: 'Valle dei Re', description: 'Necropoli reale scavata nelle colline tebane di Luxor.' },
    es: { name: 'Valle de los Reyes', description: 'Necrópolis real excavada en las montañas tebanas de Lúxor.' },
    zh: { name: '帝王谷', description: '开凿于底比斯山谷中的古埃及法老皇家陵墓群。' },
    ru: { name: 'Долина царей', description: 'Царский некрополь Нового царства в фиванских скалах.' },
  },
  'Siwa Oasis': {
    ar: { name: 'واحة سيوة', description: 'واحة صحراوية ساحرة تشتهر ببحيرات الملح الزمردية ومعبد الوحي القديم.' },
    fr: { name: 'Oasis de Siwa', description: 'Oasis désertique féerique aux lacs salés émeraude et au temple de l’Oracle.' },
    de: { name: 'Oase Siwa', description: 'Märchenhafte Wüstenoase mit smaragdgrünen Salzseen und Orakeltempel.' },
    it: { name: 'Oasi di Siwa', description: 'Incantevole oasi nel deserto con laghi salati color smeraldo.' },
    es: { name: 'Oasis de Siwa', description: 'Oasis del desierto famoso por sus lagos salados esmeralda y su templo del Oráculo.' },
    zh: { name: '锡瓦绿洲', description: '拥有翡翠盐湖与古老神谕神庙的沙漠秘境绿洲。' },
    ru: { name: 'Оазис Сива', description: 'Удивительный оазис с изумрудными солёными озёрами и храмом Оракула.' },
  },
  'Alexandria Library': {
    ar: { name: 'مكتبة الإسكندرية', description: 'إحياء معماري ومعرفي حديث لأعظم مكتبة في العالم القديم.' },
    fr: { name: 'Bibliothèque d’Alexandrie', description: 'Renaissance architecturale et culturelle de la plus grande bibliothèque antique.' },
    de: { name: 'Bibliothek von Alexandria', description: 'Monumentale moderne Wiedergeburt der berühmtesten Bibliothek der Antike.' },
    it: { name: 'Biblioteca di Alessandria', description: 'Monumentale rinascita moderna della più grande biblioteca dell’antichità.' },
    es: { name: 'Biblioteca de Alejandría', description: 'Monumental renacimiento moderno de la mayor biblioteca del mundo antiguo.' },
    zh: { name: '亚历山大图书馆', description: '古代世界最伟大图书馆的现代建筑与学术复兴。' },
    ru: { name: 'Александрийская библиотека', description: 'Величественное современное возрождение величайшей библиотеки древности.' },
  },
  'Red Sea Coast Hurghada': {
    ar: { name: 'ساحل البحر الأحمر - الغردقة', description: 'مياه فيروزية صافية وشعاب مرجانية خلابة وتجارب غوص على مدار العام.' },
    fr: { name: 'Mer Rouge – Hurghada', description: 'Eaux cristallines, récifs coralliens éclatants et plongée toute l’année.' },
    de: { name: 'Rotes Meer – Hurghada', description: 'Kristallklares Wasser, farbenprächtige Korallenriffe und ganzjähriges Tauchen.' },
    it: { name: 'Mar Rosso – Hurghada', description: 'Acque cristalline, barriere coralline vibranti e immersioni tutto l’anno.' },
    es: { name: 'Mar Rojo – Hurgada', description: 'Aguas cristalinas, arrecifes de coral y buceo durante todo el año.' },
    zh: { name: '红海海岸 · 赫尔格达', description: '清澈湛蓝的海水、绚丽珊瑚礁与全年皆宜的潜水胜地。' },
    ru: { name: 'Красное море — Хургада', description: 'Кристально чистая вода, коралловые рифы и дайвинг круглый год.' },
  },
  'Wadi El Hitan': {
    ar: { name: 'وادي الحيتان', description: 'موقع تراث عالمي لليونسكو يضم حفريات حيتان يعود عمرها إلى 40 مليون عام.' },
    fr: { name: 'Wadi El Hitan', description: 'Site UNESCO abritant des fossiles de baleines vieux de 40 millions d’années.' },
    de: { name: 'Wadi al-Hitan', description: 'UNESCO-Welterbe mit 40 Millionen Jahre alten Walfossilien in der Wüste.' },
    it: { name: 'Wadi El Hitan', description: 'Sito UNESCO con fossili di balene risalenti a 40 milioni di anni fa.' },
    es: { name: 'Wadi El Hitan', description: 'Patrimonio de la UNESCO con fósiles de ballenas de hace 40 millones de años.' },
    zh: { name: '鲸鱼谷', description: '联合国教科文组织世界遗产，保存着4000万年前的古鲸鱼化石。' },
    ru: { name: 'Вади-аль-Хитан', description: 'Объект ЮНЕСКО с окаменелостями древних китов возрастом 40 миллионов лет.' },
  },
};

export function getLocalizedLandmark(dest: any, locale: string): LocalizedLandmark {
  const lang = (locale || 'en').toLowerCase().slice(0, 2) as ExploreLang;
  const enName = String(dest?.name_en || dest?.name || '').trim();
  const enDesc = String(dest?.description_en || dest?.description || `Explore ${enName}`).trim();

  if (lang === 'en') {
    return { name: enName, description: enDesc };
  }

  const entry = LANDMARKS_I18N[enName]?.[lang];
  if (entry) return entry;

  if (lang === 'ar') {
    return {
      name: String(dest?.name_ar || enName).trim(),
      description: String(dest?.description_ar || enDesc).trim(),
    };
  }

  return { name: enName, description: enDesc };
}
