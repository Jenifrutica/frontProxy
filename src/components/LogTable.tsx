import { Fragment, useEffect, useState } from 'react';
import { SERVICE_LABELS } from '../config';
import type { InterceptionRecord } from '../types';

interface LogTableProps {
  records: InterceptionRecord[];
  selectedId: string | null;
  onSelect: (requestId: string | null) => void;
}

function prettyJson(value: string | null | undefined) {
  if (!value) {
    return '—';
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('es-CO', { hour12: false });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="copy"
      onClick={async (event) => {
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          // Clipboard permission denied; the full id is still visible in the detail.
        }
      }}
    >
      {copied ? 'copiado' : 'copiar'}
    </button>
  );
}

export function LogTable({ records, selectedId, onSelect }: LogTableProps) {
  const [flashId, setFlashId] = useState<string | null>(null);
  const newestId = records[0]?.requestId;

  useEffect(() => {
    if (!newestId) {
      return;
    }
    setFlashId(newestId);
    const timer = window.setTimeout(() => setFlashId(null), 1400);
    return () => window.clearTimeout(timer);
  }, [newestId]);

  if (records.length === 0) {
    return <div className="empty">Sin llamadas registradas. Ejecuta una simulación.</div>;
  }

  const maxDuration = Math.max(...records.map((record) => record.durationMs), 1);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>requestId</th>
            <th>servicio</th>
            <th>operación</th>
            <th>duración</th>
            <th>estado</th>
            <th>hora</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const open = selectedId === record.requestId;
            return (
              <Fragment key={record.requestId}>
                <tr
                  className={`log-row${open ? ' is-open' : ''}${
                    record.requestId === flashId ? ' is-new' : ''
                  }`}
                  onClick={() => onSelect(open ? null : record.requestId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(open ? null : record.requestId);
                    }
                  }}
                  tabIndex={0}
                  aria-expanded={open}
                >
                  <td className="mono">
                    <span className="request-id">{record.requestId.slice(0, 8)}</span>
                    <CopyButton value={record.requestId} />
                  </td>
                  <td>{SERVICE_LABELS[record.serviceId] ?? record.serviceId}</td>
                  <td className="mono">{record.operation}</td>
                  <td>
                    <span className="duration-bar">
                      <span
                        style={{
                          width: `${Math.max(3, (record.durationMs / maxDuration) * 100)}%`,
                        }}
                      />
                    </span>
                    {record.durationMs} ms
                  </td>
                  <td>
                    <span
                      className={`status status--${
                        record.status === 'SUCCESS' ? 'success' : 'error'
                      }`}
                    >
                      {record.status === 'SUCCESS' ? 'ÉXITO' : 'ERROR'}
                    </span>
                  </td>
                  <td className="mono">{formatTime(record.timestamp)}</td>
                </tr>

                {open && (
                  <tr className="log-detail">
                    <td colSpan={6}>
                      <div className="detail-grid">
                        <section>
                          <h4>Parámetros de entrada</h4>
                          <pre>{JSON.stringify(record.inputParams ?? {}, null, 2)}</pre>
                        </section>
                        <section>
                          <h4>Respuesta</h4>
                          <pre>{prettyJson(record.responseJson)}</pre>
                        </section>
                        {record.status === 'ERROR' && (
                          <section className="detail-error">
                            <h4>Error</h4>
                            <p>
                              {record.errorType}: {record.errorMessage}
                            </p>
                            <pre>{record.stackTraceSummary}</pre>
                          </section>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
