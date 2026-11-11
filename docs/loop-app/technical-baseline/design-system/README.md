# Design system

One core system supplies family aliases. All supplied measurements remain approximate.

| Asset | Status | Next action |
| --- | --- | --- |
| [FlowMap JSON](tokens/flow-map-tokens.json) | Supplied original; includes reference and app values | Define approved core aliases |
| [FlowMap CSS](tokens/flow-map-tokens.css) | Supplied original; literal neutral colors | Replace literals after core contract is approved |
| Core ds- / theme- files | Not supplied | Promote provisional source tables into reviewed theme contracts |
| bpmn-tokens.css / bpmn-tokens.json | Mentioned in handoff, absent from attachments | Recover or generate explicitly from an approved schema |

The component source contains provisional ds- values. The missing item is an authoritative token implementation and complete theme mapping, not all core measurements.

The handoff mentions 27 BPMN tokens. This count is unverified and MUST NOT be used as a completeness assertion. The BPMN source combines geometry, state values and a separate color palette. Composite dimensions need a defined serialization before generation.

The supplied FlowMap files are retained as provisional assets. They MUST NOT be treated as compliant production tokens until alias migration is complete. Reference colors in JSON are provenance data and MUST NOT be imported into runtime styling.

WHEN CSS is generated from JSON, THEN a documented mapping MUST account for names, composite dimensions and typography. The current JSON also carries behavior and layout metadata that has no direct CSS equivalent.
