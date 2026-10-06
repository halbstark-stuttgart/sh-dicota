/*!
 * DICOTA · myDICOTA Banner Builder
 * Reseller tool: pick a theme (Shopify metaobject "dicota_banner_theme"), a format and size,
 * headline / claim / button, then download JPG, PNG, layered PSD or a ZIP with several sizes,
 * or share it by e-mail. Everything is rendered client-side on <canvas>.
 */
(function () {
  'use strict';

  var LIBS = {
    psd: 'https://cdn.jsdelivr.net/npm/ag-psd@31.0.2/dist/bundle.js',
    zip: 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
  };

  // Standard sizes, grouped by orientation
  var SIZES = [
    // horizontal
    { o: 'h', w: 1920, h: 600, n: 'Website Hero' },
    { o: 'h', w: 1920, h: 400, n: 'Website Hero schmal / slim' },
    { o: 'h', w: 1440, h: 500, n: 'Shop-Kategorie / category' },
    { o: 'h', w: 1200, h: 627, n: 'LinkedIn Post' },
    { o: 'h', w: 1200, h: 630, n: 'Facebook Post' },
    { o: 'h', w: 1584, h: 396, n: 'LinkedIn Banner' },
    { o: 'h', w: 1500, h: 500, n: 'X / Twitter Header' },
    { o: 'h', w: 970, h: 250, n: 'Billboard' },
    { o: 'h', w: 728, h: 90, n: 'Leaderboard' },
    { o: 'h', w: 320, h: 100, n: 'Mobile Banner' },
    { o: 'h', w: 600, h: 200, n: 'E-Mail Header' },
    { o: 'h', w: 1200, h: 400, n: 'E-Mail Header @2x' },
    { o: 'h', w: 600, h: 300, n: 'Newsletter Teaser' },
    // vertical
    { o: 'v', w: 1080, h: 1920, n: 'Instagram Story / Reel' },
    { o: 'v', w: 1080, h: 1350, n: 'Instagram Portrait' },
    { o: 'v', w: 1000, h: 1500, n: 'Pinterest' },
    { o: 'v', w: 300, h: 600, n: 'Half Page Ad' },
    { o: 'v', w: 160, h: 600, n: 'Wide Skyscraper' },
    { o: 'v', w: 120, h: 600, n: 'Skyscraper' },
    // square / rectangle
    { o: 'r', w: 1080, h: 1080, n: 'Instagram / Social Post' },
    { o: 'r', w: 1200, h: 1200, n: 'Quadrat / square' },
    { o: 'r', w: 300, h: 250, n: 'Medium Rectangle' },
    { o: 'r', w: 336, h: 280, n: 'Large Rectangle' },
    { o: 'r', w: 250, h: 250, n: 'Square Ad' },
    { o: 'r', w: 800, h: 600, n: 'Teaser 4:3' }
  ];

  var UI = {
    de: {
      theme: 'Thema', format: 'Format & Größe', ori: { h: 'Horizontal', v: 'Vertikal', r: 'Quadrat / Rechteck' },
      custom: 'Eigene Größe', width: 'Breite (px)', height: 'Höhe (px)', image: 'Bild', ownImage: 'Eigenes Bild',
      focusHint: 'Klick ins Vorschaubild setzt den Bildfokus.', layout: 'Layout', lOverlay: 'Text auf Bild', lSplit: 'Bild + weiße Fläche',
      imgSource: 'Bildquelle', srcPhoto: 'Stimmungsbild', srcProduct: 'Produktbild', overlay: 'Abdunklung', pSize: 'Produktgröße', pHint: 'Produkt im Vorschaubild mit der Maus (oder dem Finger) verschieben.', pReset: 'Größe & Position zurücksetzen', ownShot: 'Eigenes Produktbild', noShots: 'Für dieses Thema sind noch keine Product Shots hinterlegt.',
      texts: 'Texte', eyebrow: 'Dachzeile', headline: 'Headline', claim: 'Claim', ownClaim: 'Eigener Claim …', claimText: 'Eigener Claim',
      cta: 'Button anzeigen', ctaText: 'Button-Text', partner: 'Ihr Logo (optional)', partnerHint: 'Erscheint oben links, DICOTA-Logo immer oben rechts.',
      upload: 'Datei wählen', remove: 'Entfernen', dropHint: 'oder hierher ziehen', language: 'Sprache der Texte',
      export: 'Download & Versand', fileType: 'Dateiformat', retina: 'Doppelte Auflösung (2×, Retina)', maxKb: 'Max. Dateigröße JPG (KB, optional)',
      download: 'Herunterladen', email: 'Per E-Mail senden', zip: 'Mehrere Größen als ZIP', zipHint: 'Wählen Sie die Größen für das ZIP-Paket:',
      zipBtn: 'ZIP herunterladen', preparing: 'Wird erstellt …', done: 'Fertig', psdLoading: 'Photoshop-Export wird geladen …',
      mailSubject: 'Banner: {t} ({w}×{h} px)', mailBody: 'Hallo,\n\nanbei das Banner „{t}“ im Format {w}×{h} px.\n\nZiel-Link: {l}\n\nViele Grüße',
      mailFallback: 'Ihr Browser kann Dateien nicht direkt an eine E-Mail anhängen. Das Banner wurde heruntergeladen – bitte im sich öffnenden E-Mail-Fenster anhängen.',
      noThemes: 'Noch keine Banner-Themen angelegt.', imgError: 'Bild konnte nicht verarbeitet werden. Bitte JPG, PNG oder WebP verwenden.',
      preview: 'Vorschau', px: 'px', fileSize: 'Dateigröße', selectAll: 'alle', none: 'keine'
    },
    en: {
      theme: 'Theme', format: 'Format & size', ori: { h: 'Horizontal', v: 'Vertical', r: 'Square / rectangle' },
      custom: 'Custom size', width: 'Width (px)', height: 'Height (px)', image: 'Image', ownImage: 'Own image',
      focusHint: 'Click into the preview image to set the focal point.', layout: 'Layout', lOverlay: 'Text on image', lSplit: 'Image + white panel',
      imgSource: 'Image source', srcPhoto: 'Mood image', srcProduct: 'Product image', overlay: 'Darkening', pSize: 'Product size', pHint: 'Drag the product in the preview to move it.', pReset: 'Reset size & position', ownShot: 'Own product image', noShots: 'No product shots for this theme yet.',
      texts: 'Texts', eyebrow: 'Eyebrow', headline: 'Headline', claim: 'Claim', ownClaim: 'Own claim …', claimText: 'Own claim',
      cta: 'Show button', ctaText: 'Button text', partner: 'Your logo (optional)', partnerHint: 'Shown top left, DICOTA logo always top right.',
      upload: 'Choose file', remove: 'Remove', dropHint: 'or drop it here', language: 'Text language',
      export: 'Download & share', fileType: 'File format', retina: 'Double resolution (2×, retina)', maxKb: 'Max. JPG file size (KB, optional)',
      download: 'Download', email: 'Send by e-mail', zip: 'Several sizes as ZIP', zipHint: 'Choose the sizes for the ZIP package:',
      zipBtn: 'Download ZIP', preparing: 'Preparing …', done: 'Done', psdLoading: 'Loading Photoshop export …',
      mailSubject: 'Banner: {t} ({w}×{h} px)', mailBody: 'Hello,\n\nplease find attached the banner "{t}" in {w}×{h} px.\n\nTarget link: {l}\n\nBest regards',
      mailFallback: 'Your browser cannot attach files to an e-mail directly. The banner has been downloaded – please attach it in the e-mail window that opens.',
      noThemes: 'No banner themes yet.', imgError: 'Image could not be processed. Please use JPG, PNG or WebP.',
      preview: 'Preview', px: 'px', fileSize: 'File size', selectAll: 'all', none: 'none'
    }
  };

  var LS_KEY = 'dicota-bb-state';

  /* ---------------- helpers ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fill(str, map) { return String(str).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function debounce(fn, ms) { var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }
  function lsGet() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) { /* quota */ } }
  function slug(s) { return String(s || 'banner').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, ''); }
  function absUrl(u) { return !u ? u : (u.indexOf('//') === 0 ? location.protocol + u : u); }

  var imgCache = {};
  function loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (imgCache[src]) return imgCache[src];
    imgCache[src] = new Promise(function (res) {
      var im = new Image();
      if (!/^data:/.test(src)) im.crossOrigin = 'anonymous';
      im.onload = function () { res(im); };
      im.onerror = function () { res(null); };
      im.src = absUrl(src);
    });
    return imgCache[src];
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      // hide AMD loaders so UMD bundles register as globals
      var amd = window.define; try { window.define = undefined; } catch (e) { /* ignore */ }
      var s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = function () { window.define = amd; res(); };
      s.onerror = function () { window.define = amd; rej(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function hasAlpha(im) {
    try {
      var c = document.createElement('canvas'), w = Math.min(200, im.naturalWidth), h = Math.round(im.naturalHeight * w / im.naturalWidth);
      c.width = w; c.height = h; var x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data; for (var i = 3; i < d.length; i += 16) if (d[i] < 245) return true;
    } catch (e) { /* ignore */ }
    return false;
  }
  function readFile(file) {
    return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = rej; fr.readAsDataURL(file); });
  }
  function canvasToBlob(c, type, q) { return new Promise(function (res) { c.toBlob(res, type, q); }); }
  function saveBlob(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ---------------- text layout ---------------- */
  function setFont(ctx, size, weight, upper, spacing) {
    ctx.font = (weight || 500) + ' ' + size + 'px ' + FONT;
    if ('letterSpacing' in ctx) ctx.letterSpacing = (spacing || 0) * size + 'px';
  }
  function wrap(ctx, text, maxW) {
    var words = String(text).split(/\s+/).filter(Boolean), lines = [], cur = '';
    words.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }
  // shrink font until text fits in maxLines and width
  function fitLines(ctx, text, maxW, size, minSize, maxLines, weight, spacing) {
    var s = size, lines;
    for (var i = 0; i < 80; i++) {
      setFont(ctx, s, weight, false, spacing);
      lines = wrap(ctx, text, maxW);
      var widest = Math.max.apply(null, lines.map(function (l) { return ctx.measureText(l).width; }).concat([0]));
      if ((lines.length <= maxLines && widest <= maxW) || s <= minSize) break;
      s = Math.max(minSize, s * 0.94);
    }
    return { size: s, lines: lines.slice(0, maxLines) };
  }

  var FONT = '"Futura PT", "Futura", "Century Gothic", "Helvetica Neue", Arial, sans-serif';

  /* ---------------- renderer ----------------
   * spec: { w, h, scale, theme, bg (Image), product (Image), partner {img, alpha}, logo (Image),
   *         layout 'overlay'|'split', source 'photo'|'product', focus {x,y}, overlay 0..1,
   *         pScale (product size factor), pPos {x,y} (product centre within the image area),
   *         eyebrow, headline, claim, cta, ctaText, tone 'light'|'dark' }
   * layer(name) → 2D context to draw that layer into (same ctx for flat export)
   */
  // image area and white panel for a given size/layout (shared by renderer and editor)
  function regions(W, H, layout) {
    var ar = W / H, strip = H <= 130 || ar >= 4.2, narrow = ar <= 0.35;
    var img = { x: 0, y: 0, w: W, h: H }, panel = null;
    if (layout === 'split') {
      if (strip) { img = { x: 0, y: 0, w: Math.round(W * 0.26), h: H }; panel = { x: img.w, y: 0, w: W - img.w, h: H }; }
      else if (ar >= 1.25) { img = { x: 0, y: 0, w: Math.round(W * 0.52), h: H }; panel = { x: img.w, y: 0, w: W - img.w, h: H }; }
      else { img = { x: 0, y: 0, w: W, h: Math.round(H * (narrow ? 0.45 : 0.55)) }; panel = { x: 0, y: img.h, w: W, h: H - img.h }; }
    }
    return { img: img, panel: panel };
  }
  // product rectangle inside the image area: pScale 1 = fits 86 % of the area, pPos = centre (0..1)
  function productRect(im, area, pScale, pPos) {
    var ps = Math.min(area.w * 0.86 / im.naturalWidth, area.h * 0.86 / im.naturalHeight) * (pScale || 1);
    var pw = im.naturalWidth * ps, ph = im.naturalHeight * ps;
    var cx = area.x + (pPos ? pPos.x : 0.5) * area.w, cy = area.y + (pPos ? pPos.y : 0.5) * area.h;
    return { x: cx - pw / 2, y: cy - ph / 2, w: pw, h: ph };
  }

  function render(spec, layer) {
    var W = spec.w, H = spec.h, ar = W / H, s = Math.min(W, H);
    var strip = H <= 130 || ar >= 4.2;
    var narrow = ar <= 0.35;               // skyscrapers
    var pad = strip ? Math.round(H * 0.16) : Math.round(clamp(s * 0.075, 10, 120));
    var split = spec.layout === 'split';
    var imgSrc = spec.source === 'product' && spec.product ? spec.product : spec.bg;
    var isProduct = imgSrc === spec.product;

    // ----- regions -----
    var rg = regions(W, H, spec.layout), img = rg.img, panel = rg.panel;
    var textOnPhoto = !split;
    var tone = split ? 'dark' : (spec.tone || 'light');
    var ink = tone === 'light' ? '#ffffff' : '#111111';

    // ----- background -----
    var bg = layer('Hintergrund / Background');
    bg.fillStyle = '#ffffff'; bg.fillRect(0, 0, W, H);
    if (imgSrc) {
      bg.save(); bg.beginPath(); bg.rect(img.x, img.y, img.w, img.h); bg.clip();
      if (isProduct) {
        bg.fillStyle = '#f4f4f4'; bg.fillRect(img.x, img.y, img.w, img.h);
        var pr = productRect(imgSrc, img, spec.pScale, spec.pPos);
        bg.globalCompositeOperation = 'multiply';
        bg.drawImage(imgSrc, pr.x, pr.y, pr.w, pr.h);
        bg.globalCompositeOperation = 'source-over';
      } else {
        var sc = Math.max(img.w / imgSrc.naturalWidth, img.h / imgSrc.naturalHeight);
        var dw = imgSrc.naturalWidth * sc, dh = imgSrc.naturalHeight * sc;
        var fx = spec.focus ? spec.focus.x : 0.5, fy = spec.focus ? spec.focus.y : 0.5;
        var dx = clamp(img.x + img.w / 2 - fx * dw, img.x + img.w - dw, img.x);
        var dy = clamp(img.y + img.h / 2 - fy * dh, img.y + img.h - dh, img.y);
        bg.drawImage(imgSrc, dx, dy, dw, dh);
      }
      bg.restore();
    } else {
      bg.fillStyle = '#111111'; bg.fillRect(img.x, img.y, img.w, img.h);
    }

    // ----- overlay for text legibility -----
    var ov = spec.overlay == null ? 0.55 : spec.overlay;
    if (textOnPhoto && ov > 0) {
      var o = layer('Abdunklung / Overlay');
      var c0 = tone === 'light' ? '0,0,0' : '255,255,255', g;
      if (strip || ar >= 1.6) { g = o.createLinearGradient(0, 0, W * (strip ? 0.85 : 0.75), 0); }
      else { g = o.createLinearGradient(0, H, 0, H * 0.25); }
      g.addColorStop(0, 'rgba(' + c0 + ',' + ov + ')');
      g.addColorStop(0.55, 'rgba(' + c0 + ',' + (ov * 0.55) + ')');
      g.addColorStop(1, 'rgba(' + c0 + ',0)');
      o.fillStyle = g; o.fillRect(0, 0, W, H);
      // light top band so logos stay readable
      var tb = o.createLinearGradient(0, 0, 0, Math.max(pad * 3, H * 0.25));
      tb.addColorStop(0, 'rgba(' + c0 + ',' + (ov * 0.45) + ')'); tb.addColorStop(1, 'rgba(' + c0 + ',0)');
      o.fillStyle = tb; o.fillRect(0, 0, W, H);
    }
    if (panel) {
      var pl = layer('Fläche / Panel'); pl.fillStyle = '#ffffff'; pl.fillRect(panel.x, panel.y, panel.w, panel.h);
    }

    // ----- logos (fixed: DICOTA top right, partner top left) -----
    var lh = strip ? Math.round(H * 0.24) : Math.round(clamp(s * (narrow ? 0.09 : 0.065), 11, 110));
    if (narrow) lh = Math.round(W * 0.11);
    var logo = spec.logo;
    // never let the logo eat more than ~22 % of a small banner's width
    if (logo) lh = Math.max(8, Math.min(lh, Math.round(W * (narrow ? 0.8 : 0.2) * logo.naturalHeight / logo.naturalWidth)));
    var lw = logo ? Math.round(logo.naturalWidth * lh / logo.naturalHeight) : 0;
    var lx = W - pad - lw, ly = strip ? Math.round((H - lh) / 2) : pad;
    if (narrow) { lx = Math.round((W - lw) / 2); }
    var logoOnPhoto = !split || (panel && (lx < panel.x || ly < panel.y));
    if (logo) {
      var L = layer('DICOTA Logo');
      var white = logoOnPhoto && !(isProduct && (split ? ly < panel.y || lx < panel.x : true)) && (spec.tone || 'light') === 'light';
      L.drawImage(white ? whiteVersion(logo) : logo, lx, ly, lw, lh);
    }
    var leftX = pad, topY = pad;
    if (spec.partner && spec.partner.img) {
      var P = layer('Partner-Logo'), pim = spec.partner.img;
      var boxed = (!split || (panel && panel.x > 0 && !strip && ar >= 1.25) || (panel && panel.y > 0)) ? true : false;
      var maxPh = lh * (boxed ? 1.15 : 1.3), maxPw = Math.min(W * (strip ? 0.22 : 0.32), (lx - pad * 2));
      var psc = Math.min(maxPh / pim.naturalHeight, maxPw / pim.naturalWidth);
      var ppw = pim.naturalWidth * psc, pph = pim.naturalHeight * psc;
      var bpad = boxed ? Math.round(lh * 0.28) : 0;
      var px = pad, py = strip ? Math.round((H - pph) / 2) : Math.round(ly + lh / 2 - pph / 2);
      if (narrow) { px = Math.round((W - ppw) / 2); py = ly + lh + pad; }
      if (boxed) { P.fillStyle = '#ffffff'; P.fillRect(px - 0, py - bpad, ppw + bpad * 2, pph + bpad * 2); px += bpad; }
      P.drawImage(pim, px, py, ppw, pph);
      if (strip) leftX = px + ppw + bpad + pad;
      topY = Math.max(topY, py + pph + bpad);
    }

    // ----- text block -----
    var region;
    if (split && panel) {
      var ip = strip ? pad : Math.round(clamp(Math.min(panel.w, panel.h) * 0.1, 10, 110));
      region = { x: panel.x + ip, y: panel.y + ip, w: panel.w - ip * 2, h: panel.h - ip * 2, valign: 'center' };
      if (panel.y === 0 && !strip) region.y = Math.max(region.y, ly + lh + ip * 0.6), region.h = panel.y + panel.h - ip - region.y;
      if (strip) { region.x = Math.max(region.x, leftX); region.w = lx - pad - region.x; }
    } else if (strip) {
      region = { x: leftX, y: Math.round(H * 0.14), w: lx - pad - leftX, h: Math.round(H * 0.72), valign: 'center' };
    } else if (ar >= 1.6) {
      var top = Math.max(topY, ly + lh) + pad * 0.6;
      region = { x: pad, y: top, w: Math.round(W * 0.56), h: H - top - pad, valign: 'center' };
    } else {
      var top2 = Math.max(topY, ly + lh) + pad;
      region = { x: pad, y: top2, w: W - pad * 2, h: H - top2 - pad, valign: 'bottom' };
    }

    var ctaOn = spec.cta && spec.ctaText;
    var ctx = layer('Text-Messung'); // throwaway ctx for measuring (merged away in flat export)
    var base = strip ? H * 0.32 : clamp(Math.min(region.w * (ar >= 1.6 ? 0.11 : 0.12), H * (ar >= 1.6 ? 0.16 : 0.085)), 12, 150);
    if (narrow) base = W * 0.13;
    var maxHeadLines = strip ? (H >= 80 ? 2 : 1) : (narrow ? 4 : 3);

    // strip: CTA sits right of text, before the logo
    var ctaBox = null;
    if (ctaOn) {
      var cfs = strip ? Math.round(clamp(H * 0.17, 9, 22)) : Math.round(clamp(base * 0.3, 10, 34));
      setFont(ctx, cfs, 500, true, 0.08);
      var label = String(spec.ctaText).toUpperCase();
      var cw = Math.ceil(ctx.measureText(label).width + cfs * 2.2);
      while (!strip && cw > region.w && cfs > 7) { cfs--; setFont(ctx, cfs, 500, true, 0.08); cw = Math.ceil(ctx.measureText(label).width + cfs * 2.2); }
      var ch = Math.round(cfs * 2.5);
      ctaBox = { fs: cfs, w: Math.min(cw, region.w), h: ch, label: label };
      // small strips: only keep the button if enough room is left for the headline
      if (strip && region.w - cw - pad < Math.max(110, W * 0.38)) ctaBox = null;
      else if (strip) region.w -= ctaBox.w + pad;
    }

    var eyebrowOn = spec.eyebrow && !strip && region.h > base * 2.2;
    var claimOn = spec.claim && (!strip || H >= 80);
    var head = fitLines(ctx, String(spec.headline || '').toUpperCase(), region.w, strip && maxHeadLines > 1 ? H * 0.24 : base, narrow || strip ? 7 : 12, maxHeadLines, 500, 0.01);
    var eb = eyebrowOn ? fitLines(ctx, String(spec.eyebrow).toUpperCase(), region.w, Math.max(9, head.size * 0.3), 7, 1, 500, 0.14) : null;
    if (eb) { setFont(ctx, eb.size, 500, true, 0.14); if (wrap(ctx, String(spec.eyebrow).toUpperCase(), region.w).length > 1) eb = null; }
    var cl = claimOn ? fitLines(ctx, spec.claim, region.w, Math.max(10, head.size * (strip ? 0.5 : 0.4)), strip ? 8 : (narrow ? 7 : 10), strip ? 1 : (narrow ? 4 : 3), 400, 0) : null;

    function blockHeight() {
      var hh = head.lines.length * head.size * 1.06;
      if (eb) hh += eb.size * 1.3 + head.size * 0.25;
      if (cl) hh += head.size * (strip ? 0.12 : 0.35) + cl.lines.length * cl.size * 1.3;
      if (ctaBox && !strip) hh += head.size * 0.55 + ctaBox.h;
      return hh;
    }
    // shrink everything together if the block is too tall
    for (var k = 0; k < 40 && blockHeight() > region.h && head.size > (narrow ? 7 : 10); k++) {
      head = fitLines(ctx, String(spec.headline || '').toUpperCase(), region.w, head.size * 0.93, narrow ? 7 : 10, maxHeadLines, 500, 0.01);
      if (eb) eb = fitLines(ctx, String(spec.eyebrow).toUpperCase(), region.w, Math.max(8, head.size * 0.3), 7, 1, 500, 0.14);
      if (cl) cl = fitLines(ctx, spec.claim, region.w, Math.max(8, head.size * 0.4), 7, strip ? 1 : 3, 400, 0);
      if (ctaBox && !strip) { ctaBox.fs = Math.max(9, Math.round(ctaBox.fs * 0.93)); ctaBox.h = Math.round(ctaBox.fs * 2.5); setFont(ctx, ctaBox.fs, 500, true, 0.08); ctaBox.w = Math.min(region.w, Math.ceil(ctx.measureText(ctaBox.label).width + ctaBox.fs * 2.2)); }
    }
    if (cl && blockHeight() > region.h) cl = null;
    if (eb && blockHeight() > region.h) eb = null;

    var bh = blockHeight();
    var y = region.valign === 'bottom' ? region.y + region.h - bh : region.y + (region.h - bh) / 2;
    if (strip) y = (H - bh) / 2;

    if (eb) {
      var E = layer('Dachzeile / Eyebrow'); setFont(E, eb.size, 500, true, 0.14); E.fillStyle = ink; E.globalAlpha = 0.9; E.textBaseline = 'top';
      E.fillText(eb.lines[0], region.x, y); E.globalAlpha = 1; y += eb.size * 1.3 + head.size * 0.25;
    }
    var Hd = layer('Headline'); setFont(Hd, head.size, 500, true, 0.01); Hd.fillStyle = ink; Hd.textBaseline = 'top';
    head.lines.forEach(function (ln) { Hd.fillText(ln, region.x, y + head.size * 0.02); y += head.size * 1.06; });
    if (cl) {
      y += head.size * (strip ? 0.12 : 0.35);
      var C = layer('Claim'); setFont(C, cl.size, 400, false, 0); C.fillStyle = ink; C.textBaseline = 'top';
      cl.lines.forEach(function (ln) { C.fillText(ln, region.x, y); y += cl.size * 1.3; });
    }
    if (ctaBox) {
      var B = layer('Button'), bx, by;
      if (strip) { bx = lx - pad - ctaBox.w; by = Math.round((H - ctaBox.h) / 2); }
      else { y += head.size * 0.55; bx = region.x; by = y; }
      var dark = !textOnPhoto || tone === 'dark';
      B.fillStyle = dark ? '#111111' : '#ffffff'; B.fillRect(bx, by, ctaBox.w, ctaBox.h);
      setFont(B, ctaBox.fs, 500, true, 0.08); B.fillStyle = dark ? '#ffffff' : '#111111'; B.textBaseline = 'middle'; B.textAlign = 'center';
      B.fillText(ctaBox.label, bx + ctaBox.w / 2, by + ctaBox.h / 2 + ctaBox.fs * 0.05); B.textAlign = 'left';
    }
  }

  var whiteCache = new WeakMap();
  function whiteVersion(im) {
    if (whiteCache.has(im)) return whiteCache.get(im);
    var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    var x = c.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    whiteCache.set(im, c); return c;
  }

  // Flat render → canvas
  function renderFlat(spec) {
    var c = document.createElement('canvas'); c.width = spec.w; c.height = spec.h;
    var x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    var scratch = document.createElement('canvas').getContext('2d');
    render(spec, function (name) { return name === 'Text-Messung' ? scratch : x; });
    return c;
  }
  // Layered render → PSD document (ag-psd)
  function renderLayers(spec) {
    var layers = [], map = {};
    var scratch = document.createElement('canvas').getContext('2d');
    render(spec, function (name) {
      if (name === 'Text-Messung') return scratch;
      if (!map[name]) {
        var c = document.createElement('canvas'); c.width = spec.w; c.height = spec.h;
        map[name] = c.getContext('2d'); layers.push({ name: name, canvas: c });
      }
      return map[name];
    });
    return layers;
  }

  /* ---------------- app ---------------- */
  function App(root, cfg) {
    this.root = root; this.cfg = cfg; this.t = UI[cfg.uiLang] || UI.en;
    this.themes = (cfg.themes || []).slice().sort(function (a, b) { return (a.sort || 99) - (b.sort || 99); });
    var saved = lsGet() || {};
    var th = this.themes.filter(function (x) { return x.handle === saved.theme; })[0] || this.themes[0] || null;
    this.s = {
      theme: th ? th.handle : null, ori: saved.ori || 'h', w: saved.w || 1920, h: saved.h || 600,
      bgIndex: saved.theme === (th && th.handle) ? (saved.bgIndex || 0) : 0, focus: saved.focus || { x: 0.5, y: 0.5 },
      layout: saved.layout || 'overlay', source: saved.source || 'photo', overlay: saved.overlay == null ? 0.55 : saved.overlay,
      pScale: saved.pScale || 1, pPos: saved.pPos || { x: 0.5, y: 0.5 }, pIndex: saved.theme === (th && th.handle) ? (saved.pIndex || 0) : 0,
      showEyebrow: saved.showEyebrow !== false, headline: null, claimIdx: 0, claimOwn: '', cta: saved.cta !== false, ctaText: null,
      type: saved.type || 'jpg', retina: !!saved.retina, maxKb: saved.maxKb || '', zipSizes: saved.zipSizes || [], zipTypes: saved.zipTypes || ['jpg']
    };
    if (saved.theme === this.s.theme && saved.lang === cfg.lang) {
      ['headline', 'claimIdx', 'claimOwn', 'ctaText', 'showEyebrow'].forEach(function (k) { if (saved[k] != null) this.s[k] = saved[k]; }, this);
    }
    this.ownBg = null; this.ownShot = null; this.partner = null;
    // product shots per theme: theme family shot first, then the products' marketing shots
    this.themes.forEach(function (x) { if (!x.shots || !x.shots.length) x.shots = x.product ? [{ url: x.product, thumb: x.product, title: x.title }] : []; });
    var self0 = this, rf = 0; this.redraw = function () { if (rf) return; rf = requestAnimationFrame(function () { rf = 0; self0.draw(); }); };
    this.build();
  }

  App.prototype.theme = function () { var h = this.s.theme; return this.themes.filter(function (x) { return x.handle === h; })[0] || null; };

  App.prototype.persist = function () {
    var s = this.s, o = {};
    Object.keys(s).forEach(function (k) { o[k] = s[k]; }); o.lang = this.cfg.lang; lsSet(o);
  };

  App.prototype.build = function () {
    var t = this.t, self = this, cfg = this.cfg;
    if (!this.themes.length) { this.root.innerHTML = '<p>' + esc(t.noThemes) + '</p>'; return; }
    var langOpts = (cfg.languages || []).map(function (l) { return '<option value="' + esc(l.url) + '"' + (l.iso === cfg.lang ? ' selected' : '') + '>' + esc(l.name) + '</option>'; }).join('');
    this.root.innerHTML =
      '<div class="bb-layout">' +
      '<div class="bb-editor">' +
        '<fieldset class="bb-fs"><legend>1 · ' + t.theme + '</legend><div class="bb-themes" data-ref="themes"></div>' +
          (langOpts ? '<label class="bb-field bb-field--inline"><span class="bb-label">' + t.language + '</span><select data-act="lang">' + langOpts + '</select></label>' : '') + '</fieldset>' +
        '<fieldset class="bb-fs"><legend>2 · ' + t.format + '</legend>' +
          '<div class="bb-seg" data-ref="ori">' + ['h', 'v', 'r'].map(function (o) { return '<button type="button" data-ori="' + o + '">' + t.ori[o] + '</button>'; }).join('') + '</div>' +
          '<div class="bb-sizes" data-ref="sizes"></div>' +
          '<div class="bb-row"><label class="bb-field"><span class="bb-label">' + t.width + '</span><input type="number" min="50" max="6000" data-k="w"></label>' +
          '<label class="bb-field"><span class="bb-label">' + t.height + '</span><input type="number" min="50" max="6000" data-k="h"></label></div>' +
        '</fieldset>' +
        '<fieldset class="bb-fs"><legend>3 · ' + t.image + '</legend>' +
          '<div class="bb-seg bb-seg--small" data-ref="layout"><button type="button" data-layout="overlay">' + t.lOverlay + '</button><button type="button" data-layout="split">' + t.lSplit + '</button></div>' +
          '<div class="bb-seg bb-seg--small" data-ref="source"><button type="button" data-source="photo">' + t.srcPhoto + '</button><button type="button" data-source="product">' + t.srcProduct + '</button></div>' +
          '<div class="bb-bgs" data-ref="bgs"></div>' +
          '<div class="bb-upload" data-drop="bg"><label class="bb-btn bb-btn--small" data-ref="ownImgBtn">' + t.ownImage + '<input type="file" class="bb-vh" accept="image/*" data-upload="bg"></label><small>' + t.dropHint + '</small></div>' +
          '<label class="bb-field" data-ref="ovwrap"><span class="bb-label">' + t.overlay + ' <em data-ref="ovval"></em></span><input type="range" min="0" max="0.85" step="0.05" data-k="overlay"></label>' +
          '<div class="bb-field" data-ref="pwrap" hidden><label class="bb-field"><span class="bb-label">' + t.pSize + ' <em data-ref="pval"></em></span><input type="range" min="0.3" max="2.5" step="0.05" data-k="pScale"></label>' +
            '<button type="button" class="bb-btn bb-btn--small bb-btn--ghost" data-act="p-reset">' + t.pReset + '</button></div>' +
          '<small class="bb-hint" data-ref="imgHint">' + t.focusHint + '</small>' +
        '</fieldset>' +
        '<fieldset class="bb-fs"><legend>4 · ' + t.texts + '</legend>' +
          '<label class="bb-check"><input type="checkbox" data-k="showEyebrow"> ' + t.eyebrow + ' <em data-ref="ebtext"></em></label>' +
          '<label class="bb-field"><span class="bb-label">' + t.headline + '</span><input type="text" maxlength="80" data-k="headline"></label>' +
          '<label class="bb-field"><span class="bb-label">' + t.claim + '</span><select data-ref="claimSel"></select></label>' +
          '<label class="bb-field" data-ref="claimOwnWrap" hidden><span class="bb-label">' + t.claimText + '</span><input type="text" maxlength="120" data-k="claimOwn"></label>' +
          '<div class="bb-row bb-row--cta"><label class="bb-check"><input type="checkbox" data-k="cta"> ' + t.cta + '</label>' +
          '<label class="bb-field"><input type="text" maxlength="30" data-k="ctaText" placeholder="' + esc(t.ctaText) + '"></label></div>' +
          '<div class="bb-field"><span class="bb-label">' + t.partner + '</span><div class="bb-upload" data-drop="partner" data-ref="partnerBox"></div><small class="bb-hint">' + t.partnerHint + '</small></div>' +
        '</fieldset>' +
      '</div>' +
      '<div class="bb-previewcol">' +
        '<div class="bb-preview__head"><span>' + t.preview + ' · <b data-ref="dim"></b></span></div>' +
        '<div class="bb-preview" data-ref="pv"><canvas data-ref="canvas"></canvas></div>' +
        '<fieldset class="bb-fs bb-fs--export"><legend>5 · ' + t.export + '</legend>' +
          '<div class="bb-seg" data-ref="type"><button type="button" data-type="jpg">JPG</button><button type="button" data-type="png">PNG</button><button type="button" data-type="psd">PSD (Photoshop)</button></div>' +
          '<label class="bb-check"><input type="checkbox" data-k="retina"> ' + t.retina + '</label>' +
          '<label class="bb-field bb-field--inline" data-ref="kbwrap"><span class="bb-label">' + t.maxKb + '</span><input type="number" min="20" max="5000" step="10" data-k="maxKb" placeholder="150"></label>' +
          '<div class="bb-actions"><button type="button" class="bb-btn bb-btn--primary" data-act="download">' + t.download + '</button>' +
          '<button type="button" class="bb-btn" data-act="email">' + t.email + '</button><span class="bb-status" data-ref="status"></span></div>' +
          '<details class="bb-details"><summary>' + t.zip + '</summary><p class="bb-hint">' + t.zipHint + ' <a href="#" data-act="zipall">' + t.selectAll + '</a> · <a href="#" data-act="zipnone">' + t.none + '</a></p>' +
            '<div class="bb-zipsizes" data-ref="zipsizes"></div>' +
            '<div class="bb-seg bb-seg--small" data-ref="ziptypes"><button type="button" data-ziptype="jpg">JPG</button><button type="button" data-ziptype="png">PNG</button><button type="button" data-ziptype="psd">PSD</button></div>' +
            '<div class="bb-actions"><button type="button" class="bb-btn" data-act="zip">' + t.zipBtn + '</button></div></details>' +
        '</fieldset>' +
      '</div></div>';
    this.refs = {};
    Array.prototype.forEach.call(this.root.querySelectorAll('[data-ref]'), function (n) { self.refs[n.getAttribute('data-ref')] = n; });
    this.bind();
    this.applyTheme(false);
    this.sync();
    var fonts = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('500 40px "Futura PT"'), document.fonts.load('400 20px "Futura PT"')]).catch(function () {}) : Promise.resolve();
    Promise.all([fonts, loadImage(cfg.brand && cfg.brand.logo)]).then(function (r) { self.logo = r[1]; self.draw(); });
  };

  App.prototype.applyTheme = function (reset) {
    var th = this.theme(); if (!th) return;
    if (reset) { this.s.headline = null; this.s.claimIdx = 0; this.s.claimOwn = ''; this.s.ctaText = null; this.s.bgIndex = 0; this.s.focus = { x: 0.5, y: 0.5 }; this.s.pScale = 1; this.s.pPos = { x: 0.5, y: 0.5 }; this.s.pIndex = 0; this.ownBg = null; this.ownShot = null; }
    if (this.s.headline == null) this.s.headline = th.headline || th.title;
    if (this.s.ctaText == null) this.s.ctaText = th.cta || '';
    if (this.s.pIndex >= th.shots.length) this.s.pIndex = 0;
    if (!th.shots.length && !this.ownShot && this.s.source === 'product') this.s.source = 'photo';
  };

  App.prototype.bind = function () {
    var self = this, root = this.root, s = this.s;
    root.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-k'); if (!k) return;
      var v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      if (k === 'w' || k === 'h') { v = clamp(parseInt(v, 10) || 0, 0, 6000); if (v < 50) return; }
      if (k === 'overlay' || k === 'pScale') v = parseFloat(v);
      s[k] = v; self.syncLight(); self.persist(); self.redraw();
    });
    root.addEventListener('change', function (e) {
      var el = e.target;
      if (el.getAttribute('data-act') === 'lang') { self.persist(); location.href = el.value; return; }
      if (el === self.refs.claimSel) { s.claimIdx = parseInt(el.value, 10); self.sync(); self.persist(); self.redraw(); return; }
      var up = el.getAttribute('data-upload');
      if (up) { self.handleUpload(up, el.files && el.files[0]); el.value = ''; }
      var z = el.getAttribute('data-zip');
      if (z) { var list = s.zipSizes.filter(function (x) { return x !== z; }); if (el.checked) list.push(z); s.zipSizes = list; self.persist(); }
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-theme],[data-ori],[data-size],[data-bg],[data-shot],[data-layout],[data-source],[data-type],[data-ziptype],[data-act]');
      if (!b || !root.contains(b)) return;
      if (b.hasAttribute('data-theme')) { s.theme = b.getAttribute('data-theme'); self.applyTheme(true); }
      else if (b.hasAttribute('data-ori')) { s.ori = b.getAttribute('data-ori'); var first = SIZES.filter(function (x) { return x.o === s.ori; })[0]; s.w = first.w; s.h = first.h; }
      else if (b.hasAttribute('data-size')) { var p = b.getAttribute('data-size').split('x'); s.w = +p[0]; s.h = +p[1]; }
      else if (b.hasAttribute('data-bg')) { s.bgIndex = +b.getAttribute('data-bg'); s.focus = { x: 0.5, y: 0.5 }; if (s.bgIndex >= 0) self.ownBg = self.ownBg; }
      else if (b.hasAttribute('data-shot')) s.pIndex = +b.getAttribute('data-shot');
      else if (b.hasAttribute('data-layout')) s.layout = b.getAttribute('data-layout');
      else if (b.hasAttribute('data-source')) s.source = b.getAttribute('data-source');
      else if (b.hasAttribute('data-type')) s.type = b.getAttribute('data-type');
      else if (b.hasAttribute('data-ziptype')) { var zt = b.getAttribute('data-ziptype'); s.zipTypes = s.zipTypes.indexOf(zt) > -1 ? s.zipTypes.filter(function (x) { return x !== zt; }) : s.zipTypes.concat([zt]); if (!s.zipTypes.length) s.zipTypes = ['jpg']; }
      else {
        var a = b.getAttribute('data-act');
        if (a === 'download') { self.exportOne(false); return; }
        if (a === 'email') { self.exportOne(true); return; }
        if (a === 'zip') { self.exportZip(); return; }
        if (a === 'zipall' || a === 'zipnone') { e.preventDefault(); s.zipSizes = a === 'zipall' ? SIZES.map(function (x) { return x.w + 'x' + x.h; }) : []; }
        if (a === 'rm-partner') { self.partner = null; }
        if (a === 'rm-bg') { self.ownBg = null; s.bgIndex = 0; }
        if (a === 'rm-shot') { self.ownShot = null; s.pIndex = 0; }
        if (a === 'p-reset') { s.pScale = 1; s.pPos = { x: 0.5, y: 0.5 }; }
      }
      self.sync(); self.persist(); self.redraw();
    });
    // product mode: drag the product inside the preview (mouse, pen, touch)
    var cv = this.refs.canvas, drag = null, frame = 0;
    function liveDraw() { if (frame) return; frame = requestAnimationFrame(function () { frame = 0; self.draw(); }); }
    cv.addEventListener('pointerdown', function (e) {
      if (s.source !== 'product' || !self.productBox) return;
      var r = cv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * s.w, py = (e.clientY - r.top) / r.height * s.h;
      var b = self.productBox, area = b.area;
      // grab anywhere in the image area; the product jumps nowhere, it moves by the drag delta
      if (px < area.x || px > area.x + area.w || py < area.y || py > area.y + area.h) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos: { x: s.pPos.x, y: s.pPos.y }, kx: s.w / r.width / area.w, ky: s.h / r.height / area.h };
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      cv.classList.add('is-dragging'); e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      s.pPos = { x: clamp(drag.pos.x + (e.clientX - drag.x0) * drag.kx, -0.3, 1.3), y: clamp(drag.pos.y + (e.clientY - drag.y0) * drag.ky, -0.3, 1.3) };
      liveDraw();
    });
    function endDrag(e) { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; cv.classList.remove('is-dragging'); self.persist(); self.draw(); }
    cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
    // mouse wheel over the product changes its size
    cv.addEventListener('wheel', function (e) {
      if (s.source !== 'product') return;
      e.preventDefault();
      s.pScale = clamp(Math.round((s.pScale * (e.deltaY < 0 ? 1.06 : 1 / 1.06)) * 100) / 100, 0.3, 2.5);
      self.syncLight(); liveDraw(); self.persistSoon();
    }, { passive: false });
    this.persistSoon = debounce(function () { self.persist(); }, 300);
    // focal point: click into the preview (mood images)
    this.refs.canvas.addEventListener('click', function (e) {
      if (s.source === 'product') return;
      var r = e.target.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      // map from canvas coords to image coords approximately (cover crop) using last draw info
      var info = self.lastCrop; if (!info) return;
      s.focus = { x: clamp((fx * s.w - info.dx) / info.dw, 0, 1), y: clamp((fy * s.h - info.dy) / info.dh, 0, 1) };
      self.persist(); self.redraw();
    });
    ['dragover', 'dragleave', 'drop'].forEach(function (ev) {
      root.addEventListener(ev, function (e) {
        var z = e.target.closest && e.target.closest('[data-drop]'); if (!z) return;
        e.preventDefault();
        if (ev === 'dragover') z.classList.add('is-over'); else z.classList.remove('is-over');
        if (ev === 'drop') self.handleUpload(z.getAttribute('data-drop'), e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
      });
    });
  };

  App.prototype.handleUpload = function (key, file) {
    var self = this; if (!file) return;
    readFile(file).then(function (url) { return loadImage(url).then(function (im) { if (!im) throw new Error('img'); return { url: url, img: im }; }); })
      .then(function (r) {
        if (key === 'partner') self.partner = { url: r.url, img: r.img, alpha: hasAlpha(r.img) };
        else if (self.s.source === 'product') { self.ownShot = r; self.s.pIndex = -1; self.s.pScale = 1; self.s.pPos = { x: 0.5, y: 0.5 }; }
        else { self.ownBg = r; self.s.bgIndex = -1; self.s.source = 'photo'; self.s.focus = { x: 0.5, y: 0.5 }; }
        self.sync(); self.redraw();
      }).catch(function () { window.alert(self.t.imgError); });
  };

  App.prototype.claimText = function () {
    var th = this.theme(), s = this.s; if (!th) return '';
    var list = th.claims || [];
    if (s.claimIdx === -1) return s.claimOwn;
    if (s.claimIdx === -2) return '';
    return list[s.claimIdx] || '';
  };

  App.prototype.syncLight = function () {
    var s = this.s;
    this.refs.dim.textContent = s.w + ' × ' + s.h + ' px' + (s.retina && s.type !== 'psd' ? ' (' + s.w * 2 + ' × ' + s.h * 2 + ' px)' : '');
    this.refs.ovval.textContent = Math.round(s.overlay * 100) + ' %';
    var prod = s.source === 'product';
    this.refs.pwrap.hidden = !prod;
    this.refs.pval.textContent = Math.round(s.pScale * 100) + ' %';
    var pr = this.root.querySelector('[data-k="pScale"]'); if (pr && String(pr.value) !== String(s.pScale)) pr.value = s.pScale;
    this.refs.imgHint.textContent = prod ? this.t.pHint : this.t.focusHint;
    this.refs.canvas.classList.toggle('is-product', prod);
    this.refs.claimOwnWrap.hidden = s.claimIdx !== -1;
    this.refs.kbwrap.hidden = s.type !== 'jpg';
  };

  App.prototype.sync = function () {
    var s = this.s, t = this.t, root = this.root, th = this.theme(), self = this;
    this.refs.themes.innerHTML = this.themes.map(function (x) {
      var thumb = x.backgrounds && x.backgrounds[0] ? x.backgrounds[0].thumb : '';
      return '<button type="button" class="bb-theme' + (x.handle === s.theme ? ' is-active' : '') + '" data-theme="' + esc(x.handle) + '">' +
        '<span class="bb-theme__img"' + (thumb ? ' style="background-image:url(\'' + esc(thumb) + '\')"' : '') + '></span><span class="bb-theme__name">' + esc(x.title) + '</span></button>';
    }).join('');
    Array.prototype.forEach.call(this.refs.ori.children, function (b) { b.classList.toggle('is-active', b.getAttribute('data-ori') === s.ori); });
    this.refs.sizes.innerHTML = SIZES.filter(function (x) { return x.o === s.ori; }).map(function (x) {
      var on = x.w === s.w && x.h === s.h;
      return '<button type="button" class="bb-size' + (on ? ' is-active' : '') + '" data-size="' + x.w + 'x' + x.h + '"><b>' + x.w + '×' + x.h + '</b><small>' + esc(x.n) + '</small></button>';
    }).join('');
    Array.prototype.forEach.call(this.refs.layout.children, function (b) { b.classList.toggle('is-active', b.getAttribute('data-layout') === s.layout); });
    Array.prototype.forEach.call(this.refs.source.children, function (b) {
      var src = b.getAttribute('data-source'); b.classList.toggle('is-active', src === s.source); b.disabled = src === 'product' && !(th && th.shots.length) && !self.ownShot;
    });
    var bgs = (th && th.backgrounds) || [];
    if (s.source === 'product') {
      var shots = (th && th.shots) || [];
      this.refs.bgs.innerHTML = (shots.length ? '' : '<small class="bb-hint">' + esc(t.noShots) + '</small>') + shots.map(function (b, i) {
        return '<button type="button" class="bb-bg bb-bg--shot' + (s.pIndex === i ? ' is-active' : '') + '" data-shot="' + i + '" title="' + esc(b.title || '') + '" style="background-image:url(\'' + esc(b.thumb || b.url) + '\')"></button>';
      }).join('') + (this.ownShot ? '<button type="button" class="bb-bg bb-bg--shot' + (s.pIndex === -1 ? ' is-active' : '') + '" data-shot="-1" style="background-image:url(\'' + this.ownShot.url + '\')"></button><button type="button" class="bb-btn bb-btn--small bb-btn--ghost" data-act="rm-shot">' + t.remove + '</button>' : '');
      this.refs.ownImgBtn.firstChild.nodeValue = t.ownShot;
    } else {
    this.refs.ownImgBtn.firstChild.nodeValue = t.ownImage;
    this.refs.bgs.innerHTML = bgs.map(function (b, i) {
      return '<button type="button" class="bb-bg' + (s.bgIndex === i && s.source === 'photo' ? ' is-active' : '') + '" data-bg="' + i + '" style="background-image:url(\'' + esc(b.thumb) + '\')"></button>';
    }).join('') + (this.ownBg ? '<button type="button" class="bb-bg' + (s.bgIndex === -1 ? ' is-active' : '') + '" data-bg="-1" style="background-image:url(\'' + this.ownBg.url + '\')"></button><button type="button" class="bb-btn bb-btn--small bb-btn--ghost" data-act="rm-bg">' + t.remove + '</button>' : '');
    }
    var eb = root.querySelector('[data-ref="ebtext"]'); eb.textContent = th && th.eyebrow ? '„' + th.eyebrow + '“' : '';
    var claims = (th && th.claims) || [];
    this.refs.claimSel.innerHTML = claims.map(function (c, i) { return '<option value="' + i + '"' + (s.claimIdx === i ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') +
      '<option value="-1"' + (s.claimIdx === -1 ? ' selected' : '') + '>' + esc(t.ownClaim) + '</option><option value="-2"' + (s.claimIdx === -2 ? ' selected' : '') + '>–</option>';
    this.refs.partnerBox.innerHTML = (this.partner ? '<img src="' + this.partner.url + '" alt="">' : '<span class="bb-upload__empty"></span>') +
      '<label class="bb-btn bb-btn--small">' + t.upload + '<input type="file" class="bb-vh" accept="image/*" data-upload="partner"></label>' +
      (this.partner ? '<button type="button" class="bb-btn bb-btn--small bb-btn--ghost" data-act="rm-partner">' + t.remove + '</button>' : '<small>' + t.dropHint + '</small>');
    Array.prototype.forEach.call(this.refs.type.children, function (b) { b.classList.toggle('is-active', b.getAttribute('data-type') === s.type); });
    Array.prototype.forEach.call(this.refs.ziptypes.children, function (b) { b.classList.toggle('is-active', s.zipTypes.indexOf(b.getAttribute('data-ziptype')) > -1); });
    this.refs.zipsizes.innerHTML = ['h', 'v', 'r'].map(function (o) {
      return '<div><b>' + t.ori[o] + '</b>' + SIZES.filter(function (x) { return x.o === o; }).map(function (x) {
        var key = x.w + 'x' + x.h;
        return '<label class="bb-check"><input type="checkbox" data-zip="' + key + '"' + (s.zipSizes.indexOf(key) > -1 ? ' checked' : '') + '> ' + x.w + '×' + x.h + ' <small>' + esc(x.n) + '</small></label>';
      }).join('') + '</div>';
    }).join('');
    Array.prototype.forEach.call(root.querySelectorAll('[data-k]'), function (inp) {
      var v = s[inp.getAttribute('data-k')];
      if (inp.type === 'checkbox') inp.checked = !!v; else if (String(inp.value) !== String(v == null ? '' : v)) inp.value = v == null ? '' : v;
    });
    this.syncLight();
  };

  // Collects everything the renderer needs (async: images)
  App.prototype.spec = function (w, h, scale) {
    var s = this.s, th = this.theme(), self = this;
    scale = scale || 1;
    var bgUrl = s.bgIndex === -1 && this.ownBg ? this.ownBg.url : (th && th.backgrounds && th.backgrounds[s.bgIndex] ? th.backgrounds[s.bgIndex].url : null);
    var shot = s.pIndex === -1 && this.ownShot ? this.ownShot : (th && th.shots[s.pIndex]) || (th && th.shots[0]);
    return Promise.all([loadImage(bgUrl), loadImage(shot && shot.url), Promise.resolve(this.logo)]).then(function (r) {
      return {
        w: Math.round(w * scale), h: Math.round(h * scale), theme: th, bg: r[0], product: r[1], logo: r[2],
        partner: self.partner, layout: s.layout, source: s.source, focus: s.focus, overlay: s.overlay, pScale: s.pScale, pPos: s.pPos,
        eyebrow: s.showEyebrow && th ? th.eyebrow : '', headline: s.headline, claim: self.claimText(),
        cta: s.cta, ctaText: s.ctaText, tone: (th && th.tone) || 'light'
      };
    });
  };

  App.prototype.draw = function () {
    var self = this, s = this.s;
    if (!s.w || !s.h) return;
    // preview canvas: render at a capped resolution for speed
    var pv = this.refs.pv, maxW = Math.max(200, pv.clientWidth || 800), maxH = Math.max(200, window.innerHeight * 0.62);
    var view = Math.min(maxW / s.w, maxH / s.h, 1);
    var renderScale = Math.min(1, 1600 / Math.max(s.w, s.h)) ;
    this.spec(s.w, s.h, 1).then(function (sp) {
      var big = renderFlat(sp);
      var c = self.refs.canvas;
      c.width = Math.round(s.w * Math.max(renderScale, view * (window.devicePixelRatio || 1)));
      c.height = Math.round(s.h * c.width / s.w);
      c.style.width = Math.round(s.w * view) + 'px'; c.style.height = Math.round(s.h * view) + 'px';
      var x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(big, 0, 0, c.width, c.height);
      // remember crop for focal-point clicks
      var im = sp.source === 'product' ? null : sp.bg;
      if (im) {
        var sc = Math.max(sp.w / im.naturalWidth, sp.h / im.naturalHeight);
        self.lastCrop = { dw: im.naturalWidth * sc, dh: im.naturalHeight * sc };
        self.lastCrop.dx = clamp(sp.w / 2 - s.focus.x * self.lastCrop.dw, sp.w - self.lastCrop.dw, 0);
        self.lastCrop.dy = clamp(sp.h / 2 - s.focus.y * self.lastCrop.dh, sp.h - self.lastCrop.dh, 0);
      } else self.lastCrop = null;
      self.productBox = sp.source === 'product' && sp.product ? { area: regions(sp.w, sp.h, sp.layout).img } : null;
    });
  };

  App.prototype.fileName = function (w, h, ext) {
    var th = this.theme();
    return ['DICOTA', slug(th ? th.title : 'Banner'), w + 'x' + h].join('_') + '.' + ext;
  };

  App.prototype.makeFile = function (w, h, type) {
    var self = this, s = this.s, scale = (s.retina && type !== 'psd') ? 2 : 1;
    return this.spec(w, h, scale).then(function (sp) {
      if (type === 'psd') {
        return (window.agPsd ? Promise.resolve() : (self.status(self.t.psdLoading), loadScript(LIBS.psd))).then(function () {
          var layers = renderLayers(sp), flat = renderFlat(sp);
          var psd = { width: sp.w, height: sp.h, canvas: flat, children: layers.map(function (l) { return { name: l.name, canvas: l.canvas }; }) };
          var buf = window.agPsd.writePsd(psd, { generateThumbnail: true });
          return { blob: new Blob([buf], { type: 'image/vnd.adobe.photoshop' }), name: self.fileName(w, h, 'psd') };
        });
      }
      var c = renderFlat(sp);
      if (type === 'png') return canvasToBlob(c, 'image/png').then(function (b) { return { blob: b, name: self.fileName(w, h, 'png') }; });
      var maxKb = parseInt(s.maxKb, 10);
      var q = 0.92;
      var attempt = function () {
        return canvasToBlob(c, 'image/jpeg', q).then(function (b) {
          if (maxKb && b.size > maxKb * 1024 && q > 0.35) { q -= 0.07; return attempt(); }
          return { blob: b, name: self.fileName(w, h, 'jpg') };
        });
      };
      return attempt();
    });
  };

  App.prototype.status = function (txt) { this.refs.status.textContent = txt || ''; };

  App.prototype.exportOne = function (share) {
    var self = this, s = this.s, t = this.t, th = this.theme();
    this.status(t.preparing);
    this.makeFile(s.w, s.h, s.type).then(function (f) {
      self.status(t.done + ' · ' + t.fileSize + ' ' + Math.round(f.blob.size / 1024) + ' KB');
      if (!share) { saveBlob(f.blob, f.name); return; }
      var file = new File([f.blob], f.name, { type: f.blob.type });
      var subject = fill(t.mailSubject, { t: th ? th.title : 'DICOTA', w: s.w, h: s.h });
      var body = fill(t.mailBody, { t: th ? th.title : 'DICOTA', w: s.w, h: s.h, l: (th && th.link) || 'https://www.dicota.com' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: subject, text: body }).catch(function () { /* user cancelled */ });
      } else {
        saveBlob(f.blob, f.name);
        window.alert(t.mailFallback);
        location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }
    }).catch(function (e) { self.status('⚠ ' + (e && e.message ? e.message : 'Error')); });
  };

  App.prototype.exportZip = function () {
    var self = this, s = this.s, t = this.t;
    var sizes = s.zipSizes.length ? s.zipSizes : [s.w + 'x' + s.h];
    this.status(t.preparing);
    (window.JSZip ? Promise.resolve() : loadScript(LIBS.zip)).then(function () {
      var zip = new window.JSZip(), jobs = [];
      sizes.forEach(function (key) {
        var p = key.split('x');
        s.zipTypes.forEach(function (type) {
          jobs.push(function () { return self.makeFile(+p[0], +p[1], type).then(function (f) { zip.file(f.name, f.blob); }); });
        });
      });
      // sequential to keep memory low
      return jobs.reduce(function (pr, job, i) { return pr.then(function () { self.status(t.preparing + ' ' + (i + 1) + '/' + jobs.length); return job(); }); }, Promise.resolve())
        .then(function () { return zip.generateAsync({ type: 'blob' }); })
        .then(function (blob) { var th = self.theme(); saveBlob(blob, 'DICOTA_' + slug(th ? th.title : 'Banner') + '_Banner.zip'); self.status(t.done); });
    }).catch(function (e) { self.status('⚠ ' + (e && e.message ? e.message : 'Error')); });
  };

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('script[id^="bb-config-"]'), function (el) {
      if (el.__bb) return; el.__bb = true;
      var cfg; try { cfg = JSON.parse(el.textContent); } catch (e) { return; }
      var root = document.getElementById('bb-app-' + cfg.sectionId);
      if (root) root.__bbApp = new App(root, cfg);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', boot);
  window.DicotaBanner = { render: render, renderFlat: renderFlat, renderLayers: renderLayers, SIZES: SIZES };
})();
