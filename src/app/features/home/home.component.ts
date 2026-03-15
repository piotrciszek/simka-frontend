import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NewsService, News } from '../../core/services/news.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private newsService = inject(NewsService);
  authService = inject(AuthService);

  news = signal<News[]>([]);
  loading = signal(false);
  error = signal('');

  // Formularz dodawania
  showForm = signal(false);
  newTitle = signal('');
  newContent = signal('');
  submitting = signal(false);

  ngOnInit(): void {
    this.loadNews();
  }

  loadNews(): void {
    this.loading.set(true);
    this.newsService.getNews().subscribe({
      next: data => {
        this.news.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Błąd ładowania newsów');
        this.loading.set(false);
      },
    });
  }

  addNews(): void {
    if (!this.newTitle() || !this.newContent()) return;

    this.submitting.set(true);
    this.newsService.addNews(this.newTitle(), this.newContent()).subscribe({
      next: () => {
        this.newTitle.set('');
        this.newContent.set('');
        this.showForm.set(false);
        this.submitting.set(false);
        this.loadNews();
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  deleteNews(id: number): void {
    if (!confirm('Usunąć ten news?')) return;
    this.newsService.deleteNews(id).subscribe({
      next: () => this.loadNews(),
    });
  }

  isAdminOrKomisz(): boolean {
    return this.authService.hasRole('admin', 'komisz');
  }
}
