import typescript from "@rollup/plugin-typescript"
import { terser } from "rollup-plugin-terser"

export default {
  input: "lib/index.js",
  output: {
    dir: "build",
    format: "es",
    sourcemap: false,
    entryFileNames: "bundle.es.js",
  },
  plugins: [typescript({ tsconfig: "./tsconfig.json" }), terser()],
}
