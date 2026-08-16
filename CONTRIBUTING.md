# Contributing

Use Bun.

Maintainers run:

```sh
bun i
bunx @trebired/code-discipline check
bun run typecheck
bun run build
bun run verify:pack
bun run verify:runtime
```

Generated outputs, package artifacts, temp files, and local environment files stay out of Git.

Code Discipline owns formatting, alias consistency, and source structure.
