# AGENTS.md

A Cursor plugin marketplace containing one plugin, `caffeine`, which connects Cursor to the Caffeine MCP server.

## Validate

After changing the plugin or marketplace manifest, run the structure check:

```bash
node scripts/validate-template.mjs
```

It validates `.cursor-plugin/marketplace.json`, each plugin's `.cursor-plugin/plugin.json`, the YAML frontmatter of every `rules/`, `commands/`, `agents/`, and `skills/SKILL.md` file, and any `mcp.json`. It exits non-zero on error. Run it from the repository root — paths are resolved against the current working directory.

To check that the MCP server in `plugins/caffeine/mcp.json` is reachable and its OAuth discovery chain is intact (no credentials needed, stops before sign-in):

```bash
node scripts/verify-mcp.mjs
```

There is no build, test, lint, or format tooling, and no CI workflow in this repository. Both scripts require Node.js with ES module support and use only the standard library.

## Layout

- `plugins/caffeine/` — the published plugin. `rules/` (`.mdc`), `commands/` and `skills/` (each `SKILL.md`) all require YAML frontmatter; `skills/` must contain at least one `SKILL.md`. `mcp.json` defines the MCP server.
- `.cursor-plugin/marketplace.json` — the marketplace index Cursor reads to discover plugins.
- `scripts/` — `validate-template.mjs` (structure check), `verify-mcp.mjs` (MCP reachability), `dev-install.sh` (symlink the plugin into a workspace for end-to-end testing).

## Conventions

- Plugin and marketplace `name` fields must be lowercase; marketplace names are kebab-case only, plugin names also allow periods. A plugin's `plugin.json` `name` must match its marketplace entry.
- `plugin.json` requires `name`, `displayName`, `version`, and `description`; `version` should be semver.
- A new plugin needs `plugins/<name>/.cursor-plugin/plugin.json` and a registration in `.cursor-plugin/marketplace.json`.
- `.cursor/` is created only by `scripts/dev-install.sh` for local testing and is gitignored; never commit it.
- `/plugins/caffeine/**` and `.cursor-plugin/marketplace.json` reach published marketplace users — changes there have the widest impact.
