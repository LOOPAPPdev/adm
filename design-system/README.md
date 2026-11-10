# Design system

Copied from the Risco Cognitivo portfolio (`public/labs/_ds` and `src/styles/site.css`). This folder is the
single source for every interface in this monorepo: change a token here and every app that imports it follows.

| Path | What it holds |
|---|---|
| `tokens/colors.css` | Colour ramps and roles (`--color-bg`, `--color-text`, `--color-accent` …). Light by default; dark with `data-theme="dark"`. |
| `tokens/typography.css` | Inter for text and headlines, IBM Plex Mono for system IDs and metadata; type scale. |
| `tokens/spacing.css` | Spacing scale, radii (`--radius-sm` … `--radius-pill`) and shadows. |
| `tokens/patterns.css`, `tokens/executar.css` | Pattern and product tokens. |
| `tokens/fonts.css` | Google Fonts import, for static pages (Next.js apps load the fonts with `next/font` instead). |
| `tokens/base.css` | Base element styles (body, headings, links). |
| `components/components.css` | Component classes (buttons, tags, tables, cards, dialogs …). |
| `ds-components.js` | The ten React components as a browser bundle, for static pages. |
| `patterns/site.css` | Page patterns from the portfolio (sections, galleries, case-study layout). |
| `styles.css` | One entry point that imports all of the above in order. |

## Use it

**Static page** (no build): link the entry point.

```html
<link rel="stylesheet" href="../design-system/styles.css">
```

**Next.js app** (`apps/web` does this): import the tokens into `globals.css`, put base and components in
Tailwind's layers so utilities still win, and map the roles to Tailwind names with a `ds-` prefix
(`bg-ds-surface`, `text-ds-muted`, `border-ds-line`, `rounded-ds-lg` …). Never name a Tailwind theme variable
exactly like a DS variable (`--color-accent`): it would overwrite it.

## Rules

- Use the role tokens, not raw hex values or Tailwind's palette (`zinc`, `emerald` …).
- Inter for text, IBM Plex Mono for IDs, counts and metadata.
- Light and dark come from `data-theme`; `apps/web` sets it from the system preference before paint.
