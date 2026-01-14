---
name: statistical-methods
description: |
  Statistical analysis guidance: choosing tests, reporting results, interpreting effects.

  **USE WHEN:**
  - User asks "which statistical test should I use", "Cox or logistic?"
  - User asks about reporting P-values, CIs, HRs, ORs correctly
  - User asks about handling missing data, multiple testing correction
  - User asks "what does this HR mean", "how to interpret AUC"
  - User needs guidance on cross-validation, model selection, regularization
  - User asks about sample size, power analysis, sensitivity analyses

  **DON'T USE WHEN:**
  - User is writing prose about results (use academic-writing)
  - User is running actual analysis scripts (use run-analysis skill)
  - User is verifying stats in paper (use quality-control)
  - User is creating figures (use figure-design)

  Trigger phrases: statistical test, P-value, confidence interval, hazard ratio,
  odds ratio, regression, Cox model, logistic regression, survival analysis,
  cross-validation, missing data, multiple testing, Bonferroni, FDR, AUC,
  C-statistic, sensitivity, specificity, sample size, power analysis, effect size,
  "which test", "how to report", calibration, discrimination
tags: [statistics, analysis, methods, hypothesis testing, modeling]
---

# Statistical Methods Skill

Best practices for statistical analysis in research.

## Study Design

### Sample Size
- Report how N was determined
- Power analysis if prospective
- Acknowledge limitations if retrospective

### Missing Data
- Report amount missing
- Describe handling method
- Complete case vs imputation

### Confounding
- Identify potential confounders
- Describe adjustment strategy
- Consider unmeasured confounding

## Common Analyses

### Continuous Outcomes
- **Linear regression**: Continuous outcome, linear relationships
- **Mixed models**: Repeated measures, clustered data
- **Quantile regression**: Non-normal distributions

### Binary Outcomes
- **Logistic regression**: Binary outcome
- **Penalized regression**: Many predictors, regularization
- **Random forests**: Non-linear, interactions

### Time-to-Event
- **Cox proportional hazards**: Standard survival
- **Kaplan-Meier**: Survival curves
- **Fine-Gray**: Competing risks

## Model Selection

### Regularization
```python
# Ridge (L2) - shrinks coefficients
Ridge(alpha=1.0)

# Lasso (L1) - feature selection
Lasso(alpha=0.1)

# ElasticNet - both
ElasticNet(alpha=0.1, l1_ratio=0.5)
```

### Cross-Validation
- **K-fold** (k=5 or 10): Standard
- **Stratified**: Maintain class proportions
- **Nested**: Hyperparameter tuning + evaluation

```python
# Nested CV for unbiased evaluation
outer_cv = StratifiedKFold(n_splits=5)
inner_cv = StratifiedKFold(n_splits=3)
```

## Reporting Standards

### Effect Sizes

Always report with uncertainty:
```
HR 2.27 (95% CI, 1.38-3.73; P = 0.001)
OR 1.85 (95% CI, 1.21-2.82)
Beta = 0.34 (SE 0.12)
```

### Model Performance

| Metric | Use Case | Interpretation |
|--------|----------|----------------|
| C-statistic | Discrimination (survival) | 0.5 = random, 1.0 = perfect |
| AUC | Discrimination (binary) | Same as C-statistic |
| Sensitivity | True positive rate | Higher = fewer missed cases |
| Specificity | True negative rate | Higher = fewer false alarms |
| PPV | Precision | Proportion of positives correct |
| NPV | Negative predictive | Proportion of negatives correct |

### Calibration

Report calibration:
- Calibration plot (predicted vs observed)
- Hosmer-Lemeshow test
- Calibration-in-the-large
- Calibration slope

## Common Pitfalls

### P-value Misuse
- P < 0.05 is not "significant" in isolation
- Report effect sizes, not just P
- Adjust for multiple testing

### Multiple Testing
```python
# Bonferroni correction
alpha_adjusted = 0.05 / n_tests

# False Discovery Rate (less conservative)
from statsmodels.stats.multitest import fdrcorrection
rejected, pvals_corrected = fdrcorrection(pvals)
```

### Overfitting
- Always evaluate on held-out data
- Report cross-validated metrics
- Avoid data leakage

### Selection Bias
- Document inclusion/exclusion
- Compare to excluded population
- Discuss generalizability

## Reproducibility

### Seeds
```python
import random
import numpy as np

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
```

### Logging
```python
# Log all parameters
params = {
    'model': 'Cox',
    'regularization': 'ridge',
    'alpha': 1.0,
    'cv_folds': 5,
    'seed': 42,
}
```

## Sensitivity Analyses

Standard checks:
1. **Complete case** - Exclude missing
2. **Alternative definitions** - Different cutoffs
3. **Subgroup analyses** - By demographics
4. **Alternative models** - Different specifications
5. **Exclude outliers** - Robust analysis

Report in supplement with comparison to main results.

## Interpretation

### Hazard Ratios
- HR = 2.0: 2x higher hazard (instantaneous risk)
- HR < 1: Protective effect
- Not the same as "2x more likely to die"

### Odds Ratios
- OR approximates RR when outcome is rare (<10%)
- OR = 1.5: 50% higher odds
- Not directly interpretable as probability

### Confidence Intervals
- 95% CI: 95% of intervals would contain true value
- Narrower = more precision
- If CI crosses 1 (for HR/OR): not statistically significant
