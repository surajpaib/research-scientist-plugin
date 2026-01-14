# Collaboration Guide

This guide explains how to use the Research Scientist plugin's collaboration features for multi-user research teams.

## Quick Start

1. Define team roles in `vault/Reference/Team.md`
2. Use @mentions to notify collaborators
3. Track approvals with status markers
4. Log decisions in the appropriate vault files

## Setting Up Your Team

### Create Team Configuration

Add `vault/Reference/Team.md` to your project:

```markdown
# Research Team

## Project
- **Title**: [Your Project Title]
- **IRB**: [Protocol Number]
- **Start Date**: YYYY-MM-DD

## Team Members

### Principal Investigator
- **Name**: [Full Name]
- **Handle**: @[handle]
- **Email**: [email]
- **Approves**: Publication, major pivots, data access

### Lead Researcher
- **Name**: [Full Name]
- **Handle**: @[handle]
- **Approves**: Methods, intermediate results

### Analysts
- @[handle1] - [Name] - [Focus area]
- @[handle2] - [Name] - [Focus area]

### Statistician (Consultant)
- **Name**: [Full Name]
- **Handle**: @[handle]
- **Approves**: Statistical methods

## Communication
- **Primary**: [Slack/Teams/Email]
- **Meetings**: [Schedule]
- **Vault sync**: [Method - git, Obsidian Sync, etc.]
```

## Approval Workflows

### When Approval Is Needed

| Decision | Requires | Example |
|----------|----------|---------|
| Analysis approach | Lead | "Use nested CV instead of holdout" |
| Statistical method | Statistician | "Switch to Cox from logistic" |
| Primary outcome | PI | "Change to 1-year mortality" |
| Major pivot | PI | "Focus on adipose instead of phenotypes" |
| Publication draft | PI | "Paper ready for journal submission" |
| Data access | Data Manager | "Need additional clinical variables" |

### Approval Process

1. **Document the proposal** in the relevant vault file
2. **Add status marker**: `PENDING APPROVAL`
3. **Tag the approver**: @handle
4. **Wait for review** (don't proceed without approval)
5. **Update status** when approved/rejected
6. **Log the decision** in Session Log

### Status Markers

```
PENDING APPROVAL  - Awaiting review
APPROVED          - Can proceed
CHANGES REQUESTED - Needs revision
REJECTED          - Not approved
DEFERRED          - Decision postponed
```

## Comment System

### Adding Comments

```markdown
### @yourhandle (YYYY-MM-DD)
Your comment text here. Can include:
- Bullet points
- Code snippets
- Links to files or decisions

**Priority**: High | Medium | Low
**Status**: OPEN | IN PROGRESS | RESOLVED
**Action**: What needs to happen next
```

### Responding to Comments

```markdown
### @responder (YYYY-MM-DD)
Response to the above comment.

**Relates to**: @original_commenter's comment above
**Status**: RESOLVED
```

### Finding Your Mentions

```bash
# In terminal
grep -r "@yourhandle" vault/

# In Claude Code
> "Show me all comments mentioning @yourhandle"
```

## Workflow Templates

### Statistical Decision Template

Add to `vault/Reference/Statistical Decisions.md`:

```markdown
### Decision: [Brief title]

**Proposed by**: @handle (YYYY-MM-DD)
**Status**: PENDING APPROVAL
**Required approver**: @approver_handle

#### Context
Why is this decision needed?

#### Options Considered
1. Option A - [pros/cons]
2. Option B - [pros/cons]

#### Recommendation
[What you recommend and why]

#### Impact
[What this affects]

---

**Review by @approver (YYYY-MM-DD)**:
[Reviewer comments]
**Decision**: APPROVED | CHANGES REQUESTED | REJECTED
**Notes**: [Additional guidance]
```

### Publication Milestone Template

Add to `vault/Home.md`:

```markdown
## Publication Status

| Milestone | Status | Approver | Date |
|-----------|--------|----------|------|
| Analysis complete | DONE | @lead | 2026-01-10 |
| Results reviewed | DONE | @stats | 2026-01-12 |
| Draft complete | DONE | @student | 2026-01-14 |
| PI review | PENDING | @pi | - |
| Submission ready | BLOCKED | @pi | - |
```

## Multi-User Git Workflow

### Branch Strategy

```
main                    # Stable, approved work
├── analysis/feature-x  # In-progress analysis
├── writing/methods     # Draft sections
└── review/pi-feedback  # PI review branch
```

### Commit Messages with Roles

```
[Analysis] Add sensitivity analysis for BMI

Implements @stats suggestion from 2026-01-10.
Addresses feedback in vault/Reference/Statistical Decisions.md

Co-authored-by: Jane Doe <jane@example.com>
Reviewed-by: Dr. Stats (@stats)
```

### Pull Request for Approvals

For major changes, use PRs even in solo repos:

1. Create branch for change
2. Make commits
3. Open PR with description
4. Tag reviewers in PR
5. Merge after approval

## Vault Sync Options

### Option 1: Git (Recommended)

```bash
# Each team member
git pull
# Make changes
git add vault/
git commit -m "Update: [description]"
git push
```

### Option 2: Obsidian Sync

- Enable Obsidian Sync (paid)
- All team members connect to same vault
- Real-time collaboration

### Option 3: Shared Folder

- Use Dropbox/OneDrive/Google Drive
- Each person edits different files
- Manual conflict resolution

## Conflict Resolution

### When Conflicts Occur

1. **Communicate** - Don't silently overwrite
2. **Discuss** - Talk through the conflict
3. **Document** - Record the resolution
4. **One owner** - Assign one person per file if needed

### Preventing Conflicts

- Assign clear ownership of vault sections
- Use different branches for parallel work
- Sync frequently (at least daily)
- Use PRs for major changes

## Security and Access

### Sensitive Data

- Clinical data: Never in vault or git
- API keys: Use .env files (gitignored)
- Patient identifiers: Use PHI guard hooks

### Role-Based Access

For sensitive projects, consider:
- Separate repos for different access levels
- Branch protection requiring reviews
- Encrypted secrets for CI/CD

## Audit Trail

The collaboration system creates an audit trail:

1. **Session Log**: Chronological work record
2. **Statistical Decisions**: All analytical choices
3. **Git history**: Who changed what when
4. **Comments**: Discussion and rationale

This supports:
- Reproducibility requirements
- IRB compliance
- Publication transparency
- Onboarding new team members
