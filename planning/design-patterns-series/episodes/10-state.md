# Episode 10: The State of Things — State Pattern

## Key Concepts
- Allow an object to alter its behavior when its internal state changes
- Object appears to change its class
- State transitions can be managed by Context or State classes
- State vs Strategy: both use composition, but State changes behavior based on internal state

## Diagram
- State pattern UML
- Gumball machine class diagram

## Code Example (TypeScript)
```typescript
interface State {
  insertQuarter(): void
  turnCrank(): void
  dispense(): void
}

class GumballMachine {
  constructor(private count: number) {
    this.state = count > 0 ? new NoQuarterState(this) : new SoldOutState(this)
  }
  state: State
  setState(s: State) { this.state = s }
  insertQuarter() { this.state.insertQuarter() }
  turnCrank() { this.state.turnCrank(); this.state.dispense() }
}

class NoQuarterState implements State {
  constructor(private machine: GumballMachine) {}
  insertQuarter() { console.log('Quarter inserted'); this.machine.setState(new HasQuarterState(this.machine)) }
  turnCrank() { console.log('No quarter') }
  dispense() { console.log('Insert quarter first') }
}

class HasQuarterState implements State {
  constructor(private machine: GumballMachine) {}
  insertQuarter() { console.log('Already has quarter') }
  turnCrank() { console.log('Crank turned'); this.machine.setState(new SoldState(this.machine)) }
  dispense() { console.log('No gumball dispensed') }
}

class SoldState implements State {
  constructor(private machine: GumballMachine) {}
  insertQuarter() { console.log('Please wait') }
  turnCrank() { console.log('Already turning') }
  dispense() { console.log('Dispensing...') }
}
```

## Reference
- Head First Design Patterns Ch.10
- Refactoring.Guru: https://refactoring.guru/design-patterns/state
