# Component specifications

The [full component source](../archive/component-specs-source.md) preserves BPMN tasks, events, gateways, data, states, accessibility, colors, organization charts and FlowMap variants. The [app source](../archive/bpm-app-source.md) preserves the processMap and editor details.

| Family | Source sections | Status |
| --- | --- | --- |
| BPMN | Task, Event, Gateway, Data, States, Color rules | Draft; event validity needs review |
| OrgChart | Organization levels, authority, layout and behavior | Draft; neutral styles |
| FlowMap | Nodes, edges, tokens, behavior and breakpoints | Draft; attached tokens available |
| ProcessMap | Bands, role markers, documents and stage gates | Draft; color scope unresolved |
| Editor | Seven shell modules and inspector | Draft; icons and tabs inferred |
| Stack | Reference register only | Detailed specifications missing |

## Current corrections

- Selection and focus use ds-color-title at 2px. The blue bpmn-color-accent proposal is superseded for these states.
- The historical event matrix describes an image. It MUST NOT be used as a BPMN conformance validator. Timer throw and contextual start-event validity need normative review.
- Source contrast ratios are estimates, not accessibility test results. Check approved colors in both themes.
- The CSS selector data-kind="back" is not included in the five JSON edge kinds. Define back-link metadata or add a documented type before implementation.
- Disabling pointer events alone does not define keyboard disabled behavior. Specify both before shipping.

## Acceptance criteria

GIVEN a selected shape in any view, WHEN its theme changes, THEN selection uses the current core title color and remains 2px wide.

GIVEN a diagram in canvas view, WHEN list view is selected, THEN the same elements and relationships are available in text.

GIVEN an unsupported event combination, WHEN validation runs, THEN it is reported without silently changing the model.

GIVEN a reference-only color, WHEN runtime tokens are built, THEN that value is excluded unless explicitly approved.
