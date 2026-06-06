import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { ChannelStoreService } from './channel-store.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let app: App;
  let events$: Subject<any>;
  let mockUrl: string;

  beforeEach(async () => {
    events$ = new Subject<any>();
    mockUrl = '/channel/ch-1/ideas';

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: Router,
          useValue: {
            events: events$.asObservable(),
            get url() { return mockUrl; },
            navigate: vi.fn().mockResolvedValue(true),
            routerState: { root: {} } as any,
            createUrlTree: vi.fn(),
            serializeUrl: vi.fn(),
            parseUrl: vi.fn(),
            isActive: vi.fn(),
            navigateByUrl: vi.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ChannelStoreService,
          useValue: {
            channels: signal([{ id: 'ch-1', name: 'Test Channel', handle: '@test', niche: 'Testing', createdAt: '', updatedAt: '' }]),
            loadChannels: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should render sidebar with CreatorHub title', async () => {
    app.currentChannelId.set('ch-1');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toContain('CreatorHub');
  });

  it('should have Idea Vault, Kanban Board, and Brand Kit nav links', () => {
    app.currentChannelId.set('ch-1');
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a');
    const texts: string[] = [];
    links.forEach((a: HTMLAnchorElement) => texts.push(a.textContent?.trim() ?? ''));
    expect(texts.includes('Idea Vault')).toBe(true);
    expect(texts.includes('Kanban Board')).toBe(true);
    expect(texts.includes('Brand Kit')).toBe(true);
  });

  it('should sync channelId from NavigationEnd events', () => {
    fixture.detectChanges();
    mockUrl = '/channel/ch-2/kanban';
    events$.next(new NavigationEnd(1, '/channel/ch-2/kanban', '/channel/ch-2/kanban'));
    expect(app.currentChannelId()).toBe('ch-2');
  });
});
