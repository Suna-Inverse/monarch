/* Monarch site extras, shared by every page:
   1. Status banner: shows when Monarch is paused or there's a notice
      (set in the admin page's Settings tab).
   2. The DOMINATING pill in the top right does something when you click it. */
(function () {
  var API = "https://api.sunainverse.com/v1/web/status";
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var css = document.createElement("style");
  css.textContent =
    ".site-notice{position:relative;z-index:29;border-bottom:2px solid var(--rule,#4a55a8);background:#23264a;color:#fff;font-size:.95rem}" +
    ".site-notice.paused{background:#3a1d1d;border-bottom-color:#ff5a5a;color:#ffd0d0}" +
    ".site-notice .wrap{display:flex;gap:12px;align-items:center;padding-top:10px;padding-bottom:10px}" +
    ".site-notice b{font-weight:800;font-style:oblique;text-transform:uppercase;letter-spacing:.05em;color:var(--orange,#ffac01);white-space:nowrap}" +
    ".site-notice.paused b{color:#ff8a8a}" +
    ".site-notice span{flex:1}" +
    ".site-notice button{background:none;border:0;color:inherit;font-size:1.3rem;line-height:1;cursor:pointer;opacity:.7;padding:2px 6px}" +
    ".site-notice button:hover{opacity:1}" +
    ".nav-pill .pill{cursor:pointer;user-select:none;-webkit-user-select:none}" +
    ".nav-pill .pill:focus-visible{outline:2px solid var(--yellow,#ffe800);outline-offset:3px}" +
    ".dom-spark{position:fixed;left:0;top:0;width:18px;height:18px;pointer-events:none;z-index:1000}" +
    ".dom-tag{position:fixed;z-index:1001;pointer-events:none;font-weight:800;font-style:oblique;letter-spacing:.06em;text-transform:uppercase;" +
    "color:var(--yellow,#ffe800);font-size:.85rem;text-shadow:0 2px 10px rgba(0,0,0,.6);white-space:nowrap}" +
    ".dom-flash{position:fixed;inset:0;pointer-events:none;z-index:999;background:radial-gradient(circle at 50% 42%,rgba(172,92,230,.45),rgba(14,14,22,.78) 60%)}" +
    ".dom-crown{position:fixed;left:50%;top:42%;z-index:1001;pointer-events:none;transform:translate(-50%,-50%);text-align:center}" +
    ".dom-crown img{width:min(240px,50vw);height:auto;filter:drop-shadow(0 0 40px rgba(172,92,230,.7))}" +
    ".dom-crown div{margin-top:10px;white-space:nowrap;font-weight:800;font-style:oblique;font-size:clamp(1.2rem,6vw,3rem);letter-spacing:.06em;text-transform:uppercase;color:#fff;text-shadow:0 4px 24px rgba(0,0,0,.7)}";
  document.head.appendChild(css);

  // ---------- 1. status banner ----------
  // The admin page has its own kill-switch banner.
  if (!document.getElementById("ks-banner")) {
    fetch(API).then(function (r) { return r.ok ? r.json() : null; }).then(function (s) {
      if (!s || (!s.paused && !s.notice)) return;
      var key = "monarch-notice-hidden:" + (s.paused ? "1" : "0") + (s.notice || "");
      try { if (sessionStorage.getItem(key)) return; } catch (e) {}
      var bar = document.createElement("div");
      bar.className = "site-notice" + (s.paused ? " paused" : "");
      bar.setAttribute("role", "status");
      var wrap = document.createElement("div"); wrap.className = "wrap";
      var b = document.createElement("b"); b.textContent = s.paused ? "Paused" : "Notice";
      var t = document.createElement("span");
      t.textContent = s.paused
        ? "Monarch is paused right now, so the plugins are locked." + (s.notice ? " " + s.notice : "")
        : s.notice;
      var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", "Hide this message"); x.textContent = "×";
      x.onclick = function () { bar.remove(); try { sessionStorage.setItem(key, "1"); } catch (e) {} };
      wrap.appendChild(b); wrap.appendChild(t); wrap.appendChild(x); bar.appendChild(wrap);
      var nav = document.querySelector("nav");
      if (nav && nav.parentNode) nav.parentNode.insertBefore(bar, nav.nextSibling);
    }).catch(function () {}); // server unreachable: just no banner
  }

  // ---------- 2. the DOMINATING pill ----------
  var pill = document.querySelector(".nav-pill .pill");
  if (!pill) return;
  var RANKS = ["Dominating", "Double dominate", "Triple dominate", "Unstoppable", "Godlike", "Monarch mode"];
  var combo = 0, timer = null, busy = false;
  pill.setAttribute("role", "button");
  pill.setAttribute("tabindex", "0");
  pill.setAttribute("title", "Go on, click it");
  pill.setAttribute("aria-live", "polite");

  function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function spark(x, y, size) {
    var NS = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(NS, "svg"); s.setAttribute("class", "dom-spark");
    s.style.width = s.style.height = size + "px";
    var u = document.createElementNS(NS, "use"); u.setAttribute("href", "#sp"); s.appendChild(u);
    s.style.transform = "translate(" + (x - size / 2) + "px," + (y - size / 2) + "px)";
    document.body.appendChild(s); return s;
  }
  function burst(n, spread) {
    if (calm) return;
    var c = center(pill);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, d = spread * (0.5 + Math.random() * 0.7);
      var size = 10 + Math.random() * 16, s = spark(c.x, c.y, size);
      var dx = Math.cos(a) * d, dy = Math.sin(a) * d + 40;
      s.animate([
        { transform: "translate(" + (c.x - size / 2) + "px," + (c.y - size / 2) + "px) scale(.3) rotate(0deg)", opacity: 1 },
        { transform: "translate(" + (c.x - size / 2 + dx) + "px," + (c.y - size / 2 + dy) + "px) scale(1) rotate(" + (Math.random() * 360) + "deg)", opacity: 0 }
      ], { duration: 650 + Math.random() * 450, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = (function (el) { return function () { el.remove(); }; })(s);
    }
  }
  function tag(text) {
    if (calm) return;
    var old = document.querySelectorAll(".dom-tag"); for (var i = 0; i < old.length; i++) old[i].remove();
    var c = center(pill), t = document.createElement("div"); t.className = "dom-tag"; t.textContent = text;
    document.body.appendChild(t);
    var w = t.offsetWidth;
    var left = Math.min(Math.max(8, c.x - w / 2), window.innerWidth - w - 8);
    t.style.left = left + "px"; t.style.top = (c.y + 22) + "px";
    t.animate([{ transform: "translateY(0)", opacity: 0 }, { transform: "translateY(10px)", opacity: 1, offset: .2 }, { transform: "translateY(34px)", opacity: 0 }],
      { duration: 1100, easing: "ease-out" }).onfinish = function () { t.remove(); };
  }
  function pop() {
    if (calm) return;
    pill.animate([{ transform: "scale(1)" }, { transform: "scale(1.18) rotate(-4deg)" }, { transform: "scale(.95) rotate(2deg)" }, { transform: "scale(1)" }],
      { duration: 380, easing: "ease-out" });
  }
  function monarchMode() {
    busy = true;
    var done = function () { busy = false; combo = 0; pill.textContent = RANKS[0]; };
    if (calm) { setTimeout(done, 1500); return; }
    var flash = document.createElement("div"); flash.className = "dom-flash"; document.body.appendChild(flash);
    flash.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 0 }], { duration: 2400 }).onfinish = function () { flash.remove(); };
    var crown = document.createElement("div"); crown.className = "dom-crown";
    var img = document.createElement("img"); img.src = "assets/mark.webp"; img.alt = "";
    var label = document.createElement("div"); label.textContent = "All hail the Monarch";
    crown.appendChild(img); crown.appendChild(label); document.body.appendChild(crown);
    crown.animate([
      { transform: "translate(-50%,-50%) scale(.2) rotate(-20deg)", opacity: 0 },
      { transform: "translate(-50%,-50%) scale(1.08) rotate(3deg)", opacity: 1, offset: .25 },
      { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1, offset: .8 },
      { transform: "translate(-50%,-62%) scale(.9)", opacity: 0 }
    ], { duration: 2400, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = function () { crown.remove(); done(); };
    // spark rain
    for (var i = 0; i < 46; i++) {
      (function (i) {
        setTimeout(function () {
          var size = 12 + Math.random() * 22, x = Math.random() * window.innerWidth, s = spark(x, -30, size);
          s.animate([
            { transform: "translate(" + x + "px,-30px) rotate(0deg)", opacity: 1 },
            { transform: "translate(" + (x + (Math.random() * 80 - 40)) + "px," + (window.innerHeight + 30) + "px) rotate(" + (180 + Math.random() * 360) + "deg)", opacity: .9 }
          ], { duration: 1400 + Math.random() * 900, easing: "ease-in" }).onfinish = function () { s.remove(); };
        }, i * 28);
      })(i);
    }
    // A little screen shake (not on <body>: that would move the fixed sparks too).
    var shaky = document.querySelectorAll("main, body > section, body > header");
    for (var k = 0; k < shaky.length; k++) shaky[k].animate([{ transform: "translate(0,0)" }, { transform: "translate(-6px,3px)" },
      { transform: "translate(5px,-4px)" }, { transform: "translate(-3px,2px)" }, { transform: "translate(0,0)" }], { duration: 420, delay: 120 });
  }
  function hit() {
    if (busy) return;
    combo = Math.min(combo + 1, RANKS.length - 1);
    pill.textContent = RANKS[combo];
    pop();
    burst(8 + combo * 4, 60 + combo * 18);
    if (combo > 0 && combo < RANKS.length - 1) tag("x" + (combo + 1) + " combo");
    clearTimeout(timer);
    if (combo === RANKS.length - 1) { monarchMode(); return; }
    timer = setTimeout(function () { combo = 0; pill.textContent = RANKS[0]; }, 2200);
  }
  pill.addEventListener("click", hit);
  pill.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hit(); } });
})();
