# Episode 2: Keeping Objects in the Know — Observer Pattern

## Key Concepts
- One-to-many dependency: when one object changes state, all dependents are notified
- Loose coupling: subjects don't need to know concrete observer details
- Push vs Pull models
- Java's Observable / Angular's EventEmitter pattern

## Diagram
- Observer pattern UML
- Weather monitoring application class diagram

## Code Example (TypeScript)
```typescript
interface Observer { update(temperature: number): void }
interface Subject {
  registerObserver(o: Observer): void
  removeObserver(o: Observer): void
  notifyObservers(): void
}

class WeatherData implements Subject {
  private observers: Observer[] = []
  private temperature = 0
  registerObserver(o: Observer) { this.observers.push(o) }
  removeObserver(o: Observer) { this.observers = this.observers.filter(v => v !== o) }
  notifyObservers() { this.observers.forEach(o => o.update(this.temperature)) }
  setMeasurements(temp: number) { this.temperature = temp; this.notifyObservers() }
}
```

## Reference
- Head First Design Patterns Ch.2
- Refactoring.Guru: https://refactoring.guru/design-patterns/observer
