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

If a call comes back unauthenticated, check `caffeine_auth_status` and tell the user to complete the browser sign-in that the first tool call opens.
