module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        useBuiltIns: "entry",
        corejs: 3,
        targets: {
          browsers: ["cover 95.5%", "not dead", "not op_mini all"],
        },
      },
    ],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
        importSource: "react",
      },
    ],
  ],
  plugins: [
    "babel-plugin-react-compiler",
    "@babel/plugin-transform-runtime",
    [
      "transform-react-remove-prop-types",
      {
        removeImport: true,
        additionalLibraries: ["prop-types"],
      },
    ],
  ],
};
