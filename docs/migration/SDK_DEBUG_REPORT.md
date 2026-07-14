# SDK Debug Report

## Diagnosis

### npm ls expo --depth=0
```
@traction/mobile@1.0.0 C:\Users\alinu\Documents\Traction\apps\mobile
`-- expo@57.0.4
```

### npx expo config --type public
```json
{
  "sdkVersion": "57.0.0",
  "name": "Traction",
  "slug": "traction",
  "version": "1.0.0",
  "platforms": ["ios", "android", "web"],
  "plugins": ["expo-router", "expo-font"],
  "experiments": { "typedRoutes": true }
}
```

### npx expo-doctor
```
19/20 checks passed.
1 check failed: Check Expo config schema (network error - HTML instead of JSON)
```

## Root Cause of "SDK 52" Message

The Expo Go app on the test device is outdated and does not support SDK 57. 

Per SDK 57 release notes:
> "Expo Go for SDK 57 is available with `eas go` for iOS devices, and through Expo CLI for Android devices/emulators and iOS simulators"

Per SDK 56 release notes:
> "Expo Go for SDK 56 is not available on the Apple App Store or Google Play Store."

The App Store / Play Store versions of Expo Go only support up to SDK 52. To test SDK 57, use:
- `npx expo start` for Android emulators / iOS simulators
- `eas go` for physical iOS devices
- Development builds (recommended for production apps)

## Installed Versions

| Package | Version |
|---------|---------|
| expo | 57.0.4 |
| react | 19.2.3 |
| react-native | 0.86.0 |
| expo-router | 57.0.4 |
| react-native-reanimated | 4.5.0 |
| react-native-gesture-handler | 2.32.x |
| react-native-screens | 4.25.2 |
| react-native-safe-area-context | 5.7.x |
| @expo/vector-icons | 15.0.2 |
| react-native-worklets | installed |
| nativewind | 4.2.6 |
| tailwindcss | 3.4.19 |
| typescript | 6.0.3 |

## expo-doctor Results

- Config schema check: FAIL (network error, not a project issue)
- Peer dependencies: PASS (react-native-worklets installed)
- Package version alignment: PASS
