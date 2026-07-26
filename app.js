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
    { id: "mod3", num: "3", title: "Los tributos y su interconexión", file: "modulo-3.html", ready: true, core: false },
    { id: "mod4", num: "4", title: "Estructuras y operaciones complejas", file: "modulo-4.html", ready: false, core: false },
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
    var html = "";
    MODULES.forEach(function (m) {
      var active = m.id === current ? " active" : "";
      var href = m.ready || m.id === current ? m.file : m.file;
      html += '<a class="side-item' + active + '" data-mod="' + m.id + '" href="' + href + '">' +
        '<span class="si-num">' + m.num + '</span>' +
        '<span class="si-t">' + m.title + (m.ready ? "" : " <em style=\'color:var(--muted-2);font-style:normal;font-size:.75rem\'>· en desarrollo</em>") + '</span>' +
        '<span class="si-check">✓</span>' +
        '</a>';
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
    refreshTracker();
    refreshProgressUI();
  });
})();
