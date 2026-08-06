---
name: caffeine-new
description: Create a new Caffeine project from a one-line brief and return the draft and chat links.
---

# New Caffeine project

Take the brief in the arguments and start a project.

1. Rewrite the brief as one concrete prompt: the kind of app, its main screens, the data it stores, and the first action a visitor takes. Cut vague adjectives.
2. Call `caffeine_create_project`. It takes no arguments — keep the `id` it returns.
3. Call `caffeine_chat_start_session` with that `projectId` and your prompt as `message`. Use `clarificationLevel: "guided"` if the brief leaves the data model open.
4. Follow the session to a stable state with `caffeine_chat_watch_session`. Answer clarifications with `caffeine_chat_reply` and forms with `caffeine_chat_submit_form`.
5. Call `caffeine_show_project` and wait for `draftState: "deployed"`.
6. Reply with the `draftUrl`, the `caffeine_chat_url` link, and one line on what was built.

If the brief is empty or too thin to build from, ask for the app's purpose and its first screen before creating anything — an empty project counts against the account's project limit.
