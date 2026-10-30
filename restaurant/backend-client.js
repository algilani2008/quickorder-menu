/**
 * QuickOrder — الاتصال بالخادم (Google Sheets) أو بالوضع التجريبي
 * لا تحتاج لتعديل هذا الملف. الإعداد في config.js → backend
 */
var Backend = (function () {
  var cfg = (STORE_CONFIG.backend || {});
  var storeKey = "qo_demo_db_" + (STORE_CONFIG.storeId || STORE_CONFIG.whatsappNumber);

  // ---------- قاعدة بيانات الوضع التجريبي (داخل هذا المتصفح فقط) ----------
  function loadDemo() {
    try { return JSON.parse(localStorage.getItem(storeKey)) || {}; } catch (e) { return {}; }
  }
  function saveDemo(db) {
    try { localStorage.setItem(storeKey, JSON.stringify(db)); }
    catch (e) { throw new Error("مساحة التخزين في المتصفح ممتلئة (الوضع التجريبي)"); }
  }
  var demoDb = {
    getRows: function (t) { var db = loadDemo(); return (db[t] || []).map(function (r, i) { var o = Object.assign({}, r); o._i = i; return o; }); },
    appendRow: function (t, obj) { var db = loadDemo(); (db[t] = db[t] || []).push(obj); saveDemo(db); },
    updateRow: function (t, row, changes) {
      var db = loadDemo(); var r = db[t][row._i];
      Object.keys(changes).forEach(function (k) { r[k] = changes[k]; row[k] = changes[k]; });
      saveDemo(db);
    },
  };

  function mode() { return cfg.url ? "live" : cfg.demo ? "demo" : "off"; }

  function call(action, data) {
    data = data || {};
    if (mode() === "live") {
      var body = Object.assign({ action: action }, data);
      return fetch(cfg.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .catch(function () { return { ok: false, error: "تعذر الاتصال بالخادم، تحقق من الإنترنت" }; });
    }
    if (mode() === "demo") {
      try {
        var res = qoHandle(demoDb, action, data, {
          adminPassword: cfg.demoPassword || "1234",
          saveImage: function (id, dataUrl) { return dataUrl; },
        });
        return Promise.resolve(res);
      } catch (e) { return Promise.resolve({ ok: false, error: e.message }); }
    }
    return Promise.resolve({ ok: false, error: "الخادم غير مفعّل في config.js" });
  }

  // إرسال لا ينتظر الرد ويكمل حتى لو انتقل العميل للواتساب
  function send(action, data) {
    if (mode() === "live") {
      try {
        fetch(cfg.url, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(Object.assign({ action: action }, data)) });
      } catch (e) { /* تجاهل */ }
      return;
    }
    call(action, data);
  }

  return { call: call, send: send, mode: mode, enabled: function () { return mode() !== "off"; } };
})();
