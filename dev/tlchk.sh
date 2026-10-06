#!/bin/bash
# usage: tlchk.sh newfile.js basefile.html
grep -o -E "^(async )?function [A-Za-z_\$][A-Za-z0-9_\$]*|^(const|let) [A-Za-z_\$][A-Za-z0-9_\$]*" "$1" | awk '{print $NF}' | sort -u | while read n; do c=$(grep -c -E "(function |const |let |var )$n\b" "$2"); [ "$c" -gt 0 ] && echo "COLLIDE $n"; done; true
