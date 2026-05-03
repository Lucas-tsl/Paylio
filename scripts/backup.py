#!/usr/bin/env python3
"""
backup.py
Déclenche une sauvegarde de la base via docker exec pg_dump.
Le fichier de sortie est créé sur l'hôte dans BACKUP_DIR.
"""
import os
import subprocess
from datetime import datetime
import shlex

CONTAINER_NAME = os.getenv("DB_CONTAINER", "safebank_db")
DB_NAME = os.getenv("DB_NAME", "security_db")
DB_USER = os.getenv("DB_USER", "postgres")
OUT_DIR = os.getenv("BACKUP_DIR", ".")

if not os.path.isdir(OUT_DIR):
    os.makedirs(OUT_DIR, exist_ok=True)

timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
outfile = os.path.join(OUT_DIR, f"{DB_NAME}_backup_{timestamp}.sql")


def run_backup():
    # Commande non destructive: docker exec <container> pg_dump -U <user> -d <db>
    cmd = ["docker", "exec", CONTAINER_NAME, "pg_dump", "-U", DB_USER, "-d", DB_NAME]
    print("Running:", " ".join(shlex.quote(c) for c in cmd))

    with open(outfile, "wb") as f:
        proc = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE)

    if proc.returncode == 0:
        print("Backup succeeded:", outfile)
    else:
        print("Backup failed, stderr:", proc.stderr.decode("utf-8", errors="ignore"))


if __name__ == '__main__':
    run_backup()
