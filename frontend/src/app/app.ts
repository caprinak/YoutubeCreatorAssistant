import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeaService, Idea } from './idea.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private ideaService = inject(IdeaService);
  
  ideas = signal<Idea[]>([]);
  isModalOpen = signal(false);
  
  newIdeaTitle = signal('');
  newIdeaDescription = signal('');

  ngOnInit() {
    this.loadIdeas();
  }

  loadIdeas() {
    this.ideaService.getIdeas().subscribe(
      data => this.ideas.set(data),
      error => console.error('Error fetching ideas', error)
    );
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.newIdeaTitle.set('');
    this.newIdeaDescription.set('');
  }

  saveIdea() {
    if (!this.newIdeaTitle().trim()) return;

    this.ideaService.createIdea({
      title: this.newIdeaTitle(),
      description: this.newIdeaDescription()
    }).subscribe(
      newIdea => {
        this.ideas.update(ideas => [newIdea, ...ideas]);
        this.closeModal();
      },
      error => console.error('Error creating idea', error)
    );
  }

  deleteIdea(id: string) {
    this.ideaService.deleteIdea(id).subscribe(
      () => {
        this.ideas.update(ideas => ideas.filter(i => i.id !== id));
      },
      error => console.error('Error deleting idea', error)
    );
  }
}
