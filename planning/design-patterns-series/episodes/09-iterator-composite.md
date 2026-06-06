# Episode 9: Well-Managed Collections — Iterator & Composite Patterns

## Key Concepts
- Iterator: provide a way to access elements of an aggregate object sequentially without exposing its underlying representation
- Single Responsibility Principle: a class should have only one reason to change
- Composite: compose objects into tree structures to represent part-whole hierarchies
- Clients treat individual objects and compositions uniformly

## Diagram
- Iterator pattern UML
- Composite pattern UML
- Menu tree example

## Code Example (TypeScript)
```typescript
// Iterator
interface Iterator<T> { hasNext(): boolean; next(): T }
class ArrayIterator<T> implements Iterator<T> {
  private index = 0
  constructor(private items: T[]) {}
  hasNext() { return this.index < this.items.length }
  next() { return this.items[this.index++] }
}

// Composite
abstract class MenuComponent {
  add(c: MenuComponent) { throw new Error('Unsupported') }
  getName(): string { throw new Error('Unsupported') }
  print() { throw new Error('Unsupported') }
}

class MenuItem extends MenuComponent {
  constructor(private name: string) { super() }
  getName() { return this.name }
  print() { console.log(`  ${this.name}`) }
}

class Menu extends MenuComponent {
  private items: MenuComponent[] = []
  constructor(private name: string) { super() }
  add(c: MenuComponent) { this.items.push(c) }
  getName() { return this.name }
  print() {
    console.log(this.name)
    this.items.forEach(i => i.print())
  }
}
```

## Reference
- Head First Design Patterns Ch.9
- Refactoring.Guru: https://refactoring.guru/design-patterns/iterator
- Refactoring.Guru: https://refactoring.guru/design-patterns/composite
