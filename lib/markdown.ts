/** Minimal Markdown → HTML for guide bodies (no extra deps). */

export function stripFrontmatter(src: string): string {
  if (!src.startsWith("---")) return src;
  const end = src.indexOf("\n---", 3);
  if (end === -1) return src;
  return src.slice(end + 4).replace(/^\s+/, "");
}

/** Same slugify used for heading ids — exported for TOC extraction. */
export function slugifyHeading(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function isTintHeading(raw: string): boolean {
  return /레드플래그|체크리스트/.test(raw);
}

export type MarkdownToHtmlOptions = {
  /**
   * When true (guide shells): drop the leading markdown `#` title so the page
   * keeps a single H1, and demote any later `#` to `<h2>`.
   */
  demoteH1?: boolean;
};

export function markdownToHtml(
  src: string,
  options: MarkdownToHtmlOptions = {}
): string {
  const { demoteH1 = false } = options;
  let text = stripFrontmatter(src).replace(/\r\n/g, "\n");
  if (demoteH1) {
    // Strip first ATX H1 (duplicate of GuideArticle shell title)
    text = text.replace(/^#\s+.+(?:\n+|$)/, "");
  }

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
  let tintOpen = false;
  let tintLevel = 0;

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

  const closeTint = () => {
    if (!tintOpen) return;
    closeLists();
    out.push("</div>");
    tintOpen = false;
    tintLevel = 0;
  };

  const flushTable = () => {
    if (!inTable) return;
    if (tableRows.length) {
      const [head, ...body] = tableRows;
      out.push(
        '<div class="my-4 -mx-1 overflow-x-auto rounded-xl border border-slate-200 shadow-sm dark:border-slate-700 sm:mx-0">'
      );
      out.push(
        '<table class="w-full min-w-[20rem] border-collapse text-sm">'
      );
      out.push(
        '<thead class="bg-slate-100 dark:bg-slate-800/80"><tr>'
      );
      for (const c of head) {
        out.push(
          `<th class="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-200">${inline(c)}</th>`
        );
      }
      out.push("</tr></thead><tbody>");
      for (const row of body) {
        if (row.every((c) => /^:?-+:?$/.test(c.trim()))) continue;
        out.push(
          '<tr class="odd:bg-white even:bg-slate-50/80 dark:odd:bg-transparent dark:even:bg-slate-900/40">'
        );
        for (const c of row) {
          out.push(
            `<td class="border-b border-slate-100 px-3 py-2.5 align-top dark:border-slate-800">${inline(c)}</td>`
          );
        }
        out.push("</tr>");
      }
      out.push("</tbody></table></div>");
    }
    inTable = false;
    tableRows = [];
  };

  const listUlClass = () =>
    tintOpen
      ? "list-disc space-y-0.5 pl-5"
      : "list-disc space-y-1 pl-5";

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
      const rawLevel = h[1].length;
      const level = demoteH1 && rawLevel === 1 ? 2 : rawLevel;
      const raw = h[2].replace(/\s*\{#[^}]+\}\s*$/, "").trim();
      const id = slugifyHeading(raw);

      if (tintOpen && level <= tintLevel) {
        closeTint();
      }

      out.push(
        `<h${level} id="${id}" class="scroll-mt-24">${inline(raw)}</h${level}>`
      );

      // Tint section bodies only for authored H2+ (never page-title H1)
      if (rawLevel >= 2 && isTintHeading(raw) && !tintOpen) {
        tintOpen = true;
        tintLevel = level;
        out.push(
          '<div class="my-4 rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">'
        );
      }

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
      out.push(
        `<blockquote class="my-4 rounded-r-lg border-l-4 border-blue-300 bg-blue-50/60 py-3 pl-4 pr-3 text-muted-foreground dark:border-blue-700 dark:bg-blue-950/30">${inline(quote.join(" "))}</blockquote>`
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push(`<ul class="${listUlClass()}">`);
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
        out.push(
          `<ol class="${tintOpen ? "list-decimal space-y-0.5 pl-5" : "list-decimal space-y-1 pl-5"}">`
        );
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
  closeTint();
  return out.join("\n");
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
  t = t.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-primary underline-offset-2 hover:underline">$1</a>'
  );
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-slate-100 px-1 py-0.5 text-[0.9em] dark:bg-slate-800">$1</code>'
  );
  return t;
}


/** Strip simple markdown emphasis/links for schema text that matches visible copy. */
function plainTextFromInlineMd(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract FAQ Q/A pairs from a guide markdown body.
 * Matches visible "### Qn. …" headings under an FAQ section.
 */
export function extractGuideFaqs(src: string): { question: string; answer: string }[] {
  const text = stripFrontmatter(src).replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const faqs: { question: string; answer: string }[] = [];
  let inFaq = false;
  let currentQ: string | null = null;
  let answerParts: string[] = [];

  const flush = () => {
    if (currentQ && answerParts.length) {
      faqs.push({
        question: plainTextFromInlineMd(currentQ),
        answer: plainTextFromInlineMd(answerParts.join(" ")),
      });
    }
    currentQ = null;
    answerParts = [];
  };

  for (const line of lines) {
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      const label = h2[1].replace(/\s*\{#[^}]+\}\s*$/, "").trim();
      if (/FAQ|자주\s*묻는\s*질문/i.test(label)) {
        flush();
        inFaq = true;
        continue;
      }
      if (inFaq) {
        flush();
        inFaq = false;
      }
      continue;
    }

    if (!inFaq) continue;

    const q = /^###\s+(?:Q\d+\.\s*)?(.+)$/i.exec(line);
    if (q) {
      flush();
      currentQ = q[1].trim();
      continue;
    }

    if (/^#{1,4}\s+/.test(line)) {
      flush();
      continue;
    }

    if (!line.trim() || /^---+$/.test(line.trim())) continue;
    if (currentQ) answerParts.push(line.trim());
  }
  flush();
  return faqs;
}

/** Read optional `updated:` / `publishedAt`-style date from YAML frontmatter. */
export function readFrontmatterDate(src: string, key: string): string | undefined {
  if (!src.startsWith("---")) return undefined;
  const end = src.indexOf("\n---", 3);
  if (end === -1) return undefined;
  const fm = src.slice(3, end);
  const m = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(fm);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : undefined;
}
