// Type-safe navigation hook - Official docs: https://reactnavigation.org/docs/typescript#annotating-usenavigation

import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

// Type-safe navigation hook - apps extend this with their own route param lists
export function useTypedNavigation<T extends ParamListBase = ParamListBase>(): NavigationProp<T> {
  return useNavigation<NavigationProp<T>>();
}
