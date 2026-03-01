# @factory/paywall Integration Test Plan

## Overview
This document provides a straightforward testing plan for validating the `@factory/paywall` package using RevenueCat in the factory-test-app.

## Prerequisites Setup

### 1. RevenueCat Dashboard Configuration
Before testing, configure the following in your RevenueCat dashboard (https://app.revenuecat.com):

1. **Create Products** in App Store Connect (iOS) and/or Google Play Console (Android):
   - Monthly subscription (e.g., `monthly_pro`)
   - Annual subscription (e.g., `annual_pro`)

2. **Configure RevenueCat**:
   - Add products to RevenueCat dashboard
   - Create entitlement: `pro`
   - Create offering: `default`
   - Assign packages to the offering (monthly, annual)
   - Get your public API keys (iOS and Android)

3. **Environment Variables**:
   Create `.env` file in `apps/factory-test-app/`:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS=<your_ios_public_key>
   EXPO_PUBLIC_REVENUECAT_ANDROID=<your_android_public_key>
   ```

4. **Test Environment**:
   - iOS: Use Sandbox test account (App Store Connect → Users and Access → Sandbox Testers)
   - Android: Use test account added in Google Play Console

### 2. App Prerequisites
- ✅ Package installed and configured
- ✅ Test UI implemented in `screens/PaywallTestScreen.tsx`
- ✅ Environment variables set
- ✅ Running on physical device (RevenueCat doesn't work in simulators for purchases)

---

## Test Suite 1: SDK Initialization

### Test 1.1: SDK Configuration

**Purpose:** Verify RevenueCat SDK initializes correctly with platform-specific API keys

**Steps:**
1. Kill the app completely
2. Launch the app fresh
3. Navigate to "Paywall" test screen from home menu
4. Observe the "SDK Status" card

**Expected Results:**

**In the App UI:**
- ✅ "SDK Status" shows "Initialized"
- ✅ "Platform" shows correct OS (iOS/Android)
- ✅ "API Key" shows first 10 characters of key
- ✅ Green checkmark indicator

**In Console Logs:**
- ✅ `[RevenueCat] Configured SDK successfully`
- ✅ No initialization errors

**Why:** Confirms SDK is properly configured with correct API keys for the platform

---

## Test Suite 2: Offerings & Packages

### Test 2.1: Fetch Offerings

**Purpose:** Verify app can fetch offerings from RevenueCat

**Steps:**
1. In "Offerings" card, tap "Fetch Offerings" button
2. Wait for loading to complete
3. Observe the results

**Expected Results:**

**In the App UI:**
- ✅ Loading indicator appears briefly
- ✅ "Current Offering" shows offering ID (e.g., "default")
- ✅ "Available Packages" lists packages (e.g., "Monthly", "Annual")
- ✅ Each package shows:
  - Package type
  - Localized price (e.g., "$9.99/month")
  - Product identifier
- ✅ Success message displayed

**In Console Logs:**
- ✅ `[RevenueCat] Fetched offerings successfully`
- ✅ Offering and package details logged

**Why:** Confirms offerings are correctly configured in RevenueCat dashboard and accessible from the app

---

### Test 2.2: Package Pricing Localization

**Purpose:** Verify prices are localized for device region

**Steps:**
1. Check the prices displayed for each package
2. Verify currency matches device region settings

**Expected Results:**

**In the App UI:**
- ✅ Prices show in correct currency for device region (e.g., "$9.99" for US, "€9.99" for EU)
- ✅ Price formatting follows regional conventions
- ✅ Trial information displayed if configured (e.g., "7 days free, then $9.99/month")

**Why:** Confirms RevenueCat properly handles localization through store integration

---

### Test 2.3: Offerings Caching

**Purpose:** Verify offerings are cached for 5 minutes

**Steps:**
1. Tap "Fetch Offerings" button
2. Note the timestamp
3. Immediately tap "Fetch Offerings" again
4. Observe response time

**Expected Results:**

**In the App UI:**
- ✅ Second fetch completes instantly (cached)
- ✅ Same offering data returned
- ✅ Cache indicator shows "From Cache"

**In Console Logs:**
- ✅ `[OfferingsManager] Using cached offerings`

**Why:** Confirms caching mechanism reduces unnecessary network requests

---

## Test Suite 3: Entitlement Checking

### Test 3.1: Check Initial Entitlement Status

**Purpose:** Verify app can check user's entitlement status

**Steps:**
1. In "Entitlements" card, observe initial state
2. Tap "Check Entitlements" button if not auto-loaded

**Expected Results:**

**In the App UI:**
- ✅ "Has 'pro' Entitlement" shows "No" (if not subscribed)
- ✅ "Active Entitlements" shows "None" or list of active entitlements
- ✅ "Subscription Status" shows "Not Subscribed"
- ✅ Red indicator for inactive entitlement

**In Console Logs:**
- ✅ `[CustomerInfoManager] Fetched customer info`
- ✅ Entitlement status logged

**Why:** Confirms entitlement checking works before any purchases

---

### Test 3.2: Offline Entitlement Access

**Purpose:** Verify entitlements are cached for offline access

**Steps:**
1. With active internet, check entitlements (previous test)
2. Enable Airplane mode on device
3. Kill and restart app
4. Navigate to Paywall test screen
5. Observe entitlement status

**Expected Results:**

**In the App UI:**
- ✅ Entitlement status loads from cache
- ✅ "Cache Status" shows "Offline Mode"
- ✅ Data still accessible despite no network

**In Console Logs:**
- ✅ `[EntitlementCache] Using cached customer info`

**Why:** Confirms offline caching allows app to function without network

---

## Test Suite 4: Purchase Flow

### Test 4.1: Display Paywall

**Purpose:** Verify RevenueCat Paywall UI displays correctly

**Steps:**
1. In "Purchase" card, tap "Show Paywall" button
2. Observe the paywall modal

**Expected Results:**

**In the App UI:**
- ✅ Paywall modal opens full screen
- ✅ Configured offerings displayed
- ✅ Localized prices shown
- ✅ "Subscribe" or "Start Free Trial" button visible
- ✅ "Restore Purchases" button visible (required by Apple)
- ✅ Terms of Service and Privacy Policy links visible

**Why:** Confirms RevenueCat Paywalls UI component integrates correctly

---

### Test 4.2: Complete Purchase (iOS Sandbox / Android Test)

**Purpose:** Verify full purchase flow works end-to-end

**⚠️ IMPORTANT:** Use Sandbox account (iOS) or test account (Android)

**Steps:**
1. On paywall, tap "Subscribe" for monthly package
2. Complete purchase in native store UI
3. Wait for purchase confirmation
4. Observe app state after purchase

**Expected Results:**

**In the App UI:**
- ✅ Native store purchase sheet appears
- ✅ Sandbox/Test indicator visible (iOS shows "Environment: Sandbox")
- ✅ Purchase completes successfully
- ✅ Paywall dismisses automatically
- ✅ "Entitlements" card updates to show "Has 'pro' Entitlement: Yes"
- ✅ Green checkmark indicator
- ✅ Success message displayed

**In Console Logs:**
- ✅ `[PurchaseManager] Purchase started`
- ✅ `[PurchaseManager] Purchase successful`
- ✅ `[CustomerInfoManager] Cache cleared`
- ✅ Customer info shows active entitlement

**Why:** Confirms end-to-end purchase flow with RevenueCat receipt validation

---

### Test 4.3: Purchase Cancellation

**Purpose:** Verify app handles user cancellation gracefully

**Steps:**
1. Tap "Show Paywall" button
2. Tap "Subscribe" button
3. In native purchase sheet, tap "Cancel"
4. Observe app behavior

**Expected Results:**

**In the App UI:**
- ✅ Paywall remains open
- ✅ No error message displayed (cancellation is normal)
- ✅ "Purchase Cancelled" message shown
- ✅ User can try again

**In Console Logs:**
- ✅ `[PurchaseManager] Purchase cancelled by user`
- ✅ No error logs

**Why:** Confirms graceful handling of user cancellations

---

### Test 4.4: Purchase Error Handling

**Purpose:** Verify app handles purchase errors properly

**Steps:**
1. Enable Airplane mode
2. Tap "Show Paywall" button
3. Attempt to purchase
4. Observe error handling

**Expected Results:**

**In the App UI:**
- ✅ User-friendly error message displayed
- ✅ "Network connection error. Please check your internet and try again."
- ✅ Error alert with retry option
- ✅ App remains stable (no crash)

**In Console Logs:**
- ✅ `[PurchaseManager] Purchase error: NETWORK_ERROR`
- ✅ Error logged with details

**Why:** Confirms robust error handling for network issues

---

## Test Suite 5: Purchase Restoration

### Test 5.1: Restore Purchases Button Visibility

**Purpose:** Verify "Restore Purchases" button is accessible (Apple requirement)

**Steps:**
1. Open paywall modal
2. Locate "Restore Purchases" button

**Expected Results:**

**In the App UI:**
- ✅ "Restore Purchases" button visible on paywall
- ✅ Button clearly labeled
- ✅ Also accessible from test screen "Restore" card

**Why:** Apple App Store Review Guideline 3.1.1 requires visible restore button

---

### Test 5.2: Restore Previous Purchases

**Purpose:** Verify purchases restore correctly on new device or after reinstall

**⚠️ Prerequisites:** Must have active subscription from Test 4.2 or previous test session

**Steps:**
1. Note your test account email
2. Uninstall the app completely
3. Reinstall the app
4. Navigate to Paywall test screen
5. Check initial entitlement status (should show "No")
6. Tap "Restore Purchases" button
7. Authenticate if prompted (iOS sandbox account)
8. Wait for restoration to complete

**Expected Results:**

**In the App UI:**
- ✅ "Restoring..." indicator appears
- ✅ OS may prompt for Apple ID/Google account sign-in
- ✅ Success message: "Your purchases have been restored!"
- ✅ Entitlements update to show active subscription
- ✅ "Has 'pro' Entitlement" changes to "Yes"

**In Console Logs:**
- ✅ `[RestoreManager] Restore purchases started`
- ✅ `[RestoreManager] Entitlements restored: true`
- ✅ Customer info updated with active entitlements

**Why:** Confirms purchase restoration works for users reinstalling or switching devices

---

### Test 5.3: Restore With No Purchases

**Purpose:** Verify app handles restore when user has no previous purchases

**⚠️ Prerequisites:** Use fresh test account with no purchases

**Steps:**
1. With new/empty test account, tap "Restore Purchases"
2. Observe response

**Expected Results:**

**In the App UI:**
- ✅ "Restoring..." indicator appears briefly
- ✅ Alert: "No Purchases Found"
- ✅ Message: "We couldn't find any previous purchases associated with your account."
- ✅ No errors displayed
- ✅ App remains stable

**In Console Logs:**
- ✅ `[RestoreManager] Entitlements restored: false`

**Why:** Confirms graceful handling when no purchases exist

---

## Test Suite 6: Subscription Status

### Test 6.1: View Subscription Details

**Purpose:** Verify app displays subscription information correctly

**⚠️ Prerequisites:** Active subscription from previous tests

**Steps:**
1. In "Subscription Status" card, observe details
2. Tap "Refresh Status" if needed

**Expected Results:**

**In the App UI:**
- ✅ "Status" shows "Active"
- ✅ "Product ID" shows purchased product (e.g., "monthly_pro")
- ✅ "Will Renew" shows "Yes" (sandbox subscriptions auto-renew)
- ✅ "Expiration Date" shows date (sandbox: usually 5 minutes for monthly)
- ✅ "Period Type" shows "Normal" or "Trial"
- ✅ "Billing Issue" shows "No"

**In Console Logs:**
- ✅ Subscription details logged with all fields

**Why:** Confirms app can display detailed subscription metadata

---

### Test 6.2: Subscription State Updates

**Purpose:** Verify app reflects subscription changes in real-time

**⚠️ Note:** Sandbox subscriptions expire quickly (5 min for monthly)

**Steps:**
1. Purchase monthly subscription (Test 4.2)
2. Note the expiration time
3. Wait for subscription to expire (5-6 minutes)
4. Tap "Refresh Status" button
5. Observe updated state

**Expected Results:**

**In the App UI:**
- ✅ Status changes from "Active" to "Expired"
- ✅ "Has 'pro' Entitlement" changes to "No"
- ✅ Expiration date shows past time
- ✅ Red indicator for expired status

**In Console Logs:**
- ✅ `[CustomerInfoManager] Entitlements updated`
- ✅ Active entitlements empty

**Why:** Confirms app correctly handles subscription lifecycle changes

---

## Test Suite 7: Feature Gating

### Test 7.1: Subscription Gate Component

**Purpose:** Verify SubscriptionGate component blocks non-subscribers

**Steps:**
1. Sign out or use account with no subscription
2. In "Feature Gate" card, tap "Access Premium Feature" button
3. Observe behavior

**Expected Results:**

**In the App UI:**
- ✅ Paywall modal appears instead of feature
- ✅ User must subscribe to proceed
- ✅ "Premium Feature Blocked" message shown

**Why:** Confirms feature gating component prevents unauthorized access

---

### Test 7.2: Grant Access After Subscribe

**Purpose:** Verify feature unlocks after successful purchase

**Steps:**
1. From blocked premium feature (Test 7.1)
2. Complete purchase on paywall
3. Paywall dismisses
4. Tap "Access Premium Feature" again

**Expected Results:**

**In the App UI:**
- ✅ Premium feature accessible immediately
- ✅ "Premium Feature Unlocked!" message shown
- ✅ No paywall appears
- ✅ Feature content visible

**Why:** Confirms immediate entitlement unlock after purchase

---

## Test Suite 8: Edge Cases & Error Scenarios

### Test 8.1: Multiple Rapid Purchase Attempts

**Purpose:** Verify app handles rapid consecutive purchase attempts

**Steps:**
1. Open paywall
2. Tap "Subscribe" button
3. Cancel purchase sheet
4. Immediately tap "Subscribe" again (repeat 3-4 times rapidly)

**Expected Results:**

**In the App UI:**
- ✅ App remains stable (no crash)
- ✅ Each purchase attempt processes correctly
- ✅ No race conditions or duplicate charges
- ✅ Loading states display properly

**Why:** Confirms purchase manager handles concurrent requests safely

---

### Test 8.2: App Backgrounding During Purchase

**Purpose:** Verify purchase flow survives app backgrounding

**Steps:**
1. Tap "Subscribe" button
2. When native purchase sheet appears, background app (swipe up)
3. Wait 5 seconds
4. Return to app

**Expected Results:**

**In the App UI:**
- ✅ Purchase sheet still present
- ✅ Can complete or cancel purchase normally
- ✅ Purchase processes correctly after backgrounding
- ✅ No data loss or state corruption

**Why:** Confirms purchase flow is resilient to lifecycle interruptions

---

### Test 8.3: Invalid Offering ID

**Purpose:** Verify app handles missing or invalid offerings gracefully

**Steps:**
1. In code, temporarily change offering ID to invalid value (e.g., "nonexistent")
2. Rebuild app
3. Attempt to fetch offerings
4. Observe error handling

**Expected Results:**

**In the App UI:**
- ✅ Error message displayed
- ✅ "Offering not found" or similar message
- ✅ App doesn't crash
- ✅ Can retry with valid offering

**In Console Logs:**
- ✅ Error logged with details
- ✅ Clear error message

**Why:** Confirms robust error handling for configuration issues

---

## Test Suite 9: Platform-Specific Tests

### Test 9.1: iOS Sandbox Environment Indicator

**Purpose:** Verify sandbox environment is clearly indicated (iOS only)

**Steps (iOS only):**
1. During purchase flow, check for sandbox indicator
2. Verify it's distinguishable from production

**Expected Results:**

**In the App UI:**
- ✅ iOS purchase sheet shows "Environment: Sandbox" banner
- ✅ Test account email visible
- ✅ Clear it's not real money

**Why:** Prevents accidental production charges during testing

---

### Test 9.2: Android Billing Debug Info

**Purpose:** Verify Android test environment setup (Android only)

**Steps (Android only):**
1. During purchase, verify test account is recognized
2. Check for test mode indicators

**Expected Results:**

**In the App UI:**
- ✅ Test purchases complete successfully
- ✅ No real charges to Google account
- ✅ Test account recognized

**Why:** Confirms Android test setup is correct

---

## Success Criteria Summary

✅ **SDK Initialization:**
- SDK configures with correct API keys
- Platform detection works

✅ **Offerings & Packages:**
- Offerings fetch successfully
- Prices are localized correctly
- Caching works for 5 minutes

✅ **Entitlements:**
- Entitlement checking works
- Offline caching functional
- Real-time updates after purchases

✅ **Purchase Flow:**
- Paywall displays correctly
- Purchases complete successfully
- Errors handled gracefully
- Cancellations handled properly

✅ **Purchase Restoration:**
- Restore button visible (Apple requirement)
- Restores work on reinstall
- Handles "no purchases" case

✅ **Subscription Management:**
- Displays subscription details
- Reflects lifecycle changes
- Shows correct expiration dates

✅ **Feature Gating:**
- Blocks non-subscribers
- Unlocks after purchase

✅ **Stability:**
- No crashes in any scenario
- Handles edge cases properly
- Survives app lifecycle events

---

## Troubleshooting

### Issue: Offerings Not Loading

**Symptoms:** Empty offerings or error fetching

**Solutions:**
1. Verify products configured in App Store Connect / Play Console
2. Check products added to RevenueCat dashboard
3. Ensure offering has packages assigned
4. Verify API keys are correct in `.env`
5. Check RevenueCat dashboard for sync status (can take 15 min after product creation)

---

### Issue: Purchase Not Completing

**Symptoms:** Purchase fails or hangs

**Solutions:**
1. Verify using physical device (not simulator)
2. Check sandbox/test account is signed in correctly
3. iOS: Settings → App Store → Sandbox Account
4. Android: Ensure test account added in Play Console
5. Check internet connection
6. Review console logs for specific error codes

---

### Issue: Restore Not Working

**Symptoms:** Restore finds no purchases despite previous purchase

**Solutions:**
1. Ensure using same Apple ID / Google account
2. Check subscription hasn't expired
3. Verify RevenueCat received the purchase (check dashboard)
4. Try `syncPurchases()` instead of `restorePurchases()`
5. Check RevenueCat dashboard for user's purchase history

---

### Issue: Entitlements Not Updating

**Symptoms:** Entitlement status doesn't change after purchase

**Solutions:**
1. Force refresh by killing app and restarting
2. Check `CustomerInfoManager.clearCache()` called after purchase
3. Verify entitlement configured correctly in RevenueCat dashboard
4. Check product → entitlement mapping in dashboard
5. Review RevenueCat webhook logs

---

## Test Completion Checklist

- [ ] All SDK initialization tests pass
- [ ] Offerings fetch and display correctly
- [ ] Entitlement checking works online and offline
- [ ] Full purchase flow completes successfully
- [ ] Purchase restoration works
- [ ] Subscription details display correctly
- [ ] Feature gating blocks/unlocks properly
- [ ] All error scenarios handled gracefully
- [ ] Platform-specific tests pass
- [ ] No crashes in any test scenario
- [ ] Console logs show no errors

---

## Next Steps After Testing

1. **Production Setup:**
   - Replace sandbox API keys with production keys
   - Set up production product IDs
   - Configure production entitlements

2. **Monitoring:**
   - Monitor RevenueCat dashboard for transactions
   - Set up webhooks for subscription events
   - Integrate analytics for conversion tracking

3. **Further Integration:**
   - Integrate with `@factory/auth-lite` for user ID linking
   - Add purchase attribution tracking
   - Implement promotional offers and discounts
