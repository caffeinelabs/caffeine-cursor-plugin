---
name: caffeine-local
description: Set up local development for a Caffeine project — download its Motoko source into this workspace, edit, validate, and upload back.
---

# Work on a Caffeine project locally

Switch from prompting the Caffeine agent to editing the project's source here.

1. Confirm the target project with `caffeine_list_projects` or `caffeine_show_project`.
2. Tell the user what this involves — installing the Caffeine CLI and a device login on their machine — and get their agreement before running anything.
3. Call `caffeine_local_setup` with no arguments and follow the workflow it returns. It is the authority on the steps, not a remembered sequence.
4. During login, when `caffeine auth device start` prints a user code, call `caffeine_local_setup` again with `{ userCode }`, then run `caffeine auth device complete`.
5. Before writing Motoko, fetch https://skills.internetcomputer.org/skills/caffeine-app/SKILL.md for the project layout and build loop, and https://skills.internetcomputer.org/skills/motoko/SKILL.md for the language.
6. Validate locally with the project's check and build commands before uploading.
7. Upload, then confirm `caffeine_show_project` reaches `draftState: "deployed"`.

If this shell cannot reach caffeine.ai or open the user's browser, say so and use the `caffeine_chat_*` tools instead.

Do not run a chat session that edits code on this project while local changes are pending — the two will overwrite each other.
