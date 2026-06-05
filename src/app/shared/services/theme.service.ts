import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'monitoring-theme';
  private readonly themeSignal = signal<'light' | 'dark'>('dark');

  readonly theme = this.themeSignal.asReadonly();

  constructor(private readonly storageService: StorageService) {
    const savedTheme = this.storageService.getItem<'light' | 'dark'>(this.THEME_KEY);
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  toggleTheme(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.themeSignal.set(theme);
    this.storageService.setItem(this.THEME_KEY, theme);

    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }
}
