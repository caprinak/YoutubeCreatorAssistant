import { TestBed, ComponentFixture } from '@angular/core/testing';
import { IdeaVaultComponent } from './idea-vault.component';
import { IdeaService, Idea, IDEA_STATUSES } from './idea.service';
import { ChannelService } from './channel.service';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('IdeaVaultComponent', () => {
  let fixture: ComponentFixture<IdeaVaultComponent>;
  let comp: IdeaVaultComponent;
  let ideaServiceMock: any;
  let channelServiceMock: any;
  let toastMock: any;
  let confirmMock: any;
  let paramMap$: BehaviorSubject<any>;

  const mockIdeas: Idea[] = [
    { id: '1', title: 'Idea 1', description: 'Desc 1', status: 'RESEARCHING', channelId: 'ch-1', audiencePersonaId: null, createdAt: '2026-06-01T00:00:00.000Z', updatedAt: '', persona: null, tags: [] },
    { id: '2', title: 'Idea 2', description: 'Desc 2', status: 'PLANNING', channelId: 'ch-1', audiencePersonaId: null, createdAt: '2026-06-02T00:00:00.000Z', updatedAt: '', persona: null, tags: [] },
  ];

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject({ get: (key: string) => key === 'channelId' ? 'ch-1' : null });

    ideaServiceMock = {
      getIdeas: vi.fn().mockReturnValue(of(mockIdeas)),
      createIdea: vi.fn().mockImplementation((idea) => of({
        id: 'new-id',
        title: idea.title,
        description: idea.description || '',
        status: idea.status || 'RESEARCHING',
        channelId: idea.channelId,
        audiencePersonaId: idea.audiencePersonaId ?? null,
        persona: null,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      updateIdea: vi.fn().mockImplementation((_id, data) => of({
        id: '1',
        title: 'Updated',
        description: 'Updated desc',
        status: 'COMPLETED',
        channelId: 'ch-1',
        audiencePersonaId: null,
        persona: null,
        tags: [],
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
      })),
      deleteIdea: vi.fn().mockReturnValue(of(undefined)),
    };
    channelServiceMock = {
      getTags: vi.fn().mockReturnValue(of([])),
      getPersonas: vi.fn().mockReturnValue(of([])),
      getChannels: vi.fn().mockReturnValue(of([])),
      createChannel: vi.fn(),
      updateChannel: vi.fn(),
      deleteChannel: vi.fn(),
      createPersona: vi.fn(),
      deletePersona: vi.fn(),
      createTag: vi.fn(),
      getBrandKit: vi.fn(),
      updateBrandKit: vi.fn(),
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
        { provide: ChannelService, useValue: channelServiceMock },
        { provide: ToastService, useValue: toastMock },
        { provide: ConfirmService, useValue: confirmMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (key: string) => key === 'channelId' ? 'ch-1' : null } }, paramMap: paramMap$.asObservable() } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IdeaVaultComponent);
    comp = fixture.componentInstance;
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should load ideas on init', () => {
    fixture.detectChanges();
    expect(ideaServiceMock.getIdeas).toHaveBeenCalledWith({ channelId: 'ch-1' });
    expect(comp.ideas()).toEqual(mockIdeas);
    expect(comp.isLoading()).toBe(false);
  });

  it('should show error on load failure', () => {
    ideaServiceMock.getIdeas.mockReturnValueOnce(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    expect(comp.loadError()).toBeTruthy();
    expect(toastMock.error).toHaveBeenCalled();
  });

  it('should open modal in create mode', () => {
    comp.openCreate();
    expect(comp.isModalOpen()).toBe(true);
    expect(comp.modalMode()).toBe('create');
    expect(comp.editingId()).toBeNull();
    expect(comp.formTitle()).toBe('');
    expect(comp.formPersonaId()).toBeNull();
    expect(comp.formTagIds()).toEqual([]);
  });

  it('should open modal in edit mode', () => {
    comp.openEdit(mockIdeas[0]);
    expect(comp.isModalOpen()).toBe(true);
    expect(comp.modalMode()).toBe('edit');
    expect(comp.editingId()).toBe('1');
    expect(comp.formTitle()).toBe('Idea 1');
    expect(comp.formPersonaId()).toBeNull();
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
      channelId: 'ch-1',
      audiencePersonaId: null,
      tagIds: [],
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
      channelId: 'ch-1',
      audiencePersonaId: null,
      tagIds: [],
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
    comp.channelId.set('ch-1');
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
    expect(ideaServiceMock.updateIdea).toHaveBeenCalledWith('1', { status: 'COMPLETED', channelId: 'ch-1' });
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
    expect(comp.statusBadge('RESEARCHING')).toContain('violet');
    expect(comp.statusBadge('PLANNING')).toContain('amber');
    expect(comp.statusBadge('IN_PROGRESS')).toContain('sky');
    expect(comp.statusBadge('COMPLETED')).toContain('emerald');
    expect(comp.statusBadge('UNKNOWN')).toContain('slate');
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
