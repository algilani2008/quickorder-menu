/**
 * QuickOrder — سكربت Google Apps Script (العملاء، الطلبات، النقاط، الصور)
 * انسخ هذا الملف كامل والصقه في Apps Script. خطوات الإعداد في README.md
 * (ملف مولّد: backend-core.js + gas-adapter.js)
 */

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

// ===================================================================
//  ✏️ الإعداد الوحيد المطلوب: غيّر كلمة مرور لوحة التحكم
// ===================================================================
var ADMIN_PASSWORD = "غيرني-1234";   // ⚠️ غيّرها لكلمة قوية قبل النشر (8 أحرف أو أكثر)
var IMAGES_FOLDER_NAME = "QuickOrder - صور المنيو";

// ===================================================================
//  لا تعدّل شي تحت هذا السطر
// ===================================================================
var QO_SHEET_NAMES = { customers: "العملاء", orders: "الطلبات", products: "تعديلات الأصناف" };
var QO_HEADERS_AR = {
  customers: ["الجوال", "الاسم", "يقبل العروض", "تاريخ التسجيل", "آخر طلب", "عدد الطلبات المؤكدة", "إجمالي المشتريات", "رصيد النقاط", "نقاط مستبدلة"],
  orders: ["رقم الطلب", "التاريخ", "الجوال", "الاسم", "النوع", "الإجمالي", "أساس النقاط", "الدفع", "رقم عملية الدفع", "الأصناف",
           "الحالة", "النقاط", "رقم المكافأة", "المكافأة", "تكلفة المكافأة", "تاريخ التأكيد"],
  products: ["رقم الصنف", "رابط الصورة", "السعر", "متوفر", "آخر تعديل"],
};

function qoSheet_(table) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(QO_SHEET_NAMES[table]);
  if (!sh) {
    sh = ss.insertSheet(QO_SHEET_NAMES[table]);
    sh.getRange(1, 1, 1, QO_HEADERS_AR[table].length).setValues([QO_HEADERS_AR[table]]).setFontWeight("bold").setBackground("#f3f4f6");
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
    sh.getRange("A:Z").setNumberFormat("@"); // نص، حتى لا يضيع الصفر في أول رقم الجوال
  }
  return sh;
}

var QoSheetsDb = {
  _cache: {},
  getRows: function (table) {
    if (this._cache[table]) return this._cache[table];
    var sh = qoSheet_(table);
    var keys = QO_TABLES[table];
    var last = sh.getLastRow();
    var values = last > 1 ? sh.getRange(2, 1, last - 1, keys.length).getValues() : [];
    var rows = values.map(function (v, i) {
      var o = { _row: i + 2 };
      keys.forEach(function (k, j) { o[k] = v[j] instanceof Date ? v[j].toISOString() : v[j]; });
      return o;
    });
    this._cache[table] = rows;
    return rows;
  },
  appendRow: function (table, obj) {
    var sh = qoSheet_(table);
    var keys = QO_TABLES[table];
    sh.appendRow(keys.map(function (k) { return obj[k] == null ? "" : String(obj[k]); }));
    delete this._cache[table];
  },
  updateRow: function (table, row, changes) {
    var sh = qoSheet_(table);
    var keys = QO_TABLES[table];
    Object.keys(changes).forEach(function (k) {
      var col = keys.indexOf(k);
      if (col < 0) return;
      sh.getRange(row._row, col + 1).setValue(changes[k] == null ? "" : String(changes[k]));
      row[k] = changes[k];
    });
  },
};

function qoSaveImage_(productId, dataUrl) {
  var m = String(dataUrl).match(/^data:(image\/[a-z]+);base64,(.+)$/);
  var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], "product-" + productId + "-" + Date.now() + ".jpg");
  var folders = DriveApp.getFoldersByName(IMAGES_FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(IMAGES_FOLDER_NAME);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://lh3.googleusercontent.com/d/" + file.getId() + "=w800";
}

function qoRespond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function qoRun_(action, data) {
  var weakPassword = !ADMIN_PASSWORD || ADMIN_PASSWORD === "غيرني-1234" || String(ADMIN_PASSWORD).length < 8;
  var opts = { adminPassword: weakPassword ? null : ADMIN_PASSWORD, saveImage: qoSaveImage_ };
  if (weakPassword && data && data.password) return { ok: false, error: "غيّر ADMIN_PASSWORD في السكربت لكلمة قوية (8 أحرف أو أكثر) ثم انشر نسخة جديدة" };
  if (action === "menu" || action === "lookup") return qoHandle(QoSheetsDb, action, data, opts);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return qoHandle(QoSheetsDb, action, data, opts); }
  finally { lock.releaseLock(); }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  try { return qoRespond_(qoRun_(p.action || "menu", p)); }
  catch (err) { return qoRespond_({ ok: false, error: String(err) }); }
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    return qoRespond_(qoRun_(body.action, body));
  } catch (err) { return qoRespond_({ ok: false, error: String(err) }); }
}

/** شغّل هذه الدالة مرة وحدة من المحرر لإنشاء الأوراق ومنح الصلاحيات */
function setup() {
  ["customers", "orders", "products"].forEach(qoSheet_);
  var folders = DriveApp.getFoldersByName(IMAGES_FOLDER_NAME);
  if (!folders.hasNext()) DriveApp.createFolder(IMAGES_FOLDER_NAME);
  Logger.log("✅ تم إنشاء الأوراق ومجلد الصور. الآن: Deploy ← New deployment ← Web app");
}
