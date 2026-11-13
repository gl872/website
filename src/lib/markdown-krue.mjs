// Sätteri HAST plugin (Astro 7's Markdown processor). It maps plain Markdown in blog posts
// onto the post template's styles (see krue-site-handoff/cms/example-post.md):
//
//   > quote                        → <figure class="p-quote"><blockquote>…</blockquote></figure>
//   > **Try this:** text           → <div class="p-try"><b>Try this</b><p>text</p></div>
//   ![alt](src "caption")          → <figure class="p-fig"><div><img></div><figcaption>caption</figcaption></figure>
//     (only when the image is alone in its paragraph and has a title)

const isEl = (n, tag) => n && n.type === "element" && (!tag || n.tagName === tag);
const isBlank = (n) => n.type === "text" && !n.value.trim();
const textOf = (n) => (n.type === "text" ? n.value : (n.children || []).map(textOf).join(""));
const el = (tagName, properties, children) => ({ type: "element", tagName, properties, children });
const hasClass = (n, c) => {
  const cls = n.properties && n.properties.className;
  return Array.isArray(cls) ? cls.includes(c) : typeof cls === "string" && cls.split(/\s+/).includes(c);
};

const TRY_RE = /^\s*try this\s*:?\s*$/i;

/** Returns the replacement for a blockquote: a "Try this" tip box or a pull-quote card. */
export function transformBlockquote(node) {
  const kids = node.children.filter((n) => !isBlank(n));
  const first = kids[0];
  if (isEl(first, "p")) {
    const lead = first.children.find((n) => !isBlank(n));
    if (isEl(lead, "strong") && TRY_RE.test(textOf(lead))) {
      // Drop the "Try this:" label (and a colon left outside the bold) from the paragraph.
      const rest = first.children.slice(first.children.indexOf(lead) + 1);
      if (rest[0] && rest[0].type === "text") rest[0] = { ...rest[0], value: rest[0].value.replace(/^\s*:?\s*/, "") };
      const paras = [];
      if (rest.some((n) => !isBlank(n))) paras.push({ ...first, children: rest });
      paras.push(...kids.slice(1));
      return el("div", { className: ["p-try"] }, [el("b", {}, [{ type: "text", value: "Try this" }]), ...paras]);
    }
  }
  return el("figure", { className: ["p-quote"] }, [node]);
}

/** Returns a captioned figure for a paragraph holding only a titled image, or null. */
export function transformImageParagraph(node) {
  const kids = node.children.filter((n) => !isBlank(n));
  if (kids.length !== 1 || !isEl(kids[0], "img")) return null;
  const img = kids[0];
  const caption = img.properties && img.properties.title;
  if (!caption) return null;
  const { title: _omit, ...props } = img.properties;
  return el("figure", { className: ["p-fig"] }, [
    el("div", { style: "border-radius:20px;overflow:hidden" }, [{ ...img, properties: { loading: "lazy", ...props } }]),
    el("figcaption", {}, [{ type: "text", value: String(caption) }]),
  ]);
}

export const krueMarkdown = {
  name: "krue-post-styles",
  element: [
    {
      filter: ["blockquote"],
      visit(node, ctx) {
        // Already wrapped (the replacement contains the original blockquote).
        const parent = ctx.parent(node);
        if (parent && isEl(parent, "figure") && hasClass(parent, "p-quote")) return;
        ctx.replaceNode(node, transformBlockquote(node));
      },
    },
    {
      filter: ["p"],
      visit(node, ctx) {
        const fig = transformImageParagraph(node);
        if (fig) ctx.replaceNode(node, fig);
      },
    },
  ],
};
