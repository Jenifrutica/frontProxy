export type InvocationStatus = 'SUCCESS' | 'ERROR';
export type StatusFilter = InvocationStatus | 'ALL';
export type ServiceFilter = 'all' | 'inventory' | 'orders' | 'payments';

export interface ServiceHealth {
  serviceId: string;
  totalCalls: number;
  errorCount: number;
  errorRate: number;
  avgResponseMs: number;
}

export interface InterceptionRecord {
  requestId: string;
  serviceId: string;
  operation: string;
  durationMs: number;
  status: InvocationStatus;
  timestamp: string;
  inputParams?: Record<string, unknown>;
  responseJson?: string | null;
  errorType?: string | null;
  errorMessage?: string | null;
  stackTraceSummary?: string | null;
}

export interface PagedInterceptions {
  content: InterceptionRecord[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface LoadSimulationReport {
  generated: number;
  succeeded: number;
  failed: number;
}

export interface LogQuery {
  service?: string;
  status?: StatusFilter;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface ServiceDescriptor {
  id: 'inventory' | 'orders' | 'payments';
  label: string;
  short: string;
  kanji: string;
  color: string;
}
