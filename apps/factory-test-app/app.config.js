export default {
  expo: {
    name: "factory-test-app",
    slug: "factory-test-app",
    scheme: "factorytest",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ridwanhamid501.factorytestapp",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.ridwanhamid501.factorytestapp",
      permissions: [
        "com.android.vending.BILLING"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-web-browser",
      "expo-secure-store"
    ],
    extra: {
      revenueCat: {
        apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "test_qsBndNsiLiFDMLTOlDqFpGwPjdn",
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS || "test_qsBndNsiLiFDMLTOlDqFpGwPjdn",
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID || "test_qsBndNsiLiFDMLTOlDqFpGwPjdn",
        entitlement: process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || "pro"
      }
    }
  }
};
