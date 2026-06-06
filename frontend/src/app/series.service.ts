import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Asset } from './asset.service';

export const SOURCE_TYPES = ['BOOK', 'TOPIC', 'CUSTOM'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const EPISODE_STATUSES = ['DRAFT', 'SCRIPTING', 'FILMING', 'EDITING', 'COMPLETED'] as const;
export type EpisodeStatus = (typeof EPISODE_STATUSES)[number];

export interface Series {
  id: string;
  channelId: string;
  title: string;
  description: string | null;
  sourceType: SourceType | string;
  sourceName: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { episodes: number };
}

export interface SeriesInput {
  channelId: string;
  title: string;
  description?: string | null;
  sourceType: SourceType | string;
  sourceName?: string | null;
}

export interface Episode {
  id: string;
  seriesId: string;
  episodeNumber: number;
  title: string;
  description: string | null;
  content: string | null;
  status: EpisodeStatus | string;
  createdAt: string;
  updatedAt: string;
  assets?: Asset[];
}

export interface EpisodeInput {
  seriesId: string;
  episodeNumber: number;
  title: string;
  description?: string | null;
  content?: string | null;
  status?: EpisodeStatus | string;
}

export interface ImportEpisodeInput {
  episodeNumber?: number;
  title: string;
  description?: string | null;
  content?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class SeriesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/series`;

  getSeriesById(id: string): Observable<Series> {
    return this.http.get<Series>(`${this.apiUrl}/${id}`);
  }

  getSeries(channelId?: string): Observable<Series[]> {
    let params = new HttpParams();
    if (channelId) params = params.set('channelId', channelId);
    return this.http.get<Series[]>(this.apiUrl, { params });
  }

  createSeries(data: SeriesInput): Observable<Series> {
    return this.http.post<Series>(this.apiUrl, data);
  }

  updateSeries(id: string, data: Partial<SeriesInput>): Observable<Series> {
    return this.http.put<Series>(`${this.apiUrl}/${id}`, data);
  }

  deleteSeries(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEpisodes(seriesId: string): Observable<Episode[]> {
    return this.http.get<Episode[]>(`${this.apiUrl}/${seriesId}/episodes`);
  }

  createEpisode(data: EpisodeInput): Observable<Episode> {
    return this.http.post<Episode>(`${environment.apiUrl}/episodes`, data);
  }

  updateEpisode(id: string, data: Partial<EpisodeInput>): Observable<Episode> {
    return this.http.put<Episode>(`${environment.apiUrl}/episodes/${id}`, data);
  }

  deleteEpisode(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/episodes/${id}`);
  }

  attachAssetToEpisode(episodeId: string, assetId: string): Observable<Episode> {
    return this.http.post<Episode>(`${environment.apiUrl}/episodes/${episodeId}/assets`, { assetId });
  }

  removeAssetFromEpisode(episodeId: string, assetId: string): Observable<Episode> {
    return this.http.delete<Episode>(`${environment.apiUrl}/episodes/${episodeId}/assets/${assetId}`);
  }

  importEpisodes(seriesId: string, episodes: ImportEpisodeInput[]): Observable<Episode[]> {
    return this.http.post<Episode[]>(`${this.apiUrl}/${seriesId}/import-episodes`, { episodes });
  }
}
