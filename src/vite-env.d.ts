/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_DEEPSEEK_API_KEY: string
  readonly VITE_OSS_BACKUP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
