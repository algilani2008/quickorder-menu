/**
 * إعدادات المتجر - يمكن تعديلها بسهولة لأي عميل
 */
const STORE_CONFIG = {
  storeName: "مقهى ومخبز الأصالة",
  whatsappNumber: "966500000000", // ⚠️ ضع رقم واتساب المتجر هنا مع المفتاح الدولي بدون علامة + (مثال: 966551234567)
  currency: "ر.س",
  deliveryFee: 15,       // رسوم التوصيل (ضع 0 للتوصيل المجاني)
  freeDeliveryOver: 100, // توصيل مجاني إذا تجاوزت قيمة الأصناف هذا المبلغ (ضع 0 لإلغاء الميزة)
  minOrder: 30,          // الحد الأدنى لقيمة الأصناف في طلبات التوصيل (ضع 0 لإلغائه)
  estimatedTime: "20 - 35 دقيقة",
  logoEmoji: "☕",

  // أوقات العمل (بتوقيت جهاز العميل) - الأيام: 0 الأحد ... 6 السبت
  // يمكن أن تمتد الفترة بعد منتصف الليل، مثال: { open: "16:00", close: "02:00" }
  // اترك يوماً فارغاً [] إذا كان المحل مغلقاً فيه
  openingHours: {
    0: [{ open: "06:00", close: "23:59" }],
    1: [{ open: "06:00", close: "23:59" }],
    2: [{ open: "06:00", close: "23:59" }],
    3: [{ open: "06:00", close: "23:59" }],
    4: [{ open: "06:00", close: "01:00" }],
    5: [{ open: "13:00", close: "01:00" }], // الجمعة بعد الصلاة
    6: [{ open: "06:00", close: "23:59" }],
  },
  allowOrdersWhenClosed: false, // true = يسمح بإرسال الطلب كطلب مسبق حتى لو المحل مغلق

  // بيانات الفرع (تظهر في أسفل الصفحة وعند اختيار الاستلام من الفرع)
  branch: {
    address: "جدة - حي الروضة، شارع الأمير سلطان",
    mapUrl: "https://maps.google.com/?q=21.5433,39.1728",
  },

  // بيانات التحويل البنكي - اترك iban فارغاً لإخفاء خيار التحويل البنكي
  bank: {
    bankName: "",
    accountName: "",
    iban: "",
  },

  // روابط التواصل الاجتماعي (اترك الرابط فارغاً لإخفائه)
  socials: {
    instagram: "",
    tiktok: "",
    snapchat: "",
    x: "",
  },

  // تصنيفات المنيو
  categories: [
    { id: "all", name: "الكل" },
    { id: "coffee", name: "قهوة ومشروبات ساخنة" },
    { id: "cold", name: "مشروبات باردة ومثلجة" },
    { id: "bakery", name: "حلويات ومخبوزات" },
    { id: "breakfast", name: "ساندوتشات وإفطار" },
  ],

  // خيارات جاهزة يمكن إعادة استخدامها في أكثر من صنف
  // type: "single" = اختيار واحد إجباري | "multi" = إضافات اختيارية متعددة
  // price = الزيادة على سعر الصنف الأساسي
  optionGroups: {
    size: {
      name: "الحجم", type: "single",
      choices: [
        { label: "صغير", price: 0 },
        { label: "وسط", price: 3 },
        { label: "كبير", price: 6 },
      ],
    },
    milk: {
      name: "نوع الحليب", type: "single",
      choices: [
        { label: "حليب كامل الدسم", price: 0 },
        { label: "حليب خالي الدسم", price: 0 },
        { label: "حليب الشوفان", price: 4 },
        { label: "حليب اللوز", price: 4 },
      ],
    },
    coffeeExtras: {
      name: "إضافات", type: "multi",
      choices: [
        { label: "شوت إسبريسو إضافي", price: 4 },
        { label: "سيروب فانيلا", price: 2 },
        { label: "سيروب كراميل", price: 2 },
      ],
    },
  },

  // قائمة الأصناف — options: أسماء مجموعات الخيارات من optionGroups (اختياري)
  // available: false لإظهار الصنف كـ "نفد حالياً"
  products: [
    {
      id: 1,
      category: "coffee",
      name: "فلات وايت (Flat White)",
      description: "إسبريسو غني ومزدوج مع حليب مبخر برغوة حريرية وناعمة.",
      price: 18,
      badge: "الأكثر طلباً ⭐",
      options: ["size", "milk", "coffeeExtras"],
      image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      category: "coffee",
      name: "كورتادو كلاسيك",
      description: "توازن مثالي بنسبة متساوية بين الإسبريسو والحليب الدافئ.",
      price: 16,
      badge: "",
      options: ["milk", "coffeeExtras"],
      image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      category: "coffee",
      name: "قهوة اليوم المقطرة (V60)",
      description: "محصول إثيوبي فاخر ذو إيحاءات فاكهية وزهرية منعشة.",
      price: 20,
      badge: "مميز",
      options: ["size"],
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      category: "cold",
      name: "سبانش لاتيه مثلج (Iced Spanish Latte)",
      description: "مزيج منعش من الإسبريسو المركز مع الحليب المكثف المحلى وقطع الثلج.",
      price: 22,
      badge: "الأكثر طلباً ⭐",
      options: ["size", "milk", "coffeeExtras"],
      image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      category: "cold",
      name: "ايس كركديه بالرمان المنعش",
      description: "شاي كركديه بارد بنكهة الرمان والنعناع الطبيعي اللذيذ.",
      price: 17,
      badge: "جديد 🌿",
      options: ["size"],
      image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 6,
      category: "bakery",
      name: "فرنش توست بالكراميل المملح",
      description: "خبز بريوش طري ومحمّر مع صوص الكراميل ورشة مكسرات مقرمشة.",
      price: 28,
      badge: "لذيذ 🍯",
      image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 7,
      category: "bakery",
      name: "كوكيز شوكولاتة بلجيكية فاخرة",
      description: "كوكيز طازج يخبز يومياً ومحشو بقطع الشوكولاتة الذائبة الدافئة.",
      price: 14,
      badge: "",
      image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 8,
      category: "breakfast",
      name: "كرواسون الحلوم المشوي والزعتر",
      description: "كرواسون فرنسي مقرمش وهش محشو بجبن الحلومي المشوي وشرائح الطماطم والزعتر البري.",
      price: 24,
      badge: "وجبة فطور",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80"
    }
  ]
};

// ======================================================================
// حالة التطبيق (State)
// ======================================================================
let currentCategory = "all";
let searchQuery = "";
let cart = []; // [{ key, productId, options: [labels], unitPrice, qty }]
let orderType = "delivery"; // 'delivery' أو 'pickup'
let optionsProduct = null;  // الصنف المفتوح حالياً في نافذة الخيارات
const CART_STORAGE_KEY = "quickorder_cart_" + STORE_CONFIG.whatsappNumber;
const CUSTOMER_STORAGE_KEY = "quickorder_customer";

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  initializeStoreInfo();
  renderCategories();
  renderProducts();
  setupSearch();
  updateCartUI();
  updateStoreStatus();
  setInterval(updateStoreStatus, 60 * 1000);
});

// ======================================================================
// أدوات مساعدة
// ======================================================================
const $ = (id) => document.getElementById(id);
const money = (n) => `${n} ${STORE_CONFIG.currency}`;
const findProduct = (id) => STORE_CONFIG.products.find(p => p.id === id);

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// تحويل الأرقام العربية/الهندية إلى أرقام إنجليزية
function normalizeDigits(str) {
  return str.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

function safeStorage(action, key, value) {
  try {
    if (action === "get") return JSON.parse(localStorage.getItem(key));
    if (action === "set") localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* التخزين غير متاح (وضع التصفح الخاص مثلاً) */ }
  return null;
}

function showToast(text) {
  const toast = $("toast");
  toast.textContent = text;
  toast.classList.remove("opacity-0", "translate-y-4");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("opacity-0", "translate-y-4"), 2200);
}

// ======================================================================
// أوقات العمل
// ======================================================================
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatTime(hhmm) {
  let [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

function isStoreOpen(date = new Date()) {
  const day = date.getDay();
  const mins = date.getHours() * 60 + date.getMinutes();
  const prevDay = (day + 6) % 7;
  const hours = STORE_CONFIG.openingHours || {};

  // فترات اليوم الحالي
  for (const slot of hours[day] || []) {
    const o = toMinutes(slot.open), c = toMinutes(slot.close);
    if (c > o ? (mins >= o && mins < c) : mins >= o) return true;
  }
  // فترات أمس الممتدة بعد منتصف الليل
  for (const slot of hours[prevDay] || []) {
    const o = toMinutes(slot.open), c = toMinutes(slot.close);
    if (c <= o && mins < c) return true;
  }
  return false;
}

function nextOpeningText(date = new Date()) {
  const hours = STORE_CONFIG.openingHours || {};
  const nowMins = date.getHours() * 60 + date.getMinutes();
  for (let i = 0; i < 7; i++) {
    const day = (date.getDay() + i) % 7;
    const slots = (hours[day] || []).slice().sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
    for (const slot of slots) {
      if (i === 0 && toMinutes(slot.open) <= nowMins) continue;
      const when = i === 0 ? "اليوم" : i === 1 ? "غداً" : `يوم ${DAY_NAMES[day]}`;
      return `يفتح ${when} ${formatTime(slot.open)}`;
    }
  }
  return "";
}

function updateStoreStatus() {
  const open = isStoreOpen();
  const status = $("storeStatus");
  if (open) {
    status.className = "inline-flex items-center gap-1 text-emerald-600 font-medium";
    status.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> مفتوح الآن`;
  } else {
    status.className = "inline-flex items-center gap-1 text-red-600 font-medium";
    const next = nextOpeningText();
    status.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span> مغلق حالياً${next ? " • " + next : ""}`;
  }
  $("deliveryTimeWrap").classList.toggle("hidden", !open);
  $("closedBanner").classList.toggle("hidden", open);
  if (!open) {
    $("closedBannerText").textContent = STORE_CONFIG.allowOrdersWhenClosed
      ? `المحل مغلق الآن، ويمكنك إرسال طلبك كطلب مسبق. ${nextOpeningText()}`
      : `المحل مغلق الآن ولا نستقبل الطلبات. ${nextOpeningText()}`;
  }
}

function renderHoursList() {
  const hours = STORE_CONFIG.openingHours || {};
  // ترتيب الأسبوع من السبت
  return [6, 0, 1, 2, 3, 4, 5].map(d => {
    const slots = hours[d] || [];
    const text = slots.length
      ? slots.map(s => `${formatTime(s.open)} - ${formatTime(s.close)}`).join("، ")
      : "مغلق";
    const isToday = new Date().getDay() === d;
    return `<div class="flex justify-between ${isToday ? "font-bold text-emerald-700" : ""}"><span>${DAY_NAMES[d]}</span><span dir="ltr">${text}</span></div>`;
  }).join("");
}

// ======================================================================
// تهيئة بيانات المتجر في الواجهة
// ======================================================================
function initializeStoreInfo() {
  document.title = `${STORE_CONFIG.storeName} | اطلب عبر الواتساب`;
  $("storeName").textContent = STORE_CONFIG.storeName;
  $("storeLogo").textContent = STORE_CONFIG.logoEmoji;
  $("deliveryTime").textContent = STORE_CONFIG.estimatedTime;
  $("directWhatsAppBtn").href = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent("السلام عليكم، عندي استفسار بخصوص المنيو والطلبات")}`;

  // إخفاء التحويل البنكي إذا لم تُدخل بيانات الحساب
  if (!STORE_CONFIG.bank || !STORE_CONFIG.bank.iban) {
    const opt = document.querySelector('#paymentMethod option[value="تحويل بنكي"]');
    if (opt) opt.remove();
  }
  $("paymentMethod").addEventListener("change", updateBankInfo);

  // تذييل الصفحة
  const b = STORE_CONFIG.branch || {};
  $("footerStoreName").textContent = STORE_CONFIG.storeName;
  if (b.address) {
    $("footerAddress").textContent = b.address;
    $("pickupAddress").textContent = b.address;
  } else {
    $("footerAddressRow").classList.add("hidden");
  }
  if (b.mapUrl) {
    $("footerMapLink").href = b.mapUrl;
    $("pickupMapLink").href = b.mapUrl;
  } else {
    $("footerMapLink").classList.add("hidden");
    $("pickupMapLink").classList.add("hidden");
  }
  $("hoursList").innerHTML = renderHoursList();

  const socialMeta = {
    instagram: "انستقرام", tiktok: "تيك توك", snapchat: "سناب شات", x: "إكس (تويتر)",
  };
  const socials = Object.entries(STORE_CONFIG.socials || {}).filter(([, url]) => url);
  $("socialLinks").innerHTML = socials.map(([k, url]) =>
    `<a href="${escapeHTML(url)}" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition">${socialMeta[k] || k}</a>`
  ).join("");
  $("socialLinks").classList.toggle("hidden", socials.length === 0);

  // ملاحظة التوصيل المجاني والحد الأدنى
  const notes = [];
  if (STORE_CONFIG.freeDeliveryOver > 0 && STORE_CONFIG.deliveryFee > 0) notes.push(`🛵 توصيل مجاني للطلبات فوق ${money(STORE_CONFIG.freeDeliveryOver)}`);
  if (STORE_CONFIG.minOrder > 0) notes.push(`الحد الأدنى لطلبات التوصيل ${money(STORE_CONFIG.minOrder)}`);
  $("deliveryNote").textContent = notes.join(" • ");
  $("deliveryNote").classList.toggle("hidden", notes.length === 0);

  // استرجاع بيانات العميل من آخر طلب
  const saved = safeStorage("get", CUSTOMER_STORAGE_KEY);
  if (saved) {
    if (saved.name) $("customerName").value = saved.name;
    if (saved.phone) $("customerPhone").value = saved.phone;
    if (saved.address) $("customerAddress").value = saved.address;
  }
}

// ======================================================================
// التصنيفات والبحث وعرض المنتجات
// ======================================================================
function renderCategories() {
  const bar = $("categoriesBar");
  bar.innerHTML = STORE_CONFIG.categories.map(cat => `
    <button
      onclick="selectCategory('${cat.id}')"
      class="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${currentCategory === cat.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
      id="cat-btn-${cat.id}">
      ${cat.name}
    </button>
  `).join("");
}

function selectCategory(catId) {
  currentCategory = catId;
  renderCategories();
  renderProducts();
}

function setupSearch() {
  $("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderProducts();
  });
}

function productQtyInCart(productId) {
  return cart.filter(l => l.productId === productId).reduce((s, l) => s + l.qty, 0);
}

function renderProducts() {
  const container = $("productsGrid");
  const noResults = $("noResults");

  const filtered = STORE_CONFIG.products.filter(p => {
    const matchCategory = currentCategory === "all" || p.category === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");
  container.innerHTML = filtered.map(product => {
    const qty = productQtyInCart(product.id);
    const hasOptions = product.options && product.options.length > 0;
    const soldOut = product.available === false;
    const simpleLine = !hasOptions ? cart.find(l => l.key === String(product.id)) : null;

    let action;
    if (soldOut) {
      action = `<span class="bg-gray-100 text-gray-400 px-3 py-1.5 rounded-xl font-bold text-xs">نفد حالياً</span>`;
    } else if (hasOptions) {
      action = `
        <button onclick="openOptions(${product.id})" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition active:scale-95">
          <span>+</span> ${qty > 0 ? `إضافة (${qty} في السلة)` : "إضافة"}
        </button>`;
    } else if (!simpleLine) {
      action = `
        <button onclick="addToCart(${product.id})" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition active:scale-95">
          <span>+</span> إضافة
        </button>`;
    } else {
      action = `
        <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button onclick="updateLineQty('${simpleLine.key}', -1)" aria-label="إنقاص" class="w-6 h-6 rounded-lg bg-white shadow-xs text-gray-700 font-bold text-xs flex items-center justify-center hover:bg-gray-50">-</button>
          <span class="text-xs font-bold text-gray-800 w-4 text-center">${simpleLine.qty}</span>
          <button onclick="updateLineQty('${simpleLine.key}', 1)" aria-label="زيادة" class="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center hover:bg-emerald-700">+</button>
        </div>`;
    }

    return `
      <div class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-3 items-center hover:shadow-md transition ${soldOut ? "opacity-60" : ""}">
        <img src="${product.image}" alt="${product.name}" class="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-gray-100" loading="lazy">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-1">
            <h3 class="font-bold text-gray-900 text-sm truncate">${product.name}</h3>
            ${product.badge ? `<span class="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap">${product.badge}</span>` : ''}
          </div>
          <p class="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">${product.description}</p>
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-emerald-700 text-sm">${hasOptions ? '<span class="text-[10px] font-normal text-gray-400">يبدأ من </span>' : ''}${product.price} <span class="text-xs font-normal">${STORE_CONFIG.currency}</span></span>
            ${action}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ======================================================================
// نافذة خيارات الصنف (الحجم، الحليب، الإضافات)
// ======================================================================
function openOptions(productId) {
  const p = findProduct(productId);
  if (!p) return;
  optionsProduct = p;
  $("optionsTitle").textContent = p.name;
  $("optionsImage").src = p.image;
  $("optionsQty").textContent = "1";

  $("optionsBody").innerHTML = p.options.map(gKey => {
    const g = STORE_CONFIG.optionGroups[gKey];
    if (!g) return "";
    const inputType = g.type === "multi" ? "checkbox" : "radio";
    return `
      <fieldset>
        <legend class="text-xs font-bold text-gray-700 mb-2">${g.name} ${g.type === "single" ? '<span class="text-red-500">*</span>' : '<span class="text-gray-400 font-normal">(اختياري)</span>'}</legend>
        <div class="space-y-1.5">
          ${g.choices.map((c, i) => `
            <label class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm cursor-pointer has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
              <span class="flex items-center gap-2">
                <input type="${inputType}" name="opt-${gKey}" value="${i}" ${g.type === "single" && i === 0 ? "checked" : ""} onchange="updateOptionsTotal()" class="accent-emerald-600">
                ${c.label}
              </span>
              <span class="text-xs text-gray-500">${c.price > 0 ? "+" + money(c.price) : ""}</span>
            </label>
          `).join("")}
        </div>
      </fieldset>`;
  }).join("");

  updateOptionsTotal();
  const modal = $("optionsModal");
  modal.classList.remove("opacity-0", "pointer-events-none");
  modal.querySelector(".transform").classList.remove("translate-y-full");
}

function closeOptions() {
  const modal = $("optionsModal");
  modal.classList.add("opacity-0", "pointer-events-none");
  modal.querySelector(".transform").classList.add("translate-y-full");
  optionsProduct = null;
}

function readSelectedOptions() {
  const p = optionsProduct;
  const labels = [];
  let extra = 0;
  p.options.forEach(gKey => {
    const g = STORE_CONFIG.optionGroups[gKey];
    if (!g) return;
    document.querySelectorAll(`input[name="opt-${gKey}"]:checked`).forEach(inp => {
      const c = g.choices[Number(inp.value)];
      labels.push(c.label);
      extra += c.price;
    });
  });
  return { labels, unitPrice: p.price + extra };
}

function changeOptionsQty(delta) {
  const el = $("optionsQty");
  el.textContent = Math.max(1, Number(el.textContent) + delta);
  updateOptionsTotal();
}

function updateOptionsTotal() {
  if (!optionsProduct) return;
  const { unitPrice } = readSelectedOptions();
  $("optionsTotal").textContent = money(unitPrice * Number($("optionsQty").textContent));
}

function confirmOptions() {
  if (!optionsProduct) return;
  const { labels, unitPrice } = readSelectedOptions();
  const qty = Number($("optionsQty").textContent);
  addLine(optionsProduct.id, labels, unitPrice, qty);
  showToast(`تمت إضافة ${optionsProduct.name} للسلة ✓`);
  closeOptions();
}

// ======================================================================
// السلة
// ======================================================================
function addLine(productId, labels, unitPrice, qty) {
  const key = [productId, ...labels].join("|");
  const existing = cart.find(l => l.key === key);
  if (existing) existing.qty += qty;
  else cart.push({ key, productId, options: labels, unitPrice, qty });
  onCartChanged();
}

function addToCart(productId) {
  const p = findProduct(productId);
  if (!p) return;
  if (p.options && p.options.length) return openOptions(productId);
  addLine(p.id, [], p.price, 1);
}

function updateLineQty(key, delta) {
  const line = cart.find(l => l.key === key);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter(l => l.key !== key);
  onCartChanged();
}

function onCartChanged() {
  saveCart();
  updateCartUI();
  renderProducts();
  renderCartModalItems();
}

function saveCart() { safeStorage("set", CART_STORAGE_KEY, cart); }

function loadCart() {
  const saved = safeStorage("get", CART_STORAGE_KEY);
  if (!Array.isArray(saved)) return;
  // تجاهل الأصناف المحذوفة من المنيو، وتحديث الأسعار حسب المنيو الحالي
  cart = saved.filter(l => {
    const p = findProduct(l.productId);
    if (!p || p.available === false) return false;
    let extra = 0;
    (p.options || []).forEach(gKey => {
      const g = STORE_CONFIG.optionGroups[gKey];
      (g ? g.choices : []).forEach(c => { if (l.options.includes(c.label)) extra += c.price; });
    });
    l.unitPrice = p.price + extra;
    return l.qty > 0;
  });
}

function calculateSubtotal() {
  return cart.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
}

function calculateDeliveryFee(subtotal) {
  if (orderType !== "delivery") return 0;
  if (STORE_CONFIG.freeDeliveryOver > 0 && subtotal >= STORE_CONFIG.freeDeliveryOver) return 0;
  return STORE_CONFIG.deliveryFee;
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = calculateSubtotal();
  const delivery = calculateDeliveryFee(subtotal);
  const grandTotal = subtotal + delivery;

  const cartBar = $("cartBar");
  if (totalItems > 0) {
    cartBar.classList.remove("translate-y-28", "opacity-0", "pointer-events-none");
    $("cartBadgeCount").textContent = totalItems;
    $("cartBarTotal").textContent = grandTotal;
  } else {
    cartBar.classList.add("translate-y-28", "opacity-0", "pointer-events-none");
    toggleCheckoutModal(false);
  }

  $("summarySubtotal").textContent = subtotal;
  $("summaryDelivery").textContent = delivery === 0 && orderType === "delivery" && STORE_CONFIG.deliveryFee > 0 ? "مجاني 🎉" : delivery;
  $("summaryDeliveryCurrency").classList.toggle("hidden", delivery === 0 && STORE_CONFIG.deliveryFee > 0);
  $("summaryTotal").textContent = grandTotal;

  // تنبيه الحد الأدنى والتوصيل المجاني داخل السلة
  const hint = $("cartHint");
  let hintText = "";
  if (orderType === "delivery" && STORE_CONFIG.minOrder > 0 && subtotal < STORE_CONFIG.minOrder) {
    hintText = `⚠️ الحد الأدنى لطلبات التوصيل ${money(STORE_CONFIG.minOrder)} — أضف أصنافاً بقيمة ${money(STORE_CONFIG.minOrder - subtotal)}`;
    hint.className = "text-xs font-bold text-amber-700 bg-amber-50 rounded-lg px-3 py-2";
  } else if (orderType === "delivery" && STORE_CONFIG.freeDeliveryOver > 0 && STORE_CONFIG.deliveryFee > 0 && subtotal < STORE_CONFIG.freeDeliveryOver) {
    hintText = `🛵 باقي ${money(STORE_CONFIG.freeDeliveryOver - subtotal)} وتحصل على توصيل مجاني`;
    hint.className = "text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2";
  }
  hint.textContent = hintText;
  hint.classList.toggle("hidden", !hintText);
}

function toggleCheckoutModal(show) {
  const modal = $("checkoutModal");
  if (show) {
    renderCartModalItems();
    updateCartUI();
    updateBankInfo();
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.querySelector(".transform").classList.remove("translate-y-full");
  } else {
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.querySelector(".transform").classList.add("translate-y-full");
  }
}

function renderCartModalItems() {
  const container = $("cartItemsList");
  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center py-4 text-xs text-gray-400">السلة فارغة حالياً</p>`;
    return;
  }

  container.innerHTML = cart.map(l => {
    const p = findProduct(l.productId);
    if (!p) return "";
    return `
      <div class="flex items-center justify-between gap-2 py-2 text-xs">
        <div class="min-w-0">
          <h4 class="font-bold text-gray-800">${p.name}</h4>
          ${l.options.length ? `<p class="text-[11px] text-gray-500">${l.options.join("، ")}</p>` : ""}
          <span class="text-gray-400">${money(l.unitPrice)} × ${l.qty} = <b>${money(l.unitPrice * l.qty)}</b></span>
        </div>
        <div class="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-lg flex-shrink-0">
          <button onclick="updateLineQty('${l.key.replace(/'/g, "\\'")}', -1)" aria-label="إنقاص" class="w-5 h-5 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-100 rounded">-</button>
          <span class="font-bold text-gray-800 text-xs px-1">${l.qty}</span>
          <button onclick="updateLineQty('${l.key.replace(/'/g, "\\'")}', 1)" aria-label="زيادة" class="w-5 h-5 flex items-center justify-center text-emerald-600 font-bold hover:bg-emerald-50 rounded">+</button>
        </div>
      </div>
    `;
  }).join("");
}

function setOrderType(type) {
  orderType = type;
  const deliveryBtn = $("deliveryBtn");
  const pickupBtn = $("pickupBtn");
  const active = "py-2 text-sm font-bold rounded-lg bg-white text-emerald-700 shadow-sm transition";
  const inactive = "py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-white/50 transition";

  deliveryBtn.className = type === "delivery" ? active : inactive;
  pickupBtn.className = type === "pickup" ? active : inactive;
  $("addressSection").classList.toggle("hidden", type !== "delivery");
  $("summaryDeliveryRow").classList.toggle("hidden", type !== "delivery");
  $("pickupInfo").classList.toggle("hidden", type !== "pickup" || !(STORE_CONFIG.branch && STORE_CONFIG.branch.address));

  updateCartUI();
}

function updateBankInfo() {
  const box = $("bankInfo");
  const bank = STORE_CONFIG.bank || {};
  if ($("paymentMethod").value === "تحويل بنكي" && bank.iban) {
    box.innerHTML = `
      <p class="font-bold mb-1">بيانات التحويل:</p>
      ${bank.bankName ? `<p>البنك: ${escapeHTML(bank.bankName)}</p>` : ""}
      ${bank.accountName ? `<p>اسم المستفيد: ${escapeHTML(bank.accountName)}</p>` : ""}
      <p class="flex items-center gap-2 flex-wrap">الآيبان: <span dir="ltr" class="font-mono font-bold">${escapeHTML(bank.iban)}</span>
        <button type="button" onclick="copyIban()" class="text-emerald-700 underline">نسخ</button></p>
      <p class="mt-1 text-gray-500">يرجى إرسال صورة الإيصال في نفس محادثة الواتساب بعد إرسال الطلب.</p>`;
    box.classList.remove("hidden");
  } else {
    box.classList.add("hidden");
  }
}

function copyIban() {
  const iban = STORE_CONFIG.bank.iban;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(iban).then(() => showToast("تم نسخ رقم الآيبان ✓"), () => showToast(iban));
  } else {
    showToast(iban);
  }
}

// ======================================================================
// تحديد الموقع الجغرافي
// ======================================================================
function detectLocation(btn) {
  if (!navigator.geolocation) {
    alert("عذراً، خاصية تحديد الموقع غير مدعومة في متصفحك.");
    return;
  }
  const originalText = btn.innerHTML;
  btn.innerHTML = "⏳ جاري تحديد موقعك...";
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const url = `https://maps.google.com/?q=${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
      const addressInput = $("customerAddress");
      // إزالة أي رابط موقع سابق قبل إضافة الجديد
      const base = addressInput.value.replace(/\s*\|?\s*رابط الموقع: \S+/g, "").trim();
      addressInput.value = (base ? base + " | " : "") + `رابط الموقع: ${url}`;
      btn.innerHTML = "✅ تم تحديد موقعك";
      btn.disabled = false;
    },
    () => {
      alert("تعذر تحديد الموقع، يرجى كتابة اسم الحي والشارع يدوياً.");
      btn.innerHTML = originalText;
      btn.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ======================================================================
// التحقق وإرسال الطلب عبر الواتساب
// ======================================================================
function validatePhone(raw) {
  const phone = normalizeDigits(raw).replace(/[\s\-()]/g, "");
  // يقبل: 05xxxxxxxx أو 9665xxxxxxxx أو +9665xxxxxxxx أو 009665xxxxxxxx
  if (/^05\d{8}$/.test(phone)) return phone;
  const m = phone.match(/^(?:\+|00)?9665(\d{8})$/);
  if (m) return "05" + m[1];
  return null;
}

function generateOrderId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  // مثال: 1030-1342-7 (شهر يوم - ساعة دقيقة - رقم عشوائي)
  return `${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}-${Math.floor(Math.random() * 90 + 10)}`;
}

function submitOrderToWhatsApp() {
  const name = $("customerName").value.trim();
  const phoneRaw = $("customerPhone").value.trim();
  const address = $("customerAddress").value.trim();
  const notes = $("customerNotes").value.trim();
  const paymentMethod = $("paymentMethod").value;
  const open = isStoreOpen();

  if (cart.length === 0) {
    alert("السلة فارغة، أضف صنفاً واحداً على الأقل.");
    return;
  }
  if (!open && !STORE_CONFIG.allowOrdersWhenClosed) {
    alert(`نعتذر، المحل مغلق حالياً. ${nextOpeningText()}`);
    return;
  }
  if (!name) {
    alert("فضلاً أدخل اسمك الكريم.");
    $("customerName").focus();
    return;
  }
  const phone = validatePhone(phoneRaw);
  if (!phone) {
    alert("فضلاً أدخل رقم جوال صحيح يبدأ بـ 05 ومكوّن من 10 أرقام.");
    $("customerPhone").focus();
    return;
  }
  if (orderType === "delivery" && !address) {
    alert("فضلاً اكتب عنوان التوصيل أو اضغط على مشاركة موقعي.");
    $("customerAddress").focus();
    return;
  }

  const subtotal = calculateSubtotal();
  if (orderType === "delivery" && STORE_CONFIG.minOrder > 0 && subtotal < STORE_CONFIG.minOrder) {
    alert(`الحد الأدنى لطلبات التوصيل ${money(STORE_CONFIG.minOrder)}. أضف أصنافاً بقيمة ${money(STORE_CONFIG.minOrder - subtotal)} أو اختر الاستلام من الفرع.`);
    return;
  }

  const deliveryFee = calculateDeliveryFee(subtotal);
  const grandTotal = subtotal + deliveryFee;
  const orderId = generateOrderId();
  const timeString = new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  let itemsText = "";
  cart.forEach(l => {
    const p = findProduct(l.productId);
    if (!p) return;
    itemsText += `▫️ *${p.name}* × ${l.qty} = ${money(l.unitPrice * l.qty)}\n`;
    if (l.options.length) itemsText += `      ↳ ${l.options.join("، ")}\n`;
  });

  let message = `*طلب جديد عبر المنيو الرقمي* 🛒✨\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  if (!open) message += `⏳ *طلب مسبق (تم إرساله والمحل مغلق)*\n`;
  message += `🔖 *رقم الطلب:* #${orderId}\n`;
  message += `⏰ *الوقت:* ${timeString}\n`;
  message += `📌 *طريقة الاستلام:* ${orderType === "delivery" ? "🛵 توصيل للعنوان" : "🏪 استلام من الفرع"}\n\n`;

  message += `📋 *الأصناف المطلوبة:*\n${itemsText}\n`;

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *المجموع الفرعي:* ${money(subtotal)}\n`;
  if (orderType === "delivery") {
    message += `🛵 *رسوم التوصيل:* ${deliveryFee === 0 ? "مجاني" : money(deliveryFee)}\n`;
  }
  message += `💵 *الإجمالي النهائي:* *${money(grandTotal)}*\n`;
  message += `💳 *طريقة الدفع:* ${paymentMethod}\n\n`;

  message += `👤 *بيانات العميل:*\n`;
  message += `▫️ *الاسم:* ${name}\n`;
  message += `▫️ *الجوال:* ${phone}\n`;
  if (orderType === "delivery") message += `▫️ *العنوان:* ${address}\n`;
  if (notes) message += `▫️ *ملاحظات خاصة:* ${notes}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `يرجى تأكيد استلام الطلب والبدء في تجهيزه. شكراً لكم! 🙏`;

  // حفظ بيانات العميل للطلب القادم
  safeStorage("set", CUSTOMER_STORAGE_KEY, { name, phone, address });

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${STORE_CONFIG.whatsappNumber}&text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
  showToast("تم تجهيز طلبك في الواتساب ✓ اضغط إرسال هناك لإتمامه");
  $("newOrderBtn").classList.remove("hidden");
}

// بدء طلب جديد بعد إرسال الطلب الحالي
function startNewOrder() {
  if (!confirm("هل تريد إفراغ السلة والبدء بطلب جديد؟")) return;
  cart = [];
  $("customerNotes").value = "";
  $("newOrderBtn").classList.add("hidden");
  onCartChanged();
}

// إغلاق النوافذ بزر Esc
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (optionsProduct) closeOptions();
  else toggleCheckoutModal(false);
});
