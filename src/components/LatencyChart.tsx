import type { CSSProperties } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import type { TooltipProps } from 'recharts';
import type { InterceptionRecord, ServiceDescriptor } from '../types';

interface LatencyChartProps {
  service: ServiceDescriptor;
  records: InterceptionRecord[];
}

interface ChartPoint {
  index: number;
  durationMs: number;
  operation: string;
  status: string;
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const point = payload[0].payload as ChartPoint;
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip__index">#{point.index}</span>
      <strong>{point.durationMs} ms</strong>
      <span>{point.operation}</span>
    </div>
  );
}

export function LatencyChart({ service, records }: LatencyChartProps) {
  const data: ChartPoint[] = records
    .slice(0, 20)
    .reverse()
    .map((record, index) => ({
      index: index + 1,
      durationMs: record.durationMs,
      operation: record.operation,
      status: record.status,
    }));

  const last = records[0]?.durationMs;
  const average = data.length
    ? data.reduce((sum, point) => sum + point.durationMs, 0) / data.length
    : 0;

  return (
    <article className="chart-card" style={{ '--accent': service.color } as CSSProperties}>
      <header className="chart-card__head">
        <div>
          <span className="chart-card__title">{service.label}</span>
          <span className="chart-card__hint">últimas 20 llamadas</span>
        </div>
        <span className="chart-card__value">{last !== undefined ? `${last} ms` : '—'}</span>
      </header>

      {data.length < 2 ? (
        <div className="chart-empty">Sin datos suficientes</div>
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${service.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={service.color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={service.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, 'dataMax + 2']} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: '#2a333d', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="durationMs"
              stroke={service.color}
              strokeWidth={1.5}
              fill={`url(#grad-${service.id})`}
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <footer className="chart-card__foot">
        <span>promedio {average.toFixed(1)} ms</span>
        <span>{records.length} puntos</span>
      </footer>
    </article>
  );
}
