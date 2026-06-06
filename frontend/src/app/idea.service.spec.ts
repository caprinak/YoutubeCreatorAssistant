import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { IdeaService, Idea } from './idea.service';

describe('IdeaService', () => {
  let service: IdeaService;
  let httpMock: HttpTestingController;
  const apiBase = '/api/ideas';

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
      { id: '1', title: 'Test 1', description: 'Desc 1', status: 'RESEARCHING', createdAt: '', updatedAt: '' },
      { id: '2', title: 'Test 2', description: 'Desc 2', status: 'PLANNING', createdAt: '', updatedAt: '' },
    ];

    service.getIdeas().subscribe((ideas) => {
      expect(ideas.length).toBe(2);
      expect(ideas).toEqual(dummyIdeas);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/ideas`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyIdeas);
  });

  it('should create an idea (POST)', () => {
    const newIdeaInput = { title: 'New Idea', description: 'New Desc' };
    const createdIdea: Idea = {
      id: '3', title: 'New Idea', description: 'New Desc', status: 'RESEARCHING', createdAt: '', updatedAt: '',
    };

    service.createIdea(newIdeaInput).subscribe((idea) => {
      expect(idea).toEqual(createdIdea);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/ideas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newIdeaInput);
    req.flush(createdIdea);
  });

  it('should update an idea (PUT)', () => {
    const updateInput = { title: 'Updated Title' };
    const updatedIdea: Idea = {
      id: '1', title: 'Updated Title', description: 'Desc 1', status: 'RESEARCHING', createdAt: '', updatedAt: '',
    };

    service.updateIdea('1', updateInput).subscribe((idea) => {
      expect(idea).toEqual(updatedIdea);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/ideas/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateInput);
    req.flush(updatedIdea);
  });

  it('should delete an idea (DELETE)', () => {
    service.deleteIdea('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/ideas/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
