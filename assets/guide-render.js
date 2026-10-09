/* Monarch Tools guide renderer, shared by guide.html (members) and admin.html (preview).
   A small, safe Markdown subset: # group, ## tool, ### sub-heading, *App: ...* meta line,
   lists (- / 1.), **bold**, *italic*, `code`, links and email addresses. */
(function () {
  function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function inline(t) {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
    t = t.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    t = t.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
    return t;
  }
  function slug(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  function render(md) {
    var lines = md.replace(/\r/g, "").split("\n");
    var out = [], toc = [], para = [], stack = [], inTool = false;
    function flushPara() { if (para.length) { out.push("<p>" + inline(para.join(" ")) + "</p>"); para = []; } }
    function closeLists(level) {
      while (stack.length > level) { var l = stack.pop(); out.push("</li></" + l.type + ">"); }
    }
    function closeTool() { flushPara(); closeLists(0); if (inTool) { out.push("</section>"); inTool = false; } }
    lines.forEach(function (raw) {
      var line = raw.replace(/\s+$/, "");
      var m;
      if (!line.trim()) { flushPara(); return; }
      if ((m = /^# (.+)/.exec(line))) {
        closeTool();
        var gid = "g-" + slug(m[1]);
        toc.push({ group: m[1], id: gid });
        out.push('<h1 class="grp-title" id="' + gid + '">' + inline(m[1]) + "</h1>");
        return;
      }
      if ((m = /^## (.+)/.exec(line))) {
        closeTool();
        var id = slug(m[1]);
        toc.push({ tool: m[1], id: id });
        out.push('<section class="tool-doc" id="' + id + '"><h2>' + inline(m[1]) + "</h2>");
        inTool = true;
        return;
      }
      if ((m = /^### (.+)/.exec(line))) { flushPara(); closeLists(0); out.push("<h3>" + inline(m[1]) + "</h3>"); return; }
      if ((m = /^\*([^*].*)\*$/.exec(line)) && /App:/.test(line)) { flushPara(); out.push('<div class="meta">' + inline(m[1]) + "</div>"); return; }
      if ((m = /^(\s*)([-*]|\d+\.)\s+(.*)/.exec(line))) {
        flushPara();
        var level = Math.floor(m[1].length / 2) + 1;
        var type = /\d/.test(m[2]) ? "ol" : "ul";
        if (level > stack.length + 1) level = stack.length + 1;
        if (stack.length >= level && stack[level - 1].type !== type) closeLists(level - 1);
        if (stack.length < level) { out.push("<" + type + "><li>"); stack.push({ type: type }); }
        else { closeLists(level); out.push("</li><li>"); }
        out.push(inline(m[3]));
        return;
      }
      if (stack.length && /^\s+/.test(raw)) { out.push(" " + inline(line.trim())); return; }
      closeLists(0);
      para.push(line.trim());
    });
    closeTool();
    return { html: out.join(""), toc: toc };
  }
  window.MonarchGuide = { render: render, esc: esc, slug: slug };
})();
