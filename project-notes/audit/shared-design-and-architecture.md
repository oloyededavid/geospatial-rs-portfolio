# Shared design and architecture: Stage 1 findings

## Stylesheets today

| Item | FloodScope | AgroSignal | GeoValidate | City Twins |
|---|---|---|---|---|
| Base stylesheet | `css/dash.css`, 248 lines | the same file | the same file | portfolio `styles.css` |
| Identical copies? | md5 `f88587e6…` in all three repositories: identical today | | | n/a |
| Tool-specific CSS | `floodscope.css`, 15 lines | inline in `index.html` | `geovalidate.css`, 30 lines | portfolio styles plus twin rules |
| Accent | blue `#1f5fbf` (dash.css default) | green `#3d7a1f` (inline `:root`) | orange `#b4530a` (inline `:root`) | red and ink dots on the card |
| Neutrals | cool grey: canvas `#f4f5f7`, ink `#15181c`, ink-2 `#4a525c` | same | same | warm grey: `#f4f4f2`, ink `#141412`, ink-2 `#55544e` |
| Type | Satoshi text, Zodiak display (bundled in each repository, 72 KB) | same | same | Satoshi, Zodiak, plus Newsreader (headings) and Geist Mono (labels) |
| Map library | MapLibre GL, vendored, 803 KB | same | same | none (canvas, EOX tiles) |

The three tools share one stylesheet by copying it. Nothing checks that the copies stay identical; one edit in one repository will drift silently. The portfolio, which hosts City Twins, has its own tokens with a different neutral palette and two more typefaces.

## Recommended approach (simplest maintainable)

1. **One source of truth**: `dash.css` lives in the portfolio repository (it already hosts the shared fonts and City Twins) under a versioned path, for example `shared/dash.css`, with a short header naming its version.
2. **Copies stay in each tool repository** (GitHub Pages serves each repository separately; loading CSS across origins at runtime would make every tool depend on the portfolio's deployment).
3. **One check, no build system**: a small script (`tools/check_shared.sh` or a Node script) compares each tool's copy with the source by hash and fails if they differ; run it locally and in each repository's existing test command. A sync script copies the source into the tools.
4. **Tokens, not components, are shared with City Twins**: neutrals, ink, rule colours, type scale and control styles align with the portfolio tokens, so City Twins and the tools read as one family without forcing City Twins into the rail-and-panel layout.

No package manager, bundler or CSS framework is needed for this.

## Cross-tool discovery

None of the three tools links to the others or to City Twins; each has only "Back to portfolio". City Twins has the portfolio's top navigation. Recommendation: one shared "Tools" switcher in the top bar of all four (same markup and order), each entry with a one-line purpose.

## Examples

Each tool has exactly one fixed example, three of them in Nigeria (Lokoja, Kano, and City Twins' default Lagos pairing; GeoValidate's sample is Kenya). The behaviour differs: GeoValidate "Run example" and FloodScope "Lokoja example" run the analysis; AgroSignal "Kano example" only fills in the form and waits for "Run analysis". No tool offers user-triggered random examples. Requirement from the original brief: globally relevant, user-triggered, validated random examples.

## The "Quiet Precision" direction

The name comes from the original brief; its written definition was not recovered and is not in any repository. A working definition is proposed in the consolidated audit for approval rather than assumed.

## Performance facts

| Tool | Repository (without .git) | Of which data | Heavy first-use download |
|---|---|---|---|
| FloodScope | 147 MB | 143 MB (GHS-POP tiles, read by HTTP range, not downloaded whole) | none beyond requested tiles |
| AgroSignal | 121 MB | 115 MB (CHIRPS 0.2° archive, read by range) | none beyond requested ranges |
| GeoValidate | 4.2 MB | 0.8 MB | Pyodide and packages, about 36 MB, once per browser cache |
| City Twins | in portfolio | `cities.json` | satellite tiles for the two discs |

Measured times on this machine: page usable in 2.7–3.1 s for all four (local server; GitHub Pages adds network latency). GeoValidate engine ready in 11 s on first use; FloodScope Lokoja chain 34 s; GeoValidate comparison 14 s, sweep 34 s.
