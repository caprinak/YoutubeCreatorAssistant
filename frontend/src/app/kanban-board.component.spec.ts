import { TestBed, ComponentFixture } from '@angular/core/testing';
import { KanbanBoardComponent } from './kanban-board.component';
import { IdeaService, Idea } from './idea.service';
import { ToastService } from './toast.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('KanbanBoardComponent', () => {
  let fixture: ComponentFixture<KanbanBoardComponent>;
  let comp: KanbanBoardComponent;
  let ideaServiceMock: any;
  let toastMock: any;

  const mockIdeas: Idea[] = [
    { id: '1', title: 'Idea 1', description: 'Desc 1', status: 'RESEARCHING', createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '' },
    { id: '2', title: 'Idea 2', description: 'Desc 2', status: 'PLANNING', createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '' },
    { id: '3', title: 'Idea 3', description: 'Desc 3', status: 'RESEARCHING', createdAt: '2026-06-03T00:00:00.000Z', updatedAt: '' },
  ];

  beforeEach(async () => {
    ideaServiceMock = {
      getIdeas: vi.fn().mockReturnValue(of(mockIdeas)),
      updateIdea: vi.fn().mockImplementation((_id, data) => of({
        ...mockIdeas[0],
        ...data,
        updatedAt: new Date().toISOString(),
      })),
    };
    toastMock = {
      info: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [KanbanBoardComponent],
      providers: [
        { provide: IdeaService, useValue: ideaServiceMock },
        { provide: ToastService, useValue: toastMock },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanBoardComponent);
    comp = fixture.componentInstance;
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should load ideas on init', () => {
    comp.ngOnInit();
    expect(ideaServiceMock.getIdeas).toHaveBeenCalled();
    expect(comp.ideas()).toHaveLength(3);
    expect(comp.isLoading()).toBe(false);
  });

  it('should filter ideas by status', () => {
    comp.ideas.set(mockIdeas);
    expect(comp.ideasByStatus('RESEARCHING')).toHaveLength(2);
    expect(comp.ideasByStatus('PLANNING')).toHaveLength(1);
    expect(comp.ideasByStatus('IN_PROGRESS')).toHaveLength(0);
  });

  it('should change status optimistically', () => {
    comp.ideas.set([...mockIdeas]);
    comp.changeStatus(mockIdeas[0], 'COMPLETED');
    expect(comp.ideas()[0].status).toBe('COMPLETED');
    expect(ideaServiceMock.updateIdea).toHaveBeenCalledWith('1', { status: 'COMPLETED' });
    expect(toastMock.info).toHaveBeenCalled();
  });

  it('should roll back on failure', () => {
    ideaServiceMock.updateIdea.mockReturnValueOnce(throwError(() => new Error('API Error')));
    comp.ideas.set([...mockIdeas]);
    comp.changeStatus(mockIdeas[0], 'COMPLETED');
    expect(toastMock.error).toHaveBeenCalled();
  });

  it('should return column colors based on status', () => {
    expect(comp.columnBorder('RESEARCHING')).toContain('violet');
    expect(comp.columnBorder('PLANNING')).toContain('amber');
    expect(comp.columnBorder('IN_PROGRESS')).toContain('sky');
    expect(comp.columnBorder('COMPLETED')).toContain('emerald');
    expect(comp.columnBorder('UNKNOWN')).toContain('slate');
  });

  it('should return column header colors', () => {
    expect(comp.columnHeader('RESEARCHING')).toContain('violet');
    expect(comp.columnHeader('PLANNING')).toContain('amber');
    expect(comp.columnHeader('IN_PROGRESS')).toContain('sky');
    expect(comp.columnHeader('COMPLETED')).toContain('emerald');
  });

  it('should return card border colors', () => {
    expect(comp.cardBorder('RESEARCHING')).toContain('violet');
    expect(comp.cardBorder('PLANNING')).toContain('amber');
    expect(comp.cardBorder('IN_PROGRESS')).toContain('sky');
    expect(comp.cardBorder('COMPLETED')).toContain('emerald');
  });
});
