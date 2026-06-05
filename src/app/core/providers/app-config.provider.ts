import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    apiUrl: 'http://localhost:4000/api/v1',
    wsUrl: 'http://localhost:4000',
  }),
});
