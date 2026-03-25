import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

/** VITE_PUBLIC_BASE_PATH: 배포 시 앱 루트 URL 경로 (예: /coursebuilder/) */
function normalizeBase(raw: string | undefined): string {
  if (raw === undefined || raw === '' || raw === '/') return '/';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = normalizeBase(env.VITE_PUBLIC_BASE_PATH);

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@root': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@domain': path.resolve(__dirname, './src/domain'),
        '@store': path.resolve(__dirname, './src/store'),
        '@api': path.resolve(__dirname, './src/api'),
        '@utils': path.resolve(__dirname, './src/utils')
      }
    },
    server: {
      port: 5173
    }
  };
});
