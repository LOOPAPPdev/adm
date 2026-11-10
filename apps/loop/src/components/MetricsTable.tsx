import { metricsRows } from '@/lib/scenario-vm';

export function MetricsTable({ rows, colB }: { rows: ReturnType<typeof metricsRows>; colB: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] border-collapse text-left text-[12.5px]" data-testid="metrics-table">
        <thead><tr className="border-b border-stroke"><th className="py-2 pr-2 eyebrow">Indicador</th><th className="py-2 pr-2 eyebrow">A</th><th className="py-2 pr-2 eyebrow">{colB}</th><th className="py-2 eyebrow">Fonte</th></tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r.l} className="border-b border-soft"><td className="py-2 pr-2 font-semibold">{r.l}</td>
            {[r.a, r.b].map((v, i) => <td key={i} className={typeof v === 'string' && v === 'não calculável' ? 'py-2 pr-2 italic text-muted' : 'py-2 pr-2'}>{v}</td>)}
            <td className="py-2 text-xs text-muted">{r.src}</td></tr>
        ))}</tbody>
      </table>
    </div>
  );
}
