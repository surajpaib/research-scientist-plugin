---
name: academic-writing
description: |
  Writing and editing academic paper sections: Introduction, Methods, Results, Discussion.

  **USE WHEN:**
  - User says "write the methods section", "draft the results", "edit the discussion"
  - User asks about paper structure, paragraph organization, section flow
  - User asks "how do I write this finding", "how to phrase this result"
  - User needs help formatting tables or presenting numbers in text
  - User asks about active vs passive voice, scientific writing style
  - User is working in paper.md or supplement.md

  **DON'T USE WHEN:**
  - User is searching for literature (use literature-management)
  - User is doing statistical analysis (use statistical-methods)
  - User asks about specific journal requirements (use journal-profiles)
  - User is generating figures (use figure-design)
  - User is just building the document (use build-paper skill)

  Trigger phrases: write paper, draft methods, write results, edit manuscript,
  format table, academic writing, paper structure, write abstract, introduction,
  discussion section, methods section, scientific writing, "how do I write",
  "help me phrase", paragraph, sentence structure, word choice
tags: [writing, academic, paper, manuscript, style, structure]
---

# Academic Writing Skill

When writing academic manuscripts, follow these conventions for clarity, precision, and journal standards.

## Document Structure

### Main Paper
- **Abstract** (~250 words, structured)
- **Introduction** (~500 words)
- **Methods** (~1000 words)
- **Results** (~1500 words)
- **Discussion** (~1000 words)
- **References**

### Each Section

#### Abstract (Structured)
- Background: Why this matters
- Methods: What was done
- Results: Key findings with numbers
- Conclusions: Implications

#### Introduction (4 paragraphs)
1. Broad context and importance
2. Current approaches and limitations
3. Gap in knowledge
4. What this study does

#### Methods
1. Study population
2. Data acquisition
3. Analysis approach
4. Statistical methods
5. Ethics statement

#### Results
1. Cohort characteristics (Table 1)
2. Primary outcome
3. Secondary outcomes
4. Sensitivity analyses

#### Discussion
1. Summary of findings
2. Comparison to literature
3. Implications
4. Strengths
5. Limitations
6. Conclusions

## Writing Style

### Voice
- Prefer active voice: "We analyzed" not "Analysis was performed"
- Past tense for methods/results
- Present tense for established facts

### Clarity
- Short sentences (15-25 words average)
- One idea per sentence
- Clear topic sentences
- Avoid jargon where possible

### Precision
- Specific numbers over vague terms
- "78% of patients" not "most patients"
- "increased by 2.3-fold" not "substantially increased"

## Formatting

### Numbers
- Spell out one through nine
- Numerals for 10 and above
- Always numerals with units: "5 mg", "3 years"
- Numerals for statistics: "P = 0.03"

### Statistics
```
HR 2.27 (95% CI, 1.38-3.73; P = 0.001)
AUC 0.78 (95% CI, 0.72-0.84)
mean ± SD: 78.5 ± 8.2 years
median (IQR): 12 (8-18)
```

### P-values
- Report exact: P = 0.032
- Very small: P < 0.001
- Never P = 0.000

### Abbreviations
- Define on first use in abstract
- Define again on first use in body
- Standard: CI, HR, OR, AUC, SD
- Use consistently throughout

## Tables

### Table 1: Baseline Characteristics
| Variable | Overall | Group 1 | Group 2 | P |
|:---------|--------:|--------:|--------:|--:|
| Age, years | 78 ± 8 | 77 ± 8 | 80 ± 8 | <0.001 |
| Male, n (%) | 524 (57) | 312 (54) | 212 (60) | 0.08 |

### Formatting
- Left-align text columns
- Right-align number columns
- Use consistent decimal places
- Include units in headers

## Figures

### Captions
- Brief descriptive title (bold)
- Methods for the figure
- Definition of symbols/colors
- Abbreviation definitions
- Statistical test used

### References
```markdown
As shown in Figure 1, ...
(Figure 2A)
Results are presented in Table 2.
```

## Citations

### Syntax
```markdown
Previous work [@smith2023].
Multiple studies [@jones2022; @chen2024].
Smith et al. [@smith2023] showed...
```

### Citation Key Format
`firstauthorYEARkeyword`
- smith2023mortality
- chen2024adipose

## Cross-References

### Within Paper
```markdown
(see Methods)
(Figure 1)
(Table 2)
```

### To Supplement
```markdown
(see **Supplementary Methods**)
(**Supplementary Figure S1**)
(**Supplementary Table S1**)
```

## Common Errors to Avoid

1. **Vague quantifiers**: "many", "most", "some"
2. **Passive voice overuse**
3. **Long paragraphs** (>7 sentences)
4. **Undefined abbreviations**
5. **Inconsistent terminology**
6. **Missing uncertainty** (no CI)
7. **Overclaiming** from limited data
