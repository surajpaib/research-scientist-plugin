# Journal Profiles

Pre-configured profiles for target journals with formatting requirements, word limits, and submission guidelines.

## Available Profiles

| Profile | Journal | Impact Factor | Scope |
|---------|---------|---------------|-------|
| `jacc-cardiovascular-imaging.yaml` | JACC: Cardiovascular Imaging | 14.0 | CV imaging |
| `circulation.yaml` | Circulation | 37.8 | CV medicine |
| `radiology.yaml` | Radiology | 19.7 | Diagnostic radiology |
| `npj-digital-medicine.yaml` | npj Digital Medicine | 15.2 | Digital health, AI/ML |

## Usage

### Set Project Profile

Add to your project's `CLAUDE.md`:

```markdown
## Target Journal

Profile: `~/.claude/plugins/research-scientist/profiles/jacc-cardiovascular-imaging.yaml`
```

### Profile Contents

Each profile includes:

- **Word limits** for different manuscript types
- **Abstract format** (structured vs. unstructured, sections)
- **Figure/table limits** and format requirements
- **Reference style** and CSL file
- **Statistics formatting** (P-values, CIs, effect sizes)
- **Required statements** (IRB, consent, funding, etc.)
- **Reporting guidelines** (STROBE, STARD, etc.)

### Example: Check Word Count Against Profile

```python
import yaml

# Load profile
with open('~/.claude/plugins/research-scientist/profiles/jacc-cardiovascular-imaging.yaml') as f:
    profile = yaml.safe_load(f)

word_limit = profile['manuscript']['word_limit']['original_research']
print(f"Word limit: {word_limit}")
```

## Creating Custom Profiles

Copy an existing profile and modify:

```yaml
journal:
  name: "Your Journal Name"
  abbreviation: "J Abbrev"

manuscript:
  word_limit:
    original_research: 4000

  abstract:
    type: structured  # or unstructured
    word_limit: 250
    sections:
      - Background
      - Methods
      - Results
      - Conclusions

formatting:
  reference_style: vancouver  # or nature, apa
  csl_file: "vancouver.csl"

  statistics:
    p_value_format: "P = 0.001"
    ci_format: "95% CI, lower-upper"
```

## Integration with Build

The `/research-scientist:build-paper` command can use profiles to:
- Validate word counts
- Check figure/table limits
- Apply correct citation style
- Generate required statements checklist
