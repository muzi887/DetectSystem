export default {
  // 使用标准的 stylelint 配置作为基础
  extends: ["stylelint-config-standard"],

  // 插件
  plugins: ["stylelint-prettier"],

  // 规则
  rules: {
    // 通过启用 'prettier/prettier': true，可以确保 Prettier 的格式化优先级高于 stylelint 的格式化规则，从而避免这些冲突。
    "prettier/prettier": [true, { severity: "error" }],

    // 其他规则...
    "selector-class-pattern": null, // 示例：禁用类名命名规则
    "no-descending-specificity": null, // 示例：禁用特异性警告
  },
  // 覆盖配置
  overrides: [
    {
      // 处理 Vue 文件
      files: ["**/*.vue"],
      customSyntax: "postcss-html",
    },
  ],
};
