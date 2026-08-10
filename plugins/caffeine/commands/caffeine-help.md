---
name: caffeine-help
description: Show what the Caffeine plugin can do — its commands, the workflow, and what is not available over this connection.
---

# Caffeine plugin help

Print the summary below. Do not call any tools; this is documentation, not a status check.

If the arguments name a topic (a command, "auth", "local", "tools"), expand on that topic instead of printing everything.

---

**Commands**

- `/caffeine-new <brief>` — create a project and build it from a one-line description
- `/caffeine-iterate <change>` — send a change to an existing project's agent and verify it deployed
- `/caffeine-projects [name]` — list projects with deployment state, or show one in detail
- `/caffeine-local` — pull a project's Motoko source into this workspace to edit directly
- `/caffeine-help [topic]` — this message

**How it works**

Caffeine builds full-stack apps on the Internet Computer (Motoko backend, web frontend). Its own agent writes, builds, and deploys the code. You describe changes; you do not edit files locally unless you switch to the local path.

Creating is two steps: a project starts empty, and the brief reaches the agent as the first chat message. Work then happens in chat sessions that can block on a clarification or a form — those must be answered before anything progresses.

Every project has a `draftState` (`no_draft`, `deploying`, `deployed`, `expired`), a `draftUrl` (work in progress) and a `liveUrl` (what the public sees). The agent saying it made a change is not the same as a draft reaching `deployed`.

**Signing in**

Authentication is handled by Cursor, not by this plugin. If a call fails as unauthenticated, click the login button next to `caffeine` in Cursor's MCP settings. There is no login command, and the agent cannot start the flow.

**Not available over this connection**

The hosted server excludes tools that touch a filesystem or run builds: `caffeine_build`, `caffeine_check`, `caffeine_preview`, `caffeine_clone_project`, `caffeine_doctor`, `caffeine_export_project`, `caffeine_import_project`, and the `caffeine_config_*` family. Use the CLI in the terminal instead — `/caffeine-local` sets that up.

There is also no diff or file-read tool, so changes are verified by looking at the running draft rather than by reading code. Use `/caffeine-local` when you need to see the source.

**Links**

- Caffeine: https://caffeine.ai
- Plugin source and issues: https://github.com/caffeinelabs/caffeine-cursor-plugin
