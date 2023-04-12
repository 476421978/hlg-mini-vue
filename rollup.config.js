// rollup 库的打包
// webpack 项目应用的打包
import typescript from "@rollup/plugin-typescript"
export default {
  input: "./src/index.ts",
  output: [
    // 1.cjs -> commonjs
    // 2.esm
    {
      format: "cjs",
      file: "lib/guide-mini-vue.cjs.js",
    },
    {
      format: "es",
      file: "lib/guide-mini-vue.esm.js",
    },
  ],
  plugins: [typescript()],
}
