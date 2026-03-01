const { getDefaultConfig } = require('expo/metro-config');
const { DuplicateDependencies } = require('@rnx-kit/metro-plugin-duplicates-checker');
const { MetroSerializer } = require('@rnx-kit/metro-serializer');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ],
  blockList: [
    new RegExp(`${monorepoRoot}/packages/.*/node_modules/react/`),
    new RegExp(`${monorepoRoot}/packages/.*/node_modules/react-native/`),
  ],
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === '@factory/app-shell') {
      return {
        filePath: path.resolve(monorepoRoot, 'packages/app-shell/src/index.ts'),
        type: 'sourceFile',
      };
    }
    
    if (moduleName === '@factory/auth-lite') {
      return {
        filePath: path.resolve(monorepoRoot, 'packages/auth-lite/src/index.ts'),
        type: 'sourceFile',
      };
    }
    
    return context.resolveRequest(context, moduleName, platform);
  },
};

config.serializer = {
  ...config.serializer,
  customSerializer: MetroSerializer([
    DuplicateDependencies({
      throwOnError: false,
    }),
  ]),
};

module.exports = config;
