---
name: collaboration
description: |
  Multi-user collaboration features for research teams: role definitions, approval workflows, and feedback tracking.

  **USE WHEN:**
  - User asks about team roles, "who should review this"
  - User says "get PI approval", "need statistician review"
  - User asks "how do we track feedback", "add comment for collaborator"
  - User mentions "assign to", "waiting on", "needs review by"
  - User asks about collaboration workflow or team coordination

  **DON'T USE WHEN:**
  - User is working solo (standard workflow)
  - User is doing actual analysis (use analysis skills)
  - User is writing content (use academic-writing)

  Trigger phrases: collaboration, team roles, PI review, statistician review,
  get approval, assign reviewer, add comment, feedback, co-author, mentor approval,
  "who should", team workflow, approval workflow, track feedback
tags: [collaboration, team, roles, review, approval, workflow]
allowed-tools: [Read, Write, Edit]
---

# Collaboration Skill

Enable multi-user research team workflows with role-based review and approval.

## Overview

This skill provides:
1. Role definitions for research teams
2. Approval workflows for key decisions
3. Comment and feedback tracking in vault
4. @mention system for collaborators

## Team Roles

### Defined Roles

| Role | Responsibilities | Approval Authority |
|------|------------------|-------------------|
| **PI** | Overall direction, final approval | Major decisions, publication |
| **Lead** | Day-to-day management, analysis | Methods, intermediate results |
| **Student/Postdoc** | Execute analysis, draft writing | None (submitter) |
| **Statistician** | Statistical methods review | Statistical decisions |
| **Data Manager** | Data quality, access control | Data access |

### Role Configuration

Define team roles in `vault/Reference/Team.md`:

```markdown
# Research Team

## Roles

### Principal Investigator
- **Name**: Dr. Smith
- **Handle**: @smith
- **Approves**: Publication, major pivots, data access

### Lead Researcher
- **Name**: Jane Doe
- **Handle**: @jane
- **Approves**: Methods, analysis approach, intermediate results

### Student
- **Name**: John Student
- **Handle**: @john
- **Role**: Execute analysis, draft sections

### Statistician
- **Name**: Dr. Stats
- **Handle**: @stats
- **Approves**: Statistical methods, sensitivity analyses
```

## Approval Workflows

### Decision Types Requiring Approval

| Decision Type | Required Approval | Documented In |
|---------------|-------------------|---------------|
| Primary outcome change | PI | Statistical Decisions.md |
| New sensitivity analysis | Lead or Statistician | Statistical Decisions.md |
| Major pivot | PI | Session Log.md |
| Publication draft | PI | Paper status in Home.md |
| Data access request | Data Manager | Not tracked in vault |

### Approval Status Format

Use consistent status markers in vault notes:

```markdown
## Decision: Change primary outcome to 1-year mortality

**Proposed by**: @john (2026-01-10)
**Status**: PENDING APPROVAL
**Required approver**: @smith (PI)

### Rationale
[Why this change is needed]

### Implications
[What this affects]

---

**Approval**: APPROVED by @smith (2026-01-12)
**Notes**: "Good rationale. Proceed with updated analysis."
```

### Status Values

- `PENDING APPROVAL` - Awaiting review
- `APPROVED` - Approved, can proceed
- `CHANGES REQUESTED` - Needs revision
- `REJECTED` - Not approved
- `DEFERRED` - Decision postponed

## Comment and Feedback System

### Adding Comments

Use a consistent format for feedback in vault notes:

```markdown
## Comments

### @stats (2026-01-10)
Consider adding a sensitivity analysis excluding patients with missing
BMI data. This could strengthen the robustness of findings.

**Priority**: Medium
**Status**: OPEN

---

### @jane (2026-01-11)
Agreed. @john, please add this to the analysis plan.

**Relates to**: @stats comment above
**Action**: Assigned to @john

---

### @john (2026-01-12)
Added BMI sensitivity analysis to EXP-003. Results in
`results/sensitivity_bmi_missing.csv`.

**Status**: RESOLVED
**Commit**: abc123
```

### Comment Fields

- **Priority**: High / Medium / Low
- **Status**: OPEN / IN PROGRESS / RESOLVED / WONT FIX
- **Relates to**: Reference other comments or decisions
- **Action**: What needs to happen
- **Commit**: Git commit if resolved with code

## @Mention System

### Using Mentions

Reference team members in vault notes:

```markdown
@smith Please review the updated Discussion section.

@stats Is the propensity score approach appropriate here?

@jane FYI - results updated with new cutpoint.
```

### Mention Types

- **@name** - Notify specific person
- **@all** - Notify entire team (use sparingly)
- **@reviewers** - Notify assigned reviewers

### Finding Mentions

Search for your mentions:

```bash
grep -r "@yourhandle" vault/
```

Or use Claude:
> "Show me all comments mentioning @john"

## Workflow Examples

### Example 1: Statistical Decision Review

1. Student proposes decision in `Statistical Decisions.md`
2. Add `PENDING APPROVAL` status with `@stats` mention
3. Statistician reviews and adds comment
4. If approved, update status to `APPROVED`
5. Log in Session Log

```markdown
### Decision: Use Firth penalized regression for rare outcome

**Proposed by**: @john (2026-01-14)
**Status**: PENDING APPROVAL
**Required approver**: @stats

**Rationale**: Standard logistic regression shows quasi-separation
with only 75 events. Firth's method provides stable estimates.

**Reference**: Heinze & Schemper, 2002

---

**Review by @stats (2026-01-15)**:
Appropriate choice. Also consider exact logistic as sensitivity.
**Status**: APPROVED with suggestion
```

### Example 2: Publication Milestone

1. Draft complete, ready for PI review
2. Update `Home.md` with status
3. Add comment in paper overview requesting review
4. PI reviews and provides feedback
5. Address feedback, mark resolved
6. Final approval for submission

```markdown
## Paper Status

- **Current phase**: PI Review
- **Reviewer**: @smith
- **Due**: 2026-01-20
- **Status**: PENDING APPROVAL

### Review Checklist
- [x] Methods complete - @stats approved
- [x] Results finalized
- [x] Discussion drafted
- [ ] PI approval - PENDING
- [ ] Ready for submission
```

### Example 3: Data Access Request

```markdown
## Data Access Log

### Request: Additional clinical variables (2026-01-10)
**Requested by**: @john
**Variables**: Creatinine, eGFR, dialysis status
**Justification**: Kidney function may modify adipose-mortality association
**Status**: PENDING
**Approver**: @data_manager

---

**Response (2026-01-12)**: APPROVED
New variables added to TAVR_clinical_v2.csv
See Data Dictionary for definitions.
```

## Integration with Other Skills

- **session-logging**: Log team interactions and decisions
- **experiment-versioning**: Track who made what changes
- **quality-control**: Include reviewer sign-off in audit
- **academic-writing**: Track section assignments

## Best Practices

1. **Document decisions as they happen** - Don't wait
2. **Use clear status markers** - PENDING, APPROVED, etc.
3. **Reference specific items** - Link to commits, files, decisions
4. **Close the loop** - Mark items RESOLVED when done
5. **Archive resolved threads** - Move old discussions to Archive/
6. **Weekly sync** - Review open items weekly as a team

## Vault Structure for Collaboration

```
vault/
├── Reference/
│   ├── Team.md              # Role definitions
│   ├── Statistical Decisions.md  # Decisions with approval status
│   └── Decision Log.md      # Historical decisions (optional)
├── Logs/
│   └── Session Log.md       # Include collaboration notes
└── Archive/
    └── Resolved Discussions/  # Old comment threads
```
