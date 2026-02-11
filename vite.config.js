
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
      'process.env.HF_TOKEN': JSON.stringify(env.HF_TOKEN || process.env.HF_TOKEN || ''),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID || '135243081709-nk8oe25slhsbppgma7luo1vetttogaii.apps.googleusercontent.com'),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || 'https://igfjslukekjsyswgqyww.supabase.co'),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || 'sb_publishable_4VlO150U2rSJAg7W0T7DRQ_kphOKFUP'),
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});
