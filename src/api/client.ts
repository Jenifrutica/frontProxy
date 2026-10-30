import type {
  InterceptionRecord,
  LoadSimulationReport,
  LogQuery,
  PagedInterceptions,
  ServiceHealth,
} from '../types';

const INVENTORY_BASE = import.meta.env.VITE_INVENTORY_URL ?? '';
const ORDERS_BASE = import.meta.env.VITE_ORDERS_URL ?? '';
const PAYMENTS_BASE = import.meta.env.VITE_PAYMENTS_URL ?? '';
const AUDIT_BASE = import.meta.env.VITE_AUDIT_URL ?? '';

function resolve(path: string): string {
  if (path.startsWith('/api/services/inventory')) {
    return `${INVENTORY_BASE}${path}`;
  }
  if (path.startsWith('/api/services/orders')) {
    return `${ORDERS_BASE}${path}`;
  }
  if (path.startsWith('/api/services/payments')) {
    return `${PAYMENTS_BASE}${path}`;
  }
  if (path.startsWith('/api/metrics')) {
    return `${AUDIT_BASE}${path}`;
  }
  return path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolve(path), init);
  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string; title?: string };
      detail = body.detail ?? body.title ?? detail;
    } catch {
      // The body was not JSON; keep the status code.
    }
    throw new Error(detail);
  }
  return (await response.json()) as T;
}

export function getSummary(): Promise<ServiceHealth[]> {
  return request<ServiceHealth[]>('/api/metrics/summary');
}

export function getLogs(query: LogQuery): Promise<PagedInterceptions> {
  const params = new URLSearchParams();
  if (query.service && query.service !== 'all') {
    params.set('service', query.service);
  }
  if (query.status && query.status !== 'ALL') {
    params.set('status', query.status);
  }
  if (query.from) {
    params.set('from', query.from);
  }
  if (query.to) {
    params.set('to', query.to);
  }
  params.set('page', String(query.page ?? 0));
  params.set('size', String(query.size ?? 20));
  return request<PagedInterceptions>(`/api/metrics/logs?${params.toString()}`);
}

export function simulateLoad(): Promise<LoadSimulationReport> {
  return request<LoadSimulationReport>('/api/metrics/simulate-load', { method: 'POST' });
}

export function getLatestLogs(size = 100): Promise<PagedInterceptions> {
  return getLogs({ size });
}

export type { InterceptionRecord };
