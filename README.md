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

## Resources

- Caffeine: https://caffeine.ai
- Caffeine CLI and MCP source: https://github.com/caffeinelabs/caffeine-cli
- MCP installation guide: https://github.com/caffeinelabs/caffeine-cli/blob/main/caffeine-mcp-installation-guide.md
