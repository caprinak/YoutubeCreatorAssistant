import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { IdeaService, Idea } from './idea.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let app: App;
  let ideaServiceMock: any;

  const mockIdeas: Idea[] = [
    { id: '1', title: 'Idea 1', description: 'Desc 1', status: 'RESEARCHING', createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '' },
    { id: '2', title: 'Idea 2', description: 'Desc 2', status: 'PLANNING', createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '' }
  ];

  beforeEach(async () => {
    ideaServiceMock = {
      getIdeas: vi.fn().mockReturnValue(of(mockIdeas)),
      createIdea: vi.fn().mockImplementation((idea) => of({
        id: 'new-id',
        title: idea.title,
        description: idea.description || '',
        status: idea.status || 'RESEARCHING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      deleteIdea: vi.fn().mockReturnValue(of(undefined))
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: IdeaService, useValue: ideaServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should load ideas on init', () => {
    app.ngOnInit();
    expect(ideaServiceMock.getIdeas).toHaveBeenCalled();
    expect(app.ideas()).toEqual(mockIdeas);
  });

  it('should log error on init failure', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    ideaServiceMock.getIdeas.mockReturnValueOnce(throwError(() => new Error('API Error')));
    
    app.ngOnInit();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching ideas', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('should open and close the modal', () => {
    app.newIdeaTitle.set('Temp Title');
    app.newIdeaDescription.set('Temp Desc');
    
    app.openModal();
    fixture.detectChanges();
    expect(app.isModalOpen()).toBe(true);

    app.closeModal();
    fixture.detectChanges();
    expect(app.isModalOpen()).toBe(false);
    expect(app.newIdeaTitle()).toBe('');
    expect(app.newIdeaDescription()).toBe('');
  });

  it('should save a new idea and append to list', () => {
    app.newIdeaTitle.set('New Title');
    app.newIdeaDescription.set('New Desc');
    app.isModalOpen.set(true);
    fixture.detectChanges();

    app.saveIdea();
    fixture.detectChanges();

    expect(ideaServiceMock.createIdea).toHaveBeenCalledWith({
      title: 'New Title',
      description: 'New Desc'
    });
    expect(app.ideas()[0].title).toBe('New Title');
    expect(app.isModalOpen()).toBe(false);
  });

  it('should not save idea if title is empty or only whitespace', () => {
    app.newIdeaTitle.set('   ');
    app.saveIdea();
    expect(ideaServiceMock.createIdea).not.toHaveBeenCalled();
  });

  it('should log error on save failure', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    ideaServiceMock.createIdea.mockReturnValueOnce(throwError(() => new Error('Create Error')));
    
    app.newIdeaTitle.set('New Title');
    app.saveIdea();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating idea', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('should delete an idea and filter from list', () => {
    // Populate state
    app.ideas.set([...mockIdeas]);

    app.deleteIdea('1');

    expect(ideaServiceMock.deleteIdea).toHaveBeenCalledWith('1');
    expect(app.ideas()).toHaveLength(1);
    expect(app.ideas()[0].id).toBe('2');
  });

  it('should log error on delete failure', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    ideaServiceMock.deleteIdea.mockReturnValueOnce(throwError(() => new Error('Delete Error')));
    
    app.deleteIdea('1');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting idea', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('should render title CreatorHub', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('CreatorHub');
  });
});
