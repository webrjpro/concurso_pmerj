#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is required."
  exit 1
fi

DB_FILE="${DATABASE_URL#file:}"

case "$DB_FILE" in
  /*) ;;
  *) DB_FILE="/app/prisma/${DB_FILE#./}" ;;
esac

mkdir -p "$(dirname "$DB_FILE")"

if [ ! -f "$DB_FILE" ]; then
  echo "Preparing database at $DB_FILE"
  # Em prod, db push nao deve rodar automaticamente, mas sqlite as vezes precisa criar o arquivo
  touch "$DB_FILE"
fi

exec "$@"
