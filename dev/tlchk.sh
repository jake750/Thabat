#!/bin/bash
# usage: tlchk.sh newfile.js basefile.html
# Reports names a new module would declare that the app already declares. Function declarations are found anywhere on a
# line (a second «function foo» silently replaces the first, even after «const X={};» on the same line — hNum, 3.28.0);
# const/let only at the start of a line (block-scoped helpers like «{const _f=foo;…}» are fine to repeat).
{ grep -o -E "(^|[;{}])[[:space:]]*(async )?function [A-Za-z_\$][A-Za-z0-9_\$]*" "$1" | grep -o -E "function [A-Za-z_\$][A-Za-z0-9_\$]*"
  grep -o -E "^(const|let) [A-Za-z_\$][A-Za-z0-9_\$]*" "$1"; } | awk '{print $NF}' | sort -u | while read n; do
  c=$(grep -c -E "(function |const |let |var )$n\b" "$2"); [ "$c" -gt 0 ] && echo "COLLIDE $n"; done; true
