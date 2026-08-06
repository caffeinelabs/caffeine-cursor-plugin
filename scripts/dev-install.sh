#!/usr/bin/env bash
#
# Install this plugin's contents into the places Cursor reads directly, so the
# whole thing can be exercised end to end without the plugin loader.
#
# Useful when user-local plugin loading is disabled in Cursor (the plugin log
# will say "userLocal=false"), or before a marketplace is set up.
#
#   ./scripts/dev-install.sh <workspace-dir>
#   ./scripts/dev-install.sh --uninstall <workspace-dir>
#
# Everything is symlinked back to this repo, so edits take effect on the next
# window reload. Nothing is overwritten: an existing file is backed up first.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN="$REPO/plugins/caffeine"
SKILLS_HOME="$HOME/.cursor/skills-cursor"

UNINSTALL=false
if [[ "${1:-}" == "--uninstall" ]]; then
  UNINSTALL=true
  shift
fi

WORKSPACE="${1:-}"
if [[ -z "$WORKSPACE" ]]; then
  echo "usage: $0 [--uninstall] <workspace-dir>" >&2
  exit 1
fi
if [[ ! -d "$WORKSPACE" ]]; then
  echo "error: not a directory: $WORKSPACE" >&2
  exit 1
fi
WORKSPACE="$(cd "$WORKSPACE" && pwd)"

# Remove a path only when it is our symlink; never touch a real file.
remove_link() {
  if [[ -L "$1" ]]; then
    rm "$1"
    echo "  removed  $1"
  elif [[ -e "$1" ]]; then
    echo "  skipped  $1 (not a symlink; left alone)"
  fi
}

link() {
  local src="$1" dest="$2"
  if [[ -L "$dest" ]]; then
    rm "$dest"
  elif [[ -e "$dest" ]]; then
    mv "$dest" "$dest.bak-$(date +%s)"
    echo "  backed up existing $dest"
  fi
  ln -s "$src" "$dest"
  echo "  linked   ${dest/#$HOME/\~}"
}

skill_names() {
  for dir in "$PLUGIN"/skills/*/; do
    [[ -f "$dir/SKILL.md" ]] || continue
    awk -F': *' '/^name:/ {print $2; exit}' "$dir/SKILL.md"
  done
}

if $UNINSTALL; then
  echo "Uninstalling from $WORKSPACE"
  for f in "$WORKSPACE"/.cursor/rules/*.mdc; do
    [[ -L "$f" ]] && [[ "$(readlink "$f")" == "$PLUGIN"* ]] && remove_link "$f"
  done
  for f in "$WORKSPACE"/.cursor/commands/*.md; do
    [[ -L "$f" ]] && [[ "$(readlink "$f")" == "$PLUGIN"* ]] && remove_link "$f"
  done
  remove_link "$WORKSPACE/.cursor/mcp.json"
  while read -r name; do
    [[ -n "$name" ]] && remove_link "$SKILLS_HOME/$name"
  done < <(skill_names)
  echo "Done. Reload the Cursor window."
  exit 0
fi

echo "Installing $PLUGIN into $WORKSPACE"

mkdir -p "$WORKSPACE/.cursor/rules" "$WORKSPACE/.cursor/commands" "$SKILLS_HOME"

echo "MCP server:"
link "$PLUGIN/mcp.json" "$WORKSPACE/.cursor/mcp.json"

echo "Rules:"
for f in "$PLUGIN"/rules/*.mdc; do
  link "$f" "$WORKSPACE/.cursor/rules/$(basename "$f")"
done

echo "Commands:"
for f in "$PLUGIN"/commands/*.md; do
  link "$f" "$WORKSPACE/.cursor/commands/$(basename "$f")"
done

echo "Skills:"
for dir in "$PLUGIN"/skills/*/; do
  [[ -f "$dir/SKILL.md" ]] || continue
  name="$(awk -F': *' '/^name:/ {print $2; exit}' "$dir/SKILL.md")"
  [[ -n "$name" ]] || { echo "  skipped  $dir (no name in frontmatter)"; continue; }
  link "${dir%/}" "$SKILLS_HOME/$name"
done

cat <<EOF

Installed. Next:

  1. Open $WORKSPACE in Cursor (reload the window if it is already open).
  2. Run /caffeine-projects — it only reads, and triggers the browser sign-in.
  3. Then /caffeine-new <a one-line app brief> for the full create-and-build path.

Skills are user-scoped, so they are visible in every workspace until you run:

  $0 --uninstall $WORKSPACE
EOF
