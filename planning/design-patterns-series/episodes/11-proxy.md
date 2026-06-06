# Episode 11: Controlling Object Access — Proxy Pattern

## Key Concepts
- Provide a surrogate or placeholder for another object to control access to it
- Types: remote proxy, virtual proxy, protection proxy, cache proxy
- Proxy vs Decorator: proxy controls access, decorator adds behavior

## Diagram
- Proxy pattern UML
- Virtual proxy: image loading example

## Code Example (TypeScript)
```typescript
interface Image {
  display(): void
}

class RealImage implements Image {
  constructor(private filename: string) { this.loadFromDisk() }
  private loadFromDisk() { console.log(`Loading ${this.filename}`) }
  display() { console.log(`Displaying ${this.filename}`) }
}

class ProxyImage implements Image {
  private realImage: RealImage | null = null
  constructor(private filename: string) {}
  display() {
    if (!this.realImage) this.realImage = new RealImage(this.filename)
    this.realImage.display()
  }
}
```

## Reference
- Head First Design Patterns Ch.11
- Refactoring.Guru: https://refactoring.guru/design-patterns/proxy
