import esbuild from 'rollup-plugin-esbuild';

export default {
  input: 'src/index.tsx',
  output: {
    file: 'dist/index.js',
    format: 'iife',
    compact: true
  },
  plugins: [
    esbuild({
      minify: true,
      target: 'es2020',
      jsx: 'transform'
    })
  ]
};
