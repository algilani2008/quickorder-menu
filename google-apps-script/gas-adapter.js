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
