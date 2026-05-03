#!/usr/bin/env python3
"""
test_securite.py
Exemple pédagogique d'authentification sécurisée:
- Requêtes paramétrées avec psycopg2
- Vérification de mot de passe avec bcrypt

La fonction `authenticate_user` se connecte à la base si on veut l'utiliser réellement.
Le bloc __main__ illustre le hashing et n'exécute pas de connexion par défaut.
"""
import os
import psycopg2
import bcrypt
from typing import Optional

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME", "security_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")


def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )


def get_stored_hash(login: str) -> Optional[bytes]:
    """Récupère le password_hash pour l'utilisateur `login` en utilisant une requête paramétrée."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT password_hash FROM users WHERE login = %s", (login,))
            row = cur.fetchone()
            if row:
                h = row[0]
                return h.encode('utf-8') if isinstance(h, str) else h
            return None
    finally:
        conn.close()


def authenticate_user(login: str, plaintext_password: str) -> bool:
    """Authentifie l'utilisateur de façon sécurisée (paramétré + bcrypt)."""
    stored = get_stored_hash(login)
    if not stored:
        return False
    return bcrypt.checkpw(plaintext_password.encode('utf-8'), stored)


if __name__ == '__main__':
    # Exemple pédagogique: montrer hashing sans effectuer d'opération DB dangereuse
    test_login = 'alice'
    test_password = 'Secur3P@ss!'
    hashed = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
    print('Example (do not store plain):')
    print('login:', test_login)
    print('password:', test_password)
    print('bcrypt hash:', hashed.decode('utf-8'))
    print('\nTo actually authenticate against your DB, set DB_* env vars and call authenticate_user(login, password).')
