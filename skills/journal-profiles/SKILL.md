---
name: journal-profiles
description: |
  Journal-specific formatting requirements: word limits, figure limits, reference styles.

  **USE WHEN:**
  - User mentions specific journal: JACC, Circulation, Radiology, npj Digital Medicine
  - User asks "what's the word limit", "how many figures can I have"
  - User asks about reference style (Vancouver, Nature), abstract format
  - User asks "what does [journal] require", "submission checklist for [journal]"
  - User needs journal-specific P-value or CI formatting
  - User asks about STROBE, TRIPOD, CONSORT reporting guidelines

  **DON'T USE WHEN:**
  - User is writing general content (use academic-writing)
  - User is actually building the document (use build-paper skill)
  - User is adding citations (use literature-management)

  Trigger phrases: journal requirements, word limit, figure limit, submission guidelines,
  JACC, Circulation, Radiology, npj, npj Digital Medicine, target journal, reference style,
  abstract format, Vancouver style, structured abstract, "what does [journal] want",
  reporting checklist, STROBE, TRIPOD, CONSORT, impact factor
tags: [journal, formatting, submission, requirements, guidelines]
---

# Journal Profiles Skill

Journal-specific requirements for manuscript preparation.

## Available Profiles

| Journal | Profile File |
|---------|-------------|
| JACC: Cardiovascular Imaging | `profiles/jacc-cardiovascular-imaging.yaml` |
| Circulation | `profiles/circulation.yaml` |
| Radiology | `profiles/radiology.yaml` |
| npj Digital Medicine | `profiles/npj-digital-medicine.yaml` |

## Quick Reference by Journal

### JACC: Cardiovascular Imaging
- **Word limit**: 4,500 (original research)
- **Abstract**: Structured, 250 words
- **Figures**: Max 6 + central illustration (required)
- **References**: Max 50, Vancouver style
- **P-value format**: `P = 0.001`

### Circulation
- **Word limit**: 5,000 (original research)
- **Abstract**: Structured, 250 words
- **Special**: Clinical Perspective required
- **References**: Max 60, Vancouver superscript
- **P-value format**: `P=0.001` (no space)

### Radiology
- **Word limit**: 3,500 (original research)
- **Abstract**: Structured, 300 words
- **Special**: Summary statement + Key Results
- **References**: Max 50, Vancouver superscript
- **P-value format**: `P < .001` (no leading zero)
- **Review**: Double-blind

### npj Digital Medicine
- **Word limit**: 5,000 (article)
- **Abstract**: Unstructured, 200 words
- **Special**: Code/data availability required
- **References**: Max 80, Nature style
- **Open access**: Yes (APC ~$5,990)

## Profile Contents

Each profile YAML includes:

```yaml
journal:
  name: "Full Journal Name"
  impact_factor: X.X

manuscript:
  word_limit:
    original_research: XXXX
  abstract:
    type: structured | unstructured
    word_limit: XXX
    sections: [...]

formatting:
  reference_style: vancouver | nature | apa
  statistics:
    p_value_format: "..."
    ci_format: "..."
    effect_size_format: "..."

submission:
  required_statements: [...]
  checklist_required:
    observational: STROBE
    prediction_model: TRIPOD
```

## Using Profiles

### Check Requirements
```
Read the JACC profile and tell me the word limit and figure requirements
```

### Validate Manuscript
```
Check if paper.md meets the Circulation requirements
```

### Format Statistics
```
Format this hazard ratio for Radiology: HR=2.3, CI 1.5-3.4, p=0.001
```

Results by journal:
- **JACC**: HR 2.3 (95% CI, 1.5-3.4; P = 0.001)
- **Circulation**: HR, 2.3; 95% CI: 1.5-3.4
- **Radiology**: hazard ratio, 2.3 [95% CI: 1.5, 3.4]

## Required Statements

All journals require:
- IRB approval
- Informed consent
- Funding disclosure
- Conflicts of interest

Additional by journal:
- **Circulation**: Clinical Perspective
- **Radiology**: Reporting checklist (STROBE/STARD)
- **npj Digital Medicine**: Code availability, Model cards

## Reporting Guidelines

| Study Type | Guideline |
|------------|-----------|
| Observational | STROBE |
| Diagnostic accuracy | STARD |
| Prediction model | TRIPOD |
| AI/ML prediction | TRIPOD+AI |
| Clinical trial | CONSORT |
| AI clinical trial | CONSORT-AI |

## Integration

Load profile in build workflow:
```python
import yaml

profile_path = "~/.claude/plugins/research-scientist/profiles/jacc-cardiovascular-imaging.yaml"
with open(profile_path) as f:
    profile = yaml.safe_load(f)

# Check word limit
limit = profile['manuscript']['word_limit']['original_research']
```
