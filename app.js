/**
 * QuickOrder — محرك المنيو والطلبات
 * لا تحتاج لتعديل هذا الملف. كل بيانات المتجر في config.js
 */
const C = STORE_CONFIG;

// ======================================================================
// الحالة
// ======================================================================
const state = {
  category: "all",
  search: "",
  cart: [],                // [{ productId, options: [labels], unitPrice, qty }]
  orderType: null,         // delivery | pickup | dinein
  table: "",               // رقم الطاولة من الرابط ?table=5
  coupon: null,            // كائن الكوبون المطبق
  payment: null,           // مفتاح طريقة الدفع المختارة
  step: 1,
  lastOrder: null,         // آخر طلب تم تأكيده (لشاشة النجاح)
};
let optionsProduct = null;

const KEY = (name) => `qo_${name}_${C.whatsappNumber}`;
const $ = (id) => document.getElementById(id);
const findProduct = (id) => C.products.find(p => p.id === id);

// ======================================================================
// أدوات مساعدة
// ======================================================================
function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function fmt(n) {
  const v = round2(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}
function money(n) { return `${fmt(n)} ${C.currency}`; }

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function normalizeDigits(str) {
  return String(str).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

function store(action, key, value) {
  try {
    if (action === "get") return JSON.parse(localStorage.getItem(key));
    if (action === "set") localStorage.setItem(key, JSON.stringify(value));
    if (action === "del") localStorage.removeItem(key);
  } catch (e) { /* التخزين غير متاح */ }
  return null;
}

function showToast(text) {
  const t = $("toast");
  t.textContent = text;
  t.classList.remove("opacity-0", "-translate-y-4");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add("opacity-0", "-translate-y-4"), 2400);
}

function openSheet(id) {
  const m = $(id);
  m.classList.remove("opacity-0", "pointer-events-none");
  m.querySelector(".sheet").classList.remove("translate-y-full");
  document.body.style.overflow = "hidden";
}
function closeSheet(id) {
  const m = $(id);
  m.classList.add("opacity-0", "pointer-events-none");
  m.querySelector(".sheet").classList.add("translate-y-full");
  if ($("optionsModal").classList.contains("opacity-0") && $("checkoutModal").classList.contains("opacity-0")) {
    document.body.style.overflow = "";
  }
}

// صورة الصنف مع بديل (إيموجي) إذا لم توجد صورة أو تعطّل رابطها
function productVisual(p, sizeClass, emojiSize) {
  return `
    <div class="${sizeClass} relative rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center flex-shrink-0">
      <span class="${emojiSize}" aria-hidden="true">${p.emoji || C.logoEmoji}</span>
      ${p.image ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.remove()" class="absolute inset-0 w-full h-full object-cover">` : ""}
    </div>`;
}

// ======================================================================
// أوقات العمل
// ======================================================================
const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

function formatTime(hhmm) {
  let [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}
function dateToHHMM(d) { return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }

function isStoreOpen(date = new Date()) {
  const day = date.getDay();
  const mins = date.getHours() * 60 + date.getMinutes();
  const hours = C.openingHours || {};
  for (const s of hours[day] || []) {
    const o = toMinutes(s.open), c = toMinutes(s.close);
    if (c > o ? (mins >= o && mins < c) : mins >= o) return true;
  }
  for (const s of hours[(day + 6) % 7] || []) {
    const o = toMinutes(s.open), c = toMinutes(s.close);
    if (c <= o && mins < c) return true;
  }
  return false;
}

function nextOpeningText(date = new Date()) {
  const hours = C.openingHours || {};
  const now = date.getHours() * 60 + date.getMinutes();
  for (let i = 0; i < 7; i++) {
    const day = (date.getDay() + i) % 7;
    const slots = (hours[day] || []).slice().sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
    for (const s of slots) {
      if (i === 0 && toMinutes(s.open) <= now) continue;
      const when = i === 0 ? "اليوم" : i === 1 ? "غداً" : `يوم ${DAY_NAMES[day]}`;
      return `يفتح ${when} ${formatTime(s.open)}`;
    }
  }
  return "";
}

function canScheduleAhead() { return C.scheduling && C.scheduling.enabled; }

function updateStoreStatus() {
  const open = isStoreOpen();
  const s = $("storeStatus");
  if (open) {
    s.className = "inline-flex items-center gap-1 text-emerald-600 font-medium";
    s.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> مفتوح الآن`;
  } else {
    s.className = "inline-flex items-center gap-1 text-red-600 font-medium";
    const next = nextOpeningText();
    s.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span> مغلق${next ? " • " + next : ""}`;
  }
  $("deliveryTimeWrap").classList.toggle("hidden", !open);
  $("closedBanner").classList.toggle("hidden", open);
  if (!open) {
    $("closedBannerText").textContent = canScheduleAhead()
      ? `المحل مغلق الآن — تقدر تطلب وتجدول طلبك لوقت لاحق. ${nextOpeningText()}`
      : `المحل مغلق الآن ولا نستقبل الطلبات. ${nextOpeningText()}`;
  }
}

function renderHoursList() {
  const hours = C.openingHours || {};
  const today = new Date().getDay();
  return [6, 0, 1, 2, 3, 4, 5].map(d => {
    const slots = hours[d] || [];
    const text = slots.length ? slots.map(s => `${formatTime(s.open)} - ${formatTime(s.close)}`).join("، ") : "مغلق";
    return `<div class="flex justify-between ${today === d ? "font-bold text-brand-700" : ""}"><span>${DAY_NAMES[d]}</span><span>${text}</span></div>`;
  }).join("");
}

// أوقات الجدولة المتاحة (كل فترة slotMinutes خلال أوقات العمل)
function buildScheduleSlots() {
  const sc = C.scheduling || {};
  const slot = sc.slotMinutes || 30;
  const lead = (C.prepTimeMinutes || 20) + (state.orderType === "delivery" ? (C.deliveryTimeMinutes || 20) : 0);
  const start = new Date(Date.now() + lead * 60000);
  start.setSeconds(0, 0);
  start.setMinutes(Math.ceil(start.getMinutes() / slot) * slot);
  const end = new Date();
  end.setHours(23, 59, 0, 0);
  end.setDate(end.getDate() + (sc.daysAhead ?? 2));

  const groups = {};
  for (let t = new Date(start); t <= end; t = new Date(t.getTime() + slot * 60000)) {
    if (!isStoreOpen(t)) continue;
    const dayDiff = Math.round((new Date(t).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
    const label = dayDiff === 0 ? "اليوم" : dayDiff === 1 ? "غداً" : `${DAY_NAMES[t.getDay()]}`;
    (groups[label] = groups[label] || []).push({ iso: t.toISOString(), text: formatTime(dateToHHMM(t)), day: label });
  }
  return groups;
}

// ======================================================================
// التشغيل
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  state.table = (params.get("table") || "").trim();

  loadCart();
  initStoreInfo();
  renderCategories();
  renderOffers();
  renderProducts();
  updateCartUI();
  updateStoreStatus();
  setInterval(updateStoreStatus, 60 * 1000);

  $("searchInput").addEventListener("input", (e) => {
    state.search = e.target.value.trim().toLowerCase();
    renderProducts();
  });
  $("couponInput").addEventListener("keydown", (e) => { if (e.key === "Enter") applyCoupon(); });

  // العودة من بوابة الدفع
  if (params.get("id") && params.get("status")) handlePaymentReturn(params);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (optionsProduct) closeOptions();
  else if (state.step !== 4) closeCheckout();
});

function enabledOrderTypes() {
  const t = C.orderTypes || { delivery: true, pickup: true };
  return ["delivery", "pickup", "dinein"].filter(k => t[k]);
}

function initStoreInfo() {
  document.title = `${C.storeName} | اطلب أونلاين`;
  $("storeName").textContent = C.storeName;
  $("storeLogo").textContent = C.logoEmoji;
  $("deliveryTime").textContent = C.estimatedTime;
  $("directWhatsAppBtn").href = `https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent("السلام عليكم، عندي استفسار بخصوص المنيو والطلبات")}`;

  // نوع الطلب الافتراضي
  const types = enabledOrderTypes();
  if (state.table && types.includes("dinein")) {
    state.orderType = "dinein";
    $("tableBanner").textContent = `🍽️ أنت تطلب من طاولة رقم ${state.table} — طلبك يوصلك على الطاولة`;
    $("tableBanner").classList.remove("hidden");
  } else {
    state.orderType = types.find(t => t !== "dinein") || types[0];
  }

  // الفرع
  const b = C.branch || {};
  $("footerStoreName").textContent = C.storeName;
  if (b.address) { $("footerAddress").textContent = b.address; $("pickupAddress").textContent = b.address; }
  else $("footerAddressRow").classList.add("hidden");
  if (b.mapUrl) { $("footerMapLink").href = b.mapUrl; $("pickupMapLink").href = b.mapUrl; }
  else { $("footerMapLink").classList.add("hidden"); $("pickupMapLink").classList.add("hidden"); }
  $("hoursList").innerHTML = renderHoursList();

  // شارات طرق الدفع
  $("paymentBadges").innerHTML = availablePaymentMethods("delivery").concat(availablePaymentMethods("dinein"))
    .filter((m, i, arr) => arr.findIndex(x => x.key === m.key) === i)
    .map(m => `<span class="px-2 py-1 rounded-md bg-gray-100 text-[11px] font-bold text-gray-600">${m.icon} ${m.short}</span>`).join("");

  // السوشال
  const names = { instagram: "انستقرام", tiktok: "تيك توك", snapchat: "سناب شات", x: "إكس" };
  const socials = Object.entries(C.socials || {}).filter(([, u]) => u);
  $("socialLinks").innerHTML = socials.map(([k, u]) =>
    `<a href="${escapeHTML(u)}" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:border-brand-500 hover:text-brand-700 transition">${names[k] || k}</a>`).join("");
  $("socialLinks").classList.toggle("hidden", !socials.length);

  // الضريبة
  if (C.vat && C.vat.number) {
    $("vatFooter").textContent = `الرقم الضريبي: ${C.vat.number}${C.vat.crNumber ? " • السجل التجاري: " + C.vat.crNumber : ""}`;
    $("vatFooter").classList.remove("hidden");
  }
  $("vatIncludedNote").classList.toggle("hidden", !(C.vat && C.vat.pricesIncludeVat));

  // ملاحظة التوصيل
  const notes = [];
  if (types.includes("delivery")) {
    if (C.freeDeliveryOver > 0 && C.deliveryFee > 0) notes.push(`🛵 توصيل مجاني فوق ${money(C.freeDeliveryOver)}`);
    if (C.minOrder > 0) notes.push(`الحد الأدنى للتوصيل ${money(C.minOrder)}`);
  }
  $("deliveryNote").textContent = notes.join(" • ");
  $("deliveryNote").classList.toggle("hidden", !notes.length);

  // بيانات العميل المحفوظة
  const saved = store("get", KEY("customer"));
  if (saved) {
    if (saved.name) $("customerName").value = saved.name;
    if (saved.phone) $("customerPhone").value = saved.phone;
    if (saved.address) $("customerAddress").value = saved.address;
  }
  if (state.table) $("tableNumber").value = state.table;
}

// ======================================================================
// المنيو
// ======================================================================
function renderCategories() {
  $("categoriesBar").innerHTML = [{ id: "all", name: "الكل" }, ...C.categories].map(cat => `
    <button onclick="selectCategory('${cat.id}')"
      class="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${state.category === cat.id ? "bg-brand-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}">
      ${cat.icon ? cat.icon + " " : ""}${cat.name}
    </button>`).join("");
}

function selectCategory(id) {
  state.category = id;
  renderCategories();
  renderProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderOffers() {
  const offers = C.offers || [];
  $("offersSection").classList.toggle("hidden", !offers.length);
  $("offersRow").innerHTML = offers.map(o => `
    <button ${o.productId ? `onclick="addToCart(${o.productId})"` : o.coupon ? `onclick="copyCouponHint('${escapeHTML(o.coupon)}')"` : o.category ? `onclick="selectCategory('${escapeHTML(o.category)}')"` : ""}
      class="snap-start flex-shrink-0 w-[82%] text-right rounded-2xl p-4 text-white shadow-md bg-gradient-to-l ${o.gradient || "from-brand-600 to-brand-800"} relative overflow-hidden">
      <span class="absolute -left-2 -bottom-3 text-7xl opacity-30" aria-hidden="true">${o.emoji || "🎉"}</span>
      <p class="text-[11px] font-bold opacity-80">${escapeHTML(o.tag || "عرض")}</p>
      <h3 class="font-extrabold text-base mt-0.5">${escapeHTML(o.title)}</h3>
      <p class="text-xs opacity-90 mt-1">${escapeHTML(o.subtitle || "")}</p>
      ${o.coupon ? `<span class="inline-block mt-2 bg-white/20 rounded-lg px-2 py-0.5 text-xs font-bold tracking-wider">الكود: ${escapeHTML(o.coupon)}</span>` : ""}
    </button>`).join("");
}

function copyCouponHint(code) {
  $("couponInput").value = code;
  if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
  showToast(`تم نسخ الكود ${code} — يُطبق في السلة`);
}

function qtyInCart(productId) {
  return state.cart.filter(l => l.productId === productId).reduce((s, l) => s + l.qty, 0);
}

function productCard(p) {
  const qty = qtyInCart(p.id);
  const hasOptions = p.options && p.options.length;
  const soldOut = p.available === false;
  const simpleIndex = !hasOptions ? state.cart.findIndex(l => l.productId === p.id && !l.options.length) : -1;

  let action;
  if (soldOut) {
    action = `<span class="bg-gray-100 text-gray-400 px-3 py-1.5 rounded-xl font-bold text-xs">نفد حالياً</span>`;
  } else if (simpleIndex > -1) {
    action = `
      <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
        <button onclick="event.stopPropagation(); updateLineQty(${simpleIndex}, -1)" aria-label="إنقاص" class="w-7 h-7 rounded-lg bg-white text-gray-700 font-bold text-sm">-</button>
        <span class="text-xs font-bold w-4 text-center">${state.cart[simpleIndex].qty}</span>
        <button onclick="event.stopPropagation(); updateLineQty(${simpleIndex}, 1)" aria-label="زيادة" class="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold text-sm">+</button>
      </div>`;
  } else {
    action = `
      <button onclick="event.stopPropagation(); addToCart(${p.id})" class="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95">
        + ${qty > 0 ? `إضافة <span class="bg-brand-600 text-white rounded-full px-1.5 mr-1">${qty}</span>` : "إضافة"}
      </button>`;
  }

  return `
    <div ${soldOut ? "" : `onclick="openOptions(${p.id})"`} class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-3 items-center ${soldOut ? "opacity-60" : "cursor-pointer hover:shadow-md"} transition">
      ${productVisual(p, "w-24 h-24", "text-4xl")}
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 mb-0.5">
          <h3 class="font-bold text-gray-900 text-sm truncate">${escapeHTML(p.name)}</h3>
          ${p.badge ? `<span class="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap">${escapeHTML(p.badge)}</span>` : ""}
        </div>
        <p class="text-xs text-gray-500 line-clamp-2 mb-1 leading-relaxed">${escapeHTML(p.description)}</p>
        ${p.calories ? `<p class="text-[10px] text-gray-400 mb-1">🔥 ${p.calories} سعرة حرارية</p>` : ""}
        <div class="flex items-center justify-between">
          <span class="font-extrabold text-brand-700 text-sm">${hasOptions ? '<span class="text-[10px] font-normal text-gray-400">يبدأ من </span>' : ""}${fmt(p.price)} <span class="text-xs font-normal">${C.currency}</span>
            ${p.oldPrice ? `<s class="text-[11px] text-gray-400 font-normal mr-1">${fmt(p.oldPrice)}</s>` : ""}</span>
          ${action}
        </div>
      </div>
    </div>`;
}

function renderProducts() {
  const q = state.search;
  const filtered = C.products.filter(p =>
    (state.category === "all" || p.category === state.category) &&
    (!q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)));

  $("noResults").classList.toggle("hidden", filtered.length > 0);
  if (!filtered.length) { $("productsGrid").innerHTML = ""; return; }

  // عرض حسب التصنيف عند اختيار "الكل" بدون بحث
  if (state.category === "all" && !q) {
    $("productsGrid").innerHTML = C.categories.map(cat => {
      const items = filtered.filter(p => p.category === cat.id);
      if (!items.length) return "";
      return `<section><h2 class="font-extrabold text-gray-900 mb-2 text-base">${cat.icon ? cat.icon + " " : ""}${escapeHTML(cat.name)}</h2><div class="space-y-3">${items.map(productCard).join("")}</div></section>`;
    }).join("");
  } else {
    $("productsGrid").innerHTML = `<div class="space-y-3">${filtered.map(productCard).join("")}</div>`;
  }
}

// ======================================================================
// نافذة الصنف والخيارات
// ======================================================================
function openOptions(productId) {
  const p = findProduct(productId);
  if (!p || p.available === false) return;
  optionsProduct = p;
  $("optionsHero").innerHTML = `<span aria-hidden="true">${p.emoji || C.logoEmoji}</span>${p.image ? `<img src="${escapeHTML(p.image)}" alt="" onerror="this.remove()" class="absolute inset-0 w-full h-full object-cover">` : ""}`;
  $("optionsTitle").textContent = p.name;
  $("optionsDesc").textContent = p.description || "";
  $("optionsMeta").textContent = [p.calories ? `🔥 ${p.calories} سعرة حرارية` : "", p.serves ? `👥 ${p.serves}` : ""].filter(Boolean).join(" • ");
  $("optionsQty").textContent = "1";

  $("optionsBody").innerHTML = (p.options || []).map(gKey => {
    const g = C.optionGroups[gKey];
    if (!g) return "";
    const type = g.type === "multi" ? "checkbox" : "radio";
    return `
      <fieldset>
        <legend class="text-xs font-bold text-gray-700 mb-2">${g.name} ${g.type === "single" ? '<span class="text-red-500">*</span>' : '<span class="text-gray-400 font-normal">(اختياري)</span>'}</legend>
        <div class="space-y-1.5">
          ${g.choices.map((c, i) => `
            <label class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm cursor-pointer has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <span class="flex items-center gap-2">
                <input type="${type}" name="opt-${gKey}" value="${i}" ${g.type === "single" && i === (g.default || 0) ? "checked" : ""} onchange="updateOptionsTotal()" class="accent-brand-600">
                ${escapeHTML(c.label)}
              </span>
              <span class="text-xs text-gray-500">${c.price > 0 ? "+" + money(c.price) : ""}</span>
            </label>`).join("")}
        </div>
      </fieldset>`;
  }).join("") + `
    <div>
      <label for="itemNote" class="block text-xs font-bold text-gray-700 mb-2">ملاحظة على الصنف <span class="text-gray-400 font-normal">(اختياري)</span></label>
      <input id="itemNote" type="text" maxlength="80" placeholder="مثال: بدون بصل، صوص على جنب" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none">
    </div>`;

  updateOptionsTotal();
  openSheet("optionsModal");
}

function closeOptions() { closeSheet("optionsModal"); optionsProduct = null; }

function readSelectedOptions() {
  const p = optionsProduct;
  const labels = [];
  let extra = 0;
  (p.options || []).forEach(gKey => {
    const g = C.optionGroups[gKey];
    if (!g) return;
    document.querySelectorAll(`input[name="opt-${gKey}"]:checked`).forEach(inp => {
      const c = g.choices[Number(inp.value)];
      labels.push(c.label);
      extra += c.price;
    });
  });
  const note = ($("itemNote") && $("itemNote").value.trim()) || "";
  if (note) labels.push(`ملاحظة: ${note}`);
  return { labels, unitPrice: p.price + extra };
}

function changeOptionsQty(d) {
  $("optionsQty").textContent = Math.max(1, Number($("optionsQty").textContent) + d);
  updateOptionsTotal();
}

function updateOptionsTotal() {
  if (!optionsProduct) return;
  $("optionsTotal").textContent = money(readSelectedOptions().unitPrice * Number($("optionsQty").textContent));
}

function confirmOptions() {
  if (!optionsProduct) return;
  const { labels, unitPrice } = readSelectedOptions();
  addLine(optionsProduct.id, labels, unitPrice, Number($("optionsQty").textContent));
  showToast(`أُضيف ${optionsProduct.name} للسلة ✓`);
  closeOptions();
}

// ======================================================================
// السلة
// ======================================================================
function addLine(productId, labels, unitPrice, qty) {
  const sameKey = (l) => l.productId === productId && l.options.join("|") === labels.join("|");
  const existing = state.cart.find(sameKey);
  if (existing) existing.qty += qty;
  else state.cart.push({ productId, options: labels, unitPrice, qty });
  onCartChanged();
}

function addToCart(productId) {
  const p = findProduct(productId);
  if (!p || p.available === false) return;
  if (p.options && p.options.length) return openOptions(productId);
  addLine(p.id, [], p.price, 1);
  showToast(`أُضيف ${p.name} للسلة ✓`);
}

function updateLineQty(index, delta) {
  const line = state.cart[index];
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) state.cart.splice(index, 1);
  onCartChanged();
}

function onCartChanged() {
  store("set", KEY("cart"), state.cart);
  revalidateCoupon();
  updateCartUI();
  renderProducts();
  if (state.step === 1) renderCartStep();
  if (state.step === 3) renderPaymentStep();
}

function loadCart() {
  const saved = store("get", KEY("cart"));
  if (!Array.isArray(saved)) return;
  state.cart = saved.filter(l => {
    const p = findProduct(l.productId);
    if (!p || p.available === false || !(l.qty > 0)) return false;
    let extra = 0;
    (p.options || []).forEach(gKey => {
      const g = C.optionGroups[gKey];
      (g ? g.choices : []).forEach(c => { if (l.options.includes(c.label)) extra += c.price; });
    });
    l.unitPrice = p.price + extra; // تحديث السعر حسب المنيو الحالي
    return true;
  });
}

// ======================================================================
// الحسابات: المجموع، الخصم، التوصيل، الضريبة
// ======================================================================
function subtotal() { return state.cart.reduce((s, l) => s + l.unitPrice * l.qty, 0); }

function couponDiscount(sub) {
  const c = state.coupon;
  if (!c) return 0;
  if (c.type === "percent") return round2(Math.min(sub * c.value / 100, c.maxDiscount || Infinity));
  if (c.type === "fixed") return Math.min(c.value, sub);
  return 0;
}

function deliveryFee(sub) {
  if (state.orderType !== "delivery") return 0;
  if (state.coupon && state.coupon.type === "freeDelivery") return 0;
  if (C.freeDeliveryOver > 0 && sub >= C.freeDeliveryOver) return 0;
  return C.deliveryFee || 0;
}

function totals() {
  const sub = subtotal();
  const discount = couponDiscount(sub);
  const delivery = deliveryFee(sub);
  const vatRate = (C.vat && C.vat.rate) || 0;
  let total, vat;
  if (C.vat && C.vat.pricesIncludeVat) {
    total = round2(sub - discount + delivery);
    vat = round2(total - total / (1 + vatRate));
  } else {
    vat = round2((sub - discount + delivery) * vatRate);
    total = round2(sub - discount + delivery + vat);
  }
  return { sub, discount, delivery, vat, total, items: state.cart.reduce((s, l) => s + l.qty, 0) };
}

function updateCartUI() {
  const t = totals();
  const bar = $("cartBar");
  if (t.items > 0) {
    bar.classList.remove("translate-y-28", "opacity-0", "pointer-events-none");
    $("cartBadgeCount").textContent = t.items;
    $("cartBarTotal").textContent = fmt(t.total);
  } else {
    bar.classList.add("translate-y-28", "opacity-0", "pointer-events-none");
  }
  $("footerTotal").textContent = money(t.total);
}

// ======================================================================
// الكوبونات
// ======================================================================
function applyCoupon() {
  const code = normalizeDigits($("couponInput").value).trim().toUpperCase();
  const msg = $("couponMsg");
  msg.classList.remove("hidden");
  if (!code) { state.coupon = null; msg.classList.add("hidden"); onCartChanged(); return; }

  const c = (C.coupons || []).find(x => x.code.toUpperCase() === code);
  const sub = subtotal();
  if (!c || (c.expires && new Date(c.expires) < new Date())) {
    state.coupon = null;
    msg.className = "text-xs mt-2 font-bold text-red-600";
    msg.textContent = "الكود غير صحيح أو منتهي.";
  } else if (c.minSubtotal && sub < c.minSubtotal) {
    state.coupon = null;
    msg.className = "text-xs mt-2 font-bold text-amber-700";
    msg.textContent = `هذا الكود يتطلب طلباً بقيمة ${money(c.minSubtotal)} أو أكثر.`;
  } else if (c.type === "freeDelivery" && state.orderType !== "delivery") {
    state.coupon = c;
    msg.className = "text-xs mt-2 font-bold text-amber-700";
    msg.textContent = "تم حفظ الكود — يُطبق عند اختيار التوصيل.";
  } else {
    state.coupon = c;
    msg.className = "text-xs mt-2 font-bold text-emerald-700";
    msg.textContent = `✓ ${c.label || "تم تطبيق الخصم"}`;
  }
  updateCartUI();
  renderCartStep();
}

function revalidateCoupon() {
  const c = state.coupon;
  if (c && c.minSubtotal && subtotal() < c.minSubtotal) {
    state.coupon = null;
    const msg = $("couponMsg");
    msg.className = "text-xs mt-2 font-bold text-amber-700";
    msg.textContent = `أُلغي الكود لأن الطلب أقل من ${money(c.minSubtotal)}.`;
  }
}

// ======================================================================
// شاشة إتمام الطلب
// ======================================================================
const STEP_TITLES = { 1: "سلة الطلب", 2: "الاستلام والبيانات", 3: "الدفع والمراجعة", 4: "تم الطلب" };

function openCheckout() {
  if (!state.cart.length) return;
  goToStep(1);
  openSheet("checkoutModal");
}

function closeCheckout() {
  closeSheet("checkoutModal");
  if (state.step === 4) { state.step = 1; }
}

function goToStep(n) {
  state.step = n;
  document.querySelectorAll("#checkoutBody [data-step]").forEach(s => s.classList.toggle("hidden", Number(s.dataset.step) !== n));
  $("stepTitle").textContent = STEP_TITLES[n];
  $("backBtn").classList.toggle("invisible", n === 1 || n === 4);
  $("stepper").classList.toggle("hidden", n === 4);
  $("checkoutFooter").classList.toggle("hidden", n === 4);
  $("checkoutBody").scrollTop = 0;

  $("stepper").innerHTML = ["السلة", "الاستلام", "الدفع"].map((label, i) => {
    const idx = i + 1;
    const cls = idx < n ? "bg-brand-600 text-white" : idx === n ? "bg-brand-100 text-brand-800 ring-2 ring-brand-500" : "bg-gray-100 text-gray-400";
    return `<li class="rounded-full py-1.5 text-center ${cls}">${idx < n ? "✓" : idx} ${label}</li>`;
  }).join("");

  if (n === 1) renderCartStep();
  if (n === 2) renderDetailsStep();
  if (n === 3) renderPaymentStep();
  updatePrimaryButton();
}

function prevStep() {
  if (state.step === 3) cancelOnlinePayment();
  if (state.step > 1 && state.step < 4) goToStep(state.step - 1);
}

function nextStep() {
  if (state.step === 1) {
    if (!state.cart.length) return;
    goToStep(2);
  } else if (state.step === 2) {
    if (validateDetails()) goToStep(3);
  } else if (state.step === 3) {
    placeOrder();
  }
}

function updatePrimaryButton() {
  const btn = $("primaryBtn");
  const t = totals();
  btn.disabled = false;
  if (state.step === 1) {
    btn.innerHTML = "متابعة";
    if (!state.cart.length) btn.disabled = true;
  } else if (state.step === 2) {
    btn.innerHTML = "متابعة للدفع";
  } else if (state.step === 3) {
    const m = getMethod(state.payment);
    if (m && m.key === "online") btn.innerHTML = `🔒 ادفع ${money(t.total)}`;
    else btn.innerHTML = `${waIcon()} تأكيد الطلب`;
    if (!m) btn.disabled = true;
  }
}

function waIcon() {
  return `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.58 2.007.917 2.796.917 3.182 0 5.767-2.587 5.767-5.766.001-3.182-2.585-5.764-5.767-5.764zm6.758-3.632c-1.803-1.803-4.199-2.796-6.75-2.796-5.26 0-9.539 4.28-9.539 9.54 0 1.68.438 3.32 1.272 4.764l-1.35 4.933 5.048-1.324c1.391.758 2.957 1.159 4.569 1.159 5.26 0 9.539-4.28 9.539-9.54 0-2.551-.993-4.947-2.799-6.75z"/></svg>`;
}

// ---------- الخطوة 1: السلة ----------
function renderCartStep() {
  const list = $("cartItemsList");
  if (!state.cart.length) {
    list.innerHTML = `<p class="text-center py-8 text-sm text-gray-400">السلة فارغة</p>`;
  } else {
    list.innerHTML = state.cart.map((l, i) => {
      const p = findProduct(l.productId);
      if (!p) return "";
      return `
        <div class="flex items-center gap-3 p-3">
          ${productVisual(p, "w-14 h-14", "text-2xl")}
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-gray-800 text-sm truncate">${escapeHTML(p.name)}</h4>
            ${l.options.length ? `<p class="text-[11px] text-gray-500 leading-snug">${escapeHTML(l.options.join("، "))}</p>` : ""}
            <p class="text-xs font-bold text-brand-700 mt-0.5">${money(l.unitPrice * l.qty)}</p>
          </div>
          <div class="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl flex-shrink-0">
            <button onclick="updateLineQty(${i}, -1)" aria-label="إنقاص" class="w-7 h-7 rounded-lg bg-white text-gray-600 font-bold text-sm">${l.qty === 1 ? "🗑" : "-"}</button>
            <span class="font-bold text-xs w-4 text-center">${l.qty}</span>
            <button onclick="updateLineQty(${i}, 1)" aria-label="زيادة" class="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold text-sm">+</button>
          </div>
        </div>`;
    }).join("");
  }

  // الاقتراحات
  const inCart = new Set(state.cart.map(l => l.productId));
  const ups = C.products.filter(p => p.upsell && p.available !== false && !inCart.has(p.id)).slice(0, 6);
  $("upsellSection").classList.toggle("hidden", !ups.length || !state.cart.length);
  $("upsellRow").innerHTML = ups.map(p => `
    <button onclick="addToCart(${p.id})" class="flex-shrink-0 w-28 bg-white border border-gray-100 rounded-2xl p-2 text-right hover:border-brand-500 transition">
      ${productVisual(p, "w-full h-16", "text-3xl")}
      <p class="text-[11px] font-bold text-gray-800 mt-1.5 truncate">${escapeHTML(p.name)}</p>
      <p class="text-[11px] text-brand-700 font-bold">+ ${money(p.price)}</p>
    </button>`).join("");

  renderCartHint();
  updatePrimaryButton();
}

function renderCartHint() {
  const hint = $("cartHint");
  const sub = subtotal();
  let text = "";
  if (state.orderType === "delivery" && C.minOrder > 0 && sub < C.minOrder) {
    text = `⚠️ الحد الأدنى لطلبات التوصيل ${money(C.minOrder)} — باقي ${money(C.minOrder - sub)}`;
    hint.className = "text-xs font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-2";
  } else if (state.orderType === "delivery" && C.freeDeliveryOver > 0 && C.deliveryFee > 0 && sub < C.freeDeliveryOver) {
    const pct = Math.min(100, Math.round(sub / C.freeDeliveryOver * 100));
    hint.className = "text-xs font-bold text-brand-800 bg-brand-50 rounded-xl px-3 py-2";
    hint.innerHTML = `🛵 باقي ${money(C.freeDeliveryOver - sub)} وتحصل على توصيل مجاني
      <span class="block h-1.5 bg-white rounded-full mt-2 overflow-hidden"><span class="block h-full bg-brand-600 rounded-full" style="width:${pct}%"></span></span>`;
    hint.classList.remove("hidden");
    return;
  }
  hint.textContent = text;
  hint.classList.toggle("hidden", !text);
}

// ---------- الخطوة 2: الاستلام والبيانات ----------
const ORDER_TYPE_LABELS = { delivery: "🛵 توصيل", pickup: "🏪 استلام", dinein: "🍽️ محلي" };

function renderDetailsStep() {
  const types = enabledOrderTypes();
  const tabs = $("orderTypeTabs");
  tabs.style.gridTemplateColumns = `repeat(${types.length}, minmax(0, 1fr))`;
  tabs.innerHTML = types.map(t => `
    <button type="button" onclick="setOrderType('${t}')" class="py-2 text-sm rounded-lg transition ${state.orderType === t ? "font-bold bg-white text-brand-700 shadow-sm" : "font-medium text-gray-600 hover:bg-white/50"}">${ORDER_TYPE_LABELS[t]}</button>`).join("");

  const isDelivery = state.orderType === "delivery";
  const isDinein = state.orderType === "dinein";
  $("addressSection").classList.toggle("hidden", !isDelivery);
  $("tableSection").classList.toggle("hidden", !isDinein);
  $("tableNumber").readOnly = Boolean(state.table);
  $("pickupInfo").classList.toggle("hidden", state.orderType !== "pickup" || !(C.branch && C.branch.address));
  $("timingCard").classList.toggle("hidden", isDinein || !canScheduleAhead());

  // الجدولة
  const open = isStoreOpen();
  const asapInput = document.querySelector('input[name="timing"][value="asap"]');
  const schedInput = document.querySelector('input[name="timing"][value="schedule"]');
  asapInput.disabled = !open;
  $("asapOption").classList.toggle("opacity-40", !open);
  if (!open && !isDinein) schedInput.checked = true;

  const groups = buildScheduleSlots();
  const prev = $("scheduleSelect").value;
  $("scheduleSelect").innerHTML = Object.entries(groups).map(([day, slots]) =>
    `<optgroup label="${day}">${slots.map(s => `<option value="${s.iso}">${day} — ${s.text}</option>`).join("")}</optgroup>`).join("")
    || `<option value="">لا توجد أوقات متاحة</option>`;
  if (prev && [...$("scheduleSelect").options].some(o => o.value === prev)) $("scheduleSelect").value = prev;
  onTimingChange();
}

function onTimingChange() {
  const scheduled = document.querySelector('input[name="timing"]:checked').value === "schedule";
  $("scheduleSelect").classList.toggle("hidden", !scheduled);
  const eta = state.orderType === "delivery" ? C.estimatedTime : `${C.prepTimeMinutes || 20} دقيقة تقريباً`;
  $("timingNote").textContent = scheduled
    ? "نجهز طلبك ليكون جاهزاً في الوقت المختار."
    : `الوقت المتوقع: ${eta}`;
}

function setOrderType(type) {
  state.orderType = type;
  if (state.coupon && state.coupon.type === "freeDelivery") applyCoupon();
  if (getMethod(state.payment) === null) state.payment = null;
  renderDetailsStep();
  updateCartUI();
  renderCartHint();
}

function validatePhone(raw) {
  const phone = normalizeDigits(raw).replace(/[\s\-()]/g, "");
  if (/^05\d{8}$/.test(phone)) return phone;
  const m = phone.match(/^(?:\+|00)?9665(\d{8})$/);
  return m ? "05" + m[1] : null;
}

function fieldError(id, msg) {
  showToast(msg);
  const el = $(id);
  el.focus();
  el.classList.add("ring-2", "ring-red-400");
  setTimeout(() => el.classList.remove("ring-2", "ring-red-400"), 2000);
  return false;
}

function validateDetails() {
  if (!$("customerName").value.trim()) return fieldError("customerName", "فضلاً اكتب اسمك");
  if (!validatePhone($("customerPhone").value)) return fieldError("customerPhone", "رقم الجوال غير صحيح — يبدأ بـ 05 ومكوّن من 10 أرقام");
  if (state.orderType === "delivery" && !$("customerAddress").value.trim()) return fieldError("customerAddress", "فضلاً اكتب عنوان التوصيل أو حدد موقعك");
  if (state.orderType === "dinein" && !normalizeDigits($("tableNumber").value).trim()) return fieldError("tableNumber", "فضلاً اكتب رقم الطاولة");

  const sub = subtotal();
  if (state.orderType === "delivery" && C.minOrder > 0 && sub < C.minOrder) {
    showToast(`الحد الأدنى للتوصيل ${money(C.minOrder)} — أضف أصنافاً أو اختر الاستلام`);
    return false;
  }
  const t = timing();
  if (!t.scheduled && !isStoreOpen()) {
    showToast("المحل مغلق الآن — اختر وقتاً للجدولة");
    return false;
  }
  if (t.scheduled && !t.iso) { showToast("لا توجد أوقات متاحة للجدولة حالياً"); return false; }
  return true;
}

function timing() {
  if (state.orderType === "dinein" || !canScheduleAhead()) return { scheduled: false };
  const scheduled = document.querySelector('input[name="timing"]:checked').value === "schedule";
  if (!scheduled) return { scheduled: false };
  const sel = $("scheduleSelect");
  return { scheduled: true, iso: sel.value, text: sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : "" };
}

function detectLocation(btn) {
  if (!navigator.geolocation) { alert("خاصية تحديد الموقع غير مدعومة في متصفحك."); return; }
  const original = btn.innerHTML;
  btn.innerHTML = "⏳ جاري التحديد...";
  btn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const url = `https://maps.google.com/?q=${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
      const input = $("customerAddress");
      const base = input.value.replace(/\s*\|?\s*الموقع: \S+/g, "").trim();
      input.value = (base ? base + " | " : "") + `الموقع: ${url}`;
      btn.innerHTML = "✅ تم التحديد";
      btn.disabled = false;
    },
    () => { alert("تعذر تحديد الموقع، اكتب الحي والشارع يدوياً."); btn.innerHTML = original; btn.disabled = false; },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ---------- الخطوة 3: الدفع ----------
const PAYMENT_DEFS = {
  online:         { icon: "💳", title: "ادفع الآن أونلاين", short: "دفع أونلاين", desc: "مدى • فيزا • ماستركارد • Apple Pay • STC Pay" },
  cardOnDelivery: { icon: "🏧", title: "شبكة عند الاستلام", short: "شبكة", desc: "ادفع بمدى أو Apple Pay لما يوصلك الطلب" },
  cash:           { icon: "💵", title: "كاش عند الاستلام", short: "كاش", desc: "" },
  bank:           { icon: "🏦", title: "تحويل بنكي", short: "تحويل بنكي", desc: "حوّل وأرسل الإيصال في الواتساب" },
  payAtCounter:   { icon: "🧾", title: "الدفع في الكاشير", short: "الكاشير", desc: "ادفع عند الكاشير أو اطلب الفاتورة على الطاولة" },
};

function availablePaymentMethods(orderType = state.orderType) {
  const pm = C.payment || {};
  const list = [];
  if (pm.online && pm.online.enabled && (pm.online.publishableKey || pm.online.demo)) list.push("online");
  if (orderType === "dinein") {
    if (pm.payAtCounter !== false) list.push("payAtCounter");
  } else {
    if (pm.cardOnDelivery) list.push("cardOnDelivery");
    if (pm.cash) list.push("cash");
    if (pm.bank && pm.bank.enabled && pm.bank.iban) list.push("bank");
  }
  return list.map(k => ({ key: k, ...PAYMENT_DEFS[k] }));
}

function getMethod(key) { return availablePaymentMethods().find(m => m.key === key) || null; }

function renderPaymentStep() {
  const methods = availablePaymentMethods();
  if (!getMethod(state.payment)) state.payment = methods.length ? methods[0].key : null;

  $("paymentMethodsList").innerHTML = methods.map(m => {
    let title = m.title;
    let desc = m.desc;
    if (m.key === "cardOnDelivery" && state.orderType === "pickup") { title = "شبكة في الفرع"; desc = "ادفع بمدى أو Apple Pay عند الاستلام"; }
    if (m.key === "cash" && state.orderType === "pickup") title = "كاش في الفرع";
    return `
      <label class="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-3 cursor-pointer transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
        <input type="radio" name="payMethod" value="${m.key}" ${state.payment === m.key ? "checked" : ""} onchange="selectPayment('${m.key}')" class="accent-brand-600">
        <span class="text-xl" aria-hidden="true">${m.icon}</span>
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-bold text-gray-800">${title}</span>
          ${desc ? `<span class="block text-[11px] text-gray-500">${desc}</span>` : ""}
        </span>
        ${m.key === "online" ? `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">آمن</span>` : ""}
      </label>`;
  }).join("") || `<p class="text-xs text-red-600">لا توجد طرق دفع مفعلة — راجع إعدادات payment في config.js</p>`;

  renderPaymentExtra();
  renderReview();
  renderInvoice();
  updatePrimaryButton();
}

function selectPayment(key) {
  state.payment = key;
  cancelOnlinePayment();
  renderPaymentExtra();
  updatePrimaryButton();
}

function renderPaymentExtra() {
  const box = $("paymentExtra");
  const t = totals();
  if (state.payment === "bank") {
    const b = C.payment.bank;
    box.innerHTML = `
      <div class="bg-blue-50 text-blue-900 text-xs rounded-xl px-3 py-3 space-y-1">
        ${b.bankName ? `<p>البنك: <b>${escapeHTML(b.bankName)}</b></p>` : ""}
        ${b.accountName ? `<p>اسم المستفيد: <b>${escapeHTML(b.accountName)}</b></p>` : ""}
        <p class="flex items-center gap-2 flex-wrap">الآيبان: <b dir="ltr" class="font-mono">${escapeHTML(b.iban)}</b>
          <button type="button" onclick="copyText('${escapeHTML(b.iban)}', 'تم نسخ الآيبان ✓')" class="bg-white rounded-md px-2 py-0.5 font-bold text-blue-700">نسخ</button></p>
        <p>المبلغ: <b>${money(t.total)}</b></p>
        <p class="text-blue-700 pt-1">📎 بعد التحويل أرسل صورة الإيصال في محادثة الواتساب ليتم تأكيد طلبك.</p>
      </div>`;
  } else if (state.payment === "cash" && state.orderType === "delivery") {
    box.innerHTML = `
      <label for="cashChange" class="block text-xs text-gray-600 mb-1">تحتاج باقي؟ كم المبلغ اللي معك؟ <span class="text-gray-400">(اختياري)</span></label>
      <input id="cashChange" type="text" inputmode="numeric" placeholder="مثال: 200" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none">`;
  } else {
    box.innerHTML = "";
  }
}

function copyText(text, msg) {
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast(msg), () => showToast(text));
  else showToast(text);
}

function renderReview() {
  const t = timing();
  const rows = [
    ["الاستلام", { delivery: "🛵 توصيل", pickup: "🏪 استلام من الفرع", dinein: `🍽️ محلي — طاولة ${escapeHTML(normalizeDigits($("tableNumber").value))}` }[state.orderType]],
    ["الوقت", t.scheduled ? `📅 ${escapeHTML(t.text)}` : "⚡ بأسرع وقت"],
    ["الاسم", escapeHTML($("customerName").value.trim())],
    ["الجوال", `<span dir="ltr">${escapeHTML(validatePhone($("customerPhone").value) || "")}</span>`],
  ];
  if (state.orderType === "delivery") rows.push(["العنوان", escapeHTML($("customerAddress").value.trim())]);
  $("orderReview").innerHTML = `
    <div class="flex items-center justify-between mb-1">
      <h3 class="font-bold text-gray-700">ملخص الطلب</h3>
      <button onclick="goToStep(2)" class="text-brand-700 font-bold">تعديل</button>
    </div>
    ${rows.map(([k, v]) => `<div class="flex gap-3"><span class="text-gray-400 w-14 flex-shrink-0">${k}</span><span class="text-gray-800 break-words min-w-0">${v}</span></div>`).join("")}`;
}

function renderInvoice() {
  const t = totals();
  const line = (label, value, cls = "") => `<div class="flex justify-between ${cls}"><span>${label}</span><span>${value}</span></div>`;
  let html = line(`المجموع (${t.items} ${t.items === 1 ? "صنف" : "أصناف"})`, money(t.sub), "text-gray-600");
  if (t.discount > 0) html += line(`الخصم <span class="text-[11px] bg-emerald-50 text-emerald-700 rounded px-1">${escapeHTML(state.coupon.code)}</span>`, `- ${money(t.discount)}`, "text-emerald-700 font-bold");
  if (state.orderType === "delivery") {
    html += line("التوصيل", t.delivery === 0 ? `<span class="text-emerald-700 font-bold">مجاني</span>` : money(t.delivery), "text-gray-600");
  }
  if (C.vat && C.vat.rate) {
    html += C.vat.pricesIncludeVat
      ? line(`<span class="text-[11px]">شامل ضريبة القيمة المضافة ${Math.round(C.vat.rate * 100)}%</span>`, `<span class="text-[11px]">${money(t.vat)}</span>`, "text-gray-400")
      : line(`ضريبة القيمة المضافة ${Math.round(C.vat.rate * 100)}%`, money(t.vat), "text-gray-600");
  }
  html += `<div class="border-t border-dashed border-gray-200 pt-2 flex justify-between font-extrabold text-gray-900 text-base"><span>الإجمالي</span><span>${money(t.total)}</span></div>`;
  $("invoiceBox").innerHTML = html;
}

// ======================================================================
// تنفيذ الطلب
// ======================================================================
function generateOrderId() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}-${Math.floor(Math.random() * 90 + 10)}`;
}

function buildOrder() {
  const t = totals();
  const tm = timing();
  return {
    id: generateOrderId(),
    createdAt: new Date().toISOString(),
    orderType: state.orderType,
    table: normalizeDigits($("tableNumber").value).trim(),
    timing: tm,
    customer: {
      name: $("customerName").value.trim(),
      phone: validatePhone($("customerPhone").value),
      address: $("customerAddress").value.trim(),
      notes: $("customerNotes").value.trim(),
    },
    cashChange: $("cashChange") ? normalizeDigits($("cashChange").value).trim() : "",
    payment: state.payment,
    paymentStatus: state.payment === "online" ? "pending" : "unpaid",
    paymentId: "",
    coupon: state.coupon ? state.coupon.code : "",
    lines: state.cart.map(l => ({ name: findProduct(l.productId).name, options: l.options, qty: l.qty, total: round2(l.unitPrice * l.qty) })),
    totals: t,
  };
}

function placeOrder() {
  const order = buildOrder();
  store("set", KEY("customer"), { name: order.customer.name, phone: order.customer.phone, address: order.customer.address });

  if (order.payment === "online") return startOnlinePayment(order);

  // باقي الطرق: إرسال الطلب للواتساب مباشرة
  finishOrder(order, true);
}

function finishOrder(order, openWhatsApp) {
  state.lastOrder = order;
  store("set", KEY("lastOrder"), order);
  state.cart = [];
  state.coupon = null;
  $("couponInput").value = "";
  $("couponMsg").classList.add("hidden");
  $("customerNotes").value = "";
  store("set", KEY("cart"), []);
  updateCartUI();
  renderProducts();
  if (openWhatsApp) sendToWhatsApp(order);
  renderSuccess(order);
  goToStep(4);
  if (!document.getElementById("checkoutModal").classList.contains("opacity-0")) return;
  openSheet("checkoutModal");
}

function orderMessage(o) {
  const L = [];
  const sep = "━━━━━━━━━━━━━━━━━━";
  const typeText = { delivery: "🛵 توصيل", pickup: "🏪 استلام من الفرع", dinein: `🍽️ محلي — طاولة رقم ${o.table}` }[o.orderType];
  const payText = {
    online: `💳 مدفوع أونلاين ✅${o.paymentId ? `\nرقم العملية: ${o.paymentId}` : ""}`,
    cardOnDelivery: o.orderType === "pickup" ? "🏧 شبكة في الفرع" : "🏧 شبكة عند الاستلام",
    cash: o.orderType === "pickup" ? "💵 كاش في الفرع" : `💵 كاش عند الاستلام${o.cashChange ? ` (معه ${o.cashChange} — جهزوا الباقي)` : ""}`,
    bank: "🏦 تحويل بنكي (الإيصال مرفق في المحادثة)",
    payAtCounter: "🧾 الدفع في الكاشير",
  }[o.payment];

  L.push(`*طلب جديد — ${C.storeName}* 🛒`);
  L.push(sep);
  L.push(`🔖 *رقم الطلب:* #${o.id}`);
  L.push(`📌 *النوع:* ${typeText}`);
  L.push(`⏰ *الوقت:* ${o.timing.scheduled ? `مجدول — ${o.timing.text}` : "بأسرع وقت"}`);
  L.push("");
  L.push("📋 *الأصناف:*");
  o.lines.forEach(l => {
    L.push(`▫️ *${l.name}* × ${l.qty} = ${money(l.total)}`);
    if (l.options.length) L.push(`      ↳ ${l.options.join("، ")}`);
  });
  L.push(sep);
  L.push(`المجموع: ${money(o.totals.sub)}`);
  if (o.totals.discount > 0) L.push(`الخصم (${o.coupon}): - ${money(o.totals.discount)}`);
  if (o.orderType === "delivery") L.push(`التوصيل: ${o.totals.delivery === 0 ? "مجاني" : money(o.totals.delivery)}`);
  if (C.vat && C.vat.rate) L.push(`${C.vat.pricesIncludeVat ? "شامل الضريبة" : "الضريبة"} ${Math.round(C.vat.rate * 100)}%: ${money(o.totals.vat)}`);
  L.push(`💰 *الإجمالي: ${money(o.totals.total)}*`);
  L.push(`💳 *الدفع:* ${payText}`);
  L.push(sep);
  L.push("👤 *العميل:*");
  L.push(`الاسم: ${o.customer.name}`);
  L.push(`الجوال: ${o.customer.phone}`);
  if (o.orderType === "delivery") L.push(`العنوان: ${o.customer.address}`);
  if (o.customer.notes) L.push(`ملاحظات: ${o.customer.notes}`);
  L.push(sep);
  L.push("فضلاً أكدوا استلام الطلب 🙏");
  return L.join("\n");
}

function sendToWhatsApp(order) {
  const url = `https://api.whatsapp.com/send?phone=${C.whatsappNumber}&text=${encodeURIComponent(orderMessage(order))}`;
  window.open(url, "_blank");
}

function resendLastOrder() {
  if (state.lastOrder) sendToWhatsApp(state.lastOrder);
}

function renderSuccess(o) {
  const paid = o.payment === "online" && o.paymentStatus === "paid";
  const eta = o.timing.scheduled ? o.timing.text
    : o.orderType === "delivery" ? C.estimatedTime
    : `${C.prepTimeMinutes || 20} دقيقة تقريباً`;
  const nextSteps = {
    bank: "حوّل المبلغ وأرسل صورة الإيصال في نفس محادثة الواتساب.",
    online: "تم الدفع بنجاح. اضغط الزر بالأسفل لإرسال تفاصيل الطلب للمحل.",
  }[o.payment] || "اضغط «إرسال» في الواتساب لإتمام طلبك، وننتظر تأكيدنا.";

  $("successBox").innerHTML = `
    <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mb-3">✓</div>
    <h3 class="font-extrabold text-xl text-gray-900">${paid ? "تم الدفع بنجاح" : "تم تجهيز طلبك"}</h3>
    <p class="text-sm text-gray-500 mt-1">${nextSteps}</p>

    <div class="bg-white rounded-2xl border border-gray-100 p-4 mt-5 text-right text-sm space-y-2">
      <div class="flex justify-between"><span class="text-gray-500">رقم الطلب</span><b dir="ltr">#${o.id}</b></div>
      <div class="flex justify-between"><span class="text-gray-500">الإجمالي</span><b>${money(o.totals.total)}</b></div>
      <div class="flex justify-between"><span class="text-gray-500">الدفع</span><b>${paid ? "مدفوع ✅" : PAYMENT_DEFS[o.payment].short}</b></div>
      <div class="flex justify-between"><span class="text-gray-500">${o.orderType === "dinein" ? "التجهيز" : "الوقت المتوقع"}</span><b>${escapeHTML(eta)}</b></div>
      ${o.paymentId ? `<div class="flex justify-between gap-2"><span class="text-gray-500">رقم العملية</span><b dir="ltr" class="text-[11px] break-all">${escapeHTML(o.paymentId)}</b></div>` : ""}
    </div>

    <button onclick="resendLastOrder()" class="w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
      ${waIcon()} ${o.payment === "online" ? "إرسال الطلب للمحل عبر الواتساب" : "فتح الواتساب مرة ثانية"}
    </button>
    <button onclick="closeCheckout()" class="w-full mt-2 text-sm font-bold text-gray-500 py-2">العودة للمنيو</button>`;
}

// ======================================================================
// الدفع الإلكتروني (ميسّر)
// ======================================================================
const MOYASAR_VERSION = "1.14.0";

function loadMoyasar() {
  if (window.Moyasar) return Promise.resolve();
  if (loadMoyasar._p) return loadMoyasar._p;
  loadMoyasar._p = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}/moyasar.css`;
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = `https://cdn.moyasar.com/mpf/${MOYASAR_VERSION}/moyasar.js`;
    s.onload = resolve;
    s.onerror = () => { loadMoyasar._p = null; reject(new Error("moyasar")); };
    document.head.appendChild(s);
  });
  return loadMoyasar._p;
}

async function startOnlinePayment(order) {
  const cfg = C.payment.online;
  if (!cfg.publishableKey && cfg.demo) return startDemoPayment(order);
  const btn = $("primaryBtn");
  btn.disabled = true;
  btn.innerHTML = "⏳ جاري تجهيز الدفع...";
  try {
    await loadMoyasar();
  } catch (e) {
    showToast("تعذر تحميل بوابة الدفع، جرب مرة ثانية أو اختر طريقة أخرى");
    updatePrimaryButton();
    return;
  }

  // حفظ الطلب قبل التحويل لصفحة البنك (3D Secure)
  store("set", KEY("pendingOrder"), order);

  $("onlinePaySection").classList.remove("hidden");
  $("checkoutFooter").classList.add("hidden");
  document.querySelector(".mysr-form").innerHTML = "";

  const callbackUrl = location.origin + location.pathname + (state.table ? `?table=${encodeURIComponent(state.table)}` : "");
  Moyasar.init({
    element: ".mysr-form",
    language: "ar",
    amount: Math.round(order.totals.total * 100), // بالهللة
    currency: C.currencyCode || "SAR",
    description: `${C.storeName} — طلب #${order.id}`,
    publishable_api_key: cfg.publishableKey,
    callback_url: callbackUrl,
    methods: cfg.methods || ["creditcard", "applepay", "stcpay"],
    supported_networks: ["mada", "visa", "mastercard"],
    apple_pay: {
      country: "SA",
      label: C.storeName,
      validate_merchant_url: "https://api.moyasar.com/v1/applepay/initiate",
    },
    metadata: { order_id: order.id, customer_phone: order.customer.phone },
    on_completed: async (payment) => {
      order.paymentId = payment.id;
      store("set", KEY("pendingOrder"), order);
    },
  });
  setTimeout(() => $("onlinePaySection").scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}

// وضع العرض التجريبي: لا يطلب أي بيانات بطاقة ولا يخصم أي مبلغ
function startDemoPayment(order) {
  store("set", KEY("pendingOrder"), order);
  $("onlinePaySection").classList.remove("hidden");
  $("checkoutFooter").classList.add("hidden");
  document.querySelector(".mysr-form").innerHTML = `
    <div class="border-2 border-dashed border-amber-300 bg-amber-50 rounded-xl p-4 text-center space-y-3">
      <p class="text-xs font-bold text-amber-800">🧪 وضع تجريبي — لن يُطلب أي بيانات بطاقة ولن يُخصم أي مبلغ</p>
      <p class="text-[11px] text-amber-700">بعد ربط حساب ميسّر (publishableKey) تظهر هنا شاشة الدفع الحقيقية: مدى، فيزا، Apple Pay، STC Pay.</p>
      <p class="text-sm font-extrabold text-gray-900">المبلغ: ${money(order.totals.total)}</p>
      <div class="grid grid-cols-2 gap-2">
        <button onclick="demoPaymentResult(true)" class="bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold">✅ محاكاة دفع ناجح</button>
        <button onclick="demoPaymentResult(false)" class="bg-white border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-bold">❌ محاكاة فشل</button>
      </div>
    </div>`;
  setTimeout(() => $("onlinePaySection").scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}

function demoPaymentResult(ok) {
  const params = new URLSearchParams({ id: "DEMO-" + Date.now().toString(36).toUpperCase(), status: ok ? "paid" : "failed", message: ok ? "" : "تم رفض العملية (تجريبي)" });
  cancelOnlinePayment();
  handlePaymentReturn(params);
}

function cancelOnlinePayment() {
  $("onlinePaySection").classList.add("hidden");
  $("checkoutFooter").classList.toggle("hidden", state.step === 4);
  updatePrimaryButton();
}

function handlePaymentReturn(params) {
  const id = params.get("id");
  const status = params.get("status");
  const message = params.get("message") || "";
  // تنظيف الرابط
  const clean = new URL(location.href);
  ["id", "status", "message"].forEach(k => clean.searchParams.delete(k));
  history.replaceState(null, "", clean.pathname + clean.search);

  const order = store("get", KEY("pendingOrder"));
  if (!order) return;

  if (status === "paid") {
    order.paymentStatus = "paid";
    order.paymentId = id;
    store("del", KEY("pendingOrder"));
    // متصفحات الجوال تمنع فتح الواتساب تلقائياً بعد التحويل، لذلك يضغط العميل زر الإرسال
    finishOrder(order, false);
  } else {
    showToast(`لم تتم عملية الدفع${message ? ": " + message : ""} — جرّب مرة ثانية أو اختر طريقة دفع أخرى`);
    openCheckout();
    goToStep(3);
  }
}
