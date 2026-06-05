import { Component, OnDestroy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ProjectService } from '../../shared/services/project.service';
import { MicroservicesService } from '../../shared/services/microservices.service';
import { WebSocketService } from '../../shared/services/websocket.service';
import { Microservice } from '../../shared/models/microservice.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  services: Microservice[] = [];
  isLoading = false;
  showRegisterModal = false;
  newSvc = { name: '', baseUrl: '', healthEndpoint: '/health', environment: 'development' };

  private wsSub?: Subscription;

  constructor(
    public readonly projectService: ProjectService,
    private readonly microservicesService: MicroservicesService,
    private readonly wsService: WebSocketService,
    private readonly router: Router,
  ) {
    // React to project changes using Angular effect
    effect(() => {
      const projectId = this.projectService.selectedProjectId();
      if (projectId) {
        this.loadServices(projectId);
      }
    });
  }

  ngOnInit() {
    // Subscribe to real-time status updates
    this.wsSub = this.wsService.onStatusChanged().subscribe((update) => {
      const idx = this.services.findIndex((s) => s._id === update.serviceId);
      if (idx !== -1) {
        this.services[idx] = { ...this.services[idx], status: update.status };
      }
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  loadServices(projectId: string) {
    this.isLoading = true;
    this.microservicesService.getMicroservicesByProject(projectId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.services = res.data;
        }
      },
      error: () => (this.isLoading = false),
    });
  }

  registerService() {
    const projectId = this.projectService.selectedProjectId();
    if (!projectId || !this.newSvc.name.trim()) return;

    this.microservicesService
      .registerMicroservice({ ...this.newSvc, projectId })
      .subscribe((res) => {
        if (res.success) {
          this.showRegisterModal = false;
          this.newSvc = { name: '', baseUrl: '', healthEndpoint: '/health', environment: 'development' };
          this.loadServices(projectId);
        }
      });
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/service', id]);
  }

  navigateToLogs(serviceId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/logs', serviceId]);
  }

  deleteService(serviceId: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this microservice?')) {
      this.microservicesService.deleteMicroservice(serviceId).subscribe({
        next: (res) => {
          if (res.success) {
            const projectId = this.projectService.selectedProjectId();
            if (projectId) {
              this.loadServices(projectId);
            }
          }
        },
      });
    }
  }

  trackById(_: number, item: Microservice) {
    return item._id;
  }

  get upCount(): number {
    return this.services.filter((s) => s.status === 'UP').length;
  }

  get downCount(): number {
    return this.services.filter((s) => s.status === 'DOWN').length;
  }
}
