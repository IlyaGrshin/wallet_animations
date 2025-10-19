module.exports = {
  key: process.env.RELATIVE_CI_KEY,
  upload: {
    buildStaticAssetsSizeWebpack: './build/webpack-stats.json',
  },
};
