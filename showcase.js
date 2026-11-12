/* وضع العرض: يعرّف الزائر بفكرة الموقع، ويعرض رسالة الواتساب بدل إرسالها لرقم غير حقيقي */
(function () {
  const C = (typeof STORE_CONFIG !== "undefined") ? STORE_CONFIG : {};
  if (!C.showcase) return;
  const isRestaurant = /restaurant\/?$/.test(location.pathname.replace(/index\.html$/, ""));
  const other = isRestaurant
    ? { href: "../", label: "☕ نموذج المقهى" }
    : { href: "restaurant/", label: "🍖 نموذج المطعم" };

  const css = `
  .sc-bar{background:#0f172a;color:#f8fafc;font-size:12.5px;line-height:1.7}
  .sc-bar .in{max-width:28rem;margin:auto;padding:10px 16px}
  .sc-bar b{color:#fde68a}
  .sc-bar a{color:#93c5fd;font-weight:700;text-decoration:underline;white-space:nowrap}
  .sc-sec{max-width:28rem;margin:28px auto 0;padding:0 16px}
  .sc-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px;margin-bottom:12px}
  .sc-card h2{font-size:15px;font-weight:800;color:#111827;margin:0 0 10px}
  .sc-card p,.sc-card li{font-size:13px;color:#374151;line-height:1.8}
  .sc-card ol{margin:0;padding-inline-start:20px;list-style:decimal}.sc-card ol li{margin-bottom:4px}
  .sc-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .sc-grid div{background:#f9fafb;border-radius:10px;padding:8px 10px;font-size:12.5px;color:#1f2937}
  .sc-by{font-size:12px;color:#6b7280;text-align:center;padding:4px 0 8px}
  .sc-modal{position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:100;display:flex;align-items:flex-end;justify-content:center}@media(min-width:640px){.sc-modal{align-items:center}.sc-modal .box{border-radius:20px}}
  .sc-modal .box{background:#fff;width:100%;max-width:28rem;border-radius:20px 20px 0 0;padding:16px;max-height:85vh;overflow:auto}
  .sc-modal pre{white-space:pre-wrap;font-family:inherit;background:#dcf8c6;border-radius:12px;padding:12px;font-size:13px;line-height:1.7;color:#111}
  @media(min-width:768px){.sc-bar .in,.sc-sec{max-width:48rem}}@media(min-width:1024px){.sc-bar .in,.sc-sec{max-width:72rem}.sc-sec{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:12px;align-items:start}.sc-sec .sc-by{grid-column:1/-1}.sc-grid{grid-template-columns:1fr 1fr}.sc-bar .in{font-size:14px}}
  .sc-modal button{width:100%;margin-top:12px;background:#111827;color:#fff;border:0;border-radius:12px;padding:11px;font-weight:700}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // شريط التعريف أعلى الصفحة
  const bar = document.createElement("div");
  bar.className = "sc-bar";
  bar.innerHTML = `<div class="in"><b>نموذج عرض</b>: موقع طلبات جاهز لـ${isRestaurant ? "مطعم" : "مقهى"}. جرّب تطلب كأنك عميل، ما فيه دفع حقيقي ولا يوصل الطلب لأحد. في موقع محلك الفعلي يوصل الطلب مرتّب على واتساب المحل. · <a href="${other.href}">${other.label}</a></div>`;
  document.body.insertBefore(bar, document.body.firstChild);

  // قسم الفكرة وطريقة العمل قبل التذييل
  const sec = document.createElement("section");
  sec.className = "sc-sec";
  sec.innerHTML = `
    <div class="sc-card">
      <h2>وش فكرة الموقع؟</h2>
      <p>أغلب المطاعم والمقاهي تعطي تطبيقات التوصيل عمولة من كل طلب. هذا الموقع يخلي المحل يستقبل الطلبات بنفسه: العميل يفتح الرابط أو يمسح الباركود، يختار ويطلب، والطلب يوصل واتساب المحل بكل التفاصيل، بدون عمولة.</p>
    </div>
    <div class="sc-card">
      <h2>وش فيه؟</h2>
      <div class="sc-grid">
        <div>📱 منيو للجوال بالأقسام والبحث</div>
        <div>🧩 خيارات الحجم والإضافات</div>
        <div>🛵 توصيل واستلام وطلب من الطاولة</div>
        <div>📅 جدولة الطلب لوقت لاحق</div>
        <div>🎟️ أكواد خصم</div>
        <div>⭐ نقاط ولاء للعملاء</div>
        <div>🧾 فاتورة شاملة الضريبة</div>
        <div>🔐 لوحة تحكم للأسعار والصور</div>
      </div>
    </div>
    <div class="sc-card">
      <h2>كيف يتجهز لمحلك؟</h2>
      <ol>
        <li>ترسل المنيو والأسعار والصور ورقم واتساب المحل.</li>
        <li>أجهز الموقع بشعارك وألوانك، مع باركود للطاولات.</li>
        <li>تبدأ تستقبل الطلبات على واتسابك، وتعدل الأسعار بنفسك من لوحة التحكم.</li>
      </ol>
    </div>
    <p class="sc-by">تصميم وتنفيذ: عبدالكريم الجيلاني</p>`;
  const footer = document.querySelector("footer");
  if (footer) footer.parentNode.insertBefore(sec, footer);

  // زر الواتساب في الرأس يروح لرقم غير حقيقي في النموذج، فنخفيه
  const wa = document.getElementById("directWhatsAppBtn");
  if (wa) wa.style.display = "none";

  // نص الدفع الإلكتروني
  const payNote = document.getElementById("payGatewayNote");
  if (payNote) payNote.textContent = "في الموقع الفعلي يُربط الدفع ببوابة دفع مرخصة يختارها المحل (مثل ميسّر)، والموقع ما يحتفظ ببيانات البطاقة.";

  // بدل فتح واتساب لرقم وهمي: نعرض الرسالة اللي توصل المحل
  window.sendToWhatsApp = function (order) {
    const m = document.createElement("div");
    m.className = "sc-modal";
    m.innerHTML = `<div class="box"><p style="font-weight:800;font-size:14px;margin:0 0 6px">هذي الرسالة اللي توصل واتساب المحل</p><p style="font-size:12px;color:#6b7280;margin:0 0 10px">في النموذج ما تنرسل لأحد. في موقع محلك تنفتح على واتسابك مباشرة.</p><pre></pre><button type="button">تمام</button></div>`;
    m.querySelector("pre").textContent = orderMessage(order);
    m.querySelector("button").onclick = () => m.remove();
    m.onclick = e => { if (e.target === m) m.remove(); };
    document.body.appendChild(m);
  };
})();
