# PulseComposer — Task Template & Workflow Reference

This file is **documentation and a blank template**. It is never processed by Claude as an
active task.

There are two ways to start a task — choose one:

- **Path A — Intent doc (preferred):** Write a free-form `tasks/taskN_intent.md`. Tell Claude
  to read it. Claude creates `tasks/taskN_dd.md` from scratch and sets Status → DD_DRAFT.
- **Path B — Stamp the DD directly:** Copy the blank template below into `tasks/taskN_dd.md`,
  set Status: INTAKE, write the intent section, tell Claude to read it. Claude expands it
  in-place and sets Status → DD_DRAFT.

Both paths converge at DD_DRAFT. Path A is preferred for rough or multi-part ideas.

---

## Intent Document (Path A — Pre-DD Concept Phase)

Free-form concept notes written before any formal DD exists. No strict format required.
A few sentences is enough. As rough as you need.

**Naming:** `tasks/taskN_intent.md` — use the same N as the DD that will be created.

**Blank intent template:**

```markdown
# Task N Intent — <concept title>
**Date:** YYYY-MM-DD

## Concept

<Free-form. What you want to build, why, any constraints, open questions.
No required structure — bullets, paragraphs, rough thoughts all accepted.>
```

**Trigger:**
```bash
claude "read claude_docs/tasks/task4_intent.md and create the DD"
```

Claude will: auto-number the task (if N is not specified), research the codebase, create
`tasks/taskN_dd.md` (full DD, Status: DD_DRAFT), and stop. No code is written.
The intent file is preserved as-is — it is the historical record of the original concept.

---

## Blank Task Template (Path B)

Copy this block into `tasks/taskN_dd.md` to start a new task.

```markdown
# Task N — <title>
**Status:** INTAKE
**Date:** YYYY-MM-DD
**Type:** feature | bug | refactor | ops | integration

## Intent
<2–5 sentences. What to build and why. Claude expands this into the full DD.>

---
<!-- Claude fills everything below during INTAKE → DD_DRAFT -->

## Objective

## Background & Current State

## Scope — In

## Scope — Out

## Files Likely Modified
| File | Change |
|------|--------|

## Requirements

## Open Questions

## Acceptance Criteria

---
## Iteration Feedback
<!-- Claude writes here after DONE -->
```

---

## Pre-flight Rules (Claude reads on every task)

- **Check ports before testing.** If backend (17150) or frontend (17151) are bound by a
  developer session, Claude may kill them using `./script/kill-zombie-processes.sh`.
- **Ad-hoc tasks** (no DD file): write plan to `claude_docs/tasks/TASK_plan.md`.
- **Semi-cache**: any user input not captured in a formal `taskN_dd.md` goes to
  `claude_docs/semi_cache/ad_hoc_conversation.md` (Date / Input / Result format).
- **On new task initiation**: when Claude reads a new `taskN_dd.md`, ask the user
  "Should I clear `semi_cache/ad_hoc_conversation.md`?" and wait for approval.
- **Outcome**: Claude always overwrites `claude_docs/tasks/TASK_outcome.md` after any
  significant work, even with no formal DD.

---

<!--
╔══════════════════════════════════════════════════════════════════╗
║  PERMANENT DOCUMENTATION — DO NOT DELETE                        ║
║  State machine, naming conventions, trigger commands.           ║
╚══════════════════════════════════════════════════════════════════╝
-->

## Status State Machine

```
PATH A (preferred)                    PATH B (direct stamp)
──────────────────────────────────    ─────────────────────────────────────
Developer writes taskN_intent.md      Developer stamps taskN_dd.md,
(free-form concept notes)             sets Status: INTAKE, writes intent
        │                                     │
        └── tells Claude to read it           │
                │                             │
                ▼                             ▼
  ┌────────────────────┐          ┌────────┐
  │  CONCEPT INTAKE    │          │ INTAKE │ ── Claude reads intent section
  │  (no DD yet)       │          └────────┘    expands in-place
  └────────────────────┘
  Claude researches codebase,
  creates tasks/taskN_dd.md
                │
                └──────────────────────────────┘
                                │
                                ▼
                  ┌──────────┐
                  │ DD_DRAFT │ ── Developer reviews tasks/taskN_dd.md
                  └──────────┘
        │
        ├── needs changes → Developer notes edits inline or sets → DD_REVISION
        │                   Claude revises, resets → DD_DRAFT
        │
        └── approved → Developer sets Status in tasks/taskN_dd.md → PLAN_REQUESTED
                │
                ▼
  ┌──────────────────┐      (small task: skip to PENDING)
  │  PLAN_REQUESTED  │ ── Claude reads DD, writes taskN_plan.md, sets → PLAN_READY
  └──────────────────┘
                │
                ▼
  ┌──────────────┐
  │  PLAN_READY  │ ── Developer reviews plan
  └──────────────┘
                │
        ┌───────┴──────────────────┐
        │                          │
  Developer approves        Developer requests changes →
  sets → PENDING            writes feedback file,
        │                   sets → PLAN_REVISION
        │                          │
        │                   Claude revises plan,
        │                   resets → PLAN_READY
        │◀─────────────────────────┘
        │
        ▼
  ┌─────────────┐
  │ IN_PROGRESS │ ◀── Claude sets when execution begins
  └─────────────┘
        │
        ├──── (needs human input) ──▶ ┌─────────┐
        │                             │ BLOCKED │ ◀── Claude sets
        │                             └─────────┘
        │                                  │
        │                          Developer resolves,
        │                          sets → PENDING
        │◀─────────────────────────────────┘
        │
        ▼
  ┌──────┐
  │ DONE │ ◀── Claude sets: outcome doc written, DEVLOG updated,
  └──────┘     Iteration Feedback section added to tasks/taskN_dd.md
               tasks/TASK_outcome.md       always written (overwritten)
               build_docs/taskN_outcome.md written for planned tasks (permanent)
```

| Status | Who sets it | Meaning |
|--------|-------------|---------|
| *(none)* | Developer | Writes `taskN_intent.md` (Path A) — tells Claude to create the DD |
| `INTAKE` | Developer | Brief intent written in taskN_dd.md — Claude drafts the full DD |
| `DD_DRAFT` | Claude | DD filled out — awaiting developer review |
| `DD_REVISION` | Developer | DD needs rework — developer notes changes, Claude revises |
| `PENDING` | Developer | Work approved — Claude executes |
| `PLAN_REQUESTED` | Developer | Large task — Claude writes plan only, no code |
| `PLAN_READY` | Claude | Plan written to `build_docs/` — awaiting developer approval |
| `PLAN_REVISION` | Developer | Plan needs changes — developer writes feedback file, Claude revises |
| `IN_PROGRESS` | Claude | Execution underway |
| `DONE` | Claude | Complete — check Iteration Feedback in taskN_dd.md |
| `BLOCKED` | Claude | Needs a human decision before work can continue |

**Rules:**
- Claude does not write code during `INTAKE`, `DD_DRAFT`, `DD_REVISION`, `PLAN_REQUESTED`, or `PLAN_REVISION`
- During `INTAKE`, Claude auto-numbers by scanning existing `tasks/taskN_dd.md` files
- Claude does not start work unless Status is `PENDING` or `IN_PROGRESS`
- After `DONE`, developer reviews Iteration Feedback and either closes the task or sets → `PENDING` with new instructions

---

## File Naming Convention

| Who | File | Purpose |
|-----|------|---------|
| Developer (optional) | `tasks/taskN_intent.md` | Free-form concept — precursor to DD |
| Developer or Claude | `tasks/taskN_dd.md` | Formal design doc — source of truth for the task |
| Claude | `build_docs/taskN_plan.md` | Execution plan, written from DD |
| Claude | `build_docs/taskN_outcome.md` | Permanent delivery record, written at DONE |

- Intent → DD: `task4_intent.md` → `task4_dd.md` (same N)
- DD → Plan: drop `_dd`, append `_plan` → `task4_dd.md` → `task4_plan.md`
- DD → Outcome: drop `_dd`, append `_outcome` → `task4_dd.md` → `task4_outcome.md`
- Claude never invents descriptive suffixes (`task4_automation_plan.md` is wrong)
- The intent file is preserved after the DD is created — it is the original concept record

`build_docs/taskN_outcome.md` — authoritative permanent record, written once at DONE.  
`tasks/TASK_outcome.md` — current-task snapshot, always overwritten.  
Feedback files: `tasks/taskN_feedbackM.md` — M increments per revision round.

---

## How to trigger Claude

**Path A — Create DD from intent file:**
```bash
cd /var/www/html/buyflorabella/dev
claude "read claude_docs/tasks/task4_intent.md and create the DD"
```

**Path B — Process an existing DD (any stage):**
```bash
cd /var/www/html/buyflorabella/dev
claude "read claude_docs/tasks/task4_dd.md and process it"
```

**Self-paced loop (picks up unprocessed intent files first, then active DDs):**
```
/loop scan claude_docs/tasks/ for the highest-numbered taskN_intent.md with no corresponding taskN_dd.md, or the highest-numbered taskN_dd.md with Status not DONE, and process it
```

**Timed loop:**
```
/loop 5m scan claude_docs/tasks/ for any unprocessed taskN_intent.md or active taskN_dd.md and process it
```
