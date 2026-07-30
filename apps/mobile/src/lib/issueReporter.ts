import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { logger } from './logger';

interface IssueReport {
  timestamp: string;
  appVersion: string;
  buildVersion: string;
  platform: string;
  osVersion: string;
  deviceName: string;
  logs: ReturnType<typeof logger.getLogs>;
  currentRoute: string;
  environment: string;
  description?: string;
}

let currentRoute = '/';

export const issueReporter = {
  setCurrentRoute(route: string) {
    currentRoute = route;
  },

  async generateReport(description?: string): Promise<IssueReport> {
    return {
      timestamp: new Date().toISOString(),
      appVersion: Application.nativeApplicationVersion ?? 'unknown',
      buildVersion: Application.nativeBuildVersion ?? 'unknown',
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceName: Device.deviceName ?? 'unknown',
      logs: logger.getLogs(),
      currentRoute,
      environment: process.env.EXPO_PUBLIC_API_URL ?? 'development',
      description,
    };
  },

  async exportReport(description?: string): Promise<string> {
    const report = await this.generateReport(description);
    return JSON.stringify(report, null, 2);
  },
};
