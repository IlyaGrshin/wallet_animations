module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
      },
    ],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    ["transform-react-remove-prop-types", { "removeImport": true }]
  ],
};
