import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Structural comparison only (counts derived from the model). No time, cost or ROI. */
export function ScenarioChart({ data, height = 240 }: { data: { metric: string; A: number; B: number; C: number }[]; height?: number }) {
  return (
    <figure className="m-0" aria-label="Comparação estrutural dos cenários A, B e C">
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={3}>
            <CartesianGrid vertical={false} stroke="#eeeeee" />
            <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#696969' }} axisLine={{ stroke: '#e4e4e4' }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#696969' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: '#f2f2f2' }} contentStyle={{ borderRadius: 10, border: '1px solid #e4e4e4', fontSize: 12 }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="A" name="A · baseline" fill="#9a9a9a" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="B" name="B · intervenção" fill="#c93038" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="C" name="C · alternativa" fill="#335c9b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-1 text-xs text-muted">Contagens derivadas da estrutura. Tempo, custo e ROI: não calculáveis sem dados medidos.</figcaption>
    </figure>
  );
}
