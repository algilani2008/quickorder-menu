/**
 * QuickOrder — منطق الخادم (العملاء، الطلبات، نقاط الولاء، تعديل الأصناف)
 * نفس الملف يشتغل في مكانين:
 *   1) داخل Google Apps Script (البيانات في Google Sheets) — انظر google-apps-script/Code.gs
 *   2) في المتصفح كوضع تجريبي (البيانات في المتصفح فقط)
 * لا تحتاج لتعديل هذا الملف.
 */
var QO_TABLES = {
  customers: ["phone", "name", "marketing", "createdAt", "lastOrderAt", "orders", "spent", "points", "redeemed"],
  orders: ["id", "createdAt", "phone", "name", "type", "total", "pointsBase", "payment", "paymentId", "items",
           "status", "points", "rewardId", "rewardName", "rewardCost", "confirmedAt"],
  products: ["id", "image", "price", "available", "updatedAt"],
};

var QO_STATUS = { NEW: "جديد", CONFIRMED: "مؤكد", CANCELLED: "ملغي" };

function qoNormalizePhone(raw) {
  var s = String(raw == null ? "" : raw)
    .replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); })
    .replace(/[\s\-()]/g, "");
  if (/^05\d{8}$/.test(s)) return s;
  var m = s.match(/^(?:\+|00)?9665(\d{8})$/);
  if (m) return "05" + m[1];
  if (/^5\d{8}$/.test(s)) return "0" + s;
  return null;
}

function qoNum(v) { var n = Number(v); return isFinite(n) ? n : 0; }
function qoBool(v) { return v === true || v === "TRUE" || v === "true" || v === 1 || v === "نعم"; }
function qoStr(v, max) { return String(v == null ? "" : v).slice(0, max || 500); }

function qoFind(rows, key, value) {
  for (var i = 0; i < rows.length; i++) if (String(rows[i][key]) === String(value)) return rows[i];
  return null;
}

/** رصيد العميل المتاح = النقاط المؤكدة − المكافآت المحجوزة في طلبات لم تُؤكد بعد */
function qoBalance(db, phone) {
  var c = qoFind(db.getRows("customers"), "phone", phone);
  var orders = db.getRows("orders").filter(function (o) { return String(o.phone) === phone && o.status === QO_STATUS.NEW; });
  var reserved = orders.reduce(function (s, o) { return s + qoNum(o.rewardCost); }, 0);
  var pending = orders.reduce(function (s, o) { return s + qoNum(o.points); }, 0);
  var points = c ? qoNum(c.points) : 0;
  return { customer: c, points: points, available: points - reserved, pending: pending };
}

function qoUpsertCustomer(db, phone, name, marketing, now) {
  var rows = db.getRows("customers");
  var c = qoFind(rows, "phone", phone);
  if (!c) {
    db.appendRow("customers", { phone: phone, name: name, marketing: marketing ? "نعم" : "لا", createdAt: now,
      lastOrderAt: "", orders: 0, spent: 0, points: 0, redeemed: 0 });
    return qoFind(db.getRows("customers"), "phone", phone);
  }
  var changes = {};
  if (name && name !== c.name) changes.name = name;
  if (marketing && !qoBool(c.marketing)) changes.marketing = "نعم";
  if (Object.keys(changes).length) db.updateRow("customers", c, changes);
  return c;
}

/**
 * نقطة الدخول الوحيدة
 * @param db    محوّل التخزين: getRows(table) / appendRow(table,obj) / updateRow(table,row,changes)
 * @param opts  { adminPassword, saveImage(productId, dataUrl) -> url, now() -> string }
 */
function qoHandle(db, action, data, opts) {
  data = data || {};
  var now = opts.now ? opts.now() : new Date().toISOString();
  var isAdmin = opts.adminPassword && String(data.password || "") === String(opts.adminPassword);
  function fail(msg) { return { ok: false, error: msg }; }

  // ---------------- عام (للعملاء) ----------------
  if (action === "menu") {
    return { ok: true, products: db.getRows("products").map(function (p) {
      return { id: qoNum(p.id), image: p.image || "", price: p.price === "" || p.price == null ? null : qoNum(p.price),
        available: p.available === "" || p.available == null ? null : qoBool(p.available) };
    }) };
  }

  if (action === "lookup") {
    var phone = qoNormalizePhone(data.phone);
    if (!phone) return fail("رقم الجوال غير صحيح");
    var b = qoBalance(db, phone);
    if (!b.customer) return { ok: true, found: false };
    // لا نرجع الاسم الكامل ولا أي بيانات أخرى، فقط الاسم الأول والرصيد
    return { ok: true, found: true, firstName: String(b.customer.name || "").split(" ")[0],
      points: b.points, available: b.available, pending: b.pending, marketing: qoBool(b.customer.marketing) };
  }

  if (action === "register") {
    var p2 = qoNormalizePhone(data.phone);
    var name = qoStr(data.name, 60).trim();
    if (!p2) return fail("رقم الجوال غير صحيح");
    if (!name) return fail("الاسم مطلوب");
    qoUpsertCustomer(db, p2, name, qoBool(data.marketing), now);
    var b2 = qoBalance(db, p2);
    return { ok: true, points: b2.points, available: b2.available, pending: b2.pending };
  }

  if (action === "order") {
    var p3 = qoNormalizePhone(data.phone);
    var id = qoStr(data.id, 40);
    if (!p3 || !/^[A-Za-z0-9-]{1,40}$/.test(id)) return fail("بيانات الطلب ناقصة");
    if (qoFind(db.getRows("orders"), "id", id)) return { ok: true, duplicate: true };
    qoUpsertCustomer(db, p3, qoStr(data.name, 60).trim(), qoBool(data.marketing), now);
    var c3 = qoFind(db.getRows("customers"), "phone", p3);
    db.updateRow("customers", c3, { lastOrderAt: now });
    db.appendRow("orders", {
      id: id, createdAt: now, phone: p3, name: qoStr(data.name, 60), type: qoStr(data.type, 20),
      total: qoNum(data.total), pointsBase: qoNum(data.pointsBase), payment: qoStr(data.payment, 30),
      paymentId: qoStr(data.paymentId, 80), items: qoStr(data.items, 3000), status: QO_STATUS.NEW,
      points: Math.max(0, Math.floor(qoNum(data.estPoints))),
      rewardId: data.rewardId ? qoNum(data.rewardId) : "", rewardName: qoStr(data.rewardName, 80),
      rewardCost: Math.max(0, qoNum(data.rewardCost)), confirmedAt: "",
    });
    return { ok: true };
  }

  // ---------------- لوحة التحكم ----------------
  if (!isAdmin) return fail("كلمة المرور غير صحيحة");

  if (action === "login") return { ok: true };

  if (action === "orders") {
    var list = db.getRows("orders").slice(-(qoNum(data.limit) || 150)).reverse();
    return { ok: true, orders: list.map(function (o) { var x = {}; QO_TABLES.orders.forEach(function (k) { x[k] = o[k]; }); return x; }) };
  }

  if (action === "confirm") {
    var o = qoFind(db.getRows("orders"), "id", data.id);
    if (!o) return fail("الطلب غير موجود");
    if (o.status !== QO_STATUS.NEW) return fail("الطلب " + o.status + " مسبقاً");
    var ppr = qoNum(data.pointsPerRiyal);
    var earned = Math.max(0, Math.floor(qoNum(o.pointsBase) * ppr));
    var cost = qoNum(o.rewardCost);
    var c4 = qoFind(db.getRows("customers"), "phone", o.phone);
    var bal = c4 ? qoNum(c4.points) : 0;
    if (cost > bal) return fail("رصيد العميل (" + bal + " نقطة) لا يكفي للمكافأة (" + cost + " نقطة). ألغِ الطلب أو تواصل مع العميل.");
    db.updateRow("orders", o, { status: QO_STATUS.CONFIRMED, points: earned, confirmedAt: now });
    if (c4) db.updateRow("customers", c4, {
      points: bal + earned - cost, redeemed: qoNum(c4.redeemed) + cost,
      orders: qoNum(c4.orders) + 1, spent: Math.round((qoNum(c4.spent) + qoNum(o.total)) * 100) / 100,
    });
    return { ok: true, earned: earned, balance: bal + earned - cost };
  }

  if (action === "cancel") {
    var o2 = qoFind(db.getRows("orders"), "id", data.id);
    if (!o2) return fail("الطلب غير موجود");
    if (o2.status !== QO_STATUS.NEW) return fail("الطلب " + o2.status + " مسبقاً");
    db.updateRow("orders", o2, { status: QO_STATUS.CANCELLED, points: 0 });
    return { ok: true };
  }

  if (action === "customers") {
    return { ok: true, customers: db.getRows("customers").map(function (c) {
      return { phone: String(c.phone), name: c.name, marketing: qoBool(c.marketing), createdAt: c.createdAt,
        lastOrderAt: c.lastOrderAt, orders: qoNum(c.orders), spent: qoNum(c.spent), points: qoNum(c.points) };
    }) };
  }

  if (action === "adjustPoints") {
    var c5 = qoFind(db.getRows("customers"), "phone", qoNormalizePhone(data.phone));
    if (!c5) return fail("العميل غير موجود");
    var np = Math.max(0, qoNum(c5.points) + Math.round(qoNum(data.delta)));
    db.updateRow("customers", c5, { points: np });
    return { ok: true, points: np };
  }

  if (action === "setProduct" || action === "uploadImage") {
    var pid = qoNum(data.id);
    if (!pid) return fail("رقم الصنف غير صحيح");
    var changes = { updatedAt: now };
    if (action === "uploadImage") {
      if (!/^data:image\/(jpeg|png|webp);base64,/.test(String(data.dataUrl || ""))) return fail("صيغة الصورة غير مدعومة");
      if (String(data.dataUrl).length > 3 * 1024 * 1024) return fail("الصورة كبيرة جداً");
      changes.image = opts.saveImage(pid, data.dataUrl);
    } else {
      if ("image" in data) changes.image = qoStr(data.image, 1000);
      if ("price" in data) changes.price = data.price === null || data.price === "" ? "" : qoNum(data.price);
      if ("available" in data) changes.available = data.available === null ? "" : (qoBool(data.available) ? "TRUE" : "FALSE");
    }
    var row = qoFind(db.getRows("products"), "id", pid);
    if (row) db.updateRow("products", row, changes);
    else {
      var fresh = { id: pid, image: "", price: "", available: "", updatedAt: now };
      Object.keys(changes).forEach(function (k) { fresh[k] = changes[k]; });
      db.appendRow("products", fresh);
    }
    return { ok: true, image: changes.image };
  }

  return fail("إجراء غير معروف: " + action);
}

// تصدير لبيئة Node (للاختبارات فقط)
if (typeof module !== "undefined") module.exports = { qoHandle: qoHandle, qoNormalizePhone: qoNormalizePhone, QO_TABLES: QO_TABLES };
