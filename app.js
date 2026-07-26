/* ============================================================
   DASAR · Formación · lógica de la plataforma
   - Navegación y menú móvil
   - Seguimiento de progreso (localStorage)
   - Motor de quizzes
   - Casos prácticos (acordeón)
   - Reveal al hacer scroll
   ============================================================ */
(function () {
  "use strict";

  var MODULES = [
    { id: "mod0", num: "0", title: "Presentación e introducción", file: "modulo-0.html", ready: true, core: false },
    { id: "mod1", num: "1", title: "Marco legislativo e institucional", file: "modulo-1.html", ready: true, core: false },
    { id: "mod2", num: "2", title: "Diagnóstico patrimonial 360º", file: "modulo-2.html", ready: true, core: true },
    {
      id: "mod3", num: "3", title: "Los tributos y su interconexión", file: "modulo-3.html", ready: true, core: false,
      parts: [
        { t: "Parte 1 · IRPF", file: "modulo-3.html", ready: true },
        { t: "Parte 2 · Patrimonio y Grandes Fortunas", file: "modulo-3-patrimonio.html", ready: true },
        { t: "Parte 3 · Sociedades", file: "modulo-3-sociedades.html", ready: true },
        { t: "Parte 4 · Sucesiones y Donaciones", file: "modulo-3-sucesiones.html", ready: true },
        { t: "Parte 5 · Indirecta e interconexión", file: "modulo-3-indirecta.html", ready: true }
      ]
    },
    {
      id: "mod4", num: "4", title: "Estructuras y operaciones complejas", file: "modulo-4.html", ready: true, core: false,
      parts: [
        { t: "Parte 1 · Reestructuraciones y neutralidad", file: "modulo-4.html", ready: true },
        { t: "Parte 2 · M&A, due diligence e IRL", file: "modulo-4-mya.html", ready: true },
        { t: "Parte 3 · Gobernanza e internacional", file: "modulo-4-gobernanza.html", ready: true }
      ]
    },
    { id: "mod5", num: "5", title: "Planificación patrimonial y sucesoria", file: "modulo-5.html", ready: false, core: false },
    { id: "mod6", num: "6", title: "Casos prácticos y metodología", file: "modulo-6.html", ready: false, core: false }
  ];
  window.DASAR_MODULES = MODULES;

  var KEY = "dasar_progress_v1";

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  }
  function markComplete(id, done) {
    var p = loadProgress();
    if (done) p[id] = true; else delete p[id];
    saveProgress(p);
    refreshProgressUI();
  }
  window.DASAR_markComplete = markComplete;

  function completedCount() {
    var p = loadProgress(), n = 0;
    MODULES.forEach(function (m) { if (p[m.id]) n++; });
    return n;
  }

  function refreshProgressUI() {
    var p = loadProgress();
    var total = MODULES.length;
    var done = completedCount();
    var pct = Math.round((done / total) * 100);

    document.querySelectorAll("[data-progress-bar]").forEach(function (el) {
      el.style.width = pct + "%";
    });
    document.querySelectorAll("[data-progress-text]").forEach(function (el) {
      el.textContent = done + "/" + total;
    });
    document.querySelectorAll("[data-progress-pct]").forEach(function (el) {
      el.textContent = pct + "%";
    });
    // sidebar + module cards done state
    document.querySelectorAll(".side-item").forEach(function (el) {
      var id = el.getAttribute("data-mod");
      if (id && p[id]) el.classList.add("done"); else el.classList.remove("done");
    });
    document.querySelectorAll(".mcard").forEach(function (el) {
      var id = el.getAttribute("data-mod");
      var st = el.querySelector(".mc-state");
      if (id && p[id] && st) { st.classList.add("done"); st.textContent = "Completado"; }
    });
    // complete-bar buttons
    document.querySelectorAll("[data-complete-toggle]").forEach(function (btn) {
      var id = btn.getAttribute("data-complete-toggle");
      if (p[id]) { btn.textContent = "✓ Módulo completado"; btn.classList.add("btn-dark"); btn.classList.remove("btn-primary"); }
      else { btn.textContent = "Marcar módulo como completado"; btn.classList.add("btn-primary"); btn.classList.remove("btn-dark"); }
    });
  }

  /* ---------- Sidebar dinámica ---------- */
  function buildSidebar() {
    var list = document.getElementById("sidebar-list");
    if (!list) return;
    var current = document.body.getAttribute("data-current");
    var here = (location.pathname.split("/").pop() || "index.html");
    var html = "";
    MODULES.forEach(function (m) {
      var active = m.id === current ? " active" : "";
      var href = m.ready || m.id === current ? m.file : m.file;
      html += '<a class="side-item' + active + '" data-mod="' + m.id + '" href="' + href + '">' +
        '<span class="si-num">' + m.num + '</span>' +
        '<span class="si-t">' + m.title + (m.ready ? "" : " <em style=\'color:var(--muted-2);font-style:normal;font-size:.75rem\'>· en desarrollo</em>") + '</span>' +
        '<span class="si-check">✓</span>' +
        '</a>';
      // subapartados del módulo actual (esquema general)
      if (m.parts && m.id === current) {
        html += '<div class="side-sub">';
        m.parts.forEach(function (p) {
          var on = p.file && p.file === here ? " on" : "";
          if (p.ready && p.file) html += '<a class="ss' + on + '" href="' + p.file + '">' + p.t + '</a>';
          else html += '<span class="ss dis">' + p.t + ' · en desarrollo</span>';
        });
        html += '</div>';
      }
    });
    list.innerHTML = html;
  }

  /* ---------- Menú móvil ---------- */
  function wireMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var sidebar = document.querySelector(".sidebar");
    if (!toggle || !sidebar) return;
    var scrim = document.createElement("div");
    scrim.className = "scrim";
    document.body.appendChild(scrim);
    function close() { sidebar.classList.remove("open"); scrim.classList.remove("show"); }
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      scrim.classList.toggle("show");
    });
    scrim.addEventListener("click", close);
    sidebar.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
  }

  /* ---------- Quiz ---------- */
  function wireQuizzes() {
    document.querySelectorAll(".quiz").forEach(function (quiz) {
      var items = Array.prototype.slice.call(quiz.querySelectorAll(".q-item"));
      var checkBtn = quiz.querySelector("[data-quiz-check]");
      var resetBtn = quiz.querySelector("[data-quiz-reset]");
      var scoreEl = quiz.querySelector("[data-quiz-score]");
      var modId = quiz.getAttribute("data-quiz-mod");

      // seleccionar opción
      quiz.querySelectorAll(".q-opt").forEach(function (opt) {
        opt.addEventListener("click", function () {
          if (quiz.classList.contains("checked")) return;
          var radio = opt.querySelector("input");
          if (radio) radio.checked = true;
        });
      });

      function check() {
        var correct = 0;
        items.forEach(function (item) {
          var ans = parseInt(item.getAttribute("data-correct"), 10);
          var chosen = item.querySelector("input:checked");
          var opts = item.querySelectorAll(".q-opt");
          var fb = item.querySelector(".q-feedback");
          opts.forEach(function (o, i) {
            o.classList.remove("correct", "wrong");
            if (i === ans) o.classList.add("correct");
          });
          var ci = chosen ? parseInt(chosen.value, 10) : -1;
          if (ci === ans) correct++;
          else if (ci >= 0) opts[ci].classList.add("wrong");
          if (fb) {
            fb.classList.add("show");
            fb.classList.toggle("ok", ci === ans);
            fb.classList.toggle("no", ci !== ans);
          }
        });
        quiz.classList.add("checked");
        var pct = Math.round((correct / items.length) * 100);
        if (scoreEl) scoreEl.innerHTML = "Aciertos: <b>" + correct + "/" + items.length + "</b> (" + pct + "%)";
        if (modId && pct >= 70) actOrComplete(modId, "quiz");
        if (checkBtn) checkBtn.setAttribute("disabled", "disabled");
      }
      function reset() {
        quiz.classList.remove("checked");
        quiz.querySelectorAll(".q-opt").forEach(function (o) { o.classList.remove("correct", "wrong"); });
        quiz.querySelectorAll("input").forEach(function (r) { r.checked = false; });
        quiz.querySelectorAll(".q-feedback").forEach(function (f) { f.classList.remove("show", "ok", "no"); });
        if (scoreEl) scoreEl.innerHTML = "";
        if (checkBtn) checkBtn.removeAttribute("disabled");
      }
      if (checkBtn) checkBtn.addEventListener("click", check);
      if (resetBtn) resetBtn.addEventListener("click", reset);
    });
  }

  /* ---------- Casos prácticos ---------- */
  function wireCasos() {
    document.querySelectorAll(".caso").forEach(function (caso) {
      var head = caso.querySelector(".caso-h");
      var body = caso.querySelector(".caso-body");
      if (!head || !body) return;
      head.addEventListener("click", function () {
        var open = caso.classList.toggle("open");
        body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
        var act = caso.getAttribute("data-act");
        if (open && act) actDone(act);
      });
    });
  }

  /* ---------- Complete toggles ---------- */
  function wireComplete() {
    document.querySelectorAll("[data-complete-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-complete-toggle");
        var p = loadProgress();
        markComplete(id, !p[id]);
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function wireReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (e) { e.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
    // salvaguarda: si algo sigue oculto tras 1,2 s (p. ej. IO no soportado bien), mostrarlo
    setTimeout(function () {
      els.forEach(function (e) { if (!e.classList.contains("in")) e.classList.add("in"); });
    }, 1200);
  }

  /* ---------- Año footer ---------- */
  function wireYear() {
    document.querySelectorAll("[data-year]").forEach(function (e) {
      e.textContent = new Date().getFullYear();
    });
  }

  /* =========================================================
     ACTIVIDADES OBLIGATORIAS (gating de avance)
     ========================================================= */
  var AKEY = "dasar_activities_v1";
  function loadActs() { try { return JSON.parse(localStorage.getItem(AKEY)) || {}; } catch (e) { return {}; } }
  function saveActs(a) { try { localStorage.setItem(AKEY, JSON.stringify(a)); } catch (e) {} }

  function currentMod() { return document.body.getAttribute("data-current"); }

  function actDone(key) {
    var mod = currentMod();
    if (!mod) return;
    var a = loadActs();
    a[mod] = a[mod] || {};
    if (a[mod][key]) { refreshTracker(); return; }
    a[mod][key] = true;
    saveActs(a);
    refreshTracker();
  }

  function refreshTracker() {
    var tracker = document.querySelector(".tracker[data-mod]");
    if (!tracker) return;
    var mod = tracker.getAttribute("data-mod");
    var a = loadActs();
    var done = (a[mod]) || {};
    var items = tracker.querySelectorAll(".act[data-act]");
    var total = items.length, n = 0;
    items.forEach(function (it) {
      var k = it.getAttribute("data-act");
      if (done[k]) { it.classList.add("done"); n++; } else it.classList.remove("done");
    });
    var count = tracker.querySelector("[data-tk-count]");
    if (count) count.textContent = n + "/" + total;
    var doneMsg = tracker.querySelector("[data-tk-done]");
    var allDone = total > 0 && n === total;
    if (doneMsg) doneMsg.style.display = allDone ? "flex" : "none";
    if (allDone) markComplete(mod, true);
  }

  /* Marca actividad si hay tracker; si no, completa el módulo directamente (scaffolds) */
  function actOrComplete(mod, key) {
    if (document.querySelector(".tracker[data-mod]")) actDone(key);
    else markComplete(mod, true);
  }

  /* =========================================================
     PROGRESO POR LECTURA (scroll del contenido)
     ========================================================= */
  function wireReading() {
    var bar = document.querySelector(".readprogress > i");
    var main = document.querySelector(".content");
    if (!bar || !main) return;
    var reached = false;
    function onScroll() {
      var rect = main.getBoundingClientRect();
      var total = main.offsetHeight - window.innerHeight;
      var scrolled = -rect.top;
      var ratio = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 1;
      bar.style.width = (ratio * 100) + "%";
      if (!reached && ratio >= 0.9) { reached = true; actDone("leer"); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  /* =========================================================
     CALCULADORA DE ENCAJE Y TARIFA
     ========================================================= */
  var RATES = { smart: 0.01, advance: 0.0075, multi: 0.005 };
  var FLOOR = { smart: 500, advance: 1500, multi: 5000 };  // €/mes + IVA
  var NAME = { smart: "Smart Family Office", advance: "Advanced Family Office", multi: "Multi Family Office", inter: "Zona intermedia" };

  function eur(n) {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(n));
  }

  function classify(aum, revenue, intervene) {
    // Umbrales (criterios mínimos; decide el consultor)
    var rev = intervene ? revenue : 0;
    if (aum >= 5000000 || rev > 5000000) return "multi";
    if (aum > 4000000 || rev > 3000000) return "inter"; // zona intermedia Advance/Multi
    if (aum > 2000000 || rev >= 1000000) return "advance";
    return "smart";
  }

  function feeFor(seg, aum) {
    var rate = RATES[seg], floor = FLOOR[seg];
    var recomMonth = (aum * rate) / 12;
    var applied = Math.max(recomMonth, floor);
    return { rate: rate, floor: floor, recomMonth: recomMonth, month: applied, year: applied * 12, floorApplies: recomMonth < floor };
  }

  function wireCalc() {
    var calc = document.querySelector(".calc:not(.rcalc)");
    if (!calc) return;
    var elAum = calc.querySelector("[data-c-aum]");
    var elRev = calc.querySelector("[data-c-rev]");
    var elInt = calc.querySelector("[data-c-int]");
    var btn = calc.querySelector("[data-c-run]");
    var res = calc.querySelector(".calc-result");

    function num(el) { var v = parseFloat((el && el.value || "").toString().replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }

    function run() {
      var aum = num(elAum);
      var rev = num(elRev);
      var intervene = elInt ? elInt.checked : false;
      var seg = classify(aum, rev, intervene);

      var html = "";
      var segName = seg === "inter" ? NAME.inter : NAME[seg];
      html += '<div class="seg"><span class="tag">Encaje sugerido</span><span class="name ' + (seg === "multi" ? "multi" : "") + '">' + segName + '</span></div>';

      if (seg === "inter") {
        var fa = feeFor("advance", aum), fm = feeFor("multi", aum);
        html += '<p class="note">El cliente cae en la <strong>zona intermedia</strong> (AUM entre 4 y 5 M€ o facturación entre 3 y 5 M€). Aquí <strong>decide el consultor</strong>. Comparativa de tarifa recomendada:</p>';
        html += '<div class="money">' +
          '<div class="m"><div class="k">Como Advanced (0,75%)</div><div class="v">' + eur(fa.month) + '<span style="font-size:.8rem;color:var(--muted-2)"> /mes</span></div></div>' +
          '<div class="m"><div class="k">Como Multi (0,5%)</div><div class="v wine">' + eur(fm.month) + '<span style="font-size:.8rem;color:var(--muted-2)"> /mes</span></div></div>' +
          '<div class="m"><div class="k">AUM en gestión</div><div class="v">' + eur(aum) + '</div></div>' +
          '</div>';
        if (fm.floorApplies) html += '<div class="flag">Ojo: en Multi se aplicaría el <strong>mínimo de 5.000 €/mes</strong> (0,5% sobre ' + eur(aum) + ' quedaría por debajo). Valora si el alcance del Multi justifica ese suelo o si encaja mejor en Advanced.</div>';
      } else {
        var f = feeFor(seg, aum);
        var pct = (RATES[seg] * 100).toString().replace(".", ",");
        html += '<div class="money">' +
          '<div class="m"><div class="k">Tarifa recomendada</div><div class="v wine">' + eur(f.month) + '<span style="font-size:.8rem;color:var(--muted-2)"> /mes + IVA</span></div></div>' +
          '<div class="m"><div class="k">Equivalente anual</div><div class="v">' + eur(f.year) + '</div></div>' +
          '<div class="m"><div class="k">% aplicado sobre AUM</div><div class="v">' + pct + '%</div></div>' +
          '</div>';
        html += '<p class="note">Cálculo: ' + pct + '% de ' + eur(aum) + ' = ' + eur(aum * RATES[seg]) + '/año. Mínimo del tramo: ' + eur(FLOOR[seg]) + '/mes.</p>';
        if (f.floorApplies) html += '<div class="flag">Se aplica el <strong>mínimo del tramo (' + eur(FLOOR[seg]) + '/mes)</strong>: el porcentaje sobre AUM queda por debajo del suelo.</div>';
        else html += '<div class="flag">La tarifa por % supera el mínimo del tramo, así que manda el porcentaje sobre AUM.</div>';
      }
      html += '<p class="note" style="margin-top:.8rem">Recuerda: los umbrales son <strong>criterios mínimos</strong>. La clasificación final la decide el consultor según el encaje real del cliente.</p>';

      res.innerHTML = html;
      res.classList.add("show");
      actDone("calc");
    }
    if (btn) btn.addEventListener("click", run);
  }

  /* =========================================================
     HERRAMIENTA DE DIAGNÓSTICO 360º · genera el mapa de dolor
     ========================================================= */
  var CCAA_GRAVOSA = ["asturias", "cataluna"]; // ISD/IP menos favorables (orientativo)
  var ASSET_INMUEBLE = ["inm_habitual", "inm_2a", "inm_alquiler", "inm_afecto"];

  function wireDiagnostico() {
    var form = document.querySelector(".dform");
    if (!form) return;
    var rows = form.querySelector("[data-rows]");
    var addBtn = form.querySelector("[data-d-addrow]");
    var runBtn = form.querySelector("[data-d-run]");
    var printBtn = form.querySelector("[data-d-print]");
    var dlBtn = form.querySelector("[data-d-download]");
    var resetBtn = form.querySelector("[data-d-reset]");
    var pm = form.querySelector(".painmap");

    function rowTemplate() {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><select data-a-tipo>' +
          '<option value="inm_habitual">Inmueble · vivienda habitual</option>' +
          '<option value="inm_2a">Inmueble · 2ª residencia</option>' +
          '<option value="inm_alquiler">Inmueble · en alquiler</option>' +
          '<option value="inm_afecto">Inmueble · afecto a actividad</option>' +
          '<option value="participaciones">Participaciones / empresa</option>' +
          '<option value="cartera">Cartera financiera</option>' +
          '<option value="liquidez">Liquidez / depósitos</option>' +
          '<option value="pension">Plan de pensiones</option>' +
          '<option value="otros">Otros activos</option>' +
        '</select></td>' +
        '<td><input type="text" data-a-desc placeholder="Descripción"></td>' +
        '<td><input type="number" data-a-valor min="0" step="1000" placeholder="0"></td>' +
        '<td><select data-a-tit>' +
          '<option value="cliente">Cliente 100%</option>' +
          '<option value="conyuge">Cónyuge</option>' +
          '<option value="ganancial">Ganancial</option>' +
          '<option value="compartido">Compartido</option>' +
        '</select></td>' +
        '<td><button type="button" class="rm" title="Quitar">×</button></td>';
      tr.querySelector(".rm").addEventListener("click", function () { tr.remove(); });
      return tr;
    }
    if (addBtn) addBtn.addEventListener("click", function () { rows.appendChild(rowTemplate()); });
    // filas iniciales
    if (rows && rows.children.length === 0) { rows.appendChild(rowTemplate()); rows.appendChild(rowTemplate()); }

    function val(sel) { var e = form.querySelector(sel); return e ? e.value : ""; }
    function num(sel) { var e = form.querySelector(sel); var v = parseFloat((e && e.value || "").toString().replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }
    function chk(sel) { var e = form.querySelector(sel); return e ? e.checked : false; }

    function collect() {
      var assets = [];
      form.querySelectorAll("[data-rows] tr").forEach(function (tr) {
        var v = parseFloat((tr.querySelector("[data-a-valor]").value || "0").replace(/[^0-9.]/g, "")) || 0;
        assets.push({
          tipo: tr.querySelector("[data-a-tipo]").value,
          desc: tr.querySelector("[data-a-desc]").value,
          valor: v,
          tit: tr.querySelector("[data-a-tit]").value
        });
      });
      return {
        edad: num("[data-d-edad]"),
        ccaa: val("[data-d-ccaa]"),
        vecindad: val("[data-d-vecindad]"),
        civil: val("[data-d-civil]"),
        regimen: val("[data-d-regimen]"),
        testamento: chk("[data-d-testamento]"),
        seguros: chk("[data-d-seguros]"),
        empresa: chk("[data-d-empresa]"),
        fact: num("[data-d-fact]"),
        part: num("[data-d-part]"),
        holding: chk("[data-d-holding]"),
        empleado: chk("[data-d-empleado]"),
        ippres: chk("[data-d-ippres]"),
        riesgos: chk("[data-d-riesgos]"),
        obj: val("[data-d-obj]"),
        assets: assets
      };
    }

    function analyze(d) {
      var total = d.assets.reduce(function (s, a) { return s + a.valor; }, 0);
      var inmob = d.assets.filter(function (a) { return ASSET_INMUEBLE.indexOf(a.tipo) >= 0; }).reduce(function (s, a) { return s + a.valor; }, 0);
      var liquidez = d.assets.filter(function (a) { return a.tipo === "liquidez" || a.tipo === "cartera"; }).reduce(function (s, a) { return s + a.valor; }, 0);
      var empresaVal = d.assets.filter(function (a) { return a.tipo === "participaciones"; }).reduce(function (s, a) { return s + a.valor; }, 0);
      var maxAsset = d.assets.reduce(function (m, a) { return Math.max(m, a.valor); }, 0);
      var seg = classify(total, d.empresa ? d.fact : 0, d.empresa);
      var F = [];
      function add(prio, cat, t, dd) { F.push({ prio: prio, cat: cat, t: t, d: dd }); }

      if (d.riesgos) add("alta", "fiscal", "Contingencias fiscales abiertas", "Hay comprobaciones o riesgos declarados. Priorizar su análisis y, en su caso, regularización antes que cualquier optimización.");
      if (!d.testamento) add("alta", "juridico", "Sin testamento otorgado", "Riesgo de sucesión intestada y reparto no deseado. Ordenar la sucesión es prioritario, sobre todo con empresa o menores.");
      if (total > 3000000) add("alta", "fiscal", "Exposición al Impuesto de Grandes Fortunas", "El patrimonio supera 3 M€: analizar ITSGF y su interacción con el IP (las bonificaciones autonómicas del IP dejan de ahorrar).");
      if (empresaVal > 0 && d.empresa && !d.empleado) add("alta", "fiscal", "Riesgo en la exención de empresa familiar", "Participaciones relevantes sin acreditar actividad económica (persona empleada / medios). Peligra la exención en IP y la reducción del 95% en ISD.");
      else if (empresaVal > 0) add("media", "oport", "Empresa familiar: blindar la exención", "Confirmar de forma continuada los requisitos (funciones de dirección, remuneración >50%, porcentaje de participación) para asegurar la exención en IP e ISD.");
      if (total > 1000000 && liquidez < total * 0.1) add("alta", "juridico", "Posible falta de liquidez para el ISD", "La liquidez disponible (" + pct(liquidez, total) + "% del patrimonio) puede no cubrir el coste sucesorio. Prever seguro de vida o tesorería.");
      if (total > 0 && maxAsset > total * 0.6) add("media", "inef", "Concentración de riesgo", "Un único activo supone más del 60% del patrimonio. Revisar diversificación y su impacto en liquidez y sucesión.");
      if (total > 0 && inmob > total * 0.7) add("media", "inef", "Alta exposición inmobiliaria", "Más del 70% en inmuebles: iliquidez y coste recurrente (IBI, IP, imputación de rentas). Valorar reordenación o rentabilización.");
      if (total > 1000000 && CCAA_GRAVOSA.indexOf(d.ccaa) >= 0) add("media", "oport", "Residencia poco eficiente en ISD/IP", "La comunidad de residencia es de las menos favorables. Valorar planificación de residencia (real y sostenida) o instrumentos alternativos.");
      if (d.vecindad && d.vecindad !== "comun") add("baja", "oport", "Herramientas forales disponibles", "Vecindad civil foral: se pueden usar pactos sucesorios para transmitir en vida con efectos sucesorios y, a menudo, ventaja fiscal (Módulo 1).");
      if (d.civil === "pareja") add("media", "fiscal", "Pareja de hecho: equiparación dispar en ISD", "Verificar si la CCAA equipara la pareja de hecho al cónyuge para las bonificaciones del ISD y confirmar la inscripción registral.");
      if (d.regimen === "gananciales" && d.assets.some(function (a) { return a.tit === "cliente" && a.valor > 200000; })) add("baja", "juridico", "Revisar titularidades frente al régimen", "En gananciales, confirmar el carácter privativo o ganancial de los activos declarados a nombre de uno solo (afecta a la herencia).");
      if (total > 700000 && !d.ippres) add("media", "fiscal", "Posible Impuesto sobre el Patrimonio no atendido", "El patrimonio podría superar el mínimo del IP en su comunidad. Verificar la obligación de declarar (y el ITSGF).");
      if (!d.seguros && total > 500000) add("baja", "inef", "Sin seguros de vida designados", "Un seguro de vida bien diseñado aporta liquidez para el ISD y disfruta de reducción propia. Revisar coberturas y beneficiarios.");
      if (d.assets.some(function (a) { return a.tipo === "inm_alquiler"; })) add("baja", "inef", "Optimizar el alquiler", "Revisar la reducción del rendimiento (Ley de vivienda), gastos deducibles y amortización; valorar si es actividad económica.");
      if (d.assets.some(function (a) { return a.tipo === "inm_2a"; })) add("baja", "inef", "Coste silencioso de la 2ª residencia", "Imputación de renta en IRPF + IBI + IP. Valorar uso, rentabilización o reordenación.");

      var order = { alta: 0, media: 1, baja: 2 };
      F.sort(function (a, b) { return order[a.prio] - order[b.prio]; });
      return { total: total, inmob: inmob, liquidez: liquidez, seg: seg, findings: F };
    }

    function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
    function eur2(n) { return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(n)); }

    function render(d, r) {
      var segName = r.seg === "inter" ? "Zona intermedia" : NAME[r.seg];
      var html = '<h3><span class="tri"></span> Mapa de dolor — ' + (val("[data-d-ref]") ? escapeHtml(val("[data-d-ref]")) : "cliente") + '</h3>';
      html += '<div class="pm-summary">' +
        '<div class="m"><div class="k">Patrimonio en gestión</div><div class="v wine">' + eur2(r.total) + '</div></div>' +
        '<div class="m"><div class="k">% inmobiliario</div><div class="v">' + pct(r.inmob, r.total) + '%</div></div>' +
        '<div class="m"><div class="k">% líquido</div><div class="v">' + pct(r.liquidez, r.total) + '%</div></div>' +
        '<div class="m"><div class="k">Encaje de servicio</div><div class="v">' + segName + '</div></div>' +
        '</div>';
      if (!r.findings.length) {
        html += '<p class="pm-empty">No se han detectado cuestiones con los datos introducidos. Añade activos y detalles para un diagnóstico más completo.</p>';
      } else {
        var cats = { fiscal: "Riesgo fiscal", juridico: "Riesgo jurídico-sucesorio", inef: "Ineficiencia", oport: "Oportunidad" };
        var prios = { alta: "Prioridad alta", media: "Prioridad media", baja: "Prioridad baja" };
        r.findings.forEach(function (f) {
          html += '<div class="finding ' + f.prio + '"><div class="fi-c"><div class="fi-t">' + f.t + '</div><div class="fi-d">' + f.d + '</div></div>' +
            '<div class="fi-badges"><span class="pill-cat ' + f.cat + '">' + cats[f.cat] + '</span><span class="pill-prio">' + prios[f.prio] + '</span></div></div>';
        });
      }
      if (d.obj) html += '<div class="finding media"><div class="fi-c"><div class="fi-t">Objetivos declarados por el cliente</div><div class="fi-d">' + escapeHtml(d.obj) + '</div></div><div class="fi-badges"><span class="pill-cat oport">Contexto</span></div></div>';
      html += '<p class="pm-note">Diagnóstico orientativo generado a partir de las respuestas. No sustituye el análisis del consultor ni la verificación de la normativa vigente.</p>';
      pm.innerHTML = html;
      pm.classList.add("show");
      window._dasarLastReport = buildText(d, r, segName);
      actDone("diagnostico");
    }

    function escapeHtml(s) { return (s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    function buildText(d, r, segName) {
      var L = [];
      L.push("DASAR · MAPA DE DOLOR — " + (val("[data-d-ref]") || "cliente"));
      L.push("Fecha: " + new Date().toLocaleDateString("es-ES"));
      L.push("");
      L.push("RESUMEN");
      L.push("- Patrimonio en gestión: " + eur2(r.total));
      L.push("- % inmobiliario: " + pct(r.inmob, r.total) + "%  |  % líquido: " + pct(r.liquidez, r.total) + "%");
      L.push("- Encaje de servicio sugerido: " + segName);
      L.push("- CCAA residencia: " + (val("[data-d-ccaa]") || "-") + "  |  Vecindad civil: " + (val("[data-d-vecindad]") || "-"));
      L.push("");
      L.push("CUESTIONES DETECTADAS (mapa de dolor)");
      if (!r.findings.length) L.push("- (ninguna con los datos introducidos)");
      r.findings.forEach(function (f, i) { L.push((i + 1) + ". [" + f.prio.toUpperCase() + " · " + f.cat + "] " + f.t + " — " + f.d); });
      if (d.obj) { L.push(""); L.push("OBJETIVOS DEL CLIENTE: " + d.obj); }
      L.push("");
      L.push("Documento orientativo de uso formativo. Verificar normativa vigente.");
      return L.join("\n");
    }

    if (runBtn) runBtn.addEventListener("click", function () {
      var d = collect(); var r = analyze(d); render(d, r);
      pm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if (printBtn) printBtn.addEventListener("click", function () { if (pm.classList.contains("show")) window.print(); });
    if (dlBtn) dlBtn.addEventListener("click", function () {
      if (!window._dasarLastReport) return;
      var blob = new Blob([window._dasarLastReport], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mapa-de-dolor-" + (val("[data-d-ref]") || "cliente").replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".txt";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
    if (resetBtn) resetBtn.addEventListener("click", function () {
      form.querySelectorAll("input").forEach(function (i) { if (i.type === "checkbox") i.checked = false; else i.value = ""; });
      form.querySelectorAll("select").forEach(function (s) { s.selectedIndex = 0; });
      rows.innerHTML = ""; rows.appendChild(rowTemplate()); rows.appendChild(rowTemplate());
      pm.classList.remove("show"); pm.innerHTML = "";
    });
  }

  /* =========================================================
     IRPF · calculadoras (Módulo 3) — ESTIMADORES ORIENTATIVOS
     ========================================================= */
  // Top marginal combinado (estatal + autonómico) orientativo 2024-25
  var IRPF_TOP = {
    madrid: 0.45, cyl: 0.445, andalucia: 0.47, murcia: 0.47, galicia: 0.47,
    clm: 0.455, canarias: 0.505, cantabria: 0.495, aragon: 0.50, cataluna: 0.50,
    cvalenciana: 0.54, extremadura: 0.50, baleares: 0.495, asturias: 0.50, larioja: 0.515,
    navarra: 0.52, paisvasco: 0.49
  };
  var IRPF_NOMBRE = {
    madrid: "Madrid", castillayleon: "Castilla y León", andalucia: "Andalucía", murcia: "Murcia",
    galicia: "Galicia", cyl: "Castilla y León", clm: "Castilla-La Mancha", canarias: "Canarias", cantabria: "Cantabria",
    aragon: "Aragón", cataluna: "Cataluña", cvalenciana: "C. Valenciana", extremadura: "Extremadura",
    baleares: "Baleares", asturias: "Asturias", larioja: "La Rioja", navarra: "Navarra (foral)", paisvasco: "País Vasco (foral)"
  };
  var MIN_PERSONAL = 5550;

  function progresivo(base, tramos) {
    var q = 0, prev = 0;
    for (var i = 0; i < tramos.length; i++) {
      var lim = tramos[i][0], tipo = tramos[i][1];
      if (base > lim) { q += (lim - prev) * tipo; prev = lim; }
      else { q += (base - prev) * tipo; return q; }
    }
    return q; // por si supera el último límite (último tramo es Infinity)
  }
  function escalaGeneral(base, ccaa) {
    var top = IRPF_TOP[ccaa] || 0.47;
    var tramos = [[12450, 0.19], [20200, 0.24], [35200, 0.30], [60000, 0.37], [Infinity, top]];
    return progresivo(base, tramos);
  }
  function escalaAhorro(base) {
    return progresivo(base, [[6000, 0.19], [50000, 0.21], [200000, 0.23], [300000, 0.27], [Infinity, 0.28]]);
  }
  function eurE(n) { return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(n)); }
  function pctE(x) { return (x * 100).toFixed(1).replace(".", ",") + "%"; }

  function wireIrpf() {
    var calc = document.querySelector(".rcalc.irpf");
    if (!calc) return;
    var elGen = calc.querySelector("[data-i-gen]"), elAho = calc.querySelector("[data-i-aho]"), elCcaa = calc.querySelector("[data-i-ccaa]");
    var btn = calc.querySelector("[data-i-run]"), res = calc.querySelector(".calc-result");
    function n(e) { var v = parseFloat((e && e.value || "").replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }
    function run() {
      var g = n(elGen), a = n(elAho), ccaa = elCcaa.value || "madrid";
      var qGen = Math.max(0, escalaGeneral(g, ccaa) - escalaGeneral(MIN_PERSONAL, ccaa));
      var qAho = escalaAhorro(a);
      var tot = qGen + qAho, bt = g + a;
      var medio = bt > 0 ? tot / bt : 0;
      var marg = g > 60000 ? (IRPF_TOP[ccaa] || 0.47) : (g > 35200 ? 0.37 : g > 20200 ? 0.30 : g > 12450 ? 0.24 : 0.19);
      // comparación con Madrid
      var qGenMad = Math.max(0, escalaGeneral(g, "madrid") - escalaGeneral(MIN_PERSONAL, "madrid"));
      var totMad = qGenMad + qAho, dif = tot - totMad;
      var html = '<div class="seg"><span class="tag">Cuota estimada · ' + IRPF_NOMBRE[ccaa] + '</span><span class="name wine">' + eurE(tot) + '</span></div>';
      html += '<div class="money">' +
        '<div class="m"><div class="k">Tipo medio</div><div class="v">' + pctE(medio) + '</div></div>' +
        '<div class="m"><div class="k">Tipo marginal (general)</div><div class="v wine">' + pctE(marg) + '</div></div>' +
        '<div class="m"><div class="k">Renta neta</div><div class="v">' + eurE(bt - tot) + '</div></div>' +
        '</div>';
      html += '<p class="note">Desglose: base general ' + eurE(g) + ' → ' + eurE(qGen) + ' · base del ahorro ' + eurE(a) + ' → ' + eurE(qAho) + '.</p>';
      if (ccaa !== "madrid") {
        if (Math.abs(dif) >= 1) html += '<div class="flag">Frente a <strong>Madrid</strong> (una de las más bajas), aquí ' + (dif > 0 ? 'pagarías <strong>' + eurE(Math.abs(dif)) + ' más</strong>' : 'pagarías <strong>' + eurE(Math.abs(dif)) + ' menos</strong>') + ' al año con la misma renta.</div>';
      }
      html += '<p class="note" style="margin-top:.7rem">Estimación orientativa: escala general con el marginal autonómico y mínimo personal simplificado; no incluye todas las reducciones ni las deducciones autonómicas. Verifica la escala vigente de la comunidad.</p>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_irpf");
    }
    if (btn) btn.addEventListener("click", run);
  }

  function wireAhorro() {
    var calc = document.querySelector(".rcalc.ahorro");
    if (!calc) return;
    var tipo = calc.querySelector("[data-a-tipo]"), imp = calc.querySelector("[data-a-imp]"),
        adq = calc.querySelector("[data-a-adq]"), trn = calc.querySelector("[data-a-trn]"), gas = calc.querySelector("[data-a-gas]");
    var btn = calc.querySelector("[data-a-run]"), res = calc.querySelector(".calc-result");
    var wrapImp = calc.querySelector("[data-wrap-imp]"), wrapGan = calc.querySelector("[data-wrap-gan]");
    function n(e) { var v = parseFloat((e && e.value || "").replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }
    function toggle() {
      var t = tipo.value;
      var esGan = (t === "venta_valores" || t === "venta_inmueble");
      if (wrapImp) wrapImp.style.display = esGan ? "none" : "";
      if (wrapGan) wrapGan.style.display = esGan ? "" : "none";
    }
    if (tipo) tipo.addEventListener("change", toggle);
    toggle();
    function run() {
      var t = tipo.value, ganancia, detalle;
      if (t === "dividendos") { ganancia = n(imp); detalle = "Importe íntegro de dividendos/intereses: " + eurE(ganancia) + "."; }
      else {
        var g = n(trn) - n(adq) - n(gas); ganancia = g;
        detalle = "Ganancia = " + eurE(n(trn)) + " − " + eurE(n(adq)) + " − " + eurE(n(gas)) + " gastos = " + eurE(g) + ".";
      }
      var html;
      if (ganancia <= 0) {
        html = '<div class="seg"><span class="tag">Resultado</span><span class="name">Pérdida patrimonial</span></div>' +
          '<p class="note">' + detalle + ' No hay cuota; la pérdida se compensa con otras ganancias del ahorro (y hasta el 25% con rendimientos), con arrastre de 4 años.</p>';
      } else {
        var q = escalaAhorro(ganancia), medio = q / ganancia;
        html = '<div class="seg"><span class="tag">Impuesto (base del ahorro)</span><span class="name wine">' + eurE(q) + '</span></div>';
        html += '<div class="money">' +
          '<div class="m"><div class="k">Renta del ahorro</div><div class="v">' + eurE(ganancia) + '</div></div>' +
          '<div class="m"><div class="k">Tipo medio</div><div class="v wine">' + pctE(medio) + '</div></div>' +
          '<div class="m"><div class="k">Neto</div><div class="v">' + eurE(ganancia - q) + '</div></div>' +
          '</div>';
        html += '<p class="note">' + detalle + ' Escala del ahorro: 19% / 21% / 23% / 27% / 28%.</p>';
      }
      var notas = {
        dividendos: "Los dividendos e intereses tributan íntegros en la base del ahorro (no existe la antigua exención de 1.500 €). Vía holding, un dividendo entre sociedades puede tener exención del 95% en el IS (Módulo 3 · IS).",
        venta_valores: "En la venta de acciones/sociedad: comprueba coeficientes de abatimiento (adquisición anterior a 1994, límite 400.000 €) y, si es una participación significativa, la posible reestructuración con neutralidad o la exención del 95% vía holding en el IS.",
        venta_inmueble: "En la venta de inmueble: exención por reinversión en vivienda habitual, exención para mayores de 65 años (vivienda habitual o reinversión en renta vitalicia) y recuerda la plusvalía municipal aparte (Módulo 1)."
      };
      html += '<div class="flag">' + notas[t] + '</div>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_ahorro");
    }
    if (btn) btn.addEventListener("click", run);
  }

  /* =========================================================
     DEDUCCIONES AUTONÓMICAS IRPF · grandes rasgos por comunidad
     Orientativo (último ejercicio); verificar importes/requisitos.
     ========================================================= */
  var DEDUCC_CCAA = {
    madrid: [
      "Nacimiento o adopción de hijos (importe creciente los años siguientes; límite de renta).",
      "Adopción internacional de hijos.",
      "Acogimiento familiar de menores y de personas mayores o con discapacidad.",
      "Cuidado de hijos menores de 3 años (gastos de empleada de hogar) y por familias con dos o más hijos e ingresos reducidos.",
      "Arrendamiento de vivienda habitual por menores de 35 años (con límite de renta).",
      "Gastos educativos: escolaridad en centros no gratuitos, enseñanza de idiomas y vestuario escolar.",
      "Donativos a fundaciones y por fomento del consumo cultural.",
      "Inversión en acciones de entidades nuevas o de reciente creación y en el mercado alternativo bursátil."
    ],
    cataluna: [
      "Nacimiento o adopción de hijos.",
      "Alquiler de la vivienda habitual (jóvenes, parados, viudos ≥65, familias numerosas; con límite de renta).",
      "Rehabilitación de la vivienda habitual.",
      "Pago de intereses de préstamos para estudios de máster y doctorado.",
      "Inversión de un 'ángel inversor' en acciones de empresas nuevas o de reciente creación.",
      "Donativos a entidades de fomento de la lengua catalana y a la investigación científica.",
      "Contribuyentes que se quedan viudos.",
      "Por obligación de declarar por tener dos o más pagadores."
    ],
    andalucia: [
      "Nacimiento o adopción de hijos; adopción internacional.",
      "Familia numerosa y familia monoparental.",
      "Discapacidad del contribuyente, cónyuge o parientes; asistencia mediante empleada de hogar.",
      "Alquiler de vivienda habitual (jóvenes ≤35, mayores, discapacidad).",
      "Inversión en vivienda habitual protegida por jóvenes.",
      "Gastos educativos, de informática y de enseñanza de idiomas.",
      "Ayuda doméstica (por cuotas del empleador a la Seguridad Social).",
      "Donativos ecológicos y a entidades; inversión en empresas de nueva o reciente creación."
    ],
    cvalenciana: [
      "Nacimiento, adopción o acogimiento; parto múltiple.",
      "Familia numerosa o monoparental.",
      "Gastos de guardería y de centros de primer ciclo de educación infantil.",
      "Conciliación: madres con hijos de 3 a 5 años.",
      "Adquisición/rehabilitación de primera vivienda habitual por jóvenes ≤35.",
      "Alquiler de vivienda habitual y por movilidad geográfica por trabajo.",
      "Discapacidad; ascendientes mayores de 75 años o con discapacidad.",
      "Gastos educativos y de material escolar; enseñanza de idiomas.",
      "Donativos culturales, ecológicos y a la investigación; obras de mejora de la eficiencia energética."
    ],
    galicia: [
      "Nacimiento o adopción de hijos.",
      "Familia numerosa.",
      "Cuidado de hijos menores (guardería o empleada de hogar).",
      "Alquiler de vivienda habitual por jóvenes ≤35.",
      "Adquisición/rehabilitación de vivienda en el medio rural o en núcleos con despoblación.",
      "Discapacidad de descendientes o ascendientes.",
      "Inversión en empresas nuevas, en el sector agrario/forestal y en el mercado alternativo.",
      "Donativos a fundaciones y por fomento de la lengua gallega."
    ],
    cyl: [
      "Nacimiento o adopción; partos múltiples y por hijos.",
      "Familia numerosa.",
      "Cuidado de hijos menores (guardería) y conciliación.",
      "Adquisición/rehabilitación de vivienda por jóvenes en núcleos rurales.",
      "Alquiler de vivienda habitual para jóvenes.",
      "Discapacidad del contribuyente y cuidado de ascendientes.",
      "Fomento de la natalidad y de la fijación de población en el medio rural.",
      "Donativos para la recuperación del patrimonio e I+D."
    ],
    canarias: [
      "Nacimiento o adopción de hijos.",
      "Familia numerosa.",
      "Gastos de guardería.",
      "Alquiler de vivienda habitual.",
      "Gastos de estudios de hijos que estudian fuera de la isla de residencia.",
      "Discapacidad y por familiares dependientes.",
      "Gastos de enfermedad y sanitarios (deducción característica de Canarias).",
      "Donativos e inversión en empresas de nueva creación; traslado de isla por trabajo."
    ],
    cantabria: [
      "Nacimiento y adopción; acogimiento familiar de menores.",
      "Alquiler de vivienda habitual (jóvenes, mayores, discapacidad).",
      "Obras de mejora y rehabilitación de la vivienda.",
      "Gastos de guardería.",
      "Cuidado de familiares (ascendientes o descendientes con discapacidad).",
      "Gastos de enfermedad y sanitarios; ayuda doméstica.",
      "Acogimiento no remunerado de mayores o personas con discapacidad.",
      "Donativos."
    ],
    aragon: [
      "Nacimiento o adopción (especialmente tercer hijo o por discapacidad).",
      "Familia numerosa.",
      "Cuidado de personas dependientes (ascendientes/descendientes).",
      "Adquisición de vivienda en núcleos rurales o con despoblación por jóvenes.",
      "Alquiler de vivienda (jóvenes y vivienda social).",
      "Gastos de guardería y de adquisición de libros de texto y material escolar.",
      "Discapacidad.",
      "Donativos ecológicos y a la investigación."
    ],
    clm: [
      "Nacimiento o adopción de hijos.",
      "Familia numerosa y familia monoparental.",
      "Gastos por cuidado de hijos (guardería).",
      "Discapacidad del contribuyente y de familiares.",
      "Adquisición/rehabilitación de vivienda en zonas rurales despobladas.",
      "Alquiler de vivienda habitual por jóvenes.",
      "Gastos en libros de texto y enseñanza de idiomas.",
      "Cuidado de ascendientes mayores; donativos."
    ],
    extremadura: [
      "Nacimiento o adopción; parto múltiple.",
      "Familia numerosa.",
      "Cuidado de hijos menores y por trabajo autónomo.",
      "Alquiler de vivienda habitual (jóvenes, víctimas de violencia, discapacidad, familias numerosas, medio rural).",
      "Adquisición/rehabilitación de vivienda para jóvenes en el medio rural.",
      "Compra de material escolar.",
      "Discapacidad y cuidado de familiares dependientes.",
      "Deducción general por rendimientos del trabajo; donativos al patrimonio."
    ],
    baleares: [
      "Nacimiento o adopción.",
      "Familia numerosa o monoparental.",
      "Gastos de guardería y de aprendizaje de idiomas extranjeros.",
      "Gastos de estudios superiores de descendientes cursados fuera de la isla.",
      "Alquiler de vivienda habitual (jóvenes, discapacidad, familias numerosas).",
      "Discapacidad; cuidado de descendientes o ascendientes.",
      "Inversión en empresas nuevas o de reciente creación y en I+D+i.",
      "Donativos culturales, científicos y de patrimonio."
    ],
    asturias: [
      "Nacimiento o adopción; partos o adopciones múltiples.",
      "Familia numerosa y monoparental.",
      "Acogimiento familiar de menores y de mayores.",
      "Alquiler de vivienda habitual (jóvenes; zonas rurales en riesgo de despoblación).",
      "Adquisición/rehabilitación de vivienda en concejos en riesgo de despoblación.",
      "Guardería (0-3) y transporte para residentes en zonas rurales.",
      "Discapacidad y cuidado de ascendientes.",
      "Donativos."
    ],
    larioja: [
      "Nacimiento y adopción (segundo hijo y siguientes).",
      "Familia numerosa.",
      "Escolarización (0-3) y guardería.",
      "Adquisición/rehabilitación de vivienda habitual para jóvenes en pequeños municipios.",
      "Alquiler de vivienda para jóvenes.",
      "Compra de vehículos eléctricos y obras de eficiencia energética/rehabilitación.",
      "Cuidado de hijos y de ascendientes; discapacidad.",
      "Acogimiento familiar."
    ],
    murcia: [
      "Nacimiento o adopción de hijos.",
      "Familia numerosa.",
      "Gastos de guardería y custodia de menores; conciliación.",
      "Adquisición o rehabilitación de vivienda habitual por jóvenes.",
      "Alquiler de vivienda habitual por jóvenes.",
      "Inversión en empresas nuevas o de reciente creación y en el mercado alternativo bursátil.",
      "Gastos en material escolar y libros de texto.",
      "Instalación de energías renovables y dispositivos de ahorro de agua; donativos."
    ],
    navarra: [
      "Mínimos personales y familiares que operan como deducción de la cuota (por hijos y ascendientes).",
      "Alquiler de vivienda habitual.",
      "Inversión en vivienda habitual (aún vigente en Navarra, a diferencia del régimen común).",
      "Deducción por rendimientos del trabajo y por discapacidad.",
      "Aportaciones a sistemas de previsión.",
      "Donaciones.",
      "Nota: IRPF foral propio (Convenio), con estructura y cifras distintas al régimen común."
    ],
    paisvasco: [
      "Deducciones por descendientes y ascendientes; por discapacidad o dependencia.",
      "Adquisición de vivienda habitual (aún vigente) y por alquiler de vivienda habitual.",
      "Aportaciones a EPSV y otros sistemas de previsión.",
      "Deducción por edad.",
      "Donativos.",
      "Nota: IRPF foral propio por territorio histórico (Bizkaia, Gipuzkoa y Araba), con cifras propias de cada Diputación Foral."
    ]
  };

  function wireDeducciones() {
    var box = document.querySelector("[data-deducc]");
    if (!box) return;
    var DATA = window.DASAR_DED || {};
    var chips = box.querySelector("[data-chips]"), panel = box.querySelector("[data-panel]");
    var order = ["madrid", "cataluna", "andalucia", "cvalenciana", "galicia", "asturias", "cantabria", "canarias", "baleares", "aragon", "clm", "extremadura", "murcia", "larioja", "navarra", "cyl", "paisvasco"];
    var avail = order.filter(function (k) { return DATA[k]; });
    avail.forEach(function (k) {
      var b = document.createElement("button");
      b.className = "chip"; b.type = "button";
      b.innerHTML = (IRPF_NOMBRE[k] || k).replace(" (foral)", "") +
        '<span class="cm">' + (DATA[k].items ? DATA[k].items.length : 0) + '</span>';
      b.addEventListener("click", function () { render(k, b); });
      chips.appendChild(b);
    });
    function esc(s) { return (s || "").replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    function render(k, btn) {
      var d = DATA[k]; if (!d) return;
      box.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
      if (btn) btn.classList.add("active");
      var html = '<div class="dp-head"><h4>' + (IRPF_NOMBRE[k] || k) + '</h4>' +
        '<span class="dp-marg">' + d.items.length + ' deducciones · marginal máx. aprox. ' + pctE(IRPF_TOP[k] || 0.47) + '</span></div>';
      html += '<p class="dp-src"><strong>Norma:</strong> ' + esc(d.norma) +
        (d.url ? ' · <a href="' + d.url + '" target="_blank" rel="noopener">ver texto consolidado ↗</a>' : '') +
        (d.act ? ' · <em>actualizado a ' + esc(d.act) + '</em>' : '') + '</p>';
      if (d.nota) html += '<div class="dp-nota">' + esc(d.nota) + '</div>';
      html += '<div class="dp-tablewrap"><table class="tbl dedtbl"><thead><tr>' +
        '<th>Deducción</th><th>% / importe</th><th>Límite</th><th>Requisito de renta</th><th>Otros requisitos</th><th>Art.</th>' +
        '</tr></thead><tbody>';
      d.items.forEach(function (it) {
        html += '<tr><td><strong>' + esc(it.n) + '</strong></td><td>' + esc(it.imp) + '</td><td>' + esc(it.lim) +
          '</td><td>' + esc(it.renta) + '</td><td>' + esc(it.req) + '</td><td>' + esc(it.art) + '</td></tr>';
      });
      html += '</tbody></table></div>';
      panel.innerHTML = html;
      actDone("deducc");
    }
    if (avail.length) render(avail[0], chips.querySelector(".chip"));
  }

  /* =========================================================
     PATRIMONIO · escala estatal, ITSGF y LÍMITE CONJUNTO (art. 31)
     ========================================================= */
  // Escala estatal art. 30 Ley 19/1991 (verificada en BOE)
  var IP_ESCALA = [
    [167129.45, 0.002], [334252.88, 0.003], [668499.75, 0.005], [1336999.51, 0.009],
    [2673999.01, 0.013], [5347998.03, 0.017], [10695996.06, 0.021], [Infinity, 0.035]
  ];
  // Escala ITSGF art. 3.Once Ley 38/2022 (verificada en BOE)
  var ITSGF_ESCALA = [[3000000, 0], [5347998.03, 0.017], [10695996.06, 0.021], [Infinity, 0.035]];

  function tarifa(base, tramos) {
    var q = 0, prev = 0;
    for (var i = 0; i < tramos.length; i++) {
      var lim = tramos[i][0], t = tramos[i][1];
      if (base > lim) { q += (lim - prev) * t; prev = lim; }
      else { q += (base - prev) * t; return q; }
    }
    return q;
  }

  function wireIpCalc() {
    var calc = document.querySelector(".rcalc.ipcalc");
    if (!calc) return;
    var g = function (s) { return calc.querySelector(s); };
    function n(sel) { var e = g(sel); var v = parseFloat((e && e.value || "").replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }
    var btn = g("[data-p-run]"), res = calc.querySelector(".calc-result");

    function run() {
      var patrimonio = n("[data-p-patrimonio]");     // base imponible IP (patrimonio neto)
      var minimo = n("[data-p-minimo]") || 700000;   // mínimo exento autonómico
      var biIrpf = n("[data-p-birpf]");               // base imponible IRPF computable
      var cuotaIrpf = n("[data-p-cirpf]");            // cuota íntegra IRPF computable
      var pctImp = Math.min(100, n("[data-p-improd]")) / 100; // % de cuota IP de elementos improductivos
      var bonif = Math.min(100, n("[data-p-bonif]")) / 100;   // bonificación autonómica

      var baseLiq = Math.max(0, patrimonio - minimo);
      var cuotaIP = tarifa(baseLiq, IP_ESCALA);

      // ---- Límite conjunto art. 31 ----
      var limite = 0.60 * biIrpf;
      var ipComputable = cuotaIP * (1 - pctImp);     // se excluye la parte de improductivos
      var ipImproductiva = cuotaIP - ipComputable;
      var suma = cuotaIrpf + ipComputable;
      var exceso = Math.max(0, suma - limite);
      var topeReduccion = 0.80 * ipComputable;        // la reducción no puede exceder del 80 %
      var reduccion = Math.min(exceso, topeReduccion);
      var ipTrasLimite = cuotaIP - reduccion;
      var ipFinal = ipTrasLimite * (1 - bonif);      // bonificación autonómica sobre la cuota resultante

      // ---- ITSGF ----
      var baseLiqG = Math.max(0, patrimonio - 700000);
      var cuotaG = tarifa(baseLiqG, ITSGF_ESCALA);
      var sumaG = cuotaIrpf + ipTrasLimite + cuotaG;
      var excesoG = Math.max(0, sumaG - limite);
      var redG = Math.min(excesoG, 0.80 * cuotaG);
      var gTrasLimite = cuotaG - redG;
      var gFinal = Math.max(0, gTrasLimite - ipFinal); // deduce la cuota de IP efectivamente satisfecha

      var html = '<div class="seg"><span class="tag">Total a pagar (IP + Grandes Fortunas)</span><span class="name wine">' + eurE(ipFinal + gFinal) + '</span></div>';
      html += '<div class="money">' +
        '<div class="m"><div class="k">Cuota IP (antes de límite)</div><div class="v">' + eurE(cuotaIP) + '</div></div>' +
        '<div class="m"><div class="k">Reducción por límite 60 %</div><div class="v wine">−' + eurE(reduccion) + '</div></div>' +
        '<div class="m"><div class="k">Cuota IP final</div><div class="v">' + eurE(ipFinal) + '</div></div>' +
        '</div>';
      html += '<table class="tbl" style="margin:.9rem 0"><tbody>' +
        '<tr><td>Base liquidable IP (patrimonio − mínimo exento)</td><td><strong>' + eurE(baseLiq) + '</strong></td></tr>' +
        '<tr><td>Límite conjunto: 60 % de la base imponible del IRPF</td><td><strong>' + eurE(limite) + '</strong></td></tr>' +
        '<tr><td>Suma computable (cuota IRPF + cuota IP productiva)</td><td>' + eurE(suma) + '</td></tr>' +
        (pctImp > 0 ? '<tr><td>Cuota IP excluida por elementos improductivos (' + Math.round(pctImp * 100) + ' %)</td><td>' + eurE(ipImproductiva) + '</td></tr>' : '') +
        '<tr><td>Exceso sobre el límite</td><td>' + eurE(exceso) + '</td></tr>' +
        '<tr><td>Tope de reducción (80 % de la cuota computable)</td><td>' + eurE(topeReduccion) + '</td></tr>' +
        (bonif > 0 ? '<tr><td>Bonificación autonómica aplicada (' + Math.round(bonif * 100) + ' %)</td><td>−' + eurE(ipTrasLimite * bonif) + '</td></tr>' : '') +
        '<tr><td><strong>Cuota ITSGF (Grandes Fortunas) antes de deducir el IP</strong></td><td>' + eurE(gTrasLimite) + '</td></tr>' +
        '<tr><td><strong>Cuota ITSGF a ingresar (tras deducir el IP satisfecho)</strong></td><td><strong>' + eurE(gFinal) + '</strong></td></tr>' +
        '</tbody></table>';

      if (exceso > 0 && reduccion === topeReduccion && exceso > topeReduccion) {
        html += '<div class="flag">Atención: el exceso sobre el límite (' + eurE(exceso) + ') <strong>supera el tope del 80 %</strong>, así que la reducción se queda en ' + eurE(reduccion) + ' y siempre se paga al menos el 20 % de la cuota computable del IP (el llamado «suelo» del límite conjunto).</div>';
      } else if (exceso > 0) {
        html += '<div class="flag">El límite conjunto reduce la cuota del IP en ' + eurE(reduccion) + '. Revisa qué elementos son improductivos: aumentarlos reduce la parte computable, pero también la reducción posible.</div>';
      } else {
        html += '<div class="flag">No se supera el límite del 60 %: no procede reducción por el art. 31 de la Ley 19/1991.</div>';
      }
      if (bonif >= 0.99 && gFinal > 0) {
        html += '<div class="flag">Ojo: la bonificación autonómica del IP <strong>no ahorra</strong> aquí — lo que se deja de pagar por IP lo recupera el Estado vía Grandes Fortunas (' + eurE(gFinal) + ').</div>';
      }
      html += '<p class="note" style="margin-top:.7rem">Estimación orientativa con la escala estatal del art. 30 de la Ley 19/1991 y la del art. 3.Once de la Ley 38/2022. Si la comunidad tiene escala propia, el resultado varía. Verifica siempre la normativa vigente.</p>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_ip");
    }
    if (btn) btn.addEventListener("click", run);
  }

  /* =========================================================
     SOCIEDADES · reserva de capitalización, nivelación, BINs y tipo
     Datos verificados: Ley 27/2014 (arts. 25, 26, 29, 101, 105 y DT 44.ª)
     ========================================================= */
  function wireIsCalc() {
    var calc = document.querySelector(".rcalc.iscalc");
    if (!calc) return;
    var g = function (s) { return calc.querySelector(s); };
    function n(sel) { var e = g(sel); var v = parseFloat((e && e.value || "").replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }
    function chk(sel) { var e = g(sel); return e ? e.checked : false; }
    var btn = g("[data-s-run]"), res = calc.querySelector(".calc-result");

    // Tipo aplicable según INCN, ejercicio y condición (DT 44.ª)
    function tipoAplicable(incn, anio, erd, nueva, patrimonial) {
      if (patrimonial) return { t: 0.25, nota: "Entidad patrimonial: no accede a los tipos reducidos (art. 29.1, último párrafo)." };
      if (nueva) return { t: 0.15, nota: "Entidad de nueva creación: 15 % en el primer período con base positiva y el siguiente (art. 29.1)." };
      if (incn > 0 && incn < 1000000) {
        if (anio <= 2025) return { t: 0.215, nota: "Microempresa (INCN < 1 M€) en 2025: 21 % hasta 50.000 € y 22 % el resto (DT 44.ª). Se muestra el tipo medio aproximado." };
        if (anio === 2026) return { t: 0.20, nota: "Microempresa en 2026: 19 % hasta 50.000 € y 21 % el resto (DT 44.ª)." };
        return { t: 0.19, nota: "Microempresa (régimen definitivo): 17 % hasta 50.000 € y 20 % el resto (art. 29.1)." };
      }
      if (erd) {
        if (anio <= 2025) return { t: 0.24, nota: "Entidad de reducida dimensión en 2025: 24 % (DT 44.ª)." };
        if (anio === 2026) return { t: 0.23, nota: "ERD en 2026: 23 % (DT 44.ª)." };
        if (anio === 2027) return { t: 0.22, nota: "ERD en 2027: 22 % (DT 44.ª)." };
        return { t: 0.21, nota: "ERD desde 2028: 21 % (DT 44.ª) — el régimen definitivo del art. 29.1 es el 20 %." };
      }
      return { t: 0.25, nota: "Tipo general del 25 % (art. 29.1)." };
    }

    function run() {
      var base = n("[data-s-base]");        // base imponible previa
      var incn = n("[data-s-incn]");        // cifra de negocios del año anterior
      var incrFP = n("[data-s-fp]");        // incremento de fondos propios
      var incrPlantilla = n("[data-s-plantilla]"); // % incremento de plantilla
      var bins = n("[data-s-bins]");        // BINs pendientes
      var anio = n("[data-s-anio]") || 2026;
      var erd = incn > 0 && incn < 10000000;
      var nueva = chk("[data-s-nueva]");
      var patrimonial = chk("[data-s-patrimonial]");

      // --- Reserva de capitalización (art. 25) ---
      var pctCap = 0.20, notaCap = "20 %";
      if (incrPlantilla > 10) { pctCap = 0.30; notaCap = "30 % (plantilla +10 %)"; }
      else if (incrPlantilla >= 5) { pctCap = 0.265; notaCap = "26,5 % (plantilla +5-10 %)"; }
      else if (incrPlantilla >= 2) { pctCap = 0.23; notaCap = "23 % (plantilla +2-5 %)"; }
      var topeCapPct = (incn > 0 && incn < 1000000) ? 0.25 : 0.20;
      var capBruta = incrFP * pctCap;
      var capAplicada = Math.min(capBruta, topeCapPct * base);
      var capPendiente = Math.max(0, capBruta - capAplicada);
      var base1 = Math.max(0, base - capAplicada);

      // --- BINs (art. 26 + DA 15.ª) ---
      var limPct = 0.70, limNota = "70 %";
      if (incn >= 60000000) { limPct = 0.25; limNota = "25 % (INCN ≥ 60 M€, DA 15.ª)"; }
      else if (incn >= 20000000) { limPct = 0.50; limNota = "50 % (INCN 20-60 M€, DA 15.ª)"; }
      var topeBin = Math.max(1000000, limPct * base); // el mínimo de 1 M€ siempre compensable
      var binAplicada = Math.min(bins, topeBin, base1);
      var base2 = Math.max(0, base1 - binAplicada);

      // --- Reserva de nivelación (art. 105, solo ERD) ---
      var nivAplicada = 0;
      if (erd && !patrimonial) nivAplicada = Math.min(base2 * 0.10, 1000000);
      var baseFinal = Math.max(0, base2 - nivAplicada);

      var tp = tipoAplicable(incn, anio, erd, nueva, patrimonial);
      var cuota = baseFinal * tp.t;
      var ahorro = (base * tp.t) - cuota;

      var html = '<div class="seg"><span class="tag">Cuota íntegra estimada</span><span class="name wine">' + eurE(cuota) + '</span></div>';
      html += '<div class="money">' +
        '<div class="k-wrap"></div>' +
        '<div class="m"><div class="k">Base imponible final</div><div class="v">' + eurE(baseFinal) + '</div></div>' +
        '<div class="m"><div class="k">Tipo aplicable</div><div class="v wine">' + pctE(tp.t) + '</div></div>' +
        '<div class="m"><div class="k">Ahorro por incentivos</div><div class="v">' + eurE(ahorro) + '</div></div>' +
        '</div>';
      html += '<table class="tbl" style="margin:.9rem 0"><tbody>' +
        '<tr><td>Base imponible previa</td><td><strong>' + eurE(base) + '</strong></td></tr>' +
        '<tr><td>− Reserva de capitalización (' + notaCap + ', tope ' + pctE(topeCapPct) + ' de la base)</td><td>−' + eurE(capAplicada) + '</td></tr>' +
        (capPendiente > 0 ? '<tr><td style="color:var(--muted)">Capitalización pendiente para los 2 años siguientes</td><td style="color:var(--muted)">' + eurE(capPendiente) + '</td></tr>' : '') +
        '<tr><td>− Bases imponibles negativas (límite ' + limNota + ', mínimo 1 M€)</td><td>−' + eurE(binAplicada) + '</td></tr>' +
        (bins - binAplicada > 0 ? '<tr><td style="color:var(--muted)">BINs que quedan pendientes</td><td style="color:var(--muted)">' + eurE(bins - binAplicada) + '</td></tr>' : '') +
        (erd ? '<tr><td>− Reserva de nivelación (10 %, máx. 1 M€, revierte en 5 años)</td><td>−' + eurE(nivAplicada) + '</td></tr>' : '') +
        '<tr><td><strong>Base imponible final</strong></td><td><strong>' + eurE(baseFinal) + '</strong></td></tr>' +
        '<tr><td>× Tipo</td><td>' + pctE(tp.t) + '</td></tr>' +
        '<tr><td><strong>Cuota íntegra</strong></td><td><strong>' + eurE(cuota) + '</strong></td></tr>' +
        '</tbody></table>';
      html += '<div class="flag">' + tp.nota + (erd ? ' Es <strong>entidad de reducida dimensión</strong> (INCN < 10 M€): accede a nivelación, libertad de amortización con empleo y amortización acelerada.' : '') + '</div>';
      if (nivAplicada > 0) html += '<div class="flag">Ojo con la <strong>nivelación</strong>: no es un ahorro definitivo. Revierte en los 5 años siguientes (contra bases negativas o, si no las hay, al final del plazo). Es diferimiento, no exención.</div>';
      if (capAplicada > 0) html += '<div class="flag">La <strong>reserva de capitalización</strong> exige mantener el incremento de fondos propios y una reserva indisponible durante <strong>3 años</strong>. Si se incumple, hay que regularizar con intereses.</div>';
      if (patrimonial) html += '<div class="flag">Al ser <strong>entidad patrimonial</strong> (art. 5.2) pierde los tipos reducidos y los incentivos de ERD, y compromete la exención de empresa familiar en IP e ISD.</div>';
      html += '<p class="note" style="margin-top:.7rem">Estimación orientativa. En microempresas el tipo real es por tramos (50.000 € al tipo menor); aquí se muestra un tipo medio. Verifica siempre la normativa vigente y el ejercicio aplicable.</p>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_is");
    }
    if (btn) btn.addEventListener("click", run);
  }

  /* =========================================================
     SUCESIONES · calculadora por comunidad
     Escala y coeficientes estatales verificados (Ley 29/1987, arts. 20-22).
     Datos autonómicos verificados en los textos consolidados.
     ========================================================= */
  var ISD_ESCALA = [
    [7993.46, 0.0765], [15980.91, 0.085], [23968.36, 0.0935], [31955.81, 0.102],
    [39943.26, 0.1105], [47930.72, 0.119], [55918.17, 0.1275], [63905.62, 0.136],
    [71893.07, 0.1445], [79880.52, 0.153], [119757.67, 0.1615], [159634.83, 0.187],
    [239389.13, 0.2125], [398777.54, 0.255], [797555.08, 0.2975], [Infinity, 0.34]
  ];
  // Reducción estatal por parentesco (art. 20.2.a)
  var ISD_RED_ESTATAL = { conyuge: 15956.87, hijo: 15956.87, hijoMenor: 15956.87, ascendiente: 15956.87, hermano: 7993.46, noPariente: 0 };
  var ISD_GRUPO = { conyuge: 2, hijo: 2, hijoMenor: 1, ascendiente: 2, hermano: 3, noPariente: 4 };
  // Datos autonómicos (sucesiones). red = reducción propia por parentesco GI-GII; bon = % bonificación de cuota
  var ISD_CCAA = {
    madrid:      { n: "Madrid",             red: 16000,   bon: 99,  emp: 99, nota: "Bonificación del 99 % (GI-GII) solo sobre bienes declarados en plazo. Tarifa y coeficientes propios. Grupo III: 50 %." },
    andalucia:   { n: "Andalucía",          red: 1000000, bon: 99,  emp: 99, nota: "Reducción propia de 1.000.000 € por heredero (GI-GII) y bonificación del 99 %: la mayoría de herencias familiares quedan a cero." },
    extremadura: { n: "Extremadura",        red: 500000,  bon: 99,  emp: 99, nota: "Reducción de 500.000 € (GI-GII) y bonificación del 99 %, condicionada a presentar en plazo." },
    cantabria:   { n: "Cantabria",          red: 50000,   bon: 100, emp: 99, nota: "Bonificación del 100 % para GI-GII. Se asimilan convivientes de 2 años y cuidadores del causante con discapacidad." },
    baleares:    { n: "Baleares",           red: 25000,   bon: 100, emp: 95, nota: "Deducción del 100 % de la cuota (GI-GII), condicionada a consignar en escritura el valor de los inmuebles (≤ valor de referencia +20 %). Escala especial GI-II del 1 % hasta 700.000 €." },
    canarias:    { n: "Canarias",           red: 40400,   bon: 99.9, emp: 99, nota: "Bonificación del 99,9 % que alcanza también al GRUPO III. La reducción por parentesco de GI es del 100 % de la base con topes por edad." },
    murcia:      { n: "Murcia",             red: 0,       bon: 99,  emp: 99, nota: "Sin reducción propia por parentesco, pero bonificación del 99 % sobre la cuota. Tarifa propia hasta el 36,50 %." },
    larioja:     { n: "La Rioja",           red: 0,       bon: 99,  emp: 99, nota: "Bonificación del 99 % (GI-GII), extensible a convivientes de 15 años. Sin reducción propia por parentesco." },
    cyl:         { n: "Castilla y León",    red: 400000,  bon: 99,  emp: 99, nota: "Reducción variable que eleva el conjunto hasta 400.000 € (aquí se aplica como tal) más bonificación del 99 %." },
    cvalenciana: { n: "C. Valenciana",      red: 100000,  bon: 99,  emp: 99, nota: "Reducción de 100.000 € y bonificación del 99 % (solo sobre bienes declarados). Tarifa y coeficientes propios." },
    clm:         { n: "Castilla-La Mancha", red: 0,       bon: -1,  emp: 99, nota: "Bonificación DECRECIENTE por tramos de base liquidable: 100 % (<175.000), 95 %, 90 %, 85 % y 80 % (≥300.000). Sin reducción propia. Texto consolidado con aviso de actualización en proceso: verificar." },
    cataluna:    { n: "Cataluña",           red: 100000,  bon: -2,  emp: 95, nota: "Cónyuge: bonificación del 99 %. Resto de GI-GII: bonificación DECRECIENTE (art. 633-4.2) que aquí NO se aplica automáticamente. Tarifa propia (7-32 %) y se pierde la bonificación si se usan reducciones rogadas." },
    galicia:     { n: "Galicia",            red: 1000000, bon: 0,   emp: 99, nota: "Reducción de 1.000.000 € por heredero. La bonificación del 99 % es SOLO para el Grupo I; el Grupo II no la tiene, pero se aplica una TARIFA PROPIA muy baja (5-18 %) no reflejada aquí." },
    asturias:    { n: "Asturias",           red: 300000,  bon: 0,   emp: 99, nota: "Reducción de 300.000 € (GI-GII) y SIN bonificación de cuota; además tiene TARIFA PROPIA más alta (21,25-36,50 %) no reflejada aquí: el resultado real puede ser MAYOR." },
    aragon:      { n: "Aragón",             red: 500000,  bon: 0,   emp: 99, nota: "Reducción del 100 % de la base con límite conjunto de 500.000 € (cónyuge, ascendientes y descendientes). Bonificación del 99 % solo para el Grupo I; el GII tiene el 65 % de la cuota de la vivienda habitual." }
  };

  function bonifCLM(bl) {
    if (bl < 175000) return 100; if (bl < 225000) return 95; if (bl < 275000) return 90; if (bl < 300000) return 85; return 80;
  }
  function coefISD(grupo, patr) {
    var t = patr <= 402678.11 ? 0 : patr <= 2007380.43 ? 1 : patr <= 4020770.98 ? 2 : 3;
    var tabla = { 1: [1, 1.05, 1.10, 1.20], 2: [1, 1.05, 1.10, 1.20], 3: [1.5882, 1.6676, 1.7471, 1.9059], 4: [2, 2.1, 2.2, 2.4] };
    return tabla[grupo][t];
  }

  function wireIsdCalc() {
    var calc = document.querySelector(".rcalc.isdcalc");
    if (!calc) return;
    var g = function (s) { return calc.querySelector(s); };
    function n(sel) { var e = g(sel); var v = parseFloat((e && e.value || "").replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }
    var btn = g("[data-h-run]"), res = calc.querySelector(".calc-result");

    // rellenar el selector de comunidad
    var sel = g("[data-h-ccaa]");
    if (sel && !sel.options.length) {
      Object.keys(ISD_CCAA).forEach(function (k) {
        var o = document.createElement("option"); o.value = k; o.textContent = ISD_CCAA[k].n; sel.appendChild(o);
      });
    }

    function run() {
      var caudal = n("[data-h-caudal]");         // lo que recibe ESTE heredero
      var empresa = n("[data-h-empresa]");        // parte que es empresa familiar/participaciones
      var patr = n("[data-h-patrimonio]");        // patrimonio preexistente del heredero
      var edad = n("[data-h-edad]");
      var rel = g("[data-h-rel]").value;
      var k = sel.value, C = ISD_CCAA[k];
      var grupo = ISD_GRUPO[rel];

      // Reducción de empresa familiar (sobre la parte que sea empresa)
      var redEmpresa = Math.min(empresa, caudal) * (C.emp / 100);
      // Reducción por parentesco: estatal + autonómica (la autonómica sustituye/mejora)
      var redEstatal = ISD_RED_ESTATAL[rel] || 0;
      if (rel === "hijoMenor") redEstatal = Math.min(47858.59, 15956.87 + 3990.72 * Math.max(0, 21 - edad));
      var redParentesco = (grupo <= 2) ? Math.max(redEstatal, C.red) : redEstatal;

      var base = Math.max(0, caudal - redEmpresa - redParentesco);
      var cuotaIntegra = tarifa(base, ISD_ESCALA);
      var coef = coefISD(grupo, patr);
      var cuotaCorregida = cuotaIntegra * coef;

      var bon = C.bon, notaBon = "";
      if (bon === -1) { bon = bonifCLM(base); notaBon = "Bonificación decreciente aplicada: " + bon + " % (tramo de base liquidable)."; }
      else if (bon === -2) { bon = (rel === "conyuge") ? 99 : 0; notaBon = (rel === "conyuge") ? "Cónyuge: 99 %." : "Para descendientes, la bonificación catalana es decreciente y NO se aplica en este cálculo: el resultado real será MENOR."; }
      if (grupo >= 4) { bon = 0; notaBon = "Grupo IV (no parientes): sin bonificación en la práctica totalidad de comunidades."; }
      if (grupo === 3 && k !== "canarias" && k !== "madrid" && k !== "baleares") { bon = 0; notaBon = "Grupo III: esta comunidad no bonifica a colaterales (Canarias, Madrid y Baleares sí, total o parcialmente)."; }
      var cuotaFinal = cuotaCorregida * (1 - bon / 100);
      var tipoEfectivo = caudal > 0 ? cuotaFinal / caudal : 0;

      var html = '<div class="seg"><span class="tag">Cuota estimada · ' + C.n + '</span><span class="name wine">' + eurE(cuotaFinal) + '</span></div>';
      html += '<div class="money">' +
        '<div class="m"><div class="k">Base liquidable</div><div class="v">' + eurE(base) + '</div></div>' +
        '<div class="m"><div class="k">Bonificación aplicada</div><div class="v wine">' + bon + ' %</div></div>' +
        '<div class="m"><div class="k">Tipo efectivo sobre lo heredado</div><div class="v">' + pctE(tipoEfectivo) + '</div></div>' +
        '</div>';
      html += '<table class="tbl" style="margin:.9rem 0"><tbody>' +
        '<tr><td>Valor recibido por este heredero</td><td><strong>' + eurE(caudal) + '</strong></td></tr>' +
        (redEmpresa > 0 ? '<tr><td>− Reducción de empresa familiar (' + C.emp + ' %)</td><td>−' + eurE(redEmpresa) + '</td></tr>' : '') +
        '<tr><td>− Reducción por parentesco aplicada</td><td>−' + eurE(redParentesco) + '</td></tr>' +
        '<tr><td><strong>Base liquidable</strong></td><td><strong>' + eurE(base) + '</strong></td></tr>' +
        '<tr><td>Cuota íntegra (escala estatal)</td><td>' + eurE(cuotaIntegra) + '</td></tr>' +
        '<tr><td>× Coeficiente por patrimonio preexistente y grupo (' + coef.toFixed(4) + ')</td><td>' + eurE(cuotaCorregida) + '</td></tr>' +
        '<tr><td>− Bonificación autonómica (' + bon + ' %)</td><td>−' + eurE(cuotaCorregida * bon / 100) + '</td></tr>' +
        '<tr><td><strong>Cuota a ingresar</strong></td><td><strong>' + eurE(cuotaFinal) + '</strong></td></tr>' +
        '</tbody></table>';
      html += '<div class="flag"><strong>' + C.n + ':</strong> ' + C.nota + (notaBon ? ' ' + notaBon : '') + '</div>';
      if (redEmpresa > 0) html += '<div class="flag">La reducción de empresa familiar exige <strong>mantener la adquisición</strong> (10 años en la norma estatal; 5 en la mayoría de comunidades, 3 en Andalucía) y no realizar actos que minoren sustancialmente su valor. Si se incumple: impuesto dejado de ingresar más intereses.</div>';
      html += '<p class="note" style="margin-top:.7rem">Estimación orientativa: aplica la <strong>escala y los coeficientes estatales</strong>. Madrid, Cataluña, Andalucía, C. Valenciana, Galicia, Asturias, Cantabria, Baleares y Murcia tienen <strong>tarifa propia</strong>, por lo que el resultado real diferirá (a la baja en Galicia y Baleares; al alza en Asturias y Murcia). Verifica siempre la norma vigente.</p>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_isd");
    }
    if (btn) btn.addEventListener("click", run);
  }


  /* ======================================================================
     PARTE 5 · IMPOSICIÓN INDIRECTA E INTERCONEXIÓN
     ====================================================================== */

  // Tipos verificados: AJD documentos notariales (general y agravado por renuncia
  // a la exención del IVA, art. 20.Dos LIVA) + TPO general de inmuebles.
  var IND_CCAA = {
    andalucia:  { n: "Andalucía",        tpo: 7,    ajd: 1.2,  ajdR: null, norma: "Ley 5/2021, art. 49" },
    aragon:     { n: "Aragón",           tpo: 8,    ajd: 1.5,  ajdR: 2,    norma: "DL 1/2005, arts. 122-1 y 122-2" },
    asturias:   { n: "Asturias",         tpo: 8,    ajd: 1.2,  ajdR: 1.5,  norma: "DL 2/2014, arts. 34 y 36" },
    baleares:   { n: "Baleares",         tpo: 8,    ajd: 1.5,  ajdR: 2.5,  norma: "DL 1/2014, arts. 15 y 19" },
    canarias:   { n: "Canarias",         tpo: 6.5,  ajd: 1,    ajdR: null, norma: "DL 1/2009, art. 36 (IGIC)" },
    cantabria:  { n: "Cantabria",        tpo: 9,    ajd: 1.5,  ajdR: 2,    norma: "DL 62/2008, art. 13" },
    clm:        { n: "Castilla-La Mancha", tpo: 9,  ajd: 1.5,  ajdR: 2.5,  norma: "Ley 8/2013, art. 21" },
    cyl:        { n: "Castilla y León",  tpo: 8,    ajd: 1.5,  ajdR: 2,    norma: "DL 1/2013, arts. 24 y 26" },
    cataluna:   { n: "Cataluña",         tpo: 10,   ajd: null, ajdR: null, norma: "NO VERIFICADO en texto consolidado" },
    extremadura:{ n: "Extremadura",      tpo: 8,    ajd: 1.5,  ajdR: 3,    norma: "DL 1/2018, arts. 46 y 51" },
    galicia:    { n: "Galicia",          tpo: 8,    ajd: 1.5,  ajdR: 2,    norma: "DL 1/2011, art. 15" },
    madrid:     { n: "Madrid",           tpo: 6,    ajd: 0.75, ajdR: 1.5,  norma: "DL 1/2010, arts. 35 y 36" },
    murcia:     { n: "Murcia",           tpo: 8,    ajd: 1.5,  ajdR: 2.5,  norma: "DL 1/2010, art. 7" },
    larioja:    { n: "La Rioja",         tpo: 7,    ajd: 1,    ajdR: 1.5,  norma: "Ley 10/2017, arts. 48 y 52" },
    valencia:   { n: "C. Valenciana",    tpo: 10,   ajd: 1.4,  ajdR: 2,    norma: "Ley 13/1997, art. 14" }
  };

  // Catálogo de activos: régimen en IVA y tipo aplicable
  var IND_ACTIVOS = {
    viv_nueva:  { n: "Vivienda · 1.ª entrega del promotor", iva: 10, exento: false, viv: true,  art: "art. 20.Uno.22.º (no hay 2.ª entrega) · tipo art. 91.Uno.1.7.º" },
    vpo:        { n: "VPO régimen especial o promoción pública (del promotor)", iva: 4, exento: false, viv: true, art: "tipo art. 91.Dos.1.6.º (máx. 2 plazas de garaje)" },
    viv_usada:  { n: "Vivienda · 2.ª o ulterior entrega", iva: 10, exento: true, viv: true, art: "exenta art. 20.Uno.22.º" },
    local_1:    { n: "Local, nave u oficina · 1.ª entrega", iva: 21, exento: false, viv: false, art: "sujeta y no exenta · tipo general art. 90.Uno" },
    local_2:    { n: "Local, nave u oficina · 2.ª o ulterior entrega", iva: 21, exento: true, viv: false, art: "exenta art. 20.Uno.22.º" },
    solar:      { n: "Solar o suelo urbanizado / en curso de urbanización", iva: 21, exento: false, viv: false, art: "excepción a la exención: art. 20.Uno.20.º a)" },
    rustico:    { n: "Terreno rústico o no edificable", iva: 21, exento: true, viv: false, art: "exenta art. 20.Uno.20.º" },
    demolicion: { n: "Edificación para demolición previa a nueva promoción", iva: 21, exento: false, viv: false, art: "excepción art. 20.Uno.22.º A) c)" },
    rehab:      { n: "Edificación para rehabilitación por el adquirente", iva: 21, exento: false, viv: false, art: "excepción art. 20.Uno.22.º A) b)" }
  };

  function wireIndirecta() {
    var calc = document.querySelector(".rcalc.indirecta");
    if (!calc) return;
    var g = function (s) { return calc.querySelector(s); };
    function n(sel) { var e = g(sel); var v = parseFloat((e && e.value || "").replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }
    var btn = g("[data-x-run]"), res = calc.querySelector(".calc-result");

    var selC = g("[data-x-ccaa]");
    if (selC && !selC.options.length) {
      Object.keys(IND_CCAA).forEach(function (k) {
        var o = document.createElement("option"); o.value = k; o.textContent = IND_CCAA[k].n; selC.appendChild(o);
      });
      selC.value = "madrid";
    }
    var selA = g("[data-x-activo]");
    if (selA && !selA.options.length) {
      Object.keys(IND_ACTIVOS).forEach(function (k) {
        var o = document.createElement("option"); o.value = k; o.textContent = IND_ACTIVOS[k].n; selA.appendChild(o);
      });
    }
    var wrapPro = g("[data-x-wrap-prorrata]");
    function toggle() {
      var adq = g("[data-x-adq]").value;
      if (wrapPro) wrapPro.style.display = (adq === "emp_parcial") ? "" : "none";
    }
    var selAdq = g("[data-x-adq]");
    if (selAdq) selAdq.addEventListener("change", toggle);
    toggle();

    function run() {
      var imp = n("[data-x-importe]");
      var trans = g("[data-x-trans]").value;      // particular | empresario
      var ak = selA.value, A = IND_ACTIVOS[ak];
      var adq = selAdq.value;                     // particular | emp_total | emp_parcial
      var pro = adq === "emp_total" ? 100 : (adq === "emp_parcial" ? Math.min(100, Math.max(0, n("[data-x-prorrata]"))) : 0);
      var ck = selC.value, C = IND_CCAA[ck];
      var quiere = g("[data-x-renuncia]").value === "si";

      var rows = [], titulo = "", avisos = [], costeNoRec = 0, salida = 0;
      var ajdGen = C.ajd, ajdRen = C.ajdR;

      function fila(k, v, nota) { rows.push({ k: k, v: v, nota: nota || "" }); }

      if (trans === "particular") {
        // Fuera del ámbito del IVA: no hay entrega empresarial (art. 5.Uno LIVA)
        titulo = "TPO — Transmisiones Patrimoniales Onerosas";
        var tpo = imp * C.tpo / 100;
        fila("IVA", "No procede", "El transmitente no es empresario ni profesional (art. 5.Uno LIVA): la operación queda fuera del IVA.");
        fila("TPO al " + C.tpo.toString().replace(".", ",") + " %", eurE(tpo), "Art. 7.1.A) TRLITPAJD. Paga el <strong>adquirente</strong> (art. 8.a). Tipo general de " + C.n + ".");
        fila("AJD cuota gradual", "Incompatible", "El acto está sujeto a TPO, así que no se devenga la cuota gradual (art. 31.2, requisito de no sujeción a TPO). Sí se paga la cuota fija por folio (art. 31.1).");
        costeNoRec = tpo; salida = tpo;
        avisos.push("Base imponible: el <strong>valor de referencia</strong> del Catastro salvo que el declarado o el precio sean superiores (art. 10.2 TRLITPAJD). Si la base es el valor de referencia, la Administración <strong>no puede comprobar valores</strong> (art. 46.1).");
      } else if (!A.exento) {
        // IVA sujeto y no exento + AJD gradual
        titulo = "IVA sujeto y no exento + AJD cuota gradual";
        var iva = imp * A.iva / 100;
        var ivaDed = iva * pro / 100, ivaCoste = iva - ivaDed;
        var ajd = (ajdGen === null) ? null : imp * ajdGen / 100;
        fila("IVA al " + A.iva + " %", eurE(iva), A.art + ". Lo repercute el transmitente y lo <strong>paga en efectivo</strong> el adquirente.");
        fila("IVA deducible", eurE(ivaDed) + (pro < 100 ? " (prorrata " + pro + " %)" : ""), pro === 0 ? "El adquirente no es empresario: el IVA es <strong>coste puro</strong>." : "Arts. 92 y ss. LIVA. Sólo es coste la parte no deducible.");
        fila("AJD cuota gradual" + (ajdGen === null ? "" : " al " + ajdGen.toString().replace(".", ",") + " %"), ajd === null ? "NO VERIFICADO" : eurE(ajd), "Art. 31.2: primera copia, cantidad valuable, inscribible y no sujeta a TPO ni a OS. " + C.norma + ".");
        costeNoRec = ivaCoste + (ajd || 0); salida = iva + (ajd || 0);
        if (pro === 100) avisos.push("Con derecho a deducción plena, el IVA es <strong>financiación, no coste</strong>: sale y vuelve. El coste real de la operación es sólo el AJD.");
      } else {
        // Exenta: TPO por defecto, o renuncia
        var puedeRenunciar = (adq !== "particular") && pro > 0;
        var tipoRen = A.viv ? 10 : 21;
        var tpo2 = imp * C.tpo / 100;
        var ivaR = imp * tipoRen / 100, ivaRDed = ivaR * pro / 100, ivaRCoste = ivaR - ivaRDed;
        var ajdR = (ajdRen === null ? ajdGen : ajdRen);
        var ajdRCuota = (ajdR === null) ? null : imp * ajdR / 100;
        var costeSin = tpo2, costeCon = ivaRCoste + (ajdRCuota || 0);

        if (quiere && puedeRenunciar) {
          titulo = "Renuncia a la exención: IVA con inversión del sujeto pasivo + AJD agravado";
          fila("IVA al " + tipoRen + " %", eurE(ivaR), "Renuncia del art. 20.Dos LIVA. Con <strong>inversión del sujeto pasivo</strong> (art. 84.Uno.2.º e): lo autoliquida el adquirente, sin pago al vendedor.");
          fila("IVA deducible", eurE(ivaRDed) + (pro < 100 ? " (prorrata " + pro + " %)" : ""), pro === 100 ? "Deducción íntegra: el IVA no es coste." : "Sólo se recupera la parte deducible; el resto es coste definitivo.");
          fila("AJD " + (ajdRen === null ? "general" : "agravado") + (ajdR === null ? "" : " al " + ajdR.toString().replace(".", ",") + " %"), ajdRCuota === null ? "NO VERIFICADO" : eurE(ajdRCuota), ajdRen === null ? C.n + " no regula un tipo agravado por renuncia: se aplica el general. " + C.norma + "." : "Tipo incrementado por renuncia. " + C.norma + ".");
          fila("TPO", "No procede", "Al renunciar, la operación es una entrega sujeta y no exenta de IVA: no hay TPO (art. 18.1 TRLITPAJD).");
          costeNoRec = costeCon; salida = ivaR + (ajdRCuota || 0);
        } else {
          titulo = "Entrega exenta de IVA → TPO";
          fila("IVA", "Exento", A.art + ". La exención es la que abre la puerta al TPO (art. 4.Cuatro LIVA y art. 7.5 TRLITPAJD).");
          fila("TPO al " + C.tpo.toString().replace(".", ",") + " %", eurE(tpo2), "Coste <strong>no recuperable</strong> para el adquirente, aunque sea empresario. " + C.n + ".");
          fila("AJD cuota gradual", "Incompatible", "Sujeto a TPO: no se devenga la cuota gradual (art. 31.2).");
          costeNoRec = costeSin; salida = tpo2;
          if (quiere && !puedeRenunciar) avisos.push("<strong>No se puede renunciar</strong>: el art. 20.Dos exige que el adquirente sea sujeto pasivo con derecho a la deducción total o parcial, o que por su destino previsible vaya a usar el bien en operaciones con derecho a deducción.");
        }

        if (puedeRenunciar && ajdR !== null) {
          var mejor = costeCon < costeSin ? "renunciar" : "no renunciar";
          var dif = Math.abs(costeCon - costeSin);
          avisos.push("<strong>Comparativa de la renuncia:</strong> sin renuncia el coste fiscal no recuperable es " + eurE(costeSin) + " (TPO); con renuncia, " + eurE(costeCon) + " (IVA no deducible + AJD). Con estos datos interesa <strong>" + mejor + "</strong>: diferencia de " + eurE(dif) + ".");
          if (pro < 100 && pro > 0) avisos.push("Ojo a la prorrata: con un porcentaje de deducción del " + pro + " %, cada punto de prorrata mueve " + eurE(ivaR / 100) + " de coste. La renuncia sólo compensa cuando la prorrata es alta.");
        }
        if (A.viv) avisos.push("En vivienda usada la renuncia rara vez es viable: si el destino es el <strong>arrendamiento de vivienda</strong>, esa actividad está exenta (art. 20.Uno.23.º b) y no genera derecho a deducción.");
      }

      avisos.push("La cuota fija de AJD (0,30 € por pliego o 0,15 € por folio, art. 31.1) se devenga <strong>siempre</strong> y ningún beneficio fiscal la alcanza (art. 45.II).");

      var html = '<div class="seg"><span class="tag">Régimen aplicable</span><span class="name wine">' + titulo + '</span></div>';
      html += '<div class="money">' +
        '<div class="m"><div class="k">Coste fiscal no recuperable</div><div class="v wine">' + eurE(costeNoRec) + '</div></div>' +
        '<div class="m"><div class="k">Sobre el importe</div><div class="v">' + pctE(imp > 0 ? costeNoRec / imp : 0) + '</div></div>' +
        '<div class="m"><div class="k">Salida de caja inicial</div><div class="v">' + eurE(salida) + '</div></div>' +
        '</div>';
      html += '<table class="tbl"><thead><tr><th>Concepto</th><th>Importe</th><th>Fundamento</th></tr></thead><tbody>';
      rows.forEach(function (r) { html += '<tr><td><strong>' + r.k + '</strong></td><td>' + r.v + '</td><td>' + r.nota + '</td></tr>'; });
      html += '</tbody></table>';
      avisos.forEach(function (a) { html += '<div class="flag">' + a + '</div>'; });
      if (C.ajd === null) html += '<div class="flag"><strong>Cataluña:</strong> no he podido verificar el tipo de AJD en texto consolidado, por lo que el cálculo de AJD no se muestra. Consulta la norma catalana vigente antes de usar el dato.</div>';
      html += '<p class="note" style="margin-top:.7rem">Estimación orientativa sobre el importe declarado. No incluye tipos reducidos por vivienda habitual, edad, familia numerosa o discapacidad, ni los tipos agravados por valor elevado (Baleares, Cataluña). Verifica siempre la norma autonómica vigente.</p>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_indirecta");
    }
    if (btn) btn.addEventListener("click", run);
  }

  /* ---------- Simulador de cadena fiscal (interconexión) ---------- */

  var CADENA_OPS = {
    venta_pf:   "Persona física vende un inmueble usado",
    venta_soc:  "Sociedad vende un inmueble y reparte el beneficio al socio",
    donacion:   "Donación de un inmueble a un hijo",
    herencia:   "El hijo hereda el mismo inmueble",
    aportacion: "Aportar un inmueble a una sociedad",
    venta_part: "Vender las participaciones de una sociedad con inmuebles",
    disolucion: "Disolver la sociedad y adjudicar el inmueble al socio"
  };

  function wireCadena() {
    var calc = document.querySelector(".rcalc.cadena");
    if (!calc) return;
    var g = function (s) { return calc.querySelector(s); };
    function n(sel) { var e = g(sel); var v = parseFloat((e && e.value || "").replace(/[^0-9.]/g, "")); return isNaN(v) ? 0 : v; }
    var btn = g("[data-k-run]"), res = calc.querySelector(".calc-result");

    var selOp = g("[data-k-op]");
    if (selOp && !selOp.options.length) {
      Object.keys(CADENA_OPS).forEach(function (k) {
        var o = document.createElement("option"); o.value = k; o.textContent = CADENA_OPS[k]; selOp.appendChild(o);
      });
    }
    var selC = g("[data-k-ccaa]");
    if (selC && !selC.options.length) {
      Object.keys(IND_CCAA).forEach(function (k) {
        var o = document.createElement("option"); o.value = k; o.textContent = IND_CCAA[k].n; selC.appendChild(o);
      });
      selC.value = "madrid";
    }

    function run() {
      var op = selOp.value;
      var vt = n("[data-k-valor]");        // valor de mercado / transmisión
      var va = n("[data-k-adq]");          // valor de adquisición
      var pl = n("[data-k-plus]");         // cuota estimada de plusvalía municipal
      var afecto = g("[data-k-afecto]").value === "si";
      var ck = selC.value, C = IND_CCAA[ck];
      var ganancia = Math.max(0, vt - va);
      var filas = [], notas = [], costeAhora = 0, costeDiferido = 0;

      function f(imp, quien, base, cuota, art, nota, cuenta) {
        filas.push({ imp: imp, quien: quien, base: base, cuota: cuota, art: art, nota: nota || "" });
        if (cuenta !== false && typeof cuota === "number") costeAhora += cuota;
      }
      var IS = 0.25;

      if (op === "venta_pf") {
        var irpf = escalaAhorro(ganancia);
        f("IRPF · ganancia patrimonial", "Transmitente", ganancia, irpf, "arts. 33, 35 y 46 LIRPF", "Base del ahorro: 19 %–28 %. Los gastos y tributos inherentes suman al valor de adquisición y restan del de transmisión (art. 35).");
        f("TPO", "Adquirente", vt, vt * C.tpo / 100, "art. 7.1.A) y 11 TRLITPAJD", "Tipo general de " + C.n + " (" + C.tpo.toString().replace(".", ",") + " %). Base: valor de referencia salvo precio superior (art. 10.2).");
        f("Plusvalía municipal (IIVTNU)", "Transmitente", "Valor del suelo", pl, "arts. 104 y 107 TRLRHL", pl ? "Cuota que has introducido." : "No la has estimado: pídela al ayuntamiento o calcúlala con la ordenanza. Si no hay incremento real, no hay sujeción (art. 104.5).");
        f("IVA / AJD gradual", "—", "—", 0, "art. 5.Uno LIVA", "El vendedor particular está fuera del IVA y, al haber TPO, no hay cuota gradual de AJD.", false);
        notas.push("Si el transmitente tiene <strong>más de 65 años</strong> y es su vivienda habitual, la ganancia está exenta (art. 33.4.b). Si no lo es, puede excluirse constituyendo una <strong>renta vitalicia asegurada</strong> en 6 meses, con un máximo de 240.000 € (art. 38.3).");
        notas.push("Reinversión en vivienda habitual: exención total o parcial del art. 38.1. Es la palanca más barata y la más olvidada.");
      }

      if (op === "venta_soc") {
        var is = ganancia * IS;
        f("Impuesto sobre Sociedades", "Sociedad", ganancia, is, "arts. 10 y 29 LIS", "Tipo general 25 % sobre el beneficio contable de la venta. Si la sociedad es patrimonial no accede al tipo reducido de micro/ERD.");
        var neto = vt - is;
        var divid = escalaAhorro(Math.max(0, neto));
        f("IRPF del socio al repartir el dividendo", "Socio", neto, divid, "art. 25.1 LIRPF", "Segunda capa. Sin exención del art. 21 LIS: esa exención es para dividendos entre sociedades, no para el socio persona física.", false);
        costeDiferido += divid;
        f("TPO o IVA + AJD del comprador", "Adquirente", vt, null, "arts. 20.Uno.22.º LIVA / 7.5 y 31.2 TRLITPAJD", "Depende de si es 1.ª o 2.ª entrega y de si se renuncia a la exención: usa la calculadora de delimitación.", false);
        f("Plusvalía municipal", "Sociedad", "Valor del suelo", pl, "art. 104 TRLRHL", "");
        notas.push("El coste total hasta el bolsillo del socio es <strong>" + eurE(is + divid + pl) + "</strong>: " + eurE(is) + " de IS, " + eurE(divid) + " de IRPF del dividendo y " + eurE(pl) + " de plusvalía. La doble capa es la razón por la que muchas veces conviene <strong>no sacar el dinero</strong> de la sociedad y reinvertir dentro.");
      }

      if (op === "donacion") {
        var irpfD = escalaAhorro(ganancia);
        f("IRPF del donante · ganancia patrimonial", "Donante", ganancia, irpfD, "arts. 33.5.c) y 36 LIRPF", "El donante tributa por la plusvalía aunque no cobre nada. Y si hubiera pérdida, <strong>no es computable</strong> (art. 33.5.c).");
        var baseISD = vt;
        var isd = tarifa(baseISD, ISD_ESCALA) * coefISD(2, 0);
        f("ISD · donación", "Donatario", baseISD, isd, "arts. 9.3, 20.6 y 21 LISD", "Cálculo con la <strong>escala estatal</strong> y coeficiente del Grupo II, sin reducciones: en muchas comunidades hay bonificaciones del 95 %–99 % o tarifas propias, así que el resultado real puede ser mucho menor. Base: valor de referencia (art. 9.3).");
        f("Plusvalía municipal", "Donante", "Valor del suelo", pl, "art. 104 TRLRHL", "En donación sí se devenga y no hay bonificación estatal por mortis causa.");
        notas.push("El valor declarado a efectos del ISD será el <strong>valor de adquisición</strong> del donatario en un IRPF futuro (art. 36): declarar bajo ahorra ISD hoy y encarece el IRPF de mañana. Es el nudo de la valoración.");
        notas.push("Si lo donado fuera una empresa o participaciones con derecho a la reducción del art. 20.6 LISD, el donante <strong>no tributaría</strong> en IRPF (art. 33.3.c) y el donatario se subrogaría en su valor y fecha de adquisición (art. 36). El diferencial frente a este cálculo es la mejor demostración de por qué la estructura importa.");
      }

      if (op === "herencia") {
        f("IRPF del causante", "—", ganancia, 0, "art. 33.3.b) LIRPF", "<strong>Plusvalía del muerto</strong>: no existe ganancia ni pérdida. La plusvalía histórica desaparece.");
        var isdH = tarifa(Math.max(0, vt - 15956.87), ISD_ESCALA) * coefISD(2, 0);
        f("ISD · sucesión", "Heredero", Math.max(0, vt - 15956.87), isdH, "arts. 9.3, 20.2 y 21 LISD", "Escala estatal con la reducción de parentesco del Grupo II (15.956,87 €) y sin mejoras autonómicas: usa la calculadora de la Parte 4 para el dato por comunidad.");
        var plH = pl * 0.05;
        f("Plusvalía municipal", "Heredero", "Valor del suelo", plH, "art. 108.4 TRLRHL", "Las ordenanzas pueden bonificar <strong>hasta el 95 %</strong> en transmisiones mortis causa a descendientes, cónyuge y ascendientes. Aquí se ha aplicado la bonificación máxima sobre la cuota que has introducido: comprueba tu ordenanza.");
        var stepUp = ganancia * 0.21;
        notas.push("<strong>Step-up:</strong> el heredero parte del valor declarado en el ISD. Sobre una plusvalía latente de " + eurE(ganancia) + ", el ahorro de IRPF futuro ronda " + eurE(stepUp) + " (al 21 % de la base del ahorro). Ese ahorro es el argumento técnico que compara herencia contra donación.");
        notas.push("Comparación directa con la donación de arriba: mismos valores, tres impuestos distintos moviéndose en sentidos opuestos. Cambia sólo el momento y el título.");
      }

      if (op === "aportacion") {
        var mayor = Math.max(vt, va);
        var irpfA = escalaAhorro(Math.max(0, mayor - va));
        f("IRPF del aportante", "Socio aportante", Math.max(0, mayor - va), irpfA, "art. 37.1.d) LIRPF", "Aportar no es gratis: hay ganancia por la diferencia entre el valor de adquisición y el mayor de (nominal + prima, cotización, valor de mercado del bien).");
        f("Operaciones Societarias", "Sociedad", vt, 0, "arts. 19.1.1.º y 45.I.B).11 TRLITPAJD", "Constitución y aumento de capital están <strong>exentos</strong> de OS desde 2010. Cuota: 0 €.");
        f("TPO", "—", "—", 0, "art. 1.2 TRLITPAJD", "Incompatible con OS: no hay TPO en la aportación.", false);
        f("AJD cuota gradual", "—", "—", 0, "art. 31.2 TRLITPAJD", "No se devenga: el acto está sujeto a OS (aunque exento).", false);
        f("Plusvalía municipal", "Aportante", "Valor del suelo", pl, "art. 104 TRLRHL", "Sí se devenga: la aportación es transmisión a efectos del IIVTNU.");
        notas.push("Aportar es <strong>baratísimo en imposición indirecta</strong> y caro en IRPF y plusvalía municipal. El error clásico es mirar sólo el ITPAJD.");
        notas.push("<strong>Trampa de los tres años:</strong> si en los 3 años siguientes se venden las participaciones recibidas por la aportación del inmueble y éste no está afecto a una actividad, se presume elusión y la venta tributa como transmisión de inmuebles (art. 338.2.c) de la Ley 6/2023).");
        if (!afecto) notas.push("Has indicado que el inmueble <strong>no está afecto</strong> a actividad económica: la sociedad será probablemente <strong>patrimonial</strong> (art. 5.2 LIS), lo que arrastra la pérdida de la exención de empresa familiar en IP, de la reducción del 95 % en ISD y de los tipos reducidos en IS. Un solo hecho, cuatro impuestos.");
      }

      if (op === "venta_part") {
        var irpfP = escalaAhorro(ganancia);
        f("IRPF · ganancia por venta de participaciones", "Socio", ganancia, irpfP, "art. 37.1.b) LIRPF", "Si no cotizan, el valor de transmisión no puede ser inferior al mayor de: patrimonio neto del último balance cerrado, o capitalización al 20 % del promedio de resultados de los tres últimos ejercicios (salvo prueba de valor de mercado).");
        if (!afecto) {
          var tpoP = vt * C.tpo / 100;
          f("TPO por la norma antielusiva", "Adquirente", vt, tpoP, "art. 338.2 Ley 6/2023", "Al ser un activo mayoritariamente inmobiliario <strong>no afecto</strong> y transmitirse el control, se presume elusión (salvo prueba en contrario) y tributa como transmisión de inmuebles. Base proporcional según el art. 338.3.");
          notas.push("Control = participación directa o indirecta <strong>superior al 50 %</strong>, computando el grupo (art. 338.3.2.ª). La presunción es <em>iuris tantum</em>: se puede probar que no hay ánimo elusorio, pero la carga es del contribuyente.");
        } else {
          f("TPO / IVA", "—", "—", 0, "art. 338.1 Ley 6/2023", "Transmisión de valores <strong>exenta</strong> de IVA y de ITPAJD. Al estar los inmuebles afectos a una actividad económica, no entra la excepción antielusiva del art. 338.2.");
          notas.push("Aquí se ve el valor de la afectación: el mismo paquete de participaciones puede pasar de exento a tributar como transmisión de inmuebles sólo por cómo estén los activos.");
        }
        f("Plusvalía municipal", "—", "—", 0, "art. 104 TRLRHL", "No hay transmisión del inmueble: no se devenga. Ventaja estructural de vender la sociedad en lugar del activo.", false);
        notas.push("Cuidado con la <strong>referencia normativa</strong>: la clásica cita del art. 108 de la Ley del Mercado de Valores y el posterior art. 314 del TRLMV han quedado sustituidas por el <strong>art. 338 de la Ley 6/2023</strong>. Citar la norma derogada en un informe es un error que se ve.");
      }

      if (op === "disolucion") {
        var isD = ganancia * IS;
        f("Impuesto sobre Sociedades", "Sociedad", ganancia, isD, "art. 17.4 y 5 LIS", "La adjudicación a los socios se valora a <strong>valor de mercado</strong>: la sociedad tributa por la plusvalía latente aunque no venda a un tercero.");
        var osD = vt * 0.01;
        f("Operaciones Societarias al 1 %", "Socio adjudicatario", vt, osD, "arts. 19.1.1.º, 23.b), 25.4 y 26 TRLITPAJD", "La disolución y la reducción de capital <strong>no están exentas</strong> (a diferencia de la constitución y el aumento). Base: valor de los bienes entregados, sin deducir deudas.");
        var irpfL = escalaAhorro(Math.max(0, vt - va));
        f("IRPF del socio por la liquidación", "Socio", Math.max(0, vt - va), irpfL, "art. 37.1.e) LIRPF", "Ganancia por la diferencia entre el valor de mercado de lo recibido y el valor de adquisición de las participaciones.");
        f("Plusvalía municipal", "Sociedad", "Valor del suelo", pl, "art. 104 TRLRHL", "");
        notas.push("Deshacer una estructura cuesta mucho más que crearla: constituir y aportar está exento de OS; disolver paga el 1 % <strong>más</strong> IS <strong>más</strong> IRPF del socio <strong>más</strong> plusvalía. Antes de montar una sociedad, calcula siempre el coste de salida.");
        notas.push("Si el objetivo es reorganizar y no liquidar, mira las <strong>operaciones de reestructuración</strong>: no sujetas a OS (art. 19.2.1.º) y además exentas de TPO y AJD (art. 45.I.B).10), con el régimen de neutralidad del IS.");
      }

      var html = '<div class="seg"><span class="tag">' + CADENA_OPS[op] + '</span><span class="name wine">' + eurE(costeAhora) + ' de coste fiscal inmediato</span></div>';
      html += '<div class="money">' +
        '<div class="m"><div class="k">Impuestos que se activan</div><div class="v">' + filas.filter(function (r) { return typeof r.cuota === "number" && r.cuota > 0; }).length + ' de ' + filas.length + '</div></div>' +
        '<div class="m"><div class="k">Coste inmediato</div><div class="v wine">' + eurE(costeAhora) + '</div></div>' +
        '<div class="m"><div class="k">Coste diferido estimado</div><div class="v">' + (costeDiferido > 0 ? eurE(costeDiferido) : "—") + '</div></div>' +
        '</div>';
      html += '<table class="tbl"><thead><tr><th>Impuesto</th><th>Quién paga</th><th>Base</th><th>Cuota</th><th>Norma y por qué</th></tr></thead><tbody>';
      filas.forEach(function (r) {
        var b = (typeof r.base === "number") ? eurE(r.base) : r.base;
        var c = (r.cuota === null) ? "según caso" : (typeof r.cuota === "number" ? eurE(r.cuota) : r.cuota);
        html += '<tr><td><strong>' + r.imp + '</strong></td><td>' + r.quien + '</td><td>' + b + '</td><td class="wine"><strong>' + c + '</strong></td><td>' + r.art + (r.nota ? ' · ' + r.nota : '') + '</td></tr>';
      });
      html += '</tbody></table>';
      notas.forEach(function (x) { html += '<div class="flag">' + x + '</div>'; });
      html += '<p class="note" style="margin-top:.7rem">Estimación orientativa y didáctica: usa la escala estatal del ahorro para el IRPF, el 25 % en IS, la escala estatal del ISD sin mejoras autonómicas y el tipo general de TPO de la comunidad. Sirve para <strong>ver la cadena y su orden de magnitud</strong>, no para liquidar. Cada impuesto tiene su calculadora específica en las Partes 1 a 4.</p>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_cadena");
    }
    if (btn) btn.addEventListener("click", run);
  }


  /* ======================================================================
     MÓDULO 4 · ESTRUCTURAS Y OPERACIONES COMPLEJAS
     ====================================================================== */

  /* ---------- 1. Test de encaje en el régimen de neutralidad fiscal ---------- */
  var NEUT_OPS = {
    fusion: {
      n: "Fusión (por absorción, por nueva sociedad o impropia)",
      art: "art. 76.1 LIS · arts. 33 y ss. RDL 5/2023",
      req: [
        { q: "Hay transmisión en bloque del patrimonio con disolución sin liquidación de la transmitente (o absorción de una participada al 100 %)", crit: true, art: "art. 76.1 a), b) y c)" },
        { q: "La compensación en dinero a los socios no excede del 10 % del valor nominal de los valores entregados", crit: true, art: "art. 76.1" },
        { q: "La entidad adquirente es residente en España, o los elementos quedan afectos a un establecimiento permanente en España", crit: true, art: "art. 77.1 a)" },
        { q: "La adquirente no está exenta del Impuesto sobre Sociedades ni sometida al régimen de atribución de rentas", crit: true, art: "art. 77.1, párrafo final" },
        { q: "No intervienen entidades domiciliadas o establecidas en paraísos fiscales", crit: true, art: "art. 81.4" },
        { q: "Si la adquirente participa en la transmitente, la participación es de al menos el 5 % (si es inferior, la renta de la anulación SÍ se integra)", crit: false, art: "art. 82.1 y 82.2" },
        { q: "Se ha comprobado el efecto sobre las bases imponibles negativas: sólo se transmiten si hay extinción de la transmitente o transmisión de la rama que las generó, y se minoran por la diferencia entre aportaciones y valor fiscal si hay participación previa o grupo", crit: false, art: "art. 84.2" }
      ]
    },
    escision_total: {
      n: "Escisión total proporcional",
      art: "art. 76.2.1.º a) LIS · art. 59 RDL 5/2023",
      req: [
        { q: "Se divide la totalidad del patrimonio en dos o más partes que se transmiten en bloque, con extinción de la escindida", crit: true, art: "art. 76.2.1.º a)" },
        { q: "Los socios reciben valores de las beneficiarias con arreglo a una norma proporcional a su participación previa", crit: true, art: "art. 76.2.1.º a)" },
        { q: "La compensación en dinero no excede del 10 % del valor nominal", crit: true, art: "art. 76.2.1.º a)" },
        { q: "Las beneficiarias son residentes en España o los elementos quedan afectos a un EP en España", crit: true, art: "art. 77.1 a)" },
        { q: "No hay entidades en paraísos fiscales", crit: true, art: "art. 81.4" }
      ]
    },
    escision_total_np: {
      n: "Escisión total NO proporcional (los socios reciben en proporción distinta)",
      art: "art. 76.2.2.º LIS",
      req: [
        { q: "Se cumple todo lo de la escisión total (división del patrimonio, extinción, compensación ≤ 10 %)", crit: true, art: "art. 76.2.1.º a)" },
        { q: "LOS PATRIMONIOS ADQUIRIDOS POR CADA BENEFICIARIA CONSTITUYEN RAMAS DE ACTIVIDAD: conjuntos de elementos susceptibles de constituir una unidad económica autónoma capaz de funcionar por sus propios medios", crit: true, art: "arts. 76.2.2.º y 76.4" },
        { q: "Cada rama tiene medios propios: personal, contratos, clientela, activos y gestión diferenciada (no una simple cartera de bienes)", crit: true, art: "art. 76.4" },
        { q: "Las beneficiarias son residentes o hay afectación a EP en España, y no hay paraísos fiscales", crit: true, art: "arts. 77.1 a) y 81.4" }
      ]
    },
    escision_parcial: {
      n: "Escisión parcial",
      art: "art. 76.2.1.º b) LIS · art. 60 RDL 5/2023",
      req: [
        { q: "Lo segregado forma una o varias RAMAS DE ACTIVIDAD", crit: true, art: "arts. 76.2.1.º b) y 76.4" },
        { q: "La entidad que se escinde MANTIENE en su patrimonio al menos una rama de actividad, o participaciones que le den la mayoría del capital de otras entidades", crit: true, art: "art. 76.2.1.º b)" },
        { q: "Los socios reciben valores en proporción a sus participaciones, y la escindida reduce capital y reservas en la cuantía necesaria", crit: true, art: "art. 76.2.1.º b)" },
        { q: "Compensación en dinero ≤ 10 % del nominal", crit: true, art: "art. 76.2.1.º b)" },
        { q: "Beneficiaria residente o afectación a EP; sin paraísos fiscales", crit: true, art: "arts. 77.1 a) y 81.4" }
      ]
    },
    escision_financiera: {
      n: "Escisión financiera de participaciones",
      art: "art. 76.2.1.º c) LIS",
      req: [
        { q: "Lo segregado son participaciones que confieren la MAYORÍA del capital social de otras entidades", crit: true, art: "art. 76.2.1.º c)" },
        { q: "La escindida mantiene participaciones de similares características, o bien una rama de actividad", crit: true, art: "art. 76.2.1.º c)" },
        { q: "Atribución proporcional a los socios y compensación ≤ 10 %", crit: true, art: "art. 76.2.1.º c)" },
        { q: "Beneficiaria residente o afectación a EP; sin paraísos fiscales", crit: true, art: "arts. 77.1 a) y 81.4" }
      ]
    },
    aport_rama: {
      n: "Aportación no dineraria de rama de actividad",
      art: "arts. 76.3 y 87.2 LIS",
      req: [
        { q: "Lo aportado es la totalidad o una o más RAMAS DE ACTIVIDAD (unidad económica autónoma capaz de funcionar por sus propios medios)", crit: true, art: "arts. 76.3 y 76.4" },
        { q: "La aportante no se disuelve y recibe valores del capital social de la adquirente", crit: true, art: "art. 76.3" },
        { q: "Si el aportante es persona física o contribuyente del IRNR residente en la UE, lleva su contabilidad conforme al Código de Comercio o legislación equivalente", crit: true, art: "art. 87.2" },
        { q: "La entidad que recibe la aportación es residente en España o actúa mediante EP al que se afectan los bienes", crit: true, art: "art. 87.1 a)" }
      ]
    },
    canje: {
      n: "Canje de valores (creación de holding)",
      art: "arts. 76.5 y 80 LIS",
      req: [
        { q: "Con el canje se obtiene la MAYORÍA DE LOS DERECHOS DE VOTO de la participada, o ya se tenía y se incrementa la participación", crit: true, art: "art. 76.5" },
        { q: "La compensación en dinero no excede del 10 % del valor nominal de los valores entregados", crit: true, art: "art. 76.5" },
        { q: "La entidad adquirente es residente en España o está comprendida en el ámbito de la Directiva 2009/133/CE", crit: true, art: "art. 80.1 b)" },
        { q: "Los socios son residentes en España o en la UE; si no, los valores recibidos representan capital de una entidad residente en España", crit: true, art: "art. 80.1 a)" },
        { q: "No participan entidades domiciliadas o establecidas en paraísos fiscales", crit: true, art: "art. 80.5" },
        { q: "Se asume que el socio conserva el VALOR Y LA FECHA DE ADQUISICIÓN antiguos en las nuevas participaciones (no hay actualización de valores)", crit: false, art: "art. 80.3" }
      ]
    },
    aport_especial: {
      n: "Aportación no dineraria especial (aportar participaciones o inmuebles a una sociedad)",
      art: "art. 87.1 LIS",
      req: [
        { q: "La entidad que recibe la aportación es residente en España o actúa mediante EP al que se afectan los bienes", crit: true, art: "art. 87.1 a)" },
        { q: "Tras la aportación, el aportante participa en al menos el 5 % de los fondos propios de la receptora", crit: true, art: "art. 87.1 b)" },
        { q: "Si se aportan acciones o participaciones y el aportante es persona física: representan al menos el 5 % de los fondos propios de la participada", crit: true, art: "art. 87.1 c) 2.º" },
        { q: "Si se aportan acciones o participaciones y el aportante es persona física: se han poseído de manera ininterrumpida durante EL AÑO anterior a la fecha del documento público", crit: true, art: "art. 87.1 c) 3.º" },
        { q: "La entidad participada no aplica el régimen de AIE/UTE ni tiene como actividad principal la gestión de un patrimonio mobiliario o inmobiliario (art. 4.Ocho.Dos de la Ley del IP)", crit: true, art: "art. 87.1 c) 1.º" },
        { q: "Si se aportan OTROS elementos (por ejemplo inmuebles) por una persona física residente en la UE: están AFECTOS a actividades económicas y la contabilidad se lleva conforme al Código de Comercio", crit: true, art: "art. 87.1 d)" }
      ]
    }
  };

  function wireNeutralidad() {
    var box = document.querySelector(".rcalc.neutra");
    if (!box) return;
    var sel = box.querySelector("[data-n-op]"), list = box.querySelector("[data-n-list]"),
        btn = box.querySelector("[data-n-run]"), res = box.querySelector(".calc-result");
    if (sel && !sel.options.length) {
      Object.keys(NEUT_OPS).forEach(function (k) {
        var o = document.createElement("option"); o.value = k; o.textContent = NEUT_OPS[k].n; sel.appendChild(o);
      });
    }
    function render() {
      var O = NEUT_OPS[sel.value];
      var h = '<p class="note" style="margin:.2rem 0 .8rem"><strong>' + O.n + '</strong> · ' + O.art + '. Marca lo que se cumple <em>de verdad</em>, no lo que se pretende cumplir.</p>';
      O.req.forEach(function (r, i) {
        h += '<label class="toggle" style="align-items:flex-start;margin-bottom:.5rem"><input type="checkbox" data-n-req="' + i + '"><span>' + (r.crit ? '<strong>' : '') + r.q + (r.crit ? '</strong>' : '') + ' <em style="color:var(--muted-2);font-style:normal;font-size:.82rem">(' + r.art + (r.crit ? '' : ' · comprobación') + ')</em></span></label>';
      });
      h += '<hr style="border:0;border-top:1px solid var(--line);margin:.9rem 0">';
      h += '<label class="toggle" style="align-items:flex-start;margin-bottom:.5rem"><input type="checkbox" data-n-motivo><span><strong>Existe un MOTIVO ECONÓMICO VÁLIDO documentado por escrito</strong> (reestructuración o racionalización de actividades), más allá de la ventaja fiscal <em style="color:var(--muted-2);font-style:normal;font-size:.82rem">(art. 89.2)</em></span></label>';
      h += '<label class="toggle" style="align-items:flex-start"><input type="checkbox" data-n-comu><span>Se presentará la <strong>comunicación</strong> de la operación a la Administración en forma y plazo reglamentarios <em style="color:var(--muted-2);font-style:normal;font-size:.82rem">(art. 89.1: la falta de presentación es infracción grave, 10.000 € por operación)</em></span></label>';
      list.innerHTML = h;
      res.classList.remove("show");
    }
    if (sel) sel.addEventListener("change", render);
    render();
    function run() {
      var O = NEUT_OPS[sel.value];
      var faltanCrit = [], faltanComp = [];
      O.req.forEach(function (r, i) {
        var c = list.querySelector('[data-n-req="' + i + '"]');
        if (c && !c.checked) (r.crit ? faltanCrit : faltanComp).push(r);
      });
      var motivo = list.querySelector("[data-n-motivo]").checked;
      var comu = list.querySelector("[data-n-comu]").checked;
      var veredicto, clase;
      if (faltanCrit.length === 0 && motivo) { veredicto = "La operación encaja en el régimen de neutralidad"; clase = "ok"; }
      else if (faltanCrit.length === 0 && !motivo) { veredicto = "Requisitos técnicos cumplidos, pero SIN motivo económico válido documentado"; clase = "riesgo"; }
      else { veredicto = "La operación NO encaja: faltan " + faltanCrit.length + " requisito(s) esencial(es)"; clase = "no"; }

      var html = '<div class="seg"><span class="tag">Veredicto</span><span class="name ' + (clase === "ok" ? "" : "wine") + '">' + veredicto + '</span></div>';
      html += '<div class="money">' +
        '<div class="m"><div class="k">Requisitos esenciales</div><div class="v">' + (O.req.filter(function (r) { return r.crit; }).length - faltanCrit.length) + '/' + O.req.filter(function (r) { return r.crit; }).length + '</div></div>' +
        '<div class="m"><div class="k">Motivo económico</div><div class="v ' + (motivo ? '' : 'wine') + '">' + (motivo ? "Documentado" : "PENDIENTE") + '</div></div>' +
        '<div class="m"><div class="k">Comunicación</div><div class="v ' + (comu ? '' : 'wine') + '">' + (comu ? "Prevista" : "PENDIENTE") + '</div></div>' +
        '</div>';
      if (faltanCrit.length) {
        html += '<div class="flag"><strong>Requisitos esenciales que fallan:</strong><ul style="margin:.4rem 0 0;padding-left:1.1rem">';
        faltanCrit.forEach(function (r) { html += '<li>' + r.q + ' <em style="font-style:normal;color:var(--muted-2)">(' + r.art + ')</em></li>'; });
        html += '</ul>Sin ellos la operación tributa por el régimen general: plusvalías a valor de mercado en la transmitente y en los socios.</div>';
      }
      if (faltanComp.length) {
        html += '<div class="flag"><strong>Comprobaciones pendientes</strong> (no impiden aplicar el régimen, pero cambian el resultado):<ul style="margin:.4rem 0 0;padding-left:1.1rem">';
        faltanComp.forEach(function (r) { html += '<li>' + r.q + ' <em style="font-style:normal;color:var(--muted-2)">(' + r.art + ')</em></li>'; });
        html += '</ul></div>';
      }
      if (!motivo) html += '<div class="flag"><strong>Sin motivo económico válido no hay régimen.</strong> El art. 89.2 lo dice expresamente: el régimen no se aplica cuando la operación no se efectúa por motivos económicos válidos «sino con la mera finalidad de conseguir una ventaja fiscal». La buena noticia de la redacción vigente: la comprobación administrativa «eliminará exclusivamente los efectos de la ventaja fiscal», no todo el régimen. La mala: hay que identificar y cuantificar esa ventaja, y eso lo decide la Inspección.</div>';
      if (!comu) html += '<div class="flag">La comunicación del art. 89.1 no es un trámite menor: el régimen se aplica <strong>salvo renuncia expresa</strong>, pero no presentar la comunicación en plazo es <strong>infracción grave con multa fija de 10.000 € por operación</strong> sobre la que debía informarse.</div>';
      html += '<p class="note" style="margin-top:.7rem">Herramienta de trabajo, no dictamen. El encaje se documenta en un informe con el proyecto, el motivo económico, las valoraciones y la trazabilidad de los requisitos temporales.</p>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_neutra");
    }
    if (btn) btn.addEventListener("click", run);
  }

  /* ---------- 2. Estructura del precio: cash-in, cash-out, leverage ---------- */
  function wireDeal() {
    var box = document.querySelector(".rcalc.deal");
    if (!box) return;
    var g = function (s) { return box.querySelector(s); };
    function n(sel) { var e = g(sel); var v = parseFloat((e && e.value || "").replace(/[^0-9.\-]/g, "")); return isNaN(v) ? 0 : v; }
    var btn = g("[data-d-run]"), res = box.querySelector(".calc-result");

    function run() {
      var ebitda = n("[data-d-ebitda]"), mult = n("[data-d-mult]"), deudaNeta = n("[data-d-deuda]");
      var pct = Math.min(100, Math.max(0, n("[data-d-pct]")));
      var cashIn = Math.min(100, Math.max(0, n("[data-d-cashin]")));
      var lev = Math.min(100, Math.max(0, n("[data-d-lev]")));
      var earn = Math.min(100, Math.max(0, n("[data-d-earn]")));
      var esc = Math.min(100, Math.max(0, n("[data-d-escrow]")));
      var vend = g("[data-d-vendedor]").value;   // pf | holding
      var vAdq = n("[data-d-vadq]");             // valor de adquisición de las participaciones

      var ev = ebitda * mult;                   // enterprise value
      var eq = Math.max(0, ev - deudaNeta);     // equity value
      var precio = eq * pct / 100;              // precio del paquete transmitido
      var pCashOut = precio * (100 - cashIn) / 100;   // va al vendedor
      var pCashIn = precio * cashIn / 100;            // entra en la compañía
      var deudaAdq = pCashOut * lev / 100;
      var equityComprador = pCashOut - deudaAdq + pCashIn;
      var diferido = pCashOut * (earn + esc) / 100;
      var alCierre = pCashOut - diferido;

      // fiscalidad del vendedor sobre el cash-out
      var ganancia = Math.max(0, pCashOut - vAdq * pct / 100);
      var impuesto, notaFisc;
      if (vend === "pf") {
        impuesto = escalaAhorro(ganancia);
        notaFisc = "Persona física: base del ahorro, 19 %–28 %. Tipo efectivo sobre la ganancia: " + pctE(ganancia > 0 ? impuesto / ganancia : 0) + ".";
      } else {
        impuesto = ganancia * 0.25 * 0.05;
        notaFisc = "Holding con exención del art. 21 LIS: se integra el 5 % de la renta exenta al 25 % → tipo efectivo del <strong>1,25 %</strong>. El dinero queda en la sociedad: al sacarlo al socio habrá una segunda capa en IRPF.";
      }
      var neto = pCashOut - impuesto;
      var ratio = ebitda > 0 ? (deudaNeta + deudaAdq) / ebitda : 0;

      var html = '<div class="seg"><span class="tag">Estructura de la operación</span><span class="name wine">' + eurE(precio) + ' por el ' + pct + ' %</span></div>';
      html += '<div class="money">' +
        '<div class="m"><div class="k">Enterprise value</div><div class="v">' + eurE(ev) + '</div></div>' +
        '<div class="m"><div class="k">Equity value</div><div class="v">' + eurE(eq) + '</div></div>' +
        '<div class="m"><div class="k">Neto al vendedor tras impuestos</div><div class="v wine">' + eurE(neto) + '</div></div>' +
        '</div>';
      html += '<table class="tbl"><thead><tr><th>Concepto</th><th>Importe</th><th>Qué significa</th></tr></thead><tbody>';
      html += '<tr><td><strong>Cash-out</strong> (compra de acciones al vendedor)</td><td>' + eurE(pCashOut) + '</td><td>Dinero que sale del comprador y entra en el <strong>bolsillo del vendedor</strong>. Es transmisión de participaciones: tributa en el vendedor.</td></tr>';
      html += '<tr><td><strong>Cash-in</strong> (ampliación de capital)</td><td>' + eurE(pCashIn) + '</td><td>Dinero que entra en la <strong>caja de la compañía</strong> para crecer. No lo cobra el vendedor y por tanto no genera ganancia patrimonial: diluye.</td></tr>';
      html += '<tr><td>Deuda de adquisición (<em>leverage</em>)</td><td>' + eurE(deudaAdq) + ' (' + lev + ' % del cash-out)</td><td>Financiación del comprador. Si supera el <strong>70 % del precio</strong> se activa el límite adicional del 30 % del beneficio operativo de la adquirente (arts. 16.5 y 83 LIS).</td></tr>';
      html += '<tr><td>Equity que aporta el comprador</td><td>' + eurE(equityComprador) + '</td><td>Fondos propios del comprador (incluye el cash-in si lo suscribe él).</td></tr>';
      html += '<tr><td>Cobro <strong>al cierre</strong></td><td>' + eurE(alCierre) + '</td><td>Lo que el vendedor cobra el día de la firma, ya descontados earn-out y escrow.</td></tr>';
      html += '<tr><td>Cobro <strong>diferido</strong> (earn-out ' + earn + ' % + escrow ' + esc + ' %)</td><td>' + eurE(diferido) + '</td><td>Sujeto a cumplimiento de objetivos y a que no aparezcan contingencias. Puede no cobrarse nunca: hay que negociar el <em>gross-up</em> fiscal.</td></tr>';
      html += '<tr><td>Ganancia patrimonial del vendedor</td><td>' + eurE(ganancia) + '</td><td>Precio del paquete menos su valor de adquisición proporcional.</td></tr>';
      html += '<tr><td><strong>Impuesto del vendedor</strong></td><td class="wine"><strong>' + eurE(impuesto) + '</strong></td><td>' + notaFisc + '</td></tr>';
      html += '</tbody></table>';
      if (ebitda > 0) html += '<div class="flag"><strong>Apalancamiento resultante:</strong> deuda total (' + eurE(deudaNeta + deudaAdq) + ') / EBITDA = <strong>' + ratio.toFixed(2).replace(".", ",") + 'x</strong>. Por encima de 3,5x–4x la financiación bancaria se encarece y los <em>covenants</em> aprietan; y recuerda que los gastos financieros netos sólo son deducibles hasta el 30 % del beneficio operativo, con un mínimo de 1 M€ (art. 16.1).</div>';
      if (lev > 70) html += '<div class="flag"><strong>Aviso de estructura:</strong> con un ' + lev + ' % de deuda superas el <em>puerto seguro</em> del 70 % del precio de adquisición. Si después hay fusión con la adquirida en los 4 años siguientes (o incorporación a grupo fiscal), los gastos financieros quedan limitados al 30 % del beneficio operativo de la <strong>adquirente sin incluir el de la adquirida</strong> (art. 83 si la fusión aplica el régimen especial; art. 16.5 si no; art. 67.b) si se consolida). Alternativa: reducir la deuda proporcionalmente en cada uno de los 8 años siguientes hasta el 30 % del precio.</div>';
      if (vend === "pf" && ganancia > 0) {
        var impH = ganancia * 0.25 * 0.05;
        html += '<div class="flag"><strong>Comparativa vendedor:</strong> como persona física pagas ' + eurE(impuesto) + '; a través de un holding con exención del art. 21, ' + eurE(impH) + '. Diferencia: <strong>' + eurE(impuesto - impH) + '</strong>. Pero el dinero se queda en la sociedad, y el holding hay que constituirlo <strong>antes</strong> y con motivo económico válido: crear un holding para vender la semana siguiente es el caso de libro del art. 89.2.</div>';
      }
      if (cashIn > 0) html += '<div class="flag">El <strong>cash-in</strong> no es dinero para el vendedor: es capital para la compañía. Cuando un comprador financiero propone "500.000 € de los que 200.000 son cash-in", el vendedor cobra 300.000. Es el malentendido más frecuente en una negociación.</div>';
      html += '<p class="note" style="margin-top:.7rem">Estimación orientativa. No incluye gastos de la operación (asesores, notaría, registro), ajustes de precio por <em>working capital</em>, ni el efecto de un <em>vendor loan</em> o de un <em>roll-over</em> de participaciones. La fiscalidad del vendedor se estima con la escala estatal del ahorro.</p>';
      res.innerHTML = html; res.classList.add("show"); actDone("calc_deal");
    }
    if (btn) btn.addEventListener("click", run);
  }


  /* ---------- 3. IRL interactiva (Information Request List) ---------- */
  var IRL_AREAS = [
    { k: "soc", n: "Societario", items: [
      { t: "Escrituras de constitución y estatutos vigentes", d: "Con todas las modificaciones y su inscripción en el Registro Mercantil." },
      { t: "Libro registro de socios o de acciones nominativas", d: "Titularidad real actualizada y trazabilidad de las transmisiones anteriores." },
      { t: "Libros de actas de junta y de órgano de administración (últimos 5 años)", d: "Acuerdos de reparto, ampliaciones, retribuciones y autocartera." },
      { t: "Certificación registral actualizada y CIF", d: "Cargas, apoderamientos vigentes y situación de depósito de cuentas." },
      { t: "Pactos de socios, protocolo familiar y acuerdos parasociales", d: "Cláusulas de arrastre, acompañamiento, preferencia y valoración pactada." },
      { t: "Estructura del grupo y organigrama societario", d: "Participaciones directas e indirectas, porcentajes y sociedades inactivas." },
      { t: "Operaciones de reestructuración anteriores", d: "Proyectos, informes, comunicaciones del art. 89.1 LIS y documentación del motivo económico." },
      { t: "Autocartera, opciones sobre participaciones y planes de incentivos", d: "Phantom shares, stock options y compromisos con directivos." }
    ]},
    { k: "fin", n: "Financiero-contable", items: [
      { t: "Cuentas anuales de los últimos 3–5 ejercicios", d: "Con informe de auditoría si existe, y cuentas consolidadas del grupo." },
      { t: "Balances y cuentas de resultados mensuales del ejercicio en curso", d: "Comparativo con presupuesto y con el mismo período del año anterior." },
      { t: "Detalle de deuda financiera y calendario de vencimientos", d: "Pólizas, préstamos, leasing, confirming, factoring, avales y covenants." },
      { t: "Composición del working capital", d: "Aging de clientes y proveedores, rotación de existencias, estacionalidad." },
      { t: "Cálculo del EBITDA normalizado y ajustes propuestos", d: "Gastos no recurrentes, retribuciones de socios, gastos personales, alquileres a partes vinculadas." },
      { t: "Plan de negocio y proyecciones", d: "Hipótesis, sensibilidades y grado de cumplimiento de los presupuestos anteriores." },
      { t: "Detalle de saldos y operaciones con partes vinculadas", d: "Préstamos a socios, cuentas corrientes, alquileres y servicios cruzados." },
      { t: "Inventario de activos fijos y política de amortización", d: "Elementos totalmente amortizados aún en uso y activos no operativos." },
      { t: "Contingencias y provisiones registradas y no registradas", d: "Con la valoración del asesor y la opinión del auditor." }
    ]},
    { k: "fis", n: "Fiscal", items: [
      { t: "Declaraciones de Sociedades de los ejercicios no prescritos", d: "Con ajustes al resultado contable, BIN pendientes y deducciones acreditadas." },
      { t: "Modelos de IVA y resúmenes anuales", d: "Prorrata aplicada, sectores diferenciados y regularización de bienes de inversión." },
      { t: "Retenciones e ingresos a cuenta", d: "Modelos 111, 115, 123 y sus resúmenes anuales. Atención al art. 42.1.c) LGT." },
      { t: "Certificado de estar al corriente y deudas con la AEAT y la Seguridad Social", d: "Y, si la operación es de activos o de rama, el certificado del art. 175.2 LGT." },
      { t: "Actas de inspección, requerimientos y recursos en curso", d: "De los últimos cuatro ejercicios y de los diez si hay bases o deducciones pendientes (art. 66 bis LGT)." },
      { t: "Documentación de precios de transferencia", d: "Master file, local file y análisis de comparabilidad de las operaciones vinculadas." },
      { t: "Bases imponibles negativas y deducciones pendientes", d: "Con su origen, límites de compensación y efecto de un cambio de control." },
      { t: "Incentivos aplicados: I+D+i, patent box, reserva de capitalización", d: "Informes motivados, memorias técnicas y compromisos de mantenimiento." },
      { t: "Situación de la exención de empresa familiar en IP e ISD de los socios", d: "Funciones de dirección, retribución y porcentaje de activos afectos." },
      { t: "Tributos locales e IBI, plusvalías pendientes y tasas", d: "Y valores de referencia de los inmuebles a efectos de una transmisión." }
    ]},
    { k: "lab", n: "Laboral y RRHH", items: [
      { t: "Plantilla completa con antigüedad, categoría y coste", d: "Incluyendo becarios, autónomos recurrentes y personal cedido." },
      { t: "Contratos de trabajo y convenio colectivo aplicable", d: "Especial atención a temporalidad, cláusulas de blindaje y no competencia." },
      { t: "Contratos de alta dirección y pactos de indemnización", d: "Cláusulas de cambio de control y su coste si la operación se cierra." },
      { t: "RLC y RNT de los últimos 12 meses", d: "Cotizaciones, bonificaciones aplicadas y posibles diferencias." },
      { t: "Actas de la Inspección de Trabajo y expedientes sancionadores", d: "Últimos cuatro años, resueltos y en curso." },
      { t: "Litigios laborales y despidos recientes", d: "Reclamaciones de cantidad, de categoría y de falsos autónomos." },
      { t: "Plan de igualdad, registro salarial y protocolo de acoso", d: "Obligatorios según plantilla: su ausencia es sanción cuantificable." },
      { t: "Prevención de riesgos y evaluación actualizada", d: "Con el plan de formación y el servicio de prevención contratado." }
    ]},
    { k: "com", n: "Comercial y contratos", items: [
      { t: "Cinco a diez principales clientes: contrato, antigüedad y margen", d: "Concentración de facturación y cláusulas de cambio de control o terminación." },
      { t: "Principales proveedores y contratos de suministro", d: "Exclusividades, dependencias críticas y condiciones de pago." },
      { t: "Contratos de agencia, distribución y comisión", d: "Indemnizaciones por clientela al terminar: contingencia clásica y cara." },
      { t: "Condiciones generales de venta, garantías y devoluciones", d: "Y su reflejo en las provisiones contables." },
      { t: "Contratos con partes vinculadas a precio distinto de mercado", d: "Se normalizan en el EBITDA y se corrigen antes del cierre." },
      { t: "Pedidos en cartera y presupuestos pendientes de aceptar", d: "Backlog: sostiene o desmiente las proyecciones." }
    ]},
    { k: "inm", n: "Inmuebles y activos", items: [
      { t: "Títulos de propiedad y notas simples de los inmuebles", d: "Cargas, servidumbres, afecciones y coincidencia con el Catastro." },
      { t: "Contratos de arrendamiento como arrendador y como arrendatario", d: "Duración, renta, actualización, garantías y cláusulas de cambio de control." },
      { t: "Licencias de actividad y de primera ocupación", d: "Y su adecuación al uso real desarrollado en cada centro." },
      { t: "Situación urbanística de los suelos", d: "Clasificación, cargas de urbanización pendientes y planeamiento en tramitación." },
      { t: "Tasaciones recientes y valor contable frente a valor de mercado", d: "Clave si el activo inmobiliario supera el 50 % del balance (art. 338 Ley 6/2023)." },
      { t: "Bienes afectos y no afectos a la actividad", d: "Determina exención de empresa familiar, entidad patrimonial y norma antielusiva." }
    ]},
    { k: "ip", n: "Propiedad intelectual, IT y datos", items: [
      { t: "Marcas, nombres comerciales y dominios registrados", d: "Titularidad a nombre de la sociedad y no de los socios, y renovaciones al día." },
      { t: "Patentes, modelos de utilidad y diseños", d: "Con su vigencia territorial y las licencias concedidas o recibidas." },
      { t: "Software: licencias, desarrollos propios y código fuente", d: "Cesión de derechos por parte de empleados y de proveedores externos." },
      { t: "Contratos con proveedores tecnológicos y SaaS", d: "Dependencias críticas, niveles de servicio y portabilidad de datos." },
      { t: "Registro de actividades de tratamiento y RGPD", d: "Encargados del tratamiento, transferencias internacionales y brechas notificadas." },
      { t: "Ciberseguridad: incidentes, copias de seguridad y plan de contingencia", d: "Un incidente no revelado es una contingencia oculta de primer nivel." }
    ]},
    { k: "lit", n: "Litigios y contingencias", items: [
      { t: "Relación de procedimientos judiciales y arbitrales", d: "Cuantía, instancia, provisión registrada y opinión del abogado que los dirige." },
      { t: "Reclamaciones extrajudiciales y burofaxes recibidos", d: "Lo que todavía no es demanda pero lo será." },
      { t: "Expedientes administrativos sancionadores", d: "Consumo, competencia, medio ambiente, industria, protección de datos." },
      { t: "Garantías prestadas a terceros, avales y cartas de patrocinio", d: "Fuera de balance y capaces de romper una operación." },
      { t: "Responsabilidad de administradores y seguro D&O", d: "Acciones sociales o individuales en curso y cobertura vigente." }
    ]},
    { k: "cum", n: "Compliance, PBC y penal", items: [
      { t: "Modelo de organización y prevención de delitos", d: "Existencia, implantación real y órgano de supervisión (art. 31 bis CP)." },
      { t: "Manual de prevención de blanqueo y titular real", d: "Declaración de titularidad real y su coincidencia con el Registro Mercantil." },
      { t: "Canal de denuncias y expedientes internos", d: "Obligatorio para muchas compañías: su ausencia es sanción." },
      { t: "Subvenciones y ayudas públicas recibidas", d: "Compromisos de mantenimiento de empleo o inversión, y riesgo de reintegro por cambio de control." },
      { t: "Operaciones con países de riesgo y sanciones internacionales", d: "Listas, embargos y contrapartes sensibles." }
    ]},
    { k: "amb", n: "Medioambiental y licencias", items: [
      { t: "Autorizaciones ambientales y de vertidos", d: "Vigencia, condiciones y renovaciones pendientes." },
      { t: "Gestión de residuos y contratos con gestores autorizados", d: "Trazabilidad documental de los últimos ejercicios." },
      { t: "Informes de suelos contaminados si aplica", d: "La responsabilidad ambiental se transmite con el activo." },
      { t: "Consumos energéticos y obligaciones de eficiencia", d: "Y su impacto en el coste futuro." }
    ]},
    { k: "seg", n: "Seguros y financiación", items: [
      { t: "Pólizas de seguro vigentes y siniestralidad", d: "Coberturas, sumas aseguradas, franquicias e infraseguro." },
      { t: "Garantías reales sobre activos y prendas de participaciones", d: "Hay que levantarlas o novarlas antes del cierre." },
      { t: "Cláusulas de cambio de control en la financiación", d: "Pueden provocar el vencimiento anticipado el día de la firma." },
      { t: "Seguros de vida y de socios clave", d: "Y su encaje en el protocolo familiar y en la planificación sucesoria." }
    ]}
  ];

  function wireIrl() {
    var box = document.querySelector(".irl");
    if (!box) return;
    var KEY = "dasar_irl_v1";
    var st = {};
    try { st = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { st = {}; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

    var bar = box.querySelector("[data-irl-bar]"), body = box.querySelector("[data-irl-body]"),
        out = box.querySelector(".irlout"), pb = box.querySelector("[data-irl-pb]"), ptxt = box.querySelector("[data-irl-ptxt]");
    var actual = IRL_AREAS[0].k;

    function id(ak, i) { return ak + "_" + i; }
    function counts(A) {
      var rec = 0, na = 0;
      A.items.forEach(function (it, i) { var s = st[id(A.k, i)]; if (s && s.st === "rec") rec++; if (s && s.st === "na") na++; });
      return { rec: rec, na: na, tot: A.items.length };
    }
    function renderBar() {
      var h = "";
      IRL_AREAS.forEach(function (A) {
        var c = counts(A);
        h += '<button class="achip' + (A.k === actual ? ' on' : '') + '" data-area="' + A.k + '">' + A.n + '<i>' + (c.rec + c.na) + '/' + c.tot + '</i></button>';
      });
      bar.innerHTML = h;
      bar.querySelectorAll("[data-area]").forEach(function (b) {
        b.addEventListener("click", function () { actual = b.getAttribute("data-area"); renderBar(); renderBody(); });
      });
      var tot = 0, done = 0;
      IRL_AREAS.forEach(function (A) { var c = counts(A); tot += c.tot; done += c.rec + c.na; });
      if (pb) pb.style.width = (tot ? (done / tot * 100) : 0) + "%";
      if (ptxt) ptxt.textContent = done + " de " + tot + " puntos resueltos";
    }
    function renderBody() {
      var A = IRL_AREAS.filter(function (x) { return x.k === actual; })[0];
      var h = "";
      A.items.forEach(function (it, i) {
        var k = id(A.k, i), s = st[k] || { st: "pend", nota: "" };
        h += '<div class="irlitem ' + (s.st === "rec" ? "st-rec" : s.st === "na" ? "st-na" : "") + '" data-k="' + k + '">' +
          '<div><div class="it-t">' + it.t + '</div><div class="it-d">' + it.d + '</div></div>' +
          '<div class="it-st">' +
            '<button data-set="pend" class="' + (s.st === "pend" ? "on" : "") + '">Pendiente</button>' +
            '<button data-set="rec" class="rec ' + (s.st === "rec" ? "on" : "") + '">Recibido</button>' +
            '<button data-set="na" class="' + (s.st === "na" ? "on" : "") + '">N/A</button>' +
          '</div>' +
          '<textarea placeholder="Nota, referencia del documento o hallazgo…">' + (s.nota || "") + '</textarea>' +
        '</div>';
      });
      body.innerHTML = h;
      body.querySelectorAll(".irlitem").forEach(function (el) {
        var k = el.getAttribute("data-k");
        el.querySelectorAll("[data-set]").forEach(function (b) {
          b.addEventListener("click", function () {
            st[k] = st[k] || { st: "pend", nota: "" };
            st[k].st = b.getAttribute("data-set");
            save(); renderBar(); renderBody(); actDone("irl");
          });
        });
        var ta = el.querySelector("textarea");
        ta.addEventListener("input", function () {
          st[k] = st[k] || { st: "pend", nota: "" };
          st[k].nota = ta.value; save();
        });
      });
    }

    function generar(soloPend) {
      var h = '<h3>' + (soloPend ? "Information Request List · documentación pendiente" : "Estado completo de la IRL") + '</h3>';
      var total = 0;
      IRL_AREAS.forEach(function (A) {
        var lines = [];
        A.items.forEach(function (it, i) {
          var s = st[id(A.k, i)] || { st: "pend", nota: "" };
          if (soloPend && s.st !== "pend") return;
          var etq = soloPend ? "" : (s.st === "rec" ? " — <em>recibido</em>" : s.st === "na" ? " — <em>no aplica</em>" : " — <em>pendiente</em>");
          lines.push("<li>" + it.t + etq + (s.nota ? ' <em>· ' + s.nota + '</em>' : '') + "</li>");
        });
        if (lines.length) {
          total += lines.length;
          h += '<div class="oarea"><h5>' + A.n + '</h5><ul>' + lines.join("") + '</ul></div>';
        }
      });
      if (!total) h += '<p>No queda nada pendiente. Es momento de cerrar el informe de <em>due diligence</em> y llevar los hallazgos al contrato.</p>';
      else if (soloPend) h += '<p class="note">' + total + ' puntos pendientes. Envíalo con un plazo concreto de respuesta y con el formato de entrega esperado (índice del data room, nomenclatura de archivos y versión).</p>';
      out.innerHTML = h; out.classList.add("show");
      out.scrollIntoView({ behavior: "smooth", block: "start" });
      actDone("irl");
    }
    var b1 = box.querySelector("[data-irl-gen]"), b2 = box.querySelector("[data-irl-all]"), b3 = box.querySelector("[data-irl-print]"), b4 = box.querySelector("[data-irl-reset]");
    if (b1) b1.addEventListener("click", function () { generar(true); });
    if (b2) b2.addEventListener("click", function () { generar(false); });
    if (b3) b3.addEventListener("click", function () { generar(true); setTimeout(function () { window.print(); }, 350); });
    if (b4) b4.addEventListener("click", function () {
      if (!confirm("¿Vaciar la IRL y empezar de cero?")) return;
      st = {}; save(); out.classList.remove("show"); renderBar(); renderBody();
    });
    renderBar(); renderBody();
  }

  /* ---------- 4. Registro de hallazgos de due diligence ---------- */
  function wireHallazgos() {
    var box = document.querySelector(".ddbox");
    if (!box) return;
    var KEY = "dasar_dd_v1";
    var arr = [];
    try { arr = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { arr = []; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {} }
    var g = function (s) { return box.querySelector(s); };
    var lista = g("[data-dd-list]"), resumen = g("[data-dd-sum]");
    var SEV = { alta: "Crítico", media: "Relevante", baja: "Menor" };
    var IMP = {
      precio: "Ajuste de precio",
      indem: "Indemnidad específica",
      garantia: "Manifestación y garantía",
      previa: "Condición previa al cierre",
      escrow: "Retención en escrow",
      nomat: "No material"
    };
    function render() {
      var h = "";
      if (!arr.length) h = '<p class="note">Todavía no has registrado hallazgos. Cada hallazgo debe acabar en una de estas cinco salidas: precio, indemnidad, garantía, condición previa o escrow. Si no acaba en ninguna, no es un hallazgo: es una observación.</p>';
      arr.forEach(function (f, i) {
        h += '<div class="finding ' + f.sev + '"><div class="fi-c"><div class="fi-t">' + f.area + ' · ' + f.desc + '</div>' +
          '<div class="fi-d">' + SEV[f.sev] + ' · ' + IMP[f.imp] + (f.imp_e ? ' · impacto estimado ' + eurE(f.imp_e) : '') + '</div></div>' +
          '<div class="fi-badges"><button class="btn btn-outline" style="padding:.25rem .6rem;font-size:.75rem" data-del="' + i + '">Quitar</button></div></div>';
      });
      lista.innerHTML = h;
      lista.querySelectorAll("[data-del]").forEach(function (b) {
        b.addEventListener("click", function () { arr.splice(parseInt(b.getAttribute("data-del"), 10), 1); save(); render(); });
      });
      // resumen
      var nA = 0, nM = 0, nB = 0, totalE = 0, porImp = {};
      arr.forEach(function (f) {
        if (f.sev === "alta") nA++; else if (f.sev === "media") nM++; else nB++;
        totalE += (f.imp_e || 0);
        porImp[f.imp] = (porImp[f.imp] || 0) + (f.imp_e || 0);
      });
      if (!arr.length) { resumen.innerHTML = ""; return; }
      var h2 = '<div class="money">' +
        '<div class="m"><div class="k">Críticos</div><div class="v wine">' + nA + '</div></div>' +
        '<div class="m"><div class="k">Relevantes / menores</div><div class="v">' + nM + ' / ' + nB + '</div></div>' +
        '<div class="m"><div class="k">Impacto económico estimado</div><div class="v wine">' + eurE(totalE) + '</div></div>' +
        '</div>';
      h2 += '<table class="tbl"><thead><tr><th>Tratamiento en el contrato</th><th>Importe acumulado</th><th>Qué implica negociar</th></tr></thead><tbody>';
      var expl = {
        precio: "Se descuenta del precio: es la vía más limpia porque no depende de nadie después del cierre.",
        indem: "Indemnidad específica del vendedor por ese riesgo concreto, sin franquicia y con plazo propio.",
        garantia: "Manifestación y garantía en el contrato, con límite cuantitativo, franquicia y plazo de reclamación.",
        previa: "Condición previa: no se firma hasta que esté resuelto. Se usa para lo que no admite dinero como remedio.",
        escrow: "Parte del precio queda retenida en cuenta hasta que el riesgo prescriba o se resuelva.",
        nomat: "Se documenta y se archiva, sin efecto en el contrato."
      };
      Object.keys(IMP).forEach(function (k) {
        if (porImp[k] === undefined) return;
        h2 += '<tr><td><strong>' + IMP[k] + '</strong></td><td>' + eurE(porImp[k]) + '</td><td>' + expl[k] + '</td></tr>';
      });
      h2 += '</tbody></table>';
      if (nA > 0) h2 += '<div class="flag">Hay <strong>' + nA + ' hallazgo(s) crítico(s)</strong>. Los críticos no se negocian con una garantía genérica: exigen condición previa, indemnidad específica o replantear el perímetro. Si el vendedor no acepta ninguna de las tres, la respuesta correcta puede ser no cerrar.</div>';
      var pFisc = arr.filter(function (f) { return /fiscal|laboral/i.test(f.area); }).length;
      if (pFisc) h2 += '<div class="flag">Hallazgos fiscales o laborales detectados: recuerda que los plazos de reclamación en el contrato deben ir <strong>ligados a la prescripción</strong> (cuatro años en general, diez para comprobar bases y deducciones pendientes, art. 66 bis LGT) y que en las compras de activos o rama de actividad hay <strong>responsabilidad solidaria por sucesión de empresa</strong> (art. 42.1.c LGT), limitable con el certificado del art. 175.2.</div>';
      resumen.innerHTML = h2;
    }
    var btn = g("[data-dd-add]");
    if (btn) btn.addEventListener("click", function () {
      var area = g("[data-dd-area]").value, desc = (g("[data-dd-desc]").value || "").trim();
      if (!desc) { alert("Describe el hallazgo."); return; }
      var v = parseFloat((g("[data-dd-imp]").value || "").replace(/[^0-9.]/g, ""));
      arr.push({ area: area, desc: desc, sev: g("[data-dd-sev]").value, imp: g("[data-dd-trat]").value, imp_e: isNaN(v) ? 0 : v });
      save(); g("[data-dd-desc]").value = ""; g("[data-dd-imp]").value = "";
      render(); actDone("dd");
    });
    var bR = g("[data-dd-reset]");
    if (bR) bR.addEventListener("click", function () { if (confirm("¿Vaciar el registro de hallazgos?")) { arr = []; save(); render(); } });
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildSidebar();
    wireMenu();
    wireQuizzes();
    wireCasos();
    wireComplete();
    wireReveal();
    wireYear();
    wireReading();
    wireCalc();
    wireDiagnostico();
    wireIrpf();
    wireAhorro();
    wireDeducciones();
    wireIpCalc();
    wireIsCalc();
    wireIsdCalc();
    wireIndirecta();
    wireCadena();
    wireNeutralidad();
    wireDeal();
    wireIrl();
    wireHallazgos();
    refreshTracker();
    refreshProgressUI();
  });
})();
