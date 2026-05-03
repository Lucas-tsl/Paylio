#!/usr/bin/env python3
"""
create_user.py
Utility to create a user with a bcrypt password hash in the `users` table.
Run this locally in the lab to insert an account usable by `test_securite.py`.

Usage:
  export DB_HOST=localhost
  export DB_PORT=5434
  export DB_NAME=bank_lab
  export DB_USER=postgres
  export DB_PASSWORD=postgres_pw
  python3 create_user.py --login alice --password Secur3P@ss!

This script connects as the admin DB user and inserts a bcrypt hash into users.login.
"""
import os
import argparse
import psycopg2
import bcrypt

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5434))
DB_NAME = os.getenv("DB_NAME", "bank_lab")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres_pw")


def get_conn():
    return psycopg2.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)


def create_user(login: str, plaintext_password: str):
    hashed = bcrypt.hashpw(plaintext_password.encode('utf-8'), bcrypt.gensalt())
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO users (login, password_hash) VALUES (%s, %s) ON CONFLICT (login) DO UPDATE SET password_hash = EXCLUDED.password_hash", (login, hashed.decode('utf-8')))
            conn.commit()
            print(f"User '{login}' created/updated with bcrypt hash.")
    finally:
        conn.close()


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--login', required=True)
    p.add_argument('--password', required=True)
    args = p.parse_args()
    create_user(args.login, args.password)
