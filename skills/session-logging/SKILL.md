---
name: session-logging
description: |
  Session logging and vault updates for research continuity across Claude sessions.

  **USE WHEN:**
  - User says "log this", "update the session log", "record what we did"
  - User says "update Home.md", "update the dashboard", "update vault"
  - After completing analysis runs, figure generation, or paper builds
  - User asks "what did we do last time", "summarize this session"
  - Making methodology decisions that need documentation
  - User explicitly asks to document or track something

  **DON'T USE WHEN:**
  - User is writing paper content (use academic-writing)
  - User is searching literature (use literature-management)
  - User is just asking questions without needing documentation
  - Running analysis (run-analysis skill handles its own logging)

  Trigger phrases: update log, session log, log this, document this, record decision,
  update vault, update Home.md, update dashboard, track progress, what did we do,
  summarize session, add to session log, "remember this", archive old logs
tags: [logging, vault, documentation, tracking, session, memory]
---

# Session Logging Skill

Maintains research continuity through consistent documentation.

## When to Log

**Always log after:**
- Running analysis scripts
- Generating figures
- Making statistical decisions
- Adding/removing variables
- Changing methodology
- Completing experiments
- Significant findings

## Session Log Format

Append to `vault/Logs/Session Log.md`:

```markdown
### YYYY-MM-DD HH:MM - Brief Title

**Action:** What was done
**Files changed:** List of files modified/created
**Results:** Key outcomes or metrics
**Notes:** Additional context

---
```

## Home Dashboard Updates

Update `vault/Home.md` when:
- Key metrics change
- Major milestones reached
- New results available

**Sections to update:**
- Current Status
- Key Metrics table
- Recent Activity
- Next Steps

## Statistical Decisions

When making methodology choices, document in `vault/Reference/Statistical Decisions.md`:

| Decision | Value | Rationale | Date |
|----------|-------|-----------|------|
| Primary outcome | 1-year mortality | Clinical relevance | YYYY-MM-DD |
| Model type | Cox PH | Time-to-event | YYYY-MM-DD |
| Missing data | Complete case | <5% missing | YYYY-MM-DD |

## Figure Manifest

When generating figures, update `vault/Reference/Figure Manifest.md`:

| ID | File | Script | Description | Data | Updated |
|----|------|--------|-------------|------|---------|
| Figure 1 | figure1.pdf | analyze.py | KM curves | results.csv | YYYY-MM-DD |

## Archiving

When session log exceeds ~300 lines:
1. Move older entries to `vault/Archive/YYYY-MM_Session Log.md`
2. Keep recent 2 weeks in active log

## Auto-Logging Examples

**After analysis:**
```markdown
### 2024-01-15 14:30 - Main Analysis Complete

**Action:** Ran full analysis pipeline
**Files changed:** results/analysis_results.csv, results/figures/
**Results:** N=928, events=75, C-stat=0.697
**Notes:** Used complete case analysis per Statistical Decisions

---
```

**After decision:**
```markdown
### 2024-01-15 16:00 - Excluded Outliers Decision

**Action:** Decided to exclude BMI outliers >60
**Files changed:** vault/Reference/Statistical Decisions.md
**Results:** Removed 3 cases, sensitivity analysis shows robust results
**Notes:** Per reviewer suggestion, documented in supplement

---
```

## Integration

This skill integrates with:
- **run-analysis**: Auto-log after pipeline completion
- **build-paper**: Log document generation
- **new-experiment**: Create experiment note

## Vault Conventions

- Use Obsidian wikilinks: `[[Note Name]]`
- All notes need frontmatter with tags, created date
- Archive old content to `vault/Archive/`
