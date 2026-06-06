import { Routes } from '@angular/router';
import { IdeaVaultComponent } from './idea-vault.component';
import { KanbanBoardComponent } from './kanban-board.component';

export const routes: Routes = [
  { path: '', redirectTo: 'ideas', pathMatch: 'full' },
  { path: 'ideas', component: IdeaVaultComponent, title: 'Idea Vault' },
  { path: 'kanban', component: KanbanBoardComponent, title: 'Kanban Board' },
];
