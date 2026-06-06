import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const IDEA_STATUSES = ['RESEARCHING', 'PLANNING', 'IN_PROGRESS', 'COMPLETED'] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  status: IdeaStatus | string;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaInput {
  title: string;
  description?: string | null;
  status?: IdeaStatus | string;
}

@Injectable({
  providedIn: 'root',
})
export class IdeaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ideas`;

  getIdeas(): Observable<Idea[]> {
    return this.http.get<Idea[]>(this.apiUrl);
  }

  createIdea(idea: IdeaInput): Observable<Idea> {
    return this.http.post<Idea>(this.apiUrl, idea);
  }

  updateIdea(id: string, idea: Partial<IdeaInput>): Observable<Idea> {
    return this.http.put<Idea>(`${this.apiUrl}/${id}`, idea);
  }

  deleteIdea(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
