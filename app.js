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
    { id: "mod1", num: "1", title: "Marco legislativo e institucional", file: "modulo-1.html", ready: false, core: false },
    { id: "mod2", num: "2", title: "Diagnóstico patrimonial 360º", file: "modulo-2.html", ready: false, core: true },
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
    refreshTracker();
    refreshProgressUI();
  });
})();
