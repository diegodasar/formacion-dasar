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
        if (modId && pct >= 70) markComplete(modId, true);
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

  document.addEventListener("DOMContentLoaded", function () {
    buildSidebar();
    wireMenu();
    wireQuizzes();
    wireCasos();
    wireComplete();
    wireReveal();
    wireYear();
    refreshProgressUI();
  });
})();
