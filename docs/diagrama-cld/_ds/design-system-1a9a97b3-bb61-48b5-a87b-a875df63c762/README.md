# RiscoCognitivoBlog (mainline-astro-template@1.2.0)

This design system is the published mainline-astro-template React library, bundled as a single
browser global. All 74 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.RiscoCognitivoBlog`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.RiscoCognitivoBlog.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { AboutHero } = window.RiscoCognitivoBlog;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<AboutHero />);
```

## Tokens

348 CSS custom properties from mainline-astro-template. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (77): `--tw-border-style`, `--tw-shadow-color`, `--tw-inset-shadow-color`, …
- **spacing** (17): `--tw-space-y-reverse`, `--tw-space-x-reverse`, `--tw-inset-shadow`, …
- **typography** (25): `--tw-font-weight`, `--tw-tracking`, `--font-mono`, …
- **radius** (9): `--radius-sm`, `--radius-md`, `--radius-lg`, …
- **shadow** (12): `--tw-shadow`, `--tw-shadow-alpha`, `--tw-ring-shadow`, …
- **other** (208): `--tw-translate-x`, `--tw-translate-y`, `--tw-translate-z`, …

## Components

### blocks
- `AboutHero`
- `AboutSection`
- `BlogPost`
- `BlogPosts`
- `Contact`
- `Features`
- `Footer`
- `Hero`
- `Investors`
- `LoginSection`
- `Logos`
- `Navbar`
- `Pricing`
- `PricingTable`
- `ResourceAllocation`
- `SignupSection`
- `Testimonials`

### general
- `Accordion`
- `Alert`
- `AlertDialog`
- `AspectRatio`
- `Avatar`
- `Background`
- `Badge`
- `Breadcrumb`
- `Button`
- `ButtonGroup`
- `Calendar`
- `Card`
- `Carousel`
- `ChartContainer`
- `Checkbox`
- `Collapsible`
- `Command`
- `ContextMenu`
- `DashedLine`
- `Dialog`
- `Drawer`
- `DropdownMenu`
- `Empty`
- `Field`
- `Form`
- `HeaderLink`
- `HoverCard`
- `Input`
- `InputGroup`
- `InputOTP`
- `Item`
- `Kbd`
- `Label`
- `Logo`
- `Menubar`
- `NavigationMenu`
- `Pagination`
- `Popover`
- `Progress`
- `RadioGroup`
- `ResizablePanelGroup`
- `ScrollArea`
- `Select`
- `Separator`
- `Sheet`
- `Sidebar`
- `Skeleton`
- `Slider`
- `Spinner`
- `Switch`
- `Table`
- `Tabs`
- `Textarea`
- `ThemeToggle`
- `Toggle`
- `ToggleGroup`
- `Tooltip`
