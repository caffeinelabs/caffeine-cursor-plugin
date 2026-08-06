---
name: caffeine-local-development
description: Download a Caffeine project's Motoko and frontend source, edit it in this workspace, validate it, and upload it back. Use when someone wants to work on the code directly instead of prompting the Caffeine agent.
---

# Work on a Caffeine project locally

## When to use

- The user explicitly wants to edit the source rather than describe changes to the agent.
- The change is precise enough that writing the Motoko is faster than explaining it.

Do not reach for this by default. The agent path (`iterate-with-caffeine-agent`) needs no installation, no login on the user's machine, and no local toolchain.

## Before you start

This path installs software and performs a device login on the user's own machine. Ask first, and be specific about what will be installed.

If your shell is a sandbox that cannot reach caffeine.ai or open a browser on the user's machine, you cannot do this. Say so and use the `caffeine_chat_*` tools instead.

## Steps

1. Call `caffeine_local_setup` with no arguments. It returns the current, authoritative workflow — install the CLI, log in, download the source, edit, validate, upload. Follow what it returns rather than a remembered sequence.
2. Work through the install and login steps in the terminal. When `caffeine auth device start` prints a short user code, call `caffeine_local_setup` again with `{ userCode }` to approve that login under the authenticated account. Then run `caffeine auth device complete` to finish.
3. Download the project's source into the working directory as the guide describes.
4. Before writing any Motoko, fetch the two upstream skills:
   - Project structure (`caffeine.toml`, `mops.toml`) and the build/check/preview loop: https://skills.internetcomputer.org/skills/caffeine-app/SKILL.md
   - The Motoko language itself: https://skills.internetcomputer.org/skills/motoko/SKILL.md
5. Edit, then validate locally with the project's check and build commands. Fix what they report.
6. Upload the source back and confirm the project redeploys — `caffeine_show_project` should reach `draftState: "deployed"`.

## Why the MCP build tools are not there

`caffeine_build`, `caffeine_check`, `caffeine_preview`, `caffeine_clone_project`, `caffeine_doctor`, and the `caffeine_config_*` tools only exist when the MCP server runs locally on the user's machine. This plugin connects to the hosted server, which does not expose filesystem or build tools. Run the equivalent CLI commands in the terminal instead.

Someone who wants those as MCP tools can run the server locally — see the plugin README's note on the stdio connection.

## Don't cross the streams

The local path and the agent path write to the same project. Do not run a chat session that edits code while you have local changes waiting to upload; whichever finishes last wins, and the other's work is lost.
