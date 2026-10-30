/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INVENTORY_URL?: string;
  readonly VITE_ORDERS_URL?: string;
  readonly VITE_PAYMENTS_URL?: string;
  readonly VITE_AUDIT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
