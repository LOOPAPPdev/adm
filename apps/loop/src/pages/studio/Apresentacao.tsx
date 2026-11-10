import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { useCurrentProject } from '../workspace/ProjectLayout';
import { applyScenario, evaluate, gaps, layoutFlow, nextInfo } from '@/domain/model';
import { chartData, diffRows, metricsRows } from '@/lib/scenario-vm';
import { usePlayback } from '@/lib/use-playback';
import { FlowCanvas } from '@/components/diagrams/FlowCanvas';
import { OrgCanvas } from '@/components/diagrams/OrgCanvas';
import { PlaybackBar } from '@/components/PlaybackBar';
import { ScenarioChart } from '@/components/ScenarioChart';
import { MetricsTable } from '@/components/MetricsTable';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, Eyebrow, Muted } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Empty } from '@/components/ui/page';

const SLIDES = [['As-is', 'Organização atual', 'Quem responde por quem.'], ['Fluxo', 'Operação atual', 'Siga uma solicitação pela operação.'], ['Oportunidades', 'Regras determinísticas', 'Intervenções candidatas.'],
  ['To-be', 'Cenário B · hipótese', 'O que mudaria no processo.'], ['Trade-offs', 'A × B', 'Diferenças estruturais. Sem ganhos numéricos.'], ['Lacunas', 'Próximos passos', 'O que falta confirmar.']] as const;

export function Apresentacao() {
  const p = useCurrentProject();
  const [on, setOn] = useState(false);
  const [slide, setSlide] = useState(0);
  const go = useCallback((i: number) => { if (i >= 0 && i < SLIDES.length) setSlide(i); }, []);
  const open = (i: number) => { setSlide(i); setOn(true); document.documentElement.requestFullscreen?.().catch(() => undefined); };
  const close = useCallback(() => { setOn(false); if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined); }, []);
  useEffect(() => {
    if (!on) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(slide + 1); if (e.key === 'ArrowLeft') go(slide - 1); if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [on, slide, go, close]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><Eyebrow>Modo apresentação · {p.isDemo ? 'dados de exemplo' : 'rascunho local com estados de evidência'}</Eyebrow><h1 className="m-0 mt-1 text-[26px] font-extrabold tracking-tight">Roteiro da reunião com o cliente</h1><Muted>Seis etapas. Use as setas do teclado; Esc fecha.</Muted></div>
        <Button variant="primary" onClick={() => open(0)}><Maximize2 size={15} /> Iniciar apresentação</Button>
      </div>
      <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {SLIDES.map(([l, e, t], i) => (
          <li key={l}><button onClick={() => open(i)} className="h-full w-full rounded-[var(--radius-card)] border border-stroke bg-paper p-4 text-left shadow-card hover:border-line-strong">
            <Eyebrow>{String(i + 1).padStart(2, '0')} · {l}</Eyebrow><CardTitle className="mt-1.5">{e}</CardTitle><Muted className="mt-1">{t}</Muted></button></li>
        ))}
      </ol>
      <AnimatePresence>
        {on && (
          <motion.div role="dialog" aria-modal="true" aria-label={`Apresentação: ${SLIDES[slide][1]}`} className="fixed inset-0 z-40 flex flex-col bg-canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke bg-paper px-5 py-3">
              <div className="min-w-0"><Eyebrow>{SLIDES[slide][1]} · {p.name}</Eyebrow><h2 className="m-0 truncate text-[clamp(18px,2.6vw,28px)] font-extrabold tracking-tight">{SLIDES[slide][2]}</h2></div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted" aria-live="polite">{slide + 1} / {SLIDES.length}</span>
                <Button size="icon" onClick={() => go(slide - 1)} disabled={slide === 0} aria-label="Etapa anterior"><ChevronLeft size={16} /></Button>
                <Button size="icon" onClick={() => go(slide + 1)} disabled={slide === SLIDES.length - 1} aria-label="Próxima etapa"><ChevronRight size={16} /></Button>
                <Button size="icon" onClick={close} aria-label="Fechar apresentação"><X size={16} /></Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <AnimatePresence mode="wait">
                <motion.div key={slide} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="mx-auto max-w-[1300px]">
                  <Slide i={slide} />
                </motion.div>
              </AnimatePresence>
            </div>
            <nav aria-label="Etapas da apresentação" className="flex justify-center gap-1.5 border-t border-stroke bg-paper p-3">
              {SLIDES.map(([l], i) => <button key={l} onClick={() => go(i)} aria-current={i === slide} className={i === slide ? 'rounded-full bg-ink px-3 py-1 text-xs font-bold text-white' : 'rounded-full px-3 py-1 text-xs font-semibold text-muted hover:text-ink'}>{l}</button>)}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Slide({ i }: { i: number }) {
  const p = useCurrentProject();
  const start = p.discovery.B04[0]?.answer;
  const flowA = useMemo(() => layoutFlow(p.activities, p.people, start), [p.activities, p.people, start]);
  const flowB = useMemo(() => layoutFlow(applyScenario(p.activities, p.scenarios.B.ops), p.people, start), [p.activities, p.scenarios.B.ops, p.people, start]);
  const pb = usePlayback(flowA.count);
  const gl = gaps(p), nx = nextInfo(p);
  if (i === 0) return p.people.length ? <OrgCanvas people={p.people} height={560} ariaLabel="Organograma atual" /> : <Empty>Nenhuma pessoa declarada em B02.</Empty>;
  if (i === 1) return p.activities.length ? <><FlowCanvas layout={flowA} activeIdx={pb.idx} height={520} ariaLabel="Fluxo atual" /><div className="mt-3"><PlaybackBar pb={pb} count={flowA.count} /></div></> : <Empty>Nenhuma atividade declarada em B05.</Empty>;
  if (i === 2) return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {evaluate(p).map(o => <Card key={o.id} className="p-4"><div className="flex justify-between gap-2"><Eyebrow>{o.id}</Eyebrow><Badge tone={o.state === 'candidate' ? 'purple' : o.state === 'confirm' ? 'dashed' : 'neutral'}>{o.state === 'candidate' ? 'Candidato' : o.state === 'confirm' ? 'Pedir confirmação' : 'Sem correspondência'}</Badge></div><CardTitle className="mt-1.5 text-lg">{o.title}</CardTitle><Muted className="mt-1">{o.gaps.slice(0, 3).join('; ') || 'Sem lacunas declaradas.'}</Muted></Card>)}
    </div>
  );
  if (i === 3) return <><FlowCanvas layout={flowB} height={520} ariaLabel="Fluxo do cenário B" /><Muted className="mt-2">Cenário B é uma hipótese. Etapas novas aparecem marcadas.</Muted></>;
  if (i === 4) return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><Eyebrow className="mb-2">Indicadores A × B</Eyebrow><MetricsTable rows={metricsRows(p, 'B')} colB="B" /></Card>
      <Card><Eyebrow className="mb-2">Alterações</Eyebrow>{diffRows(p, 'B').length ? <ul className="m-0 list-none space-y-1.5 p-0">{diffRows(p, 'B').map(d => <li key={d.i} className="text-sm"><Badge tone={d.tone} className="mr-1.5">{d.kind}</Badge>{d.text}</li>)}</ul> : <Muted>Nenhuma alteração no cenário B.</Muted>}
        <div className="mt-4"><ScenarioChart data={chartData(p)} height={220} /></div></Card>
    </div>
  );
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card><Eyebrow className="mb-2">Lacunas ({gl.length})</Eyebrow><ul className="mb-0 mt-0 space-y-1 pl-5 text-[14px]">{gl.slice(0, 14).map(g => <li key={g}>{g}</li>)}</ul>{gl.length > 14 && <Muted className="mt-2">+ {gl.length - 14} lacunas.</Muted>}</Card>
      <Card><Eyebrow>Próxima atividade</Eyebrow><p className="m-0 mt-1 text-lg"><b className="text-red">{nx.no}</b> {nx.title}</p><Eyebrow className="mt-4">Próximo gate</Eyebrow><p className="m-0 mt-1">{nx.gate}</p></Card>
    </div>
  );
}
