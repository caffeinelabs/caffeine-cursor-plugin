---
name: scaffold-caffeine-project
description: Start a new Caffeine app from a plain-language brief and hand back the draft and chat links. Use when someone wants to spin up a fresh project.
---

# Scaffold a Caffeine project

## When to use

- Someone describes an app they want and there is no project yet.
- You need a running, deployed starting point rather than a local skeleton.

## What you have to work with

Caffeine builds full-stack apps on the Internet Computer: a Motoko backend with a web frontend, built and deployed by Caffeine's own agent. There is no stack picker. If the brief implies particular screens, data, or behavior, write it into the prompt in plain words.

Creation is two steps, not one. `caffeine_create_project` takes **no arguments** — it returns an empty project whose name is derived automatically. The brief only reaches the agent when you send it as the first chat message.

## Steps

1. Turn the brief into one concrete prompt: what the app is for, the main screens, and the first thing a visitor can do. Describe behavior, not adjectives.
2. Call `caffeine_create_project` and keep the returned `id`.
3. Call `caffeine_chat_start_session` with that `projectId` and your prompt as `message`. Let it wait for a stable state rather than passing `detach`.
4. If the session comes back still working, follow it with `caffeine_chat_watch_session` until it settles. If it blocks on a question, answer with `caffeine_chat_reply`; if it returns a form, answer with `caffeine_chat_submit_form`.
5. Call `caffeine_show_project` and read `draftState`. Wait for `deployed` before sharing anything — `deploying` is not ready.
6. Hand back the `draftUrl` and, from `caffeine_chat_url`, the browser link for continuing the conversation on caffeine.ai.

## Writing a good first prompt

- Say what the app is for, not just what it is. "A booking page where a client picks a time slot and leaves a deposit" beats "a scheduling app."
- Name the first screen and the primary action on it.
- Say what data the app stores. The backend is Motoko with persistent state, so being explicit about entities up front saves a rebuild.
- Mention authentication if visitors need accounts, so it is planned in rather than bolted on.

## If creation fails

Accounts have a per-plan project limit and creation fails once it is reached. `caffeine_list_projects` shows what already exists; deleting is permanent, so ask before removing anything to make room.

## After it exists

Hand off to `iterate-with-caffeine-agent` to refine it, or `caffeine-local-development` if the user wants to edit the Motoko source directly.
