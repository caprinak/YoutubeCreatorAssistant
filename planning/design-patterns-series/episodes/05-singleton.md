# Episode 5: One-of-a-Kind Objects — Singleton Pattern

## Key Concepts
- Ensure a class has only one instance and provide a global point of access
- Lazy vs eager initialization
- Thread safety concerns
- Double-checked locking

## Diagram
- Singleton pattern UML

## Code Example (TypeScript)
```typescript
class Singleton {
  private static instance: Singleton
  private constructor() {}
  static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton()
    return Singleton.instance
  }
}
```

## Reference
- Head First Design Patterns Ch.5
- Refactoring.Guru: https://refactoring.guru/design-patterns/singleton
