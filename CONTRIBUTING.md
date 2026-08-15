# Contributing

Issues and pull requests are welcome.

## Local setup

```sh
npm ci
npm test
```

Keep the extension deliberately small and on demand. New behavior must not run
in response to tab creation, navigation, or other background tab events unless
the project's scope is explicitly changed first.

When changing grouping behavior, add or update unit tests in `test/`. Run
`npm test` before opening a pull request and commit the rebuilt
`service-worker.js` with source changes.
