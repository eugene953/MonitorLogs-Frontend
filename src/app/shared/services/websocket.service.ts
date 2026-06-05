import { Inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../core/providers/app-config.provider';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;
  private readonly statusChanged$ = new Subject<{ serviceId: string; status: 'UP' | 'DOWN'; responseTime: number }>();
  private readonly logIngested$ = new Subject<{ serviceId: string; level: string; message: string; timestamp: string }>();

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.connect();
  }

  private connect() {
    // Connect to the /monitoring namespace
    this.socket = io(`${this.config.wsUrl}/monitoring`, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket Service] Connected to real-time stream');
    });

    this.socket.on('service_status_changed', (data) => {
      this.statusChanged$.next(data);
    });

    this.socket.on('log_ingested', (data) => {
      this.logIngested$.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('[WebSocket Service] Disconnected from stream');
    });
  }

  onStatusChanged(): Observable<any> {
    return this.statusChanged$.asObservable();
  }

  onLogIngested(): Observable<any> {
    return this.logIngested$.asObservable();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
