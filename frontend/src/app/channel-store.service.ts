import { Injectable, signal, inject } from '@angular/core';
import { Channel } from './idea.service';
import { ChannelService } from './channel.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelStoreService {
  private channelService = inject(ChannelService);
  private toasts = inject(ToastService);

  channels = signal<Channel[]>([]);
  isLoading = signal(false);

  loadChannels(): void {
    this.isLoading.set(true);
    this.channelService.getChannels().subscribe({
      next: (channels) => {
        this.channels.set(channels);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toasts.error('Failed to load channels.');
      },
    });
  }
}
