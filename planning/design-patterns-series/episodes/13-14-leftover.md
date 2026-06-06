# Episode 13 & 14: Leftover Patterns

## Episode 13: Builder, Prototype, Bridge

### Builder
- Separate construction of complex object from its representation
- Same construction process can create different representations
- vs Factory: Factory creates objects in one step, Builder creates in multiple steps

```typescript
class HttpRequestBuilder {
  private method = 'GET'
  private headers: Record<string, string> = {}
  setMethod(m: string) { this.method = m; return this }
  setHeader(k: string, v: string) { this.headers[k] = v; return this }
  build() { return { method: this.method, headers: this.headers } }
}
```

### Prototype
- Create new objects by copying an existing object (clone)
- Avoid costly creation, especially when initialization is expensive

### Bridge
- Decouple abstraction from implementation so they can vary independently
- "Bridge" between interface hierarchy and implementation hierarchy

## Episode 14: Chain of Responsibility, Flyweight, Visitor

### Chain of Responsibility
- Pass request along a chain of handlers until one handles it
- Example: middleware pipeline in Express.js

### Flyweight
- Share common state across many objects to save memory
- Intrinsic (shared) vs extrinsic (unique) state

### Visitor
- Represent an operation to be performed on elements of an object structure
- Lets you define a new operation without changing the classes of the elements

## Reference
- Head First Design Patterns Appendix (Ch.14)
- Refactoring.Guru: builder, prototype, bridge, chain-of-responsibility, flyweight, visitor
