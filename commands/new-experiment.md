---
description: Create a new experiment note and config from a hypothesis
allowed-tools: Write, Read, Glob
argument-hint: [hypothesis or experiment description]
---

# New Experiment

Create a structured experiment note in the vault and a configuration file for reproducible execution.

## Usage

```
/research-scientist:new-experiment [hypothesis or description]
```

Examples:
- `/research-scientist:new-experiment "Low adipose tissue predicts higher mortality"`
- `/research-scientist:new-experiment test different feature normalization methods`

## What Gets Created

### 1. Experiment Config
`experiments/configs/EXP-XXX_{name}.yaml`

### 2. Vault Note
`vault/Experiments/EXP-XXX_{name}.md`

### 3. Results Directory
`results/EXP-XXX/`

## Experiment ID Generation

Format: `EXP-{NNN}` where NNN is sequential.

Check existing:
```bash
ls vault/Experiments/EXP-*.md | tail -1
```

Increment from highest existing number.

## Config Template

```yaml
# experiments/configs/EXP-XXX_name.yaml
experiment:
  id: EXP-XXX
  name: "{descriptive_name}"
  hypothesis: "{hypothesis}"
  created: YYYY-MM-DD
  status: draft

reproducibility:
  seed: 42
  python_version: "3.11"
  dependencies: requirements.txt
  config_hash: auto

data:
  source: "features/{feature_file}"
  version: "v1.0"
  description: "{data description}"

execution:
  script: "scripts/{script_name}.py"
  args:
    - "--config"
    - "experiments/configs/EXP-XXX.yaml"
  timeout: 3600
  gpu: false

outputs:
  results_dir: "results/EXP-XXX/"
  figures_dir: "results/figures/"
  logs_dir: "logs/"

metrics:
  primary:
    - name: "c_index"
      direction: maximize
  secondary:
    - name: "auc"
    - name: "sensitivity"
```

## Vault Note Template

```markdown
---
experiment_id: EXP-XXX
date: YYYY-MM-DD
status: draft
config: experiments/configs/EXP-XXX.yaml
config_hash: pending
tags: [experiment]
---

# EXP-XXX: {Descriptive Name}

## Hypothesis

{Clear hypothesis statement}

## Method

### Model
{To be defined}

### Data
- Source: {data path}
- N: {sample size}

### Evaluation
- Primary metric: {metric}
- Cross-validation: {folds}

## Commands

```bash
# Run experiment
python scripts/{script}.py --config experiments/configs/EXP-XXX.yaml
```

## Results

### Primary Metrics
| Metric | Value | 95% CI |
|--------|-------|--------|
| ... | ... | ... |

## Conclusion

{To be completed after experiment}

## Next Steps

- [ ] Define method details
- [ ] Run experiment
- [ ] Analyze results

## Related Notes

- [[Home]]
- [[Statistical Decisions]]
```

## Workflow

1. **Generate experiment ID** - Check existing, increment
2. **Create config file** - With placeholder values
3. **Create vault note** - Draft status
4. **Create results directory** - Empty for outputs
5. **Update Home.md** - Add to "Current Experiments" section

## Output

```markdown
## Experiment Created: EXP-XXX

**ID:** EXP-XXX
**Hypothesis:** {hypothesis}

### Files Created
- Config: `experiments/configs/EXP-XXX.yaml`
- Note: `vault/Experiments/EXP-XXX_{name}.md`
- Results: `results/EXP-XXX/`

### Next Steps
1. Edit config with specific parameters
2. Run: `python scripts/xxx.py --config experiments/configs/EXP-XXX.yaml`
3. Update vault note with results
```
