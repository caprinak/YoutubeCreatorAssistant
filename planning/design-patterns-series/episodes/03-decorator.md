# Episode 3: Decorating Objects — Decorator Pattern

## Key Concepts
- Open-Closed Principle: classes open for extension, closed for modification
- Attach additional responsibilities dynamically
- Decorators have the same supertype as the objects they decorate
- Example: Java I/O streams (BufferedInputStream, GZIPInputStream)

## Diagram
- Decorator pattern UML
- Starbuzz Coffee class diagram

## Code Example (TypeScript)
```typescript
abstract class Beverage {
  abstract cost(): number
  abstract description(): string
}

class Espresso extends Beverage {
  cost() { return 1.99 }
  description() { return 'Espresso' }
}

abstract class CondimentDecorator extends Beverage {
  abstract description(): string
}

class Mocha extends CondimentDecorator {
  constructor(private beverage: Beverage) { super() }
  cost() { return this.beverage.cost() + 0.20 }
  description() { return this.beverage.description() + ', Mocha' }
}
```

## Reference
- Head First Design Patterns Ch.3
- Refactoring.Guru: https://refactoring.guru/design-patterns/decorator
