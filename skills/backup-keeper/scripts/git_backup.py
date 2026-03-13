#!/usr/bin/env python3
"""
Git Auto Backup Script
Automatically commits and pushes changes in the workspace.
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path


def run_git_command(cmd, cwd):
    """Run a git command and return output."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            encoding='utf-8',
            errors='replace',
            check=False
        )
        stdout = result.stdout.strip() if result.stdout else ""
        stderr = result.stderr.strip() if result.stderr else ""
        return result.returncode, stdout, stderr
    except Exception as e:
        return 1, "", str(e)


def check_git_repo(workspace_path):
    """Check if the workspace is a git repository."""
    git_dir = workspace_path / ".git"
    if not git_dir.exists():
        return False, "Not a git repository. Run 'git init' first."
    return True, ""


def get_git_status(workspace_path):
    """Get current git status."""
    code, stdout, stderr = run_git_command(
        ["git", "status", "--porcelain"],
        workspace_path
    )
    
    if code != 0:
        return None, f"Git status failed: {stderr}"
    
    return stdout, ""


def parse_git_status(status_output):
    """Parse git status output and count changes."""
    if not status_output:
        return 0, 0, 0, 0
    
    modified = 0
    added = 0
    deleted = 0
    untracked = 0
    
    for line in status_output.split('\n'):
        if not line:
            continue
        
        status = line[:2]
        
        if 'M' in status:
            modified += 1
        elif 'A' in status:
            added += 1
        elif 'D' in status:
            deleted += 1
        elif '??' in status:
            untracked += 1
    
    return modified, added, deleted, untracked


def create_commit_message(modified, added, deleted, untracked):
    """Create a formatted commit message."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    lines = [f"Auto backup: {timestamp}", ""]
    
    if modified > 0:
        lines.append(f"- Modified: {modified} file(s)")
    if added > 0:
        lines.append(f"- Added: {added} file(s)")
    if deleted > 0:
        lines.append(f"- Deleted: {deleted} file(s)")
    if untracked > 0:
        lines.append(f"- Untracked: {untracked} file(s)")
    
    return "\n".join(lines)


def git_backup(workspace_path, dry_run=False, push=True):
    """
    Perform git backup: stage, commit, and optionally push.
    
    Args:
        workspace_path: Path to the workspace
        dry_run: If True, only show what would be done
        push: If True, push to remote after commit
    
    Returns:
        (success, message)
    """
    # Check if it's a git repo
    is_repo, error = check_git_repo(workspace_path)
    if not is_repo:
        return False, error
    
    # Get status
    status, error = get_git_status(workspace_path)
    if error:
        return False, error
    
    # Check if there are changes
    if not status:
        return True, "[OK] No changes to backup"
    
    # Parse changes
    modified, added, deleted, untracked = parse_git_status(status)
    total_changes = modified + added + deleted + untracked
    
    if total_changes == 0:
        return True, "[OK] No changes to backup"
    
    # Create commit message
    commit_msg = create_commit_message(modified, added, deleted, untracked)
    
    if dry_run:
        return True, f"[DRY RUN] Would commit:\n\n{commit_msg}\n\nTotal: {total_changes} change(s)"
    
    # Stage all changes (including untracked)
    code, stdout, stderr = run_git_command(
        ["git", "add", "-A"],
        workspace_path
    )
    
    if code != 0:
        return False, f"[ERROR] Failed to stage changes: {stderr}"
    
    # Commit
    code, stdout, stderr = run_git_command(
        ["git", "commit", "-m", commit_msg],
        workspace_path
    )
    
    if code != 0:
        return False, f"[ERROR] Failed to commit: {stderr}"
    
    result_msg = f"[OK] Committed {total_changes} change(s)\n\n{commit_msg}"
    
    # Push if requested
    if push:
        # Check if remote exists
        code, stdout, stderr = run_git_command(
            ["git", "remote"],
            workspace_path
        )
        
        if code == 0 and stdout:
            # Remote exists, try to push
            code, stdout, stderr = run_git_command(
                ["git", "push"],
                workspace_path
            )
            
            if code == 0:
                result_msg += "\n\n[OK] Pushed to remote"
            else:
                result_msg += f"\n\n[WARNING] Push failed: {stderr}\n(Commit saved locally)"
        else:
            result_msg += "\n\n[WARNING] No remote configured (commit saved locally)"
    
    return True, result_msg


def main():
    """Main entry point."""
    import argparse
    
    # Fix encoding for Windows console
    if sys.stdout.encoding != 'utf-8':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    parser = argparse.ArgumentParser(description="Git auto backup script")
    parser.add_argument(
        "--workspace",
        type=str,
        default=".",
        help="Path to workspace (default: current directory)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without actually committing"
    )
    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Don't push to remote (commit locally only)"
    )
    
    args = parser.parse_args()
    
    workspace_path = Path(args.workspace).resolve()
    
    if not workspace_path.exists():
        print(f"[ERROR] Workspace not found: {workspace_path}", file=sys.stderr)
        sys.exit(1)
    
    success, message = git_backup(
        workspace_path,
        dry_run=args.dry_run,
        push=not args.no_push
    )
    
    print(message)
    
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
