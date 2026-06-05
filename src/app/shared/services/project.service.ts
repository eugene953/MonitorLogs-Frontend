import { Inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../core/providers/app-config.provider';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  // Reactive signal for selected project id
  selectedProjectId = signal<string | null>(null);

  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  getProjects(): Observable<any> {
    return this.http.get<any>(`${this.config.apiUrl}/projects`);
  }

  createProject(project: { name: string; description?: string }): Observable<any> {
    return this.http.post<any>(`${this.config.apiUrl}/projects`, project);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete<any>(`${this.config.apiUrl}/projects/${id}`);
  }
}
