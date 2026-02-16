// Navigation module - Public exports - Official docs: https://reactnavigation.org/docs/getting-started

export { NavigationContainer } from './NavigationContainer';

export {
  navigationRef,
  navigate,
  goBack,
  resetRoot,
  getCurrentRouteName,
  getCurrentRouteParams,
} from './navigationRef';

export {
  parseDeepLink,
  isValidAppURL,
} from './linking';

export {
  useTypedNavigation,
  useTypedRoute,
} from './hooks';

export type {
  NavigationConfig,
  AppNavigatorConfig,
  DeepLink,
  NavigationState,
  TypedNavigationProp,
  AppNavigationRef,
} from './types';

export type {
  ParamListBase,
  CompositeScreenProps,
} from '@react-navigation/native';

