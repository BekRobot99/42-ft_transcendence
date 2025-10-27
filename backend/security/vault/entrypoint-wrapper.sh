#!/bin/sh
set -e

relax_perms() {
  target="$1"
  if [ -d "$target" ]; then
    if chown -R vault:vault "$target" 2>/dev/null; then
      chmod -R 700 "$target" || true
    else
      echo "[vault-entrypoint] Warning: unable to chown $target; relaxing permissions instead." >&2
      chmod -R 770 "$target" || true
    fi
  fi
}

relax_perms /vault/data
relax_perms /vault/logs

exec /usr/local/bin/docker-entrypoint.sh "$@"
