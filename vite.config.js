import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

const optionalBundleName = (id) => {
  if (id.includes('/node_modules/three/') || id.includes('/node_modules/@react-three/')) return 'three-renderer'
  if (id.includes('/node_modules/@zxing/')) return 'qr-decoder'
  if (id.includes('/node_modules/@supabase/')) return 'supabase-client'
  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      injectRegister: false,
      registerType: 'prompt',
      manifest: false,
      injectManifest: {
        globPatterns: [
          'index.html',
          'manifest.json',
          'branding/campusnav-app-icon*.{png,svg}',
          'branding/apple-touch-icon.png',
          'assets/**/*.{css,js}',
        ],
        globIgnores: [
          'assets/*Admin*.js',
          'assets/admin*.js',
          'assets/FacilityOperationsAdminPage-*.js',
          'assets/FacilityScheduleAdminPage-*.js',
          'assets/facilityAdminUi-*.js',
          'assets/Login-*.js',
          'assets/Emergency-*.js',
          'assets/EmergencyModePanel-*.js',
          'assets/QRCheckpoints-*.js',
          'assets/MapVerificationPanel-*.js',
          'assets/Campus3D-*.js',
          'assets/three-renderer-*.js',
          'assets/QRScanner-*.js',
          'assets/qr-decoder-*.js',
          'assets/supabase-client-*.js',
        ],
        maximumFileSizeToCacheInBytes: 1_000_000,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: optionalBundleName,
      },
    },
  },
});
