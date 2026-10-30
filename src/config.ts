import type { ServiceDescriptor } from './types';

export const SERVICES: ServiceDescriptor[] = [
  { id: 'inventory', label: 'Inventario', short: 'INV', kanji: '在庫', color: '#4f7a5a' },
  { id: 'orders', label: 'Pedidos', short: 'ORD', kanji: '注文', color: '#6b4a8a' },
  { id: 'payments', label: 'Pagos', short: 'PAY', kanji: '決済', color: '#b7791f' },
];

export const SERVICE_LABELS: Record<string, string> = {
  inventory: 'Inventario',
  orders: 'Pedidos',
  payments: 'Pagos',
};

export const POLL_INTERVAL_MS = 3000;
export const DEGRADED_THRESHOLD = 0.15;
export const PAGE_SIZE = 50;
