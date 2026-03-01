# @factory/auth-lite Integration Test Plan

## ⚠️ Important: expo-auth-session Refactor (Feb 2026)

This package has been refactored from `react-native-auth0` SDK to `expo-auth-session` for better reliability and simpler configuration. Key changes:

- **Authentication API**: Now uses React hooks (`useSignIn`) instead of imperative functions (`signInWithGoogle()`)
- **Token Storage**: Now uses `expo-secure-store` instead of Auth0's CredentialsManager
- **Dependencies**: `expo-auth-session`, `expo-web-browser`, `expo-crypto`, `expo-secure-store` instead of `react-native-auth0`
- **Configuration**: Requires `scheme` parameter in `initializeAuth0()`
- **Native Setup**: No Android manifest or iOS configuration needed (Expo handles it)

See `/packages/auth-lite/REFACTOR_SUMMARY.md` for complete migration details.

---

## Overview
This document provides a straightforward testing plan for validating the `@factory/auth-lite` package in the factory-test-app.

## Prerequisites
- ✅ Package installed via `file:` protocol
- ✅ Test UI implemented in `features/auth/Anonymous.tsx`
- ✅ Dependencies installed (`yarn install` completed)
- ✅ AsyncStorage available as peer dependency

## Test Suite: Anonymous/Guest Mode

### Test 1: Initial App Launch with Anonymous ID

**Purpose:** Verify anonymous ID generation and initialization on app startup

**Steps:**
1. Kill the app completely (swipe up from app switcher)
2. Launch the app fresh
3. Scroll to "Anonymous Mode Integration Test" section
4. Observe the Current State card

**Expected Results:**

**In the App UI:**
- ✅ "Anonymous ID" displays valid UUID (format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
- ✅ "Is Anonymous" shows "true"
- ✅ Storage Key shows "@factory/auth-lite:anonymous-id"
- ✅ Tests 1-3 show ✓ (pass) automatically
- ✅ Test results display in green

**In the Terminal Console Logs:**
- ✅ `LOG  [AuthLite] [Anonymous] Generated ID: <uuid>` OR `LOG  [AuthLite] [Anonymous] ID loaded: <uuid>`
- ✅ No error messages

**Why:** Confirms that anonymous ID is created on first launch or loaded from storage on subsequent launches

---

### Test 2: ID Persistence Verification

**Purpose:** Verify anonymous ID persists in AsyncStorage

**Steps:**
1. Note the current anonymous ID from Current State section
2. Tap "Run All Tests" button
3. Observe Test 4 result

**Expected Results:**

**In the App UI:**
- ✅ Test 4 shows ✓ with message "ID persists in AsyncStorage"
- ✅ Same ID remains displayed throughout

**In the Terminal Console Logs:**
- ✅ `LOG  [AuthLite] [Anonymous] ID loaded: <uuid>`

**Why:** Confirms AsyncStorage correctly saves and retrieves the anonymous ID

---

### Test 3: Hook Reactivity Check

**Purpose:** Verify hooks return correct values in real-time

**Steps:**
1. Observe Current State section values
2. Note "Anonymous ID" and "Is Anonymous" values match test results
3. Verify Test 2 and Test 3 both pass automatically

**Expected Results:**

**In the App UI:**
- ✅ Test 2 (Hook returns valid ID) passes with ✓
- ✅ Test 3 (isAnonymous returns true) passes with ✓
- ✅ Current State matches test expectations
- ✅ `useAnonymousId()` returns string UUID
- ✅ `useIsAnonymous()` returns true

**Why:** Confirms React hooks properly subscribe to state via useSyncExternalStore

---

### Test 4: Clear Anonymous ID

**Purpose:** Verify clearing ID removes it from storage and updates cache

**Steps:**
1. Tap "Run All Tests" button
2. Wait for Test 5 to execute (clears ID)
3. Observe Test 5 and Test 6 results
4. Check Current State section updates

**Expected Results:**

**In the App UI:**
- ✅ Test 5 passes with ✓ showing "ID cleared successfully"
- ✅ Test 6 passes with ✓ showing "Hook reflects cleared state"
- ✅ Current State "Anonymous ID" changes to "null"
- ✅ "Is Anonymous" changes to "false"

**In the Terminal Console Logs:**
- ✅ `LOG  [AuthLite] [Anonymous] ID cleared`

**Why:** Confirms `clearAnonymousIdWithCache()` removes ID from both storage and in-memory cache

---

### Test 5: Re-initialization After Clear

**Purpose:** Verify new anonymous ID can be created after clearing

**Steps:**
1. After Test 5 and Test 6 complete (ID is cleared)
2. Wait for Test 7 to execute automatically
3. Observe Test 7 result and Current State

**Expected Results:**

**In the App UI:**
- ✅ Test 7 passes with ✓ showing "Re-initialized: [first 8 chars]..."
- ✅ Current State shows new anonymous ID (different from original)
- ✅ "Is Anonymous" changes back to "true"
- ✅ New ID is valid UUID v4 format

**In the Terminal Console Logs:**
- ✅ `LOG  [AuthLite] [Anonymous] Generated ID: <new-uuid>`

**Why:** Confirms ID generation works after clearing and cache updates correctly

---

### Test 6: Multiple Test Cycles

**Purpose:** Verify test suite can run multiple times without errors

**Steps:**
1. Tap "Run All Tests" button
2. Wait for all tests to complete
3. Tap "Run All Tests" button again
4. Repeat 2-3 more times

**Expected Results:**

**In the App UI:**
- ✅ Each test cycle completes successfully
- ✅ All 7 tests pass each time
- ✅ ID changes with each cycle (due to clear/re-initialize)
- ✅ No errors or crashes
- ✅ Current State updates correctly each time

**Why:** Ensures test logic is idempotent and state management is robust

---

### Test 7: App Restart Persistence

**Purpose:** Verify anonymous ID persists across app restarts

**Steps:**
1. Note current anonymous ID from Current State
2. Kill app completely (force close)
3. Wait 5 seconds
4. Reopen app
5. Scroll to Anonymous Mode Integration Test section
6. Check Current State

**Expected Results:**

**In the App UI:**
- ✅ Same anonymous ID from step 1 is displayed
- ✅ "Is Anonymous" shows "true"
- ✅ Tests 1-3 auto-pass immediately
- ✅ No new ID generated (existing one loaded)

**In the Terminal Console Logs:**
- ✅ `LOG  [AuthLite] [Anonymous] ID loaded: <same-uuid>`
- ✅ NOT `Generated ID` (should load, not generate)

**Why:** Confirms AsyncStorage correctly persists ID across app sessions

---

### Test 8: Dark Mode Styling

**Purpose:** Verify UI adapts correctly to theme changes

**Steps:**
1. Navigate to "Stores" section
2. Tap "Set Dark Mode" button
3. Scroll back to "Anonymous Mode Integration Test" section
4. Observe styling
5. Tap "Set Light Mode" button
6. Observe styling changes

**Expected Results:**

**In the App UI:**
- ✅ **Dark Mode:**
  - Section background: #1a1a1a (dark gray)
  - Cards background: #2a2a2a (darker gray)
  - Text color: white
  - Test results remain readable
- ✅ **Light Mode:**
  - Section background: #f5f5f5 (light gray)
  - Cards background: #fff (white)
  - Text color: black
  - All elements clearly visible

**Why:** Confirms integration test UI follows global theme properly

---

### Test 9: Hook Consistency

**Purpose:** Verify `useAnonymousId` and `useIsAnonymous` stay synchronized

**Steps:**
1. Observe Current State section
2. Tap "Run All Tests" to trigger state changes
3. Watch both "Anonymous ID" and "Is Anonymous" values
4. Verify they update in sync

**Expected Results:**

**In the App UI:**
- ✅ When ID is string: "Is Anonymous" = true
- ✅ When ID is null: "Is Anonymous" = false
- ✅ No mismatched states
- ✅ Both values update simultaneously
- ✅ No flicker or delay between updates

**Why:** Confirms both hooks subscribe to same cache and update together

---

### Test 10: Storage Key Accuracy

**Purpose:** Verify correct AsyncStorage key is used

**Steps:**
1. Check "Storage Key" value in Current State section
2. Verify it matches expected constant

**Expected Results:**

**In the App UI:**
- ✅ Storage Key displays: `@factory/auth-lite:anonymous-id`
- ✅ Matches `ANONYMOUS_ID_KEY` constant
- ✅ No typos or variations

**Why:** Confirms correct storage key constant is exported and used

---

## Success Criteria

All 10 tests must pass for Anonymous/Guest Mode to be considered complete:

- [X] Test 1: Initial app launch with anonymous ID
- [X] Test 2: ID persistence verification
- [X] Test 3: Hook reactivity check
- [X] Test 4: Clear anonymous ID
- [X] Test 5: Re-initialization after clear
- [X] Test 6: Multiple test cycles
- [X] Test 7: App restart persistence
- [X] Test 8: Dark mode styling
- [X] Test 9: Hook consistency
- [X] Test 10: Storage key accuracy

---

## Test Suite: Social Sign-In Methods

### Prerequisites for Social Sign-In Tests
- Auth0 account created at https://auth0.com
- Auth0 application configured with:
  - Domain (e.g., `your-tenant.auth0.com`)
  - Client ID
  - Custom scheme for OAuth redirects (e.g., `factorytest`)
  - Social connections enabled (Google, Apple, Facebook)
  - Callback URLs configured for your app
  - Logout URLs configured
- Update `SocialSignIn.tsx` with your Auth0 credentials
- Ensure `expo-auth-session`, `expo-web-browser`, `expo-crypto`, and `expo-secure-store` are installed

### Test 1: Auth0 Initialization

**Purpose:** Verify Auth0 client initializes correctly with valid credentials

**Steps:**
1. Launch app and scroll to "Social Sign-In Integration Test" section
2. Replace `YOUR_AUTH0_DOMAIN` and `YOUR_AUTH0_CLIENT_ID` in `SocialSignIn.tsx`
3. Rebuild app
4. Tap "Initialize Auth0" button
5. Observe Current State card

**Expected Results:**

**In the App UI:**
- ✅ Alert shows "Auth0 initialized successfully"
- ✅ "Initialized" shows "Yes"
- ✅ "Initialize Auth0" button becomes disabled
- ✅ Social sign-in buttons become enabled

**In the Terminal Console Logs:**
- ✅ `LOG  [Auth0] Initializing with domain: your-tenant.auth0.com`
- ✅ `LOG  [Auth0] Client initialized successfully`

**Why:** Confirms Auth0 SDK initializes correctly and client is ready for authentication

---

### Test 2: Google Sign-In

**Purpose:** Verify Google OAuth flow works correctly

**Steps:**
1. Ensure Auth0 is initialized
2. Tap "Sign In with Google" button
3. Complete Google authentication in browser/webview
4. Return to app
5. Observe Current State card

**Expected Results:**

**In the App UI:**
- ✅ Browser/webview opens with Google login
- ✅ After authentication, returns to app
- ✅ Alert shows "Signed in with google"
- ✅ "Signed In" shows "Yes"
- ✅ "Access Token" displays first 20 characters
- ✅ "Token Type" shows "Bearer"
- ✅ "Expires In" shows number of seconds

**In the Terminal Console Logs:**
- ✅ `LOG  [Auth0] Starting sign-in with google-oauth2`
- ✅ `LOG  [Auth0] Sign-in successful`

**Why:** Confirms Google OAuth integration works via Auth0 Universal Login

---

### Test 3: Apple Sign-In

**Purpose:** Verify Apple OAuth flow works correctly

**Steps:**
1. Ensure Auth0 is initialized
2. If signed in from previous test, tap "Sign Out" first
3. Tap "Sign In with Apple" button
4. Complete Apple authentication
5. Return to app

**Expected Results:**

**In the App UI:**
- ✅ Apple authentication screen appears
- ✅ Returns to app after authentication
- ✅ Alert shows "Signed in with apple"
- ✅ Credentials displayed in Current State

**In the Terminal Console Logs:**
- ✅ `LOG  [Auth0] Starting sign-in with apple`
- ✅ `LOG  [Auth0] Sign-in successful`

**Why:** Confirms Apple OAuth integration works via Auth0

---

### Test 4: Facebook Sign-In

**Purpose:** Verify Facebook OAuth flow works correctly

**Steps:**
1. Ensure Auth0 is initialized
2. If signed in from previous test, tap "Sign Out" first
3. Tap "Sign In with Facebook" button
4. Complete Facebook authentication
5. Return to app

**Expected Results:**

**In the App UI:**
- ✅ Facebook authentication screen appears
- ✅ Returns to app after authentication
- ✅ Alert shows "Signed in with facebook"
- ✅ Credentials displayed in Current State

**In the Terminal Console Logs:**
- ✅ `LOG  [Auth0] Starting sign-in with facebook`
- ✅ `LOG  [Auth0] Sign-in successful`

**Why:** Confirms Facebook OAuth integration works via Auth0

---

### Test 5: Sign-Out

**Purpose:** Verify sign-out clears session correctly

**Steps:**
1. Ensure user is signed in (from any previous test)
2. Note credentials are displayed
3. Tap "Sign Out" button
4. Observe Current State updates

**Expected Results:**

**In the App UI:**
- ✅ Alert shows "Signed out successfully"
- ✅ "Signed In" changes to "No"
- ✅ Credentials no longer displayed
- ✅ Sign-in buttons become enabled again

**In the Terminal Console Logs:**
- ✅ `LOG  [Auth0] Starting sign-out`
- ✅ `LOG  [Auth0] Sign-out successful`

**Why:** Confirms `clearSession()` removes Auth0 session correctly

---

### Test 6: Error Handling - Sign-In Without Initialization

**Purpose:** Verify proper error handling when Auth0 not initialized

**Steps:**
1. Restart app (to reset initialization state)
2. Without tapping "Initialize Auth0", tap any sign-in button
3. Observe error handling

**Expected Results:**

**In the App UI:**
- ✅ Alert shows "Error: Initialize Auth0 first"
- ✅ No browser/webview opens
- ✅ "Initialized" remains "No"

**Why:** Confirms proper guard against using Auth0 before initialization

---

### Test 7: Error Handling - Sign-Out Without Session

**Purpose:** Verify proper error handling when signing out without active session

**Steps:**
1. Ensure not signed in (sign out if needed)
2. Tap "Sign Out" button
3. Observe error handling

**Expected Results:**

**In the App UI:**
- ✅ Alert shows "Error: Not signed in"
- ✅ No sign-out attempt made

**Why:** Confirms proper guard against signing out when no session exists

---

### Test 8: Credentials Structure

**Purpose:** Verify returned credentials have correct structure

**Steps:**
1. Sign in with any provider
2. Check credentials displayed in Current State
3. Compare with Auth0 Credentials interface

**Expected Results:**

**In the App UI:**
- ✅ Access Token: Present and string (first 20 chars shown)
- ✅ Token Type: "Bearer"
- ✅ Expires In: Number in seconds (typically 86400 or 3600)
- ✅ "Access Token" displays first 20 characters
- ✅ "Has Refresh Token" shows "Yes"
- ✅ "Expires" shows date/time

**Why:** Confirms credentials are stored with PKCE code exchange completing successfully

---

### Test 9: Loading States

**Purpose:** Verify loading indicators work during async operations

**Steps:**
1. Tap any sign-in button
2. Observe button during authentication flow
3. Complete or cancel authentication
4. Observe button returns to normal state

**Expected Results:**

**In the App UI:**
- ✅ Button shows ActivityIndicator while loading
- ✅ Button text hidden during loading
- ✅ Button disabled during loading
- ✅ After completion, loading indicator disappears
- ✅ Button text reappears

**Why:** Confirms proper UI feedback during async authentication

---

### Test 10: Dark Mode Styling

**Purpose:** Verify Social Sign-In UI adapts to theme changes

**Steps:**
1. Navigate to "Stores" section
2. Tap "Set Dark Mode" button
3. Scroll back to "Social Sign-In Integration Test" section
4. Observe styling
5. Tap "Set Light Mode" button
6. Observe styling changes

**Expected Results:**

**In the App UI:**
- ✅ **Dark Mode:**
  - Section background: #1a1a1a
  - Cards background: #2a2a2a
  - Text color: white
  - Buttons remain readable
- ✅ **Light Mode:**
  - Section background: #f5f5f5
  - Cards background: #fff
  - Text color: black
  - All elements clearly visible

**Why:** Confirms integration test UI follows global theme

---

## Success Criteria - Social Sign-In

All 10 tests must pass for Social Sign-In Methods to be considered complete:

- [X] Test 1: Auth0 initialization
- [X] Test 2: Google sign-in
- [X] Test 3: Apple sign-in
- [X] Test 4: Facebook sign-in
- [X] Test 5: Sign-out
- [X] Test 6: Error handling - sign-in without initialization
- [X] Test 7: Error handling - sign-out without session
- [X] Test 8: Credentials structure
- [X] Test 9: Loading states
- [X] Test 10: Dark mode styling

---

## Test Suite: Token Storage, Refresh, and Session Lifecycle

### Test 1: Credentials Saved After Sign-In

**Purpose:** Verify credentials automatically saved to secure storage after sign-in

**Steps:**
1. Initialize Auth0
2. Tap "Sign In (saves credentials)"
3. Complete Google sign-in flow
4. Check "Has Valid Credentials" status

**Expected Results:**

**In the App UI:**
- ✅ "Has Valid Credentials" shows "Yes"
- ✅ Token info displayed (access token first 30 chars, token type, expires in)
- ✅ Alert confirms "Signed in and credentials saved"

**In the Terminal Console Logs:**
- ✅ `LOG  [Auth0] Starting sign-in with google-oauth2`
- ✅ `LOG  [Credentials] Saving credentials securely`
- ✅ `LOG  [Credentials] Credentials saved successfully`
- ✅ `LOG  [Auth0] Sign-in successful and credentials saved`

**Why:** Confirms credentials automatically persist after sign-in

---

### Test 2: Get Credentials with Auto-Refresh

**Purpose:** Verify credentials can be retrieved from storage with automatic refresh

**Steps:**
1. Ensure signed in from Test 1
2. Tap "Get Credentials (auto-refresh)"
3. Observe token info updates

**Expected Results:**

**In the App UI:**
- ✅ Alert shows "Retrieved credentials (auto-refreshed if needed)"
- ✅ Token info displayed correctly
- ✅ No sign-in prompt (uses stored credentials)

**In the Terminal Console Logs:**
- ✅ `LOG  [Credentials] Getting credentials (auto-refresh if needed)`
- ✅ `LOG  [Credentials] Credentials retrieved successfully`

**Why:** Confirms `getCredentials()` retrieves from expo-secure-store and handles refresh automatically using manual token exchange

---

### Test 3: Get Access Token Only

**Purpose:** Verify convenience method for getting just access token

**Steps:**
1. Ensure valid credentials exist
2. Tap "Get Access Token Only"
3. Observe alert with token

**Expected Results:**

**In the App UI:**
- ✅ Alert shows first 50 characters of access token
- ✅ No error

**In the Terminal Console Logs:**
- ✅ `LOG  [Credentials] Getting credentials (auto-refresh if needed)`
- ✅ `LOG  [Credentials] Credentials retrieved successfully`

**Why:** Confirms `getAccessToken()` convenience method works

---

### Test 4: Force Refresh Credentials

**Purpose:** Verify manual token refresh using forceRefresh option

**Steps:**
1. Note current access token (first 30 chars shown)
2. Tap "Force Refresh Credentials"
3. Compare new access token

**Expected Results:**

**In the App UI:**
- ✅ New access token generated (different from before)
- ✅ Token info updated with new values
- ✅ Alert confirms "Credentials force-refreshed"
- ✅ ExpiresIn value reset to full duration

**In the Terminal Console Logs:**
- ✅ `LOG  [Credentials] Force refreshing credentials`
- ✅ `LOG  [Credentials] Credentials retrieved successfully`

**Why:** Confirms `refreshCredentials()` forces token refresh even if not expired

---

### Test 5: Credentials Persist Across App Restarts

**Purpose:** Verify credentials stored in secure storage persist across app sessions

**Steps:**
1. Ensure "Has Valid Credentials" is "Yes"
2. Note current token info
3. Kill app completely (force close)
4. Wait 5 seconds
5. Relaunch app
6. Scroll to Token Management section
7. Check "Has Valid Credentials" status

**Expected Results:**

**In the App UI:**
- ✅ "Has Valid Credentials" shows "Yes" immediately on restart
- ✅ No sign-in required to access credentials

**In the Terminal Console Logs:**
- ✅ `LOG  [Credentials] Checking credential validity`
- ✅ `LOG  [Credentials] Credentials valid: true`

**Why:** Confirms Auth0 CredentialsManager persists to iOS Keychain/Android Keystore across sessions

---

### Test 6: Clear Credentials Only

**Purpose:** Verify credentials can be removed from storage without signing out

**Steps:**
1. Ensure "Has Valid Credentials" is "Yes"
2. Tap "Clear Credentials Only"
3. Check status updates

**Expected Results:**

**In the App UI:**
- ✅ "Has Valid Credentials" changes to "No"
- ✅ Token info disappears
- ✅ Alert confirms "Credentials cleared from storage"

**In the Terminal Console Logs:**
- ✅ `LOG  [Credentials] Clearing credentials`
- ✅ `LOG  [Credentials] Credentials cleared successfully`

**Why:** Confirms `clearCredentials()` removes credentials from secure storage

---

### Test 7: Sign-Out Clears Credentials

**Purpose:** Verify sign-out removes both session and credentials

**Steps:**
1. Sign in again if needed
2. Ensure "Has Valid Credentials" is "Yes"
3. Tap "Sign Out (clears credentials)"
4. Check status

**Expected Results:**

**In the App UI:**
- ✅ "Has Valid Credentials" shows "No"
- ✅ Token info cleared
- ✅ Alert confirms "Signed out and credentials cleared"

**In the Terminal Console Logs:**
- ✅ `LOG  [Auth0] Starting sign-out`
- ✅ `LOG  [Auth0] Sign-out successful and credentials cleared`
- ✅ `LOG  [Credentials] Clearing credentials`
- ✅ `LOG  [Credentials] Credentials cleared successfully`

**Why:** Confirms `signOut()` clears both Auth0 session and stored credentials

---

### Test 8: Error Handling - Get Credentials When None Exist

**Purpose:** Verify proper error when attempting to get credentials without any stored

**Steps:**
1. Ensure signed out and credentials cleared
2. Tap "Get Credentials (auto-refresh)"
3. Observe error

**Expected Results:**

**In the App UI:**
- ✅ Alert shows error message
- ✅ No crash

**In the Terminal Console Logs:**
- ✅ `LOG  [Credentials] Getting credentials (auto-refresh if needed)`
- ✅ `ERROR  [Credentials] Failed to get credentials: [error details]`

**Why:** Confirms proper error handling when no credentials stored

---

### Test 9: Session Validation Accuracy

**Purpose:** Verify hasValidCredentials accurately reflects storage state

**Steps:**
1. Sign in - check "Has Valid Credentials"
2. Clear credentials - check status again
3. Sign in again - check status updates
4. Sign out - check status again

**Expected Results:**

**In the App UI:**
- ✅ Status accurately reflects credential state at each step
- ✅ Status updates immediately after each operation
- ✅ When signed in: "Has Valid Credentials" = "Yes"
- ✅ When cleared/signed out: "Has Valid Credentials" = "No"

**Why:** Confirms `hasValidCredentials()` correctly checks Auth0 CredentialsManager state

---

### Test 10: Dark Mode Styling

**Purpose:** Verify Token Management UI adapts to theme changes

**Steps:**
1. Navigate to "Stores" section
2. Tap "Set Dark Mode" button
3. Scroll back to "Token Management Integration Test" section
4. Observe styling
5. Tap "Set Light Mode" button
6. Observe styling changes

**Expected Results:**

**In the App UI:**
- ✅ **Dark Mode:**
  - Section background: #1a1a1a
  - Cards background: #2a2a2a
  - Text color: white
  - Buttons remain readable
- ✅ **Light Mode:**
  - Section background: #f5f5f5
  - Cards background: #fff
  - Text color: black
  - All elements clearly visible

**Why:** Confirms integration test UI follows global theme

---

## Success Criteria - Token Management

All 10 tests must pass for Token Storage, Refresh, and Session Lifecycle to be considered complete:

- [X] Test 1: Credentials saved after sign-in
- [X] Test 2: Get credentials with auto-refresh
- [X] Test 3: Get access token only
- [X] Test 4: Force refresh credentials
- [X] Test 5: Credentials persist across app restarts
- [X] Test 6: Clear credentials only
- [X] Test 7: Sign-out clears credentials
- [X] Test 8: Error handling when no credentials
- [X] Test 9: Session validation accuracy
- [X] Test 10: Dark mode styling

---

# Feature 4: Account Linking (Guest → Full Account Migration) Integration Tests

## Overview

These tests verify account migration from anonymous (guest) to authenticated user works correctly after authentication.

## Test Environment

- **Device:** iOS Simulator (iPhone 15 Pro recommended)
- **React Native Version:** 0.77.6
- **Test Location:** Account Migration section in factory-test-app
- **Auth0 Setup Required:** Valid Auth0 domain and client ID with Google social connection enabled

---

## Test Plan

### Test 1: Migration Callback Registration

**Purpose:** Verify migration callback is registered correctly on initialization

**Steps:**
1. Launch the app
2. Scroll to "Account Migration" section
3. Tap "Initialize Auth0" button
4. Observe migration log

**Expected Results:**

**In the App UI:**
- ✅ Log shows: "Auth0 initialized and migration callback set"
- ✅ Auth Status changes to "anonymous"
- ✅ Anonymous ID is displayed (e.g., "a1b2c3d4...")

**Why:** Confirms `setMigrationCallback()` registers the app's migration handler

---

### Test 2: Automatic Migration on Sign-In

**Purpose:** Verify migration automatically triggers when anonymous user signs in

**Steps:**
1. Complete Test 1 (initialize)
2. Note the current anonymous ID
3. Tap "Sign In (Google)" button
4. Complete Google OAuth flow
5. Observe migration log

**Expected Results:**

**In the App UI:**
- ✅ Log shows: "Starting sign-in..."
- ✅ Log shows: "Migration callback invoked"
- ✅ Log shows the anonymous ID from step 2
- ✅ Log shows a user ID (Auth0 token)
- ✅ Log shows: "Migration successful"
- ✅ Log shows: "Sign-in completed"
- ✅ Auth Status changes to "authenticated"
- ✅ Anonymous ID becomes "None"

**Why:** Confirms `checkAndMigrate()` is called automatically after successful authentication

---

### Test 3: Migration Executes Only Once

**Purpose:** Verify migration callback only executes once per session

**Steps:**
1. Complete Test 2 (sign in with migration)
2. Tap "Manual Migration Check" button
3. Tap "Manual Migration Check" button again
4. Observe migration log

**Expected Results:**

**In the App UI:**
- ✅ Log shows: "Manually checking migration..."
- ✅ Log shows: "No migration needed"
- ✅ Migration callback is NOT invoked again
- ✅ Anonymous ID remains "None"

**Why:** Confirms `migrationAttempted` flag prevents duplicate migrations

---

### Test 4: Migration Flag Reset

**Purpose:** Verify migration flag can be reset for testing purposes

**Steps:**
1. Complete Test 3 (migration already executed)
2. Tap "Reset Migration Flag" button
3. Observe migration log

**Expected Results:**

**In the App UI:**
- ✅ Log shows: "Migration flag reset"
- ✅ No errors occur
- ✅ Anonymous ID still "None" (no migration triggered yet)

**Why:** Confirms `resetMigrationFlag()` resets the internal state

---

### Test 5: No Migration Without Anonymous ID

**Purpose:** Verify migration doesn't trigger if no anonymous ID exists

**Steps:**
1. Complete Test 4 (flag reset, no anonymous ID)
2. Tap "Manual Migration Check" button
3. Observe migration log

**Expected Results:**

**In the App UI:**
- ✅ Log shows: "Manually checking migration..."
- ✅ Log shows: "No migration needed"
- ✅ Migration callback is NOT invoked
- ✅ Auth Status remains "authenticated"

**Why:** Confirms migration only happens when anonymous-to-authenticated transition occurs

---

### Test 6: Migration After Sign-Out and Re-Sign-In

**Purpose:** Verify complete anonymous → authenticated cycle works multiple times

**Steps:**
1. Complete Test 5 (authenticated, no anonymous ID)
2. Tap "Sign Out" button
3. Observe migration log and status
4. Tap "Initialize Auth0" button (re-register callback)
5. Wait for new anonymous ID to appear
6. Tap "Sign In (Google)" button
7. Complete authentication
8. Observe migration log

**Expected Results:**

**In the App UI:**
- ✅ After sign-out:
  - Log shows: "Starting sign-out..." → "Sign-out completed"
  - Auth Status changes to "anonymous"
  - Anonymous ID remains "None" temporarily
- ✅ After re-initialize:
  - New anonymous ID is generated
- ✅ After sign-in:
  - Migration callback invoked with new anonymous ID
  - Migration successful
  - Anonymous ID cleared
  - Auth Status: "authenticated"

**Why:** Confirms the entire flow works repeatedly across sessions

---

### Test 7: Error Handling in Callback

**Purpose:** Verify error handling when migration callback fails

**Steps:**
1. Manually edit `AccountMigration.tsx` callback to throw error:
   ```typescript
   const callback: MigrationCallback = async (anonId: string, userId: string) => {
     addLog(`Migration callback invoked`);
     throw new Error('Simulated migration failure');
   };
   ```
2. Restart the app
3. Complete initialization and sign-in flow
4. Observe migration log

**Expected Results:**

**In the App UI:**
- ✅ Log shows: "Migration callback invoked"
- ✅ Anonymous ID is NOT cleared (remains visible)
- ✅ Auth Status shows "authenticated" (sign-in succeeded)
- ✅ App does not crash

**Why:** Confirms errors in callback don't crash app or prevent authentication

---

### Test 8: Manual Check Without Initialization

**Purpose:** Verify graceful handling when callback not registered

**Steps:**
1. Force close and restart app
2. Scroll to "Account Migration" section
3. Tap "Manual Migration Check" WITHOUT initializing
4. Observe migration log

**Expected Results:**

**In the App UI:**
- ✅ Log shows: "Manually checking migration..."
- ✅ Log shows: "No migration needed" OR error logged gracefully
- ✅ App does not crash
- ✅ Auth Status shows "unknown"

**Why:** Confirms `checkAndMigrate()` handles uninitialized state safely

---

### Test 9: Callback Receives Correct Parameters

**Purpose:** Verify callback receives valid anonymous ID and user ID

**Steps:**
1. Complete clean initialization and sign-in flow
2. Manually inspect migration log values
3. Verify format of IDs

**Expected Results:**

**In the App UI:**
- ✅ Anonymous ID is a valid UUID (e.g., "a1b2c3d4-...")
- ✅ User ID is a valid Auth0 token (string, not empty)
- ✅ Both IDs are logged with truncated display (first 8 chars)

**Why:** Confirms `checkAndMigrate()` passes correct parameters to callback

---

### Test 10: Dark Mode Styling

**Purpose:** Verify Account Migration UI adapts to theme changes

**Steps:**
1. Navigate to "Stores" section
2. Tap "Set Dark Mode" button
3. Scroll back to "Account Migration" section
4. Observe styling
5. Tap "Set Light Mode" button
6. Observe styling changes

**Expected Results:**

**In the App UI:**
- ✅ **Dark Mode:**
  - Section background: dark gray
  - Log background: #1e1e1e
  - Log text: light color
  - Status values readable
- ✅ **Light Mode:**
  - Section background: light
  - Log background: #1e1e1e (unchanged)
  - All elements clearly visible

**Why:** Confirms integration test UI follows global theme

---

## Success Criteria - Account Migration

All 10 tests must pass for Account Linking (Guest → Full Account Migration) to be considered complete:

- [X] Test 1: Migration callback registration
- [X] Test 2: Automatic migration on sign-in
- [X] Test 3: Migration executes only once
- [X] Test 4: Migration flag reset
- [X] Test 5: No migration without anonymous ID
- [X] Test 6: Migration after sign-out and re-sign-in
- [X] Test 7: Error handling in callback
- [X] Test 8: Manual check without initialization
- [X] Test 9: Callback receives correct parameters
- [X] Test 10: Dark mode styling

---

# Feature 5: Account Management APIs Integration Tests

## Overview

These tests verify user profile retrieval using Auth0's `userInfo()` API works correctly.

## Test Plan

### Test 1: User Profile Loads After Sign-In

**Purpose:** Verify user profile is fetched from Auth0 userInfo endpoint

**Steps:**
1. Initialize Auth0
2. Sign in with Google
3. Observe User Profile section

**Expected Results:**
- ✅ Profile displays user ID (e.g., "auth0|...")
- ✅ Email is displayed
- ✅ Name is displayed
- ✅ Given name and family name shown
- ✅ Nickname displayed
- ✅ Email verification status shown
- ✅ Avatar URL displayed (truncated)
- ✅ Updated timestamp shown

**Why:** Confirms `auth.userInfo()` is called correctly with access token

---

### Test 2: Profile Data Accuracy

**Purpose:** Verify profile data matches actual Auth0/Google account

**Steps:**
1. Sign in with known Google account
2. Compare displayed data with actual Google profile

**Expected Results:**
- ✅ Email matches Google account exactly
- ✅ Name matches Google profile
- ✅ Email verification reflects Google status
- ✅ Profile picture URL is valid

**Why:** Confirms Auth0 userInfo endpoint returns accurate data

---

### Test 3: Profile Clears After Sign-Out

**Purpose:** Verify user profile is cleared on sign-out

**Steps:**
1. Sign in (profile visible)
2. Tap "Sign Out"
3. Observe User Profile section

**Expected Results:**
- ✅ Profile container disappears
- ✅ "No user profile" message appears
- ✅ "Sign in to load profile" subtext shown

**Why:** Confirms `useUserProfile()` hook updates on auth state change

---

### Test 4: Hook Updates Automatically

**Purpose:** Verify React hook updates when profile becomes available

**Steps:**
1. Note "No user profile" state
2. Sign in
3. Observe UI updates without manual refresh

**Expected Results:**
- ✅ Profile appears automatically after sign-in
- ✅ No manual refresh needed
- ✅ All fields populate

**Why:** Confirms `useUserProfile()` hook works correctly

---

### Test 5: Error Handling - No Credentials

**Purpose:** Verify graceful handling when not signed in

**Steps:**
1. Force close app
2. Restart app
3. Navigate to Account Management (don't sign in)
4. Observe display

**Expected Results:**
- ✅ No crash
- ✅ "No user profile" message
- ✅ Sign-in button available

**Why:** Confirms `getUserProfile()` returns null gracefully

---

### Test 6: Profile Fields Completeness

**Purpose:** Verify all standard OpenID Connect claims are displayed

**Steps:**
1. Sign in
2. Inspect all profile fields

**Expected Results:**
- ✅ `sub` (user ID) present
- ✅ `email` present
- ✅ `email_verified` present
- ✅ `name` present
- ✅ `given_name` present
- ✅ `family_name` present
- ✅ `nickname` present
- ✅ `picture` present
- ✅ `updated_at` present

**Why:** Confirms userInfo API returns complete profile

---

### Test 7: Multiple Sign-In/Out Cycles

**Purpose:** Verify profile loading works repeatedly

**Steps:**
1. Sign in (profile loads)
2. Sign out (profile clears)
3. Sign in again (profile reloads)
4. Sign out again (profile clears)

**Expected Results:**
- ✅ Profile loads each time after sign-in
- ✅ Profile clears each time after sign-out
- ✅ No stale data from previous sessions

**Why:** Confirms state management is clean

---

### Test 8: Profile With Missing Optional Fields

**Purpose:** Verify graceful handling of missing profile data

**Steps:**
1. Sign in with account that may have incomplete profile
2. Observe display

**Expected Results:**
- ✅ Missing fields show "N/A"
- ✅ No crash or errors
- ✅ Available fields display correctly

**Why:** Confirms null/undefined handling

---

### Test 9: Re-render After State Change

**Purpose:** Verify component re-renders when switching between sections

**Steps:**
1. Sign in (profile visible)
2. Navigate to another section
3. Navigate back to Account Management

**Expected Results:**
- ✅ Profile still visible
- ✅ Data persists
- ✅ No unnecessary re-fetching

**Why:** Confirms hook state management

---

### Test 10: Dark Mode Styling

**Purpose:** Verify UI adapts to theme changes

**Steps:**
1. Navigate to Stores section
2. Toggle dark mode
3. Return to Account Management

**Expected Results:**
- ✅ Background colors adapt
- ✅ Text remains readable
- ✅ All sections visible in both modes
- ✅ Green border on profile card visible

**Why:** Confirms UI integration

---

## Success Criteria - Account Management

All 10 tests must pass:
- [X] Test 1: Profile loads after sign-in
- [X] Test 2: Profile data accuracy
- [X] Test 3: Profile clears on sign-out
- [X] Test 4: Hook updates automatically
- [X] Test 5: Error handling - no credentials
- [X] Test 6: Profile fields completeness
- [X] Test 7: Multiple sign-in/out cycles
- [X] Test 8: Profile with missing fields
- [X] Test 9: Re-render after state change
- [X] Test 10: Dark mode styling

---

# Feature 6: Account Deletion Flow & Legal Confirmation Integration Tests

## Overview

These tests verify the compliant account deletion flow with legal confirmations and re-authentication.

## Test Plan

### Test 1: Deletion Callback Registration

**Purpose:** Verify deletion callback is registered correctly

**Steps:**
1. Tap "Initialize Auth0"
2. Observe event log

**Expected Results:**
- ✅ Log shows: "Auth0 initialized and deletion callback set"
- ✅ No errors

**Why:** Confirms `setDeletionCallback()` registers handler

---

### Test 2: Legal Confirmation Dialog Display

**Purpose:** Verify legal warning dialog appears with all required information

**Steps:**
1. Complete Test 1 (initialize)
2. Sign in with Google
3. Tap "Delete Account"
4. Observe modal dialog

**Expected Results:**
- ✅ Modal appears with title "Delete Account"
- ✅ Warning message about permanence
- ✅ List of 5 consequences
- ✅ Acknowledgment switch (off by default)
- ✅ "Cancel" and "Delete Account" buttons
- ✅ Delete button is disabled (no acknowledgment yet)

**Why:** Confirms GDPR/CCPA transparency requirements are met

---

### Test 3: Acknowledgment Requirement

**Purpose:** Verify user must explicitly acknowledge warning

**Steps:**
1. Complete Test 2 (show dialog)
2. Try to tap "Delete Account" button
3. Observe behavior
4. Toggle acknowledgment switch
5. Try button again

**Expected Results:**
- ✅ Button disabled without acknowledgment
- ✅ Button enabled after toggle
- ✅ Switch visually indicates acknowledgment

**Why:** Confirms explicit consent requirement

---

### Test 4: Cancellation Flow

**Purpose:** Verify user can cancel deletion

**Steps:**
1. Show deletion dialog
2. Toggle acknowledgment switch
3. Tap "Cancel" button
4. Observe modal closes

**Expected Results:**
- ✅ Modal closes immediately
- ✅ Log shows: "Deletion cancelled"
- ✅ User remains signed in
- ✅ No deletion occurs

**Why:** Confirms user can abort process

---

### Test 5: Re-authentication Trigger

**Purpose:** Verify re-authentication is required before deletion

**Steps:**
1. Show deletion dialog
2. Toggle acknowledgment
3. Tap "Delete Account"
4. Observe re-authentication flow

**Expected Results:**
- ✅ Auth0 login screen appears
- ✅ Forces fresh login (maxAge: 0)
- ✅ Log shows: "User confirmed deletion, starting process..."
- ✅ Button shows "Processing..."

**Why:** Confirms security measure against hijacked sessions

---

### Test 6: Successful Deletion Flow

**Purpose:** Verify complete deletion flow executes correctly

**Steps:**
1. Complete re-authentication
2. Observe event log
3. Wait for completion

**Expected Results:**
- ✅ Log shows: "Deletion callback invoked"
- ✅ Log shows user ID (truncated)
- ✅ Log shows access token (truncated)
- ✅ Log shows: "Backend deletion completed (simulated)"
- ✅ Log shows: "✅ Deletion completed successfully"
- ✅ Modal closes
- ✅ Button re-enabled

**Why:** Confirms callback receives correct parameters

---

### Test 7: Error Handling - Re-auth Failure

**Purpose:** Verify graceful handling when re-authentication fails

**Steps:**
1. Show deletion dialog
2. Toggle acknowledgment
3. Tap "Delete Account"
4. Cancel Auth0 login (tap back/cancel)
5. Observe behavior

**Expected Results:**
- ✅ Modal remains open
- ✅ Error message displayed
- ✅ Log shows: "❌ Deletion failed"
- ✅ User can try again or cancel
- ✅ No callback invoked

**Why:** Confirms error handling for auth failures

---

### Test 8: Error Handling - No Callback Registered

**Purpose:** Verify error when callback not configured

**Steps:**
1. Force close app
2. Restart app
3. Sign in WITHOUT initializing callback
4. Try to delete account

**Expected Results:**
- ✅ Error displayed: "Deletion callback not configured"
- ✅ Log shows error
- ✅ No re-authentication attempted
- ✅ Modal can be dismissed

**Why:** Confirms validation of callback registration

---

### Test 9: Button States During Processing

**Purpose:** Verify UI prevents duplicate submissions

**Steps:**
1. Show deletion dialog
2. Toggle acknowledgment
3. Tap "Delete Account"
4. Observe button during re-auth and processing

**Expected Results:**
- ✅ Button disabled during process
- ✅ Text changes to "Processing..."
- ✅ Cannot tap button multiple times
- ✅ Cancel button remains enabled

**Why:** Confirms UI prevents race conditions

---

### Test 10: Modal Transparency and Styling

**Purpose:** Verify modal overlay and accessibility

**Steps:**
1. Show deletion dialog
2. Observe modal styling
3. Check backdrop
4. Verify consequences list readability

**Expected Results:**
- ✅ Semi-transparent backdrop
- ✅ Modal centered on screen
- ✅ Red color scheme for warnings
- ✅ Consequences in pink/red box
- ✅ All text readable

**Why:** Confirms visual clarity and accessibility

---

## Success Criteria - Account Deletion

All 10 tests must pass:
- [X] Test 1: Deletion callback registration
- [X] Test 2: Legal confirmation dialog display
- [X] Test 3: Acknowledgment requirement
- [X] Test 4: Cancellation flow
- [X] Test 5: Re-authentication trigger
- [X] Test 6: Successful deletion flow
- [X] Test 7: Error handling - re-auth failure
- [X] Test 8: Error handling - no callback
- [X] Test 9: Button states during processing
- [X] Test 10: Modal transparency and styling
