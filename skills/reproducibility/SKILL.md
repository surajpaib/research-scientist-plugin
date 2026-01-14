---
name: reproducibility
description: |
  Setting up reproducible computational research: seeds, environments, configs.

  **USE WHEN:**
  - User is setting up a NEW experiment and needs reproducibility guidance
  - User asks "how do I set seeds", "how do I make this reproducible"
  - User wants to create requirements.txt, environment.yml, or pin versions
  - User asks about config files, config hashes, or experiment tracking setup
  - User is debugging non-deterministic behavior in their code
  - User asks "how do I version my data", "DVC setup"

  **DON'T USE WHEN:**
  - User is auditing EXISTING code for reproducibility (use quality-control)
  - User is just running analysis (use run-analysis skill)
  - User is writing about methods (use academic-writing)
  - User is comparing experiments (use experiment-versioning)

  Trigger phrases: random seed, set seeds, reproducibility setup, requirements.txt,
  environment.yml, config file, experiment config, version control, deterministic,
  replication, dependencies, pip freeze, conda env, config hash, data versioning,
  "make this reproducible", "can't reproduce", non-determinism, PYTHONHASHSEED
tags: [reproducibility, experiments, methodology, seeds, environment, config]
---

# Reproducibility Skill

Ensuring computational research can be replicated and verified.

## Core Principles

### 1. Environment Control
- Document all dependencies
- Pin exact versions
- Use virtual environments

### 2. Randomness Control
- Set all random seeds
- Document seed values
- Use deterministic operations when possible

### 3. Configuration Management
- Separate config from code
- Version control configs
- Generate config hashes

### 4. Data Versioning
- Track data versions
- Document preprocessing
- Store checksums

## Environment Management

### requirements.txt
```txt
numpy==1.24.0
pandas==2.0.0
scipy==1.11.0
scikit-learn==1.3.0
lifelines==0.27.0
matplotlib==3.7.0
```

### environment.yml (Conda)
```yaml
name: research
channels:
  - conda-forge
dependencies:
  - python=3.11
  - numpy=1.24
  - pandas=2.0
  - pip:
    - lifelines==0.27.0
```

### Capture Current Environment
```bash
pip freeze > requirements.txt
conda env export > environment.yml
```

## Random Seed Management

### Setting All Seeds
```python
import random
import numpy as np
import os

def set_all_seeds(seed: int = 42):
    """Set seeds for all random sources."""
    random.seed(seed)
    np.random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)

    # PyTorch if using
    try:
        import torch
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
            torch.backends.cudnn.deterministic = True
            torch.backends.cudnn.benchmark = False
    except ImportError:
        pass

    # TensorFlow if using
    try:
        import tensorflow as tf
        tf.random.set_seed(seed)
    except ImportError:
        pass
```

### Document in Config
```yaml
reproducibility:
  seed: 42
  python_version: "3.11"
```

## Configuration Schema

### Experiment Config
```yaml
experiment:
  id: EXP-001
  name: "Descriptive name"
  hypothesis: "Clear statement"

reproducibility:
  seed: 42
  config_hash: auto

data:
  source: "path/to/data"
  version: "v1.0"

model:
  type: "cox"
  regularization: "ridge"
  alpha: 1.0

evaluation:
  cv_folds: 5
  metrics: ["c_index", "auc"]
```

### Config Hash Generation
```python
import hashlib
import yaml

def generate_config_hash(config_path: str) -> str:
    """Generate deterministic hash from config."""
    with open(config_path) as f:
        content = f.read()
    return hashlib.sha256(content.encode()).hexdigest()[:8]
```

## Data Versioning

### Manual Versioning
- Keep version in filename: `data_v1.0.csv`
- Document in README
- Store in vault notes

### DVC (Data Version Control)
```bash
# Track data file
dvc add data/raw_data.csv

# Push to remote
dvc push

# Pull specific version
dvc checkout
```

### Checksums
```python
import hashlib

def file_checksum(path: str) -> str:
    """Generate MD5 checksum for file."""
    with open(path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()
```

## Experiment Tracking

### Directory Structure
```
experiments/
├── configs/
│   ├── EXP-001_baseline.yaml
│   ├── EXP-002_variant.yaml
│   └── ...
├── logs/
│   ├── EXP-001_20240109_143022.log
│   └── ...
└── results/
    ├── EXP-001/
    │   ├── metrics.json
    │   ├── predictions.csv
    │   └── figures/
    └── ...
```

### Logging
```python
import logging
from datetime import datetime

def setup_logging(exp_id: str) -> logging.Logger:
    """Setup experiment logging."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = f'experiments/logs/{exp_id}_{timestamp}.log'

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger()
```

## Checklist

### Before Running
- [ ] Dependencies documented
- [ ] Seeds set
- [ ] Config separate from code
- [ ] Data version recorded
- [ ] Output directories exist

### After Running
- [ ] Results saved
- [ ] Logs captured
- [ ] Config hash stored
- [ ] Vault note updated
- [ ] Session log entry

### Before Sharing
- [ ] Can run from fresh environment
- [ ] All paths relative or configurable
- [ ] README with instructions
- [ ] Sample data or data access info
- [ ] All secrets removed

## Common Issues

### Non-Determinism
- Floating-point operations
- Dictionary ordering (Python <3.7)
- Multi-threading
- GPU operations

### Solutions
```python
# Deterministic operations
os.environ['TF_DETERMINISTIC_OPS'] = '1'
torch.backends.cudnn.deterministic = True
```

### Data Leakage
- Preprocessing before split
- Using test data for tuning
- Feature engineering on full data

### Solutions
- Split data first
- Pipeline with fit/transform
- Cross-validation properly
