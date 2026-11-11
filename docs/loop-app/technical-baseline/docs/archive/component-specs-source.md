> Historical source transcription. For current precedence and corrections, read [the index](../../README.md). Original DOCX files retain source layout and embedded figures.

# BPMN Component Variants & Tokens

Nov 11, 2026 · @L

This spec turns the Sanderworks BPMN symbol sheet into four components (Task, Event, Gateway, Data) with a shared token set. Values are measured from the sheet image and marked approximate; states are proposed, since the sheet shows only the default look.

## Design tokens

The sheet is a flat gray wireframe: one light fill, one mid-gray stroke, and glyphs that are either outlined or solid. Outlined vs solid is meaning in BPMN (catch vs throw, initiating vs non-initiating), so it gets its own token and must never be themed away.

| Token | Value (approx.) | Usage |
| --- | --- | --- |
| bpmn-color-fill | #F2F2F2 | Fill of tasks, events, gateways, data objects |
| bpmn-color-stroke | #6B6B6B | All outlines (about 4.8:1 on the fill) |
| bpmn-color-glyph-outline | #6B6B6B | Catch / start / initiating markers |
| bpmn-color-glyph-solid | #555555 | Throw / end / non-initiating markers |
| bpmn-color-label | #222222 | Task and event labels |
| bpmn-stroke-width-default | 1.5px | Tasks, start events, gateways, data |
| bpmn-stroke-width-end | 4px | End events only (thick ring) |
| bpmn-stroke-dash-noninterrupting | 4 3 | Non-interrupting start events |
| bpmn-ring-gap | 5px | Gap between the two rings of an intermediate event |
| bpmn-size-task | 160 × 100px | Task rectangle |
| bpmn-radius-task | 6px | Task corner radius |
| bpmn-size-event | 64px diameter | All events |
| bpmn-size-gateway | 72 × 72px | Diamond bounding box |
| bpmn-size-data | 48 × 64px | Data object; folded corner about 12px |
| bpmn-size-glyph-event | 28px | Marker inside an event |
| bpmn-size-glyph-task | 24px | Marker at top-left of a task, 12px inset |

The measurements come from the image at its native width (670px), so snap them to your grid (for example 160×96 or 160×100) and keep one source of truth in the token file.

## Task variants

BpmnTask has eight types that share one shape; only the 24px marker at the top-left changes, and the label stays centered.

| type | Marker | Notes |
| --- | --- | --- |
| task | none | Generic, label only |
| send | solid envelope | Solid glyph: it throws a message |
| receive | outlined envelope | Outlined glyph: it waits for a message |
| service | two gears | Automated, system call |
| user | person bust | Human performs it in a UI |
| manual | hand | Human work with no system |
| script | scroll | Engine-executed script |
| businessRule | table grid | Decision table or rules engine |

Props: type, label (string, required), state (see States). Loop, multi-instance and compensation markers are not on the sheet, so they are out of scope until you add them.

The label is centered with 12px side padding, wraps to 3 lines, then truncates with an ellipsis and shows the full text in a tooltip. Keep the marker clear of the label by reserving the top 28px.

## Event variants

BpmnEvent is one 64px circle driven by three props: position (start, intermediate, end), trigger and, for intermediate events, direction (catch or throw). The position sets the ring; the trigger sets the glyph; the direction sets whether the glyph is outlined or solid.

| Position | Ring | Glyph |
| --- | --- | --- |
| start | Single, 1.5px | Outlined |
| start, interrupting: false | Single, dashed bpmn-stroke-dash-noninterrupting | Outlined |
| intermediate, catch | Double, bpmn-ring-gap apart | Outlined |
| intermediate, throw | Double, bpmn-ring-gap apart | Solid |
| end | Single, bpmn-stroke-width-end | Solid |

Valid triggers per position, as drawn on the sheet:

| trigger | Glyph | Start | Start non-int. | Catch | Throw | End |
| --- | --- | --- | --- | --- | --- | --- |
| none | empty | yes | yes | yes | yes | yes |
| conditional | document with lines | yes | yes | yes | no | no |
| message | envelope | yes | yes | yes | yes | yes |
| multiple | pentagon | yes | yes | yes | yes | yes |
| parallelMultiple | plus | yes | yes | yes | no | no |
| timer | clock | yes | yes | yes | yes | no |
| signal | triangle | yes | yes | yes | yes | yes |
| link | right arrow | no | no | yes | yes | no |
| compensation | double rewind | no | no | no | yes | yes |
| escalation | up arrow | no | no | no | yes | yes |
| error | lightning bolt | no | no | no | no | yes |
| terminate | filled circle | no | no | no | no | yes |

The component should reject invalid combinations at the type level (a discriminated union on position), not draw them.

Open question: the sheet draws a clock in the intermediate throw column, but BPMN 2.0 has no throwing timer. Decide whether to keep it or hide it; the table above follows the sheet. Non-interrupting is drawn only for start events on the sheet, so boundary events are not covered.

## Gateway variants

BpmnGateway is a 72px diamond with a centered marker; type selects the marker. Gateways carry no text; the label sits outside, below the diamond, so keep 8px clear around it.

| type | Marker | Meaning |
| --- | --- | --- |
| exclusive | empty, or solid X | One outgoing path (XOR); the sheet shows both forms |
| parallel | solid plus | All paths (AND) |
| inclusive | thick circle | One or more paths (OR) |
| complex | solid asterisk | Custom condition |
| eventBased | double ring with pentagon | First event to occur wins |
| eventBasedExclusiveStart | single ring with pentagon | Event-based gateway that starts a process |
| eventBasedParallelStart | single ring with plus | Parallel event-based gateway that starts a process |

Decision to confirm: choose whether the empty diamond is a separate type or an alias of exclusive. We suggest aliasing it, so a model never has two ways to say the same thing.

## Data variants

BpmnData covers the nine data shapes on the sheet with two props: kind and collection (boolean). A collection adds three vertical bars at the bottom center of the page shape.

| kind | collection | Look |
| --- | --- | --- |
| object | false / true | Folded-corner page, no arrow |
| input | false / true | Page with outlined arrow at the top |
| output | false / true | Page with solid arrow at the top |
| message | n/a | Envelope; outlined = initiating, solid = non-initiating (initiating prop) |
| store | n/a | Cylinder, 72 × 64px |

Data shapes sit beside the flow and connect with dotted association lines, not sequence arrows. The sheet does not show those lines, so their style is an open item for the connector spec.

## States and interactions

All four components share one state prop. The sheet shows only the default look, so everything below is proposed and uses new tokens for the editor chrome.

| State | Change | Token |
| --- | --- | --- |
| default | As drawn on the sheet | none |
| hover | Fill darkens | bpmn-color-fill-hover #E6E6E6 |
| selected | 2px accent stroke, plus 8px square resize handles on tasks | bpmn-color-accent #2563EB |
| focus | 2px accent ring, 3px outside the shape; never replaces the selected stroke | bpmn-color-accent |
| disabled | 40% opacity, no pointer events | bpmn-opacity-disabled 0.4 |
| error | Stroke turns red; a 16px badge sits at the top-right corner | bpmn-color-error #C62828 |

| Action | Behavior |
| --- | --- |
| Click | Select; shift-click adds to the selection |
| Double-click | Edit the label inline; Esc cancels, Enter commits |
| Drag | Move, snapping to an 8px grid |
| Drag from a shape edge | Start a sequence flow |
| Hover or focus transition | 120ms, ease-out, on fill and stroke only |

Changing a task type or event trigger keeps position, size and connections; only the glyph swaps, with no animation.

## Accessibility and edge cases

BPMN meaning lives in small glyphs, so each shape must also say it in text. Never rely on outlined vs solid alone.

- Accessible name: each shape gets role="img" inside the canvas and an aria-label built from its variant plus label, for example "Service task: Validate order" or "Intermediate message catch event: Payment received". Gateways with no label read "Exclusive gateway".

- Keyboard: Tab moves through shapes in the order of the flow (left to right, then top to bottom); arrow keys move the selected shape by 8px; Enter edits the label; Delete removes it after a confirmation if it has connections.

- Contrast: stroke on fill is about 4.8:1, above the 3:1 minimum for graphics; the accent and error colors must be rechecked against any dark theme you add.

- Color is never the only signal: error also shows the badge, and disabled also blocks the pointer.

- Screen reader announcements: announce the new state on change ("selected", "error: no outgoing flow"), not the glyph change.

Edge cases:

- Empty label: tasks show a faint placeholder "Untitled task" in edit mode only; events and gateways show nothing.

- Long text: tasks wrap to 3 lines then truncate; event and gateway labels sit below the shape, max 120px wide, wrapping to 2 lines.

- Long translations: test German and Portuguese labels, which run about 30% longer than English.

- Zoom: below 50%, hide glyph detail on events but keep the ring type (single, double, thick), which is the part people read first.

- Export: SVG export must inline tokens as values, so the file renders correctly outside the app.

## Color rules

BPMN lets any element be colored, and the color may carry extra meaning, but the standard assigns none. An extension also may not change a shape or its markers. So the app defines its own color rules, and color goes only on fill and connectors; the outlined vs solid glyphs and ring styles keep their BPMN meaning.

A diagram has one colorBy mode. The mode decides which attribute picks the color:

| colorBy | What decides the color | Result |
| --- | --- | --- |
| route | Path class resolved from the graph (below) | Green main path, red exception path, gray alternates |
| role | Lane or participant | One family per lane, taken from the palette in lane order |
| type | Task type | Amber for user and manual, blue for service, script and business rule, violet for send and receive, gray for the rest |
| state | Runtime status | Gray not started, blue active, green completed, red failed |

Two overrides sit above every mode, in this order: a failed state always turns the element red, and a manual colorOverride on one element wins over everything.

How route is resolved: start events seed the main path; the default or first outgoing flow of each gateway stays main; other branches are alternates; boundary error and escalation events, and everything they lead to, are exception paths. Where paths merge, main wins over alternate and exception, so the steps after a merge are main again.

If you meant something else by "routing" (for example, color by the sequence-flow route a user drew), tell me and I'll change the route rule.

## Route palette

Five color families plus the neutral gray from the token table. Each family is a top-to-bottom gradient like the green reference, from a light top stop to a base stop. Tokens follow bpmn-color-<family>-top and bpmn-color-<family>-base. The proposed values below are my own picks, not from the sheet or the reference.

| Family | Top | Base | Default meaning | Text #222 on base (approx.) |
| --- | --- | --- | --- | --- |
| green | #C9F2D6 | #66D98A | Main path, completed | 9.0:1 |
| blue | #D3E6FB | #7DB7F5 | System tasks, active | 7.5:1 |
| amber | #FBE8B8 | #F5C65C | Human tasks | 9.9:1 |
| violet | #E2D6F9 | #B79CF2 | External participants, messages | 7.1:1 |
| red | #F9CFCB | #F28B82 | Exception path, failed | 6.9:1 |
| gray | #F2F2F2 | #F2F2F2 | Alternate, not started, unclassified | flat, no gradient |

When a shape takes a colored fill, three things change so the BPMN notation stays readable:

- The stroke and solid glyphs switch to bpmn-color-stroke-on-color #3D3D3D. The default #6B6B6B stroke drops below 3:1 on red and about 3:1 on green.

- The label stays bpmn-color-label #222222.

- Red is reserved for exception and failed. In role mode, lanes cycle through green, blue, amber and violet; with more than four lanes the colors repeat, and the lane header is what tells them apart.

Contrast ratios were calculated by hand for this spec; run them through your contrast checker before shipping.

## Dynamic behavior

Colors are computed, never stored per element, so they follow the model as it changes.

| Trigger | What is recomputed | Transition |
| --- | --- | --- |
| colorBy mode changes | Every element | 200ms cross-fade |
| A flow is added, removed or reconnected | Route class of the downstream elements only | 200ms |
| A node moves to another lane | That node, in role mode | 200ms |
| A runtime status event arrives | That node and its outgoing connector, in state mode | 200ms |
| A rule or palette token is edited | Whole diagram | none, applied at once |

With prefers-reduced-motion, all transitions are 0ms. During a drag, recompute at most every 100ms; these timings are targets to tune.

From the green reference, the app takes three ideas:

- Gradient direction: top light to bottom base, with dark text on top.

- Connectors that carry color: a sequence flow draws a gradient from its source's base color to its target's base color when they differ, and a single flat base color when they match.

- Loops as continuous bands: a rework loop is drawn as one smooth arc with its arrow inside the band, not as a straight-segment connector.

It does not take the blob-shaped boxes. Those break BPMN geometry, and the extension rule above forbids changing a shape. Events stay circles, gateways stay diamonds, tasks stay rounded rectangles.

Color is never the only signal: the first connector of an exception path also carries a text tag "exception", and failed elements show the error badge from States.

## Saving colors and sources

BPMN in Color is the interchange format the OMG model-interchange group adopted in 2014 for passing colors between BPMN tools, and bpmn-js has saved colors that way since version 8.7. Save one flat fill and one stroke per element in the file, and compute the gradient when drawing, so other tools open the diagram with sensible colors. I could not confirm the exact XML names from the pages I opened; read them from the specification's XSD before writing the exporter.

Since colors are computed from rules, decide whether export writes the computed colors (readable everywhere, but frozen) or only colorOverride values (small, but other tools show no color). We suggest writing computed colors on export and ignoring them on import unless a colorOverride flag is set.

Sources, all opened for this section:

- BPMN in Color repository, OMG model interchange group: adoption and where the schema lives

- bpmn.io: colors in bpmn-js: how bpmn-js sets and saves colors

- bpmn-js-in-color on npm: example of reading BPMN in Color data

- Trisotech BPMN rule book, Extensions to BPMN: color may carry extra semantics; extensions may not change shapes

- Trisotech BPMN style rules: Method and Style rules, which do not cover color

## Organigrama (team chart)

The Organigrama is a fifth component family, OrgChart, for showing who reports to whom. It takes its structure from the ANI (Agencia Nacional de Infraestructura) organization chart and its look from the black-and-white design system shown in the "Fluxo conceitual da arquitetura" screen.

| Source | What we take | What we leave |
| --- | --- | --- |
| ANI organigrama | Levels, node shapes, avatar placement, dashed reporting lines, legend by legal basis | Blue and orange palette, logo, photos, the real names |
| Architecture-flow screen | Neutral fills, rounded cards, line icons, title plus gray subtitle, outlined emphasis card | Its layer arrows, which suit a stack but not a tree |

Rule of thumb: level decides the shape, authority decides the fill. That keeps the ANI logic (the legend says why a unit exists) while the whole chart stays monochrome and prints cleanly in grayscale.

The ANI image shows real people and photos, so this spec refers to avatars and person names only as slots. Test data should use made-up names.

## Reference structure (ANI chart)

The chart is a top-down tree with six kinds of node. Each kind has its own shape and its own way of attaching to the tree.

| Level | In the ANI chart | Shape | Person shown | Attaches by |
| --- | --- | --- | --- | --- |
| board | Consejo Directivo | Circle, 2-line title | no | Top of the central axis |
| advisory | Two Consejo Asesor bodies | Pill, wide | no | Dashed horizontal line to the axis, one on each side of the board |
| head | Presidencia | Rounded rectangle, title plus name | yes, avatar overlapping the top edge | Central axis, below the board |
| staff | Communications and Internal Control offices | Pill, avatar at the inner end | yes | Dashed horizontal line to the axis, one on each side, below the head |
| division | Six vicepresidencias | Rounded rectangle, title plus name | yes, avatar overlapping the top edge | Dashed horizontal bus under the head, one dot per branch |
| team | 34 groups and teams | Small rounded rectangle, 1 to 4 lines | no | Dashed vertical trunk under its division, one short tick per team |

Details worth keeping:

- The six divisions sit in one row; their team stacks run from 3 to 9 nodes, so the columns are uneven.

- Team names are long and are bold only on the distinguishing words (for example the last words of "Grupo Interno de Trabajo ... Defensa Judicial").

- Connectors are dashed with round dot terminals where a branch leaves the bus.

- The legend (Convenciones) has four chips. Fill color tells the legal basis of the unit: a primary decree, a later decree, a resolution, and a set of teams attached to senior management.

Counts are read from the image: 6 divisions and 34 team nodes (4, 5, 9, 6, 7 and 3 per division, left to right).

## Main design system style

The architecture-flow screen is the visual language for every new component: an off-white frame, light-gray rounded cards, black line icons, a semibold black title and a gray subtitle. Two card looks exist, filled gray for regular layers and white with a gray outline for the layers that need emphasis.

Values are estimated by eye from a screenshot 1,640px wide. I assumed it was captured at 2x and halved the pixel sizes; if it was 1x, double the sizes. The font looks like a neutral grotesque sans (Inter or SF Pro style); confirm the family.

| Token | Value (approx.) | Usage |
| --- | --- | --- |
| ds-color-frame | #FCFCFC | Outer container background |
| ds-color-frame-border | #E3E3E3, 1px | Outer container outline |
| ds-color-card-soft | #F3F3F3 | Regular card fill |
| ds-color-card-outline | #FFFFFF fill, #D0D0D0 border | Emphasis card |
| ds-color-title | #111111 | Card title, icons |
| ds-color-subtitle | #666666 | Card subtitle (about 5.2:1 on #F3F3F3) |
| ds-radius-frame | 14px | Outer container |
| ds-radius-card | 12px | Cards |
| ds-space-frame | 12px | Frame padding |
| ds-space-gap | 8px | Between cards in a row or column |
| ds-card-min-height | 88px | Card with icon, title and subtitle |
| ds-font-title | 15px / 600 | Card title |
| ds-font-subtitle | 12px / 400 | Card subtitle |
| ds-icon-size | 18px, 1.5px line | Line icon above the title |

Card content is centered: icon, then title, then subtitle, stacked. The org chart reuses this anatomy for division and team nodes, so a node reads as a small version of these cards.

## Organigrama variants

Every node has two props that combine freely: level (shape and attachment) and authority (fill). The ANI legend becomes four monochrome styles built only from the main system's neutrals, so a legal-basis category never needs a hue.

| authority | ANI legend color | Style | Fill | Text | Border |
| --- | --- | --- | --- | --- | --- |
| primary | Blue | Inverse | org-color-inverse #111111 | #FFFFFF | none |
| secondary | Orange | Strong outline | #FFFFFF | #111111 | 2px #111111 |
| resolution | Light gray | Soft | ds-color-card-soft #F3F3F3 | #111111 | none |
| working | Dark gray | Muted | org-color-muted #6B6B6B | #FFFFFF (about 5.3:1) | none |

The authorityLabel text (for example "Decreto 4165 de 2011") comes from data, never from the component, and the legend chips use the same four styles.

| level | Size (px) | Avatar | Notes |
| --- | --- | --- | --- |
| board | 96 circle | none | Title only, 2 lines, centered |
| advisory | min 200 × 40, pill | none | Joined to the board by a dashed horizontal line; set side |
| head | 240 × 64 | 56, overlaps the top edge by 28 | Title bold, person name regular |
| staff | 240 × 48, pill | 48, at the inner end | Joined to the head by a dashed horizontal line; set side |
| division | 184 × 64 | 48, overlaps the top edge by 24 | Same anatomy as head, narrower |
| team | 176 × min 40 | none | Up to 4 lines, then truncates with a tooltip |

Attachment rules: advisory hangs from board; staff and division hang from head; team hangs from a division and has no children. There is one board and one head.

Props for OrgNode: id, parentId, level, authority, authorityLabel, title (with **bold** for the emphasized words), person (name, optional avatarUrl), side (left or right, for advisory and staff), collapsed. Props for OrgChart: nodes, showLegend (default true), highlightPath (default true).

Layout and line tokens:

| Token | Value | Usage |
| --- | --- | --- |
| org-line-color | #8C8C8C (about 3.3:1 on the frame) | Reporting lines |
| org-line-width | 1.5px | Reporting lines |
| org-line-dash | 4 4 | Reporting lines |
| org-dot-size | 8px, #111111 | Branch dot where a line leaves a bus |
| org-col-gap | 16px | Between division columns |
| org-team-gap | 8px (ds-space-gap) | Between stacked teams |
| org-trunk-offset | 12px | Trunk line distance from the column's left edge |
| org-tick-length | 12px | Line from trunk to a team |
| org-avatar-ring | 2px #FFFFFF plus 1px #D0D0D0 | Avatar outline |

## Organigrama behavior and edge cases

The org chart follows the monochrome system, so selection uses black, not the blue accent proposed for BPMN shapes.

| State or action | Behavior |
| --- | --- |
| Hover | Border darkens to #111111; with highlightPath, the line from this node up to the root turns solid #111111 at 2px |
| Selected | 2px #111111 ring, 2px outside the node |
| Focus | Same ring as selected, plus the path highlight |
| Collapsed division | Team stack hides; a "+ 7 teams" label shows under the division |
| Click a node | Select; double-click expands or collapses a division |

Transitions are 120ms ease-out, and 0ms with prefers-reduced-motion.

Responsive behavior (proposed; the reference is a poster, not a screen):

| Breakpoint | Layout |
| --- | --- |
| 1280px and wider | All divisions in one row, as in the reference |
| 768 to 1279px | Divisions wrap into rows of three, each row with its own bus joined to the head by a vertical line |
| Below 768px | Indented list tree, divisions collapsed by default |

Edge cases:

- Uneven columns: the reference ranges from 3 to 9 teams per division. Columns align at the top and the chart grows to the tallest one; never stretch short columns.

- Long names: wrap to 4 lines, then truncate with a tooltip. Names in the reference reach 4 lines at 176px.

- No person or no photo: show "Vacant" in the subtitle for no person, and a line person icon on #F3F3F3 for no photo.

- More than six divisions: the row scrolls horizontally inside the frame, and the head stays centered over the visible span.

- Print and export: the chart fits one landscape page; fills stay distinguishable in grayscale, and exported SVG inlines the token values.

Accessibility:

- The chart is role="tree", each node a treeitem with aria-level taken from its depth, so a screen reader announces "Division, level 3".

- Authority is announced in text ("Primary authority: Decreto 4165 de 2011"), because fill alone cannot carry it.

- Arrow keys move through the tree: up to the parent, down to the first child, left and right between siblings; Enter or Space expands or collapses.

- An avatar gets an empty alt when the person's name is shown beside it, and the name as alt otherwise.

- All text pairs are above 4.5:1; reporting lines are above 3:1 on the frame.

## Complex flow structure (FlowMap)

FlowMap is the layout for diagrams too large for a single flowchart: one entry point that spreads into many branches, where each branch holds several screens or steps. It comes from the "Wireframe" reference, a map of an HR app with six modules and 11 screens.

The reference has three layers:

| Layer | In the reference | Role |
| --- | --- | --- |
| Spine | Left column of six module nodes joined by one vertical line: Authentication, Dashboard, Employee, Recruitment, Payroll, Schedule | The main sequence; read top to bottom |
| Rows | One row per module, with up to 3 screens left to right | The detail of each module |
| Screens | A label chip above a thumbnail of the screen | The unit the reader inspects |

Reading order is top to bottom along the spine, then left to right inside a row. Every row starts with a short horizontal branch from the spine into its first screen.

The Employee row includes an "Org. Chart Screen"; the OrgChart component above is what fills that thumbnail in a real product.

The watermark and brand mark in the reference are not part of the pattern and are left out.

## Flow node variants

FlowMap has three kinds of node. Sizes are measured from the reference at 1,200px wide, assumed 1x.

| Node | Size (px) | Anatomy | Props |
| --- | --- | --- | --- |
| FlowModule | 156 × 40, radius 8 | Line icon, then label, centered; tinted fill | id, label, icon |
| FlowScreenLabel | 185 × 24, radius 6 | One-line label, 11px, centered; sits 10px above its thumbnail | label |
| FlowScreen | 251 × 200, radius 8 | Browser bar with three dots, then a skeleton of the screen | id, label, template, toolbar |

The skeleton is drawn from gray blocks, not from the real UI, so the map stays readable at small size. Six template values cover every screen in the reference:

| template | Skeleton | Used by in the reference |
| --- | --- | --- |
| auth | Top bar with logo block and one button; centered form card with one primary button | Sign in, Sign up |
| dashboard | Sidebar, header, a row of 3 small cards, then 2 panels of mixed width | Dashboard |
| panel | Sidebar, header with action button, one large panel; toolbar: true adds a strip above it | Manage Employee, Org Chart, Request Time Off, Job Description, Payroll |
| cards | Sidebar, header, grid of 5 cards (3 + 2) | Job List |
| table | Sidebar, header, a row of 3 column heads, a grid of cells | Candidates |
| calendar | Sidebar, hour rail, event blocks of different lengths | Schedule |

In every template except auth, the sidebar lists 5 items and highlights the one that matches the screen's module: first for Dashboard, second for Employee, third for Recruitment, fourth for Payroll, fifth for Schedule. This ties each screen back to its row at a glance, so keep it.

A FlowModule with no screens is drawn as the node alone, with no branch line. An unknown template falls back to a blank thumbnail with only the browser bar.

## Flow edge variants and routing

The reference draws every connector as a 1px dark line with a small filled arrowhead and square corners, and uses five kinds. The kind is derived from the data, not set by hand, except merge.

| Edge | From and to | Route | Reference example |
| --- | --- | --- | --- |
| spine | Module to the next module | Straight down the left column, arrowhead into the top of the next module | Authentication to Dashboard |
| branch | Module to its first screen | From the spine, level with the thumbnail's middle, straight right, arrowhead on the thumbnail's left edge | Employee to Manage Employee |
| next | Screen to the next screen in its row | Straight right across the 34px column gap | Sign in to Sign up |
| continue | First screen of a row to the first screen of the next row | Straight down from the thumbnail's bottom center into the next label chip, 40px | Dashboard to Manage Employee |
| merge | Any other screen to a screen elsewhere | Down 20px, across to the target's column, joining the target's continue line | Sign up to Dashboard |

Two edges that end at the same place share their last segment and one arrowhead, as the two lines into the Dashboard chip do.

Routing rules, extended from the reference for larger diagrams (proposed):

- Orthogonal only: no diagonals; keep at least 20px clearance between a line and an unrelated node.

- Crossings: where two lines cross, the horizontal one hops over the vertical with a 6px arc.

- Back-links: an edge to a screen above its source runs in the 16px lane between the spine and the first column, and is dashed so it reads as a return, not forward progress.

- Edge labels: a short pill (11px, same style as the screen label) centered on the edge's longest segment, for conditions such as "if approved".

- Decisions: put a BpmnGateway of type exclusive on the edge and label each outgoing branch, so the screen flow and the process flow share one vocabulary.

- More than 3 screens in a row: the 4th wraps to a new sub-row; the wrap is drawn as a merge edge from the last screen to the start of the new sub-row.

## Flow tokens

The reference uses an indigo accent on neutral grays. Following the rule for the Organigrama, the app uses the black-and-white system: every indigo value maps to black or a neutral. Reference colors are estimated by eye; use the right-hand column.

| Token | Reference (approx.) | Use in the app | Usage |
| --- | --- | --- | --- |
| flow-color-module-fill | #F0F0FF | #F3F3F3 (ds-color-card-soft) | Module node fill |
| flow-color-accent | #4540D6 | #111111 | Module icon, active sidebar item, primary button in a thumbnail |
| flow-color-label-fill | #F6F6F7 | #FFFFFF | Screen label chip |
| flow-color-label-border | #D9DADF | #D0D0D0 | Screen label chip |
| flow-color-thumb-fill | #FAFAFB | #FFFFFF | Thumbnail body |
| flow-color-thumb-border | #D9D9DE | #E3E3E3 | Thumbnail outline |
| flow-color-thumb-bar | #F1F1F4 | #F3F3F3 | Browser bar |
| flow-color-skeleton | #E4E5E9 | #E6E6E6 | Content blocks |
| flow-color-skeleton-strong | #9A9EA8 | #8C8C8C | Header bars, event blocks |
| flow-color-line | #1F1F1F | #111111 | All edges and arrowheads |

Sizes (same in both themes):

| Token | Value | Usage |
| --- | --- | --- |
| flow-module-size | 156 × 40px, radius 8 | Module node |
| flow-label-size | 185 × 24px, radius 6 | Screen label chip |
| flow-thumb-size | 251 × 200px, radius 8 | Screen thumbnail |
| flow-label-gap | 10px | Label to thumbnail |
| flow-col-gap | 34px | Between screens in a row |
| flow-row-pitch | 280px | Top of one row to the top of the next |
| flow-line-width | 1px | Edges |
| flow-arrow-size | 6px | Arrowhead |
| flow-continue-length | 40px | Vertical gap that holds a continue arrow |
| flow-merge-clearance | 20px | Distance a merge edge drops before turning |
| flow-gutter | 16px | Lane for back-links |
| flow-font-label | 11px / 400 | Screen labels, edge labels |
| flow-font-module | 13px / 500 | Module labels |
| flow-font-title | 34px / 600, centered | Page title above the map |
| flow-font-subtitle | 14px / 400, centered, 620px max, ds-color-subtitle | Description under the title |

The arrowhead and line sizes must not scale with zoom; keep them at 1px and 6px at every zoom level.

## Flow behavior and edge cases

The reference is a static poster. The behavior below is proposed so the same structure works in the app.

| Action | Behavior |
| --- | --- |
| Hover a screen | Its incoming and outgoing edges thicken to 2px; the thumbnail border darkens to #111111 |
| Click a screen | Select it; a side panel shows its details |
| Double-click | Open that screen's own prototype or diagram |
| Drag a screen | Reorder inside its row; edges reroute at once, snapping to the 34px gap |
| Collapse a module | Hide its row; the spine stays, and the continue edge jumps to the next visible row |
| Zoom | Layout scales; line width, arrowheads and text of labels stay at fixed sizes |

Responsive layout:

| Breakpoint | Layout |
| --- | --- |
| 1200px and wider | 3 screens per row, as in the reference |
| 768 to 1199px | 2 screens per row; the third wraps with a merge edge |
| Below 768px | Vertical list: module, then its screens as indented items, with edges shown as text ("leads to Dashboard Screen") |

Edge cases:

- Module with no screens: show the node alone, with no branch line; the spine continues.

- Many modules: the reference has 6; beyond about 12, group modules in the spine under a collapsible header.

- Long labels: the chip truncates at 185px with an ellipsis and a tooltip with the full text.

- Screen with several incoming edges: keep one arrowhead and let the lines share the last segment.

- Cross-module links: a merge that skips several rows runs in the flow-gutter lane; never through other thumbnails.

- Loops: a back-link is dashed and carries a label such as "retry", so a loop is never mistaken for progress.

- Print and export: one portrait page at 1,200px wide scales to A3; SVG export inlines token values; the dark line on white works in grayscale.

Accessibility:

- Provide a list view of the same structure, switchable with a button; it is the default below 768px and the best route for screen readers.

- Each screen thumbnail has role="img" and an aria-label such as "Sign in Screen, authentication form"; its outgoing edges are listed in aria-describedby ("Leads to Sign up Screen and Dashboard Screen").

- Keyboard: Tab goes module by module, then screen by screen left to right; arrow keys follow edges (right for next, down for continue, left to step back); Enter opens the screen.

- Selected and focused screens use a 2px #111111 ring; the highlighted sidebar item in a thumbnail is decorative and not announced.

- Edges are never the only carrier of meaning: every edge also appears in the list view and in the aria-describedby text.
