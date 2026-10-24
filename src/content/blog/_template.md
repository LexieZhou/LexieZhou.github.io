---
title: Note title
date: 2026-01-01
tags: [tag-one, tag-two]
summary: One line shown under the title in the list.
draft: true
---

Files starting with `_` are never loaded, so this template stays off the site.
Copy it to `my-note-slug.md` (the filename becomes the URL: `#/blog/my-note-slug`).
Remove `draft: true` to publish; drafts only show in `npm run dev`.

## A heading

`##` and `###` headings appear in the outline on the right.

Link to another note with [[other-note-slug]] or [[other-note-slug|custom text]].
Each link also draws an edge in the graph.

Inline math $E = mc^2$ and a block:

$$
\text{softmax}(x)_i = \frac{e^{x_i}}{\sum_j e^{x_j}}
$$

### Code

```python
def hello():
    return "highlighted by language"
```

### Images

Put files in `public/img/blog/` and reference them from the root:

![Alt text](/img/blog/example.png)

| Tables | work |
| --- | --- |
| too | ✓ |
