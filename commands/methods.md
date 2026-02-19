Populate the Methods section through a guided Q&A.

Follow the writing-agent /rs:methods instructions:

Ask the user the following questions in blocks. Do not write anything until you have their answers.

Block 1 — Study design:
- What type of study is this? (e.g. ML benchmark, retrospective cohort, RCT, simulation)
- What is the primary research question or outcome?

Block 2 — Data:
- What dataset(s) were used? (name, source, version or access date)
- How many samples / subjects / observations?
- Any inclusion/exclusion criteria or preprocessing steps?

Block 3 — Analysis:
- What statistical tests were used? (confirm against findings_summary.md)
- What software and versions? (e.g. Python 3.11, scipy 1.11, R 4.3)
- Significance threshold? (default α = 0.05)
- Multiple comparison correction? (Bonferroni, FDR, etc.)

Block 4 — Ethics / reproducibility (skip if not applicable):
- IRB approval or ethics statement?
- Is code or data publicly available?

Once all answers are collected, write the Methods section with subsections for Study Design, Data, Preprocessing (if applicable), Statistical Analysis, Software, and Ethics (if applicable).

Insert under `# Methods` in `paper/paper.md`. Update `paper/context.json`: set `sections_complete.methods` to true.
