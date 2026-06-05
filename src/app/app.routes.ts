import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'logs/project/:projectId',
        loadComponent: () =>
          import('./features/logs-explorer/logs-explorer.component').then((m) => m.LogsExplorerComponent),
      },
      {
        path: 'logs/:serviceId',
        loadComponent: () =>
          import('./features/logs-explorer/logs-explorer.component').then((m) => m.LogsExplorerComponent),
      },
      {
        path: 'service/:id',
        loadComponent: () =>
          import('./features/microservice-detail/detail.component').then((m) => m.MicroserviceDetailComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
