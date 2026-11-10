import { useEffect, useRef, useState } from 'react';

/** Read-only bpmn-js viewer. Renders the BPMN projection; it does not execute the process. */
export function BpmnView({ xml, height = 420 }: { xml: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let viewer: { importXML: (x: string) => Promise<unknown>; get: (s: string) => { zoom: (m: string) => void }; destroy: () => void } | null = null;
    let live = true;
    (async () => {
      const [{ default: Viewer }] = await Promise.all([import('bpmn-js/lib/NavigatedViewer'), import('bpmn-js/dist/assets/diagram-js.css'), import('bpmn-js/dist/assets/bpmn-js.css')]);
      if (!live || !ref.current) return;
      viewer = new Viewer({ container: ref.current }) as unknown as typeof viewer;
      try { await viewer!.importXML(xml); viewer!.get('canvas').zoom('fit-viewport'); setErr(''); } catch (e) { setErr((e as Error).message); }
    })().catch(e => setErr((e as Error).message));
    return () => { live = false; viewer?.destroy(); };
  }, [xml]);
  return (
    <div>
      <div ref={ref} role="figure" aria-label="Diagrama BPMN 2.0 (somente leitura)" className="w-full overflow-hidden rounded-ds-lg border border-ds-line bg-ds-surface" style={{ height }} />
      {err && <p role="alert" className="mt-2 text-xs text-ds-accent">Falha ao renderizar BPMN: {err}</p>}
    </div>
  );
}
