# Episode 8: Encapsulating Algorithms — Template Method Pattern

## Key Concepts
- Define skeleton of an algorithm in a method, deferring steps to subclasses
- Hollywood Principle: Don't call us, we'll call you
- Hook methods: optional overridable steps
- Example: Arrays.sort(), JUnit's setUp/tearDown

## Diagram
- Template Method UML
- Caffeine beverage class diagram

## Code Example (TypeScript)
```typescript
abstract class CaffeineBeverage {
  prepareRecipe() {
    this.boilWater()
    this.brew()
    this.pourInCup()
    if (this.customerWantsCondiments()) this.addCondiments()
  }
  abstract brew(): void
  abstract addCondiments(): void
  customerWantsCondiments(): boolean { return true } // hook
  private boilWater() { console.log('Boiling water') }
  private pourInCup() { console.log('Pouring into cup') }
}

class Coffee extends CaffeineBeverage {
  brew() { console.log('Dripping coffee through filter') }
  addCondiments() { console.log('Adding sugar and milk') }
}
```

## Reference
- Head First Design Patterns Ch.8
- Refactoring.Guru: https://refactoring.guru/design-patterns/template-method
