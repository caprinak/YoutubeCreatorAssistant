import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeaService, Idea, IdeaInput, IDEA_STATUSES } from './idea.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-idea-vault',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './idea-vault.component.html',
  styleUrl: './idea-vault.component.css',
})
export class IdeaVaultComponent implements OnInit {
  private ideaService = inject(IdeaService);
  private toasts = inject(ToastService);
  private confirm = inject(ConfirmService);

  readonly statuses = IDEA_STATUSES;

  ideas = signal<Idea[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  isModalOpen = signal(false);
  modalMode = signal<Mode>('create');
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  modalError = signal<string | null>(null);

  formTitle = signal('');
  formDescription = signal('');
  formStatus = signal<string>('RESEARCHING');

  titleError = computed(() => {
    const t = this.formTitle().trim();
    if (!t) return 'Title is required.';
    if (t.length > 200) return 'Title must be 200 characters or fewer.';
    return null;
  });

  descriptionError = computed(() => {
    const d = this.formDescription();
    if (d.length > 5000) return 'Description must be 5000 characters or fewer.';
    return null;
  });

  hasFormErrors = computed(() => !!this.titleError() || !!this.descriptionError());

  titleCount = computed(() => this.formTitle().length);
  descriptionCount = computed(() => this.formDescription().length);

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.ideaService.getIdeas().subscribe({
      next: (ideas) => {
        this.ideas.set(ideas);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set(this.errorMessage(err, 'Could not load ideas.'));
        this.toasts.error(this.loadError()!);
      },
    });
  }

  openCreate(): void {
    this.modalMode.set('create');
    this.editingId.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formStatus.set('RESEARCHING');
    this.modalError.set(null);
    this.isModalOpen.set(true);
  }

  openEdit(idea: Idea): void {
    this.modalMode.set('edit');
    this.editingId.set(idea.id);
    this.formTitle.set(idea.title);
    this.formDescription.set(idea.description ?? '');
    this.formStatus.set(idea.status);
    this.modalError.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingId.set(null);
    this.modalError.set(null);
  }

  save(): void {
    if (this.hasFormErrors()) {
      this.modalError.set('Please fix the highlighted fields.');
      return;
    }

    this.isSaving.set(true);
    this.modalError.set(null);

    const payload: IdeaInput = {
      title: this.formTitle().trim(),
      description: this.formDescription().trim() || null,
      status: this.formStatus(),
    };

    const mode = this.modalMode();
    const request$ =
      mode === 'create'
        ? this.ideaService.createIdea(payload)
        : this.ideaService.updateIdea(this.editingId()!, payload);

    request$.subscribe({
      next: (idea) => {
        if (mode === 'create') {
          this.ideas.update((list) => [idea, ...list]);
          this.toasts.success('Idea captured.');
        } else {
          this.ideas.update((list) =>
            list.map((i) => (i.id === idea.id ? idea : i)).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          );
          this.toasts.success('Idea updated.');
        }
        this.isSaving.set(false);
        this.closeModal();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.modalError.set(this.errorMessage(err, 'Could not save the idea.'));
      },
    });
  }

  async deleteIdea(idea: Idea): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Delete idea?',
      message: `"${idea.title}" will be permanently removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

    this.ideaService.deleteIdea(idea.id).subscribe({
      next: () => {
        this.ideas.update((list) => list.filter((i) => i.id !== idea.id));
        this.toasts.success('Idea deleted.');
      },
      error: (err) => {
        this.toasts.error(this.errorMessage(err, 'Could not delete the idea.'));
      },
    });
  }

  changeStatus(idea: Idea, newStatus: string): void {
    if (newStatus === idea.status) return;
    const previous = this.ideas();
    this.ideas.update((list) =>
      list.map((i) => (i.id === idea.id ? { ...i, status: newStatus } : i))
    );
    this.ideaService.updateIdea(idea.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.ideas.update((list) => list.map((i) => (i.id === idea.id ? updated : i)));
        this.toasts.info(`Status set to ${newStatus}.`);
      },
      error: (err) => {
        this.ideas.set(previous);
        this.toasts.error(this.errorMessage(err, 'Could not update status.'));
      },
    });
  }

  trackById = (_: number, idea: Idea): string => idea.id;

  statusClass(status: string): string {
    switch (status) {
      case 'RESEARCHING':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      case 'PLANNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'IN_PROGRESS':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  }

  private errorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { error?: string } }).error;
      if (body && typeof body.error === 'string') return body.error;
    }
    return fallback;
  }
}
