#!/usr/bin/env python3
"""
audit.py
Se connecte en tant que `audit_user` (lecture seule) et affiche les logs d'audit.
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5434))
DB_NAME = os.getenv("DB_NAME", "security_db")
DB_USER = os.getenv("AUDIT_DB_USER", "audit_user")
DB_PASSWORD = os.getenv("AUDIT_DB_PASSWORD", "audit_local_pw")


def get_audit_logs(limit=100):
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT user_login, action, status, created_at FROM public.audit_logs ORDER BY created_at DESC LIMIT %s",
                (limit,)
            )
            return cur.fetchall()
    finally:
        conn.close()


def pretty_print(logs):
    for r in logs:
        ts = r.get("created_at")
        if isinstance(ts, datetime):
            ts = ts.isoformat()
        print(f"[{ts}] {r.get('user_login')} : {r.get('action')} -> {r.get('status')}")


if __name__ == '__main__':
    logs = get_audit_logs(50)
    pretty_print(logs)
