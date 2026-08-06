---
name: manage-caffeine-projects
description: List, inspect, and clean up Caffeine projects, and read their draft and live deployment state. Use when someone asks what they have, what a project's status is, or wants one removed.
---

# Manage Caffeine projects

## When to use

- "What projects do I have?" / "Is it deployed?" / "What's the URL?"
- Choosing which project a change should go to.
- Removing a project that is no longer wanted.

## Reading state

`caffeine_list_projects` returns every project for the signed-in account. `caffeine_show_project` takes an `id` and returns the detail. The fields that matter:

- `status` — `active` or `blocked`. A blocked project will not accept work; say so rather than sending prompts into it.
- `draftState` — `no_draft`, `deploying`, `deployed`, or `expired`. This is the field that tells you whether there is something to look at.
- `draftUrl` — the work in progress. Null until a draft deploys.
- `liveUrl` — what the public sees. Null until the project has been published.
- `updatedAt` — the tiebreaker when someone says "the one I was just working on."

`caffeine_chat_url` returns the browser link for a project's conversation on caffeine.ai, which is what to hand someone who wants to continue outside Cursor.

## Draft versus live

A deployed draft is not a published app. `draftUrl` changes every time the agent finishes work; `liveUrl` only changes when the project is published. When someone asks for "the link," ask which they mean if both exist — sharing a draft URL as if it were production is the common mistake here. An `expired` draft needs the agent to rebuild before there is anything to see.

## Checking authentication

`caffeine_auth_status` confirms the connection is signed in. If a tool call fails as unauthenticated, this is the first thing to check — over this plugin's hosted connection, sign-in happens in the browser on first tool use, not through a CLI login.

## Deleting

`caffeine_delete_project` is permanent and cannot be undone.

1. Resolve the exact project with `caffeine_show_project` and read its name back to the user.
2. Get explicit confirmation for that specific project.
3. Only then call the tool.

Never delete based on a partial name match, and never delete to free up quota without asking first.
