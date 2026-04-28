/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OSS_BACKUP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}