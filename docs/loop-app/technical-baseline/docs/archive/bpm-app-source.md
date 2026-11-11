> Historical source transcription. For current precedence and corrections, read [the index](../../README.md). Original DOCX files retain source layout and embedded figures.

# BPM App Architecture & Rules

Nov 11, 2026 · @L

This doc defines how the BPM app is built and which rules it enforces, using two reference images (a process-map poster and a dark swimlane editor) as sources only. Visual tokens stay in the companion doc, BPMN Component Variants & Tokens; nothing here adds a color or size to the design system.

## Design system boundary

The app has one design system, the black-and-white ds- tokens. Every reference image is an input to a component family, never a source of tokens. Five layers keep that separation:

| Layer | Prefix | Owns | May read |
| --- | --- | --- | --- |
| Core system | ds- | Neutrals, radii, spacing, type, icon style | nothing |
| Theme | theme- (light, dark) | Which value each ds- color takes | ds- |
| Component family | bpmn-, org-, flow-, map-, editor- | Sizes and layout of one family; colors only as aliases | ds- and its own family |
| Diagram palette | bpmn-color-<family>-* | The six route colors (green, blue, amber, violet, red, gray) | nothing |
| Reference | none, docs only | Values measured from images | never read by code |

Rules that keep the layers apart:

- No reference value in code. A color or size seen in an image is written in the docs as "reference" and re-expressed as an alias to a ds- token or a documented literal.

- Chrome is neutral. The shell, toolbars, panels and inspector use ds- tokens only.

- Hue is allowed in two places: route-palette fills on diagram content, and validation badges (red error, amber warning). Nowhere else.

- One selection style. The selection ring is the ds-color-title color at 2px in every view; the orange selection in the editor reference is not adopted.

- No cross-family reads. org- tokens never read flow- tokens, and so on; shared values move up into ds-.

- Themes swap ds- values only. Component tokens follow through their aliases; a theme never edits a family token directly.

- Every new reference gets a row in the register below before any of its values are used.

Reference register:

| Reference | Family | Adopted | Not adopted |
| --- | --- | --- | --- |
| BPMN symbol sheet | bpmn- | Shapes, markers, gray look | none; values re-measured as tokens |
| ANI organigrama | org- | Node levels, attachment rules, legend logic | Blue and orange, photos, names |
| Architecture-flow screen | ds- | Neutral cards, line icons, type | Its layer arrows |
| Wireframe flow | flow- | Spine and rows layout, five edge kinds | Indigo accent, watermark |
| Project Process poster | map- | Stage columns, bands, document numbering, experience band | Green and orange palette, mixed notation |
| Dark swimlane editor | editor-, theme- | Shell regions, lane look, inspector, minimap | Orange selection, top-bar glow, brand mark |

## App architecture

The dark editor reference shows the shell the app needs: a top bar, a narrow rail, a shape palette, a canvas, a right inspector and floating canvas controls. Each region is one module with one family prefix, editor- for the shell and the family's own prefix for what it draws.

| Region | In the reference | Module |
| --- | --- | --- |
| Top bar | Diagram name, undo, redo, comments, help, theme toggle, account | EditorTopBar |
| Rail | Two view icons at the top, settings at the bottom | EditorRail |
| Palette | Menu, then shape icons: task, three event circles of different line weight, two diamonds, a dashed group, a lane, a connector, a plain box | Palette |
| Canvas | Pools with lanes, edges, a menu button at its top-right corner | Canvas |
| Canvas controls | Select, zoom in, fit to screen, zoom out, at the bottom-right | CanvasControls |
| Minimap | Thumbnail of the whole diagram with the visible area outlined | Minimap |
| Inspector | Five icon tabs; the open tab shows a name field and a rich-text description | Inspector |

The meaning of the palette icons and of the inspector's five tabs is inferred from the screenshot, so confirm them. The app's tabs are proposed as Documentation, Properties, Data, Rules and Filters.

Because the app draws four diagram types (BPMN, process map, org chart, flow map), the shell does not know any of them. Each type registers a DiagramType with its palette, renderer, inspector tabs and rule set, so the families stay separate:

| Part | Responsibility |
| --- | --- |
| DiagramType registry | One entry per type: bpmn, processMap, orgChart, flowMap |
| Model | Elements, flows and documentation; saved as BPMN XML with flat colors |
| Command | Every edit, with its inverse; the history behind undo and redo |
| RuleEngine | Validates, resolves routes and colors, and suggests layout |
| Renderer | Draws the model, badges and selection; reads only tokens |
| ThemeProvider | Applies light or dark values to the ds- tokens |
| ListView | The same model as an accessible outline, always available |

The flow of one edit:

- The user acts (drag a shape, rename, draw a flow).

- The action becomes a Command and is pushed on the history.

- The Model applies it.

- The RuleEngine runs in order: modeling rules, route and color resolution, layout hints.

- The Renderer redraws the canvas and the badges; Minimap, Inspector and ListView update from the model.

The RuleEngine never draws and the Renderer never validates, which is what lets rules be turned on and off without touching the visuals.

## Process map view

The Project Process poster is a different diagram type from a BPMN diagram: a one-page map where columns are stages and rows are bands. The app adds it as processMap, with the map- prefix. It borrows layout and rules, not the poster's green and orange palette or its mixed shapes.

The poster's grid has six stage columns (Discovery, Onboarding, Planning, Implementation, Open Enrollment, Post Enrollment) and five bands:

| Band | Contents | Component |
| --- | --- | --- |
| Stage | Column headers, dark fill, white caps | MapStageHeader |
| Goal | One paragraph of 30 to 45 words per stage | MapGoalCell |
| Flow | Steps, decisions and role markers, with edges that cross columns | MapFlowBand |
| Experience | Four lines across the stages with a marker per stage | MapExperienceBand |
| Documents | Numbered documents, each with a name and a one-line purpose | MapDocumentList |

The flow band uses the same shapes as BpmnTask and BpmnGateway (rectangles and diamonds), so the map does not invent a second notation. The poster's two shape styles (outlined boxes and filled diamonds) are not adopted; both follow the BPMN look from the token doc.

Four rules come from the poster and are worth keeping:

- Role markers. A small person glyph on a step says who is involved. The poster uses 7 role types (All, Finance, Executives, Account Team, Project Management, Compliance, Communications), one hue each. In the app the roles use the route-palette families; with more than 6 roles the glyph carries a letter, so it is never color alone. Role color must stay on the glyph and never fill the step.

- Numbered documents. A step that produces a document shows a numbered badge (1 to 14 in the poster, with 4a, 4b, 6a and 6b for variants). The number matches the entry in the Documents band, in both directions: click either and the other highlights. A document number is unique across the map.

- Stage gate. The last step of each stage is a gate. An edge that leaves a stage column must start at its gate; the poster has one case where it does not, which the rules engine flags as a warning.

- Experience band. One line per measure across the stages, with a marker at each stage boundary. The poster tracks four measures (Energy, Knowledge, Enjoyment, Teamwork) and labels each stage's key moment, either "Bright Moment" or "Focus Moment" with 2 to 3 short notes. Lines use ds- neutrals with four line styles (solid, dashed, dotted, dash-dot) so they differ without hue; a Focus Moment gets the validation amber badge.

Sizing and behavior:

| Token or rule | Value | Notes |
| --- | --- | --- |
| map-stage-header-height | 28px | Dark fill from ds-color-title, white text |
| map-label-column-width | 64px | Row labels: Goal, Flow, Experience, Documents |
| map-band-gap | 8px | Between bands |
| map-stage-min-width | 220px | Narrower columns scroll horizontally |
| map-goal-max-words | 45 | The editor warns above this |
| map-document-text | 11px | Name bold, purpose regular |
| Print | One landscape A3 page; role glyphs stay legible in grayscale | The poster was made for print |

The poster's text is too small to read exactly, so the stage names, the role list, the 14 documents and the four measures come from what could be read; any exact wording should come from your own data.
