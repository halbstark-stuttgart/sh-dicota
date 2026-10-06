/*!
 * DICOTA · myDICOTA Promo Sheet Builder
 * Builds A4 promotion sheets from Shopify products (theme-only, no app needed).
 * Data endpoints (theme templates):
 *   {lang}/search?…&view=promo-search          → product search by name / SKU
 *   {lang}/products/{handle}?view=promo-data   → localized texts + contextual (B2B) price
 * Drafts are stored in the browser (IndexedDB) and can be exported / imported as JSON.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Config & dictionaries
   * ------------------------------------------------------------------ */

  var TEMPLATES = [
    { id: 'spotlight', counts: [4, 6], name: 'Spotlight', tone: 'light',
      desc: { de: 'Emotional · großes Bild, Headline im Bild', en: 'Emotional · large image, headline on image' } },
    { id: 'showcase', counts: [4, 6, 8], name: 'Showcase',
      desc: { de: 'Ausgewogen · Bildband + Produktkacheln', en: 'Balanced · image band + product tiles' } },
    { id: 'facts', counts: [8, 12], name: 'Fact Sheet', tone: 'light',
      desc: { de: 'Sachlich · kompakter Kopf, viele Produkte', en: 'Factual · compact header, many products' } },
    { id: 'pricelist', counts: [4, 6, 8, 12], name: 'Price List',
      desc: { de: 'Textlich · Preisliste mit Zeilen', en: 'Text-led · price list in rows' } },
    { id: 'editorial', counts: [5, 9, 12], featured: [5, 9], name: 'Editorial',
      countLabel: { 5: '1 + 4', 9: '1 + 8', 12: '12' },
      desc: { de: 'DICOTA-Flyer · Bild mit Verlauf, Top-Produkt groß', en: 'DICOTA flyer · faded image, hero product' } }
  ];

  var UI = {
    de: {
      template: 'Vorlage', products_n: 'Anzahl Produkte', campaign: 'Kampagne', campaignName: 'Kampagnenname',
      campaignNameHint: 'Erscheint als Kicker über der Headline und im Dateinamen',
      showName: 'Kampagnenname auf dem Sheet zeigen', language: 'Sprache des Sheets', accent: 'Akzentfarbe',
      validFrom: 'Gültig ab', validTo: 'Gültig bis', header: 'Kopfbereich', headerImage: 'Header-Hintergrundbild',
      headerPos: 'Bildausschnitt', posTop: 'oben', posCenter: 'Mitte', posBottom: 'unten',
      logo: 'Kampagnen-/Promotion-Logo (optional, erscheint oben links)', logoBox: 'Weißes Feld mit Rahmen (für transparente PNGs)',
      brandTone: 'DICOTA-Logo oben rechts', toneAuto: 'automatisch', toneDark: 'schwarz', toneLight: 'weiß', upload: 'Bild wählen', remove: 'Entfernen',
      headline: 'Headline (Promotion Header)', intro: 'Intro-Text', productsSec: 'Produkte',
      search: 'Suche nach Artikelnummer oder Name …', noResults: 'Keine Treffer', searching: 'Suche …',
      slots: '{n} von {max} Plätzen belegt', rrp: 'RRP', promo: 'Aktionspreis', discount: 'Rabatt-Badge (−x %) anzeigen',
      notOnSheet: 'nicht auf dem Sheet (Anzahl erhöhen)', priceWarn: 'Aktionspreis ist nicht niedriger als der RRP',
      changeImage: 'Anderes Bild', up: 'Nach oben', down: 'Nach unten', del: 'Entfernen', variant: 'Variante',
      footer: 'Fußzeile & Kontakt', contactName: 'Ansprechpartner', email: 'E-Mail', phone: 'Telefon',
      note: 'Zusatzhinweis (optional)', labels: 'Preis-Beschriftungen (optional überschreiben)',
      labelRrp: 'Label Streichpreis', labelPromo: 'Label Aktionspreis',
      newSheet: 'Neu', mySheets: 'Meine Sheets', exportJson: 'Export', importJson: 'Import', pdf: 'PDF erstellen',
      saved: 'Gespeichert', saving: 'Speichert …', open: 'Öffnen', duplicate: 'Duplizieren', delete: 'Löschen',
      close: 'Schließen', noSheets: 'Noch keine gespeicherten Sheets.', confirmDelete: 'Sheet „{n}" wirklich löschen?',
      confirmNew: 'Neues Sheet beginnen? Das aktuelle Sheet bleibt gespeichert.',
      emptySlots: 'Es sind noch {n} Produktplätze leer. Trotzdem PDF erstellen?',
      overflow: 'Text passt nicht vollständig auf das Sheet – Headline oder Intro kürzen.',
      notB2B: 'Hinweis: Du bist nicht über einen B2B-Firmenstandort eingeloggt. Die Streichpreise entsprechen dann nicht dem Recommended Reseller Price.',
      loadError: 'Produktdaten konnten nicht geladen werden', missingLang: 'In dieser Sprache nicht verfügbar',
      importError: 'Datei konnte nicht gelesen werden.', untitled: 'Ohne Titel', preview: 'Vorschau A4',
      printHint: 'Im Druckdialog „Als PDF speichern" wählen, Ränder: Keine, Hintergrundgrafiken: an.',
      addSlot: 'Produkt hinzufügen', copy: 'Kopie', imageTooBig: 'Bild konnte nicht verarbeitet werden. Bitte JPG, PNG oder WebP verwenden (kein HEIC).',
      dropHint: 'oder Bild hierher ziehen',
      showArgs: 'Sales Arguments anzeigen (wenn Platz)'
    },
    en: {
      template: 'Template', products_n: 'Number of products', campaign: 'Campaign', campaignName: 'Campaign name',
      campaignNameHint: 'Shown as kicker above the headline and used as file name',
      showName: 'Show campaign name on sheet', language: 'Sheet language', accent: 'Accent colour',
      validFrom: 'Valid from', validTo: 'Valid until', header: 'Header', headerImage: 'Header background image',
      headerPos: 'Image crop', posTop: 'top', posCenter: 'centre', posBottom: 'bottom',
      logo: 'Campaign / promotion logo (optional, shown top left)', logoBox: 'White box with frame (for transparent PNGs)',
      brandTone: 'DICOTA logo top right', toneAuto: 'automatic', toneDark: 'black', toneLight: 'white', upload: 'Choose image', remove: 'Remove',
      headline: 'Headline (promotion header)', intro: 'Intro text', productsSec: 'Products',
      search: 'Search by item number or name …', noResults: 'No results', searching: 'Searching …',
      slots: '{n} of {max} slots filled', rrp: 'RRP', promo: 'Promo price', discount: 'Show discount badge (−x %)',
      notOnSheet: 'not on sheet (increase count)', priceWarn: 'Promo price is not lower than RRP',
      changeImage: 'Other image', up: 'Move up', down: 'Move down', del: 'Remove', variant: 'Variant',
      footer: 'Footer & contact', contactName: 'Contact person', email: 'Email', phone: 'Phone',
      note: 'Additional note (optional)', labels: 'Price labels (optional override)',
      labelRrp: 'Strike-through label', labelPromo: 'Promo price label',
      newSheet: 'New', mySheets: 'My sheets', exportJson: 'Export', importJson: 'Import', pdf: 'Create PDF',
      saved: 'Saved', saving: 'Saving …', open: 'Open', duplicate: 'Duplicate', delete: 'Delete',
      close: 'Close', noSheets: 'No saved sheets yet.', confirmDelete: 'Really delete sheet "{n}"?',
      confirmNew: 'Start a new sheet? The current one stays saved.',
      emptySlots: '{n} product slots are still empty. Create PDF anyway?',
      overflow: 'Text does not fully fit the sheet – shorten headline or intro.',
      notB2B: 'Note: you are not logged in via a B2B company location. Strike-through prices will not be the Recommended Reseller Price.',
      loadError: 'Could not load product data', missingLang: 'Not available in this language',
      importError: 'Could not read file.', untitled: 'Untitled', preview: 'A4 preview',
      printHint: 'In the print dialog choose "Save as PDF", margins: none, background graphics: on.',
      addSlot: 'Add product', copy: 'copy', imageTooBig: 'Image could not be processed. Please use JPG, PNG or WebP (no HEIC).',
      dropHint: 'or drop an image here',
      showArgs: 'Show sales arguments (if space)'
    }
  };

  // Fixed labels printed on the sheet, per sheet language
  var SHEET_TXT = {
    en: { sku: 'Item no.', rrp: 'RRP', promo: 'Promo price', product: 'Product', from: 'Valid from {a}', to: 'Valid until {b}', range: 'Promotion valid {a} – {b}', note: 'All prices in {c}, excl. VAT. While stocks last. Errors and changes excepted.', contact: 'Your contact' },
    de: { sku: 'Art.-Nr.', rrp: 'RRP', promo: 'Aktionspreis', product: 'Produkt', from: 'Gültig ab {a}', to: 'Gültig bis {b}', range: 'Aktion gültig {a} – {b}', note: 'Alle Preise in {c} zzgl. MwSt. Solange Vorrat reicht. Irrtümer und Änderungen vorbehalten.', contact: 'Ihr Ansprechpartner' },
    fr: { sku: 'Réf.', rrp: 'PRR', promo: 'Prix promo', product: 'Produit', from: 'Valable à partir du {a}', to: "Valable jusqu'au {b}", range: 'Offre valable du {a} au {b}', note: "Tous les prix en {c}, hors TVA. Dans la limite des stocks disponibles. Sous réserve d'erreurs et de modifications.", contact: 'Votre contact' },
    it: { sku: 'Cod. art.', rrp: 'PRR', promo: 'Prezzo promo', product: 'Prodotto', from: 'Valido dal {a}', to: 'Valido fino al {b}', range: 'Promozione valida dal {a} al {b}', note: 'Tutti i prezzi in {c}, IVA esclusa. Fino ad esaurimento scorte. Salvo errori e modifiche.', contact: 'Il vostro referente' },
    nl: { sku: 'Art.nr.', rrp: 'RRP', promo: 'Actieprijs', product: 'Product', from: 'Geldig vanaf {a}', to: 'Geldig t/m {b}', range: 'Actie geldig {a} – {b}', note: 'Alle prijzen in {c}, excl. btw. Zolang de voorraad strekt. Onder voorbehoud van fouten en wijzigingen.', contact: 'Uw contactpersoon' },
    es: { sku: 'Ref.', rrp: 'PVR', promo: 'Precio promo', product: 'Producto', from: 'Válido desde el {a}', to: 'Válido hasta el {b}', range: 'Promoción válida del {a} al {b}', note: 'Todos los precios en {c}, IVA no incluido. Hasta agotar existencias. Salvo errores y modificaciones.', contact: 'Su contacto' },
    pl: { sku: 'Nr art.', rrp: 'RRP', promo: 'Cena promocyjna', product: 'Produkt', from: 'Ważne od {a}', to: 'Ważne do {b}', range: 'Promocja ważna {a} – {b}', note: 'Wszystkie ceny w {c}, netto. Do wyczerpania zapasów. Z zastrzeżeniem błędów i zmian.', contact: 'Twój opiekun' },
    cs: { sku: 'Č. zboží', rrp: 'RRP', promo: 'Akční cena', product: 'Produkt', from: 'Platí od {a}', to: 'Platí do {b}', range: 'Akce platí {a} – {b}', note: 'Všechny ceny v {c} bez DPH. Do vyprodání zásob. Chyby a změny vyhrazeny.', contact: 'Váš kontakt' },
    da: { sku: 'Varenr.', rrp: 'RRP', promo: 'Kampagnepris', product: 'Produkt', from: 'Gælder fra {a}', to: 'Gælder til {b}', range: 'Kampagnen gælder {a} – {b}', note: 'Alle priser i {c} ekskl. moms. Så længe lager haves. Med forbehold for fejl og ændringer.', contact: 'Din kontaktperson' },
    ar: { sku: 'رقم الصنف', rrp: 'السعر الموصى به', promo: 'سعر العرض', product: 'المنتج', from: 'ساري من {a}', to: 'ساري حتى {b}', range: 'العرض ساري {a} – {b}', note: 'جميع الأسعار بعملة {c} غير شاملة ضريبة القيمة المضافة. حتى نفاد الكمية.', contact: 'جهة الاتصال' },
    hi: { sku: 'आइटम नं.', rrp: 'RRP', promo: 'प्रोमो मूल्य', product: 'उत्पाद', from: '{a} से मान्य', to: '{b} तक मान्य', range: 'ऑफ़र {a} – {b} तक मान्य', note: 'सभी मूल्य {c} में, VAT अतिरिक्त। स्टॉक रहने तक।', contact: 'आपका संपर्क' }
  };

  var DB_NAME = 'dicota-psb';
  var STORE = 'sheets';
  var LAST_KEY = 'dicota-psb-last';

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function safeUrl(u) {
    if (!u || typeof u !== 'string') return '';
    if (/^data:image\/(png|jpe?g|webp|gif|svg\+xml);/i.test(u)) return u;
    if (/^(https:)?\/\//i.test(u)) return u;
    if (/^\/[^/]/.test(u)) return u;
    return '';
  }
  function uid() { return 'ps_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function fill(str, map) { return String(str).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; }); }
  function debounce(fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function parseAmount(v) {
    if (v == null) return NaN;
    var s = String(v).trim().replace(/[^\d.,-]/g, '');
    if (!s) return NaN;
    var lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
    if (lc > ld) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
    return parseFloat(s);
  }
  function numLocale(lang) { return lang === 'ar' ? 'ar-u-nu-latn' : lang === 'hi' ? 'hi-u-nu-latn' : lang; }
  function fmtMoney(amount, currency, lang) {
    if (!isFinite(amount)) return '';
    try {
      return new Intl.NumberFormat(numLocale(lang), { style: 'currency', currency: currency || 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    } catch (e) { return (currency || '') + ' ' + amount.toFixed(2); }
  }
  function fmtDate(iso, lang) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d)) return iso;
    try { return new Intl.DateTimeFormat(numLocale(lang), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d); }
    catch (e) { return iso; }
  }
  function fetchJson(url) {
    // no JSON Accept header: Shopify would answer with its own product JSON instead of the ?view= template
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) { var e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
        return r.text();
      })
      .then(function (t) { return JSON.parse(t); });
  }
  function readFileAsDataURL(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(fr.result); };
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  // Downscale large uploads so drafts stay small; keep PNG (transparency) for logos, SVG untouched.
  function canvasHasAlpha(ctx, w, h) {
    try {
      var d = ctx.getImageData(0, 0, w, h).data, step = Math.max(4, Math.floor(d.length / 4 / 40000) * 4);
      for (var i = 3; i < d.length; i += step) if (d[i] < 250) return true;
    } catch (e) { /* ignore */ }
    return false;
  }
  function processImage(file, maxW, keepAlpha, info) {
    info = info || {};
    return readFileAsDataURL(file).then(function (dataUrl) {
      if (/^data:image\/svg/i.test(dataUrl)) { info.alpha = true; return dataUrl; }
      return new Promise(function (res, rej) {
        var img = new Image();
        img.onload = function () {
          var scale = Math.min(1, maxW / img.naturalWidth);
          var w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          var ctx = c.getContext('2d');
          if (!keepAlpha) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
          ctx.drawImage(img, 0, 0, w, h);
          info.alpha = keepAlpha ? canvasHasAlpha(ctx, w, h) : false;
          // logos without transparency are stored as JPEG (smaller), transparent ones as PNG
          try { res(keepAlpha && info.alpha ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.9)); }
          catch (e) { rej(e); }
        };
        img.onerror = rej;
        img.src = dataUrl;
      });
    });
  }
  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function readableOn(hex) {
    var c = hexToRgb(hex); if (!c) return '#fff';
    var l = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
    return l > 0.6 ? '#111418' : '#ffffff';
  }

  /* ------------------------------------------------------------------ *
   * Storage (IndexedDB, falls back to memory)
   * ------------------------------------------------------------------ */

  var Store = (function () {
    var mem = {};
    var dbp = null;
    function db() {
      if (dbp) return dbp;
      dbp = new Promise(function (res, rej) {
        try {
          var req = indexedDB.open(DB_NAME, 1);
          req.onupgradeneeded = function () { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
          req.onsuccess = function () { res(req.result); };
          req.onerror = function () { rej(req.error); };
        } catch (e) { rej(e); }
      });
      return dbp;
    }
    function tx(mode, fn) {
      return db().then(function (d) {
        return new Promise(function (res, rej) {
          var t = d.transaction(STORE, mode);
          var out = fn(t.objectStore(STORE));
          t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
          t.onerror = function () { rej(t.error); };
        });
      });
    }
    return {
      put: function (s) { return tx('readwrite', function (st) { st.put(s); }).catch(function () { mem[s.id] = clone(s); }); },
      get: function (id) { return tx('readonly', function (st) { return st.get(id); }).catch(function () { return mem[id]; }); },
      del: function (id) { return tx('readwrite', function (st) { st.delete(id); }).catch(function () { delete mem[id]; }); },
      all: function () {
        return tx('readonly', function (st) { return st.getAll(); })
          .catch(function () { return Object.keys(mem).map(function (k) { return mem[k]; }); });
      }
    };
  })();
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* ------------------------------------------------------------------ *
   * App
   * ------------------------------------------------------------------ */

  function App(root, cfg) {
    this.root = root;
    this.cfg = cfg;
    this.t = UI[cfg.uiLang] || UI.en;
    this.cache = {};        // key lang|handle → product data | {error}
    this.pending = {};
    this.state = this.defaultState();
    this.saveSoon = debounce(this.save.bind(this), 700);
    this.renderPreviewSoon = debounce(this.renderPreview.bind(this), 60);
    this.searchSoon = debounce(this.search.bind(this), 260);
    this.searchSeq = 0;
    this.build();
    var self = this;
    var last = lsGet(LAST_KEY);
    (last ? Store.get(last) : Promise.resolve(null)).then(function (s) {
      if (s) self.load(s); else self.refreshAll();
    }).catch(function () { self.refreshAll(); });
  }

  App.prototype.defaultState = function () {
    var c = this.cfg;
    var langs = (c.languages || []).map(function (l) { return l.iso; });
    return {
      v: 1, id: uid(), name: '', template: 'spotlight', count: 4,
      lang: langs.indexOf(c.currentLang) > -1 ? c.currentLang : (langs[0] || 'en'),
      accent: (c.brand && c.brand.accent) || '#111111', showName: true,
      headline: '', intro: '', validFrom: '', validTo: '',
      showDiscount: true, showArgs: true, logoBox: true, brandTone: 'auto',
      headerImage: null, headerPos: '50% 50%', logo: null,
      contact: { name: (c.user && c.user.name) || '', email: (c.user && c.user.email) || '', phone: (c.user && c.user.phone) || '' },
      note: '', labels: { rrp: '', promo: '' },
      products: [], updatedAt: Date.now()
    };
  };

  App.prototype.tpl = function () {
    var id = this.state.template;
    return TEMPLATES.filter(function (x) { return x.id === id; })[0] || TEMPLATES[0];
  };

  App.prototype.langRoot = function (lang) {
    var l = (this.cfg.languages || []).filter(function (x) { return x.iso === lang; })[0];
    var root = l ? l.root : '/';
    return root === '/' ? '' : String(root).replace(/\/$/, '');
  };

  /* ---------- editor shell ---------- */

  App.prototype.build = function () {
    var t = this.t, s = this.state, cfg = this.cfg, self = this;
    var langOpts = (cfg.languages || []).map(function (l) {
      return '<option value="' + esc(l.iso) + '">' + esc(l.name) + ' (' + esc(l.iso.toUpperCase()) + ')</option>';
    }).join('');
    var tplCards = TEMPLATES.map(function (x) {
      return '<button type="button" class="psb-tpl" data-tpl="' + x.id + '">' +
        '<span class="psb-tpl__thumb psb-tpl__thumb--' + x.id + '"><i></i><b></b><b></b><b></b><b></b></span>' +
        '<span class="psb-tpl__name">' + esc(x.name) + '</span>' +
        '<span class="psb-tpl__desc">' + esc(x.desc[cfg.uiLang] || x.desc.en) + '</span></button>';
    }).join('');

    this.root.innerHTML =
      '<div class="psb-toolbar">' +
        '<div class="psb-toolbar__left">' +
          '<button type="button" class="psb-btn" data-act="new">' + t.newSheet + '</button>' +
          '<button type="button" class="psb-btn" data-act="list">' + t.mySheets + '</button>' +
          '<button type="button" class="psb-btn" data-act="export">' + t.exportJson + '</button>' +
          '<label class="psb-btn">' + t.importJson + '<input type="file" class="psb-vh" accept="application/json,.json" data-act="import"></label>' +
          '<span class="psb-status" data-ref="status"></span>' +
        '</div>' +
        '<button type="button" class="psb-btn psb-btn--primary" data-act="pdf">' + t.pdf + '</button>' +
      '</div>' +
      (cfg.isB2B ? '' : '<p class="psb-alert">' + esc(t.notB2B) + '</p>') +
      '<div class="psb-layout">' +
        '<div class="psb-editor">' +
          // 1 template
          '<fieldset class="psb-fs"><legend>1 · ' + t.template + '</legend>' +
            '<div class="psb-tpls">' + tplCards + '</div>' +
            '<div class="psb-field"><span class="psb-label">' + t.products_n + '</span><div class="psb-seg" data-ref="counts"></div></div>' +
          '</fieldset>' +
          // 2 campaign
          '<fieldset class="psb-fs"><legend>2 · ' + t.campaign + '</legend>' +
            '<label class="psb-field"><span class="psb-label">' + t.campaignName + '</span>' +
              '<input type="text" maxlength="60" data-k="name"><small>' + t.campaignNameHint + '</small></label>' +
            '<label class="psb-check"><input type="checkbox" data-k="showName"> ' + t.showName + '</label>' +
            '<div class="psb-row">' +
              '<label class="psb-field"><span class="psb-label">' + t.language + '</span><select data-k="lang">' + langOpts + '</select></label>' +
              '<label class="psb-field psb-field--color"><span class="psb-label">' + t.accent + '</span><input type="color" data-k="accent"></label>' +
            '</div>' +
            '<div class="psb-row">' +
              '<label class="psb-field"><span class="psb-label">' + t.validFrom + '</span><input type="date" data-k="validFrom"></label>' +
              '<label class="psb-field"><span class="psb-label">' + t.validTo + '</span><input type="date" data-k="validTo"></label>' +
            '</div>' +
          '</fieldset>' +
          // 3 header
          '<fieldset class="psb-fs"><legend>3 · ' + t.header + '</legend>' +
            '<div class="psb-field"><span class="psb-label">' + t.headerImage + '</span>' +
              '<div class="psb-upload" data-ref="headerUp"></div>' +
              '<div class="psb-seg psb-seg--small" data-ref="pos">' +
                '<button type="button" data-pos="50% 15%">' + t.posTop + '</button>' +
                '<button type="button" data-pos="50% 50%">' + t.posCenter + '</button>' +
                '<button type="button" data-pos="50% 85%">' + t.posBottom + '</button>' +
              '</div></div>' +
            '<div class="psb-field"><span class="psb-label">' + t.logo + '</span><div class="psb-upload" data-ref="logoUp"></div>' +
              '<label class="psb-check"><input type="checkbox" data-k="logoBox"> ' + t.logoBox + '</label></div>' +
            '<label class="psb-field"><span class="psb-label">' + t.brandTone + '</span><select data-k="brandTone">' +
              '<option value="auto">' + t.toneAuto + '</option><option value="dark">' + t.toneDark + '</option><option value="light">' + t.toneLight + '</option></select></label>' +
            '<label class="psb-field"><span class="psb-label">' + t.headline + ' <em data-counter="headline"></em></span>' +
              '<input type="text" maxlength="70" data-k="headline"></label>' +
            '<label class="psb-field"><span class="psb-label">' + t.intro + ' <em data-counter="intro"></em></span>' +
              '<textarea rows="4" maxlength="420" data-k="intro"></textarea></label>' +
          '</fieldset>' +
          // 4 products
          '<fieldset class="psb-fs"><legend>4 · ' + t.productsSec + ' <em data-ref="slots"></em></legend>' +
            '<div class="psb-search"><input type="search" autocomplete="off" placeholder="' + esc(t.search) + '" data-ref="q">' +
              '<div class="psb-results" data-ref="results" hidden></div></div>' +
            '<ol class="psb-plist" data-ref="plist"></ol>' +
            '<label class="psb-check"><input type="checkbox" data-k="showDiscount"> ' + t.discount + '</label>' +
            '<label class="psb-check"><input type="checkbox" data-k="showArgs"> ' + t.showArgs + '</label>' +
          '</fieldset>' +
          // 5 footer
          '<fieldset class="psb-fs"><legend>5 · ' + t.footer + '</legend>' +
            '<label class="psb-field"><span class="psb-label">' + t.contactName + '</span><input type="text" maxlength="60" data-k="contact.name"></label>' +
            '<div class="psb-row">' +
              '<label class="psb-field"><span class="psb-label">' + t.email + '</span><input type="email" maxlength="80" data-k="contact.email"></label>' +
              '<label class="psb-field"><span class="psb-label">' + t.phone + '</span><input type="tel" maxlength="40" data-k="contact.phone"></label>' +
            '</div>' +
            '<label class="psb-field"><span class="psb-label">' + t.note + '</span><input type="text" maxlength="160" data-k="note"></label>' +
            '<details class="psb-details"><summary>' + t.labels + '</summary><div class="psb-row">' +
              '<label class="psb-field"><span class="psb-label">' + t.labelRrp + '</span><input type="text" maxlength="30" data-k="labels.rrp"></label>' +
              '<label class="psb-field"><span class="psb-label">' + t.labelPromo + '</span><input type="text" maxlength="30" data-k="labels.promo"></label>' +
            '</div></details>' +
          '</fieldset>' +
        '</div>' +
        '<div class="psb-previewcol">' +
          '<div class="psb-preview__head"><span>' + t.preview + '</span><span class="psb-warn" data-ref="warn"></span></div>' +
          '<div class="psb-preview" data-ref="preview"><div class="psb-preview__scaler" data-ref="scaler"></div></div>' +
          '<p class="psb-hint">' + esc(t.printHint) + '</p>' +
        '</div>' +
      '</div>' +
      '<dialog class="psb-dialog" data-ref="dialog"></dialog>';

    this.refs = {};
    Array.prototype.forEach.call(this.root.querySelectorAll('[data-ref]'), function (n) { self.refs[n.getAttribute('data-ref')] = n; });

    this.bind();
    var ro = window.ResizeObserver ? new ResizeObserver(function () { self.scalePreview(); }) : null;
    if (ro) ro.observe(this.refs.preview); else window.addEventListener('resize', function () { self.scalePreview(); });
  };

  App.prototype.bind = function () {
    var self = this, root = this.root;

    root.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-k');
      if (k) { self.setPath(k, e.target.type === 'checkbox' ? e.target.checked : e.target.value); self.afterFieldChange(k); return; }
      if (e.target === self.refs.q) {
        // invalidate stale results immediately so Enter / click never adds an old hit
        self.searchSeq++;
        self.refs.results.innerHTML = self.refs.q.value.trim().length >= 2 ? '<p class="psb-results__msg">' + self.t.searching + '</p>' : '';
        self.refs.results.hidden = !self.refs.results.innerHTML;
        self.searchSoon();
      }
      var promoIdx = e.target.getAttribute('data-promo');
      if (promoIdx != null) {
        self.state.products[+promoIdx].promo = e.target.value;
        self.updateProductMeta(+promoIdx);
        self.changed();
      }
    });
    root.addEventListener('change', function (e) {
      var k = e.target.getAttribute('data-k');
      if (k === 'lang') { self.setPath(k, e.target.value); self.refreshAll(); self.changed(); return; }
      var vIdx = e.target.getAttribute('data-variant');
      if (vIdx != null) {
        var p = self.state.products[+vIdx];
        p.variantId = +e.target.value;
        var d = self.data(p.handle);
        var v = d && d.variants && d.variants.filter(function (x) { return x.id === p.variantId; })[0];
        if (v) p.sku = v.sku;
        p.img = 0;
        self.renderProducts(); self.changed();
      }
      if (e.target.getAttribute('data-act') === 'import') self.importFile(e.target.files[0], e.target);
      var up = e.target.getAttribute('data-upload');
      if (up) { self.handleUpload(up, e.target.files && e.target.files[0]); e.target.value = ''; }
    });
    // drag & drop images onto the upload boxes
    root.addEventListener('dragover', function (e) {
      var z = e.target.closest && e.target.closest('[data-drop]');
      if (z) { e.preventDefault(); z.classList.add('is-over'); }
    });
    root.addEventListener('dragleave', function (e) {
      var z = e.target.closest && e.target.closest('[data-drop]');
      if (z) z.classList.remove('is-over');
    });
    root.addEventListener('drop', function (e) {
      var z = e.target.closest && e.target.closest('[data-drop]');
      if (!z) return;
      e.preventDefault(); z.classList.remove('is-over');
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      self.handleUpload(z.getAttribute('data-drop'), f);
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button, [data-act]');
      if (!b || !root.contains(b)) {
        if (!e.target.closest('.psb-search')) self.hideResults();
        return;
      }
      if (b.hasAttribute('data-tpl')) { self.setTemplate(b.getAttribute('data-tpl')); return; }
      if (b.hasAttribute('data-count')) { self.state.count = +b.getAttribute('data-count'); self.syncForm(); self.renderProducts(); self.changed(); return; }
      if (b.hasAttribute('data-pos')) { self.state.headerPos = b.getAttribute('data-pos'); self.syncForm(); self.changed(); return; }
      if (b.hasAttribute('data-add')) { self.addProduct(b.getAttribute('data-add'), b.getAttribute('data-sku')); return; }
      var pa = b.getAttribute('data-pact');
      if (pa) { self.productAction(pa, +b.getAttribute('data-i')); return; }
      var act = b.getAttribute('data-act');
      if (act === 'new') { if (window.confirm(self.t.confirmNew)) self.newSheet(); }
      else if (act === 'list') self.openList();
      else if (act === 'export') self.exportJson();
      else if (act === 'pdf') self.print();
      else if (act === 'rm-header') { self.state.headerImage = null; self.renderUploads(); self.changed(); }
      else if (act === 'rm-logo') { self.state.logo = null; self.renderUploads(); self.changed(); }
    });
    this.refs.q.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var first = self.refs.results.querySelector('[data-add]');
        if (first) first.click();
      } else if (e.key === 'Escape') self.hideResults();
    });
    this.refs.q.addEventListener('focus', function () { if (self.refs.results.innerHTML) self.refs.results.hidden = false; });
  };

  App.prototype.setPath = function (path, val) {
    var parts = path.split('.'), o = this.state;
    for (var i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = val;
  };
  App.prototype.getPath = function (path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, this.state);
  };

  App.prototype.afterFieldChange = function (k) {
    if (k === 'headline' || k === 'intro') this.updateCounters();
    this.changed();
  };

  App.prototype.changed = function () {
    this.state.updatedAt = Date.now();
    this.setStatus(this.t.saving);
    this.saveSoon();
    this.renderPreviewSoon();
  };

  App.prototype.setStatus = function (txt) { if (this.refs.status) this.refs.status.textContent = txt; };

  App.prototype.save = function () {
    var self = this;
    var snapshot = clone(this.state);
    return Store.put(snapshot).then(function () {
      lsSet(LAST_KEY, snapshot.id);
      self.setStatus('✓ ' + self.t.saved);
    });
  };

  App.prototype.setTemplate = function (id) {
    var s = this.state;
    s.template = id;
    var counts = this.tpl().counts;
    if (counts.indexOf(s.count) < 0) {
      // nearest allowed count
      s.count = counts.reduce(function (a, b) { return Math.abs(b - s.count) < Math.abs(a - s.count) ? b : a; });
    }
    this.syncForm(); this.renderProducts(); this.changed();
  };

  App.prototype.syncForm = function () {
    var s = this.state, self = this, root = this.root;
    Array.prototype.forEach.call(root.querySelectorAll('[data-k]'), function (inp) {
      var v = self.getPath(inp.getAttribute('data-k'));
      if (inp.type === 'checkbox') inp.checked = !!v;
      else if (inp.value !== (v == null ? '' : String(v))) inp.value = v == null ? '' : v;
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-tpl]'), function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tpl') === s.template);
    });
    this.refs.counts.innerHTML = this.tpl().counts.map(function (n) {
      var lbl = (self.tpl().countLabel && self.tpl().countLabel[n]) || n;
      return '<button type="button" data-count="' + n + '" class="' + (n === s.count ? 'is-active' : '') + '">' + lbl + '</button>';
    }).join('');
    Array.prototype.forEach.call(this.refs.pos.querySelectorAll('[data-pos]'), function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-pos') === s.headerPos);
    });
    this.renderUploads();
    this.updateCounters();
  };

  App.prototype.updateCounters = function () {
    var s = this.state;
    var h = this.root.querySelector('[data-counter="headline"]');
    var i = this.root.querySelector('[data-counter="intro"]');
    if (h && h.tagName === 'EM') h.textContent = s.headline.length + '/70';
    if (i && i.tagName === 'EM') i.textContent = s.intro.length + '/420';
  };

  App.prototype.renderUploads = function () {
    var t = this.t, s = this.state;
    // A real <input type=file> inside a <label> works in every browser (incl. Safari), unlike a detached input.
    function box(key, src, upAct, rmAct) {
      return (src ? '<img src="' + esc(safeUrl(src)) + '" alt="">' : '<span class="psb-upload__empty"></span>') +
        '<label class="psb-btn psb-btn--small">' + t.upload +
          '<input type="file" class="psb-vh" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/*" data-upload="' + key + '"></label>' +
        (src ? '<button type="button" class="psb-btn psb-btn--small psb-btn--ghost" data-act="' + rmAct + '">' + t.remove + '</button>' : '') +
        '<small class="psb-upload__hint">' + esc(t.dropHint) + '</small>';
    }
    this.refs.headerUp.setAttribute('data-drop', 'headerImage');
    this.refs.logoUp.setAttribute('data-drop', 'logo');
    this.refs.headerUp.innerHTML = box('headerImage', s.headerImage, 'up-header', 'rm-header');
    this.refs.logoUp.innerHTML = box('logo', s.logo, 'up-logo', 'rm-logo');
  };

  App.prototype.handleUpload = function (key, file) {
    var self = this;
    if (!file) return;
    if (!/^image\//i.test(file.type || '') && !/\.(jpe?g|png|webp|svg)$/i.test(file.name || '')) { window.alert(self.t.imageTooBig); return; }
    var isLogo = key === 'logo';
    var box = isLogo ? this.refs.logoUp : this.refs.headerUp;
    box.classList.add('is-busy');
    var info = {};
    processImage(file, isLogo ? 1200 : 2480, isLogo, info).then(function (url) {
      self.state[key] = url;
      // transparent PNG/SVG → white box with frame (like "Designed for Microsoft"); full JPG → shown as is
      if (isLogo) { self.state.logoBox = !!info.alpha; self.syncForm(); }
      self.renderUploads(); self.changed();
    }).catch(function () {
      window.alert(self.t.imageTooBig);
    }).then(function () { box.classList.remove('is-busy'); });
  };

  /* ---------- product data ---------- */

  App.prototype.data = function (handle, lang) {
    return this.cache[(lang || this.state.lang) + '|' + handle];
  };

  App.prototype.loadProduct = function (handle, lang) {
    lang = lang || this.state.lang;
    var key = lang + '|' + handle, self = this;
    if (this.cache[key]) return Promise.resolve(this.cache[key]);
    if (this.pending[key]) return this.pending[key];
    var url = this.langRoot(lang) + '/products/' + encodeURIComponent(handle) + '?view=promo-data';
    this.pending[key] = fetchJson(url).then(function (d) {
      self.cache[key] = d; delete self.pending[key]; return d;
    }).catch(function (err) {
      var d = { error: true, status: err.status || 0 };
      self.cache[key] = d; delete self.pending[key]; return d;
    });
    return this.pending[key];
  };

  App.prototype.refreshAll = function () {
    var self = this, lang = this.state.lang;
    this.syncForm();
    this.renderProducts();
    this.renderPreview();
    var jobs = this.state.products.map(function (p) { return self.loadProduct(p.handle, lang); });
    Promise.all(jobs).then(function () { self.renderProducts(); self.renderPreview(); });
  };

  App.prototype.currency = function () {
    var self = this;
    var withCur = this.state.products.map(function (p) { return self.data(p.handle); })
      .filter(function (d) { return d && d.currency; })[0];
    return (withCur && withCur.currency) || this.cfg.currency || 'EUR';
  };

  App.prototype.variantOf = function (p, d) {
    if (!d || !d.variants || !d.variants.length) return null;
    return d.variants.filter(function (v) { return v.id === p.variantId; })[0] ||
      d.variants.filter(function (v) { return p.sku && v.sku === p.sku; })[0] || d.variants[0];
  };

  App.prototype.imagesOf = function (p, d) {
    if (!d || d.error) return [];
    var v = this.variantOf(p, d);
    var list = [];
    function add(u) { if (u && list.indexOf(u) < 0) list.push(u); }
    if (v && v.image) add(v.image);
    (d.images || []).forEach(add);
    (d.lifestyle || []).forEach(add);
    return list;
  };

  App.prototype.rrpOf = function (p, d) {
    var v = this.variantOf(p, d);
    return v && typeof v.price === 'number' ? v.price / 100 : NaN;
  };

  /* ---------- search ---------- */

  App.prototype.search = function () {
    var q = this.refs.q.value.trim(), self = this, t = this.t;
    var box = this.refs.results;
    if (q.length < 2) { this.hideResults(); return; }
    var seq = ++this.searchSeq;
    box.hidden = false;
    box.innerHTML = '<p class="psb-results__msg">' + t.searching + '</p>';
    var url = this.langRoot(this.state.lang) + '/search?type=product&view=promo-search' +
      '&options%5Bprefix%5D=last&options%5Bunavailable_products%5D=last' +
      '&options%5Bfields%5D=title,variants.sku,product_type,vendor,tag' +
      '&q=' + encodeURIComponent(q);
    fetchJson(url).then(function (res) {
      if (seq !== self.searchSeq) return;
      var list = (res && res.results) || [];
      var ql = q.toLowerCase();
      // exact / prefix SKU hits first
      list.forEach(function (r) {
        r._sku = (r.skus || []).filter(function (s) { return s && s.toLowerCase().indexOf(ql) === 0; })[0] || '';
        r._rank = r._sku ? (r._sku.toLowerCase() === ql ? 0 : 1) : 2;
      });
      list.sort(function (a, b) { return a._rank - b._rank; });
      if (!list.length) { box.innerHTML = '<p class="psb-results__msg">' + t.noResults + '</p>'; return; }
      var taken = self.state.products.map(function (p) { return p.handle + '|' + p.sku; });
      box.innerHTML = list.slice(0, 15).map(function (r) {
        var skuLabel = r._sku || (r.skus || []).filter(Boolean).slice(0, 3).join(', ');
        var used = taken.indexOf(r.handle + '|' + (r._sku || (r.skus || [])[0])) > -1;
        return '<button type="button" class="psb-result' + (used ? ' is-used' : '') + '" data-add="' + esc(r.handle) + '" data-sku="' + esc(r._sku) + '">' +
          (r.image ? '<img src="' + esc(safeUrl(r.image)) + '" alt="" loading="lazy">' : '<span class="psb-result__noimg"></span>') +
          '<span class="psb-result__txt"><strong>' + esc(r.title) + '</strong><small>' + esc(skuLabel) + '</small></span>' +
          '<span class="psb-result__add">+</span></button>';
      }).join('');
    }).catch(function () {
      if (seq !== self.searchSeq) return;
      box.innerHTML = '<p class="psb-results__msg">' + t.noResults + '</p>';
    });
  };

  App.prototype.hideResults = function () { if (this.refs.results) this.refs.results.hidden = true; };

  App.prototype.addProduct = function (handle, sku) {
    var self = this;
    var item = { handle: handle, variantId: null, sku: sku || '', title: '', promo: '', img: 0 };
    this.state.products.push(item);
    this.refs.q.value = '';
    this.searchSeq++;
    this.refs.results.innerHTML = '';
    this.hideResults();
    this.renderProducts();
    this.loadProduct(handle).then(function (d) {
      if (d && !d.error) {
        var v = self.variantOf(item, d);
        if (v) { item.variantId = v.id; item.sku = v.sku; }
        item.title = d.title;
      }
      self.renderProducts(); self.changed();
    });
    this.refs.q.focus();
  };

  App.prototype.productAction = function (act, i) {
    var arr = this.state.products;
    if (act === 'del') arr.splice(i, 1);
    else if (act === 'up' && i > 0) arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
    else if (act === 'down' && i < arr.length - 1) arr.splice(i + 1, 0, arr.splice(i, 1)[0]);
    else if (act === 'img') {
      var p = arr[i], imgs = this.imagesOf(p, this.data(p.handle));
      p.img = imgs.length ? (p.img + 1) % imgs.length : 0;
    }
    this.renderProducts(); this.changed();
  };

  App.prototype.renderProducts = function () {
    var self = this, s = this.state, t = this.t, cur = this.currency();
    var filled = Math.min(s.products.length, s.count);
    this.refs.slots.textContent = fill(t.slots, { n: filled, max: s.count });
    this.refs.plist.innerHTML = s.products.map(function (p, i) {
      var d = self.data(p.handle);
      var loading = !d;
      var err = d && d.error;
      var v = self.variantOf(p, d);
      var imgs = self.imagesOf(p, d);
      var img = imgs.length ? imgs[(p.img || 0) % imgs.length] : '';
      var rrp = self.rrpOf(p, d);
      var off = i >= s.count;
      var variantSel = (d && d.variants && d.variants.length > 1)
        ? '<select data-variant="' + i + '" title="' + esc(t.variant) + '">' + d.variants.map(function (x) {
            return '<option value="' + x.id + '"' + (v && v.id === x.id ? ' selected' : '') + '>' + esc(x.sku || x.title) + ' · ' + esc(x.title) + '</option>';
          }).join('') + '</select>'
        : '<span class="psb-p__sku">' + esc((v && v.sku) || p.sku) + '</span>';
      return '<li class="psb-p' + (off ? ' is-off' : '') + (err ? ' is-error' : '') + '">' +
        '<span class="psb-p__no">' + (i + 1) + '</span>' +
        '<span class="psb-p__img">' + (img ? '<img src="' + esc(safeUrl(img)) + '" alt="">' : '') + '</span>' +
        '<div class="psb-p__main">' +
          '<strong>' + esc((d && d.title) || p.title || p.handle) + '</strong>' +
          (loading ? '<small>…</small>' : err ? '<small class="psb-err">' + esc(err && d.status === 404 ? t.missingLang : t.loadError) + '</small>' : variantSel) +
          (off ? '<small class="psb-muted">' + esc(t.notOnSheet) + '</small>' : '') +
        '</div>' +
        '<div class="psb-p__price">' +
          '<small>' + esc(t.rrp) + ' <s>' + esc(fmtMoney(rrp, cur, s.lang)) + '</s></small>' +
          '<label><span>' + esc(t.promo) + '</span><input type="text" inputmode="decimal" data-promo="' + i + '" value="' + esc(p.promo) + '" placeholder="0,00"></label>' +
          '<small class="psb-p__meta" data-meta="' + i + '"></small>' +
        '</div>' +
        '<div class="psb-p__acts">' +
          (imgs.length > 1 ? '<button type="button" data-pact="img" data-i="' + i + '" title="' + esc(t.changeImage) + '">⟳</button>' : '') +
          '<button type="button" data-pact="up" data-i="' + i + '" title="' + esc(t.up) + '"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button type="button" data-pact="down" data-i="' + i + '" title="' + esc(t.down) + '"' + (i === s.products.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button type="button" data-pact="del" data-i="' + i + '" title="' + esc(t.del) + '">✕</button>' +
        '</div></li>';
    }).join('');
    s.products.forEach(function (p, i) { self.updateProductMeta(i); });
  };

  App.prototype.updateProductMeta = function (i) {
    var p = this.state.products[i], el = this.root.querySelector('[data-meta="' + i + '"]');
    if (!p || !el) return;
    var rrp = this.rrpOf(p, this.data(p.handle)), promo = parseAmount(p.promo);
    if (!isFinite(promo) || !isFinite(rrp)) { el.textContent = ''; el.className = 'psb-p__meta'; return; }
    if (promo >= rrp) { el.textContent = this.t.priceWarn; el.className = 'psb-p__meta psb-err'; return; }
    el.textContent = '−' + Math.round((1 - promo / rrp) * 100) + ' %';
    el.className = 'psb-p__meta psb-ok';
  };

  /* ---------- sheet rendering ---------- */

  App.prototype.sheetHtml = function () {
    var s = this.state, self = this, cfg = this.cfg, brand = cfg.brand || {};
    var L = SHEET_TXT[s.lang] || SHEET_TXT.en;
    var cur = this.currency();
    var lblRrp = s.labels.rrp || L.rrp, lblPromo = s.labels.promo || L.promo;
    var header = s.headerImage || cfg.defaultHeader;
    var accent = /^#[0-9a-f]{6}$/i.test(s.accent) ? s.accent : '#111111';
    var ink = /^#[0-9a-f]{6}$/i.test(brand.ink || '') ? brand.ink : '#111418';
    var onAccent = readableOn(accent);
    var tone = s.brandTone === 'dark' || s.brandTone === 'light' ? s.brandTone : (this.tpl().tone || 'dark');

    var validity = '';
    if (s.validFrom && s.validTo) validity = fill(L.range, { a: fmtDate(s.validFrom, s.lang), b: fmtDate(s.validTo, s.lang) });
    else if (s.validTo) validity = fill(L.to, { b: fmtDate(s.validTo, s.lang) });
    else if (s.validFrom) validity = fill(L.from, { a: fmtDate(s.validFrom, s.lang) });

    var tplDef = this.tpl();
    var hasFeat = !!(tplDef.featured && tplDef.featured.indexOf(s.count) > -1);
    var cards = [];
    for (var i = 0; i < s.count; i++) {
      var feat = hasFeat && i === 0;
      var p = s.products[i];
      if (!p) { cards.push('<article class="psb-card psb-card--empty' + (feat ? ' psb-card--feat' : '') + '"><span>+</span></article>'); continue; }
      var d = this.data(p.handle);
      var ok = d && !d.error;
      var v = this.variantOf(p, d);
      var imgs = this.imagesOf(p, d);
      var img = imgs.length ? imgs[(p.img || 0) % imgs.length] : '';
      var rrp = this.rrpOf(p, d), promo = parseAmount(p.promo);
      var hasPromo = isFinite(promo);
      var pct = (hasPromo && isFinite(rrp) && rrp > promo) ? Math.round((1 - promo / rrp) * 100) : 0;
      var args = (ok && d.arguments) ? d.arguments.filter(Boolean).slice(0, feat ? 5 : 3) : [];
      cards.push(
        '<article class="psb-card' + (feat ? ' psb-card--feat' : '') + '">' +
          '<div class="psb-card__media">' + (img ? '<img src="' + esc(safeUrl(img)) + '" alt="">' : '') +
            (s.showDiscount && pct > 0 ? '<span class="psb-badge">−' + pct + '%</span>' : '') + '</div>' +
          '<div class="psb-card__body">' +
            '<p class="psb-card__sku">' + esc(L.sku) + ' ' + esc((v && v.sku) || p.sku) + '</p>' +
            '<h3 class="psb-card__title">' + esc((ok && d.title) || p.title || p.handle) + '</h3>' +
            (ok && d.tagline ? '<p class="psb-card__tagline">' + esc(d.tagline) + '</p>' : '') +
            (s.showArgs && args.length ? '<ul class="psb-card__args">' + args.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' : '') +
          '</div>' +
          '<div class="psb-card__price">' +
            (isFinite(rrp) ? '<span class="psb-price__rrp"><span class="psb-price__lbl">' + esc(lblRrp) + '</span> <s>' + esc(fmtMoney(rrp, cur, s.lang)) + '</s></span>' : '') +
            '<span class="psb-price__promo"><span class="psb-price__lbl">' + esc(lblPromo) + '</span> <b>' + (hasPromo ? esc(fmtMoney(promo, cur, s.lang)) : '–') + '</b></span>' +
          '</div>' +
        '</article>');
    }

    var brandLogo = ''; // DICOTA logo sits top right on every template
    var contactLine = [s.contact.email, s.contact.phone].filter(Boolean).map(esc).join(' · ');
    var noteTxt = fill(L.note, { c: cur }) + (s.note ? ' ' + s.note : '');

    return '' +
      '<div class="psb-sheet psb-t-' + s.template + ' psb-n-' + s.count + (hasFeat ? ' psb-has-feat' : '') + (s.logo ? ' psb-has-logo' : '') + (header ? '' : ' psb-noimg') + '"' +
        ' dir="' + (s.lang === 'ar' ? 'rtl' : 'ltr') + '" lang="' + esc(s.lang) + '"' +
        ' style="--psb-accent:' + accent + ';--psb-on-accent:' + onAccent + ';--psb-ink:' + ink + ';' +
        (brand.font ? '--psb-font:' + esc(brand.font).replace(/;/g, '') + ';' : '') + '">' +
        '<header class="psb-hero">' +
          '<div class="psb-hero__media">' + (header ? '<img src="' + esc(safeUrl(header)) + '" alt="" style="object-position:' + esc(s.headerPos) + '">' : '') + '</div>' +
          '<div class="psb-hero__text">' +
            (s.showName && s.name ? '<p class="psb-kicker">' + esc(s.name) + '</p>' : '') +
            '<h1 class="psb-headline">' + esc(s.headline || '') + '</h1>' +
          '</div>' +
        '</header>' +
        // fixed logo slots, identical on every template: campaign logo top left, DICOTA logo top right
        (s.logo ? '<div class="psb-camplogo ' + (s.logoBox ? 'is-boxed' : 'is-plain') + '"><img src="' + esc(safeUrl(s.logo)) + '" alt=""></div>' : '') +
        '<div class="psb-brandlogo psb-brandlogo--' + tone + '">' +
          (brand.logo ? '<img src="' + esc(safeUrl(brand.logo)) + '" alt="DICOTA">' : '<span class="psb-brandlogo__word">DICOTA</span>') + '</div>' +
        ((s.intro || validity) ? '<section class="psb-intro">' +
          (s.intro ? '<p class="psb-intro__text">' + esc(s.intro) + '</p>' : '') +
          (validity ? '<p class="psb-validity">' + esc(validity) + '</p>' : '') +
        '</section>' : '') +
        '<section class="psb-products">' +
          '<div class="psb-listhead"><span></span><span>' + esc(L.product) + '</span><span>' + esc(lblRrp) + '</span><span>' + esc(lblPromo) + '</span></div>' +
          cards.join('') +
        '</section>' +
        '<footer class="psb-foot">' +
          '<div class="psb-foot__brand">' + brandLogo + (brand.claim ? '<span class="psb-foot__claim">' + esc(brand.claim) + '</span>' : '') + '</div>' +
          '<p class="psb-foot__note">' + esc(noteTxt) + '</p>' +
          '<div class="psb-foot__contact">' +
            (s.contact.name || contactLine ? '<span class="psb-foot__lbl">' + esc(L.contact) + '</span>' +
              (s.contact.name ? '<strong>' + esc(s.contact.name) + '</strong>' : '') +
              (contactLine ? '<span>' + contactLine + '</span>' : '') : '') +
            (brand.website ? '<span class="psb-foot__web">' + esc(brand.website) + '</span>' : '') +
          '</div>' +
          (brand.website ? '<span class="psb-foot__site">' + esc(brand.website) + '</span>' : '') +
        '</footer>' +
      '</div>';
  };

  // Shrinks text until it fits its box; returns false if minimum reached and still overflowing.
  function fitText(el, minPx) {
    if (!el) return true;
    el.style.fontSize = '';
    var fs = parseFloat(window.getComputedStyle(el).fontSize);
    var guard = 60;
    // tolerance: display fonts (Futura) draw glyphs beyond a tight line box
    var tol = function () { return Math.max(2, fs * 0.3); };
    while (guard-- > 0 && (el.scrollHeight > el.clientHeight + tol()) && fs > minPx) {
      fs -= 0.5; el.style.fontSize = fs + 'px';
    }
    return el.scrollHeight <= el.clientHeight + tol();
  }

  // Applies density levels until product cards fit.
  function fitSheet(sheet) {
    var okText = fitText(sheet.querySelector('.psb-headline'), 16);
    okText = fitText(sheet.querySelector('.psb-intro__text'), 8.5) && okText;
    var levels = ['', 'psb-dense-1', 'psb-dense-2', 'psb-dense-3'];
    for (var l = 0; l < levels.length; l++) {
      sheet.classList.remove('psb-dense-1', 'psb-dense-2', 'psb-dense-3');
      if (levels[l]) sheet.classList.add(levels[l]);
      var over = Array.prototype.some.call(sheet.querySelectorAll('.psb-card:not(.psb-card--empty) .psb-card__body'), function (b) {
        return b.scrollHeight > b.clientHeight + 1;
      });
      if (!over) break;
    }
    return okText;
  }

  App.prototype.renderPreview = function () {
    var sc = this.refs.scaler;
    sc.innerHTML = this.sheetHtml();
    var sheet = sc.firstChild, self = this;
    var run = function () {
      var ok = fitSheet(sheet);
      self.refs.warn.textContent = ok ? '' : '⚠ ' + self.t.overflow;
    };
    run();
    // re-fit once images/fonts settle
    Array.prototype.forEach.call(sheet.querySelectorAll('img'), function (im) { if (!im.complete) im.addEventListener('load', run, { once: true }); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    this.scalePreview();
  };

  App.prototype.scalePreview = function () {
    var pv = this.refs.preview, sc = this.refs.scaler, sheet = sc && sc.firstChild;
    if (!sheet) return;
    var w = sheet.offsetWidth, h = sheet.offsetHeight;
    var avail = pv.clientWidth;
    var scale = Math.min(1.3, avail / w);
    sc.style.transform = 'scale(' + scale + ')';
    sc.style.width = w + 'px';
    pv.style.height = Math.ceil(h * scale) + 'px';
  };

  /* ---------- print / PDF ---------- */

  App.prototype.print = function () {
    var s = this.state, t = this.t, self = this;
    var empty = Math.max(0, s.count - s.products.length);
    if (empty && !window.confirm(fill(t.emptySlots, { n: empty }))) return;

    var root = document.getElementById('psb-print-root');
    if (!root) { root = document.createElement('div'); root.id = 'psb-print-root'; document.body.appendChild(root); }
    root.innerHTML = this.sheetHtml();
    var sheet = root.firstChild;
    document.documentElement.classList.add('psb-printing');

    var imgs = Array.prototype.slice.call(sheet.querySelectorAll('img'));
    var ready = Promise.all(imgs.map(function (im) {
      if (im.complete) return Promise.resolve();
      return new Promise(function (r) { im.onload = im.onerror = r; });
    }));
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var oldTitle = document.title;
    var fileName = ['DICOTA', 'Promo', (s.name || t.untitled).replace(/[^\w\-äöüÄÖÜß ]+/g, '').trim().replace(/\s+/g, '-'), s.lang.toUpperCase()].join('_');

    Promise.all([ready, fonts]).then(function () {
      fitSheet(sheet);
      document.title = fileName;
      var cleanup = function () {
        document.title = oldTitle;
        document.documentElement.classList.remove('psb-printing');
        root.innerHTML = '';
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
      setTimeout(function () { window.print(); }, 50);
    });
    this.save();
  };

  /* ---------- drafts ---------- */

  App.prototype.load = function (data) {
    var base = this.defaultState();
    var s = Object.assign(base, data || {});
    s.contact = Object.assign(base.contact, (data && data.contact) || {});
    s.labels = Object.assign({ rrp: '', promo: '' }, (data && data.labels) || {});
    s.products = Array.isArray(s.products) ? s.products.filter(function (p) { return p && typeof p.handle === 'string'; }).map(function (p) {
      return { handle: p.handle, variantId: p.variantId || null, sku: p.sku || '', title: p.title || '', promo: p.promo != null ? String(p.promo) : '', img: +p.img || 0 };
    }) : [];
    if (!TEMPLATES.some(function (x) { return x.id === s.template; })) s.template = 'spotlight';
    var langs = (this.cfg.languages || []).map(function (l) { return l.iso; });
    if (langs.length && langs.indexOf(s.lang) < 0) s.lang = langs.indexOf(this.cfg.currentLang) > -1 ? this.cfg.currentLang : langs[0];
    s.headerImage = safeUrl(s.headerImage) || null;
    s.logo = safeUrl(s.logo) || null;
    if (['auto', 'dark', 'light'].indexOf(s.brandTone) < 0) s.brandTone = 'auto';
    this.state = s;
    var counts = this.tpl().counts;
    if (counts.indexOf(s.count) < 0) s.count = counts[0];
    lsSet(LAST_KEY, s.id);
    this.setStatus('');
    this.refreshAll();
  };

  App.prototype.newSheet = function () {
    this.state = this.defaultState();
    this.refreshAll();
    this.save();
  };

  App.prototype.openList = function () {
    var dlg = this.refs.dialog, t = this.t, self = this, cur = this.state.id;
    Store.all().then(function (list) {
      list = (list || []).sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
      dlg.innerHTML = '<div class="psb-dialog__head"><h2>' + t.mySheets + '</h2><button type="button" class="psb-btn psb-btn--ghost" data-dlg="close">' + t.close + '</button></div>' +
        (list.length ? '<ul class="psb-sheets">' + list.map(function (x) {
          var tp = TEMPLATES.filter(function (y) { return y.id === x.template; })[0];
          return '<li' + (x.id === cur ? ' class="is-current"' : '') + '><div><strong>' + esc(x.name || t.untitled) + '</strong>' +
            '<small>' + esc(tp ? tp.name : '') + ' · ' + (x.count || '') + ' · ' + esc((x.lang || '').toUpperCase()) + ' · ' +
            esc(new Date(x.updatedAt || 0).toLocaleString(self.cfg.uiLang)) + '</small></div>' +
            '<span><button type="button" class="psb-btn psb-btn--small" data-dlg="open" data-id="' + esc(x.id) + '">' + t.open + '</button>' +
            '<button type="button" class="psb-btn psb-btn--small psb-btn--ghost" data-dlg="dup" data-id="' + esc(x.id) + '">' + t.duplicate + '</button>' +
            '<button type="button" class="psb-btn psb-btn--small psb-btn--ghost" data-dlg="del" data-id="' + esc(x.id) + '" data-name="' + esc(x.name || t.untitled) + '">' + t.delete + '</button></span></li>';
        }).join('') + '</ul>' : '<p>' + t.noSheets + '</p>');
      dlg.onclick = function (e) {
        var b = e.target.closest('[data-dlg]');
        if (!b) { if (e.target === dlg) dlg.close(); return; }
        var a = b.getAttribute('data-dlg'), id = b.getAttribute('data-id');
        if (a === 'close') dlg.close();
        else if (a === 'open') Store.get(id).then(function (s) { if (s) self.load(s); dlg.close(); });
        else if (a === 'dup') Store.get(id).then(function (s) {
          if (!s) return;
          var c = clone(s); c.id = uid(); c.name = (c.name || t.untitled) + ' (' + t.copy + ')'; c.updatedAt = Date.now();
          Store.put(c).then(function () { self.load(c); dlg.close(); });
        });
        else if (a === 'del') {
          if (!window.confirm(fill(t.confirmDelete, { n: b.getAttribute('data-name') }))) return;
          Store.del(id).then(function () {
            if (id === cur) self.newSheet();
            dlg.close(); self.openList();
          });
        }
      };
      if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    });
  };

  App.prototype.exportJson = function () {
    var s = clone(this.state);
    var blob = new Blob([JSON.stringify({ type: 'dicota-promo-sheet', version: 1, sheet: s }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'DICOTA_Promo_' + (s.name || 'sheet').replace(/[^\w\-]+/g, '-') + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  App.prototype.importFile = function (file, input) {
    var self = this;
    if (!file) return;
    file.text().then(function (txt) {
      var obj = JSON.parse(txt);
      var sheet = obj && obj.type === 'dicota-promo-sheet' ? obj.sheet : null;
      if (!sheet || typeof sheet !== 'object') throw new Error('format');
      sheet.id = uid(); sheet.updatedAt = Date.now();
      self.load(sheet); self.save();
    }).catch(function () { window.alert(self.t.importError); })
      .then(function () { input.value = ''; });
  };

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('script[id^="psb-config-"]'), function (cfgEl) {
      if (cfgEl.__psb) return;
      cfgEl.__psb = true;
      var cfg;
      try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
      var root = document.getElementById('psb-app-' + cfg.sectionId);
      if (root) root.__psbApp = new App(root, cfg);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', boot);
})();
