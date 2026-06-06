import 'dotenv/config';
import { PrismaClient } from './prisma/generated/client.ts';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const UPLOADS_DIR = path.resolve(import.meta.dirname, 'uploads', 'assets', 'images');
const CHANNEL_HANDLE = '@eduverse';

interface EpisodeDef {
  episodeNumber: number
  title: string
  description: string
  content: string
  diagramName: string
  diagramSvg: string
}

const EPISODES: EpisodeDef[] = [
  {
    episodeNumber: 1,
    title: 'Welcome to Design Patterns — The Strategy Pattern',
    description: 'An introduction to design patterns, OO design principles, and the Strategy pattern.',
    content: `## What Are Design Patterns?

Design patterns are proven, reusable solutions to common software design problems. They are not code — they are templates for how to solve problems in different contexts.

## OO Design Principles

1. **Encapsulate what varies** — isolate the parts that change often
2. **Favor composition over inheritance** — behavior is more flexible when composed
3. **Program to interfaces, not implementations** — depend on abstractions

## Strategy Pattern

**Intent:** Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

### Duck Simulator Example

Instead of putting fly/quack behaviors directly in Duck subclasses (leading to code duplication), we *compose* behaviors:

\`\`\`typescript
interface FlyBehavior { fly(): void }
class FlyWithWings implements FlyBehavior {
  fly() { console.log('Flying with wings!') }
}
class FlyNoWay implements FlyBehavior {
  fly() { console.log('I cannot fly') }
}

abstract class Duck {
  constructor(protected flyBehavior: FlyBehavior) {}
  performFly() { this.flyBehavior.fly() }
}
\`\`\`

### When to Use Strategy
- You have related classes that differ only in behavior
- You need different variants of an algorithm
- A class uses many conditional statements around related behavior

**Diagram:** Refer to the Strategy Pattern UML diagram asset below.`,
    diagramName: 'Strategy Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="380" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Strategy Pattern</text>
  <rect x="200" y="50" width="200" height="80" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="220" y="70" fill="#93c5fd" font-weight="bold">«abstract» Duck</text>
  <line x1="200" y1="78" x2="400" y2="78" stroke="#334155" stroke-width="1"/>
  <text x="210" y="95" fill="#e2e8f0">-flyBehavior: FlyBehavior</text>
  <text x="210" y="115" fill="#e2e8f0">+performFly(): void</text>
  <line x1="250" y1="130" x2="250" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow-white)"/>
  <rect x="230" y="170" width="160" height="50" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="240" y="190" fill="#d8b4fe" font-weight="bold">MallardDuck</text>
  <line x1="230" y1="198" x2="390" y2="198" stroke="#334155" stroke-width="1"/>
  <text x="240" y="212" fill="#e2e8f0">+MallardDuck()</text>
  <line x1="480" y1="90" x2="480" y2="130" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow-white)"/>
  <text x="440" y="115" fill="#94a3b8" font-size="10">«interface»</text>
  <rect x="410" y="130" width="180" height="50" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="420" y="148" fill="#93c5fd" font-weight="bold">«interface» FlyBehavior</text>
  <line x1="410" y1="156" x2="590" y2="156" stroke="#334155" stroke-width="1"/>
  <text x="420" y="172" fill="#e2e8f0">+fly(): void</text>
  <defs><marker id="arrow-white" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="370" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.1 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 2,
    title: 'Keeping Your Objects in the Know — The Observer Pattern',
    description: 'One-to-many dependency management and the Observer pattern for event-driven systems.',
    content: `## Observer Pattern

**Intent:** Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

### Key Design Principle
**Strive for loosely coupled designs between objects that interact.** Loose coupling allows us to build flexible OO systems that can handle change.

### Weather Station Example

\`\`\`typescript
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
  removeObserver(o: Observer) {
    this.observers = this.observers.filter(v => v !== o)
  }
  notifyObservers() {
    this.observers.forEach(o => o.update(this.temperature))
  }
  setMeasurements(temp: number) {
    this.temperature = temp
    this.notifyObservers()
  }
}
\`\`\`

### Real-World Uses
- **Event listeners** in UIs
- **RxJS Observables** in Angular
- **Pub/Sub** messaging systems
- **WebSocket** event handling

### Push vs Pull
- *Push:* Subject sends detailed data to observers
- *Pull:* Observers request what they need from the subject

**Diagram:** Refer to the Observer Pattern UML diagram asset below.`,
    diagramName: 'Observer Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="380" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Observer Pattern</text>
  <rect x="30" y="50" width="200" height="70" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="40" y="68" fill="#93c5fd" font-weight="bold">«interface» Subject</text>
  <line x1="30" y1="76" x2="230" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="40" y="92" fill="#e2e8f0" font-size="10">+registerObserver(o)</text>
  <text x="40" y="107" fill="#e2e8f0" font-size="10">+removeObserver(o)</text>
  <text x="40" y="122" fill="#e2e8f0" font-size="10">+notifyObservers()</text>
  <line x1="130" y1="120" x2="130" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <rect x="30" y="170" width="200" height="70" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="188" fill="#d8b4fe" font-weight="bold">WeatherData</text>
  <line x1="30" y1="196" x2="230" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="40" y="212" fill="#e2e8f0" font-size="10">+registerObserver(o)</text>
  <text x="40" y="227" fill="#e2e8f0" font-size="10">+notifyObservers()</text>
  <text x="40" y="242" fill="#e2e8f0" font-size="10">+setMeasurements(temp)</text>
  <rect x="320" y="50" width="220" height="70" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="330" y="68" fill="#93c5fd" font-weight="bold">«interface» Observer</text>
  <line x1="320" y1="76" x2="540" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="330" y="92" fill="#e2e8f0" font-size="10">+update(temperature)</text>
  <rect x="320" y="170" width="220" height="70" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="330" y="188" fill="#93c5fd" font-weight="bold">CurrentConditionsDisplay</text>
  <line x1="320" y1="196" x2="540" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="330" y="212" fill="#e2e8f0" font-size="10">+update(temperature)</text>
  <text x="330" y="227" fill="#e2e8f0" font-size="10">+display()</text>
  <line x1="430" y1="120" x2="430" y2="170" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow2)"/>
  <line x1="230" y1="200" x2="320" y2="200" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow2)"/>
  <text x="245" y="193" fill="#94a3b8" font-size="10">notifies</text>
  <defs><marker id="arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="370" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.2 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 3,
    title: 'Decorating Objects — The Decorator Pattern',
    description: 'Dynamic behavior extension using the Decorator pattern and the Open-Closed Principle.',
    content: `## Decorator Pattern

**Intent:** Attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.

### Open-Closed Principle
Classes should be **open for extension, but closed for modification.** Decorators let you add new behavior without changing existing code.

### Starbuzz Coffee Example

\`\`\`typescript
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

// Usage
let beverage: Beverage = new Espresso()
beverage = new Mocha(beverage)   // wraps
beverage = new Mocha(beverage)   // wraps again
console.log(beverage.description()) // "Espresso, Mocha, Mocha"
console.log(beverage.cost())        // 2.39
\`\`\`

### Real-World Examples
- **Java I/O Streams:** \`new BufferedInputStream(new FileInputStream("file.txt"))\`
- **Middleware/pipe** patterns
- **Express.js** middleware chain

**Diagram:** Refer to the Decorator Pattern UML diagram asset below.`,
    diagramName: 'Decorator Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="380" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Decorator Pattern</text>
  <rect x="180" y="50" width="220" height="70" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="190" y="68" fill="#93c5fd" font-weight="bold">«abstract» Beverage</text>
  <line x1="180" y1="76" x2="400" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="190" y="95" fill="#e2e8f0">+cost(): double</text>
  <text x="190" y="112" fill="#e2e8f0">+description(): String</text>
  <line x1="250" y1="120" x2="200" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow3)"/>
  <rect x="30" y="170" width="180" height="60" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="188" fill="#d8b4fe" font-weight="bold">Espresso</text>
  <line x1="30" y1="196" x2="210" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="40" y="215" fill="#e2e8f0">cost(): 1.99</text>
  <line x1="350" y1="120" x2="380" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow3)"/>
  <rect x="260" y="170" width="230" height="80" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="270" y="188" fill="#d8b4fe" font-weight="bold">«abstract» CondimentDecorator</text>
  <line x1="260" y1="196" x2="490" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="270" y="215" fill="#e2e8f0">-beverage: Beverage</text>
  <text x="270" y="235" fill="#e2e8f0">+description(): String</text>
  <line x1="310" y1="250" x2="280" y2="300" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow3)"/>
  <rect x="100" y="300" width="200" height="55" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="110" y="318" fill="#93c5fd" font-weight="bold">Mocha</text>
  <line x1="100" y1="326" x2="300" y2="326" stroke="#334155" stroke-width="1"/>
  <text x="110" y="343" fill="#e2e8f0">cost(): bev.cost() + 0.20</text>
  <line x1="420" y1="250" x2="450" y2="300" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow3)"/>
  <rect x="340" y="300" width="200" height="55" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="350" y="318" fill="#93c5fd" font-weight="bold">Whip</text>
  <line x1="340" y1="326" x2="540" y2="326" stroke="#334155" stroke-width="1"/>
  <text x="350" y="343" fill="#e2e8f0">cost(): bev.cost() + 0.10</text>
  <defs><marker id="arrow3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="370" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.3 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 4,
    title: 'Baking with OO Goodness — The Factory Patterns',
    description: 'Factory Method and Abstract Factory patterns for flexible object creation.',
    content: `## Factory Pattern

**Intent:** Define an interface for creating an object, but let subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to subclasses.

### Dependency Inversion Principle
**Depend on abstractions, not concrete classes.** Our high-level components should not depend on our low-level components — both should depend on abstractions.

### Factory Method Example

\`\`\`typescript
abstract class PizzaStore {
  orderPizza(type: string): Pizza {
    const pizza = this.createPizza(type)
    pizza.prepare()
    pizza.bake()
    pizza.cut()
    pizza.box()
    return pizza
  }
  protected abstract createPizza(type: string): Pizza
}

class NYPizzaStore extends PizzaStore {
  createPizza(type: string): Pizza {
    switch(type) {
      case 'cheese': return new NYStyleCheesePizza()
      case 'pepperoni': return new NYStylePepperoniPizza()
      default: throw new Error('Unknown pizza type')
    }
  }
}
\`\`\`

### Abstract Factory
Creates **families** of related products without specifying their concrete classes. For example, a GUI factory that creates OS-appropriate buttons, menus, and windows.

**Diagram:** Refer to the Factory Pattern UML diagram asset below.`,
    diagramName: 'Factory Method & Abstract Factory UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="380" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Factory Method Pattern</text>
  <rect x="150" y="50" width="200" height="70" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="160" y="68" fill="#93c5fd" font-weight="bold">«abstract» PizzaStore</text>
  <line x1="150" y1="76" x2="350" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="160" y="95" fill="#e2e8f0" font-size="10">+orderPizza(type)</text>
  <text x="160" y="112" fill="#e2e8f0" font-size="10">#createPizza(type): Pizza</text>
  <line x1="250" y1="120" x2="200" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow4)"/>
  <rect x="30" y="170" width="190" height="60" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="188" fill="#d8b4fe" font-weight="bold">NYPizzaStore</text>
  <line x1="30" y1="196" x2="220" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="40" y="215" fill="#e2e8f0" font-size="10">createPizza(type): Pizza</text>
  <line x1="320" y1="120" x2="380" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow4)"/>
  <rect x="250" y="170" width="200" height="60" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="260" y="188" fill="#d8b4fe" font-weight="bold">ChicagoPizzaStore</text>
  <line x1="250" y1="196" x2="450" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="260" y="215" fill="#e2e8f0" font-size="10">createPizza(type): Pizza</text>
  <rect x="150" y="270" width="200" height="60" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="160" y="288" fill="#93c5fd" font-weight="bold">«interface» Pizza</text>
  <line x1="150" y1="296" x2="350" y2="296" stroke="#334155" stroke-width="1"/>
  <text x="160" y="315" fill="#e2e8f0" font-size="10">prepare() | bake() | cut() | box()</text>
  <line x1="250" y1="230" x2="250" y2="270" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow4)"/>
  <defs><marker id="arrow4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="370" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.4 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 5,
    title: 'One-of-a-Kind Objects — The Singleton Pattern',
    description: 'Ensuring a class has only one instance with the Singleton pattern.',
    content: `## Singleton Pattern

**Intent:** Ensure a class has only one instance, and provide a global point of access to it.

### Basic Singleton in TypeScript

\`\`\`typescript
class Singleton {
  private static instance: Singleton | null = null
  private constructor() {}

  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton()
    }
    return Singleton.instance
  }
}
\`\`\`

### Thread Safety Considerations
In multi-threaded environments, the naive implementation above can create multiple instances. Solutions:
- **Eager instantiation:** Create instance when class loads (if overhead is acceptable)
- **Double-checked locking:** Check, synchronize, check again
- **Static inner class:** Use class loading mechanism for lazy thread-safe init

### When to Use Singleton
- Exactly one instance is needed (e.g., thread pool, cache, logging, configuration manager)
- Controlled access to a shared resource

### Criticism / Alternatives
Singleton can introduce global state and make testing difficult. Consider dependency injection as an alternative.

**Diagram:** Refer to the Singleton Pattern UML diagram asset below.`,
    diagramName: 'Singleton Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="380" height="230" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Singleton Pattern</text>
  <rect x="100" y="60" width="200" height="120" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="130" y="80" fill="#d8b4fe" font-weight="bold" font-size="14">Singleton</text>
  <line x1="100" y1="88" x2="300" y2="88" stroke="#334155" stroke-width="1"/>
  <text x="110" y="108" fill="#e2e8f0">-static instance: Singleton</text>
  <line x1="100" y1="116" x2="300" y2="116" stroke="#334155" stroke-width="1"/>
  <text x="110" y="136" fill="#e2e8f0">-Singleton()</text>
  <text x="110" y="156" fill="#e2e8f0" text-decoration="underline">+static getInstance(): Singleton</text>
  <line x1="300" y1="120" x2="350" y2="120" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow5)"/>
  <text x="310" y="112" fill="#94a3b8" font-size="10">returns</text>
  <circle cx="365" cy="120" r="15" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="361" y="125" fill="#93c5fd" font-size="14" font-weight="bold">1</text>
  <defs><marker id="arrow5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="220" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.5 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 6,
    title: 'Encapsulating Invocation — The Command Pattern',
    description: 'Encapsulating requests as objects with the Command pattern for undoable operations and queues.',
    content: `## Command Pattern

**Intent:** Encapsulate a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations.

### Remote Control Example

\`\`\`typescript
interface Command {
  execute(): void
  undo(): void
}

class LightOnCommand implements Command {
  constructor(private light: Light) {}
  execute() { this.light.on() }
  undo() { this.light.off() }
}

class RemoteControl {
  private commands: Command[] = []
  private undoStack: Command[] = []

  setCommand(slot: number, cmd: Command) {
    this.commands[slot] = cmd
  }
  pressButton(slot: number) {
    this.commands[slot]?.execute()
    this.undoStack.push(this.commands[slot])
  }
  pressUndo() {
    this.undoStack.pop()?.undo()
  }
}
\`\`\`

### Use Cases
- **GUI buttons and menu items** — each button is a Command
- **Macro recording** — record a sequence of commands
- **Task queues / thread pools** — commands run by worker threads
- **Transactional behavior** — commit/rollback via execute/undo

**Diagram:** Refer to the Command Pattern UML diagram asset below.`,
    diagramName: 'Command Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="380" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Command Pattern</text>
  <rect x="30" y="50" width="180" height="80" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="40" y="68" fill="#93c5fd" font-weight="bold">Invoker</text>
  <line x1="30" y1="76" x2="210" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="40" y="95" fill="#e2e8f0" font-size="10">-command: Command</text>
  <text x="40" y="115" fill="#e2e8f0" font-size="10">+pressButton(): void</text>
  <line x1="120" y1="130" x2="120" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow6)"/>
  <rect x="30" y="170" width="180" height="60" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="188" fill="#d8b4fe" font-weight="bold">ConcreteCommand</text>
  <line x1="30" y1="196" x2="210" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="40" y="215" fill="#e2e8f0" font-size="10">+execute() | +undo()</text>
  <rect x="290" y="50" width="200" height="80" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="300" y="68" fill="#93c5fd" font-weight="bold">«interface» Command</text>
  <line x1="290" y1="76" x2="490" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="300" y="95" fill="#e2e8f0" font-size="10">+execute(): void</text>
  <text x="300" y="115" fill="#e2e8f0" font-size="10">+undo(): void</text>
  <line x1="390" y1="130" x2="390" y2="170" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow6)"/>
  <rect x="290" y="170" width="200" height="50" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="300" y="188" fill="#93c5fd" font-weight="bold">Receiver</text>
  <line x1="290" y1="196" x2="490" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="300" y="212" fill="#e2e8f0" font-size="10">+action(): void</text>
  <line x1="210" y1="200" x2="290" y2="200" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow6)"/>
  <text x="220" y="193" fill="#94a3b8" font-size="10">calls</text>
  <defs><marker id="arrow6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="370" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.6 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 7,
    title: 'Being Adaptive — The Adapter & Facade Patterns',
    description: 'Making incompatible interfaces work together with Adapter, and simplifying subsystems with Facade.',
    content: `## Adapter Pattern

**Intent:** Convert the interface of a class into another interface clients expect. Adapter lets classes work together that couldn't otherwise because of incompatible interfaces.

### Turkey-to-Duck Adapter

\`\`\`typescript
interface Duck { quack(): void; fly(): void }
interface Turkey { gobble(): void; flyShortDistance(): void }

class WildTurkey implements Turkey {
  gobble() { console.log('Gobble gobble') }
  flyShortDistance() { console.log('Flies a short distance') }
}

class TurkeyAdapter implements Duck {
  constructor(private turkey: Turkey) {}
  quack() { this.turkey.gobble() }
  fly() {
    for (let i = 0; i < 5; i++) this.turkey.flyShortDistance()
  }
}
\`\`\`

## Facade Pattern

**Intent:** Provide a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use.

### Principle of Least Knowledge (Law of Demeter)
Only talk to your immediate friends. Don't reach into objects to call deep methods.

\`\`\`typescript
class HomeTheaterFacade {
  constructor(
    private amp: Amplifier,
    private player: StreamingPlayer,
    private projector: Projector,
    private lights: TheaterLights
  ) {}
  watchMovie(movie: string) {
    this.lights.dim(10)
    this.projector.on()
    this.amp.on(); this.amp.setVolume(5)
    this.player.on(); this.player.play(movie)
  }
  endMovie() {
    this.player.off()
    this.amp.off()
    this.projector.off()
    this.lights.on()
  }
}
\`\`\`

**Diagram:** Refer to the Adapter & Facade Pattern UML diagram asset below.`,
    diagramName: 'Adapter & Facade Patterns UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="360" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Adapter Pattern (Object Adapter)</text>
  <rect x="30" y="50" width="180" height="60" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="40" y="68" fill="#93c5fd" font-weight="bold">«interface» Duck</text>
  <line x1="30" y1="76" x2="210" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="40" y="95" fill="#e2e8f0" font-size="10">+quack() | +fly()</text>
  <line x1="120" y1="110" x2="120" y2="150" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow7)"/>
  <rect x="30" y="150" width="180" height="70" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="168" fill="#d8b4fe" font-weight="bold">TurkeyAdapter</text>
  <line x1="30" y1="176" x2="210" y2="176" stroke="#334155" stroke-width="1"/>
  <text x="40" y="195" fill="#e2e8f0" font-size="10">-turkey: Turkey</text>
  <text x="40" y="212" fill="#e2e8f0" font-size="10">+quack() { turkey.gobble() }</text>
  <rect x="290" y="50" width="200" height="60" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="300" y="68" fill="#93c5fd" font-weight="bold">«interface» Turkey</text>
  <line x1="290" y1="76" x2="490" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="300" y="95" fill="#e2e8f0" font-size="10">+gobble() | +flyShort()</text>
  <line x1="390" y1="110" x2="390" y2="150" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow7)"/>
  <rect x="310" y="150" width="170" height="50" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="320" y="168" fill="#93c5fd" font-weight="bold">WildTurkey</text>
  <line x1="310" y1="176" x2="480" y2="176" stroke="#334155" stroke-width="1"/>
  <text x="320" y="192" fill="#e2e8f0" font-size="10">+gobble() | +flyShort()</text>
  <line x1="210" y1="185" x2="310" y2="185" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow7)"/>
  <text x="225" y="178" fill="#94a3b8" font-size="10">delegates</text>
  <defs><marker id="arrow7" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="350" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.7 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 8,
    title: 'Encapsulating Algorithms — The Template Method Pattern',
    description: 'Defining algorithm skeletons with the Template Method pattern and the Hollywood Principle.',
    content: `## Template Method Pattern

**Intent:** Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.

### Hollywood Principle
**Don't call us, we'll call you.** Low-level components hook into the system, but the high-level component determines when they are needed.

### Caffeine Beverage Example

\`\`\`typescript
abstract class CaffeineBeverage {
  // Template method — defines the algorithm
  prepareRecipe(): void {
    this.boilWater()
    this.brew()
    this.pourInCup()
    if (this.customerWantsCondiments()) {
      this.addCondiments()
    }
  }

  protected abstract brew(): void
  protected abstract addCondiments(): void

  // Hook — subclasses can override but don't have to
  protected customerWantsCondiments(): boolean { return true }

  private boilWater() { console.log('Boiling water') }
  private pourInCup() { console.log('Pouring into cup') }
}

class Coffee extends CaffeineBeverage {
  brew() { console.log('Dripping coffee through filter') }
  addCondiments() { console.log('Adding sugar and milk') }
  // Override hook: ask user if they want condiments
}
\`\`\`

### Design Principle
The Template Method pattern is a classic example of the **Hollywood Principle**. It's also a great example of **inversion of control** — the framework calls you, not the other way around.

**Diagram:** Refer to the Template Method Pattern UML diagram asset below.`,
    diagramName: 'Template Method Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="330" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Template Method Pattern</text>
  <rect x="100" y="50" width="350" height="100" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="110" y="68" fill="#93c5fd" font-weight="bold">«abstract» CaffeineBeverage</text>
  <line x1="100" y1="76" x2="450" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="110" y="92" fill="#e2e8f0" font-size="10">+prepareRecipe(): void  «template method»</text>
  <text x="110" y="107" fill="#e2e8f0" font-size="10">#abstract brew(): void</text>
  <text x="110" y="122" fill="#e2e8f0" font-size="10">#abstract addCondiments(): void</text>
  <text x="110" y="137" fill="#e2e8f0" font-size="10">#customerWantsCondiments(): boolean  «hook»</text>
  <line x1="200" y1="150" x2="160" y2="200" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow8)"/>
  <line x1="350" y1="150" x2="400" y2="200" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow8)"/>
  <rect x="30" y="200" width="200" height="80" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="218" fill="#d8b4fe" font-weight="bold">Coffee</text>
  <line x1="30" y1="226" x2="230" y2="226" stroke="#334155" stroke-width="1"/>
  <text x="40" y="245" fill="#e2e8f0" font-size="10">brew(): "Dripping..."</text>
  <text x="40" y="262" fill="#e2e8f0" font-size="10">addCondiments(): "Adding..."</text>
  <rect x="310" y="200" width="220" height="80" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="320" y="218" fill="#d8b4fe" font-weight="bold">Tea</text>
  <line x1="310" y1="226" x2="530" y2="226" stroke="#334155" stroke-width="1"/>
  <text x="320" y="245" fill="#e2e8f0" font-size="10">brew(): "Steeping..."</text>
  <text x="320" y="262" fill="#e2e8f0" font-size="10">addCondiments(): "Adding lemon..."</text>
  <defs><marker id="arrow8" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="325" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.8 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 9,
    title: 'Well-Managed Collections — The Iterator & Composite Patterns',
    description: 'Traversing collections without exposing internals, and building tree structures with uniform access.',
    content: `## Iterator Pattern

**Intent:** Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.

### Single Responsibility Principle
A class should have only **one reason to change.** By moving iteration logic out of your collection, you keep each class focused.

## Composite Pattern

**Intent:** Compose objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions uniformly.

### Menu Example

\`\`\`typescript
// Component — uniform interface for both leaves and composites
abstract class MenuComponent {
  add(c: MenuComponent) { throw new Error('Unsupported') }
  remove(c: MenuComponent) { throw new Error('Unsupported') }
  getName(): string { throw new Error('Unsupported') }
  print(): void { throw new Error('Unsupported') }
}

// Leaf
class MenuItem extends MenuComponent {
  constructor(private name: string, private price: number) { super() }
  getName() { return this.name }
  print() { console.log(\`  \${this.name} — $\${this.price}\`) }
}

// Composite
class Menu extends MenuComponent {
  private components: MenuComponent[] = []
  constructor(private name: string) { super() }
  add(c: MenuComponent) { this.components.push(c) }
  getName() { return this.name }
  print() {
    console.log(\`\n=== \${this.name} ===\`)
    this.components.forEach(c => c.print())
  }
}

const menu = new Menu('All Menus')
menu.add(new MenuItem('Pancakes', 9.99))
menu.add(new MenuItem('Waffles', 11.99))
menu.print()
\`\`\`

**Diagram:** Refer to the Iterator & Composite Pattern UML diagram asset below.`,
    diagramName: 'Iterator & Composite Patterns UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="360" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Composite Pattern</text>
  <rect x="160" y="50" width="250" height="80" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="170" y="68" fill="#93c5fd" font-weight="bold">«abstract» MenuComponent</text>
  <line x1="160" y1="76" x2="410" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="170" y="95" fill="#e2e8f0" font-size="10">+add() | +remove() | +getName() | +print()</text>
  <line x1="230" y1="130" x2="180" y2="180" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow9)"/>
  <rect x="30" y="180" width="200" height="70" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="198" fill="#d8b4fe" font-weight="bold">MenuItem (Leaf)</text>
  <line x1="30" y1="206" x2="230" y2="206" stroke="#334155" stroke-width="1"/>
  <text x="40" y="225" fill="#e2e8f0" font-size="10">+print(): "\`  name — $price\`"</text>
  <line x1="340" y1="130" x2="390" y2="180" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow9)"/>
  <rect x="280" y="180" width="220" height="70" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="290" y="198" fill="#d8b4fe" font-weight="bold">Menu (Composite)</text>
  <line x1="280" y1="206" x2="500" y2="206" stroke="#334155" stroke-width="1"/>
  <text x="290" y="225" fill="#e2e8f0" font-size="10">-components: MenuComponent[]</text>
  <text x="290" y="242" fill="#e2e8f0" font-size="10">+add(c) | +print()</text>
  <line x1="340" y1="250" x2="340" y2="290" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow9)"/>
  <circle cx="340" cy="310" r="15" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1"/>
  <text x="337" y="315" fill="#93c5fd" font-size="12">*</text>
  <defs><marker id="arrow9" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="350" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.9 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 10,
    title: 'The State of Things — The State Pattern',
    description: 'Allowing an object to change its behavior when its internal state changes.',
    content: `## State Pattern

**Intent:** Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.

### Gumball Machine Example

\`\`\`typescript
interface State {
  insertQuarter(): void
  turnCrank(): void
  dispense(): void
}

class GumballMachine {
  private state: State

  constructor(private count: number) {
    this.state = count > 0
      ? new NoQuarterState(this)
      : new SoldOutState(this)
  }

  setState(s: State) { this.state = s }
  insertQuarter() { this.state.insertQuarter() }
  turnCrank() { this.state.turnCrank(); this.state.dispense() }
}

class NoQuarterState implements State {
  constructor(private m: GumballMachine) {}
  insertQuarter() {
    console.log('Quarter inserted')
    this.m.setState(new HasQuarterState(this.m))
  }
  turnCrank() { console.log('Insert quarter first') }
  dispense() { console.log('Insert quarter first') }
}

class HasQuarterState implements State {
  constructor(private m: GumballMachine) {}
  insertQuarter() { console.log('Already has a quarter') }
  turnCrank() { console.log('Crank turned...'); this.m.setState(new SoldState(this.m)) }
  dispense() { console.log('No gumball dispensed') }
}

class SoldState implements State {
  constructor(private m: GumballMachine) {}
  insertQuarter() { console.log('Please wait...') }
  turnCrank() { console.log('Already turning...') }
  dispense() {
    console.log('A gumball rolls out!')
    this.m.setState(new NoQuarterState(this.m))
  }
}
\`\`\`

### State vs Strategy
- **State:** State changes behavior based on internal state transitions
- **Strategy:** Client sets the algorithm; it rarely changes

**Diagram:** Refer to the State Pattern UML diagram asset below.`,
    diagramName: 'State Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="380" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">State Pattern</text>
  <rect x="30" y="50" width="200" height="80" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="40" y="68" fill="#93c5fd" font-weight="bold">GumballMachine (Context)</text>
  <line x1="30" y1="76" x2="230" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="40" y="95" fill="#e2e8f0" font-size="10">-state: State</text>
  <text x="40" y="115" fill="#e2e8f0" font-size="10">+insertQuarter() | +turnCrank()</text>
  <line x1="130" y1="130" x2="130" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow10)"/>
  <rect x="280" y="50" width="200" height="80" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="290" y="68" fill="#93c5fd" font-weight="bold">«interface» State</text>
  <line x1="280" y1="76" x2="480" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="290" y="95" fill="#e2e8f0" font-size="10">+insertQuarter()</text>
  <text x="290" y="110" fill="#e2e8f0" font-size="10">+turnCrank()</text>
  <text x="290" y="125" fill="#e2e8f0" font-size="10">+dispense()</text>
  <line x1="380" y1="130" x2="380" y2="170" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow10)"/>
  <rect x="30" y="170" width="170" height="50" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="188" fill="#d8b4fe" font-weight="bold">NoQuarterState</text>
  <line x1="30" y1="196" x2="200" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="40" y="210" fill="#e2e8f0" font-size="10">→ HasQuarterState</text>
  <line x1="210" y1="195" x2="280" y2="195" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow10)"/>
  <rect x="280" y="170" width="170" height="50" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="290" y="188" fill="#d8b4fe" font-weight="bold">HasQuarterState</text>
  <line x1="280" y1="196" x2="450" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="290" y="210" fill="#e2e8f0" font-size="10">→ SoldState</text>
  <rect x="30" y="250" width="170" height="50" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="268" fill="#d8b4fe" font-weight="bold">SoldState</text>
  <line x1="30" y1="276" x2="200" y2="276" stroke="#334155" stroke-width="1"/>
  <text x="40" y="290" fill="#e2e8f0" font-size="10">→ NoQuarterState</text>
  <rect x="280" y="250" width="170" height="50" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="290" y="268" fill="#d8b4fe" font-weight="bold">SoldOutState</text>
  <defs><marker id="arrow10" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="370" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.10 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 11,
    title: 'Controlling Object Access — The Proxy Pattern',
    description: 'Using proxy objects to control access, add lazy loading, and implement protection.',
    content: `## Proxy Pattern

**Intent:** Provide a surrogate or placeholder for another object to control access to it.

### Types of Proxy
1. **Remote Proxy** — local representative for a remote object
2. **Virtual Proxy** — delays creation of expensive objects until needed
3. **Protection Proxy** — controls access based on permissions
4. **Cache Proxy** — stores recent results to avoid repeated computation

### Virtual Proxy Example

\`\`\`typescript
interface Image {
  display(): void
}

class RealImage implements Image {
  constructor(private filename: string) {
    this.loadFromDisk()  // expensive
  }
  private loadFromDisk() {
    console.log(\`Loading \${this.filename} from disk...\`)
  }
  display() { console.log(\`Displaying \${this.filename}\`) }
}

class ProxyImage implements Image {
  private realImage: RealImage | null = null
  constructor(private filename: string) {}
  display() {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename)  // lazy load
    }
    this.realImage.display()
  }
}
\`\`\`

### Proxy vs Decorator
Both use composition, but:
- **Decorator** adds behavior dynamically
- **Proxy** controls access

**Diagram:** Refer to the Proxy Pattern UML diagram asset below.`,
    diagramName: 'Proxy Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="330" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Proxy Pattern</text>
  <rect x="30" y="50" width="180" height="60" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="40" y="68" fill="#93c5fd" font-weight="bold">Client</text>
  <line x1="120" y1="110" x2="120" y2="150" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow11)"/>
  <rect x="30" y="150" width="180" height="70" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="168" fill="#d8b4fe" font-weight="bold">ProxyImage</text>
  <line x1="30" y1="176" x2="210" y2="176" stroke="#334155" stroke-width="1"/>
  <text x="40" y="195" fill="#e2e8f0" font-size="10">-realImage: RealImage</text>
  <text x="40" y="212" fill="#e2e8f0" font-size="10">+display()</text>
  <line x1="210" y1="185" x2="280" y2="185" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow11)"/>
  <rect x="280" y="150" width="200" height="70" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="290" y="168" fill="#93c5fd" font-weight="bold">RealImage</text>
  <line x1="280" y1="176" x2="480" y2="176" stroke="#334155" stroke-width="1"/>
  <text x="290" y="195" fill="#e2e8f0" font-size="10">+display()</text>
  <text x="290" y="212" fill="#e2e8f0" font-size="10">+loadFromDisk()</text>
  <rect x="280" y="50" width="200" height="60" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="290" y="68" fill="#93c5fd" font-weight="bold">«interface» Image</text>
  <line x1="280" y1="76" x2="480" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="290" y="95" fill="#e2e8f0" font-size="10">+display(): void</text>
  <line x1="380" y1="110" x2="380" y2="150" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow11)"/>
  <defs><marker id="arrow11" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="325" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.11 | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 12,
    title: 'Patterns of Patterns — Compound Patterns & MVC',
    description: 'Combining multiple patterns into a cohesive architecture with Model-View-Controller.',
    content: `## Compound Patterns

**Intent:** Combine multiple design patterns to solve complex problems. MVC is the canonical compound pattern.

### MVC Architecture

MVC is a compound of several patterns working together:

| Component | Role | Pattern(s) Used |
|-----------|------|-----------------|
| **Model** | Data + business logic | **Observer** — notifies views of state changes |
| **View** | UI rendering | **Composite** — nests UI components, **Strategy** — delegates to controller |
| **Controller** | User input handling | **Strategy** — interchangeable controller per view |

### Duck Simulator (Compound)

\`\`\`typescript
// 1. Strategy — quack behaviors
interface Quackable { quack(): void }

// 2. Decorator — count quacks
class QuackCounter implements Quackable {
  static count = 0
  constructor(private duck: Quackable) {}
  quack() { QuackCounter.count++; this.duck.quack() }
}

// 3. Factory — create instrumented ducks
abstract class AbstractDuckFactory {
  abstract createMallardDuck(): Quackable
}

class CountingDuckFactory extends AbstractDuckFactory {
  createMallardDuck() { return new QuackCounter(new MallardDuck()) }
}

// 4. Composite — manage flocks
class Flock implements Quackable {
  private ducks: Quackable[] = []
  add(d: Quackable) { this.ducks.push(d) }
  quack() { this.ducks.forEach(d => d.quack()) }
}

// 5. Observer — monitor quacks
interface Observer { update(duck: Quackable): void }
class Quackologist implements Observer {
  update(duck: Quackable) { console.log('Quack observed!') }
}
\`\`\`

**Diagram:** Refer to the Compound Patterns UML diagram asset below.`,
    diagramName: 'Compound Patterns (MVC) UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="360" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">MVC as Compound Pattern</text>
  <rect x="30" y="80" width="170" height="70" fill="#3b1f4e" stroke="#a855f7" stroke-width="2" rx="4"/>
  <text x="40" y="100" fill="#d8b4fe" font-weight="bold" font-size="13">MODEL</text>
  <line x1="30" y1="108" x2="200" y2="108" stroke="#334155" stroke-width="1"/>
  <text x="40" y="125" fill="#e2e8f0" font-size="9">Data + Business Logic</text>
  <text x="40" y="140" fill="#93c5fd" font-size="9">Pattern: Observer (Subject)</text>
  <rect x="380" y="80" width="170" height="70" fill="#3b1f4e" stroke="#a855f7" stroke-width="2" rx="4"/>
  <text x="390" y="100" fill="#d8b4fe" font-weight="bold" font-size="13">VIEW</text>
  <line x1="380" y1="108" x2="550" y2="108" stroke="#334155" stroke-width="1"/>
  <text x="390" y="125" fill="#e2e8f0" font-size="9">UI Rendering</text>
  <text x="390" y="140" fill="#93c5fd" font-size="9">Pattern: Composite + Strategy</text>
  <rect x="180" y="260" width="170" height="70" fill="#3b1f4e" stroke="#a855f7" stroke-width="2" rx="4"/>
  <text x="190" y="280" fill="#d8b4fe" font-weight="bold" font-size="13">CONTROLLER</text>
  <line x1="180" y1="288" x2="350" y2="288" stroke="#334155" stroke-width="1"/>
  <text x="190" y="305" fill="#e2e8f0" font-size="9">User Input Handling</text>
  <text x="190" y="320" fill="#93c5fd" font-size="9">Pattern: Strategy</text>
  <line x1="200" y1="115" x2="380" y2="115" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow12)"/>
  <text x="260" y="108" fill="#94a3b8" font-size="10">Observer (notifies)</text>
  <line x1="380" y1="130" x2="200" y2="130" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow12b)"/>
  <text x="245" y="140" fill="#94a3b8" font-size="10">requests data</text>
  <line x1="265" y1="150" x2="265" y2="260" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow12)"/>
  <text x="275" y="200" fill="#94a3b8" font-size="10">user action</text>
  <line x1="350" y1="295" x2="380" y2="130" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow12b)"/>
  <text x="335" y="215" fill="#94a3b8" font-size="10">updates model</text>
  <defs>
    <marker id="arrow12" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker>
    <marker id="arrow12b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/></marker>
  </defs>
  <text x="20" y="355" fill="#64748b" font-size="10">Reference: Head First Design Patterns Ch.12</text>
</svg>`,
  },
  {
    episodeNumber: 13,
    title: 'Leftover Patterns I — Builder, Prototype, Bridge',
    description: 'Builder for step-by-step construction, Prototype for cloning, Bridge for separating abstraction from implementation.',
    content: `## Builder Pattern

**Intent:** Separate the construction of a complex object from its representation so that the same construction process can create different representations.

\`\`\`typescript
class HttpRequest {
  constructor(
    public method: string,
    public url: string,
    public headers: Record<string, string>,
    public body?: string
  ) {}
}

class HttpRequestBuilder {
  private method = 'GET'
  private url = '/'
  private headers: Record<string, string> = {}
  private body?: string

  setMethod(m: string) { this.method = m; return this }
  setUrl(u: string) { this.url = u; return this }
  setHeader(k: string, v: string) { this.headers[k] = v; return this }
  setBody(b: string) { this.body = b; return this }
  build() { return new HttpRequest(this.method, this.url, this.headers, this.body) }
}
\`\`\`

## Prototype Pattern

**Intent:** Specify the kinds of objects to create using a prototypical instance, and create new objects by copying this prototype.

Useful when object creation is expensive (e.g., database queries, complex configurations).

## Bridge Pattern

**Intent:** Decouple an abstraction from its implementation so that the two can vary independently.

\`\`\`typescript
interface Device { turnOn(): void; turnOff(): void; setVolume(vol: number): void }

class TV implements Device { /* ... */ }
class Radio implements Device { /* ... */ }

class RemoteControl {
  constructor(protected device: Device) {}
  togglePower() { /* calls device.turnOn/turnOff */ }
}
class AdvancedRemoteControl extends RemoteControl {
  mute() { this.device.setVolume(0) }
}
\`\`\`

**Diagram:** Refer to the Builder Pattern UML diagram asset below.`,
    diagramName: 'Builder Pattern UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="330" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Builder Pattern</text>
  <rect x="30" y="50" width="200" height="80" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="40" y="68" fill="#93c5fd" font-weight="bold">HttpRequestBuilder</text>
  <line x1="30" y1="76" x2="230" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="40" y="95" fill="#e2e8f0" font-size="10">+setMethod(m): Builder</text>
  <text x="40" y="112" fill="#e2e8f0" font-size="10">+setUrl(u): Builder</text>
  <text x="40" y="127" fill="#e2e8f0" font-size="10">+build(): HttpRequest</text>
  <line x1="130" y1="130" x2="130" y2="170" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow13)"/>
  <rect x="30" y="170" width="200" height="60" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="188" fill="#d8b4fe" font-weight="bold">«creates» HttpRequest</text>
  <line x1="30" y1="196" x2="230" y2="196" stroke="#334155" stroke-width="1"/>
  <text x="40" y="215" fill="#e2e8f0" font-size="10">-method | -url | -headers | -body</text>
  <rect x="310" y="50" width="200" height="50" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="320" y="68" fill="#93c5fd" font-weight="bold">Director</text>
  <line x1="310" y1="76" x2="510" y2="76" stroke="#334155" stroke-width="1"/>
  <text x="320" y="92" fill="#e2e8f0" font-size="10">+construct(builder)</text>
  <line x1="310" y1="100" x2="230" y2="100" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow13)"/>
  <text x="250" y="95" fill="#94a3b8" font-size="10">uses</text>
  <defs><marker id="arrow13" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
  <text x="20" y="325" fill="#64748b" font-size="10">Reference: Head First Design Patterns Appendix | Refactoring.Guru</text>
</svg>`,
  },
  {
    episodeNumber: 14,
    title: 'Leftover Patterns II — Chain of Responsibility, Flyweight, Visitor',
    description: 'Handler chains, memory-efficient object sharing, and double-dispatch operations.',
    content: `## Chain of Responsibility

**Intent:** Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request. Chain the receiving objects and pass the request along the chain until an object handles it.

### Express.js Middleware — Real-World Example
Every middleware function is a handler in the chain. If it can't handle the request, it calls \`next()\` to pass it on.

\`\`\`typescript
interface Handler {
  setNext(h: Handler): Handler
  handle(request: string): string | null
}

abstract class AbstractHandler implements Handler {
  private next: Handler | null = null
  setNext(h: Handler): Handler { this.next = h; return h }
  handle(request: string): string | null {
    if (this.next) return this.next.handle(request)
    return null
  }
}

class AuthHandler extends AbstractHandler {
  handle(request: string): string | null {
    if (request.startsWith('authed:')) return 'Authenticated!'
    return super.handle(request)
  }
}

class LoggingHandler extends AbstractHandler {
  handle(request: string): string | null {
    console.log(\`Request: \${request}\`)
    return super.handle(request)
  }
}
\`\`\`

## Flyweight Pattern
**Intent:** Use sharing to support large numbers of fine-grained objects efficiently.

**Intrinsic state** (shared): the same across all instances (e.g., character glyph data)
**Extrinsic state** (unique): varies per instance (e.g., position on screen)

### Use Case
Text editors: each character doesn't need its own font object; share font references.

## Visitor Pattern
**Intent:** Represent an operation to be performed on the elements of an object structure. Visitor lets you define a new operation without changing the classes of the elements it operates on.

**Double dispatch:** the operation executed depends on both the type of Visitor and the type of Element.

**Diagram:** Refer to the Chain of Responsibility UML diagram asset below.`,
    diagramName: 'Chain of Responsibility UML',
    diagramSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" font-family="Monaco, monospace" font-size="12">
  <rect x="10" y="10" width="580" height="330" fill="#1e293b" rx="8"/>
  <text x="20" y="35" fill="#f59e0b" font-weight="bold" font-size="14">Chain of Responsibility Pattern</text>
  <rect x="30" y="80" width="120" height="40" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5" rx="4"/>
  <text x="40" y="100" fill="#93c5fd" font-weight="bold" font-size="11">Client</text>
  <line x1="90" y1="120" x2="90" y2="150" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow14)"/>
  <rect x="30" y="150" width="120" height="50" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="40" y="168" fill="#d8b4fe" font-weight="bold" font-size="11">Handler A</text>
  <line x1="30" y1="176" x2="150" y2="176" stroke="#334155" stroke-width="1"/>
  <text x="40" y="192" fill="#e2e8f0" font-size="9">+handle()</text>
  <line x1="150" y1="175" x2="220" y2="175" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow14)"/>
  <rect x="220" y="150" width="120" height="50" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="230" y="168" fill="#d8b4fe" font-weight="bold" font-size="11">Handler B</text>
  <line x1="220" y1="176" x2="340" y2="176" stroke="#334155" stroke-width="1"/>
  <text x="230" y="192" fill="#e2e8f0" font-size="9">+handle()</text>
  <line x1="340" y1="175" x2="410" y2="175" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow14)"/>
  <rect x="410" y="150" width="120" height="50" fill="#3b1f4e" stroke="#a855f7" stroke-width="1.5" rx="4"/>
  <text x="420" y="168" fill="#d8b4fe" font-weight="bold" font-size="11">Handler C</text>
  <line x1="410" y1="176" x2="530" y2="176" stroke="#334155" stroke-width="1"/>
  <text x="420" y="192" fill="#e2e8f0" font-size="9">+handle()</text>
  <text x="160" y="215" fill="#94a3b8" font-size="10">request flows →</text>
  <text x="20" y="320" fill="#64748b" font-size="10">Reference: Head First Design Patterns Appendix | Refactoring.Guru</text>
  <defs><marker id="arrow14" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/></marker></defs>
</svg>`,
  },
];

async function seed() {
  const channel = await prisma.channel.findFirst({ where: { handle: CHANNEL_HANDLE } });
  if (!channel) {
    console.error(`Channel "${CHANNEL_HANDLE}" not found. Run "npx tsx seed.ts" first.`);
    process.exit(1);
  }
  console.log(`Using channel: ${channel.name} (${channel.id})`);

  const existing = await prisma.series.findFirst({
    where: { channelId: channel.id, title: { contains: 'Design Patterns' } },
  });
  if (existing) {
    console.log(`Series "${existing.title}" already exists. Skipping.`);
    await prisma.$disconnect();
    return;
  }

  const series = await prisma.series.create({
    data: {
      channelId: channel.id,
      title: 'Head First Design Patterns — Complete Video Series',
      description: 'A comprehensive video series covering all 23 GoF design patterns with TypeScript examples, UML diagrams, and real-world applications. Based on the Head First Design Patterns 2nd Edition.',
      sourceType: 'BOOK',
      sourceName: 'Head First Design Patterns, 2nd Edition (Freeman & Robson)',
    },
  });
  console.log(`\n✓ Series created: "${series.title}"`);

  const diagramAssets: { episodeNumber: number; assetId: string }[] = [];

  for (const ep of EPISODES) {
    const filename = `diagram-${String(ep.episodeNumber).padStart(2, '0')}-${randomUUID()}.svg`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, ep.diagramSvg, 'utf-8');
    const relativeUrl = `/uploads/assets/images/${filename}`;

    const asset = await prisma.asset.create({
      data: {
        name: ep.diagramName,
        type: 'DIAGRAM',
        url: relativeUrl,
        sizeBytes: Buffer.byteLength(ep.diagramSvg),
        mimeType: 'image/svg+xml',
        isShared: true,
        channelId: channel.id,
      },
    });
    diagramAssets.push({ episodeNumber: ep.episodeNumber, assetId: asset.id });
    console.log(`  ✓ Asset: "${ep.diagramName}" → ${relativeUrl}`);
  }

  for (const ep of EPISODES) {
    const diagramAsset = diagramAssets.find((d) => d.episodeNumber === ep.episodeNumber);
    const diagramRef = diagramAsset
      ? `\n\n---\n**📐 Diagram:**\n\n{{ asset:${diagramAsset.assetId} }}`
      : '';

    const episode = await prisma.episode.create({
      data: {
        seriesId: series.id,
        episodeNumber: ep.episodeNumber,
        title: ep.title,
        description: ep.description,
        content: ep.content + diagramRef,
        status: 'DRAFT',
        ...(diagramAsset && { assets: { connect: { id: diagramAsset.assetId } } })
      },
    });
    console.log(`  ✓ Episode ${ep.episodeNumber}: "${ep.title}"`);
  }

  console.log(`\n✓ Seeded ${EPISODES.length} episodes with ${diagramAssets.length} diagram assets.`);
  console.log(`Series ID: ${series.id}`);
  console.log('Run: visit /channel/:channelId/series/:seriesId in the frontend to view.');
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
