import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Ensure built assets resolve correctly when hosted from a sub-path
const normalizeBasePath = (value?: string) => {
  if (!value) {
    return ''
  }

  const trimmed = value.trim()

  if (trimmed === '') {
    return ''
  }

  if (trimmed === './') {
    return './'
  }

  let normalized = trimmed

  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }

  if (!normalized.endsWith('/')) {
    normalized = normalized + '/'
  }

  return normalized
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = normalizeBasePath(env.VITE_BASE_PATH || env.VITE_BASE_URL) || './'

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../src'),
        '@/services': path.resolve(__dirname, '../src/services'),
        '@/utils': path.resolve(__dirname, '../src/utils'),
        '@/lib': path.resolve(__dirname, '../src/lib'),
        '@/types': path.resolve(__dirname, '../src/types'),
        '@/components': path.resolve(__dirname, '../src/components'),
      },
    },
    define: {
      // Expose environment variables to the client
      'import.meta.env.VITE_SITE_EMAIL_FROM': JSON.stringify(env.SITE_EMAIL_FROM || ''),
      'import.meta.env.VITE_WHATSAPP_CONTACT_NUMBER': JSON.stringify(env.WHATSAPP_CONTACT_NUMBER || ''),
    },
    server: {
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com; connect-src 'self' blob:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';"
      }
    }
  }
})

