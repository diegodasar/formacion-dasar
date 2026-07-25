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
    { id: "mod3", num: "3", title: "Los tributos y su interconexión", file: "modulo-3.html", ready: false, core: false },
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
    var calc = document.querySelector(".calc");
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
    refreshTracker();
    refreshProgressUI();
  });
})();
