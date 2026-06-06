import { Component, OnInit, OnDestroy, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SeriesService, Series, Episode, EpisodeInput, EPISODE_STATUSES, ImportEpisodeInput } from './series.service';
import { AssetService, Asset } from './asset.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { environment } from '../environments/environment';

type ImportStep = 'input' | 'preview' | 'submit';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .markdown-body h2 { font-size: 1.125rem; font-weight: 700; color: #f1f5f9; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .markdown-body h3 { font-size: 1rem; font-weight: 600; color: #e2e8f0; margin-top: 1.25rem; margin-bottom: 0.25rem; }
    .markdown-body p { margin-bottom: 0.75rem; line-height: 1.625; color: #cbd5e1; }
    .markdown-body ul, .markdown-body ol { margin-bottom: 0.75rem; padding-left: 1.5rem; }
    .markdown-body li { margin-bottom: 0.25rem; line-height: 1.5; color: #cbd5e1; }
    .markdown-body code { font-family: 'Monaco', 'Consolas', monospace; font-size: 0.8125rem; background: #1e293b; padding: 0.125rem 0.375rem; border-radius: 0.25rem; color: #f1f5f9; }
    .markdown-body pre { background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; overflow-x: auto; }
    .markdown-body pre code { background: none; padding: 0; border-radius: 0; }
    .markdown-body strong { color: #f1f5f9; font-weight: 600; }
    .markdown-body em { color: #e2e8f0; }
    .markdown-body blockquote { border-left: 3px solid #f59e0b; padding-left: 1rem; margin-bottom: 0.75rem; color: #94a3b8; font-style: italic; }
    .markdown-body hr { border-color: #334155; margin: 1.25rem 0; }
  `],
  template: `
  <section class="flex-1 flex flex-col relative overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

    <header class="h-20 flex items-center justify-between px-8 z-10 relative border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-md">
      <div class="flex items-center space-x-4">
        <a
          [routerLink]="['/channel', channelId(), 'series']"
          class="text-slate-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </a>
        <div>
          @if (series(); as s) {
            <h2 class="text-2xl font-bold text-white tracking-tight">{{ s.title }}</h2>
            <p class="text-sm text-slate-400 mt-1">
              {{ s.sourceType }}@if (s.sourceName) { &middot; {{ s.sourceName }} }
              @if (s.description) { &middot; {{ s.description }} }
            </p>
          } @else {
            <h2 class="text-2xl font-bold text-white tracking-tight">Series</h2>
          }
        </div>
      </div>
      <button
        type="button"
        (click)="openImportWizard()"
        class="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-full text-sm px-6 py-2.5 text-center shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0"
      >
        + Batch Import
      </button>
    </header>

    <div class="flex-1 overflow-auto p-8 z-10 relative">
      @if (isLoading()) {
        <div class="space-y-3">
          @for (_ of [1,2,3]; track $index) {
            <div class="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 h-20 animate-pulse"></div>
          }
        </div>
      } @else if (loadError()) {
        <div class="bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-2xl p-6 max-w-xl">
          <p class="font-medium mb-2">{{ loadError() }}</p>
          <button type="button" (click)="loadEpisodes()" class="mt-2 px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors">Retry</button>
        </div>
      } @else {
        <div class="space-y-2">
          @for (ep of episodes(); track ep.id) {
            <div
              class="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/50 transition-all"
              [class.border-amber-500/70]="expandedEpisodeId() === ep.id"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">
                  {{ ep.episodeNumber }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-white truncate">{{ ep.title }}</h3>
                    <span
                      class="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                      [class]="statusClass(ep.status)"
                    >{{ ep.status }}</span>
                  </div>
                  @if (ep.description) {
                    <p class="text-xs text-slate-400 truncate">{{ ep.description }}</p>
                  }
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <select
                    [value]="ep.status"
                    (change)="changeEpisodeStatus(ep, $any($event.target).value)"
                    class="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white outline-none"
                  >
                    @for (st of episodeStatuses; track st) {
                      <option [value]="st">{{ st }}</option>
                    }
                  </select>
                  <button
                    type="button"
                    (click)="attachAssetPrompt(ep)"
                    class="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded-lg transition-colors"
                  >
                    Attach Asset
                  </button>
                  <button
                    type="button"
                    (click)="deleteEpisode(ep)"
                    class="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    aria-label="Delete episode"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-1 1v1H4a1 1 0 100 2h12a1 1 0 100-2h-4V3a1 1 0 00-1-1H9zM5 8a1 1 0 011 1v7a1 1 0 102 0V9a1 1 0 112 0v7a1 1 0 102 0V9a1 1 0 112 0v7a3 3 0 01-3 3H8a3 3 0 01-3-3V9a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  (click)="toggleExpand(ep.id)"
                  class="text-slate-500 hover:text-amber-400 transition-colors p-1 shrink-0"
                  aria-label="Toggle content"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 transition-transform duration-200"
                    [class.rotate-180]="expandedEpisodeId() === ep.id"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>

              @if (expandedEpisodeId() === ep.id) {
                <div class="mt-4 pt-4 border-t border-slate-700/50 markdown-body" [innerHTML]="expandedContentHtml()">
                </div>
              }
            </div>
          }

          @if (episodes().length === 0) {
            <div class="border-2 border-dashed border-slate-700/50 rounded-2xl p-12 text-center">
              <div class="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-slate-200 mb-1">No episodes yet</h3>
              <p class="text-sm text-slate-400">Use "Batch Import" to add episodes from AI-generated content.</p>
            </div>
          }
        </div>
      }
    </div>
  </section>

  @if (showImportWizard()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" (click)="closeImportWizard()"></div>
      <div class="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative z-10 max-h-[90vh] flex flex-col">
        <h3 class="text-xl font-bold text-white mb-1">Batch Import Episodes</h3>
        <p class="text-sm text-slate-400 mb-4">Paste AI-generated episode content below.</p>

        @if (importStep() === 'input') {
          <textarea
            rows="12"
            placeholder="Paste episodes as JSON array:&#10;&#10;[&#10;  { &quot;title&quot;: &quot;Introduction to Topic&quot;, &quot;content&quot;: &quot;Outline...&quot; },&#10;  { &quot;title&quot;: &quot;Deep Dive Part 1&quot;, &quot;content&quot;: &quot;Notes...&quot; }&#10;]&#10;&#10;Or plain text (one episode per line):&#10;1. Title - Content&#10;2. Another Title - Notes"
            [ngModel]="importRawText()"
            (ngModelChange)="importRawText.set($event)"
            class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder-slate-600 font-mono text-sm resize-none"
          ></textarea>

          @if (parseError()) {
            <p class="text-sm text-rose-300 mt-2">{{ parseError() }}</p>
          }

          <div class="mt-4 flex justify-end space-x-3">
            <button type="button" (click)="closeImportWizard()" class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
            <button type="button" (click)="parseImportText()" class="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">Preview</button>
          </div>
        }

        @if (importStep() === 'preview') {
          <div class="flex-1 overflow-auto space-y-2 mb-4">
            @for (ep of parsedEpisodes(); track $index; let i = $index) {
              <div class="bg-slate-900/60 border border-slate-700 rounded-xl p-3">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-bold text-slate-500 w-6">{{ i + 1 }}.</span>
                  <input
                    type="text"
                    [ngModel]="ep.title"
                    (ngModelChange)="updateParsedEpisode(i, 'title', $event)"
                    class="flex-1 bg-transparent border-b border-transparent focus:border-violet-500 text-white font-medium outline-none text-sm"
                  />
                  <button type="button" (click)="removeParsedEpisode(i)" class="text-slate-500 hover:text-rose-400 transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div class="ml-8">
                  <textarea
                    rows="2"
                    placeholder="Content / notes..."
                    [ngModel]="ep.content"
                    (ngModelChange)="updateParsedEpisode(i, 'content', $event)"
                    class="w-full bg-transparent border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-violet-500 resize-none"
                  ></textarea>
                </div>
              </div>
            }
          </div>

          <div class="text-sm text-slate-400 mb-4">{{ parsedEpisodes().length }} episode(s) ready to import.</div>

          <div class="flex justify-end space-x-3">
            <button type="button" (click)="importStep.set('input')" class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">Back</button>
            <button type="button" (click)="submitImport()" [disabled]="isImporting()" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50">
              {{ isImporting() ? 'Importing...' : 'Import ' + parsedEpisodes().length + ' Episodes' }}
            </button>
          </div>
        }
      </div>
    </div>
  }
  `,
})
export class SeriesDetailComponent implements OnInit, OnDestroy {
  private seriesService = inject(SeriesService);
  private assetService = inject(AssetService);
  private toasts = inject(ToastService);
  private confirm = inject(ConfirmService);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly episodeStatuses = EPISODE_STATUSES;

  channelId = signal<string | null>(null);
  seriesId = signal<string | null>(null);
  series = signal<Series | null>(null);
  episodes = signal<Episode[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  showImportWizard = signal(false);
  importStep = signal<ImportStep>('input');
  importRawText = signal('');
  parsedEpisodes = signal<ImportEpisodeInput[]>([]);
  parseError = signal<string | null>(null);
  isImporting = signal(false);

  expandedEpisodeId = signal<string | null>(null);
  expandedContentHtml = signal<SafeHtml | null>(null);
  diagramAssets = signal<Map<number, Asset>>(new Map());

  private subscription?: Subscription;
  private baseUrl = environment.apiUrl.replace(/\/api$/, '');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('channelId');
    const sid = this.route.snapshot.paramMap.get('seriesId');
    this.channelId.set(id);
    this.seriesId.set(sid);
    if (sid) { this.loadSeriesDetail(sid); this.loadEpisodes(); }
    if (id) this.loadDiagrams(id);
    const sub = this.route.paramMap.subscribe((params) => {
      const newId = params.get('channelId');
      const newSid = params.get('seriesId');
      const prevId = this.channelId();
      const prevSid = this.seriesId();
      this.channelId.set(newId);
      this.seriesId.set(newSid);
      if (newId && newId !== prevId) this.loadDiagrams(newId);
      if (newSid && newSid !== prevSid) {
        this.expandedEpisodeId.set(null);
        this.expandedContentHtml.set(null);
        this.loadSeriesDetail(newSid);
        this.loadEpisodes();
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadSeriesDetail(id: string): void {
    this.seriesService.getSeriesById(id).subscribe({
      next: (s) => this.series.set(s),
    });
  }

  loadEpisodes(): void {
    const seriesId = this.seriesId();
    if (!seriesId) { this.episodes.set([]); this.isLoading.set(false); return; }

    this.subscription?.unsubscribe();
    this.isLoading.set(true);
    this.loadError.set(null);

    this.seriesService.getEpisodes(seriesId).subscribe({
      next: (eps) => {
        this.episodes.set(eps);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load episodes.');
        this.toasts.error('Could not load episodes.');
      },
    });
  }

  changeEpisodeStatus(ep: Episode, newStatus: string): void {
    if (newStatus === ep.status) return;
    const previous = this.episodes();
    this.episodes.update((list) =>
      list.map((e) => (e.id === ep.id ? { ...e, status: newStatus } : e))
    );
    this.seriesService.updateEpisode(ep.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.episodes.update((list) => list.map((e) => (e.id === ep.id ? updated : e)));
        this.toasts.info(`Status set to ${newStatus}.`);
      },
      error: () => {
        this.episodes.set(previous);
        this.toasts.error('Could not update status.');
      },
    });
  }

  async deleteEpisode(ep: Episode): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Delete episode?',
      message: `"${ep.title}" will be permanently removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    this.seriesService.deleteEpisode(ep.id).subscribe({
      next: () => {
        this.episodes.update((list) => list.filter((e) => e.id !== ep.id));
        this.toasts.success('Episode deleted.');
      },
      error: () => this.toasts.error('Could not delete episode.'),
    });
  }

  attachAssetPrompt(ep: Episode): void {
    const assetId = prompt('Enter the ID of the asset to attach:');
    if (!assetId) return;
    this.seriesService.attachAssetToEpisode(ep.id, assetId).subscribe({
      next: (updatedEp) => {
        this.episodes.update(list => list.map(e => e.id === ep.id ? updatedEp : e));
        this.toasts.success('Asset attached.');
        // Re-compute HTML if this episode is currently expanded
        if (this.expandedEpisodeId() === ep.id) {
          this.computeHtml(updatedEp).then(html => this.expandedContentHtml.set(html));
        }
      },
      error: () => this.toasts.error('Could not attach asset. Ensure ID is valid.')
    });
  }

  openImportWizard(): void {
    this.importStep.set('input');
    this.importRawText.set('');
    this.parsedEpisodes.set([]);
    this.parseError.set(null);
    this.showImportWizard.set(true);
  }

  closeImportWizard(): void {
    this.showImportWizard.set(false);
    this.parseError.set(null);
  }

  parseImportText(): void {
    this.parseError.set(null);
    const raw = this.importRawText().trim();
    if (!raw) { this.parseError.set('Please paste some content first.'); return; }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const episodes = parsed.map((item: any, idx: number) => ({
          episodeNumber: item.episodeNumber ?? idx + 1,
          title: item.title || `Episode ${idx + 1}`,
          content: item.content ?? item.description ?? null,
        }));
        this.parsedEpisodes.set(episodes);
        this.importStep.set('preview');
        return;
      }
    } catch {}

    const lines = raw.split('\n').filter((l) => l.trim());
    const episodes = lines.map((line, idx) => {
      const cleaned = line.replace(/^\d+[\.\)]\s*/, '');
      const sepIdx = cleaned.indexOf('-');
      if (sepIdx > 0) {
        return {
          episodeNumber: idx + 1,
          title: cleaned.slice(0, sepIdx).trim(),
          content: cleaned.slice(sepIdx + 1).trim() || null,
        };
      }
      return {
        episodeNumber: idx + 1,
        title: cleaned,
        content: null,
      };
    });

    this.parsedEpisodes.set(episodes);
    this.importStep.set('preview');
  }

  updateParsedEpisode(index: number, field: 'title' | 'content', value: string): void {
    this.parsedEpisodes.update((list) =>
      list.map((ep, i) => (i === index ? { ...ep, [field]: value } : ep))
    );
  }

  removeParsedEpisode(index: number): void {
    this.parsedEpisodes.update((list) => list.filter((_, i) => i !== index));
  }

  submitImport(): void {
    const seriesId = this.seriesId();
    const episodes = this.parsedEpisodes();
    if (!seriesId || episodes.length === 0) return;

    this.isImporting.set(true);
    this.seriesService.importEpisodes(seriesId, episodes).subscribe({
      next: (created) => {
        this.episodes.set(created);
        this.toasts.success(`${created.length} episodes imported.`);
        this.isImporting.set(false);
        this.closeImportWizard();
      },
      error: () => {
        this.isImporting.set(false);
        this.toasts.error('Import failed.');
      },
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'DRAFT': return 'bg-slate-600/20 text-slate-400 border border-slate-600/30';
      case 'SCRIPTING': return 'bg-blue-600/20 text-blue-400 border border-blue-600/30';
      case 'FILMING': return 'bg-amber-600/20 text-amber-400 border border-amber-600/30';
      case 'EDITING': return 'bg-purple-600/20 text-purple-400 border border-purple-600/30';
      case 'COMPLETED': return 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30';
      default: return 'bg-slate-600/20 text-slate-400 border border-slate-600/30';
    }
  }

  loadDiagrams(channelId: string): void {
    this.assetService.getAssets({ channelId, type: 'DIAGRAM' }).subscribe({
      next: (assets) => {
        const map = new Map<number, Asset>();
        for (const asset of assets) {
          const match = asset.url.match(/diagram-0*(\d+)-/);
          if (match) {
            map.set(parseInt(match[1], 10), asset);
          }
        }
        this.diagramAssets.set(map);
      },
    });
  }

  toggleExpand(epId: string): void {
    if (this.expandedEpisodeId() === epId) {
      this.expandedEpisodeId.set(null);
      this.expandedContentHtml.set(null);
    } else {
      this.expandedEpisodeId.set(epId);
      this.expandedContentHtml.set(null);
      const ep = this.episodes().find((e) => e.id === epId);
      if (ep?.content) {
        this.computeHtml(ep).then((html) => this.expandedContentHtml.set(html));
      }
    }
  }

  private async computeHtml(ep: Episode): Promise<SafeHtml> {
    let rawContent = ep.content || '';
    const assets = ep.assets || [];
    
    // Find all {{ asset:UUID }} shortcodes
    const assetRegex = /\{\{\s*asset:([a-f0-9\-]+)\s*\}\}/gi;
    const referencedAssetIds = new Set<string>();

    rawContent = rawContent.replace(assetRegex, (match, assetId) => {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        referencedAssetIds.add(assetId);
        return `<div class="my-6">
          <h4 class="text-sm font-semibold text-amber-400 mb-3">UML Diagram: ${asset.name}</h4>
          <img src="${this.baseUrl}${asset.url}" alt="${asset.name}" class="w-full max-w-2xl rounded-lg border border-slate-700/50" />
        </div>`;
      }
      return match; // If asset not found, leave shortcode as is
    });

    let html = await marked.parse(rawContent);

    // Append unreferenced assets at the bottom
    const unreferenced = assets.filter(a => !referencedAssetIds.has(a.id));
    if (unreferenced.length > 0) {
      html += `<div class="mt-8 pt-6 border-t border-slate-700/50">
        <h4 class="text-lg font-bold text-slate-200 mb-4">Attached Assets</h4>
        <div class="grid grid-cols-1 gap-4">`;
      for (const asset of unreferenced) {
        if (asset.type === 'IMAGE' || asset.type === 'DIAGRAM') {
          html += `<div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <p class="text-sm font-semibold text-amber-400 mb-2">${asset.name}</p>
            <img src="${this.baseUrl}${asset.url}" alt="${asset.name}" class="w-full max-w-xl rounded-lg border border-slate-700/50" />
          </div>`;
        }
      }
      html += `</div></div>`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
