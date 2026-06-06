import { Component, OnInit, OnDestroy, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SeriesService, Series, SeriesInput, SOURCE_TYPES } from './series.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-series-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <section class="flex-1 flex flex-col relative overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

    <header class="h-20 flex items-center justify-between px-8 z-10 relative border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-md">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Series Planner</h2>
        <p class="text-sm text-slate-400 mt-1">Plan and organize multi-episode content series.</p>
      </div>
      <button
        type="button"
        (click)="openCreateModal()"
        class="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-full text-sm px-6 py-2.5 text-center shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0"
      >
        + New Series
      </button>
    </header>

    <div class="flex-1 overflow-auto p-8 z-10 relative">
      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (_ of [1,2,3]; track $index) {
            <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 h-48 animate-pulse"></div>
          }
        </div>
      } @else if (loadError()) {
        <div class="bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-2xl p-6 max-w-xl">
          <p class="font-medium mb-2">{{ loadError() }}</p>
          <button type="button" (click)="loadSeries()" class="mt-2 px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors">Retry</button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (s of seriesList(); track s.id) {
            <a
              [routerLink]="['/channel', channelId(), 'series', s.id]"
              class="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/50 transition-all relative overflow-hidden block cursor-pointer"
            >
              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div class="flex items-start justify-between mb-3">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-700">
                  {{ s.sourceType }}@if (s.sourceName) { &middot; {{ s.sourceName }} }
                </span>
                <button
                  type="button"
                  (click)="deleteSeries($event, s)"
                  class="text-slate-500 hover:text-rose-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                  aria-label="Delete series"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-1 1v1H4a1 1 0 100 2h12a1 1 0 100-2h-4V3a1 1 0 00-1-1H9zM5 8a1 1 0 011 1v7a1 1 0 102 0V9a1 1 0 112 0v7a1 1 0 102 0V9a1 1 0 112 0v7a3 3 0 01-3 3H8a3 3 0 01-3-3V9a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>

              <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">{{ s.title }}</h3>

              @if (s.description) {
                <p class="text-sm text-slate-400 mb-4 line-clamp-2">{{ s.description }}</p>
              }

              <div class="flex items-center text-xs text-slate-500 mt-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {{ s._count?.episodes ?? 0 }} episode{{ (s._count?.episodes ?? 0) === 1 ? '' : 's' }}
              </div>
            </a>
          }

          @if (seriesList().length === 0) {
            <div
              (click)="openCreateModal()"
              class="col-span-full border-2 border-dashed border-slate-700/50 rounded-2xl p-12 hover:border-slate-500 transition-all cursor-pointer flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100"
            >
              <div class="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-slate-200 mb-1">No series yet</h3>
              <p class="text-sm text-slate-400">Click here to create your first series.</p>
            </div>
          }
        </div>
      }
    </div>
  </section>

  @if (isModalOpen()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" (click)="closeModal()"></div>
      <div class="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10">
        <h3 class="text-xl font-bold text-white mb-4">Create New Series</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Title <span class="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="e.g., Clean Code Video Series"
              [ngModel]="formTitle()"
              (ngModelChange)="formTitle.set($event)"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              maxlength="200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows="3"
              placeholder="What is this series about?"
              [ngModel]="formDescription()"
              (ngModelChange)="formDescription.set($event)"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-slate-600 resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Source Type <span class="text-rose-400">*</span></label>
            <select
              [ngModel]="formSourceType()"
              (ngModelChange)="formSourceType.set($event)"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            >
              @for (st of sourceTypes; track st) {
                <option [value]="st">{{ st.charAt(0) + st.slice(1).toLowerCase() }}</option>
              }
            </select>
          </div>

          @if (formSourceType() === 'BOOK') {
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Source Name</label>
              <input
                type="text"
                placeholder="e.g., Clean Code by Robert C. Martin"
                [ngModel]="formSourceName()"
                (ngModelChange)="formSourceName.set($event)"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              />
            </div>
          }

          @if (modalError()) {
            <p class="text-sm text-rose-300">{{ modalError() }}</p>
          }
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" (click)="closeModal()" [disabled]="isSaving()" class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">Cancel</button>
          <button type="button" (click)="save()" [disabled]="isSaving() || !formTitle().trim()" class="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isSaving() ? 'Saving...' : 'Create Series' }}
          </button>
        </div>
      </div>
    </div>
  }
  `,
})
export class SeriesListComponent implements OnInit, OnDestroy {
  private seriesService = inject(SeriesService);
  private toasts = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly sourceTypes = SOURCE_TYPES;

  channelId = signal<string | null>(null);
  seriesList = signal<Series[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  isModalOpen = signal(false);
  isSaving = signal(false);
  modalError = signal<string | null>(null);

  formTitle = signal('');
  formDescription = signal('');
  formSourceType = signal<string>('TOPIC');
  formSourceName = signal('');

  private subscription?: Subscription;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('channelId');
    this.channelId.set(id);
    if (id) this.loadSeries();
    const sub = this.route.paramMap.subscribe((params) => {
      const newId = params.get('channelId');
      if (newId && newId !== this.channelId()) {
        this.channelId.set(newId);
        this.loadSeries();
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadSeries(): void {
    const channelId = this.channelId();
    if (!channelId) { this.seriesList.set([]); this.isLoading.set(false); return; }
    this.subscription?.unsubscribe();
    this.isLoading.set(true);
    this.loadError.set(null);
    this.subscription = this.seriesService.getSeries(channelId).subscribe({
      next: (list) => { this.seriesList.set(list); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.loadError.set('Could not load series.'); this.toasts.error('Could not load series.'); },
    });
  }

  openCreateModal(): void {
    this.formTitle.set('');
    this.formDescription.set('');
    this.formSourceType.set('TOPIC');
    this.formSourceName.set('');
    this.modalError.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalError.set(null);
  }

  save(): void {
    if (!this.formTitle().trim()) { this.modalError.set('Title is required.'); return; }
    const channelId = this.channelId();
    if (!channelId) { this.modalError.set('No channel selected.'); return; }

    this.isSaving.set(true);
    this.modalError.set(null);

    const payload: SeriesInput = {
      channelId,
      title: this.formTitle().trim(),
      description: this.formDescription().trim() || null,
      sourceType: this.formSourceType(),
      sourceName: this.formSourceName().trim() || null,
    };

    this.seriesService.createSeries(payload).subscribe({
      next: (s) => {
        this.seriesList.update((list) => [s, ...list]);
        this.toasts.success('Series created.');
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => { this.isSaving.set(false); this.modalError.set('Could not create series.'); },
    });
  }

  deleteSeries(event: MouseEvent, s: Series): void {
    event.preventDefault();
    event.stopPropagation();
    this.seriesService.deleteSeries(s.id).subscribe({
      next: () => {
        this.seriesList.update((list) => list.filter((x) => x.id !== s.id));
        this.toasts.success('Series deleted.');
      },
      error: () => this.toasts.error('Could not delete series.'),
    });
  }
}
