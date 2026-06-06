# Episode 6: Encapsulating Invocation — Command Pattern

## Key Concepts
- Encapsulate a request as an object
- Parameterize clients with different requests
- Queue or log requests, support undoable operations
- Example: Remote control buttons, menu items, thread pools

## Diagram
- Command pattern UML
- Remote control class diagram

## Code Example (TypeScript)
```typescript
interface Command { execute(): void; undo(): void }

class LightOnCommand implements Command {
  constructor(private light: Light) {}
  execute() { this.light.on() }
  undo() { this.light.off() }
}

class RemoteControl {
  private slot: Command | null = null
  setCommand(cmd: Command) { this.slot = cmd }
  pressButton() { this.slot?.execute() }
}
```

## Reference
- Head First Design Patterns Ch.6
- Refactoring.Guru: https://refactoring.guru/design-patterns/command
