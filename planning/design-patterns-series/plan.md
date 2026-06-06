# Design Patterns Video Series

## Source
**Book:** Head First Design Patterns, 2nd Edition (Freeman & Robson, 2020)
**Online:** Refactoring.Guru, O'Reilly Learning

## Structure
14 episodes covering GoF patterns + OO design principles.

## Episodes

| # | Title | Pattern(s) | Est. Length |
|---|-------|-----------|-------------|
| 1 | Welcome to Design Patterns | Strategy Pattern + OO Principles | 20 min |
| 2 | Keeping Objects in the Know | Observer Pattern | 18 min |
| 3 | Decorating Objects | Decorator Pattern | 18 min |
| 4 | Baking with OO Goodness | Factory Method + Simple Factory | 22 min |
| 5 | One-of-a-Kind Objects | Singleton Pattern | 15 min |
| 6 | Encapsulating Invocation | Command Pattern | 20 min |
| 7 | Being Adaptive | Adapter + Facade Patterns | 20 min |
| 8 | Encapsulating Algorithms | Template Method Pattern | 18 min |
| 9 | Well-Managed Collections | Iterator + Composite Patterns | 22 min |
| 10 | The State of Things | State Pattern | 18 min |
| 11 | Controlling Object Access | Proxy Pattern | 20 min |
| 12 | Patterns of Patterns | Compound Patterns (MVC) | 22 min |
| 13 | Leftover Patterns I | Builder, Prototype, Bridge | 20 min |
| 14 | Leftover Patterns II | Chain of Resp, Flyweight, Visitor | 20 min |

## Diagram Sources
- Refactoring.Guru — CC BY-SA 4.0 UML diagrams
- takaakit/uml-diagram-for-java-design-pattern-examples — CC0 licensed SVGs
- Head First book illustrations (reference only)

## Asset Types Used
- DIAGRAM — UML diagrams for each pattern (self-hosted SVGs)
- IMAGE — Book illustrations, screenshots
- VIDEO — (future) recorded episodes

## Seed Script
**File:** `backend/seed-design-patterns.ts`
**Run:** `npm run seed:patterns`

What it does:
1. Finds the `@eduverse` channel (Education)
2. Creates the "Head First Design Patterns" series
3. Generates 14 inline SVG diagram files → saves to `uploads/assets/images/` as DIAGRAM assets
4. Creates 14 episodes with full TypeScript code examples, pattern descriptions, and diagram references
5. Episodes include: Strategy, Observer, Decorator, Factory, Singleton, Command, Adapter/Facade, Template Method, Iterator/Composite, State, Proxy, Compound/MVC, Builder/Prototype/Bridge, Chain of Resp/Flyweight/Visitor

**Planning materials:** `planning/design-patterns-series/episodes/*.md`
