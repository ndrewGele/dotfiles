---
name: "plan"
description: "Lightweight planning for tasks that need breaking down. Conversational, not document-heavy."
version: 1
created: "2026-09-17"
updated: "2026-09-17"
---
## When to Use
When starting a task that might take more than a few steps, or when the user asks to plan something. Skip for trivial tasks — just do those.

## Procedure
1. Assess scope: Is this bite-sized (just do it) or does it need breaking down? If it's 1-3 straightforward steps, skip planning and execute directly.
2. Ask clarifying questions: What's the goal? Any constraints? Preferences on approach? Don't assume — ask.
3. Check for similar work: Search memory and codebase for related patterns, past decisions, or existing implementations. Reuse before building.
4. Talk it through: Brief conversational discussion of the approach. Keep it high-level — not a design doc. Pros/cons if there are meaningful tradeoffs.
5. Push back on complexity: If the task is getting big, say so. Propose a breakdown into smaller, independently valuable pieces. Andrew should be able to follow each piece.
6. Create a plan artifact: Write a single markdown file at .pi/plan-<short-name>.md. Keep it simple: goal, approach, todo list, and any open questions. This is the reference doc — not a dense specification.
7. Set up todos: Add the broken-down tasks to the todo tool so progress is visible.

## Pitfalls
- Don't over-plan. If you're writing more than a page, you've gone too far.
- Don't create multiple artifacts. One plan file per task, not per phase.
- Don't plan in silence — the conversation IS the planning. The artifact is just the summary.
- Skip planning for trivial tasks. 'Just do it' is valid.

## Verification
1. Plan artifact exists at .pi/plan-<name>.md
2. Todos are set up and visible
3. Andrew has confirmed the approach before implementation starts