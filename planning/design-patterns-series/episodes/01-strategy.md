# Episode 1: Welcome to Design Patterns — Strategy Pattern

## Key Concepts
- What are design patterns?
- OO Basics: Abstraction, Encapsulation, Polymorphism, Inheritance
- OO Principles: Encapsulate what varies, Favor composition over inheritance, Program to interfaces
- Strategy Pattern: Defines a family of algorithms, encapsulates each one, and makes them interchangeable

## Diagram
- Strategy pattern UML
- Duck simulation class diagram (before vs after)

## Code Example (TypeScript)
```typescript
interface FlyBehavior { fly(): void }
class FlyWithWings implements FlyBehavior { fly() { console.log('Flying!') } }
class FlyNoWay implements FlyBehavior { fly() { console.log('Can\'t fly') } }

abstract class Duck {
  constructor(protected flyBehavior: FlyBehavior) {}
  performFly() { this.flyBehavior.fly() }
  setFlyBehavior(fb: FlyBehavior) { this.flyBehavior = fb }
}

class MallardDuck extends Duck {
  constructor() { super(new FlyWithWings()) }
}
```

## Reference
- Head First Design Patterns Ch.1
- Refactoring.Guru: https://refactoring.guru/design-patterns/strategy
