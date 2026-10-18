# SQLite WebAssembly

Copied unmodified from `@sqlite.org/sqlite-wasm@3.53.4-build1` (npm), the official SQLite WebAssembly
build wrapped as an ES module. SQLite 3.53.4.

- SQLite itself is in the public domain: https://sqlite.org/copyright.html
- The Emscripten glue code is under the MIT and University of Illinois/NCSA licenses, as stated in the
  header of `index.mjs`.
- The npm wrapper (https://github.com/sqlite/sqlite-wasm) is Apache-2.0.

`index.mjs` (browser, used from a Web Worker with the `opfs-sahpool` VFS) and `node.mjs` (in-memory, used by
the Node unit tests) both load `sqlite3.wasm` from this folder.
