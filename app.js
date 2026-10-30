/**
 * إعدادات المتجر - يمكن تعديلها بسهولة لأي عميل
 */
const STORE_CONFIG = {
  storeName: "مقهى ومخبز الأصالة",
  whatsappNumber: "966500000000", // ضع رقم واتساب المتجر هنا مع المفتاح الدولي بدون علامة +
  currency: "ر.س",
  deliveryFee: 15, // رسوم التوصيل
  estimatedTime: "20 - 35 دقيقة",
  logoEmoji: "☕",
  
  // تصنيفات المنيو
  categories: [
    { id: "all", name: "الكل" },
    { id: "coffee", name: "قهوة ومشروبات ساخنة" },
    { id: "cold", name: "مشروبات باردة ومثلجة" },
    { id: "bakery", name: "حلويات ومخبوزات" },
    { id: "breakfast", name: "ساندوتشات وإفطار" },
  ],

  // قائمة الأصناف
  products: [
    {
      id: 1,
      category: "coffee",
      name: "فلات وايت (Flat White)",
      description: "إسبريسو غني ومزدوج مع حليب مبخر برغوة حريرية وناعمة.",
      price: 18,
      badge: "الأكثر طلباً ⭐",
      image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      category: "coffee",
      name: "كورتادو كلاسيك",
      description: "توازن مثالي بنسبة متساوية بين الإسبريسو والحليب الدافئ.",
      price: 16,
      badge: "",
      image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      category: "coffee",
      name: "قهوة اليوم المقطرة (V60)",
      description: "محصول إثيوبي فاخر ذو إيحاءات فاكهية وزهرية منعشة.",
      price: 20,
      badge: "مميز",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      category: "cold",
      name: "سبانش لاتيه مثلج (Iced Spanish Latte)",
      description: "مزيج منعش من الإسبريسو المركز مع الحليب المكثف المحلى وقطع الثلج.",
      price: 22,
      badge: "الأكثر طلباً ⭐",
      image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      category: "cold",
      name: "ايس كركديه بالرمان المنعش",
      description: "شاي كركديه بارد بنكهة الرمان والنعناع الطبيعي اللذيذ.",
      price: 17,
      badge: "جديد 🌿",
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

// حالة التطبيق (State)
let currentCategory = "all";
let searchQuery = "";
let cart = {}; // { productId: quantity }
let orderType = "delivery"; // 'delivery' أو 'pickup'

// عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  initializeStoreInfo();
  renderCategories();
  renderProducts();
  setupSearch();
});

// تهيئة بيانات المتجر في الواجهة
function initializeStoreInfo() {
  document.getElementById("storeName").textContent = STORE_CONFIG.storeName;
  document.getElementById("storeLogo").textContent = STORE_CONFIG.logoEmoji;
  document.getElementById("deliveryTime").textContent = STORE_CONFIG.estimatedTime;
  document.getElementById("directWhatsAppBtn").href = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent("السلام عليكم، عندي استفسار بخصوص المنيو والطلبات")}`;
}

// عرض أزرار التصنيفات
function renderCategories() {
  const bar = document.getElementById("categoriesBar");
  bar.innerHTML = STORE_CONFIG.categories.map(cat => `
    <button 
      onclick="selectCategory('${cat.id}')" 
      class="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${currentCategory === cat.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
      id="cat-btn-${cat.id}">
      ${cat.name}
    </button>
  `).join("");
}

// تغيير التصنيف
function selectCategory(catId) {
  currentCategory = catId;
  renderCategories();
  renderProducts();
}

// البحث في المنتجات
function setupSearch() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderProducts();
  });
}

// عرض المنتجات
function renderProducts() {
  const container = document.getElementById("productsGrid");
  const noResults = document.getElementById("noResults");
  
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
    const qty = cart[product.id] || 0;
    return `
      <div class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-3 items-center hover:shadow-md transition">
        <img src="${product.image}" alt="${product.name}" class="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-gray-100" loading="lazy">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-1">
            <h3 class="font-bold text-gray-900 text-sm truncate">${product.name}</h3>
            ${product.badge ? `<span class="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold">${product.badge}</span>` : ''}
          </div>
          <p class="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">${product.description}</p>
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-emerald-700 text-sm">${product.price} <span class="text-xs font-normal">${STORE_CONFIG.currency}</span></span>
            
            ${qty === 0 ? `
              <button onclick="addToCart(${product.id})" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition active:scale-95">
                <span>+</span> إضافة
              </button>
            ` : `
              <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button onclick="updateCartQuantity(${product.id}, -1)" class="w-6 h-6 rounded-lg bg-white shadow-xs text-gray-700 font-bold text-xs flex items-center justify-center hover:bg-gray-50">-</button>
                <span class="text-xs font-bold text-gray-800 w-4 text-center">${qty}</span>
                <button onclick="updateCartQuantity(${product.id}, 1)" class="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center hover:bg-emerald-700">+</button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// إضافة منتج للسلة
function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  updateCartUI();
  renderProducts();
}

// تعديل الكمية
function updateCartQuantity(productId, delta) {
  if (!cart[productId]) return;
  cart[productId] += delta;
  if (cart[productId] <= 0) {
    delete cart[productId];
  }
  updateCartUI();
  renderProducts();
  renderCartModalItems();
}

// تحديث شريط السلة العائم والحسابات
function updateCartUI() {
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const subtotal = calculateSubtotal();
  const delivery = orderType === "delivery" ? STORE_CONFIG.deliveryFee : 0;
  const grandTotal = subtotal + delivery;

  const cartBar = document.getElementById("cartBar");
  const cartBadgeCount = document.getElementById("cartBadgeCount");
  const cartBarTotal = document.getElementById("cartBarTotal");

  if (totalItems > 0) {
    cartBar.classList.remove("translate-y-28", "opacity-0", "pointer-events-none");
    cartBadgeCount.textContent = totalItems;
    cartBarTotal.textContent = grandTotal;
  } else {
    cartBar.classList.add("translate-y-28", "opacity-0", "pointer-events-none");
    toggleCheckoutModal(false);
  }

  // تحديث أرقام ملخص الحساب
  document.getElementById("summarySubtotal").textContent = subtotal;
  document.getElementById("summaryDelivery").textContent = delivery;
  document.getElementById("summaryTotal").textContent = grandTotal;
}

// حساب المجموع الفرعي للأصناف
function calculateSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = STORE_CONFIG.products.find(item => item.id === parseInt(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

// تبديل نافذة السلة والطلب
function toggleCheckoutModal(show) {
  const modal = document.getElementById("checkoutModal");
  if (show) {
    renderCartModalItems();
    updateCartUI();
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.querySelector(".transform").classList.remove("translate-y-full");
  } else {
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.querySelector(".transform").classList.add("translate-y-full");
  }
}

// عرض عناصر السلة داخل النافذة
function renderCartModalItems() {
  const container = document.getElementById("cartItemsList");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    container.innerHTML = `<p class="text-center py-4 text-xs text-gray-400">السلة فارغة حالياً</p>`;
    return;
  }

  container.innerHTML = entries.map(([id, qty]) => {
    const p = STORE_CONFIG.products.find(item => item.id === parseInt(id));
    if (!p) return "";
    return `
      <div class="flex items-center justify-between py-2 text-xs">
        <div>
          <h4 class="font-bold text-gray-800">${p.name}</h4>
          <span class="text-gray-400">${p.price} ${STORE_CONFIG.currency} × ${qty} = <b>${p.price * qty} ${STORE_CONFIG.currency}</b></span>
        </div>
        <div class="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-lg">
          <button onclick="updateCartQuantity(${p.id}, -1)" class="w-5 h-5 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-100 rounded">-</button>
          <span class="font-bold text-gray-800 text-xs px-1">${qty}</span>
          <button onclick="updateCartQuantity(${p.id}, 1)" class="w-5 h-5 flex items-center justify-center text-emerald-600 font-bold hover:bg-emerald-50 rounded">+</button>
        </div>
      </div>
    `;
  }).join("");
}

// تغيير نوع الطلب (توصيل / استلام)
function setOrderType(type) {
  orderType = type;
  const deliveryBtn = document.getElementById("deliveryBtn");
  const pickupBtn = document.getElementById("pickupBtn");
  const addressSection = document.getElementById("addressSection");
  const deliveryRow = document.getElementById("summaryDeliveryRow");

  if (type === "delivery") {
    deliveryBtn.className = "py-2 text-sm font-bold rounded-lg bg-white text-emerald-700 shadow-sm transition";
    pickupBtn.className = "py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-white/50 transition";
    addressSection.classList.remove("hidden");
    deliveryRow.classList.remove("hidden");
  } else {
    pickupBtn.className = "py-2 text-sm font-bold rounded-lg bg-white text-emerald-700 shadow-sm transition";
    deliveryBtn.className = "py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-white/50 transition";
    addressSection.classList.add("hidden");
    deliveryRow.classList.add("hidden");
  }

  updateCartUI();
}

// تحديد الموقع الجغرافي للعميل تلقائياً
let detectedLocationUrl = "";
function detectLocation() {
  if (!navigator.geolocation) {
    alert("عذراً، خاصية تحديد الموقع غير مدعومة في متصفحك.");
    return;
  }
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.innerHTML = "⏳ جاري تحديد موقعك...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      detectedLocationUrl = `https://maps.google.com/?q=${lat},${lng}`;
      const addressInput = document.getElementById("customerAddress");
      addressInput.value = (addressInput.value ? addressInput.value + " | " : "") + `رابط الموقع: ${detectedLocationUrl}`;
      btn.innerHTML = "✅ تم تحديد موقعك";
    },
    (err) => {
      alert("تعذر تحديد الموقع، يرجى كتابة اسم الحي والشارع يدوياً.");
      btn.innerHTML = originalText;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// إنشاء وتجهيز رسالة الطلب للواتساب
function submitOrderToWhatsApp() {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const notes = document.getElementById("customerNotes").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;

  // التحقق من الحقول الإجبارية
  if (!name) {
    alert("فضلاً أدخل اسمك الكريم.");
    document.getElementById("customerName").focus();
    return;
  }
  if (!phone) {
    alert("فضلاً أدخل رقم جوالك للتواصل.");
    document.getElementById("customerPhone").focus();
    return;
  }
  if (orderType === "delivery" && !address) {
    alert("فضلاً اكتب عنوان التوصيل أو اضغط على مشاركة موقعي.");
    document.getElementById("customerAddress").focus();
    return;
  }

  // إنشاء رقم طلب عشوائي أنيق
  const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const timeString = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  // تجميع قائمة الأصناف
  let itemsText = "";
  let subtotal = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const p = STORE_CONFIG.products.find(item => item.id === parseInt(id));
    if (p) {
      const linePrice = p.price * qty;
      subtotal += linePrice;
      itemsText += `▫️ *${p.name}* × ${qty} = ${linePrice} ${STORE_CONFIG.currency}\n`;
    }
  });

  const deliveryFee = orderType === "delivery" ? STORE_CONFIG.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  // بناء الرسالة الاحترافية للواتساب
  let message = `*طلب جديد عبر المنيو الرقمي* 🛒✨\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔖 *رقم الطلب:* #${orderId}\n`;
  message += `⏰ *الوقت:* ${timeString}\n`;
  message += `📌 *طريقة الاستلام:* ${orderType === "delivery" ? "🛵 توصيل للعنوان" : "🏪 استلام من الفرع"}\n\n`;
  
  message += `📋 *الأصناف المطلوبة:*\n${itemsText}\n`;
  
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *المجموع الفرعي:* ${subtotal} ${STORE_CONFIG.currency}\n`;
  if (orderType === "delivery") {
    message += `🛵 *رسوم التوصيل:* ${deliveryFee} ${STORE_CONFIG.currency}\n`;
  }
  message += `💵 *الإجمالي النهائي:* *${grandTotal} ${STORE_CONFIG.currency}*\n`;
  message += `💳 *طريقة الدفع:* ${paymentMethod}\n\n`;

  message += `👤 *بيانات العميل:*\n`;
  message += `▫️ *الاسم:* ${name}\n`;
  message += `▫️ *الجوال:* ${phone}\n`;
  if (orderType === "delivery") {
    message += `▫️ *العنوان:* ${address}\n`;
  }
  if (notes) {
    message += `▫️ *ملاحظات خاصة:* ${notes}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `يرجى تأكيد استلام الطلب والبدء في تجهيزه. شكراً لكم! 🙏`;

  // فتح الواتساب
  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${STORE_CONFIG.whatsappNumber}&text=${encodedMsg}`;
  
  window.open(whatsappUrl, "_blank");
}
