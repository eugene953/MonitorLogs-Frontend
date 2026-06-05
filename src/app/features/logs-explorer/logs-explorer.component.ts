import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LogsService } from '../../shared/services/logs.service';
import { WebSocketService } from '../../shared/services/websocket.service';
import { LogEntry } from '../../shared/models/log-entry.model';
import { MicroservicesService } from '../../shared/services/microservices.service';
import { Microservice } from '../../shared/models/microservice.model';

@Component({
  selector: 'app-logs-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs-explorer.component.html',
  styleUrls: ['./logs-explorer.component.scss'],
})
export class LogsExplorerComponent implements OnInit, OnDestroy {
  serviceId = '';
  projectId = '';
  viewMode: 'service' | 'project' = 'service';
  logs: LogEntry[] = [];
  totalLogs = 0;
  isLoading = false;
  selectedLevel = '';
  searchQuery = '';
  currentPage = 0;
  pageSize = 50;
  liveEntries = 0;
  projectServices: Microservice[] = [];

  private wsSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly logsService: LogsService,
    private readonly wsService: WebSocketService,
    private readonly microservicesService: MicroservicesService,
  ) { }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('serviceId') || '';
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';

    if (this.projectId) {
      this.viewMode = 'project';
      this.loadProjectServices();
    } else {
      this.viewMode = 'service';
    }

    this.loadLogs();

    // Real-time log streaming
    this.wsSub = this.wsService.onLogIngested().subscribe((log) => {
      let matchesView = false;
      let serviceName = '';

      if (this.viewMode === 'service' && log.serviceId === this.serviceId) {
        matchesView = true;
      } else if (this.viewMode === 'project') {
        const matchingService = this.projectServices.find(s => s._id === log.serviceId);
        if (matchingService) {
          matchesView = true;
          serviceName = matchingService.name;
        }
      }

      if (!matchesView) return;

      // Apply current filters to incoming socket log
      if (this.selectedLevel && log.level !== this.selectedLevel) return;
      if (this.searchQuery && !log.message.toLowerCase().includes(this.searchQuery.toLowerCase())) return;

      const newLogEntry: LogEntry = {
        _id: Math.random().toString(36).substring(2, 9),
        serviceId: log.serviceId,
        level: log.level as 'info' | 'warn' | 'error' | 'debug',
        message: log.message,
        timestamp: log.timestamp,
        serviceName: serviceName,
      };

      // Prepend log to list (since display is newest first)
      this.logs = [newLogEntry, ...this.logs];
      this.totalLogs++;
      this.liveEntries++;

      // Cap at 200 items in view to preserve memory
      if (this.logs.length > 200) {
        this.logs = this.logs.slice(0, 200);
      }
    });
  }

  ngOnDestroy() {
    this.wsSub?.unsubscribe();
  }

  loadProjectServices() {
    this.microservicesService.getMicroservicesByProject(this.projectId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.projectServices = res.data;
        }
      }
    });
  }

  loadLogs() {
    this.isLoading = true;

    if (this.viewMode === 'project') {
      // Load project-level logs with environment filtering
      this.logsService
        .queryProjectLogs(this.projectId, {
          level: this.selectedLevel || undefined,
          search: this.searchQuery || undefined,
          limit: this.pageSize,
          skip: this.currentPage * this.pageSize,
        })
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success && res.data) {
              this.logs = res.data.logs;
              this.totalLogs = res.data.total;
            }
          },
          error: () => (this.isLoading = false),
        });
    } else {
      // Load service-level logs
      this.logsService
        .queryLogs(this.serviceId, {
          level: this.selectedLevel || undefined,
          search: this.searchQuery || undefined,
          limit: this.pageSize,
          skip: this.currentPage * this.pageSize,
        })
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success && res.data) {
              this.logs = res.data.logs;
              this.totalLogs = res.data.total;
            }
          },
          error: () => (this.isLoading = false),
        });
    }
  }

  applyFilters() {
    this.currentPage = 0;
    this.liveEntries = 0;
    this.loadLogs();
  }

  nextPage() {
    this.currentPage++;
    this.loadLogs();
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalLogs / this.pageSize);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  trackById(_: number, item: LogEntry) {
    return item._id;
  }
}
