# Dependency Audit Report

## Expo Core

| Package | Current | Recommended | Status | Notes |
|---------|---------|-------------|--------|-------|
| expo | 52.0.49 | 57.0.4 | UPGRADE | Major version jump (52→57) |
| react | 18.3.1 | 19.2.7 | UPGRADE | Major version jump (18→19) |
| react-native | 0.76.9 | 0.86.0 | UPGRADE | Major version jump (0.76→0.86) |

## Expo Modules

| Package | Current | Recommended | Status | Notes |
|---------|---------|-------------|--------|-------|
| expo-router | 4.0.22 | 57.0.4 | UPGRADE | Major version jump, now forks react-navigation |
| expo-font | ~13.0.1 | 57.0.0 | UPGRADE | Use npx expo install |
| expo-constants | ~17.0.3 | 57.0.3 | UPGRADE | Use npx expo install |
| expo-secure-store | ~14.0.1 | 57.0.0 | UPGRADE | Use npx expo install |
| expo-splash-screen | ~0.29.18 | 57.0.2 | UPGRADE | Use npx expo install |
| expo-status-bar | ~2.0.0 | 57.0.0 | UPGRADE | Use npx expo install |
| expo-blur | ~14.0.1 | 57.0.0 | UPGRADE | Use npx expo install |
| expo-linking | ~7.0.3 | 57.0.2 | UPGRADE | Use npx expo install |

## Navigation Stack

| Package | Current | Recommended | Status | Notes |
|---------|---------|-------------|--------|-------|
| @react-navigation/native | 7.3.8 | REMOVE | DELETE | expo-router now forks from react-navigation |
| react-native-gesture-handler | 2.20.2 | 3.0.2 | UPGRADE | Major version jump |
| react-native-screens | 4.4.0 | 4.26.0 | UPGRADE | Minor version jump |
| react-native-safe-area-context | 4.12.0 | 5.8.0 | UPGRADE | Major version jump |
| react-native-reanimated | 3.16.7 | 4.5.1 | UPGRADE | Major version jump |

## Styling

| Package | Current | Recommended | Status | Notes |
|---------|---------|-------------|--------|-------|
| nativewind | 4.2.6 | 4.2.6 | OK | Already at latest stable |
| tailwindcss | 3.4.19 | 3.4.19 | OK | Already at latest stable |
| react-native-css-interop | ^0.1.0 | CHECK | UPGRADE | Verify compatibility with SDK 57 |

## Build Tools

| Package | Current | Recommended | Status | Notes |
|---------|---------|-------------|--------|-------|
| @babel/core | ^7.26.0 | ^7.26.0 | OK | Latest stable |
| typescript | ^5.3.3 | 6.0.3 | UPGRADE | SDK 56 bumped to TS 6.x |

## Other Dependencies

| Package | Current | Recommended | Status | Notes |
|---------|---------|-------------|--------|-------|
| @tanstack/react-query | ^5.62.16 | ^5.62.16 | OK | Latest stable |
| axios | ^1.7.9 | ^1.7.9 | OK | Latest stable |
| react-hook-form | ^7.54.2 | ^7.54.2 | OK | Latest stable |
| @hookform/resolvers | ^3.9.1 | ^3.9.1 | OK | Latest stable |
| zod | ^3.24.1 | ^3.24.1 | OK | Latest stable |
| zustand | ^5.0.2 | ^5.0.2 | OK | Latest stable |
| eslint | ^8.57.1 | ^8.57.1 | OK | Keep for compatibility |

## Critical Actions

1. **DELETE**: @react-navigation/native (expo-router no longer depends on it)
2. **UPGRADE**: All expo-* modules to SDK 57 versions
3. **UPGRADE**: Navigation stack (gesture-handler, screens, safe-area-context, reanimated)
4. **UPGRADE**: TypeScript to 6.x
5. **FIX**: NativeWind babel/metro config for SDK 57 compatibility
6. **VERIFY**: react-native-css-interop compatibility

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| react-navigation removal | HIGH | Run expo-codemod sdk-56-expo-router-react-navigation-replace |
| TypeScript 6.x | MEDIUM | May require tsconfig.json updates |
| Reanimated 3.x→4.x | LOW | Usually backward compatible |
| Gesture Handler 2.x→3.x | LOW | Usually backward compatible |
| NativeWind compatibility | MEDIUM | Verify babel/metro config |
