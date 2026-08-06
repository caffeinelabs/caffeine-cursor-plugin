---
name: iterate-with-caffeine-agent
description: Send a change to an existing Caffeine project's agent, answer its questions, and verify the result deployed. Use when modifying an app that already exists.
---

# Iterate with the Caffeine agent

## When to use

- A Caffeine project exists and someone wants it changed.
- You are not editing the source in this workspace — the agent writes, builds, and deploys the code.

## Steps

1. Identify the project. `caffeine_list_projects` if you are not certain; `caffeine_show_project` to confirm the one you mean. If more than one could match, ask before sending anything.
2. Check for work already in flight. `caffeine_chat_active_sessions` finds running or blocked sessions; `caffeine_chat_resume_session` reattaches instead of starting a competing one.
3. Send the change with `caffeine_chat_send`, naming the specific screen, component, and behavior. One focused request lands better than a list of five.
4. Watch it to a stable state. `caffeine_chat_watch_session` blocks for you; `caffeine_chat_session_status` and `caffeine_chat_tail` are for polling.
5. Answer what it asks. A clarification takes `caffeine_chat_reply`. A structured form takes `caffeine_chat_submit_form` with the form message's `messageIndex` and your `formData`. A blocked session makes no progress until you answer.
6. Verify before reporting. `caffeine_show_project` must show `draftState: "deployed"` and a `draftUrl`. Read `caffeine_chat_session_transcript` if you need to know what the agent actually did.
7. Reply with what changed and the `draftUrl`.

## Clarification modes

`caffeine_chat_start_session` accepts `clarificationLevel`:

- `instant` — the agent makes its own calls and gets moving. Good for small, well-specified changes.
- `guided` — the agent asks before committing to an approach. Use it when the change is open-ended, touches data models, or would be expensive to undo.

## If the result is wrong

Send a follow-up that points at the specific problem rather than restating the whole request. The agent has the session history; repeating everything invites it to redo work that was already right.

## Things that go wrong

- **Reporting success from the agent's reply alone.** A reply saying the change was made is not a deployed draft. Check `draftState`.
- **Starting a second session while one is blocked.** Answer the outstanding question first, or the two will fight over the same code.
- **Losing a long-running session.** If you detached, `caffeine_chat_active_sessions` and `caffeine_chat_resume_session` will find it again. `caffeine_chat_detach_session` is how you deliberately step away.
