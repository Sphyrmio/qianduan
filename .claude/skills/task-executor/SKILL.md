---
name: task-executor
description: Read TASKS.md, identify unfinished tasks, complete them one by one, mark progress, and commit after each completed task.
---

# Task Executor

## Purpose

Execute tasks listed in `TASKS.md` in a controlled, incremental way.

## Instructions

1. Read `TASKS.md` first to understand the task list and overall goal.
2. Identify unfinished task items.
3. For each unfinished task item:
   - Understand what the task requires.
   - If necessary, read other relevant skills before implementation.
   - Complete only this task item with attention to correctness.
   - After completing it, update `TASKS.md` and mark this task item as completed.
   - Create one git commit for this completed task item.
4. Repeat until there are no unfinished task items left.
5. Prefer correctness over speed.
6. Keep changes focused and minimal.
7. Do not skip updating `TASKS.md`.
8. Do not batch multiple completed task items into a single commit unless explicitly required.

## Working Rules

- Always start from `TASKS.md`.
- Only read other skills when they are relevant to the current unfinished task.
- Complete tasks one by one.
- After each completed item:
  - mark it completed in `TASKS.md`
  - run one git commit
- Ensure the implementation is consistent with the existing codebase.
- Validate changes as reasonably as possible before committing.

## Permissions Required

This skill works best when the following are allowed:

- file read
- file write
- command execution
- git operations
- network access

## Expected Behavior

When invoked, the agent should:

- inspect `TASKS.md`
- find unfinished items
- implement them one at a time
- update task status after each completion
- commit after each completed item
- try to ensure correctness before moving on
