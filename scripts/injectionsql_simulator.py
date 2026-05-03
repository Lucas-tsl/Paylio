"""
injectionsql_simulator.py
Pédagogique - construit une requête vulnérable par concaténation et l'affiche.
NE PAS exécuter cette requête. Ce script ne tente PAS d'ouvrir une connexion DB.

Usage (exemple):
  python3 injectionsql_simulator.py "alice' OR '1'='1" "whatever"

Le script montre comment la requête se forme, sans l'exécuter.
"""
import sys
import shlex

def build_vulnerable_query(login, password):
    # Exemple vulnérable (NE PAS EXECUTER)
    sql = "SELECT * FROM users WHERE login = '" + login + "' AND password = '" + password + "'";
    return sql

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 injectionsql_simulator.py <login> <password>")
        sys.exit(1)

    login = sys.argv[1]
    password = sys.argv[2]

    vuln_sql = build_vulnerable_query(login, password)
    print("--- Vulnerable SQL (constructed) ---")
    # Use shlex.quote for safe terminal display, but do not execute.
    print(vuln_sql)
    print('\n--- Explanation ---')
    print("This string shows how user input is concatenated into the SQL statement.")
    print("Do NOT run this on a live database. Use parameterized queries instead.")
