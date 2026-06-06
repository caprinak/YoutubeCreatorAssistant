import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirm.state(); as request) {
      <div class="fixed inset-0 z-[70] flex items-center justify-center" data-testid="confirm-dialog">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" (click)="confirm.cancel()"></div>
        <div class="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10">
          <h3 class="text-lg font-bold text-white mb-2">{{ request.title }}</h3>
          <p class="text-sm text-slate-300 mb-6">{{ request.message }}</p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              data-testid="confirm-cancel"
              class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              (click)="confirm.cancel()"
            >
              {{ request.cancelLabel || 'Cancel' }}
            </button>
            <button
              type="button"
              data-testid="confirm-accept"
              class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg"
              [class]="request.destructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/20'"
              (click)="confirm.accept()"
            >
              {{ request.confirmLabel || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  confirm = inject(ConfirmService);
}
