# AGENTS.md

A Cursor plugin marketplace whose sole plugin, `caffeine`, bridges Cursor to the Caffeine MCP server.

## Validate

There is no package manager, build step, or dependency install — the scripts are plain Node.js ESM modules run directly.

```bash
node scripts/validate-template.mjs   # structure check: manifests, frontmatter, MCP config
node scripts/verify-mcp.mjs          # exercises the MCP server discovery/OAuth chain (no credentials needed)
```

Run `node scripts/validate-template.mjs` after changing any plugin manifest, component, or `.cursor-plugin/marketplace.json`; it exits non-zero on the first set of errors.

## Layout

- `plugins/caffeine/` — the plugin: `rules/`, `commands/`, `skills/`, `assets/`, `mcp.json`, and `.cursor-plugin/plugin.json`.
- `.cursor-plugin/marketplace.json` — marketplace index listing each plugin and its source directory.
- `scripts/` — validation, MCP verification, and the `dev-install.sh` local-testing installer.

## Conventions

- Plugin and marketplace `name` fields must be lowercase; the marketplace name is kebab-case and plugin names allow alphanumerics, hyphens, and periods (see `scripts/validate-template.mjs`).
- A plugin's `plugin.json` `name` must match its entry in `marketplace.json`, and must include `displayName`, `version`, and `description`.
- Component markdown requires YAML frontmatter: rules need `description`; commands and agents need `name` and `description`; every `skills/**/SKILL.md` needs `name` and `description`.
- Manifest path fields must stay relative and inside the plugin directory.

## Adding a plugin

Create `plugins/<name>/.cursor-plugin/plugin.json` and register `<name>` in `.cursor-plugin/marketplace.json`, then run the validator.

## Gotchas

- `.cursor/` is created by `scripts/dev-install.sh` for local testing and is gitignored — never hand-edit or commit it. The installer symlinks plugin parts into a workspace and into `~/.cursor/skills-cursor/`; undo with `./scripts/dev-install.sh --uninstall <workspace-dir>`.
- `node_modules/` and `.claude/` are gitignored.
