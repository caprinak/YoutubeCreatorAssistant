import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { IdeaService, Idea } from './idea.service';

describe('IdeaService', () => {
  let service: IdeaService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/ideas';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdeaService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IdeaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch ideas (GET)', () => {
    const dummyIdeas: Idea[] = [
      { id: '1', title: 'Test 1', description: 'Desc 1', status: 'RESEARCHING', channelId: 'ch-1', audiencePersonaId: null, createdAt: '', updatedAt: '', persona: null, tags: [] },
      { id: '2', title: 'Test 2', description: 'Desc 2', status: 'PLANNING', channelId: 'ch-1', audiencePersonaId: null, createdAt: '', updatedAt: '', persona: null, tags: [] },
    ];

    service.getIdeas().subscribe((ideas) => {
      expect(ideas.length).toBe(2);
      expect(ideas).toEqual(dummyIdeas);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummyIdeas);
  });

  it('should fetch ideas filtered by channelId', () => {
    service.getIdeas({ channelId: 'ch-1' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}?channelId=ch-1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should create an idea (POST)', () => {
    const newIdeaInput = { title: 'New Idea', description: 'New Desc', channelId: 'ch-1', tagIds: [] };
    const createdIdea: Idea = {
      id: '3', title: 'New Idea', description: 'New Desc', status: 'RESEARCHING', channelId: 'ch-1', audiencePersonaId: null, createdAt: '', updatedAt: '', persona: null, tags: [],
    };

    service.createIdea(newIdeaInput).subscribe((idea) => {
      expect(idea).toEqual(createdIdea);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newIdeaInput);
    req.flush(createdIdea);
  });

  it('should update an idea (PUT)', () => {
    const updateInput = { title: 'Updated Title', channelId: 'ch-1' };
    const updatedIdea: Idea = {
      id: '1', title: 'Updated Title', description: 'Desc 1', status: 'RESEARCHING', channelId: 'ch-1', audiencePersonaId: null, createdAt: '', updatedAt: '', persona: null, tags: [],
    };

    service.updateIdea('1', updateInput).subscribe((idea) => {
      expect(idea).toEqual(updatedIdea);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateInput);
    req.flush(updatedIdea);
  });

  it('should delete an idea (DELETE)', () => {
    service.deleteIdea('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
