import { useCallback, useMemo, useState } from 'react';
import { getLogs, getSummary, simulateLoad } from './api/client';
import { Header } from './components/Header';
import { ServiceCard } from './components/ServiceCard';
import { TopologyMap } from './components/TopologyMap';
import { LatencyChart } from './components/LatencyChart';
import { LogFilters } from './components/LogFilters';
import { LogTable } from './components/LogTable';
import { SectionHead } from './components/SectionHead';
import { usePolling } from './hooks/usePolling';
import { PAGE_SIZE, POLL_INTERVAL_MS, SERVICES } from './config';
import type { LoadSimulationReport, ServiceFilter, StatusFilter } from './types';

function toIso(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default function App() {
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<LoadSimulationReport | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const summaryFetcher = useCallback(() => getSummary(), []);
  const chartFetcher = useCallback(() => getLogs({ size: 100 }), []);
  const logsFetcher = useCallback(
    () =>
      getLogs({
        service: serviceFilter,
        status: statusFilter,
        from: toIso(from),
        to: toIso(to),
        page,
        size: PAGE_SIZE,
      }),
    [serviceFilter, statusFilter, from, to, page],
  );

  const summary = usePolling(summaryFetcher, POLL_INTERVAL_MS);
  const chartLogs = usePolling(chartFetcher, POLL_INTERVAL_MS);
  const logs = usePolling(logsFetcher, POLL_INTERVAL_MS);

  const healthByService = useMemo(
    () => new Map((summary.data ?? []).map((health) => [health.serviceId, health])),
    [summary.data],
  );

  const chartRecords = chartLogs.data?.content ?? [];
  const records = logs.data?.content ?? [];
  const lastEvent = chartRecords[0] ?? null;
  const totalPages = logs.data?.totalPages ?? 0;
  const totalElements = logs.data?.totalElements ?? 0;
  const globalTotal = chartLogs.data?.totalElements ?? 0;

  const recordsFor = (serviceId: string) =>
    chartRecords.filter((record) => record.serviceId === serviceId);

  const selectService = (serviceId: string) => {
    setServiceFilter((current) => (current === serviceId ? 'all' : (serviceId as ServiceFilter)));
    setPage(0);
    setSelectedId(null);
  };

  const clearFilters = () => {
    setServiceFilter('all');
    setStatusFilter('ALL');
    setFrom('');
    setTo('');
    setPage(0);
  };

  const handleSimulate = async () => {
    setRunning(true);
    setSimulationError(null);
    try {
      const result = await simulateLoad();
      setReport(result);
    } catch (error) {
      setSimulationError(
        error instanceof Error ? error.message : 'No se pudo ejecutar la simulación.',
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="shell">
        <Header
          lastUpdated={summary.lastUpdated}
          running={running}
          report={report}
          onSimulate={handleSimulate}
        />

        {(summary.error || logs.error) && (
          <div className="banner" role="status">
            No se pudo contactar con el backend. Reintentando cada 3 s.
            <span className="banner__detail">{summary.error ?? logs.error}</span>
          </div>
        )}

        {simulationError && (
          <div className="banner banner--soft" role="alert">
            {simulationError}
          </div>
        )}

        <SectionHead
          index="01"
          title="Resumen por servicio"
          hint="tres microservicios · tres proxies"
        />
        <section className="kpi-grid" aria-label="Resumen por servicio">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              health={healthByService.get(service.id)}
              records={recordsFor(service.id)}
              active={serviceFilter === service.id}
              onSelect={selectService}
            />
          ))}
        </section>

        <SectionHead
          index="02"
          title="Topología en vivo"
          hint="cada pulso es una llamada interceptada"
          meta={`${globalTotal} registros`}
        />
        <section className="panel topology-panel">
          <TopologyMap
            healthByService={healthByService}
            lastEvent={lastEvent}
            activeService={serviceFilter}
            onSelect={selectService}
          />
        </section>

        <SectionHead
          index="03"
          title="Latencia por servicio"
          hint="últimas 20 llamadas"
        />
        <section className="chart-grid" aria-label="Latencia por servicio">
          {SERVICES.map((service) => (
            <LatencyChart
              key={service.id}
              service={service}
              records={recordsFor(service.id)}
            />
          ))}
        </section>

        <SectionHead
          index="04"
          title="Registro de auditoría"
          hint="cada fila es una intercepción del LoggingProxy"
          meta={`${totalElements} registros`}
        />
        <section className="panel table-panel">
          <LogFilters
            service={serviceFilter}
            status={statusFilter}
            from={from}
            to={to}
            onService={(value) => {
              setServiceFilter(value);
              setPage(0);
            }}
            onStatus={(value) => {
              setStatusFilter(value);
              setPage(0);
            }}
            onFrom={(value) => {
              setFrom(value);
              setPage(0);
            }}
            onTo={(value) => {
              setTo(value);
              setPage(0);
            }}
            onClear={clearFilters}
          />

          <LogTable records={records} selectedId={selectedId} onSelect={setSelectedId} />

          <div className="pagination">
            <span>
              Página {totalPages === 0 ? 0 : page + 1} de {totalPages} · {totalElements} registros
            </span>
            <div className="pagination__actions">
              <button
                type="button"
                className="btn-ghost"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn-ghost"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>

        <footer className="footer">
          <span>Polling cada 3 s · datos en memoria</span>
          <span>
            {summary.lastUpdated
              ? `última lectura ${summary.lastUpdated.toLocaleTimeString('es-CO', { hour12: false })}`
              : 'conectando…'}
          </span>
        </footer>
      </div>
  );
}
