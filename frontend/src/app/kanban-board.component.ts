import { Component, OnInit, OnDestroy, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { IdeaService, Idea, IDEA_STATUSES } from './idea.service';
import { ToastService } from './toast.service';
import { columnBorder, columnHeader, cardBorder } from './idea-status.constants';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnDestroy {
  private ideaService = inject(IdeaService);
  private toasts = inject(ToastService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly columns = IDEA_STATUSES;
  channelId = signal<string | null>(null);
  ideas = signal<Idea[]>([]);
  isLoading = signal(true);
  private loadSubscription?: Subscription;

  constructor() {
    const initialId = this.route.snapshot.paramMap.get('channelId');
    this.channelId.set(initialId);
  }

  ngOnInit(): void {
    const id = this.channelId();
    if (id) this.loadIdeas(id);

    const sub = this.route.paramMap.subscribe(params => {
      const newId = params.get('channelId');
      if (newId && newId !== this.channelId()) {
        this.channelId.set(newId);
        this.loadIdeas(newId);
      }
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  loadIdeas(channelId: string): void {
    this.loadSubscription?.unsubscribe();
    this.isLoading.set(true);
    this.loadSubscription = this.ideaService.getIdeas({ channelId }).subscribe({
      next: (ideas) => {
        this.ideas.set(ideas);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  ideasByStatus(status: string): Idea[] {
    return this.ideas().filter((i) => i.status === status);
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
        this.toasts.info(`Moved to ${newStatus}.`);
      },
      error: () => {
        this.ideas.set(previous);
        this.toasts.error('Failed to update status.');
      },
    });
  }

  readonly columnBorder = columnBorder;
  readonly columnHeader = columnHeader;
  readonly cardBorder = cardBorder;

  trackById = (_: number, idea: Idea): string => idea.id;
}
