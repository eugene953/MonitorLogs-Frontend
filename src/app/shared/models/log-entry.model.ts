export interface LogEntry {
  _id: string;
  serviceId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  stack?: string;
  timestamp: string;
  serviceName: string;
  environment?: 'development' | 'staging' | 'production';

}
