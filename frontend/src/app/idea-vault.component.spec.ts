import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IdeaVaultComponent } from './idea-vault.component';
import { IdeaService, Idea, IDEA_STATUSES } from './idea.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('IdeaVaultComponent', () => {
  let fixture: ComponentFixture<IdeaVaultComponent>;
  let comp: IdeaVaultComponent;
  let ideaServiceMock: any;
  let toastMock: any;
  let confirmMock: any;

  const mockIdeas: Idea[] = [
    { id: '1', title: 'Idea 1', description: 'Desc 1', status: 'RESEARCHING', createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '' },
    { id: '2', title: 'Idea 2', description: 'Desc 2', status: 'PLANNING', createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '' },
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
        updatedAt: new Date().toISOString(),
      })),
      updateIdea: vi.fn().mockImplementation((_id, data) => of({
        id: '1',
        title: 'Updated',
        description: 'Updated desc',
        status: 'COMPLETED',
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      })),
      deleteIdea: vi.fn().mockReturnValue(of(undefined)),
    };
    toastMock = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };
    confirmMock = {
      confirm: vi.fn().mockResolvedValue(true),
      state: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [IdeaVaultComponent],
      providers: [
        { provide: IdeaService, useValue: ideaServiceMock },
        { provide: ToastService, useValue: toastMock },
        { provide: ConfirmService, useValue: confirmMock },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IdeaVaultComponent);
    comp = fixture.componentInstance;
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should load ideas on init', () => {
    comp.ngOnInit();
    expect(ideaServiceMock.getIdeas).toHaveBeenCalled();
    expect(comp.ideas()).toEqual(mockIdeas);
    expect(comp.isLoading()).toBe(false);
  });

  it('should show error on load failure', () => {
    ideaServiceMock.getIdeas.mockReturnValueOnce(throwError(() => new Error('API Error')));
    comp.ngOnInit();
    expect(comp.loadError()).toBeTruthy();
    expect(toastMock.error).toHaveBeenCalled();
  });

  it('should open modal in create mode', () => {
    comp.openCreate();
    expect(comp.isModalOpen()).toBe(true);
    expect(comp.modalMode()).toBe('create');
    expect(comp.editingId()).toBeNull();
    expect(comp.formTitle()).toBe('');
  });

  it('should open modal in edit mode', () => {
    comp.openEdit(mockIdeas[0]);
    expect(comp.isModalOpen()).toBe(true);
    expect(comp.modalMode()).toBe('edit');
    expect(comp.editingId()).toBe('1');
    expect(comp.formTitle()).toBe('Idea 1');
  });

  it('should close modal', () => {
    comp.openCreate();
    comp.closeModal();
    expect(comp.isModalOpen()).toBe(false);
    expect(comp.editingId()).toBeNull();
  });

  it('should create a new idea', () => {
    comp.openCreate();
    comp.formTitle.set('New');
    comp.formDescription.set('Desc');
    comp.save();

    expect(ideaServiceMock.createIdea).toHaveBeenCalledWith({
      title: 'New',
      description: 'Desc',
      status: 'RESEARCHING',
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(comp.isModalOpen()).toBe(false);
  });

  it('should not save with empty title', () => {
    comp.openCreate();
    comp.formTitle.set('   ');
    comp.save();
    expect(ideaServiceMock.createIdea).not.toHaveBeenCalled();
    expect(comp.modalError()).toBe('Please fix the highlighted fields.');
  });

  it('should update an existing idea', () => {
    comp.openEdit(mockIdeas[0]);
    comp.formTitle.set('Updated Title');
    comp.formStatus.set('COMPLETED');
    comp.save();

    expect(ideaServiceMock.updateIdea).toHaveBeenCalledWith('1', {
      title: 'Updated Title',
      description: 'Desc 1',
      status: 'COMPLETED',
    });
    expect(toastMock.success).toHaveBeenCalledWith('Idea updated.');
    expect(comp.isModalOpen()).toBe(false);
  });

  it('should delete with confirmation', async () => {
    confirmMock.confirm.mockResolvedValue(true);
    comp.ideas.set([...mockIdeas]);
    await comp.deleteIdea(mockIdeas[0]);
    expect(confirmMock.confirm).toHaveBeenCalled();
    expect(ideaServiceMock.deleteIdea).toHaveBeenCalledWith('1');
    expect(comp.ideas()).toHaveLength(1);
    expect(toastMock.success).toHaveBeenCalled();
  });

  it('should not delete if cancelled', async () => {
    confirmMock.confirm.mockResolvedValue(false);
    await comp.deleteIdea(mockIdeas[0]);
    expect(ideaServiceMock.deleteIdea).not.toHaveBeenCalled();
  });

  it('should log error on create failure', () => {
    ideaServiceMock.createIdea.mockReturnValueOnce(throwError(() => new Error('Create Error')));
    comp.openCreate();
    comp.formTitle.set('New');
    comp.save();
    expect(comp.modalError()).toBe('Could not save the idea.');
  });

  it('should change status optimistically', () => {
    comp.ideas.set([...mockIdeas]);
    comp.changeStatus(mockIdeas[0], 'COMPLETED');
    expect(comp.ideas()[0].status).toBe('COMPLETED');
    expect(ideaServiceMock.updateIdea).toHaveBeenCalledWith('1', { status: 'COMPLETED' });
  });

  it('should roll back on status change failure', () => {
    ideaServiceMock.updateIdea.mockReturnValueOnce(throwError(() => new Error('API Error')));
    comp.ideas.set([...mockIdeas]);
    comp.changeStatus(mockIdeas[0], 'COMPLETED');
    expect(toastMock.error).toHaveBeenCalledWith('Could not update status.');
  });

  it('should track by id', () => {
    expect(comp.trackById(0, mockIdeas[0])).toBe('1');
  });

  it('should return status CSS classes', () => {
    expect(comp.statusClass('RESEARCHING')).toContain('violet');
    expect(comp.statusClass('PLANNING')).toContain('amber');
    expect(comp.statusClass('IN_PROGRESS')).toContain('sky');
    expect(comp.statusClass('COMPLETED')).toContain('emerald');
    expect(comp.statusClass('UNKNOWN')).toContain('slate');
  });

  it('should validate title required', () => {
    comp.formTitle.set('');
    expect(comp.titleError()).toBe('Title is required.');
  });

  it('should validate title max length', () => {
    comp.formTitle.set('a'.repeat(201));
    expect(comp.titleError()).toContain('200');
  });

  it('should validate description max length', () => {
    comp.formDescription.set('a'.repeat(5001));
    expect(comp.descriptionError()).toContain('5000');
  });
});
