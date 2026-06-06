import { Routes } from '@angular/router';
import { IdeaVaultComponent } from './idea-vault.component';
import { KanbanBoardComponent } from './kanban-board.component';
import { BrandKitComponent } from './brand-kit.component';
import { ChannelRedirectComponent } from './channel-redirect.component';

export const routes: Routes = [
  { path: '', component: ChannelRedirectComponent },
  {
    path: 'channel/:channelId',
    children: [
      { path: '', redirectTo: 'ideas', pathMatch: 'full' },
      { path: 'ideas', component: IdeaVaultComponent, title: 'Idea Vault' },
      { path: 'kanban', component: KanbanBoardComponent, title: 'Kanban Board' },
      { path: 'brand-kit', component: BrandKitComponent, title: 'Brand Kit' },
    ],
  },
];
