import type { CSSProperties } from 'react';
import { DEGRADED_THRESHOLD } from '../config';
import { useCountUp } from '../hooks/useCountUp';
import type { InterceptionRecord, ServiceDescriptor, ServiceHealth } from '../types';
import { Flower } from './Flower';

interface ServiceCardProps {
  service: ServiceDescriptor;
  health?: ServiceHealth;
  records: InterceptionRecord[];
  active: boolean;
  onSelect: (serviceId: string) => void;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) {
    return <div className="sparkline sparkline--empty" aria-hidden="true" />;
  }

  const maximum = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 36 - (value / maximum) * 30;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const area = `0,40 ${points.join(' ')} 100,40`;

  return (
    <svg
      className="sparkline"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={area} fill={color} opacity="0.1" />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        pathLength={100}
      />
    </svg>
  );
}

export function ServiceCard({ service, health, records, active, onSelect }: ServiceCardProps) {
  const degraded = (health?.errorRate ?? 0) > DEGRADED_THRESHOLD;
  const total = useCountUp(health?.totalCalls ?? 0);
  const values = records
    .slice(0, 20)
    .reverse()
    .map((record) => record.durationMs);
  const successRate = health && health.totalCalls > 0 ? (1 - health.errorRate) * 100 : null;

  return (
    <button
      type="button"
      className={`service-card${degraded ? ' is-degraded' : ''}${active ? ' is-active' : ''}`}
      style={{ '--accent': service.color } as CSSProperties}
      onClick={() => onSelect(service.id)}
      aria-pressed={active}
    >
      <Flower className="service-card__flower" />

      <div className="service-card__head">
        <div className="service-card__identity">
          <span className="service-card__name">{service.label}</span>
          <span className="service-card__code">{service.short}</span>
          {degraded && <span className="badge badge--red">DEGRADADO</span>}
        </div>
        <span className={`status-dot ${degraded ? 'status-dot--red' : 'status-dot--green'}`} />
      </div>

      <div className="service-card__total">
        {health ? total.toLocaleString('es-CO') : '—'}
      </div>
      <div className="service-card__caption">llamadas totales</div>

      <div className="service-card__metrics">
        <div className="metric">
          <span className="metric__label">Tasa de éxito</span>
          <strong className="metric__value">
            {successRate === null ? '—' : `${successRate.toFixed(1)}%`}
          </strong>
        </div>
        <div className="metric">
          <span className="metric__label">Tiempo promedio</span>
          <strong className="metric__value">
            {health ? `${health.avgResponseMs.toFixed(1)} ms` : '—'}
          </strong>
        </div>
      </div>

      <Sparkline values={values} color={service.color} />
    </button>
  );
}
