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
