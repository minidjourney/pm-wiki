/** Minimal Markdown → HTML for guide bodies (no extra deps). */
export function stripFrontmatter(src: string): string {
  if (!src.startsWith("---")) return src;
  const end = src.indexOf("\n---", 3);
  if (end === -1) return src;
  return src.slice(end + 4).replace(/^\s+/, "");
}

export function markdownToHtml(src: string): string {
  let text = stripFrontmatter(src).replace(/\r\n/g, "\n");

  // fenced code
  text = text.replace(/```[\w-]*\n([\s\S]*?)```/g, (_m, code: string) => {
    const escaped = escapeHtml(code.replace(/\n$/, ""));
    return `<pre class="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>${escaped}</code></pre>`;
  });

  const lines = text.split("\n");
  const out: string[] = [];
  let i = 0;
  let inUl = false;
  let inOl = false;
  let inTable = false;
  let tableRows: string[][] = [];

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  const flushTable = () => {
    if (!inTable) return;
    if (tableRows.length) {
      const [head, ...body] = tableRows;
      out.push('<div class="overflow-x-auto"><table class="w-full text-sm">');
      out.push("<thead><tr>");
      for (const c of head) out.push(`<th class="border-b px-3 py-2 text-left font-semibold">${inline(c)}</th>`);
      out.push("</tr></thead><tbody>");
      for (const row of body) {
        if (row.every((c) => /^:?-+:?$/.test(c.trim()))) continue;
        out.push("<tr>");
        for (const c of row) out.push(`<td class="border-b border-slate-100 px-3 py-2 align-top dark:border-slate-800">${inline(c)}</td>`);
        out.push("</tr>");
      }
      out.push("</tbody></table></div>");
    }
    inTable = false;
    tableRows = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("|")) {
      closeLists();
      inTable = true;
      tableRows.push(line.split("|").slice(1, -1).map((c) => c.trim()));
      i += 1;
      continue;
    }
    if (inTable) flushTable();

    if (/^---+$/.test(line.trim())) {
      closeLists();
      out.push('<hr class="my-8 border-slate-200 dark:border-slate-800" />');
      i += 1;
      continue;
    }

    const h = /^(#{1,4})\s+(.+)$/.exec(line);
    if (h) {
      closeLists();
      const level = h[1].length;
      const raw = h[2].replace(/\s*\{#[^}]+\}\s*$/, "").trim();
      const id = slugify(raw);
      out.push(`<h${level} id="${id}" class="scroll-mt-24">${inline(raw)}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      closeLists();
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(`<blockquote class="border-l-4 border-slate-300 pl-4 text-muted-foreground dark:border-slate-600">${inline(quote.join(" "))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push('<ul class="list-disc space-y-1 pl-5">');
        inUl = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      i += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push('<ol class="list-decimal space-y-1 pl-5">');
        inOl = true;
      }
      out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      i += 1;
      continue;
    }

    if (!line.trim()) {
      closeLists();
      i += 1;
      continue;
    }

    closeLists();
    out.push(`<p class="leading-relaxed">${inline(line)}</p>`);
    i += 1;
  }
  closeLists();
  flushTable();
  return out.join("\n");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string): string {
  let t = escapeHtml(s);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline-offset-2 hover:underline">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-[0.9em] dark:bg-slate-800">$1</code>');
  return t;
}
