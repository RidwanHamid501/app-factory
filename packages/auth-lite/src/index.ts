export {
  type AnonymousId,
  ANONYMOUS_ID_KEY,
  generateAnonymousId,
  saveAnonymousId,
  loadAnonymousId,
  clearAnonymousId,
  getOrCreateAnonymousId,
  useAnonymousId,
  useIsAnonymous,
  initializeAnonymousId,
  clearAnonymousIdWithCache,
} from './anonymous';

export {
  type Auth0Config,
  initializeAuth0,
  getAuth0Config,
} from './auth/config';

export {
  type Credentials,
  type UseSignInReturn,
  useSignIn,
  useSignInWithGoogle,
  useSignInWithApple,
  useSignInWithFacebook,
} from './auth/signin';

export {
  signOut,
} from './auth/signout';

export {
  type TokenResponse,
  type UserInfo,
  useAuthRequest,
  exchangeCodeForTokens,
  refreshAccessToken,
  getUserInfo,
} from './auth/services/auth0Service';

export {
  saveCredentials,
  clearCredentials,
} from './credentials/storage';

export {
  hasValidCredentials,
} from './credentials/validation';

export {
  getCredentials,
  getAccessToken,
  refreshCredentials,
  type GetCredentialsOptions,
} from './credentials/retrieval';

export {
  type MigrationCallback,
  setMigrationCallback,
  checkAndMigrate,
  resetMigrationFlag,
} from './linking/migration';

export {
  type UserProfile,
  getUserProfile,
  getUserId,
  getUserEmail,
} from './profile/user';

export {
  type DeletionConfirmation,
  type DeletionWarning,
  DEFAULT_DELETION_WARNING,
} from './deletion/types';

export {
  type UseConfirmationResult,
  useConfirmation,
} from './deletion/useConfirmation';

export {
  type DeletionCallback,
  setDeletionCallback,
} from './deletion/request';

export {
  type UseDeletionResult,
  useDeletion,
} from './deletion/useDeletion';

export { Logger } from './utils/logger';
