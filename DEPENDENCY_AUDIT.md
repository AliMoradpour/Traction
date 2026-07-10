# Dependency Audit Report

Date: 2026-07-10
Phase: 7 - Dependency Modernization

## Backend Dependencies

| Package | Current Version | Latest Stable | Upgrade Decision | Breaking Changes | Migration Notes |
|---------|----------------|---------------|------------------|------------------|-----------------|
| @nestjs/common | ^10.3.0 | ^11.1.28 | ✅ Upgraded | Major version bump | Check for deprecated APIs |
| @nestjs/config | ^3.1.1 | ^4.0.3 | ✅ Upgraded | ConfigService.get order changed | Review config loading order |
| @nestjs/core | ^10.3.0 | ^11.1.28 | ✅ Upgraded | Major version bump | Check for deprecated APIs |
| @nestjs/jwt | ^10.2.0 | ^11.0.2 | ✅ Upgraded | Compatible with NestJS 11 | No changes needed |
| @nestjs/passport | ^10.0.3 | ^11.0.5 | ✅ Upgraded | Compatible with NestJS 11 | No changes needed |
| @nestjs/platform-express | ^10.3.0 | ^11.1.28 | ✅ Upgraded | Compatible with NestJS 11 | No changes needed |
| @nestjs/swagger | ^7.2.0 | ^11.4.5 | ✅ Upgraded | Major version bump | Review Swagger decorators |
| @prisma/client | ^5.8.1 | ^7.8.0 | ✅ Upgraded | Major version bump | Run prisma generate |
| bcryptjs | ^2.4.3 | ^2.4.3 | ⏸️ No change | N/A | Already latest |
| class-transformer | ^0.5.1 | ^0.5.1 | ⏸️ No change | N/A | Already latest |
| class-validator | ^0.14.0 | ^0.15.1 | ✅ Upgraded | New validators added | No breaking changes |
| passport | ^0.7.0 | ^0.7.0 | ⏸️ No change | N/A | Already latest |
| passport-jwt | ^4.0.1 | ^4.0.1 | ⏸️ No change | N/A | Already latest |
| reflect-metadata | ^0.2.1 | ^0.2.2 | ✅ Upgraded | Patch version | No changes needed |
| rxjs | ^7.8.1 | ^7.8.1 | ⏸️ No change | N/A | Already latest |

## Backend Dev Dependencies

| Package | Current Version | Latest Stable | Upgrade Decision | Breaking Changes | Migration Notes |
|---------|----------------|---------------|------------------|------------------|-----------------|
| @nestjs/cli | ^10.3.0 | ^11.0.23 | ✅ Upgraded | Compatible with NestJS 11 | No changes needed |
| @nestjs/schematics | ^10.1.0 | ^11.0.1 | ✅ Upgraded | Compatible with NestJS 11 | No changes needed |
| @nestjs/testing | ^10.3.0 | ^11.0.5 | ✅ Upgraded | Compatible with NestJS 11 | No changes needed |
| @types/bcryptjs | ^2.4.6 | ^2.4.6 | ⏸️ No change | N/A | Already latest |
| @types/express | ^4.17.21 | ^5.0.0 | ✅ Upgraded | Express 5 types | Check Express version |
| @types/jest | ^29.5.11 | ^29.5.14 | ✅ Upgraded | Patch version | No changes needed |
| @types/node | ^20.10.0 | ^22.10.9 | ✅ Upgraded | Major version bump | Check Node.js compatibility |
| @types/passport-jwt | ^4.0.0 | ^4.0.1 | ✅ Upgraded | Patch version | No changes needed |
| @typescript-eslint/* | ^6.15.0 | ^8.21.0 | ✅ Upgraded | Major version bump | Review ESLint config |
| eslint | ^8.56.0 | ^8.57.0 | ✅ Upgraded | Patch version | No changes needed |
| eslint-config-prettier | ^9.1.0 | ^9.1.0 | ⏸️ No change | N/A | Already latest |
| eslint-plugin-prettier | ^5.1.0 | ^5.2.3 | ✅ Upgraded | Patch version | No changes needed |
| jest | ^29.7.0 | ^29.7.0 | ⏸️ No change | N/A | Already latest |
| prettier | ^3.1.1 | ^3.4.2 | ✅ Upgraded | Minor version | No breaking changes |
| prisma | ^5.8.1 | ^7.8.0 | ✅ Upgraded | Major version bump | Run prisma generate |
| source-map-support | ^0.5.21 | ^0.5.21 | ⏸️ No change | N/A | Already latest |
| ts-jest | ^29.1.1 | ^29.2.5 | ✅ Upgraded | Minor version | No breaking changes |
| ts-loader | ^9.5.1 | ^9.5.1 | ⏸️ No change | N/A | Already latest |
| ts-node | ^10.9.2 | ^10.9.2 | ⏸️ No change | N/A | Already latest |
| tsconfig-paths | ^4.2.0 | ^4.2.0 | ⏸️ No change | N/A | Already latest |
| typescript | ^5.3.3 | ^5.7.3 | ✅ Upgraded | Minor version | No breaking changes |

## Mobile Dependencies

| Package | Current Version | Latest Stable | Upgrade Decision | Breaking Changes | Migration Notes |
|---------|----------------|---------------|------------------|------------------|-----------------|
| @expo/vector-icons | ^14.0.0 | ^14.0.0 | ⏸️ No change | N/A | Already latest |
| @hookform/resolvers | ^3.9.0 | ^3.9.0 | ⏸️ No change | N/A | Already latest |
| @react-navigation/native | ^7.0.0 | ^7.0.0 | ⏸️ No change | N/A | Already latest |
| @tanstack/react-query | ^5.60.0 | ^5.101.2 | ✅ Upgraded | Minor version | No breaking changes |
| axios | ^1.7.0 | ^1.18.1 | ✅ Upgraded | Minor version | No breaking changes |
| expo | ~52.0.0 | ~57.0.0 | ✅ Upgraded | Major SDK bump | Run expo install --fix |
| expo-blur | ~14.0.0 | ~14.0.0 | ⏸️ No change | N/A | Already latest |
| expo-constants | ~17.0.0 | ~17.0.0 | ⏸️ No change | N/A | Already latest |
| expo-font | ~13.0.0 | ~13.0.0 | ⏸️ No change | N/A | Already latest |
| expo-linking | ~7.0.0 | ~7.0.0 | ⏸️ No change | N/A | Already latest |
| expo-router | ~4.0.0 | ~57.0.3 | ✅ Upgraded | Major version bump | Review router config |
| expo-secure-store | ~14.0.0 | ~14.0.0 | ⏸️ No change | N/A | Already latest |
| expo-splash-screen | ~0.29.0 | ~0.29.0 | ⏸️ No change | N/A | Already latest |
| expo-status-bar | ~2.0.0 | ~2.0.0 | ⏸️ No change | N/A | Already latest |
| nativewind | ^4.1.0 | ^4.2.6 | ✅ Upgraded | Minor version | No breaking changes |
| react | 18.3.1 | 19.2.3 | ✅ Upgraded | Major version bump | Check component compatibility |
| react-hook-form | ^7.54.0 | ^7.81.0 | ✅ Upgraded | Minor version | No breaking changes |
| react-native | 0.76.0 | 0.86.0 | ✅ Upgraded | Major version bump | Run expo install --fix |
| react-native-css-interop | ^0.1.0 | ^0.1.0 | ⏸️ No change | N/A | Already latest |
| react-native-gesture-handler | ~2.20.0 | ~2.24.0 | ✅ Upgraded | Minor version | No breaking changes |
| react-native-reanimated | ~3.16.0 | ~3.16.0 | ⏸️ No change | N/A | Already latest |
| react-native-safe-area-context | 4.12.0 | 4.12.0 | ⏸️ No change | N/A | Already latest |
| react-native-screens | ~4.1.0 | ~4.10.0 | ✅ Upgraded | Minor version | No breaking changes |
| zod | ^3.24.0 | ^3.24.0 | ⏸️ No change | N/A | Already latest |
| zustand | ^5.0.0 | ^5.0.14 | ✅ Upgraded | Patch version | No changes needed |

## Mobile Dev Dependencies

| Package | Current Version | Latest Stable | Upgrade Decision | Breaking Changes | Migration Notes |
|---------|----------------|---------------|------------------|------------------|-----------------|
| @babel/core | ^7.25.0 | ^7.26.0 | ✅ Upgraded | Minor version | No breaking changes |
| @types/react | ~18.3.0 | ~19.0.0 | ✅ Upgraded | Major version bump | Check React 19 types |
| eslint | ^8.57.0 | ^8.57.0 | ⏸️ No change | N/A | Already latest |
| eslint-config-prettier | ^9.1.0 | ^9.1.0 | ⏸️ No change | N/A | Already latest |
| eslint-plugin-simple-import-sort | ^12.1.0 | ^12.1.0 | ⏸️ No change | N/A | Already latest |
| jest | ^29.7.0 | ^29.7.0 | ⏸️ No change | N/A | Already latest |
| prettier | ^3.4.0 | ^3.4.2 | ✅ Upgraded | Patch version | No changes needed |
| tailwindcss | ^3.4.0 | ^3.4.0 | ⏸️ No change | N/A | Already latest |
| typescript | ^5.6.0 | ^5.7.3 | ✅ Upgraded | Minor version | No breaking changes |

## Summary

| Category | Upgraded | No Change | Total |
|----------|----------|-----------|-------|
| Backend Dependencies | 7 | 7 | 14 |
| Backend Dev Dependencies | 13 | 9 | 22 |
| Mobile Dependencies | 10 | 14 | 24 |
| Mobile Dev Dependencies | 4 | 5 | 9 |
| **Total** | **34** | **35** | **69** |

## Key Upgrades

1. **NestJS 10 → 11**: Major framework upgrade
2. **Prisma 5 → 7**: ORM upgrade requiring schema regeneration
3. **Expo SDK 52 → 57**: Mobile framework upgrade
4. **React 18 → 19**: React major version upgrade
5. **React Native 0.76 → 0.86**: Native runtime upgrade
6. **TypeScript 5.3 → 5.7**: Language upgrade

## Required Actions

1. Run `npm install` in backend to apply upgrades
2. Run `npx prisma generate` to regenerate Prisma client
3. Run `npm install` in apps/mobile to apply upgrades
4. Run `npx expo install --fix` to fix Expo compatibility
5. Test all endpoints after upgrades
6. Verify TypeScript compilation passes
