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

// Node module resolution for monorepo
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ],
  // Custom resolver for file: protocol packages to use source files directly
  resolveRequest: (context, moduleName, platform) => {
    // For @factory/app-shell, resolve to source files directly
    if (moduleName === '@factory/app-shell') {
      return {
        filePath: path.resolve(monorepoRoot, 'packages/app-shell/src/index.ts'),
        type: 'sourceFile',
      };
    }
    
    // Use default resolver for everything else
    return context.resolveRequest(context, moduleName, platform);
  },
};

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
