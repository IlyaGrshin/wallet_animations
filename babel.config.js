export default (api) => {
    const isProd = api.env("production")
    api.cache.using(() => process.env.NODE_ENV)

    return {
        presets: [
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
    }
}
