---
name: caffeine-iterate
description: Send a change to an existing Caffeine project's agent and verify it deployed.
---

# Edit a Caffeine project

Apply the change described in the arguments to the current project.

1. Confirm the target project with `caffeine_list_projects` or `caffeine_show_project`.
2. Check `caffeine_chat_active_sessions` for work already in flight. If a session is blocked, answer it before sending anything new; if one is running on this project, `caffeine_chat_resume_session` rather than competing with it.
3. Send the change as one focused `caffeine_chat_send`. Name the specific screen and element.
4. Follow it with `caffeine_chat_watch_session` until the session settles. Answer clarifications with `caffeine_chat_reply`, forms with `caffeine_chat_submit_form`.
5. Verify with `caffeine_show_project` — `draftState` must read `deployed`. Use `caffeine_chat_session_transcript` if you need to see what the agent actually did.
6. If it is off, send a follow-up pointing at the specific problem rather than restating everything.
7. Reply with what changed and the `draftUrl`.

If more than one project could be the target, ask which one before sending anything.
