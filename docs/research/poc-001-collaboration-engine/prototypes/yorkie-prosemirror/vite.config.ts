import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const yorkieProseMirrorEsm = fileURLToPath(
  new URL('./node_modules/@yorkie-js/prosemirror/dist/yorkie-js-prosemirror.es.js', import.meta.url),
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@yorkie-js/prosemirror': yorkieProseMirrorEsm,
    },
    dedupe: [
      'prosemirror-model',
      'prosemirror-state',
      'prosemirror-transform',
      'prosemirror-view',
    ],
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  test: {
    environment: 'node',
  },
});
