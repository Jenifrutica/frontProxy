import { SERVICES } from '../config';
import type { ServiceFilter, StatusFilter } from '../types';

interface LogFiltersProps {
  service: ServiceFilter;
  status: StatusFilter;
  from: string;
  to: string;
  onService: (value: ServiceFilter) => void;
  onStatus: (value: StatusFilter) => void;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  onClear: () => void;
}

export function LogFilters({
  service,
  status,
  from,
  to,
  onService,
  onStatus,
  onFrom,
  onTo,
  onClear,
}: LogFiltersProps) {
  return (
    <div className="filters">
      <div className="field">
        <label htmlFor="service-filter">Servicio</label>
        <select
          id="service-filter"
          value={service}
          onChange={(event) => onService(event.target.value as ServiceFilter)}
        >
          <option value="all">Todos</option>
          {SERVICES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field__label">Estado</span>
        <div className="segmented" role="group" aria-label="Filtrar por estado">
          {(['ALL', 'SUCCESS', 'ERROR'] as StatusFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              className={status === value ? 'is-active' : ''}
              onClick={() => onStatus(value)}
            >
              {value === 'ALL' ? 'Todos' : value === 'SUCCESS' ? 'Éxito' : 'Error'}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="from-filter">Desde</label>
        <input
          id="from-filter"
          type="datetime-local"
          value={from}
          onChange={(event) => onFrom(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="to-filter">Hasta</label>
        <input
          id="to-filter"
          type="datetime-local"
          value={to}
          onChange={(event) => onTo(event.target.value)}
        />
      </div>

      <button type="button" className="btn-ghost" onClick={onClear}>
        Limpiar
      </button>
    </div>
  );
}
