Write the Results section of the paper.

Follow the writing-agent /rs:results instructions:

1. Read `results/findings_summary.md` and `paper/context.json`. If `analysis_complete` is false, tell the user to run `/rs:analyze` first.
2. List the figures in `results/figures/` and the hypotheses tested.
3. Tell the user what the section will cover and ask: "Proceed?"
4. Write the Results section:
   - Opening sentence: what was analyzed and the sample size
   - One subsection per hypothesis: test used, statistic, p-value, effect size, one-sentence interpretation
   - Inline figure references: (Figure 1), (Figure 2), etc.
   - No interpretation — facts only, no discussion
5. Insert the written section under `# Results` in `paper/paper.md`.
6. Update `paper/context.json`: set `sections_complete.results` to true.
