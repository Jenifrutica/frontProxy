import { DEGRADED_THRESHOLD, SERVICE_LABELS, SERVICES } from '../config';
import type { InterceptionRecord, ServiceHealth } from '../types';

interface TopologyMapProps {
  healthByService: Map<string, ServiceHealth>;
  lastEvent: InterceptionRecord | null;
  activeService: string;
  onSelect: (serviceId: string) => void;
}

const NODES = {
  panel: { x: 450, y: 34, width: 150, height: 38 },
  inventory: { x: 150, y: 118, width: 132, height: 54 },
  orders: { x: 450, y: 118, width: 132, height: 54 },
  payments: { x: 750, y: 118, width: 132, height: 54 },
  hub: { x: 450, y: 212, width: 150, height: 48 },
};

const SERVICE_POSITIONS: Record<string, { x: number; y: number }> = {
  inventory: { x: 150, y: 118 },
  orders: { x: 450, y: 118 },
  payments: { x: 750, y: 118 },
};

export function TopologyMap({ healthByService, lastEvent, activeService, onSelect }: TopologyMapProps) {
  const totalCalls = Array.from(healthByService.values()).reduce(
    (sum, health) => sum + health.totalCalls,
    0,
  );

  return (
    <div className="topology-wrap">
      <svg
        className="topology"
        viewBox="0 0 900 280"
        role="img"
        aria-label="Topología de servicios, proxies de auditoría y hub de métricas"
      >
        <defs>
          <filter id="pulse-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {SERVICES.map((service) => {
          const position = SERVICE_POSITIONS[service.id];
          return (
            <g key={`edge-panel-${service.id}`}>
              <line
                className="edge edge--dashed"
                x1={NODES.panel.x}
                y1={NODES.panel.y + NODES.panel.height / 2}
                x2={position.x}
                y2={position.y - NODES.inventory.height / 2}
              />
            </g>
          );
        })}

        {SERVICES.map((service) => {
          const position = SERVICE_POSITIONS[service.id];
          return (
            <g key={`edge-hub-${service.id}`}>
              <line
                className="edge"
                x1={position.x}
                y1={position.y + NODES.inventory.height / 2}
                x2={NODES.hub.x}
                y2={NODES.hub.y - NODES.hub.height / 2}
              />
              <text
                className="edge-label"
                x={position.x + (position.x < NODES.hub.x ? 18 : -58)}
                y={position.y + 58}
              >
                PROXY
              </text>
            </g>
          );
        })}

        {lastEvent && SERVICE_POSITIONS[lastEvent.serviceId] && (
          <g key={`${lastEvent.requestId}-${lastEvent.timestamp}`}>
            <circle className="pulse" r="4" filter="url(#pulse-glow)">
              <animateMotion
                dur="0.9s"
                fill="freeze"
                path={`M${SERVICE_POSITIONS[lastEvent.serviceId].x},${
                  SERVICE_POSITIONS[lastEvent.serviceId].y + NODES.inventory.height / 2
                } L${NODES.hub.x},${NODES.hub.y - NODES.hub.height / 2}`}
              />
            </circle>
          </g>
        )}

        <g className="node node--panel">
          <rect
            x={NODES.panel.x - NODES.panel.width / 2}
            y={NODES.panel.y - NODES.panel.height / 2}
            width={NODES.panel.width}
            height={NODES.panel.height}
            rx="3"
          />
          <text x={NODES.panel.x} y={NODES.panel.y - 2} textAnchor="middle" className="node__name">
            PANEL WEB
          </text>
          <text x={NODES.panel.x} y={NODES.panel.y + 12} textAnchor="middle" className="node__meta">
            polling cada 3 s
          </text>
        </g>

        {SERVICES.map((service) => {
          const position = SERVICE_POSITIONS[service.id];
          const health = healthByService.get(service.id);
          const degraded = (health?.errorRate ?? 0) > DEGRADED_THRESHOLD;
          const active = activeService === service.id;
          return (
            <g
              key={service.id}
              className={`node node--service${active ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Filtrar por ${service.label}`}
              onClick={() => onSelect(service.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(service.id);
                }
              }}
            >
              <rect
                x={position.x - NODES.inventory.width / 2}
                y={position.y - NODES.inventory.height / 2}
                width={NODES.inventory.width}
                height={NODES.inventory.height}
                rx="3"
                className={degraded ? 'node__box node__box--red' : 'node__box'}
              />
              <circle
                cx={position.x - NODES.inventory.width / 2 + 14}
                cy={position.y - NODES.inventory.height / 2 + 14}
                r="3"
                className={degraded ? 'node__dot node__dot--red' : 'node__dot'}
              />
              <text
                x={position.x}
                y={position.y - 4}
                textAnchor="middle"
                className="node__name"
              >
                {SERVICE_LABELS[service.id]}
              </text>
              <text
                x={position.x}
                y={position.y + 13}
                textAnchor="middle"
                className="node__meta"
              >
                {health ? `${health.totalCalls} llamadas` : 'sin datos'}
              </text>
            </g>
          );
        })}

        <g className="node node--hub">
          <rect
            x={NODES.hub.x - NODES.hub.width / 2}
            y={NODES.hub.y - NODES.hub.height / 2}
            width={NODES.hub.width}
            height={NODES.hub.height}
            rx="3"
          />
          <text x={NODES.hub.x} y={NODES.hub.y - 3} textAnchor="middle" className="node__name">
            AUDIT HUB
          </text>
          <text x={NODES.hub.x} y={NODES.hub.y + 13} textAnchor="middle" className="node__meta">
            {totalCalls} registros
          </text>
        </g>
      </svg>
      <p className="topology__legend">Cada pulso es una llamada interceptada por el proxy.</p>
    </div>
  );
}
