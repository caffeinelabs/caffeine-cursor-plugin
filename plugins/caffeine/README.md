# Caffeine for Cursor

Build and ship [Caffeine](https://caffeine.ai) apps without leaving Cursor. The plugin wires Cursor to the Caffeine MCP server, then adds rules, skills, and commands so the agent knows how to use it.

Caffeine builds full-stack apps on the Internet Computer — a Motoko backend with a web frontend. You describe what you want; Caffeine's own agent writes the code, builds it, and deploys it to a draft URL. This plugin lets Cursor do that driving, and gets out of the way when you'd rather edit the Motoko yourself.

## What you get

- **MCP connection** to `https://mcp.caffeine.ai/mcp`. On first use it opens a browser to sign in to your Caffeine account (OAuth, with dynamic client registration and PKCE). No keys to paste, no token to configure.
- **Skills** the agent reaches for on its own:
  - `scaffold-caffeine-project` — start a project from a brief
  - `iterate-with-caffeine-agent` — make and verify changes on an existing project
  - `manage-caffeine-projects` — list, inspect, and clean up projects
  - `caffeine-local-development` — pull the source down and edit it here instead
- **Commands** you can run directly: `/caffeine-new`, `/caffeine-iterate`, `/caffeine-projects`, `/caffeine-local`, `/caffeine-help`.
- **Rules** that keep the agent honest: follow a chat session to a stable state, answer its clarifications, and check `draftState` before claiming a change shipped.

## Install

Add this marketplace in Cursor, then enable the **Caffeine** plugin. The first call to a Caffeine tool triggers the sign-in.

If you only want the raw connection without the skills and commands, add the server to your Cursor MCP config:

```json
{
  "mcpServers": {
    "caffeine": {
      "type": "http",
      "url": "https://mcp.caffeine.ai/mcp"
    }
  }
}
```

## Using it

Start something new:

```
/caffeine-new a client portal where customers log in, see their invoices, and mark one as paid
```

Change something that exists:

```
/caffeine-iterate on the invoices page, move the "Mark paid" button into the row and disable it once an invoice is paid
```

Check what you have:

```
/caffeine-projects
```

## How the workflow actually goes

Creating a project is **two steps**. `caffeine_create_project` takes no arguments and returns an empty project with an auto-derived name — your brief reaches the agent as the first message of a chat session. The skills handle this; it is worth knowing if you call the tools directly.

Work then happens in **chat sessions**. `caffeine_chat_start_session` waits a bounded time and hands back a continuation hint if the agent is still going. A session can also block on a question — a plain clarification answered with `caffeine_chat_reply`, or a structured form answered with `caffeine_chat_submit_form`. A blocked session sits there until someone answers it.

Every project carries a `draftState` (`no_draft`, `deploying`, `deployed`, `expired`) alongside a `draftUrl` and a `liveUrl`. The draft is the work in progress; the live URL is what the public sees and only changes when you publish. The agent saying it made a change is not the same as a draft that reached `deployed`.

## Editing the code yourself

`/caffeine-local` switches to the other path: install the Caffeine CLI, download the project's source into your workspace, edit the Motoko directly, validate, and upload it back. `caffeine_local_setup` returns the authoritative steps, including a device-login flow that completes without a browser round trip.

Two upstream skills carry the real detail, and the plugin's rules tell the agent to fetch them before writing any Motoko:

- Project structure and the build/check/preview loop — https://skills.internetcomputer.org/skills/caffeine-app/SKILL.md
- The Motoko language — https://skills.internetcomputer.org/skills/motoko/SKILL.md

Don't run an agent chat session that edits code while you have local changes pending. Both write to the same project and the last one to finish wins.

## Hosted versus local MCP server

This plugin connects to the **hosted** server, which is why sign-in is a browser flow and there is nothing to install. The hosted server deliberately leaves out the tools that touch a filesystem or run builds: `caffeine_build`, `caffeine_check`, `caffeine_preview`, `caffeine_clone_project`, `caffeine_doctor`, `caffeine_export_project`, `caffeine_import_project`, and the `caffeine_config_*` family. Run the equivalent CLI commands in the terminal instead.

If you want those as MCP tools, run the server locally over stdio and point Cursor at it — see the [installation guide](https://github.com/caffeinelabs/caffeine-cli/blob/main/caffeine-mcp-installation-guide.md) in the CLI repo. That build is distributed through GitHub Packages and needs an `.npmrc` with a `read:packages` token, so it is an internal path rather than a public one today.

## A few things worth knowing

- The code lives in Caffeine's build environment, not your local repo, unless you deliberately pull it down.
- `caffeine_delete_project` is permanent. The rules tell the agent to confirm the exact project first — keep that.
- Accounts have a per-plan project limit, and creation fails once you hit it. An abandoned empty project still counts.
- `clarificationLevel: "guided"` is worth setting when a change is open-ended or touches the data model; it makes the agent ask before it commits to an approach.

## Links

- Caffeine: https://caffeine.ai
- Caffeine CLI and MCP source: https://github.com/caffeinelabs/caffeine-cli
- MCP installation guide: https://github.com/caffeinelabs/caffeine-cli/blob/main/caffeine-mcp-installation-guide.md
