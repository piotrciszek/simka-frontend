import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface News {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/news`);
  }

  addNews(title: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/news`, { title, content });
  }

  deleteNews(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/news/${id}`);
  }
}
