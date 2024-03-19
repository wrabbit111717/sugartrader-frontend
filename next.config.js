/** @type {import('next').NextConfig} */
module.exports = {
  exportPathMap: function () {
    return {
      '/': { page: '/' }
    }
  },
  reactStrictMode: true,
  env: {
    appName: 'MVP',
    webUrl: 'http://sugartrader.com.br',
    baseUrl: 'http://sugartrader.com.br',
    cluster: 'ap3',
  },
  images: {
    domains: ['postimg.cc', 'timetaskteam-dev.s3.ap-northeast-1.amazonaws.com'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};
