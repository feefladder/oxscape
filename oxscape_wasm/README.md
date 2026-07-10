## Wasm bindings for oxscape!

This currently revolves around a simulation and is made to have [this demo](https://feefladder.github.io/oxscape) online. It may considerably change in the future when tile-based approaches are implemented native-side. They have far more io-bound work and also the multithreading part, so that's interesting

Therefore, code in this sub-crate should be considered _experimental_ and may change without further notice. Until tile-based approaches make it here, then it'll stabilize.

### Running tests

This sub-crate has both rust and wasm tests. A normal `cargo test` will test only rust tests, whereas

```
wasm-pack test --firefox
```

will test wasm tests as well in firefox.
