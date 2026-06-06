# Episode 7: Being Adaptive — Adapter & Facade Patterns

## Key Concepts
- Adapter: convert interface of a class into another interface clients expect
- Object adapter vs class adapter
- Facade: provide a unified interface to a set of interfaces in a subsystem
- Principle of Least Knowledge (Law of Demeter)

## Diagram
- Adapter pattern UML (object adapter)
- Facade pattern UML
- Home theater facade example

## Code Example (TypeScript)
```typescript
// Adapter
interface Turkey { gobble(): void }
class WildTurkey implements Turkey { gobble() { console.log('Gobble gobble') } }

interface Duck { quack(): void }
class TurkeyAdapter implements Duck {
  constructor(private turkey: Turkey) {}
  quack() { this.turkey.gobble() }
}

// Facade
class HomeTheaterFacade {
  constructor(private amp: Amplifier, private player: StreamingPlayer) {}
  watchMovie(movie: string) {
    this.amp.on(); this.amp.setVolume(5)
    this.player.on(); this.player.play(movie)
  }
  endMovie() { this.player.off(); this.amp.off() }
}
```

## Reference
- Head First Design Patterns Ch.7
- Refactoring.Guru: https://refactoring.guru/design-patterns/adapter
- Refactoring.Guru: https://refactoring.guru/design-patterns/facade
