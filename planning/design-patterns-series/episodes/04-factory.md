# Episode 4: Baking with OO Goodness — Factory Patterns

## Key Concepts
- Simple Factory (idiom, not a GoF pattern)
- Factory Method: define an interface for creating an object, let subclasses decide which class to instantiate
- Dependency Inversion Principle: depend on abstractions, not concretions
- Abstract Factory: create families of related products

## Diagram
- Factory Method UML
- Abstract Factory UML
- Pizza store class diagram

## Code Example (TypeScript)
```typescript
// Factory Method
abstract class PizzaStore {
  orderPizza(type: string): Pizza {
    const pizza = this.createPizza(type)
    pizza.prepare(); pizza.bake(); pizza.cut(); pizza.box()
    return pizza
  }
  protected abstract createPizza(type: string): Pizza
}

class NYPizzaStore extends PizzaStore {
  createPizza(type: string): Pizza {
    return type === 'cheese' ? new NYStyleCheesePizza() : new NYStylePepperoniPizza()
  }
}
```

## Reference
- Head First Design Patterns Ch.4
- Refactoring.Guru: https://refactoring.guru/design-patterns/factory-method
- Refactoring.Guru: https://refactoring.guru/design-patterns/abstract-factory
