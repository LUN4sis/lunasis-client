// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// React Native의 package.json exports 경고를 줄이기 위한 설정
config.resolver = {
  ...config.resolver,
  // package.json exports 필드 검증을 완화
  unstable_enablePackageExports: true,
};

module.exports = config;
