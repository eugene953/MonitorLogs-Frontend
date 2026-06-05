import { Inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';
import { APP_CONFIG, AppConfig } from '../../core/providers/app-config.provider';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'monitoring_access_token';
  private readonly userKey = 'monitoring_user_username';

  // Signals for reactive state updates
  currentUser = signal<string | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    private readonly storage: StorageService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {
    // Re-hydrate session on service initialization
    const token = this.storage.getItem<string>(this.tokenKey);
    const username = this.storage.getItem<string>(this.userKey);
    if (token && username) {
      this.currentUser.set(username);
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: { username: string; password: any }): Observable<any> {
    return this.http
      .post<any>(`${this.config.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.success && response.data?.accessToken) {
            const token = response.data.accessToken;
            const username = response.data.username;

            this.storage.setItem(this.tokenKey, token);
            this.storage.setItem(this.userKey, username);

            this.currentUser.set(username);
            this.isAuthenticated.set(true);
          }
        }),
      );
  }

  logout(): void {
    this.storage.removeItem(this.tokenKey);
    this.storage.removeItem(this.userKey);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return this.storage.getItem<string>(this.tokenKey);
  }
}
