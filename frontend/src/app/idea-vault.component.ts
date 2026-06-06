import { Component, OnInit, OnDestroy, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IdeaService, Idea, IdeaInput, IDEA_STATUSES, AudiencePersona, Tag, IdeaTag } from './idea.service';
import { ChannelService } from './channel.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { statusBadge } from './idea-status.constants';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-idea-vault',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './idea-vault.component.html',
  styleUrl: './idea-vault.component.css',
})
export class IdeaVaultComponent implements OnDestroy {
  private ideaService = inject(IdeaService);
  private channelService = inject(ChannelService);
  private toasts = inject(ToastService);
  private confirm = inject(ConfirmService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly statuses = IDEA_STATUSES;

  channelId = signal<string | null>(null);
  ideas = signal<Idea[]>([]);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  personas = signal<AudiencePersona[]>([]);
  availableTags = signal<Tag[]>([]);

  isModalOpen = signal(false);
  modalMode = signal<Mode>('create');
  editingId = signal<string | null>(null);
  isSaving = signal(false);
  modalError = signal<string | null>(null);

  formTitle = signal('');
  formDescription = signal('');
  formStatus = signal<string>('RESEARCHING');
  formPersonaId = signal<string | null>(null);
  formTagIds = signal<string[]>([]);

  private loadIdeasSubscription?: Subscription;
  private loadPersonasSubscription?: Subscription;
  private loadTagsSubscription?: Subscription;

  constructor() {
    const initialId = this.route.snapshot.paramMap.get('channelId');
    this.channelId.set(initialId);
  }

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
    const id = this.channelId();
    if (id) {
      this.loadIdeas();
      this.loadPersonas();
    }

    const sub = this.route.paramMap.subscribe(params => {
      const newId = params.get('channelId');
      if (newId && newId !== this.channelId()) {
        this.channelId.set(newId);
        this.loadIdeas();
        this.loadPersonas();
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());

    this.loadTags();
  }

  ngOnDestroy(): void {
    this.loadIdeasSubscription?.unsubscribe();
    this.loadPersonasSubscription?.unsubscribe();
    this.loadTagsSubscription?.unsubscribe();
  }

  loadIdeas(): void {
    const channelId = this.channelId();
    if (!channelId) {
      this.ideas.set([]);
      this.isLoading.set(false);
      return;
    }
    this.loadIdeasSubscription?.unsubscribe();
    this.isLoading.set(true);
    this.loadError.set(null);
    this.loadIdeasSubscription = this.ideaService.getIdeas({ channelId }).subscribe({
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

  loadPersonas(): void {
    const channelId = this.channelId();
    if (!channelId) { this.personas.set([]); return; }
    this.loadPersonasSubscription?.unsubscribe();
    this.loadPersonasSubscription = this.channelService.getPersonas(channelId).subscribe({
      next: (personas) => this.personas.set(personas),
      error: () => this.toasts.error('Failed to load personas.'),
    });
  }

  loadTags(): void {
    this.loadTagsSubscription?.unsubscribe();
    this.loadTagsSubscription = this.channelService.getTags().subscribe({
      next: (tags) => this.availableTags.set(tags),
      error: () => this.toasts.error('Failed to load tags.'),
    });
  }

  openCreate(): void {
    this.modalMode.set('create');
    this.editingId.set(null);
    this.formTitle.set('');
    this.formDescription.set('');
    this.formStatus.set('RESEARCHING');
    this.formPersonaId.set(null);
    this.formTagIds.set([]);
    this.modalError.set(null);
    this.isModalOpen.set(true);
  }

  openEdit(idea: Idea): void {
    this.modalMode.set('edit');
    this.editingId.set(idea.id);
    this.formTitle.set(idea.title);
    this.formDescription.set(idea.description ?? '');
    this.formStatus.set(idea.status);
    this.formPersonaId.set(idea.audiencePersonaId);
    this.formTagIds.set(idea.tags?.map((t: IdeaTag) => t.tagId) ?? []);
    this.modalError.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingId.set(null);
    this.modalError.set(null);
  }

  toggleTag(tagId: string): void {
    this.formTagIds.update((ids) =>
      ids.includes(tagId) ? ids.filter((id) => id !== tagId) : [...ids, tagId]
    );
  }

  save(): void {
    if (this.hasFormErrors()) {
      this.modalError.set('Please fix the highlighted fields.');
      return;
    }

    const channelId = this.channelId();
    if (!channelId) {
      this.modalError.set('No channel selected.');
      return;
    }

    this.isSaving.set(true);
    this.modalError.set(null);

    const payload: IdeaInput = {
      title: this.formTitle().trim(),
      description: this.formDescription().trim() || null,
      status: this.formStatus(),
      channelId,
      audiencePersonaId: this.formPersonaId(),
      tagIds: this.formTagIds(),
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
    this.ideaService.updateIdea(idea.id, { status: newStatus, channelId: idea.channelId }).subscribe({
      next: (updated) => {
        this.ideas.update((list) => list.map((i) => (i.id === idea.id ? updated : i)));
        this.toasts.info(`Status set to ${newStatus}.`);
      },
      error: () => {
        this.ideas.set(previous);
        this.toasts.error('Could not update status.');
      },
    });
  }

  readonly statusBadge = statusBadge;

  trackById = (_: number, idea: Idea): string => idea.id;

  private errorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { error?: string } }).error;
      if (body && typeof body.error === 'string') return body.error;
    }
    return fallback;
  }
}
