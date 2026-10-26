# AGENTS.md

A Cursor plugin marketplace containing the `caffeine` plugin, which connects Cursor to the Caffeine MCP server.

## Validate / test

There is no package.json, Makefile, or CI workflow in this repo. The checks are plain Node scripts (run with Node, no dependencies to install):

```bash
node scripts/validate-template.mjs   # structure/manifest/frontmatter check
node scripts/verify-mcp.mjs          # verify the MCP server and OAuth flow are reachable
```

Run both from the repository root. `validate-template.mjs` reads paths relative to the current working directory. `verify-mcp.mjs` stops before any sign-in, so it needs no credentials.

## Layout

- `.cursor-plugin/marketplace.json` — marketplace index; every plugin must be registered here.
- `plugins/caffeine/` — the plugin. Its manifest is `plugins/caffeine/.cursor-plugin/plugin.json`.
- `scripts/` — the validation scripts plus `dev-install.sh`, a local-testing installer that symlinks the plugin into a workspace and `~/.cursor/`.

Plugin components live under `plugins/<name>/` in `rules/`, `commands/`, `agents/`, and `skills/`.

## Conventions and gotchas (enforced by `validate-template.mjs`)

- Plugin and marketplace `name` fields must be lowercase; marketplace name is kebab-case.
- `plugins/<name>/.cursor-plugin/plugin.json` must have matching `name`, plus `displayName`, `version`, and `description`. `version` should be semver.
- Frontmatter (YAML `---` block) is required: `rules/` need `description`; `commands/` and `agents/` need `name` and `description`; every `skills/*/SKILL.md` needs `name` and `description`.
- A `skills/` directory must contain at least one `SKILL.md`.
- Manifest path fields and plugin sources must be relative and stay inside the plugin; referenced paths must exist.
- `mcp.json` must define a non-empty `mcpServers` object; remote servers need an `https://` `url`.
- To add a plugin: create `plugins/<name>/.cursor-plugin/plugin.json` and register it in `.cursor-plugin/marketplace.json`.

## Do not hand-edit

`.cursor/` (any workspace) and symlinked skills are created by `scripts/dev-install.sh` for local testing only; `.cursor/` is gitignored. Remove them with `./scripts/dev-install.sh --uninstall <workspace-dir>`.
