/**
 * ===================================================================
 *  ✏️ إعدادات المتجر — هذا الملف الوحيد اللي تعدله لكل عميل
 * ===================================================================
 */
const STORE_CONFIG = {
  storeId: "asala-cafe",          // معرّف فريد لكل متجر (إنجليزي بدون مسافات)
  storeName: "مقهى ومخبز الأصالة",
  logoEmoji: "☕",
  whatsappNumber: "966500000000", // ⚠️ رقم واتساب المتجر بالصيغة الدولية بدون + (مثال: 966551234567)
  currency: "ر.س",
  currencyCode: "SAR",

  // ألوان الهوية (درجات اللون الأساسي من الفاتح للغامق)
  theme: {
    brand: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d" },
  },

  // ---------------- الطلب والتوصيل ----------------
  orderTypes: { delivery: true, pickup: true, dinein: true }, // dinein = طلب من الطاولة (رابط ?table=5 أو باركود)
  estimatedTime: "20 - 35 دقيقة",
  prepTimeMinutes: 15,      // وقت التجهيز
  deliveryTimeMinutes: 20,  // وقت التوصيل (للجدولة)
  deliveryFee: 15,
  freeDeliveryOver: 100,    // 0 = بدون توصيل مجاني
  minOrder: 30,             // الحد الأدنى للتوصيل، 0 = بدون حد

  // ---------------- الضريبة ----------------
  vat: {
    rate: 0.15,
    pricesIncludeVat: true,  // الأسعار في المنيو شاملة الضريبة (المعتاد في السعودية)
    number: "",              // الرقم الضريبي 15 رقم (يظهر أسفل الصفحة)
    crNumber: "",            // رقم السجل التجاري
  },

  // ---------------- أوقات العمل ----------------
  // 0 الأحد ... 6 السبت. الفترة تقدر تمتد بعد منتصف الليل { open: "16:00", close: "02:00" }
  openingHours: {
    0: [{ open: "06:00", close: "23:59" }],
    1: [{ open: "06:00", close: "23:59" }],
    2: [{ open: "06:00", close: "23:59" }],
    3: [{ open: "06:00", close: "23:59" }],
    4: [{ open: "06:00", close: "01:00" }],
    5: [{ open: "13:00", close: "01:00" }],
    6: [{ open: "06:00", close: "23:59" }],
  },
  // جدولة الطلبات لوقت لاحق (وتسمح بالطلب المسبق لما يكون المحل مغلق)
  scheduling: { enabled: true, daysAhead: 2, slotMinutes: 30 },

  // ---------------- الدفع ----------------
  payment: {
    // الدفع الإلكتروني عبر ميسّر (moyasar.com): مدى، فيزا، ماستركارد، Apple Pay، STC Pay
    online: {
      enabled: true,
      publishableKey: "",   // pk_test_... للتجربة أو pk_live_... للتشغيل (من لوحة ميسّر)
      methods: ["creditcard", "applepay", "stcpay"],
      demo: true,           // يعرض الدفع الأونلاين كتجربة بدون مفتاح — اجعله false قبل التسليم للعميل
    },
    cardOnDelivery: true,   // شبكة عند الاستلام
    cash: true,             // كاش عند الاستلام
    bank: { enabled: true, bankName: "", accountName: "", iban: "" }, // يختفي إذا الآيبان فاضي
    payAtCounter: true,     // للطلب المحلي
  },

  // ---------------- الكوبونات ----------------
  // type: percent (نسبة) | fixed (مبلغ) | freeDelivery (توصيل مجاني)
  coupons: [
    { code: "WELCOME10", type: "percent", value: 10, maxDiscount: 20, label: "خصم 10% لأول طلب" },
    { code: "FREE", type: "freeDelivery", minSubtotal: 50, label: "توصيل مجاني" },
    { code: "SAVE15", type: "fixed", value: 15, minSubtotal: 80, label: "خصم 15 ريال" },
  ],

  // ---------------- العروض (البنرات أعلى المنيو) ----------------
  offers: [
    { tag: "عرض الصباح", title: "قهوة + كرواسون بـ 25 ريال", subtitle: "كل يوم حتى 11 الصبح", emoji: "🥐", productId: 21, gradient: "from-amber-600 to-orange-700" },
    { tag: "لأول طلب", title: "خصم 10% على طلبك", subtitle: "استخدم الكود في السلة", emoji: "🎁", coupon: "WELCOME10" },
  ],

  // ---------------- الفرع والتواصل ----------------
  branch: {
    address: "جدة - حي الروضة، شارع الأمير سلطان",
    mapUrl: "https://maps.google.com/?q=21.5433,39.1728",
  },
  socials: { instagram: "", tiktok: "", snapchat: "", x: "" },

  // ---------------- التصنيفات ----------------
  categories: [
    { id: "coffee", name: "القهوة الساخنة", icon: "☕" },
    { id: "cold", name: "المشروبات الباردة", icon: "🧊" },
    { id: "tea", name: "الشاي والمشروبات", icon: "🍵" },
    { id: "bakery", name: "المخبوزات", icon: "🥐" },
    { id: "desserts", name: "الحلويات", icon: "🍰" },
    { id: "breakfast", name: "الفطور والساندويتشات", icon: "🥪" },
  ],

  // ---------------- مجموعات الخيارات ----------------
  // single = اختيار واحد إجباري | multi = إضافات اختيارية. price = الزيادة على السعر
  optionGroups: {
    size: { name: "الحجم", type: "single", choices: [{ label: "صغير", price: 0 }, { label: "وسط", price: 3 }, { label: "كبير", price: 6 }] },
    milk: { name: "نوع الحليب", type: "single", choices: [{ label: "حليب كامل الدسم", price: 0 }, { label: "حليب خالي الدسم", price: 0 }, { label: "حليب الشوفان", price: 4 }, { label: "حليب اللوز", price: 4 }] },
    sweetness: { name: "السكر", type: "single", default: 1, choices: [{ label: "بدون سكر", price: 0 }, { label: "سكر خفيف", price: 0 }, { label: "سكر عادي", price: 0 }, { label: "سكر زيادة", price: 0 }] },
    coffeeExtras: { name: "إضافات", type: "multi", choices: [{ label: "شوت إسبريسو إضافي", price: 4 }, { label: "سيروب فانيلا", price: 2 }, { label: "سيروب كراميل", price: 2 }, { label: "سيروب بندق", price: 2 }] },
    beans: { name: "المحصول", type: "single", choices: [{ label: "إثيوبي — فاكهي", price: 0 }, { label: "كولومبي — شوكولاتي", price: 0 }, { label: "كيني — حمضي", price: 3 }] },
    warm: { name: "التقديم", type: "single", choices: [{ label: "دافئ", price: 0 }, { label: "بارد", price: 0 }] },
    dessertExtras: { name: "إضافات", type: "multi", choices: [{ label: "آيس كريم فانيلا", price: 6 }, { label: "صوص شوكولاتة", price: 3 }] },
    bread: { name: "نوع الخبز", type: "single", choices: [{ label: "كرواسون", price: 0 }, { label: "خبز بريوش", price: 0 }, { label: "خبز أسمر", price: 0 }] },
  },

  // ---------------- الأصناف ----------------
  // image اختياري (إذا ما فيه صورة يظهر الإيموجي) • calories السعرات (مطلوبة من هيئة الغذاء والدواء)
  // options: مجموعات الخيارات • upsell: يظهر كاقتراح في السلة • available: false = نفد • oldPrice: سعر قبل الخصم
  products: [
    // القهوة الساخنة
    { id: 1, category: "coffee", name: "فلات وايت", emoji: "☕", description: "إسبريسو مزدوج مع حليب مبخر برغوة حريرية ناعمة.", price: 18, calories: 120, badge: "الأكثر طلباً ⭐", options: ["size", "milk", "coffeeExtras"], image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&auto=format&fit=crop&q=80" },
    { id: 2, category: "coffee", name: "كورتادو", emoji: "☕", description: "نسبة متساوية بين الإسبريسو والحليب الدافئ.", price: 16, calories: 90, options: ["milk", "coffeeExtras"], image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80" },
    { id: 3, category: "coffee", name: "قهوة مقطرة V60", emoji: "🫖", description: "محصول مختص يتغير أسبوعياً، يُحضّر بالتقطير اليدوي.", price: 20, calories: 5, badge: "مميز", options: ["size", "beans"], image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80" },
    { id: 4, category: "coffee", name: "لاتيه", emoji: "☕", description: "إسبريسو مع كمية وفيرة من الحليب المبخر وطبقة رغوة خفيفة.", price: 17, calories: 150, options: ["size", "milk", "coffeeExtras"] },
    { id: 5, category: "coffee", name: "كابتشينو", emoji: "☕", description: "إسبريسو وحليب مبخر برغوة كثيفة ورشة كاكاو.", price: 17, calories: 130, options: ["size", "milk", "coffeeExtras"] },
    { id: 6, category: "coffee", name: "إسبريسو", emoji: "☕", description: "شوت مركز من خلطة البيت.", price: 11, calories: 3, upsell: true },
    { id: 7, category: "coffee", name: "موكا", emoji: "🍫", description: "إسبريسو مع شوكولاتة بلجيكية وحليب مبخر.", price: 20, calories: 290, options: ["size", "milk"] },
    { id: 8, category: "coffee", name: "قهوة سعودية (دلّة)", emoji: "🫗", description: "قهوة عربية بالهيل والزعفران، تكفي 3-4 أشخاص، تقدم مع تمر.", price: 30, calories: 40, badge: "للضيافة", serves: "3-4 أشخاص" },

    // الباردة
    { id: 9, category: "cold", name: "سبانش لاتيه مثلج", emoji: "🧋", description: "إسبريسو مع حليب مكثف محلى وثلج.", price: 22, calories: 260, badge: "الأكثر طلباً ⭐", options: ["size", "milk", "coffeeExtras"], image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80" },
    { id: 10, category: "cold", name: "آيس لاتيه", emoji: "🧊", description: "إسبريسو وحليب بارد على الثلج.", price: 18, calories: 140, options: ["size", "milk", "coffeeExtras"] },
    { id: 11, category: "cold", name: "كولد برو", emoji: "🥤", description: "قهوة منقوعة 18 ساعة بالماء البارد، ناعمة وقليلة الحموضة.", price: 19, calories: 5, options: ["size"] },
    { id: 12, category: "cold", name: "ماتشا لاتيه مثلج", emoji: "🍵", description: "ماتشا ياباني فاخر مع حليب بارد.", price: 23, calories: 180, badge: "جديد 🌿", options: ["size", "milk", "sweetness"] },
    { id: 13, category: "cold", name: "موهيتو ليمون ونعناع", emoji: "🍋", description: "ليمون طازج ونعناع وصودا، منعش بدون كافيين.", price: 16, calories: 110, options: ["size"], upsell: true },
    { id: 14, category: "cold", name: "عصير برتقال طازج", emoji: "🍊", description: "برتقال معصور عند الطلب بدون إضافات.", price: 15, calories: 160, options: ["size"] },
    { id: 15, category: "cold", name: "آيس كركديه بالرمان", emoji: "🌺", description: "كركديه بارد بنكهة الرمان والنعناع.", price: 17, calories: 90, options: ["size", "sweetness"], image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&auto=format&fit=crop&q=80" },

    // الشاي
    { id: 16, category: "tea", name: "شاي كرك", emoji: "🫖", description: "شاي بالحليب والهيل والزعفران على الطريقة الخليجية.", price: 9, calories: 140, badge: "شعبي", options: ["sweetness"], upsell: true },
    { id: 17, category: "tea", name: "شاي أحمر بالنعناع", emoji: "🍵", description: "إبريق شاي يكفي شخصين.", price: 12, calories: 0, options: ["sweetness"], serves: "شخصين" },
    { id: 18, category: "tea", name: "هوت شوكلت", emoji: "🍫", description: "شوكولاتة بلجيكية ساخنة مع مارشملو.", price: 18, calories: 320, options: ["size", "milk"] },

    // المخبوزات
    { id: 19, category: "bakery", name: "كرواسون بالزبدة", emoji: "🥐", description: "كرواسون فرنسي هش يخبز كل صباح.", price: 10, calories: 270, upsell: true },
    { id: 20, category: "bakery", name: "كرواسون زعتر وجبن", emoji: "🥐", description: "محشو بالزعتر البلدي والجبن الأبيض.", price: 14, calories: 340 },
    { id: 21, category: "bakery", name: "عرض الصباح: قهوة + كرواسون", emoji: "🥐", description: "أي قهوة ساخنة صغيرة مع كرواسون بالزبدة.", price: 25, oldPrice: 28, calories: 390, badge: "عرض 🔥", options: ["milk"] },
    { id: 22, category: "bakery", name: "سينابون", emoji: "🌀", description: "لفائف القرفة بالكريمة، تقدم دافئة.", price: 16, calories: 420, options: ["warm"] },

    // الحلويات
    { id: 23, category: "desserts", name: "فرنش توست بالكراميل المملح", emoji: "🍞", description: "بريوش محمّر مع صوص الكراميل ومكسرات.", price: 28, calories: 610, badge: "لذيذ 🍯", options: ["dessertExtras"], image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&auto=format&fit=crop&q=80" },
    { id: 24, category: "desserts", name: "سان سباستيان تشيز كيك", emoji: "🍰", description: "تشيز كيك محروق بقوام كريمي، شريحة كبيرة.", price: 24, calories: 480, badge: "الأكثر طلباً ⭐", options: ["dessertExtras"] },
    { id: 25, category: "desserts", name: "كوكيز شوكولاتة بلجيكية", emoji: "🍪", description: "يخبز يومياً ومحشو بقطع الشوكولاتة الذائبة.", price: 14, calories: 380, upsell: true, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80" },
    { id: 26, category: "desserts", name: "براونيز", emoji: "🟫", description: "براونيز غني بالشوكولاتة الداكنة.", price: 15, calories: 420, options: ["dessertExtras"], upsell: true },
    { id: 27, category: "desserts", name: "كيكة العسل", emoji: "🍯", description: "طبقات كيك بالعسل والكريمة.", price: 22, calories: 450, available: false },

    // الفطور
    { id: 28, category: "breakfast", name: "كرواسون الحلوم والزعتر", emoji: "🧀", description: "كرواسون محشو بالحلوم المشوي والطماطم والزعتر البري.", price: 24, calories: 520, badge: "وجبة فطور", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80" },
    { id: 29, category: "breakfast", name: "ساندويتش ديك رومي وجبن", emoji: "🥪", description: "ديك رومي مدخن وجبن شيدر وخس وصوص الخردل بالعسل.", price: 26, calories: 480, options: ["bread"] },
    { id: 30, category: "breakfast", name: "توست أفوكادو وبيض", emoji: "🥑", description: "خبز ساوردو مع أفوكادو مهروس وبيض مسلوق وبذور.", price: 29, calories: 450 },
    { id: 31, category: "breakfast", name: "شكشوكة", emoji: "🍳", description: "بيض مطبوخ بصلصة الطماطم والفلفل، مع خبز.", price: 25, calories: 410 },
  ],
};
