export const maybeCompleteAuthSession = jest.fn();

export const useAuthRequest = jest.fn();
export const useAutoDiscovery = jest.fn();
export const makeRedirectUri = jest.fn();
export const exchangeCodeAsync = jest.fn();
export const refreshAsync = jest.fn();
export const fetchUserInfoAsync = jest.fn();

export default {
  maybeCompleteAuthSession,
  useAuthRequest,
  useAutoDiscovery,
  makeRedirectUri,
  exchangeCodeAsync,
  refreshAsync,
  fetchUserInfoAsync,
};
