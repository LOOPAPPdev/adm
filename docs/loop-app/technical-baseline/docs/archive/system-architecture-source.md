> Historical source transcription. For current precedence and corrections, read [the index](../../README.md). Original DOCX files retain source layout and embedded figures.

# System Architecture & Rules

Nov 11, 2026 · @Leonardo

## Document map

This document owns the app's architecture and rules. It does not own tokens, component specs or reference images; each of those lives in its own document, and this one only points to them.

| Document | Owns | Does not own |
| --- | --- | --- |
| System Architecture & Rules (this doc) | Layers, boundary rules, app modules, edit flow, reference register | Token values, component props |
| Design system | ds- and theme- tokens; FlowMap and BPMN token files (tokens/) | Rules, app modules |
| Component specs | Variants, states, accessibility per family (BPMN Component Variants & Tokens) | Architecture, references |
| References | Source images and the notes on what was measured | Values used in code |

## Layers and boundary rules

The app has one design system, the black-and-white ds- tokens. Every reference image feeds a component family and never supplies tokens. Five layers keep that separation.

| Layer | Prefix | Owns | May read |
| --- | --- | --- | --- |
| Core system | ds- | Neutrals, radii, spacing, type, icon style | nothing |
| Theme | theme- (light, dark) | Which value each ds- color takes | ds- |
| Component family | bpmn-, org-, flow-, map-, editor- | Sizes and layout of one family; colors only as aliases | ds- and its own family |
| Diagram palette | bpmn-color-<family>-* | The six route colors: green, blue, amber, violet, red, gray | nothing |
| Reference | none (docs only) | Values measured from images | never read by code |

- No reference value in code. A value seen in an image is written in the docs as "reference" and re-expressed as an alias to a ds- token or a documented literal.

- Chrome is neutral. Shell, toolbars, panels and inspector use ds- tokens only.

- Hue is allowed in two places: route-palette fills on diagram content, and validation badges (red error, amber warning).

- One selection style. The selection ring is the ds-color-title color at 2px in every view.

- No cross-family reads. org- tokens never read flow- tokens, and so on; shared values move up into ds-.

- Themes swap ds- values only. Component tokens follow through their aliases.

- Every new reference gets a row in the register below before any of its values are used.

## App architecture

The shell has seven regions, each one module. The shell does not know any diagram type; each type registers its palette, renderer, inspector tabs and rule set.

edit flow · 5 steps, 1 registry, 3 views

Every edit becomes a Command on the history, the Model applies it, the RuleEngine checks it, and the Renderer redraws. Rules can be turned on or off without touching the visuals.

| Region | Module |
| --- | --- |
| Top bar | EditorTopBar |
| Rail | EditorRail |
| Palette | Palette |
| Canvas | Canvas |
| Canvas controls | CanvasControls |
| Minimap | Minimap |
| Inspector | Inspector |

Other parts: ThemeProvider applies light or dark values to the ds- tokens. The Model is saved as BPMN XML with flat colors.

## Reference register

Each reference has one row. Hue, brand marks and photos from a reference are never adopted.

| Reference | Family | Adopted | Not adopted |
| --- | --- | --- | --- |
| BPMN symbol sheet | bpmn- | Shapes, markers, gray look | none; values re-measured as tokens |
| ANI organigrama | org- | Node levels, attachment rules, legend logic | Blue and orange, photos, names |
| Architecture-flow screen | ds- | Neutral cards, line icons, type | Its layer arrows |
| Wireframe flow | flow- | Spine and rows layout, five edge kinds | Indigo accent, watermark |
| Project Process poster | map- | Stage columns, bands, document numbering, experience band | Green and orange palette, mixed notation |
| Dark swimlane editor | editor-, theme- | Shell regions, lane look, inspector, minimap | Orange selection, top-bar glow, brand mark |
| Loop and registry layer screenshots (4) | stack- | Eyebrow, title and items card; arrows; grid; bidirectional caption | Amber and green card fills |

## Open decisions

- ☐ Selection color. The BPMN spec proposes bpmn-color-accent #2563EB; rule 4 says the ring is ds-color-title at 2px. Pick one.

- ☐ Core tokens. The ds- and theme- tokens that every family aliases have not been sent yet.

- ☐ Editor icons and inspector tabs. Their meaning is inferred from a screenshot. Proposed tabs: Documentation, Properties, Data, Rules, Filters.

- ☐ Timer on intermediate throw. The BPMN sheet draws it; BPMN 2.0 has no throwing timer. Keep or hide.

- ☐ Empty gateway diamond. Alias of exclusive (suggested) or a separate type.

- ☐ Stack- family tokens. Sizes in the layer-stack pattern are read by eye and need measuring.
