import { Component, OnInit, OnDestroy, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChannelService } from './channel.service';
import { ChannelStoreService } from './channel-store.service';
import { BrandKit } from './idea.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-brand-kit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand-kit.component.html',
})
export class BrandKitComponent implements OnDestroy {
  private channelService = inject(ChannelService);
  private toasts = inject(ToastService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  store = inject(ChannelStoreService);

  channelId = signal<string | null>(null);
  kit = signal<BrandKit | null>(null);
  colors = signal('');
  typography = signal('');
  logoUrl = signal('');
  bannerUrl = signal('');
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  private loadSubscription?: Subscription;

  channelName = computed(() => {
    return this.store.channels().find(c => c.id === this.channelId())?.name ?? null;
  });

  parsedColors = computed(() => {
    try {
      const parsed = JSON.parse(this.colors());
      return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : null;
    } catch { return null; }
  });

  hasChanges = computed(() => {
    const k = this.kit();
    if (!k) return false;
    return this.colors() !== (k.colors ?? '')
      || this.typography() !== (k.typography ?? '')
      || this.logoUrl() !== (k.logoUrl ?? '')
      || this.bannerUrl() !== (k.bannerUrl ?? '');
  });

  constructor() {
    const initialId = this.route.snapshot.paramMap.get('channelId');
    this.channelId.set(initialId);
    if (initialId) this.load();
  }

  ngOnInit(): void {
    const sub = this.route.paramMap.subscribe(params => {
      const newId = params.get('channelId');
      if (newId && newId !== this.channelId()) {
        this.channelId.set(newId);
        this.load();
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  load(): void {
    const channelId = this.channelId();
    if (!channelId) { this.kit.set(null); return; }
    this.loadSubscription?.unsubscribe();
    this.isLoading.set(true);
    this.error.set(null);
    this.loadSubscription = this.channelService.getBrandKit(channelId).subscribe({
      next: (k) => {
        this.kit.set(k);
        this.colors.set(k.colors ?? '');
        this.typography.set(k.typography ?? '');
        this.logoUrl.set(k.logoUrl ?? '');
        this.bannerUrl.set(k.bannerUrl ?? '');
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.kit.set(null);
        } else {
          this.error.set('Failed to load brand kit.');
        }
      },
    });
  }

  create(): void {
    const channelId = this.channelId();
    if (!channelId) return;
    this.isSaving.set(true);
    this.channelService.updateBrandKit(channelId, {}).subscribe({
      next: (k) => {
        this.kit.set(k);
        this.colors.set('');
        this.typography.set('');
        this.logoUrl.set('');
        this.bannerUrl.set('');
        this.isSaving.set(false);
        this.toasts.success('Brand kit created.');
      },
      error: () => {
        this.isSaving.set(false);
        this.toasts.error('Failed to create brand kit.');
      },
    });
  }

  save(): void {
    const channelId = this.channelId();
    if (!channelId || !this.kit()) return;
    this.isSaving.set(true);
    this.channelService.updateBrandKit(channelId, {
      colors: this.colors() || null,
      typography: this.typography() || null,
      logoUrl: this.logoUrl() || null,
      bannerUrl: this.bannerUrl() || null,
    }).subscribe({
      next: (k) => {
        this.kit.set(k);
        this.isSaving.set(false);
        this.toasts.success('Brand kit updated.');
      },
      error: () => {
        this.isSaving.set(false);
        this.toasts.error('Failed to update brand kit.');
      },
    });
  }
}
