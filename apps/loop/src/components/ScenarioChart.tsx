import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Structural comparison only (counts derived from the model). No time, cost or ROI. */
export function ScenarioChart({ data, height = 240 }: { data: { metric: string; A: number; B: number; C: number }[]; height?: number }) {
  return (
    <figure className="m-0" aria-label="Comparação estrutural dos cenários A, B e C">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={3}>
            <CartesianGrid vertical={false} stroke="var(--color-soft)" />
            <XAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={{ stroke: 'var(--color-stroke)' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--color-soft)' }} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4e4', fontSize: 12 }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="A" name="A · baseline" fill="var(--color-line-strong)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="B" name="B · intervenção" fill="var(--color-red)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="C" name="C · alternativa" fill="var(--brain-orange)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-1 text-xs text-muted">Contagens derivadas da estrutura. Tempo, custo e ROI: não calculáveis sem dados medidos.</figcaption>
    </figure>
  );
}
