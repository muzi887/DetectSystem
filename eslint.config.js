// 引入 ESLint 官方 JS/TS 相关配置和插件
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js"; // ESLint 官方 JavaScript 规则（基础推荐规则）
import globals from "globals"; // 提供各种环境的全局变量定义，比如 browser、node 等
import tseslint from "typescript-eslint"; // TypeScript + ESLint 相关配置与解析器支持
import pluginVue from "eslint-plugin-vue"; // Vue 3 官方 ESLint 插件，用于 lint .vue 单文件组件
import vueParser from "vue-eslint-parser"; // Vue 官方提供的 ESLint 解析器，用于解析 .vue 文件结构
import json from "@eslint/json"; // ESLint 官方 JSON 文件支持
import css from "@eslint/css"; // ESLint 官方 CSS 文件支持
import prettier from "eslint-plugin-prettier"; // 导入 Prettier 的 ESLint 插件
import { defineConfig } from "eslint/config"; // ESLint Flat Config 的导出方式（ESLint v9+ 推荐）
import prettierConfig from "eslint-config-prettier"; // 👈 在这里加上这一行

// 获取当前模块的文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 读取 .eslintrc-auto-import.json 文件
const autoImportConfigPath = path.resolve(
  __dirname,
  "./.eslintrc-auto-import.json",
);
console.log("autoImportConfigPath:", autoImportConfigPath);
const autoImportConfig = JSON.parse(
  fs.readFileSync(autoImportConfigPath, "utf8"),
);
// 导出 ESLint 扁平化配置（Flat Config 格式，适用于 ESLint v9+）
export default defineConfig([
  // -----------------------------------------------------------------
  // 0. 【推荐】为 auto-import 自动导入的变量设置全局声明（避免 ESLint 报未定义）
  // -----------------------------------------------------------------
  {
    files: ["**/*.{js,ts,vue}"], // 这些文件中可能会用到 auto-import 的 API，比如 ref, reactive
    languageOptions: {
      globals: {
        ...autoImportConfig.globals, // ✅ 来自 .eslintrc-auto-import.json
      },
    },
  },

  // -----------------------------------------------------------------
  // 1. Prettier 格式检查
  // -----------------------------------------------------------------
  {
    files: ["**/*.{ts,vue,js,mjs,cjs}"],
    plugins: { prettier },
    rules: {
      // 将 Prettier 规则设置为错误级别
      "prettier/prettier": "error",
      // 关闭 ESLint 对箭头函数大括号的强制要求
      "arrow-body-style": "off",
      // 关闭 ESLint 对回调函数必须使用箭头函数的强制要求
      "prefer-arrow-callback": "off",
    },
  },

  // -----------------------------------------------------------------
  // 2. JavaScript 基础规则 —— 适用于 .js, .mjs, .cjs 文件
  // -----------------------------------------------------------------
  {
    files: ["**/*.{js,mjs,cjs}"], // 匹配所有 JavaScript 文件（CommonJS / ES Module）
    ...js.configs.recommended, // 应用 ESLint 官方为 JavaScript 提供的「推荐规则」
    languageOptions: {
      globals: globals.browser, // 定义此文件类型下可用的全局变量（比如 window、document）
    },
  },

  // -----------------------------------------------------------------
  // 3. TypeScript 规则 —— 适用于 .ts, .mts, .cts 文件
  // -----------------------------------------------------------------
  ...tseslint.configs.recommended.map((config) => ({
    ...config, // 应用 TypeScript 官方推荐的 ESLint 规则
    files: ["**/*.{ts,mts,cts}"], // 仅对 TypeScript 文件生效（包括 .mts 和 .cts）
  })),

  // -----------------------------------------------------------------
  // 4. Vue 规则 —— 仅作用于 .vue 单文件组件，并配置 Vue + TS 支持
  // -----------------------------------------------------------------
  {
    files: ["**/*.vue"], // 仅针对 Vue 单文件组件（.vue 文件）
    languageOptions: {
      // 使用 vue-eslint-parser 作为外层解析器，用于解析 .vue 文件结构（template/script/style）
      parser: vueParser,
      parserOptions: {
        // 内层解析器，用于解析 <script lang="ts"> 中的 TypeScript 代码
        parser: tseslint.parser, // 即 @typescript-eslint/parser
        ecmaVersion: 2022, // ECMAScript 版本
        sourceType: "module", // 支持 ES Module 语法
      },
      globals: globals.browser, // 浏览器环境全局变量
    },
    plugins: {
      vue: pluginVue, // 启用 Vue 官方插件，提供 Vue 相关的 lint 规则
    },
    extends: [
      pluginVue.configs["flat/recommended"], // 使用 Vue 官方推荐的 Flat Config 规则集（包含基础 Vue 规则）
      // 你也可以使用 pluginVue.configs['flat/essential']，它是更轻量级的推荐
    ],
    rules: {
      "vue/multi-word-component-names": "off", // 关闭 Vue 官方默认规则：要求组件名必须为多单词
      // 可选：你可以在这里添加或覆盖其它 Vue 相关规则
    },
  },

  // -----------------------------------------------------------------
  // 5. JSON 文件规则 —— 适用于 .json 文件
  // -----------------------------------------------------------------
  {
    files: ["**/*.json"], // 匹配所有 JSON 文件
    plugins: { json }, // 启用 ESLint 官方的 JSON 插件
    language: "json/json", // 指定语言类型
    extends: ["json/recommended"], // 应用 JSON 官方推荐的规则
  },

  // -----------------------------------------------------------------
  // 6. JSON5 文件规则（可选，根据项目需要启用）
  // -----------------------------------------------------------------
  {
    files: ["**/*.json5"], // 如果项目中使用 JSON5 格式（带注释、单引号等），可启用此块
    plugins: { json }, // 同样使用 JSON 插件（但注意：官方可能不支持 "json5" 语言类型）
    language: "json/json5", // ⚠️ 注意：可能不存在该语言类型，取决于 @eslint/json5 是否安装和配置
    extends: ["json/recommended"], // 延伸推荐规则
  },

  // -----------------------------------------------------------------
  // 7. CSS 文件规则 —— 适用于 .css 文件
  // -----------------------------------------------------------------
  {
    files: ["**/*.css"], // 匹配所有 CSS 样式文件
    plugins: { css }, // 启用 ESLint 官方 CSS 插件
    language: "css/css", // 指定语言类型
    extends: ["css/recommended"], // 应用 CSS 官方推荐的规则
    // 本块不会加载 Vue 插件，因此不会对 CSS 文件尝试执行 Vue 相关规则
  },

  // -----------------------------------------------------------------
  // 8. 自定义规则, 优先级最高, 会覆盖前面的规则
  // -----------------------------------------------------------------
  {
    files: ["**/*.{ts,vue}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin, //注册 @typescript-eslint插件，使得你可以在该配置块中使用所有 @typescript-eslint/xxx开头的 ESLint 规则
      vue: pluginVue, // ✅ 必须加上这一行，重新引入 vue 插件，否则无法识别 vue 相关规则
    },
    rules: {
      // 开启这条规则后，会将 Prettier 的校验规则传递给 ESLint，这样 ESLint 就可以按照 Prettier 的方式来进行代码格式的校验
      "prettier/prettier": "error",
      // 标准 JavaScript 规则
      "no-var": "error", // 要求使用 let 或 const 而不是 var
      "no-multiple-empty-lines": ["warn", { max: 1 }], // 不允许多个空行，超过 1 行会警告
      "no-unexpected-multiline": "error", // 禁止空余的多行
      "no-useless-escape": "off", // 禁止不必要的转义字符，但这里选择关闭

      // TypeScript 规则
      "@typescript-eslint/no-unused-vars": "error", // 禁止定义未使用的变量
      "@typescript-eslint/prefer-ts-expect-error": "error", // 禁止使用 @ts-ignore，推荐使用 @ts-expect-error
      "@typescript-eslint/no-explicit-any": "off", // 禁止使用 any 类型，但这里选择关闭
      "@typescript-eslint/no-non-null-assertion": "off", // 禁止使用非空断言，但这里选择关闭
      "@typescript-eslint/no-namespace": "off", // 禁止使用自定义 TypeScript 模块和命名空间，但这里选择关闭
      "@typescript-eslint/semi": "off", // 禁止使用分号，但这里选择关闭

      // Vue 规则
      "vue/html-closing-bracket-newline": "off", // 强制或禁止在多行元素的结束括号前换行，但这里选择关闭
      "vue/singleline-html-element-content-newline": "off", // 强制单行元素内容换行，但这里选择关闭
      "vue/html-self-closing": "off", // 组件和 HTML 元素的自闭合风格，但这里选择关闭
      "vue/max-attributes-per-line": "off", // 单行模式下，最多允许 2 个属性，超过就必须换行
      "vue/multi-word-component-names": "off", // 要求组件名称始终为 “-” 链接的单词，但这里选择关闭
      "vue/no-mutating-props": "off", // 不允许组件 prop 的改变，但这里选择关闭
      "vue/attribute-hyphenation": "off", // 对模板中的自定义组件强制执行属性命名样式，但这里选择关闭
    },
  },

  // -----------------------------------------------------------------
  // 9. 【关键步骤】添加 Prettier 配置来关闭冲突规则
  //    必须放在整个数组的最后一项，以确保它能覆盖所有其他配置。
  // -----------------------------------------------------------------
  prettierConfig,
]);
