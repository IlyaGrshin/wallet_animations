export default (api) => {
  const isProd = api.env("production");
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      ...(isProd
        ? [
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
          ]
        : []),
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
      ...(isProd
        ? [
            "@babel/plugin-transform-runtime",
            [
              "transform-react-remove-prop-types",
              {
                removeImport: true,
                additionalLibraries: ["prop-types"],
              },
            ],
          ]
        : []),
    ],
  };
};
