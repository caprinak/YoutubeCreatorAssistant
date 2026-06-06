import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let app: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should render sidebar with CreatorHub title', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title?.textContent).toContain('CreatorHub');
  });

  it('should have Idea Vault and Kanban Board nav links', () => {
    const links = fixture.nativeElement.querySelectorAll('a');
    const texts: string[] = [];
    links.forEach((a: HTMLAnchorElement) => texts.push(a.textContent?.trim() ?? ''));
    expect(texts.includes('Idea Vault')).toBe(true);
    expect(texts.includes('Kanban Board')).toBe(true);
  });
});
