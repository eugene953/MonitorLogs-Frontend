import { ServiceStatus } from '../types/service-status.type';
import { EnvironmentType } from '../types/environment.type';

export interface Microservice {
  _id: string;
  projectId: string;
  name: string;
  baseUrl: string;
  environment: EnvironmentType;
  status: ServiceStatus;
  healthEndpoint: string;
  createdAt: string;
  updatedAt: string;
}
