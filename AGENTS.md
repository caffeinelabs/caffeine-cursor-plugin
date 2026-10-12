# AGENTS.md

A Cursor plugin marketplace containing one plugin, `caffeine`, which connects Cursor to the Caffeine MCP server.

## Layout

- `.cursor-plugin/marketplace.json` — marketplace index listing the plugins and their source directories.
- `plugins/caffeine/` — the plugin: `mcp.json`, `rules/`, `commands/`, `skills/`, `assets/`, and its `.cursor-plugin/plugin.json` manifest.
- `scripts/` — Node and Bash tooling (see below).

## Validate

There is no build step and no `package.json`. The scripts run on Node with `node` directly (ES modules, Node built-ins only, no dependencies).

Structure check — run from the repository root (it resolves paths against the current working directory):

```bash
node scripts/validate-template.mjs
```

It validates `marketplace.json`, each referenced `plugin.json`, required frontmatter per component type (`rules`, `commands`, `agents`, and `skills/SKILL.md`), and `mcp.json`. It exits non-zero on the first set of errors.

Check that the MCP server is reachable and its OAuth discovery chain is intact (no credentials needed; stops before sign-in):

```bash
node scripts/verify-mcp.mjs
```

## Conventions

- Plugin and marketplace `name` fields must be lowercase; marketplace names are kebab-case. `plugin.json` must include `name`, `displayName`, `version`, and `description`, and `name` must match the marketplace entry.
- Markdown components (`rules/*`, `commands/*`, `skills/*/SKILL.md`) require YAML frontmatter: rules need `description`; commands and skills need `name` and `description`.
- Manifest path fields must be relative and stay inside the plugin directory, or be `http(s)://` URLs.
- To add a plugin, create `plugins/<name>/.cursor-plugin/plugin.json` and register it in `.cursor-plugin/marketplace.json`.

## Local testing

`scripts/dev-install.sh <workspace-dir>` symlinks the plugin's `mcp.json`, rules, and commands into `<workspace>/.cursor/`, and skills into `~/.cursor/skills-cursor/`. Uninstall with `scripts/dev-install.sh --uninstall <workspace-dir>`. The `.cursor/` directory it creates is gitignored and must not be committed.
