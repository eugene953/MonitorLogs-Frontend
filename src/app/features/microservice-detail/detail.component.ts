import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MicroservicesService } from '../../shared/services/microservices.service';
import { LogsService } from '../../shared/services/logs.service';
import { Microservice } from '../../shared/models/microservice.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LatencyChartComponent } from '../../shared/components/latency-chart/latency-chart.component';

import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from '../../core/providers/app-config.provider';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-microservice-detail',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, LatencyChartComponent],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class MicroserviceDetailComponent implements OnInit {
  service: Microservice | null = null;
  latencyData: number[] = [];
  latencyLabels: string[] = [];
  failedRequests: any[] = [];
  authFailures: any[] = [];
  failedJobs: any[] = [];
  failedRequestsCount = 0;
  authFailuresCount = 0;
  failedJobsCount = 0;
  activeSessionsCount = 0;

  private serviceId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly microservicesService: MicroservicesService,
    private readonly logsService: LogsService,
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('id') || '';
    this.loadServiceDetails();
    this.loadHealthHistory();
    this.loadObservabilityData();
  }

  loadServiceDetails() {
    this.microservicesService.getMicroserviceDetails(this.serviceId).subscribe((res) => {
      if (res.success) {
        this.service = res.data;
      }
    });
  }

  loadHealthHistory() {
    this.http.get<any>(`${this.config.apiUrl}/health/history/${this.serviceId}`).subscribe({
      next: (res) => {
        // The backend doesn't have a health history endpoint yet, but we prepare the data
        // For now we use empty data - will be populated when the endpoint exists
      },
      error: () => {},
    });
  }

  loadObservabilityData() {
    this.logsService.getFailedRequests(this.serviceId).subscribe((res) => {
      if (res.success) {
        this.failedRequests = res.data?.slice(0, 10) || [];
        this.failedRequestsCount = res.data?.length || 0;
      }
    });

    this.logsService.getAuthFailures(this.serviceId).subscribe((res) => {
      if (res.success) {
        this.authFailures = res.data?.slice(0, 10) || [];
        this.authFailuresCount = res.data?.length || 0;
      }
    });

    this.logsService.getFailedJobs(this.serviceId).subscribe((res) => {
      if (res.success) {
        this.failedJobs = res.data?.slice(0, 10) || [];
        this.failedJobsCount = res.data?.length || 0;
      }
    });

    this.logsService.getActiveSessions(this.serviceId).subscribe((res) => {
      if (res.success) {
        this.activeSessionsCount = res.data?.length || 0;
      }
    });
  }

  viewLogs() {
    this.router.navigate(['/logs', this.serviceId]);
  }

  deleteService() {
    if (confirm('Are you sure you want to delete this microservice? This will permanently remove its tracking metadata.')) {
      this.microservicesService.deleteMicroservice(this.serviceId).subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/dashboard']);
          }
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
