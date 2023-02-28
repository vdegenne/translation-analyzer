import tsc from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import {terser} from 'rollup-plugin-terser'

export default {
  input: 'src/main.ts',
  output: { file: 'public/app.js', format: 'esm' },
  plugins: [
    tsc(),
    resolve(),
    json(),
    terser()
  ]
}