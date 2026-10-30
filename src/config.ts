import type { ServiceDescriptor } from './types';

export const SERVICES: ServiceDescriptor[] = [
  { id: 'inventory', label: 'Inventario', short: 'INV', kanji: '在庫', color: '#e8a9b8' },
  { id: 'orders', label: 'Pedidos', short: 'ORD', kanji: '注文', color: '#c9b3e0' },
  { id: 'payments', label: 'Pagos', short: 'PAY', kanji: '決済', color: '#e0b37a' },
];

export const SERVICE_LABELS: Record<string, string> = {
  inventory: 'Inventario',
  orders: 'Pedidos',
  payments: 'Pagos',
};

export const POLL_INTERVAL_MS = 3000;
export const DEGRADED_THRESHOLD = 0.15;
export const PAGE_SIZE = 50;
