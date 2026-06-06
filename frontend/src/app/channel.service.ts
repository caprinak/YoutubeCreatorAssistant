import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Channel, AudiencePersona, Tag, BrandKit } from './idea.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/channels`);
  }

  createChannel(data: { name: string; handle: string; niche?: string }): Observable<Channel> {
    return this.http.post<Channel>(`${this.apiUrl}/channels`, data);
  }

  updateChannel(id: string, data: Partial<{ name: string; handle: string; niche: string }>): Observable<Channel> {
    return this.http.put<Channel>(`${this.apiUrl}/channels/${id}`, data);
  }

  deleteChannel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/channels/${id}`);
  }

  getPersonas(channelId?: string): Observable<AudiencePersona[]> {
    const params = channelId ? `?channelId=${channelId}` : '';
    return this.http.get<AudiencePersona[]>(`${this.apiUrl}/personas${params}`);
  }

  createPersona(data: { channelId: string; name: string; demographics?: string; painPoints?: string }): Observable<AudiencePersona> {
    return this.http.post<AudiencePersona>(`${this.apiUrl}/personas`, data);
  }

  deletePersona(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/personas/${id}`);
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }

  createTag(data: { name: string; color?: string }): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/tags`, data);
  }

  getBrandKit(channelId: string): Observable<BrandKit> {
    return this.http.get<BrandKit>(`${this.apiUrl}/brand-kits/${channelId}`);
  }

  updateBrandKit(channelId: string, data: { colors?: string | null; typography?: string | null; logoUrl?: string | null; bannerUrl?: string | null }): Observable<BrandKit> {
    return this.http.put<BrandKit>(`${this.apiUrl}/brand-kits/${channelId}`, data);
  }
}
