Write the Discussion section connecting Introduction and Results.

Follow the writing-agent /rs:discussion instructions:

1. Read `paper/context.json`. If `sections_complete.intro` or `sections_complete.results` is false, tell the user which section to write first.
2. Ask the user if there are specific limitations they want included.
3. Ask: "Ready to write the Discussion?" and wait for confirmation.
4. Write a 5-paragraph Discussion (~600–900 words):
   - Para 1: Summary of main finding in plain language (no new statistics)
   - Para 2: Comparison to prior work cited in the Introduction
   - Para 3: Mechanistic or theoretical explanation of the findings
   - Para 4: Limitations of the study
   - Para 5: Conclusion and future directions
5. Insert the section under `# Discussion` in `paper/paper.md`.
6. Update `paper/context.json`: set `sections_complete.discussion` to true.
