/**
 * QuickOrder — لوحة التحكم
 */
const C = STORE_CONFIG;
const $ = (id) => document.getElementById(id);
const PW_KEY = "qo_admin_pw_" + (C.storeId || C.whatsappNumber);
let password = "";
let orders = [];
let customers = [];
let overrides = {};
let orderFilter = "جديد";

function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function money(n) { const v = Math.round(Number(n || 0) * 100) / 100; return `${Number.isInteger(v) ? v : v.toFixed(2)} ${C.currency}`; }
function toast(t) {
  const el = $("toast"); el.textContent = t;
  el.classList.remove("opacity-0", "-translate-y-4");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.add("opacity-0", "-translate-y-4"), 2600);
}
function fmtDate(iso) {
  const d = new Date(iso); if (isNaN(d)) return esc(iso);
  return d.toLocaleString("ar-SA-u-nu-latn", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
function intlPhone(p) { return "966" + String(p).replace(/^0/, ""); }
function api(action, data = {}) { return Backend.call(action, { ...data, password }); }

// ---------------- الدخول ----------------
document.addEventListener("DOMContentLoaded", () => {
  document.title = `لوحة التحكم — ${C.storeName}`;
  $("loginLogo").textContent = C.logoEmoji;
  $("loginStore").textContent = C.storeName;
  $("headerLogo").textContent = C.logoEmoji;
  $("headerStore").textContent = C.storeName;

  const mode = Backend.mode();
  if (mode === "off") {
    $("loginError").textContent = "الخادم غير مفعّل — أضف رابط Google Apps Script في config.js → backend.url";
    $("loginError").classList.remove("hidden");
    $("loginBtn").disabled = true;
  }
  if (mode === "demo") {
    $("demoNote").textContent = `🧪 وضع تجريبي — البيانات محفوظة في هذا المتصفح فقط. كلمة المرور التجريبية: ${(C.backend && C.backend.demoPassword) || "1234"}`;
    $("demoNote").classList.remove("hidden");
  }
  $("modeBadge").innerHTML = mode === "live" ? `<span class="text-emerald-600">● متصل بـ Google Sheets</span>` : `<span class="text-amber-600">● وضع تجريبي</span>`;
  $("passwordInput").addEventListener("keydown", e => { if (e.key === "Enter") login(); });

  document.querySelectorAll("#tabs .tab").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
  document.querySelectorAll("#orderFilter button").forEach(b => b.addEventListener("click", () => { orderFilter = b.dataset.f; renderOrders(); }));
  $("productSearch").addEventListener("input", renderProducts);
  $("customerSearch").addEventListener("input", renderCustomers);
  $("onlyConsent").addEventListener("change", renderCustomers);
  $("offerText").value = `هلا {الاسم} 👋\nعندنا لك عرض خاص من ${C.storeName}: خصم 15% على طلبك القادم بالكود SAVE15 🎉\nرصيد نقاطك: {النقاط} نقطة\nاطلب من هنا: ${location.href.replace(/admin\.html.*$/, "")}`;
  $("offerText").addEventListener("input", renderCustomers);

  let saved = ""; try { saved = sessionStorage.getItem(PW_KEY) || ""; } catch (e) {}
  if (saved) { $("passwordInput").value = saved; login(); }
});

function login() {
  password = $("passwordInput").value;
  $("loginBtn").disabled = true; $("loginBtn").textContent = "جاري الدخول...";
  api("login").then(res => {
    $("loginBtn").disabled = false; $("loginBtn").textContent = "دخول";
    if (!res.ok) { $("loginError").textContent = res.error; $("loginError").classList.remove("hidden"); return; }
    try { sessionStorage.setItem(PW_KEY, password); } catch (e) {}
    $("loginView").classList.add("hidden");
    $("appView").classList.remove("hidden");
    showTab("orders");
    loadOrders(); loadMenu(); loadCustomers();
    setInterval(loadOrders, 60000);
  });
}
function logout() { try { sessionStorage.removeItem(PW_KEY); } catch (e) {} location.reload(); }

function showTab(tab) {
  document.querySelectorAll("#tabs .tab").forEach(b => {
    const on = b.dataset.tab === tab;
    b.className = `tab px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap ${on ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500"}`;
  });
  document.querySelectorAll("[data-panel]").forEach(p => p.classList.toggle("hidden", p.dataset.panel !== tab));
}

// ---------------- الطلبات ----------------
const TYPE_LABEL = { delivery: "🛵 توصيل", pickup: "🏪 استلام", dinein: "🍽️ محلي" };
const STATUS_CLS = { "جديد": "bg-blue-50 text-blue-700", "مؤكد": "bg-emerald-50 text-emerald-700", "ملغي": "bg-gray-100 text-gray-500" };

function loadOrders() {
  return api("orders").then(res => {
    if (!res.ok) return toast(res.error);
    orders = res.orders;
    const n = orders.filter(o => o.status === "جديد").length;
    $("newCount").textContent = n; $("newCount").classList.toggle("hidden", !n);
    renderOrders();
  });
}

function renderOrders() {
  document.querySelectorAll("#orderFilter button").forEach(b => b.className = `px-3 py-1.5 rounded-lg ${b.dataset.f === orderFilter ? "bg-white shadow-sm text-brand-700" : "text-gray-500"}`);
  const list = orders.filter(o => !orderFilter || o.status === orderFilter);
  const ppr = (C.loyalty && C.loyalty.pointsPerRiyal) || 0;
  $("ordersList").innerHTML = list.map(o => `
    <article class="bg-white border border-gray-100 rounded-2xl p-3 text-sm">
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="font-extrabold" dir="ltr">#${esc(o.id)}</p>
          <p class="text-[11px] text-gray-400">${fmtDate(o.createdAt)} • ${TYPE_LABEL[o.type] || esc(o.type)}</p>
        </div>
        <span class="text-[11px] font-bold rounded-lg px-2 py-1 ${STATUS_CLS[o.status] || ""}">${esc(o.status)}</span>
      </div>
      <div class="flex items-center justify-between mt-2">
        <p class="font-bold">${esc(o.name)} <a href="tel:${esc(o.phone)}" class="text-xs text-gray-500 font-normal mr-1" dir="ltr">${esc(o.phone)}</a></p>
        <a href="https://wa.me/${intlPhone(o.phone)}" target="_blank" rel="noopener" class="text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg px-2 py-1">💬 واتساب</a>
      </div>
      <pre class="whitespace-pre-wrap font-sans text-xs text-gray-600 bg-gray-50 rounded-xl p-2 mt-2">${esc(o.items)}</pre>
      ${o.rewardName ? `<p class="text-xs font-bold text-amber-700 bg-amber-50 rounded-lg px-2 py-1 mt-2">🎁 مكافأة: ${esc(o.rewardName)} — ${esc(o.rewardCost)} نقطة</p>` : ""}
      <div class="flex items-center justify-between mt-2 text-xs">
        <span>💳 ${esc(o.payment)}${o.paymentId ? ` <span class="text-gray-400" dir="ltr">${esc(o.paymentId)}</span>` : ""}</span>
        <b class="text-base">${money(o.total)}</b>
      </div>
      ${o.status === "جديد" ? `
        <div class="grid grid-cols-3 gap-2 mt-3">
          <button data-id="${esc(o.id)}" onclick="confirmOrder(this.dataset.id)" class="col-span-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-2.5 text-sm font-bold">✓ تأكيد${ppr ? ` (+${Math.floor(Number(o.pointsBase) * ppr)} نقطة)` : ""}</button>
          <button data-id="${esc(o.id)}" onclick="cancelOrder(this.dataset.id)" class="bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm font-bold">إلغاء</button>
        </div>` : o.status === "مؤكد" && Number(o.points) ? `<p class="text-[11px] text-emerald-700 mt-2">⭐ أُضيف للعميل ${esc(o.points)} نقطة</p>` : ""}
    </article>`).join("") || `<p class="text-center text-sm text-gray-400 py-10">لا توجد طلبات ${orderFilter ? "بحالة «" + orderFilter + "»" : ""}</p>`;
}

function confirmOrder(id) {
  api("confirm", { id, pointsPerRiyal: (C.loyalty && C.loyalty.pointsPerRiyal) || 0 }).then(res => {
    if (!res.ok) return toast(res.error);
    toast(res.earned ? `تم التأكيد ✓ أُضيف ${res.earned} نقطة (الرصيد ${res.balance})` : "تم التأكيد ✓");
    loadOrders(); loadCustomers();
  });
}
function cancelOrder(id) {
  if (!confirm("إلغاء هذا الطلب؟ لن تُضاف أي نقاط.")) return;
  api("cancel", { id }).then(res => { if (!res.ok) return toast(res.error); toast("تم الإلغاء"); loadOrders(); });
}

// ---------------- الأصناف والصور ----------------
function loadMenu() {
  return Backend.call("menu").then(res => {
    overrides = {};
    (res.products || []).forEach(p => overrides[p.id] = p);
    renderProducts();
  });
}

function renderProducts() {
  const q = $("productSearch").value.trim();
  const catName = id => (C.categories.find(c => c.id === id) || {}).name || "";
  $("productsList").innerHTML = C.products.filter(p => !q || p.name.includes(q)).map(p => {
    const o = overrides[p.id] || {};
    const image = o.image || p.image || "";
    const price = o.price != null ? o.price : p.price;
    const available = o.available != null ? o.available : p.available !== false;
    return `
      <div class="bg-white border border-gray-100 rounded-2xl p-2.5 flex items-center gap-3 ${available ? "" : "opacity-60"}">
        <label class="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center text-3xl flex-shrink-0 cursor-pointer group">
          <span>${p.emoji || C.logoEmoji}</span>
          ${image ? `<img src="${esc(image)}" alt="" onerror="this.remove()" class="absolute inset-0 w-full h-full object-cover">` : ""}
          <span class="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] font-bold text-center py-1">📷 تغيير</span>
          <input type="file" accept="image/*" class="hidden" onchange="uploadImage(${p.id}, this)">
        </label>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm truncate">${esc(p.name)}</p>
          <p class="text-[11px] text-gray-400">${esc(catName(p.category))}${o.image ? ` • <button onclick="resetImage(${p.id})" class="text-brand-700 underline">الصورة الأصلية</button>` : ""}</p>
          <div class="flex items-center gap-2 mt-1.5">
            <div class="relative w-24">
              <input type="number" min="0" step="0.5" value="${price}" onchange="setPrice(${p.id}, this.value)" class="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none" aria-label="السعر">
              <span class="absolute left-2 top-2 text-[10px] text-gray-400">${C.currency}</span>
            </div>
            <label class="flex items-center gap-1 text-xs font-bold ${available ? "text-emerald-700" : "text-gray-500"}">
              <input type="checkbox" ${available ? "checked" : ""} onchange="setAvailable(${p.id}, this.checked)" class="accent-emerald-600 w-4 h-4"> ${available ? "متوفر" : "نفد"}
            </label>
          </div>
        </div>
      </div>`;
  }).join("");
}

function saveProduct(id, changes, msg) {
  return api("setProduct", { id, ...changes }).then(res => {
    if (!res.ok) return toast(res.error);
    overrides[id] = { ...(overrides[id] || { id }), ...changes };
    renderProducts(); toast(msg);
  });
}
function setPrice(id, v) {
  const p = C.products.find(x => x.id === id);
  const n = Number(v);
  if (!(n >= 0)) return toast("سعر غير صحيح");
  saveProduct(id, { price: n === p.price ? null : n }, `تم تحديث سعر ${p.name} ✓`);
}
function setAvailable(id, on) {
  const p = C.products.find(x => x.id === id);
  saveProduct(id, { available: on === (p.available !== false) ? null : on }, on ? `${p.name} متوفر ✓` : `تم إيقاف ${p.name}`);
}
function resetImage(id) { saveProduct(id, { image: "" }, "رجعت الصورة الأصلية ✓"); }

// تصغير الصورة في الجوال قبل الرفع (أقصى عرض 800 بكسل)
function resizeImage(file, max = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("تعذر قراءة الصورة")); };
    img.src = url;
  });
}

async function uploadImage(id, input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) return toast("اختر ملف صورة");
  toast("⏳ جاري رفع الصورة...");
  try {
    const dataUrl = await resizeImage(file);
    const res = await api("uploadImage", { id, dataUrl });
    if (!res.ok) return toast(res.error);
    overrides[id] = { ...(overrides[id] || { id }), image: res.image };
    renderProducts();
    toast("تم تحديث الصورة ✓ تظهر في المنيو الآن");
  } catch (e) { toast(e.message); }
  input.value = "";
}

// ---------------- العملاء والعروض ----------------
function loadCustomers() {
  return api("customers").then(res => { if (!res.ok) return toast(res.error); customers = res.customers; renderCustomers(); });
}

function renderCustomers() {
  const consented = customers.filter(c => c.marketing);
  const totalPoints = customers.reduce((s, c) => s + c.points, 0);
  $("customerStats").innerHTML = [["العملاء", customers.length], ["يقبلون العروض", consented.length], ["نقاط بأرصدتهم", totalPoints]]
    .map(([k, v]) => `<div class="bg-white border border-gray-100 rounded-2xl p-3 text-center"><p class="text-xl font-extrabold">${v}</p><p class="text-[11px] text-gray-500">${k}</p></div>`).join("");

  const q = $("customerSearch").value.trim();
  const only = $("onlyConsent").checked;
  const text = $("offerText").value;
  const list = customers.filter(c => (!only || c.marketing) && (!q || String(c.name).includes(q) || String(c.phone).includes(q)))
    .sort((a, b) => String(b.lastOrderAt || b.createdAt).localeCompare(String(a.lastOrderAt || a.createdAt)));
  $("customersList").innerHTML = list.map(c => {
    const msg = text.replace(/\{الاسم\}/g, String(c.name).split(" ")[0]).replace(/\{النقاط\}/g, c.points);
    return `
      <div class="flex items-center gap-3 p-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold truncate">${esc(c.name)} ${c.marketing ? "" : `<span class="text-[10px] text-gray-400 font-normal">(لا يقبل العروض)</span>`}</p>
          <p class="text-[11px] text-gray-500"><span dir="ltr">${esc(c.phone)}</span> • ${c.orders} طلب • ${money(c.spent)} • ⭐ ${c.points}</p>
        </div>
        ${c.marketing ? `<a href="https://wa.me/${intlPhone(c.phone)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" onclick="this.classList.add('opacity-50'); this.textContent='✓ أُرسل'" class="text-xs font-bold text-white bg-emerald-600 rounded-lg px-3 py-2 flex-shrink-0">إرسال</a>` : ""}
      </div>`;
  }).join("") || `<p class="text-center text-sm text-gray-400 py-8">لا يوجد عملاء${only ? " موافقين على العروض" : ""} بعد</p>`;
}

function exportCustomers() {
  const rows = [["الاسم", "الجوال", "يقبل العروض", "عدد الطلبات", "إجمالي المشتريات", "النقاط", "تاريخ التسجيل", "آخر طلب"]]
    .concat(customers.map(c => [c.name, c.phone, c.marketing ? "نعم" : "لا", c.orders, c.spent, c.points, c.createdAt, c.lastOrderAt]));
  const csv = "﻿" + rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `customers-${C.storeId || "store"}.csv`;
  a.click();
}
