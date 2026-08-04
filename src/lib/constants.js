// ============================================================
// Design tokens — RAZA TEAM Task Board redesign
// ============================================================

export const BG = "#0a0b0a";
export const BG_SIDEBAR = "#0c0e0b";
export const SURFACE = "#0d0f0b";        // panel / modal
export const SURFACE_1 = "#0e100c";      // status cards, kanban columns
export const SURFACE_2 = "#101208";      // inputs, icon buttons (kept name for compat)
export const SURFACE_ROW = "#0f110c";    // list row
export const SURFACE_CARD = "#121509";   // kanban card
export const SURFACE_CHIP = "#15180f";   // id chip, sidebar hover
export const SURFACE_RAISED = "#1c2016"; // avatar
export const SURFACE_TOGGLE = "#22271b"; // active view-toggle button
export const HOVER_ROW = "#141710";
export const HOVER_CARD = "#171b0e";

export const BORDER = "#1b1e18";         // base / dividers
export const BORDER_ROW = "#1d2118";
export const BORDER_CHIP = "#22271b";
export const BORDER_INPUT = "#23271d";
export const BORDER_STATUS_CHIP = "#25291e";
export const BORDER_STATUS_BTN = "#262c1c";
export const BORDER_HOVER = "#2b3122";
export const BORDER_INPUT_HOVER = "#333a29";
export const BORDER_CARD_HOVER = "#39412c";
export const BORDER_INPUT_FOCUS = "#3d472c";
export const LINE_FILLER = "#16190f";

export const TEXT = "#e8ebe3";
export const TEXT_SECONDARY = "#c3cab7";
export const TEXT_MUTED = "#a8b09a";
export const TEXT_DESC = "#7c8470";
export const TEXT_META = "#6b7361";
export const TEXT_QUIET = "#5d6455";
export const TEXT_QUIETEST = "#4d5346";

export const LIME = "#c8f751";
export const LIME_DIM = "#d6ff62"; // hover state (kept name for backward compat)
export const LIME_HOVER = "#d6ff62";

export const STATUSES = ["Ожидание", "В работе", "На ревью", "Готово"];

export const STATUS_META = {
  "Ожидание": { color: "#8a9078", bg: "rgba(255,255,255,.04)", border: BORDER_STATUS_CHIP, marker: "#8a9078" },
  "В работе": { color: LIME, bg: "rgba(200,247,81,.1)", border: "rgba(200,247,81,.28)", marker: LIME },
  "На ревью": { color: "#6fb4f0", bg: "rgba(255,255,255,.04)", border: BORDER_STATUS_CHIP, marker: "#6fb4f0" },
  "Готово": { color: TEXT_DESC, bg: "rgba(255,255,255,.04)", border: BORDER_STATUS_CHIP, marker: "#4e5a3c" },
};

export const TYPES = ["Видео", "Видео на ленд", "Статика", "Статика на ленд"];
export const TYPE_TAGS = {
  "Видео": "VIDEO",
  "Видео на ленд": "VIDEO / LP",
  "Статика": "STATIC",
  "Статика на ленд": "STATIC / LP",
};
export const FORMATS = ["4:5", "1:1", "16:9", "9:16"];

export const PRIORITIES = [
  { label: "Низкий", tab: TEXT_META },
  { label: "Средний", tab: "#e0a44a" },
  { label: "Высокий", tab: "#f06f6f" },
  { label: "Срочно", tab: "#ff5757" },
];
export const priorityMeta = (label) => PRIORITIES.find((p) => p.label === label) || PRIORITIES[1];

export const BUYER_DOT_COLORS = ["#6fb4f0", "#e0a44a", "#b78ce0", "#7ee08a", "#f0708f", "#f0c96f", LIME];

export const CHART_COLORS = [
  LIME, "#6fb4f0", "#e0a44a", "#b78ce0", "#7ee08a",
  "#f0708f", "#f0c96f", TEXT_META, "#5dd9c1", "#f2a65a",
];

export const COUNTRIES = [
  "Австралия","Австрия","Азербайджан","Албания","Алжир","Ангола","Андорра","Антигуа и Барбуда","Аргентина","Армения",
  "Афганистан","Багамы","Бангладеш","Барбадос","Бахрейн","Беларусь","Белиз","Бельгия","Бенин","Болгария",
  "Боливия","Босния и Герцеговина","Ботсвана","Бразилия","Бруней","Буркина-Фасо","Бурунди","Бутан","Вануату","Великобритания",
  "Венгрия","Венесуэла","Восточный Тимор","Вьетнам","Габон","Гаити","Гайана","Гамбия","Гана","Гватемала",
  "Гвинея","Гвинея-Бисау","Германия","Гондурас","Гренада","Греция","Грузия","Дания","Джибути","Доминика",
  "Доминиканская Республика","Египет","Замбия","Зимбабве","Израиль","Индия","Индонезия","Иордания","Ирак","Иран",
  "Ирландия","Исландия","Испания","Италия","Йемен","Кабо-Верде","Казахстан","Камбоджа","Камерун","Канада",
  "Катар","Кения","Кипр","Киргизия","Кирибати","Китай","Колумбия","Коморы","ДР Конго","Республика Конго",
  "Коста-Рика","Кот-д'Ивуар","Куба","Кувейт","Лаос","Латвия","Лесото","Либерия","Ливан","Ливия",
  "Литва","Лихтенштейн","Люксембург","Маврикий","Мавритания","Мадагаскар","Малави","Малайзия","Мали","Мальдивы",
  "Мальта","Марокко","Маршалловы Острова","Мексика","Микронезия","Мозамбик","Молдова","Монако","Монголия","Мьянма",
  "Намибия","Науру","Непал","Нигер","Нигерия","Нидерланды","Никарагуа","Новая Зеландия","Норвегия","ОАЭ",
  "Оман","Пакистан","Палау","Панама","Папуа - Новая Гвинея","Парагвай","Перу","Польша","Португалия","Россия",
  "Руанда","Румыния","Сальвадор","Самоа","Сан-Марино","Сан-Томе и Принсипи","Саудовская Аравия","Свазиленд (Эсватини)","Сенегал","Сент-Винсент и Гренадины",
  "Сент-Китс и Невис","Сент-Люсия","Сербия","Сейшелы","Сингапур","Сирия","Словакия","Словения","Соломоновы Острова","Сомали",
  "Судан","Суринам","США","Сьерра-Леоне","Таджикистан","Таиланд","Тайвань","Танзания","Того","Тонга",
  "Тринидад и Тобаго","Тувалу","Тунис","Туркменистан","Турция","Уганда","Узбекистан","Украина","Уругвай","Фиджи",
  "Филиппины","Финляндия","Франция","Хорватия","ЦАР","Чад","Черногория","Чехия","Чили","Швейцария",
  "Швеция","Шри-Ланка","Эквадор","Экваториальная Гвинея","Эритрея","Эстония","Эфиопия","ЮАР","Южная Корея","Южный Судан",
  "Ямайка","Япония",
];

export const LANGUAGES = [
  "Английский","Испанский","Китайский","Хинди","Арабский","Бенгальский","Португальский","Русский","Японский","Панджаби",
  "Немецкий","Яванский","Вьетнамский","Телугу","Маратхи","Турецкий","Тамильский","Урду","Корейский","Французский",
  "Итальянский","Тайский","Гуджарати","Персидский","Польский","Украинский","Малайский","Индонезийский","Румынский","Нидерландский",
  "Греческий","Чешский","Шведский","Венгерский","Иврит","Датский","Финский","Норвежский","Словацкий","Болгарский",
  "Сербский","Хорватский","Литовский","Латышский","Эстонский","Словенский","Албанский","Македонский","Боснийский","Азербайджанский",
  "Казахский","Узбекский","Туркменский","Таджикский","Киргизский","Монгольский","Бирманский","Кхмерский","Лаосский","Тагальский",
  "Непальский","Сингальский","Пушту","Курдский","Амхарский","Сомалийский","Суахили","Хауса","Йоруба","Игбо",
  "Зулу","Африкаанс","Малагасийский","Каталанский","Баскский","Галисийский","Ирландский","Валлийский","Исландский","Мальтийский",
  "Грузинский","Армянский","Малаялам","Каннада","Одия","Ассамский","Синдхи","Тигринья","Чева","Волоф",
];

export const COUNTRY_CODES = {
  "Австралия":"AU","Австрия":"AT","Азербайджан":"AZ","Албания":"AL","Алжир":"DZ","Ангола":"AO","Андорра":"AD","Антигуа и Барбуда":"AG","Аргентина":"AR","Армения":"AM",
  "Афганистан":"AF","Багамы":"BS","Бангладеш":"BD","Барбадос":"BB","Бахрейн":"BH","Беларусь":"BY","Белиз":"BZ","Бельгия":"BE","Бенин":"BJ","Болгария":"BG",
  "Боливия":"BO","Босния и Герцеговина":"BA","Ботсвана":"BW","Бразилия":"BR","Бруней":"BN","Буркина-Фасо":"BF","Бурунди":"BI","Бутан":"BT","Вануату":"VU","Великобритания":"GB",
  "Венгрия":"HU","Венесуэла":"VE","Восточный Тимор":"TL","Вьетнам":"VN","Габон":"GA","Гаити":"HT","Гайана":"GY","Гамбия":"GM","Гана":"GH","Гватемала":"GT",
  "Гвинея":"GN","Гвинея-Бисау":"GW","Германия":"DE","Гондурас":"HN","Гренада":"GD","Греция":"GR","Грузия":"GE","Дания":"DK","Джибути":"DJ","Доминика":"DM",
  "Доминиканская Республика":"DO","Египет":"EG","Замбия":"ZM","Зимбабве":"ZW","Израиль":"IL","Индия":"IN","Индонезия":"ID","Иордания":"JO","Ирак":"IQ","Иран":"IR",
  "Ирландия":"IE","Исландия":"IS","Испания":"ES","Италия":"IT","Йемен":"YE","Кабо-Верде":"CV","Казахстан":"KZ","Камбоджа":"KH","Камерун":"CM","Канада":"CA",
  "Катар":"QA","Кения":"KE","Кипр":"CY","Киргизия":"KG","Кирибати":"KI","Китай":"CN","Колумбия":"CO","Коморы":"KM","ДР Конго":"CD","Республика Конго":"CG",
  "Коста-Рика":"CR","Кот-д'Ивуар":"CI","Куба":"CU","Кувейт":"KW","Лаос":"LA","Латвия":"LV","Лесото":"LS","Либерия":"LR","Ливан":"LB","Ливия":"LY",
  "Литва":"LT","Лихтенштейн":"LI","Люксембург":"LU","Маврикий":"MU","Мавритания":"MR","Мадагаскар":"MG","Малави":"MW","Малайзия":"MY","Мали":"ML","Мальдивы":"MV",
  "Мальта":"MT","Марокко":"MA","Маршалловы Острова":"MH","Мексика":"MX","Микронезия":"FM","Мозамбик":"MZ","Молдова":"MD","Монако":"MC","Монголия":"MN","Мьянма":"MM",
  "Намибия":"NA","Науру":"NR","Непал":"NP","Нигер":"NE","Нигерия":"NG","Нидерланды":"NL","Никарагуа":"NI","Новая Зеландия":"NZ","Норвегия":"NO","ОАЭ":"AE",
  "Оман":"OM","Пакистан":"PK","Палау":"PW","Панама":"PA","Папуа - Новая Гвинея":"PG","Парагвай":"PY","Перу":"PE","Польша":"PL","Португалия":"PT","Россия":"RU",
  "Руанда":"RW","Румыния":"RO","Сальвадор":"SV","Самоа":"WS","Сан-Марино":"SM","Сан-Томе и Принсипи":"ST","Саудовская Аравия":"SA","Свазиленд (Эсватини)":"SZ","Сенегал":"SN","Сент-Винсент и Гренадины":"VC",
  "Сент-Китс и Невис":"KN","Сент-Люсия":"LC","Сербия":"RS","Сейшелы":"SC","Сингапур":"SG","Сирия":"SY","Словакия":"SK","Словения":"SI","Соломоновы Острова":"SB","Сомали":"SO",
  "Судан":"SD","Суринам":"SR","США":"US","Сьерра-Леоне":"SL","Таджикистан":"TJ","Таиланд":"TH","Тайвань":"TW","Танзания":"TZ","Того":"TG","Тонга":"TO",
  "Тринидад и Тобаго":"TT","Тувалу":"TV","Тунис":"TN","Туркменистан":"TM","Турция":"TR","Уганда":"UG","Узбекистан":"UZ","Украина":"UA","Уругвай":"UY","Фиджи":"FJ",
  "Филиппины":"PH","Финляндия":"FI","Франция":"FR","Хорватия":"HR","ЦАР":"CF","Чад":"TD","Черногория":"ME","Чехия":"CZ","Чили":"CL","Швейцария":"CH",
  "Швеция":"SE","Шри-Ланка":"LK","Эквадор":"EC","Экваториальная Гвинея":"GQ","Эритрея":"ER","Эстония":"EE","Эфиопия":"ET","ЮАР":"ZA","Южная Корея":"KR","Южный Судан":"SS",
  "Ямайка":"JM","Япония":"JP",
};

export const countryFlag = (name) => {
  const code = COUNTRY_CODES[name];
  if (!code) return "🌐";
  return code.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
};

export const formatDateTime = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const mediaType = (url) => {
  if (!url) return null;
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov|m4v)$/.test(clean)) return "video";
  if (/\.(jpg|jpeg|png|gif|webp)$/.test(clean)) return "image";
  return null;
};

export const FONT_UI = "'Manrope', Helvetica, Arial, sans-serif";
export const FONT_MONO = "'JetBrains Mono', monospace";
// legacy alias used by earlier screens (login/settings/dashboard)
export const FONT_STACK = "'Manrope', Helvetica, Arial, sans-serif";

export const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "9px",
  border: `1px solid ${BORDER_INPUT}`, background: SURFACE_2, fontSize: "13.5px",
  color: TEXT, outline: "none", fontFamily: FONT_UI,
};
export const loginInputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "9px",
  border: `1px solid ${BORDER_INPUT}`, background: SURFACE_2, fontSize: "13.5px",
  color: TEXT, outline: "none", fontFamily: FONT_UI,
};
export const primaryBtnStyle = {
  display: "flex", alignItems: "center", gap: "7px", background: LIME, color: BG,
  border: "none", borderRadius: "9px", padding: "0 15px", height: "34px",
  fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_UI,
  boxShadow: `0 0 0 1px ${LIME}, 0 6px 18px -8px rgba(200,247,81,.6)`, whiteSpace: "nowrap",
};
export const ghostBtnStyle = {
  display: "flex", alignItems: "center", justifyContent: "center", background: SURFACE_2, color: TEXT_QUIET,
  border: `1px solid ${BORDER_INPUT}`, borderRadius: "9px", width: "34px", height: "34px", cursor: "pointer",
};
