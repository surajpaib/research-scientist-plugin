---
name: literature-watching
description: |
  Set up automated literature alerts to monitor for new papers on topics of interest.

  **USE WHEN:**
  - User says "watch for new papers on X", "set up literature alerts"
  - User says "monitor publications on", "track new research on"
  - User asks "what's new in the literature", "any new papers since last check"
  - User wants to configure recurring literature searches
  - User asks about setting up PubMed alerts or RSS feeds

  **DON'T USE WHEN:**
  - User wants to search literature now (use literature-management instead)
  - User wants to add a specific citation (use literature-management instead)
  - User is reading a specific paper (use literature-management instead)

  Trigger phrases: watch literature, monitor papers, literature alerts, new papers,
  track publications, pubmed alert, arxiv alert, set up alerts, literature monitoring,
  "any new papers", "what's been published recently", "track new research"
tags: [literature, alerts, monitoring, automation, pubmed, arxiv]
allowed-tools: [Bash, Read, Write, Edit]
---

# Literature Watching Skill

Set up and manage automated literature monitoring for your research project.

## Overview

This skill helps you:
1. Configure queries to watch for new papers
2. Run periodic checks against PubMed and arXiv
3. Generate vault notes with new findings
4. Track what's been seen to avoid duplicates

## Configuration

Literature watches are configured in `vault/Reference/Literature Watches.md`:

```markdown
# Literature Watches

## Active Watches

### Watch: Body Composition TAVR
- **Query**: `adipose tissue TAVR mortality`
- **Sources**: PubMed, arXiv
- **Frequency**: Weekly
- **Last checked**: 2026-01-07
- **Papers found**: 3

### Watch: CT Body Segmentation
- **Query**: `CT body composition segmentation deep learning`
- **Sources**: PubMed, arXiv
- **Frequency**: Monthly
- **Last checked**: 2025-12-15
- **Papers found**: 7
```

## Setting Up a New Watch

### Step 1: Add watch configuration

Edit `vault/Reference/Literature Watches.md` and add:

```markdown
### Watch: [Topic Name]
- **Query**: `your search terms here`
- **Sources**: PubMed, arXiv
- **Frequency**: Weekly | Monthly
- **Last checked**: [date]
- **Papers found**: 0
```

### Step 2: Run initial search

Use the literature-management skill to find existing papers:

```
Search PubMed for "your search terms" from 2020-2024
```

### Step 3: Schedule regular checks

The watch script can be run manually or scheduled:

```bash
# Manual check
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/literature_watch.py --check-all

# Check specific watch
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/literature_watch.py --watch "Body Composition TAVR"
```

## Running Literature Checks

### Manual Check (Recommended)

When user asks "any new papers?":

1. Read the watch configuration from `vault/Reference/Literature Watches.md`
2. For each active watch, search PubMed/arXiv for papers since last checked date
3. Generate a vault note with new findings
4. Update the "Last checked" date

### Search New Papers

```python
# PubMed search with date filter
from datetime import datetime, timedelta

last_checked = "2026-01-07"
query = f"adipose tissue TAVR mortality AND {last_checked}:3000[PDAT]"
```

### WebSearch Alternative

If MCP is not available:

```
Search PubMed for "adipose tissue TAVR mortality" papers published after January 2026
```

## Output Format

New papers are saved to `vault/Literature/YYYY-MM-DD Literature Watch.md`:

```markdown
---
created: 2026-01-14
type: literature-watch
tags: [literature, alerts, weekly]
---

# Literature Watch - 2026-01-14

## Summary
- **Watches checked**: 2
- **New papers found**: 5
- **Sources**: PubMed, arXiv

## Body Composition TAVR (3 new)

### 1. [Paper Title](https://doi.org/xxx)
- **Authors**: Smith et al.
- **Journal**: Circulation, 2026
- **Relevance**: High - directly studies SAT/VAT in TAVR population
- **Key finding**: VAT/SAT ratio predictive of 1-year mortality

### 2. [Paper Title](https://doi.org/xxx)
...

## CT Body Segmentation (2 new)

### 1. [Paper Title](https://arxiv.org/abs/xxx)
- **Authors**: Chen et al.
- **Source**: arXiv preprint
- **Relevance**: Medium - new segmentation method for muscle/fat
- **Key finding**: Improved accuracy over TotalSegmentator

---

## Actions
- [ ] Review paper #1 for potential citation
- [ ] Consider updating methods based on paper #5
```

## Automation Options

### Option 1: Manual Invocation

Ask Claude: "Check my literature watches" or "Any new papers this week?"

### Option 2: Cron Job (macOS/Linux)

```bash
# Add to crontab (crontab -e)
# Run weekly on Monday at 9am
0 9 * * 1 python3 ~/.claude/plugins/research-scientist/scripts/literature_watch.py --check-all >> ~/literature_watch.log 2>&1
```

### Option 3: launchd (macOS)

Create `~/Library/LaunchAgents/com.research-scientist.literature-watch.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.research-scientist.literature-watch</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/bro/.claude/plugins/research-scientist/scripts/literature_watch.py</string>
        <string>--check-all</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>1</integer>
        <key>Hour</key>
        <integer>9</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/literature_watch.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/literature_watch_error.log</string>
</dict>
</plist>
```

Load with: `launchctl load ~/Library/LaunchAgents/com.research-scientist.literature-watch.plist`

## Best Practices

1. **Start narrow**: Begin with specific queries, expand if needed
2. **Review weekly**: Even if automated, review findings weekly
3. **Refine queries**: Adjust queries based on relevance of results
4. **Cross-reference**: Compare with citation alerts from Google Scholar
5. **Track relevance**: Note high-relevance papers for immediate reading

## Integration with Other Skills

- **literature-management**: Use to add citations for relevant papers
- **session-logging**: Log literature review sessions
- **academic-writing**: Reference new papers in Discussion updates
