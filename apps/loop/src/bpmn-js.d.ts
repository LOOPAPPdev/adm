declare module 'bpmn-js/lib/NavigatedViewer' {
  export default class NavigatedViewer { constructor(o: { container: HTMLElement }); }
}
declare module 'elkjs/lib/elk.bundled.js' {
  export default class ELK { layout(g: unknown): Promise<never>; }
}
declare module 'bpmn-moddle' {
  export class BpmnModdle {
    fromXML(xml: string): Promise<{ rootElement: unknown; warnings: unknown[] }>;
  }
}
