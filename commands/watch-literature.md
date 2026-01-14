---
description: Check literature watches for new papers
allowed-tools: [Bash, Read, Write, Edit]
argument-hint: "[--list | --check-all | --watch 'Topic Name']"
---

# Watch Literature Command

Check configured literature watches for new papers since last check.

## Usage

### List configured watches
```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/literature_watch.py --list
```

### Check all watches
```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/literature_watch.py --check-all
```

### Check specific watch
```bash
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/literature_watch.py --watch "Body Composition TAVR"
```

## Setting Up Watches

Edit `vault/Reference/Literature Watches.md` to add new watches:

```markdown
### Watch: Topic Name
- **Query**: `your search terms here`
- **Sources**: PubMed, arXiv
- **Frequency**: Weekly
- **Last checked**: 2026-01-01
- **Papers found**: 0
```

## Output

The script:
1. Searches PubMed and/or arXiv for each configured watch
2. Generates a vault note at `vault/Literature/YYYY-MM-DD Literature Watch.md`
3. Updates the "Last checked" date in the watches configuration

## Tips

- Use specific queries to reduce noise
- Check weekly or monthly depending on field activity
- Review the generated note and add citations for relevant papers
