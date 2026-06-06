import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export const ASSET_TYPES = ['AUDIO', 'VIDEO', 'IMAGE', 'THUMBNAIL', 'DIAGRAM'] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export interface Asset {
  id: string;
  name: string;
  type: AssetType | string;
  url: string;
  sizeBytes: number | null;
  mimeType: string | null;
  isShared: boolean;
  isSuggested: boolean;
  channelId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetInput {
  name: string;
  type: AssetType | string;
  url: string;
  sizeBytes?: number | null;
  mimeType?: string | null;
  isShared?: boolean;
  isSuggested?: boolean;
  channelId?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/assets`;

  getAssets(params?: { channelId?: string; type?: string; shared?: boolean }): Observable<Asset[]> {
    let httpParams = new HttpParams();
    if (params?.channelId) httpParams = httpParams.set('channelId', params.channelId);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.shared) httpParams = httpParams.set('shared', 'true');
    return this.http.get<Asset[]>(this.apiUrl, { params: httpParams });
  }

  createAsset(asset: AssetInput): Observable<Asset> {
    return this.http.post<Asset>(this.apiUrl, asset);
  }

  updateAsset(id: string, asset: Partial<AssetInput>): Observable<Asset> {
    return this.http.put<Asset>(`${this.apiUrl}/${id}`, asset);
  }

  deleteAsset(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadAsset(formData: FormData): Observable<Asset> {
    return this.http.post<Asset>(`${this.apiUrl}/upload`, formData);
  }
}
