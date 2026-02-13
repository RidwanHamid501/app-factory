// Metro configuration for Expo SDK 54+ with monorepo support
// Official docs: https://docs.expo.dev/guides/monorepos
// Duplicate detection: https://microsoft.github.io/rnx-kit/docs/tools/metro-plugin-duplicates-checker

const { getDefaultConfig } = require('expo/metro-config');
const { DuplicateDependencies } = require('@rnx-kit/metro-plugin-duplicates-checker');
const { MetroSerializer } = require('@rnx-kit/metro-serializer');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch folders for local packages
config.watchFolders = [monorepoRoot];

// Add duplicate detection plugin
config.serializer = {
  ...config.serializer,
  customSerializer: MetroSerializer([
    DuplicateDependencies({
      throwOnError: false, // Just warn, don't fail
    }),
  ]),
};

module.exports = config;
