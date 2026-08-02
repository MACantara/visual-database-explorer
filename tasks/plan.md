# Implementation Plan: Visual SQLite Explorer

## Overview
A single-user, Tauri-based SQLite explorer for Windows (initially). The app opens `.db` files via a native file picker, displays a schema tree, runs SQL with programmatic autocomplete, exports CSV, and renders a Mermaid ER diagram. No server, no AI, no second database engine in the MVP.

## Architecture Decisions
- Tauri + React/TypeScript, no server, no backend beyond `tauri-plugin-sql`.
- `tauri-plugin-sql` for SQLite binding; custom Rust with `rusqlite` only if the plugin blocks a feature.
- Mermaid for ER diagrams; React Flow is explicitly out of scope.
- No AI/LLM; SQL editor uses schema-aware, programmatic autocomplete.
- SQLite only; no second database engine until the core loop is excellent.

## Task List

### Phase 1: Foundation

#### Task 1: Tauri project scaffold
**Description:** Create a new Tauri project with React and TypeScript, install `tauri-plugin-sql`, and verify the dev build runs on the target Windows machine.

**Acceptance criteria:**
- [x] `tauri dev` starts the app without errors.
- [x] `tauri build` runs to completion.
- [x] `tauri-plugin-sql` is installed and accessible from the frontend.

**Verification:**
- [x] App window opens.
- [x] No build warnings that block execution.

**Dependencies:** None

**Files likely touched:**
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `package.json`
- `src/main.tsx`

**Estimated scope:** Small

#### Task 2: SQLite file picker
**Description:** Add a Tauri command that shows a native file picker, filters for `.db` and `.sqlite`, and returns the file path to the frontend.

**Acceptance criteria:**
- [ ] User can open a file picker from the UI.
- [ ] Selected file path is displayed in the app.
- [ ] Canceling the picker does not crash the app.

**Verification:**
- [ ] Manual: open a `.db` file on the local filesystem.
- [ ] Manual: cancel the picker and confirm no crash.

**Dependencies:** Task 1

**Files likely touched:**
- `src-tauri/src/lib.rs`
- `src/App.tsx`

**Estimated scope:** Small

#### Task 3: Schema introspection
**Description:** Use `tauri-plugin-sql` to load the selected SQLite file and query `sqlite_master` plus PRAGMAs to extract tables, columns, indexes, and foreign keys.

**Acceptance criteria:**
- [ ] List all tables in the database.
- [ ] For each table, list columns with type and NOT NULL status.
- [ ] For each table, list indexes and foreign keys.
- [ ] Introspection handles an empty database and a database with many tables.

**Verification:**
- [ ] Manual: compare the extracted schema for a known `.db` file against the actual schema.

**Dependencies:** Task 2

**Files likely touched:**
- `src/lib/schema.ts`
- `src-tauri/src/lib.rs`

**Estimated scope:** Medium

#### Task 4: Schema tree UI
**Description:** Render the extracted schema as an expandable tree in the left sidebar (Tables > Table > Columns/Indexes/Foreign Keys).

**Acceptance criteria:**
- [ ] Tree displays tables, columns, indexes, and foreign keys.
- [ ] Clicking a table or column shows relevant details in a pane.
- [ ] Tree updates when a new file is opened.

**Verification:**
- [ ] Manual: open a SQLite file and verify the tree matches the known schema.

**Dependencies:** Task 3

**Files likely touched:**
- `src/components/SchemaTree.tsx`
- `src/App.tsx`

**Estimated scope:** Medium

### Checkpoint: Foundation
- [ ] App opens a SQLite file and displays a correct schema tree.
- [ ] No runtime errors in the dev console.
- [ ] Review with human before proceeding.

### Phase 2: Core Features

#### Task 5: SQL editor with autocomplete
**Description:** Integrate a SQL editor (CodeMirror 6) with syntax highlighting and programmatic, schema-aware autocomplete. Suggestions come from the currently loaded schema (tables, columns, aliases) and a static SQLite keyword list.

**Acceptance criteria:**
- [ ] Editor has SQL syntax highlighting.
- [ ] Typing `SELECT * FROM ` shows a list of tables.
- [ ] Autocomplete for column names appears after a table alias is introduced.
- [ ] No external AI or LLM is used.

**Verification:**
- [ ] Manual: type sample queries and verify autocomplete suggestions.

**Dependencies:** Task 4

**Files likely touched:**
- `src/components/SqlEditor.tsx`
- `src/lib/autocomplete.ts`

**Estimated scope:** Medium

#### Task 6: Query execution and results grid
**Description:** Add the ability to run the SQL in the editor and display the result set in a sortable grid.

**Acceptance criteria:**
- [ ] User can run the editor's SQL with a button or shortcut.
- [ ] Results appear in a grid with columns matching the query output.
- [ ] Grid supports sorting for numeric and text columns.
- [ ] Query errors are shown without crashing the app.

**Verification:**
- [ ] Manual: run several SELECT, INSERT, UPDATE, and DELETE statements.
- [ ] Manual: verify sorting works on numeric and text columns.

**Dependencies:** Task 5

**Files likely touched:**
- `src/components/ResultsGrid.tsx`
- `src/lib/query.ts`

**Estimated scope:** Medium

#### Task 7: CSV export and saved queries
**Description:** Export the current result grid to CSV and save a list of recent file paths and saved queries to local storage.

**Acceptance criteria:**
- [ ] "Export to CSV" button saves a `.csv` file.
- [ ] Recent file paths persist across app restarts.
- [ ] User can save and re-run a named query from a sidebar list.

**Verification:**
- [ ] Manual: export a query result and verify it opens correctly in a spreadsheet.
- [ ] Manual: close and reopen the app and verify recent files are shown.

**Dependencies:** Task 6

**Files likely touched:**
- `src/lib/export.ts`
- `src/components/SavedQueries.tsx`
- `src/store.ts`

**Estimated scope:** Small

#### Task 8: Mermaid ER diagram
**Description:** Generate a Mermaid ER diagram from the introspected schema and render it in the UI.

**Acceptance criteria:**
- [ ] ER diagram displays all tables and their columns.
- [ ] Primary and foreign key relationships are shown.
- [ ] Diagram is exported as SVG/PNG.
- [ ] Large schemas are still readable (zoom/scroll handled by Mermaid).

**Verification:**
- [ ] Manual: open a database with multiple related tables and verify the diagram.
- [ ] Manual: export the diagram and open the image.

**Dependencies:** Task 4

**Files likely touched:**
- `src/lib/erDiagram.ts`
- `src/components/ErDiagram.tsx`

**Estimated scope:** Medium

### Checkpoint: Core Features
- [ ] User can open a database, browse the schema, run SQL with autocomplete, export CSV, and view an ER diagram.
- [ ] No critical UI freezes on a 100MB database.
- [ ] Review with human before proceeding.

### Phase 3: Polish and Ship

#### Task 9: Windows packaging and installer
**Description:** Configure the Tauri bundle for Windows, build the installer, and verify it installs and runs on the target machine.

**Acceptance criteria:**
- [ ] `tauri build` produces an `.msi` or `.exe` installer.
- [ ] Installer runs on Windows 11.
- [ ] App launches and opens a database after install.

**Verification:**
- [ ] Manual: install on the 8GB machine and smoke test all core features.

**Dependencies:** Tasks 4-8

**Files likely touched:**
- `src-tauri/tauri.conf.json`

**Estimated scope:** Small

#### Task 10: Documentation and README
**Description:** Write a README with install, build, and usage instructions. Add a short `docs/` note about the architecture and how to add a second database engine in the future.

**Acceptance criteria:**
- [ ] README explains how to install and run.
- [ ] README lists the feature set and the "Not Doing" scope.
- [ ] Architecture note exists for future contributors.

**Verification:**
- [ ] Manual: a new user can follow the README and run `tauri dev`.

**Dependencies:** Task 1

**Files likely touched:**
- `README.md`
- `docs/architecture.md`

**Estimated scope:** Small

#### Task 11: Tests and cleanup
**Description:** Add unit tests for schema introspection and CSV export, and clean up any console warnings or TODOs.

**Acceptance criteria:**
- [ ] Schema introspection has tests for at least one sample database.
- [ ] CSV export has a test for a known result set.
- [ ] No `console.log` or TODOs left in the committed code.

**Verification:**
- [ ] `npm test` or equivalent passes.
- [ ] `tauri build` completes cleanly.

**Dependencies:** Tasks 6, 7, 9

**Files likely touched:**
- `tests/schema.test.ts`
- `tests/export.test.ts`

**Estimated scope:** Medium

### Checkpoint: Complete
- [ ] Windows installer works on the target 8GB laptop.
- [ ] All core features are usable without crashes.
- [ ] README and tests are in place.
- [ ] Ready for review.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Rust/Tauri first build too slow or fails on 8GB RAM | High | Build in dev mode first, build from CLI without heavy IDE, use `--release` only for final packaging |
| `tauri-plugin-sql` cannot handle advanced introspection needs | Medium | Switch to a custom Rust command with `rusqlite` only if the plugin blocks a feature |
| SQL editor autocomplete becomes complex | Medium | Start with simple prefix matching; defer alias-resolution and subquery handling |
| Mermaid layout breaks on large or cyclic schemas | Low | Add a "simplified view" toggle that shows only tables, not all columns |

## Open Questions
- Which SQL editor library is best for CodeMirror 6 integration on a low-memory machine?
- Should saved queries be tied to a specific database file or be global?
