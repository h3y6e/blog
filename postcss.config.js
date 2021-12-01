module.exports = () => ({
  plugins: [
    require("postcss-import"),
    require("postcss-color-mod-function"),
    require("postcss-preset-env")({
      stage: 0,
    }),
  ],
});
