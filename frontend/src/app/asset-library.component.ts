import { Component, OnInit, OnDestroy, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssetService, Asset, AssetInput, ASSET_TYPES } from './asset.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';

type Tab = 'ALL' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'THUMBNAIL' | 'DIAGRAM';
type UploadMode = 'url' | 'file';

@Component({
  selector: 'app-asset-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="flex-1 flex flex-col relative overflow-hidden">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

    <header class="h-20 flex items-center justify-between px-8 z-10 relative border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-md">
      <div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Asset Library</h2>
        <p class="text-sm text-slate-400 mt-1">Manage your reusable media assets.</p>
      </div>
      <button
        type="button"
        (click)="openAddModal()"
        class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium rounded-full text-sm px-6 py-2.5 text-center shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0"
      >
        + Add Asset
      </button>
    </header>

    <div class="flex-1 overflow-auto p-8 z-10 relative">
      <div class="flex space-x-1 mb-6 bg-slate-800/40 rounded-xl p-1 w-fit border border-slate-700/30">
        @for (tab of tabs; track tab) {
          <button
            type="button"
            (click)="activeTab.set(tab)"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            [class.bg-emerald-600/20]="activeTab() === tab"
            [class.text-emerald-300]="activeTab() === tab"
            [class.text-slate-400]="activeTab() !== tab"
            [class.hover:text-white]="activeTab() !== tab"
          >
            {{ tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase() + 's' }}
          </button>
        }
      </div>

      <div class="flex items-center space-x-4 mb-6">
        <label class="flex items-center space-x-2 text-sm text-slate-400">
          <input
            type="checkbox"
            [checked]="showShared()"
            (change)="showShared.set(!showShared())"
            class="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500"
          />
          <span>Include shared / suggested</span>
        </label>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (_ of [1,2,3,4,5,6]; track $index) {
            <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 h-40 animate-pulse"></div>
          }
        </div>
      } @else if (loadError()) {
        <div class="bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-2xl p-6 max-w-xl">
          <p class="font-medium mb-2">{{ loadError() }}</p>
          <button type="button" (click)="loadAssets()" class="mt-2 px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors">Retry</button>
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (asset of filteredAssets(); track asset.id) {
            <div class="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 hover:border-emerald-500/50 transition-all relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-700">
                  {{ asset.type }}
                </span>
                <button
                  type="button"
                  (click)="deleteAsset(asset)"
                  class="text-slate-500 hover:text-rose-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                  aria-label="Delete asset"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-1 1v1H4a1 1 0 100 2h12a1 1 0 100-2h-4V3a1 1 0 00-1-1H9zM5 8a1 1 0 011 1v7a1 1 0 102 0V9a1 1 0 112 0v7a1 1 0 102 0V9a1 1 0 112 0v7a3 3 0 01-3 3H8a3 3 0 01-3-3V9a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>

              <div class="w-full h-24 rounded-xl bg-slate-900/60 flex items-center justify-center mb-3 overflow-hidden">
                @if (asset.type === 'IMAGE' || asset.type === 'THUMBNAIL') {
                  <img [src]="apiUrl + '/' + asset.url" [alt]="asset.name" class="max-w-full max-h-full object-contain" (error)="$any($event.target).src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23475569%22><path d=%22M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z%22/></svg>'" />
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              </div>

              <h3 class="text-sm font-semibold text-white truncate">{{ asset.name }}</h3>
              <p class="text-xs text-slate-500 mt-1 truncate">{{ asset.url }}</p>

              @if (asset.isShared || asset.isSuggested) {
                <div class="flex gap-1 mt-2">
                  @if (asset.isShared) { <span class="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Shared</span> }
                  @if (asset.isSuggested) { <span class="text-[10px] font-medium text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded">Suggested</span> }
                </div>
              }
            </div>
          }

          @if (filteredAssets().length === 0) {
            <div class="col-span-full border-2 border-dashed border-slate-700/50 rounded-2xl p-12 text-center">
              <div class="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-slate-200 mb-1">No assets yet</h3>
              <p class="text-sm text-slate-400">Click "Add Asset" to get started.</p>
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
        <h3 class="text-xl font-bold text-white mb-4">Add Asset</h3>

        <!-- Mode Toggle -->
        <div class="flex space-x-1 mb-5 bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button
            type="button"
            (click)="uploadMode.set('url')"
            class="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all"
            [class.bg-emerald-600/20]="uploadMode() === 'url'"
            [class.text-emerald-300]="uploadMode() === 'url'"
            [class.text-slate-400]="uploadMode() !== 'url'"
          >URL</button>
          <button
            type="button"
            (click)="uploadMode.set('file')"
            class="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all"
            [class.bg-emerald-600/20]="uploadMode() === 'file'"
            [class.text-emerald-300]="uploadMode() === 'file'"
            [class.text-slate-400]="uploadMode() !== 'file'"
          >File Upload</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Name <span class="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="e.g., Intro music, Logo, Banner"
              [ngModel]="formName()"
              (ngModelChange)="formName.set($event)"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              maxlength="200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Type <span class="text-rose-400">*</span></label>
            <select
              [ngModel]="formType()"
              (ngModelChange)="formType.set($event)"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              @for (t of assetTypes; track t) {
                <option [value]="t">{{ t.charAt(0) + t.slice(1).toLowerCase() }}</option>
              }
            </select>
          </div>

          @if (uploadMode() === 'url') {
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">URL <span class="text-rose-400">*</span></label>
              <input
                type="url"
                placeholder="https://example.com/asset.png"
                [ngModel]="formUrl()"
                (ngModelChange)="formUrl.set($event)"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              />
            </div>
          }

          @if (uploadMode() === 'file') {
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">File <span class="text-rose-400">*</span></label>
              <input
                type="file"
                (change)="onFileSelected($event)"
                class="w-full text-sm text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 file:cursor-pointer file:transition-colors"
              />
              @if (selectedFile()) {
                <p class="text-xs text-slate-500 mt-1">{{ selectedFile()?.name }} ({{ (selectedFile()?.size ?? 0) / 1024 | number:'1.0-0' }} KB)</p>
              }
            </div>
          }

          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2 text-sm text-slate-400">
              <input
                type="checkbox"
                [checked]="formIsShared()"
                (change)="formIsShared.set(!formIsShared())"
                class="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Shared</span>
            </label>
            <label class="flex items-center space-x-2 text-sm text-slate-400">
              <input
                type="checkbox"
                [checked]="formIsSuggested()"
                (change)="formIsSuggested.set(!formIsSuggested())"
                class="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Suggested</span>
            </label>
          </div>

          @if (modalError()) {
            <p class="text-sm text-rose-300">{{ modalError() }}</p>
          }
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            (click)="closeModal()"
            [disabled]="isSaving()"
            class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >Cancel</button>
          <button
            type="button"
            (click)="save()"
            [disabled]="isSaving() || !canSave()"
            class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving() ? 'Saving...' : 'Add Asset' }}
          </button>
        </div>
      </div>
    </div>
  }
  `,
})
export class AssetLibraryComponent implements OnInit, OnDestroy {
  private assetService = inject(AssetService);
  private toasts = inject(ToastService);
  private confirm = inject(ConfirmService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly tabs: Tab[] = ['ALL', 'IMAGE', 'VIDEO', 'AUDIO', 'THUMBNAIL', 'DIAGRAM'];
  readonly assetTypes = ASSET_TYPES;
  readonly apiUrl = 'http://localhost:3000';

  channelId = signal<string | null>(null);
  assets = signal<Asset[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);
  activeTab = signal<Tab>('ALL');
  showShared = signal(false);

  isModalOpen = signal(false);
  isSaving = signal(false);
  modalError = signal<string | null>(null);

  uploadMode = signal<UploadMode>('url');

  formName = signal('');
  formType = signal<string>('IMAGE');
  formUrl = signal('');
  formIsShared = signal(false);
  formIsSuggested = signal(false);
  selectedFile = signal<File | null>(null);

  canSave = computed(() => {
    if (!this.formName().trim()) return false;
    if (this.uploadMode() === 'url' && !this.formUrl().trim()) return false;
    if (this.uploadMode() === 'file' && !this.selectedFile()) return false;
    return true;
  });

  private subscription?: Subscription;

  filteredAssets = computed(() => {
    let list = this.assets();
    const tab = this.activeTab();
    if (tab !== 'ALL') list = list.filter((a) => a.type === tab);
    if (!this.showShared()) list = list.filter((a) => !a.isShared && !a.isSuggested);
    return list;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('channelId');
    this.channelId.set(id);
    if (id) this.loadAssets();
    const sub = this.route.paramMap.subscribe((params) => {
      const newId = params.get('channelId');
      if (newId && newId !== this.channelId()) {
        this.channelId.set(newId);
        this.loadAssets();
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadAssets(): void {
    const channelId = this.channelId();
    if (!channelId) { this.assets.set([]); this.isLoading.set(false); return; }
    this.subscription?.unsubscribe();
    this.isLoading.set(true);
    this.loadError.set(null);
    this.subscription = this.assetService.getAssets({ channelId }).subscribe({
      next: (assets) => { this.assets.set(assets); this.isLoading.set(false); },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load assets.');
        this.toasts.error('Could not load assets.');
      },
    });
  }

  openAddModal(): void {
    this.uploadMode.set('url');
    this.formName.set('');
    this.formType.set('IMAGE');
    this.formUrl.set('');
    this.formIsShared.set(false);
    this.formIsSuggested.set(false);
    this.selectedFile.set(null);
    this.modalError.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalError.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  save(): void {
    const channelId = this.channelId();
    if (!channelId) { this.modalError.set('No channel selected.'); return; }

    this.isSaving.set(true);
    this.modalError.set(null);

    if (this.uploadMode() === 'url') {
      if (!this.formUrl().trim()) { this.modalError.set('URL is required.'); this.isSaving.set(false); return; }
      const payload: AssetInput = {
        name: this.formName().trim(),
        type: this.formType(),
        url: this.formUrl().trim(),
        isShared: this.formIsShared(),
        isSuggested: this.formIsSuggested(),
        channelId,
      };
      this.assetService.createAsset(payload).subscribe({
        next: (asset) => {
          this.assets.update((list) => [asset, ...list]);
          this.toasts.success('Asset added.');
          this.isSaving.set(false);
          this.closeModal();
        },
        error: () => { this.isSaving.set(false); this.modalError.set('Could not save asset.'); },
      });
    } else {
      const file = this.selectedFile();
      if (!file) { this.modalError.set('File is required.'); this.isSaving.set(false); return; }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', this.formName().trim());
      formData.append('type', this.formType());
      formData.append('channelId', channelId);
      if (this.formIsShared()) formData.append('isShared', 'true');
      if (this.formIsSuggested()) formData.append('isSuggested', 'true');

      this.assetService.uploadAsset(formData).subscribe({
        next: (asset) => {
          this.assets.update((list) => [asset, ...list]);
          this.toasts.success('Asset uploaded.');
          this.isSaving.set(false);
          this.closeModal();
        },
        error: () => { this.isSaving.set(false); this.modalError.set('Could not upload asset.'); },
      });
    }
  }

  async deleteAsset(asset: Asset): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Delete asset?',
      message: `"${asset.name}" will be permanently removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    this.assetService.deleteAsset(asset.id).subscribe({
      next: () => {
        this.assets.update((list) => list.filter((a) => a.id !== asset.id));
        this.toasts.success('Asset deleted.');
      },
      error: () => this.toasts.error('Could not delete asset.'),
    });
  }
}
