// Type-safe route hook - Official docs: https://reactnavigation.org/docs/typescript#annotating-useroute

import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { ParamListBase } from '@react-navigation/native';

// Type-safe route hook - apps extend this with their own route param lists
export function useTypedRoute<
  T extends ParamListBase,
  RouteName extends keyof T
>(): RouteProp<T, RouteName> {
  return useRoute<RouteProp<T, RouteName>>();
}
