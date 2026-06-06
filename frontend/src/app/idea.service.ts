import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export const IDEA_STATUSES = ['RESEARCHING', 'PLANNING', 'IN_PROGRESS', 'COMPLETED'] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export interface AudiencePersona {
  id: string;
  channelId: string;
  name: string;
  demographics: string | null;
  painPoints: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
}

export interface IdeaTag {
  ideaId: string;
  tagId: string;
  tag: Tag;
}

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  status: IdeaStatus | string;
  channelId: string;
  audiencePersonaId: string | null;
  createdAt: string;
  updatedAt: string;
  persona: AudiencePersona | null;
  tags: IdeaTag[];
}

export interface IdeaInput {
  title: string;
  description?: string | null;
  status?: IdeaStatus | string;
  channelId: string;
  audiencePersonaId?: string | null;
  tagIds?: string[];
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
  niche: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { ideas: number };
}

export interface BrandKit {
  channelId: string;
  colors: string | null;
  typography: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class IdeaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ideas`;

  getIdeas(params?: { channelId?: string; personaId?: string; tagId?: string }): Observable<Idea[]> {
    let httpParams = new HttpParams();
    if (params?.channelId) httpParams = httpParams.set('channelId', params.channelId);
    if (params?.personaId) httpParams = httpParams.set('personaId', params.personaId);
    if (params?.tagId) httpParams = httpParams.set('tagId', params.tagId);
    return this.http.get<Idea[]>(this.apiUrl, { params: httpParams });
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
