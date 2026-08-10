# Caffeine plugins for Cursor

A marketplace for Cursor plugins that integrates with [Caffeine](https://caffeine.ai). The initial release includes one plugin called **caffeine**, which bridges Cursor to the Caffeine MCP server.

## Available Plugins

- **[caffeine](plugins/caffeine)** — "Create Caffeine projects, edit them through the Caffeine agent, follow builds and deployments, and drop into local Motoko development, all from Cursor."

## Installation Steps

1. Add this marketplace within Cursor
2. Activate the Caffeine plugin
3. Your first Caffeine tool interaction will prompt browser-based authentication

For additional details, see [plugins/caffeine/README.md](plugins/caffeine/README.md) regarding commands and configuration.

## Directory Structure

```
.cursor-plugin/marketplace.json   marketplace index
plugins/caffeine/                 the plugin
scripts/validate-template.mjs     structure check
```

## Development

After modifying the plugin, run validation:

```bash
node scripts/validate-template.mjs
```

To check that the MCP server in `plugins/caffeine/mcp.json` is reachable and its OAuth flow is intact, run:

```bash
node scripts/verify-mcp.mjs
```

That walks the same discovery chain Cursor does — unauthenticated `initialize`, protected-resource metadata, authorization-server metadata, dynamic client registration, and a PKCE authorize request. It stops before completing any sign-in, so it needs no credentials.

To introduce a new plugin, establish `plugins/<name>/.cursor-plugin/plugin.json` and register it in `.cursor-plugin/marketplace.json`.

## Testing the plugin end to end

The supported ways to load a plugin are a marketplace or `~/.cursor/plugins/local/`. If user-local loading is disabled in your Cursor — the plugin log reports `userLocal=false` and the local directory is never read — use the dev installer, which symlinks the plugin's parts into the paths Cursor reads directly:

```bash
./scripts/dev-install.sh <workspace-dir>
```

That links `mcp.json`, the rules, and the commands into `<workspace>/.cursor/`, and the skills into `~/.cursor/skills-cursor/`. Reload the Cursor window, then run `/caffeine-projects` — it only reads, and triggers the browser sign-in on the first tool call.

Because everything is symlinked back to this repo, edits take effect on the next reload. Existing files are backed up rather than overwritten. To remove it:

```bash
./scripts/dev-install.sh --uninstall <workspace-dir>
```

Skills are user-scoped, so they stay visible in every workspace until you uninstall.

## Resources

- Caffeine: https://caffeine.ai
- Plugin source and issues: https://github.com/caffeinelabs/caffeine-cursor-plugin
