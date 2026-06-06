import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 w-80 pointer-events-none">
      @for (toast of toasts.items(); track toast.id) {
        <div
          [attr.data-testid]="'toast-' + toast.kind"
          [attr.data-toast-kind]="toast.kind"
          [attr.data-message]="toast.message"
          class="pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md flex items-start gap-3 animate-fade-in"
          [class.bg-emerald-500\/15]="toast.kind === 'success'"
          [class.border-emerald-500\/40]="toast.kind === 'success'"
          [class.text-emerald-200]="toast.kind === 'success'"
          [class.bg-rose-500\/15]="toast.kind === 'error'"
          [class.border-rose-500\/40]="toast.kind === 'error'"
          [class.text-rose-200]="toast.kind === 'error'"
          [class.bg-slate-800\/80]="toast.kind === 'info'"
          [class.border-slate-700]="toast.kind === 'info'"
          [class.text-slate-100]="toast.kind === 'info'"
        >
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button
            type="button"
            class="text-current/70 hover:text-current"
            (click)="toasts.dismiss(toast.id)"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  toasts = inject(ToastService);
}
