# @factory/app-shell Integration Test Plan

## Overview
This document provides a straightforward testing plan for validating the `@factory/app-shell` package in the factory-test-app.

## Prerequisites
- ✅ Package installed via `file:` protocol
- ✅ Test UI implemented in `App.tsx`
- ✅ Dependencies installed (`yarn install` completed)
- ✅ Expo CLI available (comes with project dependencies)

## Test Suite: Lifecycle

### Test 1: Initial App Launch (Cold Start)

**Purpose:** Verify cold start detection and initialization

**Steps:**
1. Kill the app completely (swipe up from app switcher)
2. Launch the app fresh
3. Observe the UI

**Expected Results:**

**In the App UI:**
- ✅ "Manager Initialized" shows "✓ Yes" (in green)
- ✅ "Startup Type" shows "cold"
- ✅ "Is Cold Start" shows "Yes"
- ✅ "Is Warm Start" shows "No"
- ✅ "Current State" shows "active"
- ✅ "Previous State" shows "null"
- ✅ Event log shows "LifecycleManager initialized"
- ✅ Event log shows "Event: appStarting"
- ✅ Session ID is present (format: session_XXXXX_XXXXX)

**In the Terminal Console Logs:**
- ✅ `LOG  [AppShell] Initializing LifecycleManager`
- ✅ `LOG  [AppShell] Startup type: cold`
- ✅ `LOG  [AppShell] LifecycleManager initialized. Initial state: active`

**Why:** Confirms that the app correctly identifies a cold start and initializes all tracking

---

### Test 2: App Background Transition

**Purpose:** Verify background state detection and event emission

**Steps:**
1. With app in foreground, press home button (or swipe up)
2. Wait 2-3 seconds
3. Return to the app

**Expected Results:**

**In the App UI:**
- ✅ When backgrounded:
  - "Current State" changes to "background"
  - Event log shows "Event: appBackground"
  - Event log shows "Hook: useAppBackground fired"
  - "Last Background Timestamp" updates
- ✅ When returned:
  - "Current State" changes back to "active"
  - "Previous State" shows "background"
  - Event log shows "Event: appActive"
  - Event log shows "Hook: useAppActive fired"
  - "Background Duration" shows actual milliseconds

**In the Terminal Console Logs:**
- ✅ `LOG  [AppShell] App state changed: active -> background`
- ✅ `LOG  [AppShell] App backgrounding`
- ✅ `LOG  [AppShell] App state changed: background -> active`
- ✅ `LOG  [AppShell] App foregrounding`

**Why:** Confirms lifecycle manager correctly detects and tracks app state transitions

---

### Test 3: Multiple Background/Foreground Cycles

**Purpose:** Verify state tracking persists across multiple transitions

**Steps:**
1. Background the app (home button)
2. Return to app
3. Background again
4. Return to app
5. Repeat 2-3 more times

**Expected Results:**

**In the App UI:**
- ✅ Each transition logs corresponding events
- ✅ "Previous State" correctly reflects last state before current
- ✅ "Background Duration" updates each time
- ✅ Session ID remains the same (no new session yet)
- ✅ Event log shows all transitions in order

**In the Terminal Console Logs:**
- ✅ Multiple `LOG  [AppShell] App state changed` messages
- ✅ Alternating "App backgrounding" and "App foregrounding" messages

**Why:** Ensures the state machine handles multiple transitions without errors

---

### Test 4: Short Background Duration (No Session Change)

**Purpose:** Verify warm start detection for brief backgrounds

**Steps:**
1. Background the app
2. Wait 10-20 seconds (less than 30 minutes)
3. Return to the app

**Expected Results:**
- ✅ "Startup Type" remains "cold" (initial startup type)
- ✅ Session ID unchanged
- ✅ "Background Duration" shows ~10,000-20,000ms
- ✅ State transitions work normally

**Why:** Confirms short backgrounds don't trigger a new session or warm start classification

---

### Test 5: Long Background Duration (Simulated Warm Start)

**Purpose:** Verify warm start detection and new session creation

**Note:** This test requires modifying the constant for practical testing

**Setup:**
1. In `packages/app-shell/src/lifecycle/constants.ts`, temporarily change:
   ```typescript
   // From:
   export const MAX_BACKGROUND_DURATION_MS = 30 * 60 * 1000; // 30 minutes
   
   // To:
   export const MAX_BACKGROUND_DURATION_MS = 30000; // 30 seconds for testing
   ```
2. Restart the Metro bundler to pick up the change

**Steps:**
1. Background the app
2. Wait at least 35 seconds
3. Return to the app

**Expected Results:**

**In the App UI:**
- ✅ "Startup Type" changes to "warm"
- ✅ "Is Warm Start" shows "Yes"
- ✅ "Is Cold Start" shows "No"
- ✅ Session ID changes to a new value
- ✅ "Background Duration" shows ~35,000+ms
- ✅ Event log shows the transition

**In the Terminal Console Logs:**
- ✅ `LOG  [AppShell] Startup type: warm`
- ✅ `LOG  [AppShell] App foregrounding`
- ✅ Background duration in state updates

**Why:** Confirms warm start logic and session rotation work correctly

**Cleanup:**
- Restore `MAX_BACKGROUND_DURATION_MS` to `30 * 60 * 1000` (30 minutes) after testing

---

### Test 6: Inactive State (iOS Only)

**Purpose:** Verify iOS transient inactive state handling

**Platform:** iOS only (Android doesn't have inactive state)

**Steps:**
1. On iOS device/simulator, pull down Control Center
2. Observe the app state
3. Dismiss Control Center

**Expected Results:**

**In the App UI:**
- ✅ "Current State" briefly shows "inactive"
- ✅ Event log shows "Event: appInactive"
- ✅ Returns to "active" when Control Center dismissed
- ✅ No background duration recorded (not a background event)

**In the Terminal Console Logs:**
- ✅ `LOG  [AppShell] App state changed: active -> inactive`
- ✅ `LOG  [AppShell] App backgrounding` (inactive is treated as backgrounding)

**Why:** Confirms iOS-specific inactive state is handled correctly

---

### Test 7: Hook Reactivity

**Purpose:** Verify React hooks respond to state changes

**Steps:**
1. Observe the "Current State (Hooks)" section
2. Background and foreground the app several times
3. Watch for value updates

**Expected Results:**
- ✅ All hook values update in real-time
- ✅ `useAppState()` reflects current app state
- ✅ `useAppActive()` callback fires on each foreground
- ✅ `useAppBackground()` callback fires on each background
- ✅ Values sync with "Lifecycle Store State" section

**Why:** Confirms hooks are properly subscribed to the Zustand store

---

### Test 8: Store State Consistency

**Purpose:** Verify Zustand store maintains consistent state

**Steps:**
1. Clear the event log
2. Background the app
3. Wait 5 seconds
4. Return to app
5. Compare "Current State (Hooks)" with "Lifecycle Store State"

**Expected Results:**
- ✅ Hook values match store values exactly
- ✅ Timestamps are consistent and reasonable
- ✅ Background duration calculation is accurate
- ✅ Session ID persists across transitions

**Why:** Ensures the single source of truth (store) works correctly

---

### Test 9: Manager Cleanup

**Purpose:** Verify lifecycle manager properly cleans up

**Steps:**
1. Close the app (kill from app switcher)
2. Check console logs (if available)

**Expected Results:**
- ✅ No memory leaks or warning messages
- ✅ Event subscriptions are cleaned up
- ✅ App closes without errors

**Why:** Confirms proper resource cleanup on unmount

---

### Test 10: Event Log Functionality

**Purpose:** Verify UI correctly tracks and displays events

**Steps:**
1. Perform several background/foreground transitions
2. Observe event log filling up
3. Tap "Clear" button
4. Perform another transition

**Expected Results:**
- ✅ Events appear in chronological order (newest first)
- ✅ Each event has accurate timestamp
- ✅ Log limits to last 20 events
- ✅ "Clear" button empties the log
- ✅ New events appear after clearing

**Why:** Validates the test UI itself is working correctly

---

## Success Criteria

All 10 tests must pass for Phase 5.2 to be considered complete:

- [X] Test 1: Cold start detection works
- [X] Test 2: Background transitions work
- [X] Test 3: Multiple cycles work
- [X] Test 4: Short backgrounds work
- [X] Test 5: Warm start detection works (with modified constant)
- [X] Test 6: Inactive state works (iOS only)
- [X] Test 7: Hooks are reactive
- [X] Test 8: Store state is consistent
- [X] Test 9: Cleanup works properly
- [X] Test 10: Event log UI works

---

## Test Suite: Global Context Providers

### Test 1: StoreInitializer - Component Initialization

**Purpose:** Verify StoreInitializer mounts correctly and initializes all stores

**Steps:**
1. Launch the app fresh (kill and relaunch)
2. Observe the UI loads without errors
3. Check console logs

**Expected Results:**

**In the App UI:**
- ✅ App renders without crashes
- ✅ All store sections visible (Theme, Settings, Feature Flags, Telemetry, Lifecycle)
- ✅ Theme is applied (default light mode or system preference)
- ✅ All hook values display correctly
- ✅ Event log shows initial HomeScreen tracking message (respects telemetry state)

**In the Terminal Console Logs:**
- ✅ `LOG  Theme system initializing`
- ✅ `LOG  System color scheme: light` (or `dark` based on system)
- ✅ `LOG  All stores initialized`
- ✅ `LOG  [Analytics] Screen: HomeScreen {"test":true}` (if telemetry enabled)
- ✅ No error messages or warnings

**Why:** Confirms StoreInitializer properly wraps the app and initializes theme system. Also verifies initial telemetry tracking on app mount.

---

### Test 2: Theme Store - Mode Switching

**Purpose:** Verify theme mode changes work correctly

**Steps:**
1. Observe initial theme (should match system or be light)
2. Tap "Light" button
3. Tap "Dark" button
4. Tap "Auto" button
5. Tap "Toggle" button multiple times

**Expected Results:**

**In the App UI:**
- ✅ Light mode:
  - Theme Mode shows "light"
  - Is Dark Mode shows "No"
  - Background is light gray (#f5f5f5)
  - Cards are white (#fff)
  - Primary Color box shows blue (#007AFF)
- ✅ Dark mode:
  - Theme Mode shows "dark"
  - Is Dark Mode shows "Yes" (green text)
  - Background is dark gray (#1a1a1a)
  - Cards are darker gray (#2d2d2d)
  - Primary Color box shows lighter blue (#0A84FF)
  - Text is white
- ✅ Auto mode:
  - Theme Mode shows "auto"
  - Follows system appearance setting
- ✅ Toggle button:
  - Switches between light and dark (skips auto)
  - UI updates immediately with each press

**In the Terminal Console Logs:**
- ✅ `LOG  Theme mode set to: light` (or dark/auto)
- ✅ No errors during mode switches

**Why:** Confirms theme switching works and UI responds to theme changes

---

### Test 3: Theme Store - System Appearance Integration

**Purpose:** Verify theme responds to system appearance changes

**Platform:** iOS Simulator or Android device/emulator

**Prerequisites (CRITICAL):**
- ✅ `app.json` must have `"userInterfaceStyle": "automatic"` (not "light" or "dark")
- ✅ `expo-system-ui` package must be installed (required for Android)
- ✅ App must be rebuilt after changing `app.json` (not just refreshed)

**Steps:**
1. Ensure app is in foreground and theme mode is set to "Auto"
2. Change system appearance while app is running:
   - **iOS Simulator:** Press `Shift + Command + A` (toggles light/dark)
   - **iOS Device:** Control Center → Hold brightness slider → Toggle Dark Mode
   - **Android:** Quick Settings → Toggle Dark theme / Dark mode
3. Observe UI changes (should update immediately)

**Expected Results:**

**In the App UI:**
- ✅ Theme Mode remains "auto"
- ✅ System Appearance shows current value ("light" or "dark")
- ✅ When system dark mode is ON:
  - Is Dark Mode shows "Yes"
  - Background changes to dark (#1a1a1a)
  - Text changes to light colors
  - Primary color shows dark variant (#BB86FC)
- ✅ When system dark mode is OFF:
  - Is Dark Mode shows "No"
  - Background changes to light (#f5f5f5)
  - Text changes to dark colors
  - Primary color shows light variant (#6200EE)

**In the Terminal Console Logs:**
- ✅ `LOG  [AppShell] System color scheme: dark` (when toggling to dark)
- ✅ `LOG  [AppShell] System color scheme changed to: dark`
- ✅ `LOG  [AppShell] Auto mode: applying dark theme`
- ✅ `LOG  [AppShell] System color scheme: light` (when toggling to light)
- ✅ `LOG  [AppShell] System color scheme changed to: light`
- ✅ `LOG  [AppShell] Auto mode: applying light theme`

**In the Event Log:**
- ✅ "Theme: System appearance changed to dark"
- ✅ "Theme: System appearance changed to light"

**Why:** This test confirms the theme system responds to OS appearance changes using React Native's `useColorScheme()` hook, which is the officially recommended approach for both React Native and Expo.

**Implementation Notes:**
- Uses `useColorScheme()` hook from React Native (official recommendation)
- Hook automatically subscribes to system appearance changes
- Requires proper Expo configuration (`userInterfaceStyle: "automatic"`)
- Android requires `expo-system-ui` package
- No manual listeners or workarounds needed when configured correctly

---

### Test 4: Theme Store - Hook Reactivity

**Purpose:** Verify all theme hooks return correct values

**Steps:**
1. Set theme to "light"
2. Observe all displayed values
3. Switch to "dark"
4. Observe values update

**Expected Results:**

**In the App UI:**
- ✅ `useThemeMode()` displays correct mode value
- ✅ `useIsDarkMode()` correctly shows Yes/No
- ✅ `useTheme()` provides correct colors (visible in Primary Color box)
- ✅ All values update synchronously when theme changes
- ✅ No delay or flicker during updates

**Why:** Confirms all theme hooks are properly connected to the store

---

### Test 5: Settings Store - Individual Setting Updates

**Purpose:** Verify settings can be updated individually

**Steps:**
1. Note initial settings values
2. Tap "ES" button (Spanish)
3. Tap "FR" button (French)
4. Tap "EUR" button
5. Toggle "Notifications" switch off
6. Toggle "Notifications" switch on

**Expected Results:**

**In the App UI:**
- ✅ Language changes from "en" → "es" → "fr"
- ✅ Currency changes from "USD" → "EUR"
- ✅ Notifications switch reflects enabled/disabled state
- ✅ Event log shows each setting change with correct values
- ✅ Other settings remain unchanged when one is updated

**In the Terminal Console Logs:**
- ✅ `LOG  Updating settings` with the partial update object
- ✅ No errors during updates

**Why:** Confirms settings update correctly and independently

---

### Test 6: Settings Store - Deep Merge for Notifications

**Purpose:** Verify nested notification settings merge correctly

**Steps:**
1. Toggle notifications switch OFF
2. Check event log
3. Tap "ES" to change language
4. Verify notifications state persists

**Expected Results:**

**In the App UI:**
- ✅ Notifications toggle updates to OFF
- ✅ After language change, notifications remains OFF (not reset)
- ✅ Only the `enabled` property changes (sound, vibration, badge unchanged)

**Why:** Confirms deep merge logic for nested notification settings works

---

### Test 7: Settings Store - Hook Reactivity

**Purpose:** Verify setting hooks respond to updates

**Steps:**
1. Observe Settings Store section
2. Tap "FR" button
3. Tap "EUR" button
4. Toggle notifications switch

**Expected Results:**

**In the App UI:**
- ✅ `useLanguage()` displays "fr" immediately
- ✅ `useSettings()` shows updated currency value
- ✅ Notification switch state reflects `settings.notifications.enabled`
- ✅ All hooks update synchronously
- ✅ No stale values displayed

**Why:** Confirms all settings hooks properly subscribe to store

---

### Test 8: Feature Flags Store - Flag Value Access

**Purpose:** Verify feature flags can be read correctly

**Steps:**
1. Observe initial flag values
2. Check default states

**Expected Results:**

**In the App UI:**
- ✅ new_ui_enabled shows "false" (gray text)
- ✅ analytics_enabled shows "true"
- ✅ beta_features shows "false"
- ✅ Values match default configuration

**Why:** Confirms feature flags initialize with correct defaults

---

### Test 9: Feature Flags Store - Flag Updates

**Purpose:** Verify feature flags can be updated

**Steps:**
1. Tap "Enable New UI" button
2. Observe new_ui_enabled value change
3. Tap "Enable Beta" button
4. Observe beta_features value change
5. Check event log

**Expected Results:**

**In the App UI:**
- ✅ new_ui_enabled changes from "false" → "true" (green text)
- ✅ beta_features changes from "false" → "true"
- ✅ Event log shows "Flag: new_ui_enabled = true"
- ✅ Event log shows "Flag: beta_features = true"
- ✅ Other flags remain unchanged

**In the Terminal Console Logs:**
- ✅ `LOG  Setting feature flag: new_ui_enabled = true`
- ✅ `LOG  Setting feature flag: beta_features = true`

**Why:** Confirms feature flags update correctly with dynamic keys

---

### Test 10: Feature Flags Store - Boolean Coercion

**Purpose:** Verify `useFeatureFlag` returns boolean correctly

**Steps:**
1. Observe new_ui_enabled initial value (false)
2. Tap "Enable New UI"
3. Verify value becomes true

**Expected Results:**

**In the App UI:**
- ✅ `useFeatureFlag('new_ui_enabled')` returns false initially
- ✅ After update, returns true (shown in green)
- ✅ Text color changes from gray to green (visual boolean coercion)

**Why:** Confirms `useFeatureFlag` hook performs boolean coercion correctly

---

### Test 11: Feature Flags Store - Hook Reactivity

**Purpose:** Verify feature flag hooks respond to changes

**Steps:**
1. Tap "Enable New UI" multiple times
2. Tap "Enable Beta"
3. Observe immediate UI updates

**Expected Results:**

**In the App UI:**
- ✅ `useFeatureFlag()` updates immediately
- ✅ `useFeatureFlags()` reflects all current flag values
- ✅ No delay between button press and display update
- ✅ Event log tracks all changes

**Why:** Confirms feature flag hooks properly subscribe to store

---

### Test 12: Telemetry Store - Enable/Disable Toggle

**Purpose:** Verify telemetry can be enabled/disabled

**Steps:**
1. Note initial telemetry state (enabled by default)
2. Toggle switch OFF
3. Toggle switch ON
4. Check event log

**Expected Results:**

**In the App UI:**
- ✅ Switch reflects enabled state
- ✅ Event log shows "Telemetry: disabled" when turned off
- ✅ Event log shows "Telemetry: enabled" when turned on

**In the Terminal Console Logs:**
- ✅ `LOG  Setting telemetry: false` (when disabled)
- ✅ `LOG  [Analytics] Telemetry disabled` (from manager)
- ✅ `LOG  Setting telemetry: true` (when enabled)
- ✅ `LOG  [Analytics] Telemetry enabled` (from manager)

**Why:** Confirms telemetry store and manager stay synchronized

---

### Test 13: Telemetry Store - Event Tracking

**Purpose:** Verify telemetry events are logged correctly

**Steps:**
1. Ensure telemetry is enabled
2. Tap "Track Event" button
3. Tap "Track Screen" button
4. Check console logs
5. Toggle telemetry OFF
6. Tap "Track Event" again
7. Check console logs

**Expected Results:**

**In the App UI:**
- ✅ Event log shows "Telemetry: Tracked button_click event" (when enabled)
- ✅ Event log shows "Telemetry: Tracked TestScreen view" (when enabled)
- ✅ When disabled, event log shows "Telemetry: Button pressed (tracking disabled)"
- ✅ When disabled, event log shows "Telemetry: Screen pressed (tracking disabled)"

**In the Terminal Console Logs:**
- ✅ When enabled:
  - `LOG  [Analytics] Track: button_click {"button":"test_button"}`
  - `LOG  [Analytics] Screen: TestScreen {"from":"integration_test"}`
- ✅ When disabled:
  - No `[Analytics]` logs appear (events are blocked at manager level)
  - Button presses still update UI event log with "(tracking disabled)" message

**Why:** Confirms telemetry tracking works and respects enabled state. Event log provides clear feedback about whether tracking actually occurred.

---

### Test 14: Telemetry Store - Hook Functionality

**Purpose:** Verify telemetry hooks work correctly and reflect accurate state

**Steps:**
1. Ensure telemetry is enabled
2. Tap "Track Event" button
3. Check console logs and event log
4. Toggle telemetry OFF
5. Tap "Track Event" button again
6. Compare console logs and event log

**Expected Results:**

**In the App UI:**
- ✅ When enabled:
  - Event log shows "Telemetry: Tracked button_click event"
- ✅ When disabled:
  - Event log shows "Telemetry: Button pressed (tracking disabled)"
  - Switch correctly shows OFF state
- ✅ `useTelemetry()` returns correct enabled state
- ✅ `useTrackEvent()` function is always callable (no errors)
- ✅ `useTrackScreen()` function is always callable

**In the Terminal Console Logs:**
- ✅ When enabled: `LOG  [Analytics] Track: button_click {"button":"test_button"}`
- ✅ When disabled: No `[Analytics]` logs appear
- ✅ No errors when calling hooks in disabled state
- ✅ Hooks gracefully no-op when disabled (checked via manager.isEnabled())

**Why:** Confirms telemetry hooks use the correct pattern (checking manager state directly) and provide accurate feedback to users about whether tracking occurred.

---

### Test 15: Store Integration - Multiple Store Updates

**Purpose:** Verify stores work independently and don't interfere

**Steps:**
1. Change theme to dark
2. Change language to "es"
3. Enable new_ui_enabled flag
4. Toggle telemetry OFF
5. Check all stores

**Expected Results:**

**In the App UI:**
- ✅ Theme is dark
- ✅ Language is "es"
- ✅ new_ui_enabled is true
- ✅ Telemetry is disabled
- ✅ All changes persist simultaneously
- ✅ No store resets when another is updated
- ✅ Event log shows all changes in order

**Why:** Confirms stores are independent and changes don't affect each other

---

### Test 16: Store Integration - No Unnecessary Re-renders

**Purpose:** Verify hooks don't cause excessive re-renders

**Steps:**
1. Observe app performance during interactions
2. Rapidly tap theme toggle button 10 times
3. Rapidly change settings multiple times
4. Check for any lag or freezing

**Expected Results:**

**In the App UI:**
- ✅ UI remains responsive during rapid updates
- ✅ No visible lag or stuttering
- ✅ Animations smooth (if any)
- ✅ All values update correctly despite rapid changes

**Why:** Confirms granular selectors and `useShallow` prevent unnecessary re-renders

---

### Test 17: StoreInitializer - Children Access Stores

**Purpose:** Verify nested components can access all stores

**Steps:**
1. Observe app structure (AppContent is wrapped by StoreInitializer)
2. Verify all hooks work in AppContent
3. Check console for any context errors

**Expected Results:**

**In the App UI:**
- ✅ All stores accessible in AppContent component
- ✅ No "hook called outside provider" errors
- ✅ No "context is undefined" errors

**In the Terminal Console Logs:**
- ✅ No warnings about missing providers
- ✅ All stores initialized before component render

**Why:** Confirms StoreInitializer properly wraps app and stores are globally accessible

---

### Test 18: Store Consistency - State Persistence

**Purpose:** Verify store state persists across app backgrounding

**Steps:**
1. Set theme to dark
2. Change language to "fr"
3. Enable new_ui_enabled flag
4. Background the app (home button)
5. Wait 5 seconds
6. Return to app
7. Verify all store values

**Expected Results:**

**In the App UI:**
- ✅ Theme remains dark
- ✅ Language remains "fr"
- ✅ new_ui_enabled remains true
- ✅ All store values unchanged after backgrounding
- ✅ Lifecycle state updates (but other stores persist)

**Why:** Confirms in-memory store state persists during app lifecycle

**Note:** This tests in-memory persistence. AsyncStorage persistence is a future feature.

---

### Test 19: Error Handling - Invalid Updates

**Purpose:** Verify stores handle invalid updates gracefully

**Steps:**
1. Try rapid-fire updates to all stores
2. Toggle switches very quickly
3. Press multiple buttons simultaneously
4. Check for crashes or errors

**Expected Results:**

**In the App UI:**
- ✅ No app crashes
- ✅ All stores handle rapid updates
- ✅ Final state is consistent with last update
- ✅ UI doesn't freeze or become unresponsive

**In the Terminal Console Logs:**
- ✅ No error messages
- ✅ All updates logged (may be many)

**Why:** Confirms stores are resilient to edge cases

---

### Test 20: Console Logs - Analytics Visibility

**Purpose:** Verify all telemetry events are logged (dev mode)

**Steps:**
1. Ensure telemetry is enabled
2. Perform various actions (change theme, update settings, enable flags)
3. Review console logs for analytics events

**Expected Results:**

**In the Terminal Console Logs:**
- ✅ Initial screen track: `LOG  [Analytics] Screen: HomeScreen {"test":true}`
- ✅ All manual tracking events visible with properties
- ✅ Format: `LOG  [Analytics] Track: event_name {properties}`
- ✅ Properties logged as JSON objects

**Why:** Confirms telemetry logging interface works correctly (actual service integration is future work)

---

## Success Criteria: Global Context Providers

All 20 tests must pass to be considered complete:

### Theme Store (4 tests)
- [X] Test 2: Theme mode switching
- [X] Test 3: System appearance integration
- [X] Test 4: Theme hook reactivity
- [X] Test 16: No unnecessary re-renders

### Settings Store (3 tests)
- [X] Test 5: Individual setting updates
- [X] Test 6: Deep merge for notifications
- [X] Test 7: Settings hook reactivity

### Feature Flags Store (3 tests)
- [X] Test 8: Flag value access
- [X] Test 9: Flag updates
- [X] Test 10: Boolean coercion
- [X] Test 11: Feature flag hook reactivity

### Telemetry Store (4 tests)
- [X] Test 12: Enable/disable toggle
- [X] Test 13: Event tracking
- [X] Test 14: Telemetry hook functionality
- [X] Test 20: Analytics visibility in logs

### Integration Tests (6 tests)
- [X] Test 1: StoreInitializer initialization
- [X] Test 15: Multiple store updates
- [X] Test 16: No unnecessary re-renders
- [X] Test 17: Children access stores
- [X] Test 18: State persistence across backgrounding
- [X] Test 19: Error handling

---

## Test Suite: Navigation Architecture & Deep Linking

### Prerequisites
- ✅ React Navigation 7.x packages installed (`@react-navigation/native`, `@react-navigation/native-stack`)
- ✅ Navigation dependencies installed (`react-native-screens`, `react-native-safe-area-context`)
- ✅ Deep link URL scheme configured: `factorytest://`
- ✅ Universal link domain configured: `https://factory-test.app`

### Test 1: NavigationContainer Integration

**Purpose:** Verify NavigationContainer wraps app and initializes correctly

**Steps:**
1. Kill and relaunch the app
2. Observe the Navigation Testing section
3. Check console logs

**Expected Results:**

**In the App UI:**
- ✅ Navigation Testing card appears at the top
- ✅ Current Route shows "Home"
- ✅ Route Name (Hook) shows "Home"
- ✅ No route params displayed initially
- ✅ Navigation buttons are visible and enabled

**In the Terminal Console Logs:**
- ✅ `LOG  [Navigation] Ready`
- ✅ `LOG  Navigation ready. Initial route: Home`
- ✅ No navigation-related errors

**Why:** Confirms NavigationContainer properly wraps the app with linking configuration

---

### Test 2: Basic Stack Navigation - Profile Screen

**Purpose:** Verify basic stack navigation with typed params works

**Steps:**
1. From Home screen, tap "Profile" button
2. Observe the screen change
3. Observe the Navigation Testing section (if visible)
4. Check event log
5. Tap device back button or swipe back (iOS)

**Expected Results:**

**In the App UI:**
- ✅ Screen transitions to Profile Screen
- ✅ Profile Screen displays "User ID: 123"
- ✅ Screen shows type-safe routing message
- ✅ Event log shows "Navigate: Profile (userId: 123)"
- ✅ Back navigation returns to Home screen

**In the Terminal Console Logs:**
- ✅ `LOG  Navigating to Profile {"userId":"123"}`
- ✅ `LOG  Navigation: Home → Profile`

**Why:** Confirms basic navigation and type-safe route parameters work correctly

---

### Test 3: Navigation with Optional Parameters

**Purpose:** Verify optional route parameters are handled correctly

**Steps:**
1. From Home screen, tap "Settings" button
2. Observe the Settings Screen
3. Note the tab parameter
4. Navigate back

**Expected Results:**

**In the App UI:**
- ✅ Settings Screen displays
- ✅ Tab shows "notifications"
- ✅ Screen displays optional parameter message
- ✅ Event log shows "Navigate: Settings (tab: notifications)"

**Why:** Confirms optional route parameters work with type safety

---

### Test 4: Multiple Navigation Actions

**Purpose:** Verify navigation stack is maintained correctly

**Steps:**
1. Tap "Profile" button
2. From Profile screen, scroll down and tap "Settings" button (if accessible)
3. Tap "Details" button
4. Use back button multiple times
5. Observe stack behavior

**Expected Results:**

**In the App UI:**
- ✅ Each navigation adds to the stack
- ✅ Back button correctly pops from stack
- ✅ Current Route updates with each navigation
- ✅ Route params reflect current screen params
- ✅ Event log shows all navigation actions in order

**Why:** Confirms navigation stack is properly maintained

---

### Test 5: Imperative Navigation (Outside React Components)

**Purpose:** Verify imperative navigation API works from outside React components

**Steps:**
1. From Home screen, tap "Navigate Imperatively" button (orange/red)
2. Observe the navigation
3. Check event log
4. Navigate back

**Expected Results:**

**In the App UI:**
- ✅ Navigates to Profile Screen with userId "999"
- ✅ Profile Screen displays "User ID: 999"
- ✅ Event log shows "Imperative Navigate: Profile (userId: 999)"

**In the Terminal Console Logs:**
- ✅ `LOG  Navigating to Profile {"userId":"999"}`

**Why:** Confirms `navigate()` function works imperatively (useful for push notifications, timers, etc.)

---

### Test 6: Type-Safe Navigation Hooks

**Purpose:** Verify navigation hooks provide type-safe access

**Steps:**
1. Navigate to any screen with parameters
2. Observe the Current Route Info section
3. Compare Route Name (Hook) with Current Route
4. Verify params are displayed correctly

**Expected Results:**

**In the App UI:**
- ✅ `getCurrentRouteName()` matches `useTypedRoute()` name
- ✅ Route params displayed match the navigation action
- ✅ Params are properly typed (no "any" or "unknown")
- ✅ Values update immediately with navigation

**Why:** Confirms typed hooks (`useTypedNavigation`, `useTypedRoute`) work correctly

---

### Test 7: Deep Link - Custom Scheme (Home)

**Purpose:** Verify custom URL scheme deep links work

**Platform:** iOS Simulator or Android Emulator/Device

**Steps:**
1. Open terminal
2. Run the appropriate command:
   - **iOS Simulator:** `xcrun simctl openurl booted "factorytest://home"`
   - **Android Device:** `adb shell am start -W -a android.intent.action.VIEW -d "factorytest://home" com.ridwanhamid501.factorytestapp`
3. Observe the app

**Expected Results:**

**In the App UI:**
- ✅ App opens or comes to foreground
- ✅ Current Route shows "Home"
- ✅ Recent Deep Links shows "factorytest://home (path: /)"
- ✅ Event log shows navigation event

**Why:** Confirms custom URL scheme deep linking works

---

### Test 8: Deep Link - Custom Scheme with Path Parameter

**Purpose:** Verify deep links parse path parameters correctly

**Steps:**
1. Open terminal
2. Run the appropriate command:
   - **iOS:** `xcrun simctl openurl booted "factorytest://profile/user123"`
   - **Android:** `adb shell am start -W -a android.intent.action.VIEW -d "factorytest://profile/user123" com.ridwanhamid501.factorytestapp`
3. Observe the app

**Expected Results:**

**In the App UI:**
- ✅ App navigates to Profile Screen
- ✅ Profile Screen displays "User ID: user123"
- ✅ Recent Deep Links shows "factorytest://profile/user123 (path: /profile/user123)"
- ✅ Current Route shows "Profile"
- ✅ Route Params shows {"userId": "user123"}

**Why:** Confirms deep links correctly parse and navigate with path parameters

---

### Test 9: Deep Link - Query Parameters

**Purpose:** Verify deep links parse query parameters correctly

**Steps:**
1. Open terminal
2. Run the appropriate command:
   - **iOS:** `xcrun simctl openurl booted "factorytest://settings?tab=notifications"`
   - **Android:** `adb shell am start -W -a android.intent.action.VIEW -d "factorytest://settings?tab=notifications" com.ridwanhamid501.factorytestapp`
3. Observe the app

**Expected Results:**

**In the App UI:**
- ✅ App navigates to Settings Screen
- ✅ Settings Screen displays "Tab: notifications"
- ✅ Recent Deep Links shows "factorytest://settings?tab=notifications (path: /settings)"
- ✅ Route Params shows {"tab": "notifications"}

**Why:** Confirms query parameters are correctly parsed from deep links

---

### Test 10: Deep Link - Additional Test Cases

**Purpose:** Verify various deep link scenarios

**Steps:**
1. Test with details screen:
   - **iOS:** `xcrun simctl openurl booted "factorytest://details/42"`
   - **Android:** `adb shell am start -W -a android.intent.action.VIEW -d "factorytest://details/42" com.ridwanhamid501.factorytestapp`

2. Test invalid route (should fallback to home):
   - **iOS:** `xcrun simctl openurl booted "factorytest://invalid"`
   - **Android:** `adb shell am start -W -a android.intent.action.VIEW -d "factorytest://invalid" com.ridwanhamid501.factorytestapp`

3. Test while app is backgrounded:
   - Background the app
   - Send a deep link
   - App should come to foreground and navigate

**Expected Results:**

**For Details Link:**
- ✅ App navigates to Details Screen
- ✅ Details Screen displays "Detail ID: 42"
- ✅ Recent Deep Links shows the URL
- ✅ Current Route shows "Details"

**For Invalid Link:**
- ✅ App handles gracefully (likely stays on current screen or goes to home)
- ✅ Recent Deep Links shows the URL
- ✅ No crash occurs

**For Backgrounded App:**
- ✅ App comes to foreground
- ✅ Navigation occurs
- ✅ Deep link is logged

**Why:** Ensures robust deep link handling across various scenarios

---

### Test 11: Cold Start with Deep Link

**Purpose:** Verify app correctly handles deep links when launched from killed state

**Steps:**
1. Kill the app completely (swipe away from app switcher)
2. Open it via deep link using terminal command:
   - **iOS:** `xcrun simctl openurl booted "factorytest://profile/coldstart"`
   - **Android:** `adb shell am start -W -a android.intent.action.VIEW -d "factorytest://profile/coldstart" com.ridwanhamid501.factorytestapp`
3. Wait for app to fully launch
4. Observe the Navigation Testing section

**Expected Results:**

**In the App UI:**
- ✅ App launches and navigates to Profile Screen
- ✅ Profile Screen displays "User ID: coldstart"
- ✅ Recent Deep Links shows "factorytest://profile/coldstart"
- ✅ Current Route shows "Profile"

**Why:** Confirms React Navigation's `linking` configuration correctly handles deep links on cold start

---

### Test 12: Deep Link While App Running

**Purpose:** Verify deep links work while app is in foreground

**Steps:**
1. Launch app normally (tap icon)
2. Wait for app to be on Home screen
3. While app is running in foreground, send a deep link via terminal:
   - **iOS:** `xcrun simctl openurl booted "factorytest://settings?tab=privacy"`
   - **Android:** `adb shell am start -W -a android.intent.action.VIEW -d "factorytest://settings?tab=privacy" com.ridwanhamid501.factorytestapp`
4. Observe the behavior

**Expected Results:**

**In the App UI:**
- ✅ App immediately responds to the deep link
- ✅ Navigates to Settings screen
- ✅ Settings Screen displays "Tab: privacy"
- ✅ Recent Deep Links shows "factorytest://settings?tab=privacy"
- ✅ Event log shows navigation occurred

**Why:** Confirms React Navigation's `linking` prop handles deep links received while app is running

---

### Test 13: Navigation State Tracking

**Purpose:** Verify navigation state changes are logged correctly

**Steps:**
1. Clear the event log
2. Navigate to Profile screen
3. Navigate to Settings screen
4. Navigate back twice
5. Review event log

**Expected Results:**

**In the App UI:**
- ✅ Each navigation action appears in event log
- ✅ Events show in chronological order
- ✅ Event messages are clear and descriptive
- ✅ Current Route value updates with each navigation

**In the Terminal Console Logs:**
- ✅ `LOG  Navigation: Home → Profile`
- ✅ `LOG  Navigation: Profile → Settings`
- ✅ `LOG  Navigation: Settings → Profile`
- ✅ `LOG  Navigation: Profile → Home`

**Why:** Confirms navigation state tracking works correctly

---

### Test 14: Go Back Function

**Purpose:** Verify `goBack()` function works correctly

**Steps:**
1. From Home screen, navigate to Profile
2. Tap "← Go Back" button
3. Observe behavior
4. Tap "← Go Back" again (now on Home screen)

**Expected Results:**

**In the App UI:**
- ✅ First tap: Returns to Home screen
- ✅ Event log shows "Navigate: Go Back"
- ✅ Second tap: No navigation occurs (already at root)
- ✅ Event log shows warning in console (not crash)

**In the Terminal Console Logs:**
- ✅ First tap: `LOG  Navigating back`
- ✅ Second tap: `LOG  Cannot go back - either not ready or no history`

**Why:** Confirms `goBack()` handles edge cases correctly

---

### Test 15: Universal Links (HTTPS)

**Purpose:** Verify HTTPS universal links work

**Note:** Universal links require proper domain configuration and may not work in development

**Steps:**
1. Open terminal
2. Run the appropriate command:
   - **iOS:** `xcrun simctl openurl booted "https://factory-test.app/profile/456"`
   - **Android:** `adb shell am start -W -a android.intent.action.VIEW -d "https://factory-test.app/profile/456" com.ridwanhamid501.factorytestapp`
3. Observe the app

**Expected Results:**

**In the App UI (if universal links are configured):**
- ✅ App opens to Profile screen
- ✅ Profile Screen displays "User ID: 456"
- ✅ Recent Deep Links shows "https://factory-test.app/profile/456"

**Alternative (if not configured):**
- ⚠️ Browser opens instead of app (expected for dev environment)
- ⚠️ Universal links require proper app-site-association configuration
- ⚠️ For Android, you need to add intent filters for HTTPS in AndroidManifest.xml
- ⚠️ For iOS, you need to add associated domains entitlement

**Why:** Confirms universal links configuration is present (full setup requires production environment with domain verification)

---

### Test 16: Navigation Integration with Theme

**Purpose:** Verify navigation works correctly with theme changes

**Steps:**
1. Navigate to Profile screen
2. Toggle theme to dark mode
3. Observe screen appearance
4. Navigate back to Home
5. Toggle theme to light mode

**Expected Results:**

**In the App UI:**
- ✅ Profile screen renders with current theme
- ✅ Theme changes apply immediately to navigated screens
- ✅ No layout shifts or visual glitches during theme change
- ✅ Navigation state persists across theme changes

**Why:** Confirms navigation integrates properly with global theme state

---

### Test 17: Navigation Integration with Lifecycle

**Purpose:** Verify navigation state persists across app backgrounding

**Steps:**
1. Navigate to Profile screen
2. Background the app (home button)
3. Wait 5 seconds
4. Return to app
5. Check current screen

**Expected Results:**

**In the App UI:**
- ✅ App returns to Profile screen (not Home)
- ✅ Route params are preserved
- ✅ Navigation stack is intact
- ✅ Lifecycle events logged but navigation state preserved

**Why:** Confirms navigation state persists in memory across lifecycle events

---

### Test 18: Deep Link Parsing Utilities

**Purpose:** Verify deep link parsing utilities work correctly

**Note:** This is tested indirectly through the navigation feature

**Steps:**
1. Send various deep links to the app
2. Observe event log details
3. Verify scheme, path, and query params are parsed

**Expected Results:**

**In the App UI:**
- ✅ Event log shows parsed components:
  - "Scheme: factorytest"
  - "Path: /profile/123" or similar
  - "Query: {...}" when present
- ✅ All URL components are correctly extracted
- ✅ `parseDeepLink()` handles various URL formats

**Why:** Confirms utility functions (`parseDeepLink`, `isValidAppURL`, `extractScreenFromDeepLink`) work correctly

---

### Test 19: Error Handling - Invalid Deep Links

**Purpose:** Verify app handles malformed deep links gracefully

**Steps:**
1. Send an invalid deep link via terminal:
   - **iOS:** `xcrun simctl openurl booted "factorytest://unknown-route"`
   - **Android:** `adb shell am start -W -a android.intent.action.VIEW -d "factorytest://unknown-route" com.ridwanhamid501.factorytestapp`
2. Observe app behavior

**Expected Results:**

**In the App UI:**
- ✅ App doesn't crash
- ✅ Stays on current screen or goes to Home
- ✅ Event log may show the deep link attempt
- ✅ No undefined behavior

**In the Terminal Console Logs:**
- ✅ Warning logged about unhandled route (not error)
- ✅ No crash stacktrace

**Why:** Confirms graceful handling of invalid deep links

---

### Test 20: Navigation Performance

**Purpose:** Verify navigation transitions are smooth and performant

**Steps:**
1. Rapidly navigate between screens multiple times
2. Observe animation smoothness
3. Check for any lag or stuttering
4. Monitor memory usage (if possible)

**Expected Results:**

**In the App UI:**
- ✅ Transitions are smooth (60fps on device)
- ✅ No visible lag or frame drops
- ✅ No memory warnings
- ✅ App remains responsive during rapid navigation

**Why:** Confirms React Navigation 7.x native stack provides good performance

---

## Success Criteria: Navigation Architecture & Deep Linking

All 20 tests must pass to be considered complete:

### Basic Navigation (6 tests)
- [X] Test 1: NavigationContainer integration
- [X] Test 2: Basic stack navigation
- [X] Test 3: Optional parameters
- [X] Test 4: Multiple navigation actions
- [X] Test 5: Imperative navigation
- [X] Test 6: Type-safe hooks

### Deep Linking (9 tests)
- [X] Test 7: Custom scheme (home)
- [X] Test 8: Path parameters
- [X] Test 9: Query parameters
- [X] Test 10: UI button testing
- [X] Test 11: Initial URL detection
- [X] Test 12: Deep link while running
- [X] Test 13: Navigation state tracking
- [X] Test 15: Universal links
- [X] Test 18: Deep link parsing utilities

### Integration & Edge Cases (5 tests)
- [X] Test 14: Go back function
- [X] Test 16: Theme integration
- [X] Test 17: Lifecycle integration
- [X] Test 19: Error handling
- [X] Test 20: Performance

## Test Suite: Global Error Boundaries & Fallback Screens

### Prerequisites
- ✅ `react-error-boundary` package installed (v4.1.2+)
- ✅ `@sentry/react-native` available as optional peer dependency
- ✅ ErrorBoundary wraps app in `App.tsx`
- ✅ Error testing UI implemented in `Errors.tsx`
- ✅ `showDetailedError={__DEV__}` configured in ErrorBoundary

### Test 1: ErrorBoundary Initialization

**Purpose:** Verify ErrorBoundary wraps app correctly and doesn't interfere with normal rendering

**Steps:**
1. Kill and relaunch the app
2. Observe app loads without errors
3. Check console logs

**Expected Results:**

**In the App UI:**
- ✅ App renders normally
- ✅ All features accessible
- ✅ Error Boundaries section visible
- ✅ Three test buttons displayed:
  - "Throw Render Error"
  - "Throw Async Error"
  - "Throw Event Error"
- ✅ Expected Behavior info box visible

**In the Terminal Console Logs:**
- ✅ No error boundary warnings
- ✅ App initializes normally
- ✅ `[App] Error caught by boundary:` does NOT appear (no errors yet)

**Why:** Confirms ErrorBoundary is properly configured and doesn't impact normal operation

---

### Test 2: Render Error Catching (Development Mode)

**Purpose:** Verify ErrorBoundary catches rendering errors and displays development fallback UI

**Steps:**
1. Ensure app is running in development mode (`__DEV__` is true)
2. Scroll to Error Boundaries section
3. Tap "Throw Render Error" button
4. Observe the fallback UI

**Expected Results:**

**In the App UI:**
- ✅ Screen changes to show ErrorFallback component
- ✅ Displays "Something went wrong" title
- ✅ Shows user-friendly message: "We're sorry, but something unexpected happened..."
- ✅ "Try Again" button is visible
- ✅ **Development mode:** Error Details section visible showing:
  - Error message: "💥 Intentional rendering error for testing"
  - Stack Trace with component stack
- ✅ Error details are scrollable (if long)

**In the Terminal Console Logs:**
- ✅ `[ErrorBoundary] Rendering error caught:` with error details
- ✅ `[App] Error caught by boundary: 💥 Intentional rendering error for testing`
- ✅ Component stack visible in error log
- ✅ React error overlay may appear briefly (normal in dev mode)

**Why:** Confirms ErrorBoundary catches rendering errors and shows detailed info in development

---

### Test 3: Error Recovery - Try Again Button

**Purpose:** Verify error boundary reset functionality works correctly

**Steps:**
1. After triggering render error (Test 2), observe "Try Again" button
2. Tap "Try Again" button
3. Observe app behavior

**Expected Results:**

**In the App UI:**
- ✅ App returns to normal state
- ✅ ErrorFallback UI disappears
- ✅ Original content re-renders
- ✅ Error Boundaries section visible again
- ✅ "Throw Render Error" button is back
- ✅ App fully functional after recovery

**In the Terminal Console Logs:**
- ✅ `[ErrorBoundary] Error boundary reset`
- ✅ `[App] Error boundary reset`
- ✅ No new errors logged

**Why:** Confirms error boundary reset mechanism allows app recovery

---

### Test 4: Production Mode Error Display

**Purpose:** Verify production mode hides technical error details

**Note:** This test requires building a production/release build

**Setup:**
```bash
# iOS
expo build:ios --release-channel production

# Android  
expo build:android --release-channel production
```

**Steps:**
1. Install production build on device
2. Navigate to Error Boundaries section
3. Tap "Throw Render Error"
4. Observe fallback UI

**Expected Results:**

**In the App UI:**
- ✅ Shows "Something went wrong" title
- ✅ Shows user-friendly message
- ✅ "Try Again" button visible
- ✅ **Production mode:** Error Details section is HIDDEN
- ✅ No stack trace visible
- ✅ No technical error message visible
- ✅ Clean, professional error screen

**Why:** Confirms production builds hide technical details from end users

---

### Test 5: Async Error Handling with useErrorHandler

**Purpose:** Verify async errors can be manually sent to error boundary via useErrorHandler hook

**Steps:**
1. Ensure app is in normal state (no current errors)
2. Scroll to Error Boundaries section, Test 2
3. Tap "Throw Async Error (Count: 0)" button
4. Wait 100ms for timeout to execute
5. Observe the behavior

**Expected Results:**

**In the App UI:**
- ✅ Button counter increments: "Count: 1"
- ✅ Event log shows: "Errors: Triggering async error via useErrorHandler"
- ✅ ErrorFallback UI appears
- ✅ Shows "Something went wrong" message
- ✅ "Try Again" button visible
- ✅ Development mode: Error Details shows:
  - "Async error #1 - Network timeout"
  - Component stack (from useErrorHandler call site)

**In the Terminal Console Logs:**
- ✅ `[useErrorHandler] Manually triggered error: { message: "Async error #1...", context: {...} }`
- ✅ Context logged with `type: 'network'`, `operation: 'fetchUserData'`, `timestamp`
- ✅ `[ErrorBoundary] Rendering error caught:` (triggered by showBoundary)
- ✅ `[App] Error caught by boundary:`

**Why:** Confirms useErrorHandler hook correctly triggers error boundary for async errors (Promise rejections, setTimeout, etc.)

---

### Test 6: Event Handler Error with useErrorHandler

**Purpose:** Verify event handler errors can be manually sent to error boundary

**Steps:**
1. Reset from any previous error (tap "Try Again" if needed)
2. Scroll to Error Boundaries section, Test 3
3. Tap "Throw Event Error" button
4. Observe the behavior

**Expected Results:**

**In the App UI:**
- ✅ Event log shows: "Errors: Triggering event handler error"
- ✅ ErrorFallback UI appears immediately
- ✅ Shows error message
- ✅ "Try Again" button visible
- ✅ Development mode: Error Details shows:
  - "Event handler error - Invalid form data"
  - Context information

**In the Terminal Console Logs:**
- ✅ `[useErrorHandler] Manually triggered error:` with context
- ✅ Context shows `type: 'validation'`, `component: 'ErrorTesting'`, `action: 'buttonPress'`
- ✅ `[ErrorBoundary] Rendering error caught:`

**Why:** Confirms useErrorHandler works for event handler errors (button clicks, form submissions)

---

### Test 7: Multiple Error Recoveries

**Purpose:** Verify error boundary handles multiple error/recovery cycles

**Steps:**
1. Tap "Throw Render Error"
2. Tap "Try Again"
3. Tap "Throw Async Error"
4. Tap "Try Again"
5. Tap "Throw Event Error"
6. Tap "Try Again"
7. Tap "Throw Async Error" again (notice counter)
8. Tap "Try Again"

**Expected Results:**

**In the App UI:**
- ✅ Each error shows fallback UI
- ✅ Each "Try Again" recovers successfully
- ✅ App remains stable through multiple cycles
- ✅ Async error counter increments: 0 → 1 → 2
- ✅ No degradation in performance
- ✅ All features work after recovery

**In the Terminal Console Logs:**
- ✅ Each error logged correctly
- ✅ Each reset logged: `[ErrorBoundary] Error boundary reset`
- ✅ No memory leak warnings
- ✅ Error count in async errors increments correctly

**Why:** Confirms error boundary is resilient and can handle multiple error/recovery cycles

---

### Test 8: Error Context Logging

**Purpose:** Verify error context is properly logged for debugging

**Steps:**
1. Tap "Throw Async Error" button
2. Check console logs carefully
3. Reset and tap "Throw Event Error"
4. Check console logs again

**Expected Results:**

**In the Terminal Console Logs:**

**For Async Error:**
- ✅ `[useErrorHandler] Manually triggered error:` followed by:
```
{
  message: "Async error #N - Network timeout",
  context: {
    type: 'network',
    operation: 'fetchUserData',
    timestamp: <number>
  }
}
```

**For Event Error:**
- ✅ `[useErrorHandler] Manually triggered error:` followed by:
```
{
  message: "Event handler error - Invalid form data",
  context: {
    type: 'validation',
    component: 'ErrorTesting',
    action: 'buttonPress'
  }
}
```

**Why:** Confirms error context is properly passed and logged, aiding debugging

---

### Test 9: Custom onError Callback

**Purpose:** Verify custom onError callback in ErrorBoundary receives error info

**Setup:** Check `App.tsx` has:
```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('[App] Error caught by boundary:', error.message);
  }}
>
```

**Steps:**
1. Trigger any error (render, async, or event)
2. Check console logs

**Expected Results:**

**In the Terminal Console Logs:**
- ✅ `[App] Error caught by boundary: <error message>` appears
- ✅ Custom callback executes for every error
- ✅ Both error and errorInfo parameters are passed correctly

**Why:** Confirms custom onError callback works for app-specific error handling (e.g., analytics)

---

### Test 10: Custom onReset Callback

**Purpose:** Verify custom onReset callback executes on recovery

**Setup:** Check `App.tsx` has:
```typescript
<ErrorBoundary
  onReset={() => {
    console.log('[App] Error boundary reset');
  }}
>
```

**Steps:**
1. Trigger any error
2. Tap "Try Again" button
3. Check console logs

**Expected Results:**

**In the Terminal Console Logs:**
- ✅ `[ErrorBoundary] Error boundary reset` (from ErrorBoundary)
- ✅ `[App] Error boundary reset` (from custom callback)
- ✅ Custom callback executes before component re-renders

**Why:** Confirms custom onReset callback works for cleanup or state reset logic

---

### Test 11: Error Boundary with Sentry Integration (Optional)

**Purpose:** Verify Sentry integration works when configured

**Note:** This test requires Sentry DSN configuration

**Setup:**
```typescript
// In App.tsx
<ErrorBoundary
  sentry={{
    dsn: 'YOUR_SENTRY_DSN',
    environment: __DEV__ ? 'development' : 'production',
    enabled: !__DEV__, // Only in production
  }}
  showDetailedError={__DEV__}
>
```

**Steps:**
1. Configure Sentry DSN in App.tsx
2. Build production version
3. Trigger errors on production build
4. Check Sentry dashboard

**Expected Results:**

**In Sentry Dashboard:**
- ✅ Errors appear in Sentry Issues
- ✅ Error message matches triggered error
- ✅ Component stack is captured
- ✅ Environment is set correctly
- ✅ Each error creates a separate Sentry event

**In the Terminal Console Logs (Production):**
- ✅ `[Sentry] Initialized successfully`
- ✅ No "Sentry disabled via config" (when enabled)

**Why:** Confirms config-based Sentry integration works for production error tracking

---

### Test 12: Error Boundaries with Theme Changes

**Purpose:** Verify error fallback UI respects current theme

**Steps:**
1. Set theme to light mode
2. Trigger render error
3. Observe ErrorFallback colors
4. Tap "Try Again"
5. Set theme to dark mode
6. Trigger error again
7. Observe ErrorFallback colors

**Expected Results:**

**In the App UI:**
- ✅ Light mode: ErrorFallback has light background, dark text
- ✅ Dark mode: ErrorFallback has dark background, light text
- ✅ "Try Again" button styled appropriately for theme
- ✅ Error details (dev mode) readable in both themes

**Why:** Confirms ErrorFallback component respects global theme (though it has its own hardcoded styles currently)

**Note:** ErrorFallback currently has hardcoded light theme colors. Full theme integration is a future enhancement.

---

### Test 13: Error Boundary Doesn't Catch Non-React Errors

**Purpose:** Verify error boundary limitations are understood

**Important:** Error boundaries ONLY catch:
- Rendering errors (in component render phase)
- Lifecycle method errors (componentDidMount, etc.)
- Constructor errors

Error boundaries DO NOT catch:
- Event handler errors (button clicks) - must use useErrorHandler
- Async code errors (setTimeout, promises) - must use useErrorHandler  
- Server-side rendering errors
- Errors in error boundary itself

**Steps:**
1. Review Expected Behavior info box in Error Boundaries section
2. Note that async and event errors use useErrorHandler
3. Confirm understanding of error boundary scope

**Expected Understanding:**
- ✅ Render errors caught automatically
- ✅ Async/event errors need useErrorHandler hook
- ✅ Error boundaries have specific scope limitations

**Why:** Ensures developers understand when to use error boundaries vs. useErrorHandler

---

### Test 14: useErrorReset Hook (Optional Enhancement)

**Purpose:** Verify useErrorReset hook can programmatically reset error boundary

**Note:** This test is optional - useErrorReset is available but not currently used in test UI

**Setup (if testing):**
```typescript
import { useErrorReset } from '@factory/app-shell';

const { resetError } = useErrorReset();

// Call resetError() to programmatically reset boundary
```

**Expected Results:**
- ✅ resetError() triggers boundary reset
- ✅ Works same as "Try Again" button
- ✅ Can be called from outside error fallback

**Why:** Confirms useErrorReset hook provides programmatic error boundary control

---

### Test 15: Error Boundary Isolation

**Purpose:** Verify errors in test UI don't crash entire app (future nested boundaries)

**Note:** Currently we have one boundary wrapping the entire app. Future enhancement would add nested boundaries per feature.

**Current Behavior:**
- Any error shows full-screen ErrorFallback
- Entire app content is replaced with fallback UI
- User must reset to continue

**Future Enhancement (Nested Boundaries):**
- Each feature (Navigation, Stores, Lifecycle, Errors) wrapped in own boundary
- Error in one feature only shows fallback for that feature section
- Rest of app remains functional

**Why:** Documents current behavior and future improvement for isolated error handling

---

### Test 16: Error Logging in Development vs Production

**Purpose:** Compare error logging verbosity between development and production

**Steps:**
1. In development: Trigger error, check console
2. In production build: Trigger error, check logs (if accessible)

**Expected Results:**

**Development Mode:**
- ✅ Verbose logging: `[ErrorBoundary]`, `[useErrorHandler]`, `[App]` prefixes
- ✅ Full error stack traces
- ✅ Component stacks visible
- ✅ Error context objects logged
- ✅ React error overlay may appear

**Production Mode:**
- ✅ Minimal logging (only if you have access to logs)
- ✅ Errors sent to Sentry (if configured)
- ✅ No React error overlay
- ✅ Clean error UI without technical details

**Why:** Confirms appropriate logging levels for each environment

---

### Test 17: Error Boundary with Navigation

**Purpose:** Verify error boundary works across navigation stack

**Steps:**
1. Navigate to Profile screen
2. Trigger an error using test UI (if accessible on Profile screen)
3. Or: Wrap Profile screen content in a try-catch and throw error
4. Observe behavior

**Expected Results:**

**In the App UI:**
- ✅ Error boundary catches error on any screen
- ✅ ErrorFallback UI shows regardless of current route
- ✅ "Try Again" resets to current navigation state (stays on Profile)
- ✅ Navigation stack preserved after reset

**Why:** Confirms error boundary works throughout navigation hierarchy

**Note:** Currently errors can only be triggered from Home screen. Full test requires adding error triggers to other screens or programmatic error throwing.

---

### Test 18: Error Boundary with Lifecycle Events

**Purpose:** Verify error boundary remains functional across app lifecycle

**Steps:**
1. Trigger error to show ErrorFallback
2. Background the app (home button)
3. Wait 5 seconds
4. Return to app
5. Observe ErrorFallback still displayed
6. Tap "Try Again"

**Expected Results:**

**In the App UI:**
- ✅ ErrorFallback UI persists across app backgrounding
- ✅ "Try Again" button remains functional
- ✅ Reset works correctly after app returns to foreground
- ✅ App recovers normally

**In the Terminal Console Logs:**
- ✅ Lifecycle events logged (appBackground, appActive)
- ✅ Error boundary state persists
- ✅ Reset works after lifecycle transitions

**Why:** Confirms error boundary state management works across lifecycle events

---

### Test 19: Stress Test - Rapid Error Triggering

**Purpose:** Verify error boundary handles rapid consecutive errors

**Steps:**
1. Tap "Throw Async Error" button rapidly 5 times
2. Observe behavior
3. Tap "Try Again"
4. Repeat test with "Throw Event Error"

**Expected Results:**

**In the App UI:**
- ✅ App doesn't crash from rapid errors
- ✅ ErrorFallback shows after first error triggers
- ✅ Subsequent clicks queue up or are ignored (boundary already showing)
- ✅ Async counter increments showing all attempts registered
- ✅ Console logs all error attempts
- ✅ "Try Again" recovers cleanly

**In the Terminal Console Logs:**
- ✅ All error triggers logged
- ✅ Counter in async errors shows: 1, 2, 3, 4, 5
- ✅ No crashes or undefined behavior
- ✅ Error boundary handles concurrent errors gracefully

**Why:** Confirms error boundary is resilient under stress conditions

---

### Test 20: Final Integration Check

**Purpose:** Verify error boundaries integrate seamlessly with all other features

**Steps:**
1. Perform full app interaction test:
   - Change theme to dark
   - Change language to "es"
   - Navigate to Profile screen
   - Navigate to Settings
   - Trigger render error
   - Reset error
   - Change theme to light
   - Trigger async error
   - Reset error
   - Navigate back to Home
   - Background app
   - Return to app
   - Trigger event error
   - Reset error
2. Verify all features still work

**Expected Results:**

**In the App UI:**
- ✅ Theme persists through error cycles
- ✅ Settings persist through error cycles
- ✅ Navigation state preserved after errors
- ✅ All stores (Lifecycle, Stores) remain functional
- ✅ Error boundary doesn't interfere with any feature
- ✅ App fully functional after multiple error/recovery cycles
- ✅ No degradation in performance or stability

**In the Terminal Console Logs:**
- ✅ All features log correctly
- ✅ Error logs interspersed with feature logs
- ✅ No unexpected errors or warnings
- ✅ Clean recovery after each error

**Why:** Confirms error boundaries are properly integrated and don't interfere with the rest of the app

---

## Success Criteria: Global Error Boundaries & Fallback Screens

All 20 tests must pass to be considered complete:

### Core Error Boundary Functionality (6 tests)
- [X] Test 1: ErrorBoundary initialization
- [X] Test 2: Render error catching (dev mode)
- [X] Test 3: Error recovery with Try Again
- [X] Test 4: Production mode error display
- [X] Test 5: Async error with useErrorHandler
- [X] Test 6: Event handler error with useErrorHandler

### Error Recovery & Resilience (4 tests)
- [X] Test 7: Multiple error recoveries
- [X] Test 8: Error context logging
- [X] Test 9: Custom onError callback
- [X] Test 10: Custom onReset callback

### Integration & Configuration (5 tests)
- [X] Test 11: Sentry integration (optional, requires DSN)
- [X] Test 12: Error boundaries with theme changes
- [X] Test 17: Error boundary with navigation
- [X] Test 18: Error boundary with lifecycle events
- [X] Test 19: Stress test - rapid errors

### Understanding & Final Validation (5 tests)
- [X] Test 13: Error boundary scope limitations understood
- [X] Test 14: useErrorReset hook (optional enhancement)
- [X] Test 15: Error boundary isolation (future nested boundaries)
- [X] Test 16: Logging differences (dev vs production)
- [X] Test 20: Final integration check

---

## Test Suite: App-Wide Loading & Splash Orchestration

### Test 1: App Initialization Status

**Purpose:** Verify loading state accurately reflects app initialization

**Steps:**
1. Kill the app completely
2. Launch the app fresh
3. Scroll to "App-Wide Loading & Splash" section immediately
4. Observe the status indicators

**Expected Results:**

**In the App UI:**
- ✅ "App Ready" transitions from "No" (red) to "Yes" (green) within 1-2 seconds
- ✅ "Initializing" transitions from "Yes" to "No" correspondingly
- ✅ "Completed Tasks" shows count (0 or more, depending on startup tasks)
- ✅ "Failed Tasks" shows 0 initially
- ✅ Status section displays real-time initialization state

**In the Terminal Console Logs:**
- ✅ `LOG  [LoadingStore] Starting initialization`
- ✅ `LOG  [LoadingStore] App marked as ready`
- ✅ `LOG  [SplashController] Splash hidden successfully`

**Why:** Confirms loading state hooks accurately track the app's initialization lifecycle

---

### Test 2: Splash Screen Visibility Check

**Purpose:** Verify splash screen is automatically hidden after initialization

**Steps:**
1. Launch the app fresh
2. Wait for app to fully load (1-2 seconds)
3. Scroll to "App-Wide Loading & Splash" section
4. Tap "Check Visibility" button

**Expected Results:**

**In the App UI:**
- ✅ Event log shows "Loading: Splash visible = false"
- ✅ No splash screen is visible on the device

**In the Terminal Console Logs:**
- ✅ `LOG  [LoadingProvider] App ready!` (if using LoadingProvider)

**Why:** Confirms splash screen is properly hidden after app initialization completes

---

### Test 3: Manual Splash Control

**Purpose:** Verify manual splash screen control works correctly

**Steps:**
1. Tap "Hide Splash" button in "Splash Control" section
2. Check event log
3. Tap "Check Visibility" again

**Expected Results:**

**In the App UI:**
- ✅ Event log shows "Loading: Manually hiding splash"
- ✅ Event log shows "Loading: Splash hidden"
- ✅ Event log shows "Loading: Splash visible = false"
- ✅ No errors occur (splash already hidden gracefully)

**In the Terminal Console Logs:**
- ✅ `LOG  [SplashController] Splash already hidden` (or similar)

**Why:** Confirms `useSplashControl` hook provides safe manual control with idempotent behavior

---

### Test 4: Loading Overlay Display

**Purpose:** Verify LoadingOverlay component renders correctly

**Steps:**
1. Scroll to "Loading Overlay" section
2. Tap "Show Overlay" button
3. Observe the overlay
4. Wait 2 seconds for it to auto-dismiss

**Expected Results:**

**In the App UI:**
- ✅ Full-screen overlay appears immediately
- ✅ Dark background with opacity (rgba 0,0,0,0.7)
- ✅ White spinning ActivityIndicator in center
- ✅ Message "Processing your request..." displays below spinner
- ✅ Overlay covers all content (z-index 9999)
- ✅ Overlay auto-dismisses after 2 seconds
- ✅ Event log shows "Loading: Showing loading overlay"
- ✅ Event log shows "Loading: Loading overlay hidden"

**In the Terminal Console Logs:**
- ✅ No errors or warnings

**Why:** Confirms LoadingOverlay renders with correct styling and positioning

---

### Test 5: Transparent Loading Overlay

**Purpose:** Verify LoadingOverlay transparent mode works correctly

**Steps:**
1. Tap "Show Transparent" button
2. Observe the overlay appearance
3. Wait 2 seconds for auto-dismiss

**Expected Results:**

**In the App UI:**
- ✅ Overlay appears with lighter background (rgba 0,0,0,0.3)
- ✅ Content below overlay is more visible through transparency
- ✅ Message "Please wait..." displays
- ✅ ActivityIndicator still clearly visible
- ✅ Overlay auto-dismisses after 2 seconds
- ✅ Event log shows "Loading: Showing transparent overlay"

**In the Terminal Console Logs:**
- ✅ No errors or warnings

**Why:** Confirms LoadingOverlay transparent prop correctly modifies overlay appearance

---

### Test 6: Loading State Updates

**Purpose:** Verify loading state hooks provide real-time updates

**Steps:**
1. Kill and restart app
2. Immediately observe "Current Status" section during initialization
3. Watch status values change in real-time

**Expected Results:**

**In the App UI:**
- ✅ Status values update dynamically without manual refresh
- ✅ "App Ready" transitions smoothly from No to Yes
- ✅ "Initializing" transitions inversely
- ✅ Task counts update if any initialization tasks run
- ✅ All hooks (`useAppReady`, `useLoadingState`) provide reactive data

**In the Terminal Console Logs:**
- ✅ Initialization sequence logs appear
- ✅ No unnecessary re-renders or performance warnings

**Why:** Confirms loading hooks use Zustand selectors correctly for reactive state updates

---

### Test 7: Loading State in Light Mode

**Purpose:** Verify loading UI works correctly in light theme

**Steps:**
1. Navigate to "Stores" section
2. Tap "Set Light Mode"
3. Scroll to "App-Wide Loading & Splash" section
4. Tap "Show Overlay" button

**Expected Results:**

**In the App UI:**
- ✅ Loading section renders with light theme colors
- ✅ Status badges use light mode backgrounds
- ✅ Text is clearly readable
- ✅ Loading overlay still uses dark overlay (consistent UX)
- ✅ All buttons and UI elements properly themed

**In the Terminal Console Logs:**
- ✅ No errors or warnings

**Why:** Confirms loading UI adapts correctly to theme changes

---

### Test 8: Loading State in Dark Mode

**Purpose:** Verify loading UI works correctly in dark theme

**Steps:**
1. Navigate to "Stores" section
2. Tap "Set Dark Mode"
3. Scroll to "App-Wide Loading & Splash" section
4. Observe appearance
5. Tap "Show Overlay" button

**Expected Results:**

**In the App UI:**
- ✅ Loading section uses dark theme colors
- ✅ Status badges have appropriate dark mode styling
- ✅ Green/red badges remain clearly visible
- ✅ Text contrast is sufficient for readability
- ✅ Loading overlay maintains consistent appearance

**In the Terminal Console Logs:**
- ✅ No errors or warnings

**Why:** Confirms loading UI properly follows dark theme styling

---

### Test 9: Multiple Overlay Triggers

**Purpose:** Verify overlay behavior with rapid successive calls

**Steps:**
1. Tap "Show Overlay" button
2. Immediately tap "Show Transparent" button (before first overlay dismisses)
3. Observe behavior

**Expected Results:**

**In the App UI:**
- ✅ First overlay appears
- ✅ Second tap either queues or shows transparent overlay after first dismisses
- ✅ No visual glitches or overlay stacking issues
- ✅ Event log shows both "show" and "hide" events
- ✅ App remains responsive

**In the Terminal Console Logs:**
- ✅ No errors or warnings
- ✅ No React state update warnings

**Why:** Confirms overlay state management handles rapid interactions gracefully

---

### Test 10: useLoadingState Hook Accuracy

**Purpose:** Verify `useLoadingState` returns complete and accurate data

**Steps:**
1. Launch app
2. Observe all status values in the "Current Status" section
3. Compare with expected initialization state

**Expected Results:**

**In the App UI:**
- ✅ All properties are defined and accessible:
  - `isInitializing` (boolean)
  - `isAppReady` (boolean)
  - `completedTasks` (array)
  - `failedTasks` (array)
  - `currentTask` (string or null)
  - `completedCount` (number)
  - `failedCount` (number)
- ✅ Values are accurate and consistent with app state
- ✅ Counts match array lengths

**In the Terminal Console Logs:**
- ✅ No errors accessing loading state
- ✅ No undefined or null errors

**Why:** Confirms `useLoadingState` hook provides complete data access to loading state

---

### Test 11: useAppReady Hook Simplicity

**Purpose:** Verify `useAppReady` provides focused ready state

**Steps:**
1. Observe "App Ready" and "Initializing" status during app launch
2. Verify they inverse correctly

**Expected Results:**

**In the App UI:**
- ✅ When `isAppReady` is false, `isInitializing` is true
- ✅ When `isAppReady` is true, `isInitializing` is false
- ✅ Transition happens smoothly
- ✅ Values are always boolean (never undefined)

**In the Terminal Console Logs:**
- ✅ No errors or warnings

**Why:** Confirms `useAppReady` provides simple, reliable ready state tracking

---

### Test 12: useSplashControl Hook Functions

**Purpose:** Verify both `useSplashControl` hook functions work correctly

**Steps:**
1. Tap "Hide Splash" button (tests `hideSplash()`)
2. Tap "Check Visibility" button (tests `isSplashVisible()`)
3. Observe event log

**Expected Results:**

**In the App UI:**
- ✅ Both buttons work without errors
- ✅ `hideSplash()` completes asynchronously
- ✅ `isSplashVisible()` returns synchronously
- ✅ Event log shows both actions
- ✅ No undefined or null errors

**In the Terminal Console Logs:**
- ✅ No errors calling splash control functions
- ✅ Functions work even if bootsplash not installed (graceful degradation)

**Why:** Confirms `useSplashControl` provides reliable splash screen control interface

---

## Success Criteria: App-Wide Loading & Splash Orchestration

- [X] Test 1: App Initialization Status
- [X] Test 2: Splash Screen Visibility Check
- [X] Test 3: Manual Splash Control
- [X] Test 4: Loading Overlay Display
- [X] Test 5: Transparent Loading Overlay
- [X] Test 6: Loading State Updates
- [X] Test 7: Loading State in Light Mode
- [X] Test 8: Loading State in Dark Mode
- [X] Test 9: Multiple Overlay Triggers
- [X] Test 10: useLoadingState Hook Accuracy
- [X] Test 11: useAppReady Hook Simplicity
- [X] Test 12: useSplashControl Hook Functions

All 12 tests must pass to be considered complete

---

# Test Suite: Remote Configuration Bootstrap

## Overview

This test suite validates the Remote Configuration Bootstrap feature in `@factory/app-shell`, which provides remote config fetching, caching, feature flags, and real-time updates.

**Prerequisites:**
- App must be running with `RemoteConfigProvider` configured
- "Remote Config & Feature Flags" section visible in app
- Console logs accessible for validation

---

### Test 1: Remote Config Initialization

**Purpose:** Verify remote config initializes on app startup

**Steps:**
1. Launch the app fresh (force close and reopen)
2. Immediately scroll to "Remote Config & Feature Flags" section
3. Check "Current Status" panel

**Expected Results:**

**In the App UI:**
- ✅ Initialized: "Yes"
- ✅ Source: "default" or "cache" (not "remote" yet)
- ✅ Last Fetch Status: Displays a status

**In the Terminal Console Logs:**
- ✅ `LOG  [RemoteConfigStore] Set initialized: true`
- ✅ `LOG  [RemoteConfigStore] Config updated: ...`

**Why:** Confirms remote config provider initializes and loads cached/default values instantly

---

### Test 2: Config Source Tracking

**Purpose:** Verify config source accurately reflects where values came from

**Steps:**
1. Check "Current Status" panel after app loads
2. Wait 2-3 seconds for background fetch
3. Check if source changes

**Expected Results:**

**In the App UI:**
- ✅ Initial Source: "cache" or "default"
- ✅ Source updates to "remote" if fetch succeeds (or stays "cache"/"default" if Firebase not configured)
- ✅ Last Fetch Status: Shows "success", "failure", or "no-fetch-yet"

**In the Terminal Console Logs:**
- ✅ `LOG  [RemoteConfigManager] ...` (initialization logs)
- ✅ If Firebase configured: `LOG  [RemoteConfig] Fetch successful from: ...`
- ✅ If Firebase not configured: `LOG  [RemoteConfigManager] Firebase not available...`

**Why:** Confirms source tracking accurately reflects where config values originated

---

### Test 3: Feature Flags Display

**Purpose:** Verify feature flags are accessible and display correctly

**Steps:**
1. Scroll to "Feature Flags" section
2. Observe flag states for:
   - Dark Mode
   - Premium Features
   - Experiment

**Expected Results:**

**In the App UI:**
- ✅ Each flag shows "Enabled" or "Disabled"
- ✅ Default state is "Disabled" for all flags (based on defaults in App.tsx)
- ✅ If variant exists, shows "Variant: [variant_name]"
- ✅ If metadata exists, shows "Metadata: {...}"

**Why:** Confirms `useRemoteFeatureFlag` hook correctly retrieves and parses feature flags

---

### Test 4: Config Value Type Conversion

**Purpose:** Verify config values return correct types (boolean, string, number)

**Steps:**
1. Scroll to "Config Values" section
2. Observe all displayed values:
   - API Timeout (number)
   - API URL (string)
   - Enable Logging (boolean)
   - Max Retries (number)

**Expected Results:**

**In the App UI:**
- ✅ API Timeout: Shows "30000ms" (number formatted)
- ✅ API URL: Shows "https://api.example.com" (string)
- ✅ Enable Logging: Shows "True" or "False" (boolean)
- ✅ Max Retries: Shows "3" (number)

**Why:** Confirms `useConfigBoolean`, `useConfigString`, `useConfigNumber` correctly convert types

---

### Test 5: Log Current State Action

**Purpose:** Verify current state can be logged and accessed

**Steps:**
1. Scroll to "Test Actions" section
2. Tap "Log Current State" button
3. Check Event Log

**Expected Results:**

**In the App UI:**
- ✅ Event log shows new entries:
  - "RemoteConfig: Logged current state"
  - "Source: [source], Initialized: true"
- ✅ No errors or crashes

**Why:** Confirms `useRemoteConfig` hook provides complete state access

---

### Test 6: Show All Config Keys Action

**Purpose:** Verify all config keys can be enumerated

**Steps:**
1. Tap "Show All Config Keys" button
2. Check Event Log

**Expected Results:**

**In the App UI:**
- ✅ Event log shows "RemoteConfig: All config keys"
- ✅ Lists all config keys with their values:
  - feature_dark_mode: false
  - feature_premium: false
  - feature_experiment: false
  - api_timeout: 30000
  - api_url: https://api.example.com
  - enable_logging: false
  - max_retries: 3

**Why:** Confirms config snapshot contains all expected keys and values

---

### Test 7: Log Feature Flags Action

**Purpose:** Verify feature flag states can be accessed programmatically

**Steps:**
1. Tap "Log Feature Flags" button
2. Check Event Log

**Expected Results:**

**In the App UI:**
- ✅ Event log shows "RemoteConfig: Feature flag states logged"
- ✅ Lists each flag with enabled state:
  - Dark Mode: false
  - Premium: false
  - Experiment: false

**Why:** Confirms feature flags are correctly evaluated and accessible

---

### Test 8: Graceful Degradation Without Firebase

**Purpose:** Verify app works when Firebase Remote Config is not configured

**Steps:**
1. Check "Current Status" section
2. Observe behavior when Firebase not installed

**Expected Results:**

**In the App UI:**
- ✅ Initialized: "Yes" (doesn't block)
- ✅ Source: "default" or "cache"
- ✅ Last Fetch Status: "no-fetch-yet" or "failure"
- ✅ All default values are displayed
- ✅ No crashes or errors

**In the Terminal Console Logs:**
- ✅ `LOG  [RemoteConfigManager] Firebase not available, using cached`
- ✅ OR `LOG  [RemoteConfigManager] Using fallback defaults`
- ✅ No error crashes

**Why:** Confirms remote config gracefully falls back to defaults when Firebase unavailable

---

### Test 9: State Updates Trigger Re-renders

**Purpose:** Verify UI updates when remote config state changes

**Steps:**
1. Watch "Current Status" panel
2. Observe "Fetching" status
3. Wait for background fetch to complete
4. Check if UI updates

**Expected Results:**

**In the App UI:**
- ✅ "Fetching" transitions from "No" → "Yes" → "No"
- ✅ "Source" may update from "cache" → "remote"
- ✅ "Last Fetch Time" updates with current time
- ✅ UI re-renders automatically without manual refresh

**Why:** Confirms React hooks properly subscribe to store updates and trigger re-renders

---

### Test 10: Config Values Use Defaults

**Purpose:** Verify default values are used when keys don't exist

**Steps:**
1. Check all displayed config values
2. Verify they match defaults from `App.tsx` config

**Expected Results:**

**In the App UI:**
- ✅ All values match defaults specified in `RemoteConfigProvider` config
- ✅ No "undefined" or "null" displayed
- ✅ Type conversions work with default values

**Why:** Confirms default fallback mechanism works correctly

---

### Test 11: Cache Persistence (requires app restart)

**Purpose:** Verify cached config persists across app restarts

**Steps:**
1. Let app run for 30 seconds to ensure config is cached
2. Force close the app completely
3. Reopen the app
4. Immediately check "Source" in Current Status

**Expected Results:**

**In the App UI:**
- ✅ Source starts as "cache" (not "default")
- ✅ Last Fetch Time shows current time
- ✅ Config values are immediately available

**In the Terminal Console Logs:**
- ✅ `LOG  [RemoteConfigManager] Initialized with cache values`

**Why:** Confirms Firebase's native caching persists config across app sessions. Firebase marks previously fetched values as having a "remote" source, which our code interprets as "cache" during initialization to indicate these are persisted values from a previous fetch, not defaults.

---

### Test 12: Error Handling for Missing Keys

**Purpose:** Verify graceful handling when config keys don't exist

**Steps:**
1. Check that non-existent keys don't cause crashes
2. Verify default values are used

**Expected Results:**

**In the App UI:**
- ✅ All hooks provide sensible defaults
- ✅ No crashes when accessing non-existent keys
- ✅ `useRemoteFeatureFlag` returns `{ enabled: false }` for missing flags
- ✅ Type-specific hooks return their default values

**Why:** Confirms robust error handling for missing configuration keys

---

## Success Criteria: Remote Configuration Bootstrap

- [X] Test 1: Remote Config Initialization
- [X] Test 2: Config Source Tracking
- [X] Test 3: Feature Flags Display
- [X] Test 4: Config Value Type Conversion
- [X] Test 5: Log Current State Action
- [X] Test 6: Show All Config Keys Action
- [X] Test 7: Log Feature Flags Action
- [X] Test 8: Graceful Degradation Without Firebase
- [X] Test 9: State Updates Trigger Re-renders
- [X] Test 10: Config Values Use Defaults
- [X] Test 11: Cache Persistence (requires app restart)
- [X] Test 12: Error Handling for Missing Keys

All 12 tests must pass to be considered complete