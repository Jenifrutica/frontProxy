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
        <span className="hero__kicker">観測 · 監査 · リアルタイム</span>
        <span className="hero__date">{dateLabel}</span>
      </div>

      <div className="hero__main">
        <div className="hero__brand">
          <span className="hero__seal" aria-hidden="true">
            観
          </span>
          <div>
            <h1 className="hero__title">MIRU</h1>
            <p className="hero__subtitle">Observabilidad de microservicios</p>
          </div>
        </div>

        <div className="hero__status">
          <span className="live">
            <span className="live__dot" />
            EN VIVO
          </span>
          <span className="hero__updated">
            última actualización{' '}
            {lastUpdated ? lastUpdated.toLocaleTimeString('es-CO', { hour12: false }) : '—'}
          </span>
        </div>

        <div className="hero__actions">
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

      <div className="hero__meta">
        <span>3 SERVICIOS</span>
        <span>3 PROXIES</span>
        <span>1 HUB</span>
        <span>POLLING 3 S</span>
      </div>

      <span className="hero__watermark" aria-hidden="true">
        観
      </span>
    </header>
  );
}
