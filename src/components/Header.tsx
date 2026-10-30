import { Flower } from './Flower';
import type { LoadSimulationReport } from '../types';

interface HeaderProps {
  lastUpdated: Date | null;
  running: boolean;
  report: LoadSimulationReport | null;
  onSimulate: () => void;
}

export function Header({ lastUpdated, running, report, onSimulate }: HeaderProps) {
  const dateLabel = new Date()
    .toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '')
    .toUpperCase();

  return (
    <header className="hero">
      <div className="hero__top">
        <span className="hero__brandline">MIRU / OBSERVABILIDAD</span>
        <span className="hero__meta">3 SERVICIOS · 3 PROXIES · 1 HUB</span>
        <span className="hero__date">{dateLabel}</span>
      </div>

      <div className="hero__stage">
        <Flower className="hero__flower" />

        <div className="hero__title">
          <span className="hero__script">observa</span>
          <h1>MIRU</h1>
          <span className="hero__serif">en vivo.</span>
          <span className="hero__sticker hero__sticker--zero" aria-hidden="true">
            00
          </span>
          <span className="hero__sticker hero__sticker--script" aria-hidden="true">
            be patient
          </span>
        </div>

        <p className="hero__sub">Auditoría de microservicios · polling cada 3 s</p>

        <div className="hero__actions">
          <span className="live">
            <span className="live__dot" />
            EN VIVO
          </span>
          <span className="hero__updated">
            última actualización{' '}
            {lastUpdated ? lastUpdated.toLocaleTimeString('es-CO', { hour12: false }) : '—'}
          </span>
          {report && (
            <span className="simulation-report">
              {report.generated} generadas · {report.succeeded} OK
              {report.failed > 0 ? ` · ${report.failed} con error` : ''}
            </span>
          )}
          <button className="btn-primary" type="button" onClick={onSimulate} disabled={running}>
            {running ? 'Generando…' : 'Simular carga'}
            <span aria-hidden="true"> ↗</span>
          </button>
        </div>
      </div>

      <nav className="hero__nav" aria-label="Secciones del panel">
        <a href="#resumen">Resumen</a>
        <a href="#topologia">Topología</a>
        <a href="#latencia">Latencia</a>
        <a href="#registro">Registro</a>
      </nav>
    </header>
  );
}
