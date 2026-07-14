# Expo SDK Migration Plan

## Current Versions (Installed)

| Package | Current Version | Target Version |
|---------|----------------|----------------|
| expo | 52.0.49 | 57.0.4 |
| react | 18.3.1 | 19.2.7 |
| react-native | 0.76.9 | 0.86.0 |
| expo-router | 4.0.22 | 57.0.4 |
| nativewind | 4.2.6 | 4.2.6 (latest) |
| react-native-reanimated | 3.16.7 | 4.5.1 |
| react-native-screens | 4.4.0 | 4.26.0 |
| react-native-gesture-handler | 2.20.2 | 3.0.2 |
| react-native-safe-area-context | 4.12.0 | 5.8.0 |
| @react-navigation/native | 7.3.8 | REMOVE (expo-router forked) |
| tailwindcss | 3.4.19 | 3.4.19 (latest) |
| expo-font | ~13.0.1 | 57.0.0 |
| expo-constants | ~17.0.3 | 57.0.3 |
| expo-secure-store | ~14.0.1 | 57.0.0 |
| expo-splash-screen | ~0.29.18 | 57.0.2 |
| expo-status-bar | ~2.0.0 | 57.0.0 |
| expo-blur | ~14.0.1 | 57.0.0 |
| expo-linking | ~7.0.3 | 57.0.2 |

## Breaking Changes (SDK 52 → 57)

### SDK 53 (React Native 0.77)
- React Native 0.77 included in SDK 52 as patch
- Minor changes, no major breaking

### SDK 54 (React Native 0.78)
- expo-file-system new API became default
- Various Expo module updates

### SDK 55 (React Native 0.83)
- Hermes V1 introduced
- New animation backend
- Node.js minimum bumped to v20.19.4

### SDK 56 (React Native 0.85, React 19.2) - MAJOR
- **expo-router forked from react-navigation** - @react-navigation/* no longer works with expo-router
- TypeScript bumped to 6.0.3
- Minimum iOS bumped to 16.4
- @expo/vector-icons replaced by @react-native-vector-icons/*
- expo/fetch as globalThis.fetch
- expo prebuild now clears android/ios directories by default
- Various API changes

### SDK 57 (React Native 0.86)
- No breaking changes from 0.85
- Minor improvements and fixes

## Risks

1. **High Risk**: expo-router/react-navigation separation - must remove @react-navigation/native and run codemod
2. **Medium Risk**: TypeScript 6.x compatibility - may require tsconfig changes
3. **Medium Risk**: NativeWind 4.x with new React version
4. **Low Risk**: React Native Reanimated major version jump (3.x → 4.x)
5. **Low Risk**: Gesture Handler major version jump (2.x → 3.x)

## Migration Strategy

1. **Incremental upgrade**: SDK 52 → 53 → 54 → 55 → 56 → 57
2. **Fix configuration**: Remove app.json duplication, use app.config.ts only
3. **Remove react-navigation**: Run expo-codemod for SDK 56
4. **Upgrade packages**: Use npx expo install --fix for version alignment
5. **Verify**: Run expo-doctor, fix all issues
6. **Test**: Verify routing, assets, authentication

## Success Criteria

- [ ] Expo Go opens successfully
- [ ] No SDK mismatch errors
- [ ] Expo Doctor returns zero errors
- [ ] Routing works (nested routes, tabs, stacks, deep links)
- [ ] Fonts load correctly
- [ ] Splash screen displays
- [ ] Authentication flow works
- [ ] Build succeeds (Android/iOS)
