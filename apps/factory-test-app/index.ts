// Suppress React Native Firebase modular deprecation warnings
// The modular API internally uses deprecated methods with the correct suppression flag
// Official docs: https://rnfirebase.io/migrating-to-v22
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
