import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  projects: Project[] = [];
  showCreateModal = false;
  newProjectName = '';
  newProjectDesc = '';

  constructor(
    public readonly authService: AuthService,
    public readonly projectService: ProjectService,
    private readonly router: Router,
    public readonly themeService: ThemeService,
  ) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadProjects();
    }
  }

  loadProjects() {
    this.projectService.getProjects().subscribe((res) => {
      if (res.success && res.data) {
        this.projects = res.data;
        if (this.projects.length > 0 && !this.projectService.selectedProjectId()) {
          this.projectService.selectedProjectId.set(this.projects[0]._id);
        }
      }
    });
  }

  onProjectChange(id: string) {
    this.projectService.selectedProjectId.set(id);
  }

  createProject() {
    if (!this.newProjectName.trim()) return;

    this.projectService.createProject({
      name: this.newProjectName,
      description: this.newProjectDesc,
    }).subscribe((res) => {
      if (res.success) {
        this.newProjectName = '';
        this.newProjectDesc = '';
        this.showCreateModal = false;
        this.loadProjects();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get userInitial(): string {
    const user = this.authService.currentUser();
    return user ? user.charAt(0).toUpperCase() : 'U';
  }
}
