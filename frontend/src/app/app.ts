import { Component, OnInit, OnDestroy, inject, signal, DestroyRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { ToastHostComponent } from './toast-host.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ChannelStoreService } from './channel-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ToastHostComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  store = inject(ChannelStoreService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  currentChannelId = signal<string | null>(null);

  ngOnInit(): void {
    this.store.loadChannels();

    const sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
    ).subscribe(() => this.syncChannelFromUrl());
    this.syncChannelFromUrl();
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngOnDestroy(): void {
    // destroyRef handles cleanup
  }

  onChannelChange(channelId: string): void {
    this.router.navigate(['/channel', channelId, 'ideas']);
  }

  private syncChannelFromUrl(): void {
    const segments = this.router.url.split('/');
    const idx = segments.indexOf('channel');
    if (idx >= 0 && idx + 1 < segments.length) {
      this.currentChannelId.set(segments[idx + 1]);
    } else {
      this.currentChannelId.set(null);
    }
  }
}
