/**
 * ===================================================================
 *  ✏️ إعدادات المطعم — هذا الملف الوحيد اللي تعدله لكل عميل
 * ===================================================================
 */
const STORE_CONFIG = {
  storeId: "beit-almandi",          // معرّف فريد لكل متجر (إنجليزي بدون مسافات)
  storeName: "مطعم بيت المندي",
  logoEmoji: "🍖",
  whatsappNumber: "966500000000", // ⚠️ رقم واتساب المطعم بالصيغة الدولية بدون + (مثال: 966551234567)
  currency: "ر.س",
  currencyCode: "SAR",

  // ألوان الهوية (بني زعفراني)
  theme: {
    brand: { 50: "#fdf6ee", 100: "#f9e7d1", 200: "#f1c99c", 500: "#c9792b", 600: "#a85f1c", 700: "#8a4a17", 800: "#6e3b16", 900: "#4a2810" },
  },

  // ---------------- الطلب والتوصيل ----------------
  orderTypes: { delivery: true, pickup: true, dinein: true },
  estimatedTime: "40 - 60 دقيقة",
  prepTimeMinutes: 30,
  deliveryTimeMinutes: 25,
  deliveryFee: 12,
  freeDeliveryOver: 150,
  minOrder: 40,

  // ---------------- الضريبة ----------------
  vat: { rate: 0.15, pricesIncludeVat: true, number: "", crNumber: "" },

  // ---------------- أوقات العمل ----------------
  // دوام صباحي للفطور الشعبي + دوام الغداء والعشاء
  openingHours: {
    0: [{ open: "06:00", close: "10:30" }, { open: "11:30", close: "00:30" }],
    1: [{ open: "06:00", close: "10:30" }, { open: "11:30", close: "00:30" }],
    2: [{ open: "06:00", close: "10:30" }, { open: "11:30", close: "00:30" }],
    3: [{ open: "06:00", close: "10:30" }, { open: "11:30", close: "00:30" }],
    4: [{ open: "06:00", close: "10:30" }, { open: "11:30", close: "01:30" }],
    5: [{ open: "13:00", close: "01:30" }],
    6: [{ open: "06:00", close: "10:30" }, { open: "11:30", close: "00:30" }],
  },
  // الجدولة مهمة للمطاعم الشعبية (طلبات الغداء والمناسبات)
  scheduling: { enabled: true, daysAhead: 3, slotMinutes: 30 },

  // ---------------- الدفع ----------------
  payment: {
    online: {
      enabled: true,
      publishableKey: "",   // pk_test_... أو pk_live_... من لوحة ميسّر (moyasar.com)
      methods: ["creditcard", "applepay", "stcpay"],
      demo: true,           // عرض تجريبي بدون مفتاح — اجعله false قبل التسليم
    },
    cardOnDelivery: true,
    cash: true,
    bank: { enabled: true, bankName: "", accountName: "", iban: "" },
    payAtCounter: true,
  },

  // ---------------- الكوبونات ----------------
  coupons: [
    { code: "AHLAN", type: "percent", value: 10, maxDiscount: 30, label: "خصم 10% — أهلاً فيك" },
    { code: "FAMILY", type: "fixed", value: 25, minSubtotal: 200, label: "خصم 25 ريال لطلبات العائلة" },
    { code: "FREE", type: "freeDelivery", minSubtotal: 80, label: "توصيل مجاني" },
  ],

  // ---------------- العروض ----------------
  offers: [
    { tag: "عرض العائلة", title: "نص خروف مندي + 4 مشروبات", subtitle: "يكفي 5-6 أشخاص مع سلطات ودقوس", emoji: "🍖", productId: 40, gradient: "from-amber-700 to-red-800" },
    { tag: "طلبات العائلة", title: "خصم 25 ريال فوق 200 ريال", subtitle: "استخدم الكود في السلة", emoji: "👨‍👩‍👧‍👦", coupon: "FAMILY" },
    { tag: "الفطور الشعبي", title: "فول وتميس ومعصوب", subtitle: "كل يوم من 6 الصبح لين 10:30", emoji: "🫓", category: "breakfast", gradient: "from-yellow-600 to-amber-700" },
  ],

  // ---------------- الفرع والتواصل ----------------
  branch: {
    address: "جدة - حي الصفا، طريق الأمير ماجد",
    mapUrl: "https://maps.google.com/?q=21.5810,39.2050",
  },
  socials: { instagram: "", tiktok: "", snapchat: "", x: "" },

  // ---------------- التصنيفات ----------------
  categories: [
    { id: "offers", name: "العروض والعائلي", icon: "🔥" },
    { id: "mandi", name: "المندي والمظبي", icon: "🍖" },
    { id: "kabsa", name: "الكبسات والمضغوط", icon: "🍛" },
    { id: "grills", name: "المشاوي", icon: "🔥" },
    { id: "popular", name: "الأكلات الشعبية", icon: "🥘" },
    { id: "breakfast", name: "الفطور الشعبي", icon: "🫓" },
    { id: "sides", name: "المقبلات والسلطات", icon: "🥗" },
    { id: "desserts", name: "الحلى", icon: "🍮" },
    { id: "drinks", name: "المشروبات", icon: "🥤" },
  ],

  // ---------------- مجموعات الخيارات ----------------
  optionGroups: {
    lamb: { name: "الكمية", type: "single", choices: [
      { label: "ربع حاشي/خروف (1-2 شخص)", price: 0 },
      { label: "نص (3-4 أشخاص)", price: 60 },
      { label: "كامل (6-8 أشخاص)", price: 170 },
    ] },
    chicken: { name: "الكمية", type: "single", choices: [
      { label: "نص دجاجة", price: 0 },
      { label: "دجاجة كاملة", price: 18 },
    ] },
    rice: { name: "نوع الرز", type: "single", choices: [
      { label: "رز مندي (أبيض بالبهارات)", price: 0 },
      { label: "رز بخاري (ذهبي)", price: 0 },
      { label: "رز بشاور مع مكسرات وزبيب", price: 6 },
    ] },
    mealExtras: { name: "إضافات", type: "multi", choices: [
      { label: "صحن رز إضافي", price: 10 },
      { label: "دقوس", price: 3 },
      { label: "سلطة خضراء", price: 7 },
      { label: "لبن", price: 4 },
      { label: "مرق", price: 3 },
    ] },
    spice: { name: "الحرارة", type: "single", default: 1, choices: [
      { label: "بدون حار", price: 0 }, { label: "عادي", price: 0 }, { label: "حار", price: 0 },
    ] },
    grillQty: { name: "الكمية", type: "single", choices: [
      { label: "ربع كيلو", price: 0 }, { label: "نص كيلو", price: 32 }, { label: "كيلو", price: 90 },
    ] },
    bread: { name: "الخبز", type: "single", choices: [
      { label: "تميس", price: 0 }, { label: "خبز بر", price: 0 },
    ] },
    sweet: { name: "السكر", type: "single", default: 1, choices: [
      { label: "بدون سكر", price: 0 }, { label: "سكر خفيف", price: 0 }, { label: "سكر عادي", price: 0 },
    ] },
    drinkSize: { name: "الحجم", type: "single", choices: [
      { label: "صغير", price: 0 }, { label: "كبير (لتر)", price: 6 },
    ] },
  },

  // ---------------- الأصناف ----------------
  // image اختياري: ضع رابط صورة الطبق الحقيقية (يفضّل تصوير أطباق المطعم نفسه)
  products: [
    // العروض والعائلي
    { id: 40, category: "offers", name: "عرض العائلة: نص خروف مندي", emoji: "🍖", description: "نص خروف مندي على صينية رز كبيرة، مع 4 مشروبات غازية وسلطة خضراء ودقوس ولبن.", price: 340, oldPrice: 385, calories: 5200, serves: "5-6 أشخاص", badge: "توفير 45 ر.س", options: ["rice"] },
    { id: 41, category: "offers", name: "عرض الشلة: 3 مندي دجاج", emoji: "🍗", description: "3 أنصاص دجاج مندي على رز مع 3 مشروبات وسلطات.", price: 99, oldPrice: 117, calories: 3300, serves: "3 أشخاص", badge: "الأكثر طلباً ⭐", options: ["rice"] },
    { id: 42, category: "offers", name: "صينية المناسبات: خروف كامل", emoji: "🐑", description: "خروف كامل مندي أو مظبي على صينيتين رز مع جميع المقبلات — يُطلب قبل 24 ساعة.", price: 1450, calories: 18000, serves: "15-20 شخص", badge: "اطلب مسبقاً 📅" },

    // المندي والمظبي
    { id: 1, category: "mandi", name: "مندي لحم", emoji: "🍖", description: "لحم حاشي أو خروف بلدي مطهو على الطريقة الحضرمية في التنور، طري يتفكك.", price: 65, calories: 1450, badge: "الأكثر طلباً ⭐", options: ["lamb", "rice", "mealExtras"] },
    { id: 2, category: "mandi", name: "مندي دجاج", emoji: "🍗", description: "دجاج متبل ومطهو في التنور مع رز المندي المدخن.", price: 35, calories: 1100, badge: "الأكثر طلباً ⭐", options: ["chicken", "rice", "mealExtras"] },
    { id: 3, category: "mandi", name: "مظبي لحم", emoji: "🔥", description: "لحم مشوي على الحجر حتى يتحمّر من برّا ويبقى عصيري من جوّا.", price: 70, calories: 1380, options: ["lamb", "rice", "mealExtras"] },
    { id: 4, category: "mandi", name: "مظبي دجاج", emoji: "🔥", description: "دجاج مشوي على الحجر بالبهارات اليمنية.", price: 37, calories: 1050, options: ["chicken", "rice", "mealExtras"] },
    { id: 5, category: "mandi", name: "حنيذ لحم", emoji: "🍖", description: "لحم مطهو ببطء لساعات حتى يصير يذوب، على الطريقة العسيرية.", price: 75, calories: 1500, badge: "مميز", options: ["lamb", "rice", "mealExtras"] },

    // الكبسات والمضغوط
    { id: 6, category: "kabsa", name: "كبسة لحم", emoji: "🍛", description: "كبسة سعودية أصيلة بلحم الخروف والبهارات والطماطم، مع دقوس.", price: 62, calories: 1400, options: ["lamb", "mealExtras"] },
    { id: 7, category: "kabsa", name: "كبسة دجاج", emoji: "🍛", description: "كبسة دجاج على الأصول مع لوز محمّص وزبيب.", price: 34, calories: 1080, options: ["chicken", "mealExtras"] },
    { id: 8, category: "kabsa", name: "مضغوط دجاج", emoji: "🍲", description: "رز ودجاج مطبوخين بالضغط مع البهارات حتى يتشرب الرز المرق.", price: 33, calories: 1020, options: ["chicken", "mealExtras", "spice"] },
    { id: 9, category: "kabsa", name: "مضغوط لحم", emoji: "🍲", description: "لحم ورز بالضغط بنكهة الهيل والليمون الأسود.", price: 60, calories: 1350, options: ["lamb", "mealExtras", "spice"] },
    { id: 10, category: "kabsa", name: "رز بخاري لحم", emoji: "🍚", description: "رز بخاري ذهبي بالجزر والزبيب مع لحم طري.", price: 63, calories: 1420, options: ["lamb", "mealExtras"] },

    // المشاوي
    { id: 11, category: "grills", name: "كباب لحم", emoji: "🍢", description: "كباب لحم بلدي مفروم بالبقدونس والبصل، مشوي على الفحم مع خبز.", price: 28, calories: 650, options: ["grillQty", "spice"] },
    { id: 12, category: "grills", name: "شيش طاووق", emoji: "🍢", description: "صدور دجاج متبلة بالزبادي والثوم، مشوية على الفحم.", price: 26, calories: 520, options: ["grillQty"] },
    { id: 13, category: "grills", name: "ريش غنم", emoji: "🥩", description: "ريش طرية متبلة بالملح والفلفل والروزماري.", price: 48, calories: 780, badge: "فاخر", options: ["grillQty"] },
    { id: 14, category: "grills", name: "مشكل مشاوي", emoji: "🔥", description: "كباب، طاووق، أوصال لحم، وريش — مع خبز وثومية وطحينة.", price: 95, calories: 2100, serves: "2-3 أشخاص" },

    // الأكلات الشعبية
    { id: 15, category: "popular", name: "جريش", emoji: "🥣", description: "جريش قصيمي بالدجاج والسمن البلدي، مع البصل المحمّر.", price: 22, calories: 540, badge: "شعبي" },
    { id: 16, category: "popular", name: "مرقوق", emoji: "🥘", description: "عجينة رقيقة مطبوخة مع اللحم والخضار في مرق غني.", price: 30, calories: 620 },
    { id: 17, category: "popular", name: "قرصان", emoji: "🥘", description: "خبز البر المقطع مع مرق اللحم والقرع والكوسا.", price: 30, calories: 600 },
    { id: 18, category: "popular", name: "سليق", emoji: "🍚", description: "رز مطبوخ بالحليب والمرق مع دجاج مشوي، على الطريقة الطائفية.", price: 36, calories: 980, options: ["chicken"] },
    { id: 19, category: "popular", name: "مقلقل لحم", emoji: "🍳", description: "قطع لحم مقلية بالبصل والطماطم والفلفل، تؤكل مع الخبز.", price: 38, calories: 720, options: ["spice"] },
    { id: 20, category: "popular", name: "مطازيز", emoji: "🥘", description: "عجين مقطع مطبوخ مع اللحم والخضار، أكلة نجدية أصيلة.", price: 30, calories: 610, available: false },

    // الفطور الشعبي
    { id: 21, category: "breakfast", name: "فول بالسمن", emoji: "🫘", description: "فول مدمس بالسمن البلدي والكمون والليمون.", price: 12, calories: 420, options: ["bread"], upsell: true },
    { id: 22, category: "breakfast", name: "تميس", emoji: "🫓", description: "خبز تميس طازج من التنور.", price: 3, calories: 260, upsell: true },
    { id: 23, category: "breakfast", name: "معصوب بالموز والعسل", emoji: "🍯", description: "خبز مفتوت مع موز وسمن وعسل وقشطة.", price: 18, calories: 690, badge: "حجازي" },
    { id: 24, category: "breakfast", name: "شكشوكة", emoji: "🍳", description: "بيض مع طماطم وبصل وفلفل.", price: 14, calories: 380, options: ["bread", "spice"] },
    { id: 25, category: "breakfast", name: "كبدة غنم", emoji: "🍳", description: "كبدة طازجة مقلية بالبصل والفلفل الحار.", price: 22, calories: 450, options: ["bread", "spice"] },
    { id: 26, category: "breakfast", name: "مطبق لحم", emoji: "🥙", description: "عجينة مقرمشة محشوة باللحم المفروم والبيض والكراث.", price: 16, calories: 560 },

    // المقبلات
    { id: 27, category: "sides", name: "سلطة خضراء", emoji: "🥗", description: "خس وطماطم وخيار مع ليمون وزيت زيتون.", price: 9, calories: 90, upsell: true },
    { id: 28, category: "sides", name: "حمص بالطحينة", emoji: "🫘", description: "حمص ناعم بالطحينة وزيت الزيتون.", price: 12, calories: 310 },
    { id: 29, category: "sides", name: "متبل باذنجان", emoji: "🍆", description: "باذنجان مشوي على الفحم مع طحينة ورمان.", price: 13, calories: 240 },
    { id: 30, category: "sides", name: "سمبوسة لحم (5 حبات)", emoji: "🥟", description: "سمبوسة مقرمشة محشوة باللحم والبصل.", price: 15, calories: 520, upsell: true },
    { id: 31, category: "sides", name: "ورق عنب", emoji: "🍃", description: "ورق عنب محشو بالرز والخضار والليمون.", price: 16, calories: 330 },
    { id: 32, category: "sides", name: "شوربة عدس", emoji: "🥣", description: "شوربة عدس كريمية بالكمون مع خبز محمص.", price: 10, calories: 260 },

    // الحلى
    { id: 33, category: "desserts", name: "كنافة بالقشطة", emoji: "🧀", description: "كنافة ناعمة ساخنة بالقشطة والقطر والفستق.", price: 22, calories: 640, badge: "الأكثر طلباً ⭐", upsell: true },
    { id: 34, category: "desserts", name: "لقيمات (12 حبة)", emoji: "🍩", description: "لقيمات مقرمشة بدبس التمر والسمسم.", price: 15, calories: 520, upsell: true },
    { id: 35, category: "desserts", name: "أم علي", emoji: "🍮", description: "حلى ساخن بالعجين والحليب والمكسرات.", price: 18, calories: 580 },
    { id: 36, category: "desserts", name: "بسبوسة بالقشطة", emoji: "🍰", description: "بسبوسة طرية محشوة قشطة.", price: 16, calories: 490 },

    // المشروبات
    { id: 37, category: "drinks", name: "لبن", emoji: "🥛", description: "لبن بارد طازج.", price: 4, calories: 120, upsell: true },
    { id: 38, category: "drinks", name: "شاي عدني", emoji: "🫖", description: "شاي بالحليب والهيل والقرنفل.", price: 6, calories: 130, options: ["sweet"], upsell: true },
    { id: 39, category: "drinks", name: "عصير ليمون بالنعناع", emoji: "🍋", description: "ليمون طازج بالنعناع.", price: 12, calories: 110, options: ["drinkSize"] },
    { id: 43, category: "drinks", name: "مشروب غازي", emoji: "🥤", description: "بيبسي، سفن أب، أو ميرندا.", price: 4, calories: 150 },
    { id: 44, category: "drinks", name: "مويه", emoji: "💧", description: "مياه معدنية 330 مل.", price: 1, calories: 0 },
    { id: 45, category: "drinks", name: "قهوة عربية (دلّة)", emoji: "🫗", description: "قهوة بالهيل والزعفران مع تمر، تكفي 4-5 أشخاص.", price: 25, calories: 40, serves: "4-5 أشخاص" },
  ],
};
