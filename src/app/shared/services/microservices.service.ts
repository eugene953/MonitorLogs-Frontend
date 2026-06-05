import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../core/providers/app-config.provider';
import { Microservice } from '../models/microservice.model';

@Injectable({
  providedIn: 'root',
})
export class MicroservicesService {
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  getMicroservicesByProject(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.config.apiUrl}/microservices/project/${projectId}`);
  }

  registerMicroservice(data: {
    projectId: string;
    name: string;
    baseUrl: string;
    environment: string;
    healthEndpoint: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.config.apiUrl}/microservices`, data);
  }

  deleteMicroservice(id: string): Observable<any> {
    return this.http.delete<any>(`${this.config.apiUrl}/microservices/${id}`);
  }

  getMicroserviceDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.config.apiUrl}/microservices/${id}`);
  }
}
