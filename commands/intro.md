Search the web for related work and write the Introduction.

Follow the writing-agent /rs:intro instructions:

1. Read `paper/context.json` and `results/findings_summary.md`. Summarize the paper topic in 1–2 sentences and confirm the search focus with the user.

2. Search for related papers using WebSearch. Run 3–4 targeted queries covering:
   - The core problem or topic
   - Prior methods and approaches
   - Any datasets or benchmarks involved
   - Comparisons made in the analysis
   Use PubMed (eutils.ncbi.nlm.nih.gov) for biomedical topics; Semantic Scholar (api.semanticscholar.org) and OpenAlex (api.openalex.org) for others.

3. Select 6–10 relevant papers. For each note: title, authors, year, key finding, relevance. Check `paper/references.bib` for duplicates before adding.

4. Show the user the found papers and the planned Introduction structure. Ask: "Proceed?"

5. Write a 4-paragraph Introduction (~400–600 words):
   - Para 1: Why this problem matters (cite 2–3 papers)
   - Para 2: What prior work has done (cite 3–4 papers)
   - Para 3: Gap or limitation in prior work
   - Para 4: What this paper does and what was found

6. Append new BibTeX entries to `paper/references.bib`. Use citation keys: `{firstauthorlastname}{year}{keyword}`.

7. Insert the section under `# Introduction` in `paper/paper.md`. Update `paper/context.json`: set `sections_complete.intro` to true.
