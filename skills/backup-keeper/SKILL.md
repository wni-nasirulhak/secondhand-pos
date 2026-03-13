---
name: backup-keeper
description: Automatic git backup system for workspace files. Use when the user wants to backup, commit, or save workspace changes to git. Triggers on requests like "backup workspace", "save my changes", "commit files", or during heartbeat checks to auto-backup periodically.
---

# Backup Keeper

Automatic git backup system that commits and pushes workspace changes safely.

## Overview

Backup Keeper helps maintain version control of the workspace by:
- Auto-detecting file changes (modified, added, deleted, untracked)
- Creating descriptive commit messages with change summaries
- Committing changes locally and optionally pushing to remote
- Supporting dry-run mode to preview changes before committing

## When to Use

**Automatic (via heartbeat):**
- Check workspace every 30-60 minutes
- Commit if changes detected
- Useful for continuous backup without manual intervention

**Manual:**
- User asks: "backup workspace", "save my changes", "commit files"
- Before starting large projects: "backup before I start"
- Before risky operations: "save current state first"

## Quick Start

### Basic backup (commit + push)
```bash
python scripts/git_backup.py --workspace /path/to/workspace
```

### Preview changes (dry-run)
```bash
python scripts/git_backup.py --workspace /path/to/workspace --dry-run
```

### Commit locally only (no push)
```bash
python scripts/git_backup.py --workspace /path/to/workspace --no-push
```

## Workflow

1. **Check git status** → Detect changed files
2. **Parse changes** → Count modified/added/deleted/untracked
3. **Create commit message** → Format with timestamp and summary
4. **Stage all changes** → `git add -A`
5. **Commit** → With generated message
6. **Push (optional)** → If remote exists

## Commit Message Format

```
Auto backup: YYYY-MM-DD HH:MM

- Modified: X file(s)
- Added: Y file(s)
- Deleted: Z file(s)
- Untracked: W file(s)
```

## Output Messages

- `[OK] No changes to backup` → Workspace is clean
- `[OK] Committed X change(s)` → Success
- `[OK] Pushed to remote` → Pushed successfully
- `[WARNING] No remote configured` → Commit saved locally only
- `[WARNING] Push failed` → Commit saved locally, push failed
- `[ERROR] ...` → Operation failed

## Integration with Heartbeat

Add to `HEARTBEAT.md` for automatic periodic backups:

```markdown
## Workspace Backup

Check for workspace changes every 30-60 minutes:
1. Run: `python skills/backup-keeper/scripts/git_backup.py --workspace .`
2. If changes detected → commit + push
3. If no changes → skip silently
4. Log result in `memory/YYYY-MM-DD.md`
```

## Prerequisites

- Workspace must be a git repository (`git init` if not)
- Git must be installed and available in PATH
- Optional: Remote repository configured for push (`git remote add origin <url>`)

## Troubleshooting

**"Not a git repository"**
→ Run `git init` in the workspace first

**"No remote configured"**
→ Run `git remote add origin <url>` to add remote (or use `--no-push` for local-only)

**"Push failed"**
→ Commit is saved locally; check network, remote URL, or authentication

## Example Usage

**Manual backup:**
```
User: "Backup my workspace please"
Agent: [runs script]
       "[OK] Committed 5 change(s)
       
       Auto backup: 2026-03-13 10:30
       - Modified: 3 file(s)
       - Added: 2 file(s)
       
       [OK] Pushed to remote"
```

**Heartbeat backup:**
```
Heartbeat → Check workspace → Changes detected
           → Run git_backup.py
           → "[OK] Committed 2 change(s) ... [OK] Pushed to remote"
           → Log to memory/2026-03-13.md
```

**Dry-run preview:**
```
User: "What would be backed up?"
Agent: [runs script with --dry-run]
       "[DRY RUN] Would commit:
       
       Auto backup: 2026-03-13 10:30
       - Modified: 3 file(s)
       - Untracked: 1 file(s)
       
       Total: 4 change(s)"
```

## Resources

### scripts/git_backup.py

Main backup script that handles git operations:
- Detects workspace changes via `git status`
- Stages all changes (`git add -A`)
- Commits with formatted message
- Optionally pushes to remote

**Arguments:**
- `--workspace <path>` - Path to workspace (default: current directory)
- `--dry-run` - Preview changes without committing
- `--no-push` - Commit locally without pushing to remote

**Exit codes:**
- `0` - Success (committed or no changes)
- `1` - Error (not a git repo, commit failed, etc.)
