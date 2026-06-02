import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'strip-dynamic-requires',
      transform(code, id) {
        if (id.includes('cpexcel') || id.includes('ppt.js') || id.includes('cputils')) {
          // Surgically remove the dynamic require strings that confuse Rollup
          return code
            .replace(/require\(['"]\.\/cpt['"]\s*\+\s*['"]able['"]\)/g, '{}')
            .replace(/require\(['"]code['"]\s*\+\s*['"]page['"]\)/g, '{}')
            .replace(/require\(['"]cf['"]\s*\+\s*['"]b['"]\)/g, '{}');
        }
      }
    }
  ],

  server: {
    historyApiFallback: true,
  },
  resolve: {
    alias: command === 'build' ? {
      'codepage': 'codepage/dist/cpexcel.full.js'
    } : {}
  },
  define: {
    'cptable': 'window.cptable',
    'CFB': 'window.CFB'
  }
}));
