# Episode 12: Patterns of Patterns — Compound Patterns

## Key Concepts
- MVC as a compound pattern: Model (Observer), View (Composite/Strategy), Controller (Strategy)
- Combining multiple patterns to solve complex problems
- Duck simulation: Strategy + Observer + Composite + Decorator + Factory + Adapter + Iterator

## Diagram
- MVC architecture UML
- Compound duck simulator class diagram

## Code Example (TypeScript)
```typescript
// Model: Observable subject
interface Quackable {
  quack(): void
  registerObserver(o: Observer): void
}

// Decorator: count quacks
class QuackCounter implements Quackable {
  static count = 0
  constructor(private duck: Quackable) {}
  quack() { QuackCounter.count++; this.duck.quack() }
  registerObserver(o: Observer) { this.duck.registerObserver(o) }
}

// Factory: create decorated ducks
abstract class AbstractDuckFactory {
  abstract createMallardDuck(): Quackable
  abstract createRedheadDuck(): Quackable
}

// Composite: flocks
class Flock implements Quackable {
  private ducks: Quackable[] = []
  add(d: Quackable) { this.ducks.push(d) }
  quack() { this.ducks.forEach(d => d.quack()) }
  registerObserver(o: Observer) { this.ducks.forEach(d => d.registerObserver(o)) }
}
```

## Reference
- Head First Design Patterns Ch.12
