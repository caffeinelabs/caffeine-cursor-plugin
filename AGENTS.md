# AGENTS.md

A Cursor plugin marketplace shipping one plugin, `caffeine`, that connects Cursor to the Caffeine MCP server.

## Layout

- `.cursor-plugin/marketplace.json` — marketplace manifest listing the plugins and their source directories.
- `plugins/caffeine/` — the plugin: its manifest (`.cursor-plugin/plugin.json`), `mcp.json`, `rules/`, `commands/`, `skills/`, and `assets/`.
- `scripts/` — maintenance scripts (see below).

## Validate

There is no package manager or build step; scripts run directly with Node.

Structure check (run from the repo root; it uses `process.cwd()`):

```bash
node scripts/validate-template.mjs
```

It validates `.cursor-plugin/marketplace.json`, each referenced `plugins/<name>/.cursor-plugin/plugin.json`, required frontmatter in `rules/`, `commands/`, and `agents/` (`description`; `name` for commands/agents), each `skills/**/SKILL.md` (`name`, `description`), and any `mcp.json`. It exits non-zero on the first set of errors.

Check the MCP server's discovery and OAuth flow (makes real network requests; completes no sign-in, needs no credentials):

```bash
node scripts/verify-mcp.mjs
```

## Conventions

- Plugin, marketplace, command, agent, and skill names are lowercase and must match `^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$`; marketplace names disallow periods.
- Plugin `version` must be semver (`MAJOR.MINOR.PATCH`).
- A plugin manifest's `name` must equal its marketplace entry `name`.
- Manifest path fields (`logo`, `rules`, `skills`, `agents`, `commands`, `hooks`, `mcpServers`) must be relative and stay inside the plugin directory, or be `http(s)` URLs.
- Rules (`.mdc`), commands, agents, and `SKILL.md` files require YAML frontmatter with the keys listed under "Validate".
- MCP server URLs should use `https`; plain `http` only warns.

## Gotchas

- `.cursor/` at the repo root is created by `scripts/dev-install.sh` for local testing and is gitignored; do not commit it.
- `scripts/dev-install.sh` symlinks plugin parts into a target workspace and into `~/.cursor/skills-cursor/`; it never overwrites existing files (it backs them up) and removes only its own symlinks.
- Adding a plugin means creating `plugins/<name>/.cursor-plugin/plugin.json` and registering it in `.cursor-plugin/marketplace.json`.
