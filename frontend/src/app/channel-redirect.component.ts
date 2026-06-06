import { Component, inject, effect, OnDestroy, DestroyRef, EffectRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChannelStoreService } from './channel-store.service';

@Component({
  selector: 'app-channel-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="flex-1 flex items-center justify-center text-slate-400 text-lg">Loading channels...</div>`,
})
export class ChannelRedirectComponent implements OnDestroy {
  private store = inject(ChannelStoreService);
  private router = inject(Router);
  private effectRef?: EffectRef;

  constructor() {
    this.effectRef = effect(() => {
      const channels = this.store.channels();
      if (channels.length > 0) {
        this.effectRef?.destroy();
        this.router.navigate(['/channel', channels[0].id, 'ideas'], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.effectRef?.destroy();
  }
}
