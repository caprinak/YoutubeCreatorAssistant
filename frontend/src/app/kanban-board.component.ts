import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeaService, Idea, IDEA_STATUSES } from './idea.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit {
  private ideaService = inject(IdeaService);
  private toasts = inject(ToastService);

  readonly columns = IDEA_STATUSES;
  ideas = signal<Idea[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.isLoading.set(true);
    this.ideaService.getIdeas().subscribe({
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
    this.ideas.update((list) =>
      list.map((i) => (i.id === idea.id ? { ...i, status: newStatus } : i))
    );
    this.ideaService.updateIdea(idea.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.ideas.update((list) => list.map((i) => (i.id === idea.id ? updated : i)));
        this.toasts.info(`Moved to ${newStatus}.`);
      },
      error: () => {
        this.loadIdeas();
        this.toasts.error('Failed to update status.');
      },
    });
  }

  trackById = (_: number, idea: Idea): string => idea.id;

  columnBorder(status: string): string {
    const base = 'flex-1 min-w-0 flex flex-col rounded-2xl border p-4';
    switch (status) {
      case 'RESEARCHING':
        return `${base} border-violet-500/40 bg-violet-500/5`;
      case 'PLANNING':
        return `${base} border-amber-500/40 bg-amber-500/5`;
      case 'IN_PROGRESS':
        return `${base} border-sky-500/40 bg-sky-500/5`;
      case 'COMPLETED':
        return `${base} border-emerald-500/40 bg-emerald-500/5`;
      default:
        return `${base} border-slate-500/40 bg-slate-500/5`;
    }
  }

  columnHeader(status: string): string {
    switch (status) {
      case 'RESEARCHING':
        return 'text-violet-300 bg-violet-500/10';
      case 'PLANNING':
        return 'text-amber-300 bg-amber-500/10';
      case 'IN_PROGRESS':
        return 'text-sky-300 bg-sky-500/10';
      case 'COMPLETED':
        return 'text-emerald-300 bg-emerald-500/10';
      default:
        return 'text-slate-300 bg-slate-500/10';
    }
  }

  cardBorder(status: string): string {
    switch (status) {
      case 'RESEARCHING':
        return 'hover:border-violet-500/50';
      case 'PLANNING':
        return 'hover:border-amber-500/50';
      case 'IN_PROGRESS':
        return 'hover:border-sky-500/50';
      case 'COMPLETED':
        return 'hover:border-emerald-500/50';
      default:
        return 'hover:border-slate-500/50';
    }
  }
}
