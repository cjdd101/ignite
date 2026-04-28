import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico'],
            manifest: {
                name: '点燃 - 个人探索工具',
                short_name: '点燃',
                description: '存一粒火种，燃一团烈焰，蔓一片草原',
                theme_color: '#FF6B35',
                background_color: '#1a1a1a',
                display: 'standalone',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.minimax\.chat\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'ai-api-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60
                            }
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        globals: true,
        include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    },
});
