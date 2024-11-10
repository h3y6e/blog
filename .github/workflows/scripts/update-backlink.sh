#!/bin/bash

set -e

readonly BACKLINK_TMP_FILE="backlink.md.tmp"
readonly HOME_FILE="Home.md"
readonly SIDEBAR_FILE="_Sidebar.md"

if [ -z "$WIKI_PATH" ]; then
  echo "WIKI_PATH is not set"
  exit 1
fi
cd "$WIKI_PATH"

if [ ! -f "$HOME_FILE" ]; then
  echo "<!-- backlink:start -->" > "$HOME_FILE"
  echo "<!-- backlink:end -->" >> "$HOME_FILE"
fi

if [ ! -f "$SIDEBAR_FILE" ]; then
  echo "<!-- backlink:start -->" > "$SIDEBAR_FILE"
  echo "<!-- backlink:end -->" >> "$SIDEBAR_FILE"
fi

echo "" > "$BACKLINK_TMP_FILE"
for file in *.md; do
  if [ "$file" != "$HOME_FILE" ] && [ "$file" != "$SIDEBAR_FILE" ]; then
    echo "* [[${file%.md}]]" >> "$BACKLINK_TMP_FILE"
  fi
done

update_backlink() {
  local file=$1
  if grep -q "<!-- backlink:start -->" "$file"; then
    awk -v tmp="$BACKLINK_TMP_FILE" '
    BEGIN { printing = 1 }
    /<!-- backlink:start -->/ {
      print
      system("cat " tmp)
      printing = 0
      next
    }
    /<!-- backlink:end -->/ {
      printing = 1
    }
    printing == 1 { print }
    ' "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
  else
    {
    echo "<!-- backlink:start -->"
    cat "$BACKLINK_TMP_FILE"
    echo "<!-- backlink:end -->"
    cat "$file"
    } > "$file.tmp"
    mv "$file.tmp" "$file"
  fi
}

update_backlink "$HOME_FILE"
update_backlink "$SIDEBAR_FILE"

rm "$BACKLINK_TMP_FILE"
