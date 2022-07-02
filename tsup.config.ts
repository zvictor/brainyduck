import { defineConfig } from 'tsup'

export default defineConfig({
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: true,
  watch: false,
  outExtension: ({ format }) => ({
    js: `.${format === 'esm' ? 'mjs' : format}`,
  }),
})
