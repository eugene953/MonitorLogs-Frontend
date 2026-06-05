import { ServiceStatus } from '../types/service-status.type';

export interface HealthCheckResult {
  _id: string;
  serviceId: string;
  status: ServiceStatus;
  responseTime: number;
  checkedAt: string;
}
