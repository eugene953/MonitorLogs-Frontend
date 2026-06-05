import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStatus } from '../../types/service-status.type';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status: ServiceStatus = 'CHECKING';
}
