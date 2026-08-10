---
name: caffeine-projects
description: List Caffeine projects with their deployment state, or show the detail for one named in the arguments.
---

# Caffeine projects

Report on the account's projects.

1. If the arguments name a project, resolve it and call `caffeine_show_project`. Otherwise call `caffeine_list_projects`.
2. For each project, report the name, `status`, `draftState`, and whichever of `draftUrl` and `liveUrl` exist. Sort by `updatedAt` so the most recent work is first.
3. Flag anything that needs attention: a `blocked` status, an `expired` draft, or a project stuck in `deploying`.
4. If a project has no `liveUrl`, say it has never been published rather than reporting the draft as if it were live.

Call the tool straight away — do not check auth first and do not announce a sign-in, which you cannot start. If the call comes back unauthenticated, say so in one line and tell the user to click the login button next to `caffeine` in Cursor's MCP settings, then stop.
