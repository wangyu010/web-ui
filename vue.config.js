const BACKEND = process.env.WEB_ADAPTER_URL || 'https://web-adapter.lain.ein.plus/';

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: BACKEND,
        ws: true,
        changeOrigin: true,
      },
    },
  },
};
