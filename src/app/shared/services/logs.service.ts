import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../core/providers/app-config.provider';

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  queryLogs(
    serviceId: string,
    filters: { level?: string; search?: string; limit?: number; skip?: number },
  ): Observable<any> {
    let params = new HttpParams();
    if (filters.level) params = params.set('level', filters.level);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.limit !== undefined) params = params.set('limit', filters.limit.toString());
    if (filters.skip !== undefined) params = params.set('skip', filters.skip.toString());

    return this.http.get<any>(`${this.config.apiUrl}/logs/service/${serviceId}`, { params });
  }

  queryProjectLogs(
    projectId: string,
    filters: { environment?: string; level?: string; search?: string; limit?: number; skip?: number },
  ): Observable<any> {
    let params = new HttpParams();
    if (filters.environment) params = params.set('environment', filters.environment);
    if (filters.level) params = params.set('level', filters.level);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.limit !== undefined) params = params.set('limit', filters.limit.toString());
    if (filters.skip !== undefined) params = params.set('skip', filters.skip.toString());

    return this.http.get<any>(`${this.config.apiUrl}/logs/project/${projectId}`, { params });
  }

  getFailedRequests(serviceId: string): Observable<any> {
    return this.http.get<any>(`${this.config.apiUrl}/observability/failed-requests/${serviceId}`);
  }

  getAuthFailures(serviceId: string): Observable<any> {
    return this.http.get<any>(`${this.config.apiUrl}/observability/auth-failures/${serviceId}`);
  }

  getFailedJobs(serviceId: string): Observable<any> {
    return this.http.get<any>(`${this.config.apiUrl}/observability/failed-jobs/${serviceId}`);
  }

  getActiveSessions(serviceId: string): Observable<any> {
    return this.http.get<any>(`${this.config.apiUrl}/observability/user-sessions/${serviceId}`);
  }
}
