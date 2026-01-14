---
name: experiment-versioning
description: |
  Git-based experiment versioning: branches, lineage tracking, comparison.

  **USE WHEN:**
  - User says "create experiment branch", "version this experiment"
  - User asks "compare EXP-001 vs EXP-002", "what experiments have we run"
  - User asks about experiment lineage, "what led to this result"
  - User wants to see git branches for experiments, manage exp/* branches
  - User says "mark experiment complete", "this supersedes EXP-001"
  - User asks "which experiment was best", "show experiment history"

  **DON'T USE WHEN:**
  - User is setting up reproducibility for first time (use reproducibility)
  - User is running analysis (use run-analysis skill)
  - User is creating new experiment note (use new-experiment command)
  - User asks about general git operations (not experiment-specific)

  Trigger phrases: experiment branch, compare experiments, experiment lineage,
  version experiment, track experiment, git branch experiment, supersedes,
  "list experiments", exp/EXP-, experiment history, "which experiment",
  experiment metadata, .experiment/ directory, mark complete
tags: [experiments, git, versioning, lineage, branches, comparison]
---

# Experiment Versioning Skill

Git-based versioning for experiments with lineage tracking.

## Concepts

### Experiment Branches
Each experiment gets its own git branch:
- Branch name: `exp/EXP-001`
- Contains: code, config, results
- Metadata: stored in `.experiment/EXP-001.json`

### Lineage Tracking
Experiments can build on previous experiments:
```
main
  └─ exp/EXP-001 (baseline)
       └─ exp/EXP-002 (variant A)
            └─ exp/EXP-004 (best combined)
       └─ exp/EXP-003 (variant B)
```

### Experiment Status
- `active`: Currently running
- `completed`: Results available
- `failed`: Did not produce valid results
- `abandoned`: Not pursuing further

## Commands

### Create Experiment Branch
```bash
python ~/.claude/plugins/research-scientist/scripts/experiment_git.py create EXP-001 "Baseline Cox model"
```

Creates:
- Branch `exp/EXP-001`
- Metadata file `.experiment/EXP-001.json`

### List All Experiments
```bash
python ~/.claude/plugins/research-scientist/scripts/experiment_git.py list
```

Output:
```
Experiment Branches (4):

ID           Status     Base            Description
------------------------------------------------------------
EXP-001      completed  main            Baseline Cox model
EXP-002      completed  exp/EXP-001     Add adipose features
EXP-003      active     exp/EXP-001     Alternative: Random Forest
EXP-004      active     exp/EXP-002     Combined best features
```

### View Lineage
```bash
python ~/.claude/plugins/research-scientist/scripts/experiment_git.py lineage EXP-004
```

Output:
```
Lineage for EXP-004:

EXP-004: Combined best features
  └─ EXP-002: Add adipose features
       └─ EXP-001: Baseline Cox model
            └─ main: Base branch
```

### Compare Experiments
```bash
python ~/.claude/plugins/research-scientist/scripts/experiment_git.py compare EXP-001 EXP-002
```

Output:
```
Comparing EXP-001 vs EXP-002:

File changes:
 configs/model.yaml | 5 +++++
 results/metrics.json | 2 +-
 2 files changed, 6 insertions(+), 1 deletion(-)

Commits ahead:
  EXP-001: 0 commits not in EXP-002
  EXP-002: 3 commits not in EXP-001

EXP-001 metrics:
  c_statistic: 0.68
  auc: 0.71

EXP-002 metrics:
  c_statistic: 0.72
  auc: 0.75
```

### Mark Complete
```bash
python ~/.claude/plugins/research-scientist/scripts/experiment_git.py complete EXP-002 "C-stat improved from 0.68 to 0.72"
```

## Workflow

### Starting New Experiment
1. **Create branch** from best current experiment
   ```bash
   git checkout exp/EXP-002
   python experiment_git.py create EXP-003 "Try random forest"
   ```

2. **Make changes** to config/code
3. **Run experiment** via `/research-scientist:run-analysis`
4. **Mark complete** when results are finalized
5. **Update vault** with experiment note

### Comparing Approaches
1. **List experiments** to see all branches
2. **Compare** two experiments side-by-side
3. **View lineage** to understand progression
4. **Merge best** approach to main

### Merging to Main
When an experiment is successful:
```bash
git checkout main
git merge exp/EXP-004 --no-ff -m "Merge EXP-004: Best combined model"
```

## Metadata Schema

`.experiment/EXP-001.json`:
```json
{
  "experiment_id": "EXP-001",
  "description": "Baseline Cox model with clinical features",
  "base_branch": "main",
  "created": "2024-01-15T10:30:00",
  "status": "completed",
  "completed": "2024-01-15T14:45:00",
  "results_summary": "C-stat 0.68, AUC 0.71",
  "supersedes": null,
  "superseded_by": ["EXP-002", "EXP-003"]
}
```

## Integration with Vault

Update `vault/Experiments/EXP-XXX.md` with:
```yaml
---
experiment_id: EXP-XXX
branch: exp/EXP-XXX
base_experiment: EXP-YYY
status: completed
---
```

Link experiments:
```markdown
## Lineage
- Based on: [[EXP-001]]
- Superseded by: [[EXP-004]]
```

## Best Practices

1. **One hypothesis per branch** - Don't mix multiple changes
2. **Meaningful descriptions** - Clear what changed
3. **Track lineage** - Know what led to what
4. **Mark status** - Complete or abandon experiments
5. **Compare before merge** - Verify improvement
6. **Document in vault** - Link branch to experiment note
