import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmState extends ConfirmRequest {
  resolver: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  confirm(request: ConfirmRequest): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({ ...request, resolver: resolve });
    });
  }

  accept(): void {
    const current = this.state();
    if (!current) return;
    current.resolver(true);
    this.state.set(null);
  }

  cancel(): void {
    const current = this.state();
    if (!current) return;
    current.resolver(false);
    this.state.set(null);
  }
}
