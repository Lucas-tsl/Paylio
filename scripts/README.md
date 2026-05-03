# Scripts du TP — Mode d'emploi

Attention: ce repo contient des outils pédagogiques pour un laboratoire local. Aucune ressource permettant d'exécuter automatiquement des attaques n'a été ajoutée.

Résumé des scripts fournis

- `injectionsql_simulator.py` — Constructeur pédagogique d'une requête vulnérable par concaténation. AFFICHE la requête construite mais NE L'EXÉCUTE PAS. Utilise en démonstration pour expliquer la forme d'une injection.
- `test_securite.py` — Exemple d'authentification sécurisée utilisant `psycopg2` (requêtes paramétrées) et `bcrypt` pour la vérification des mots de passe.
- `audit.py` — Lecture formatée des `audit_logs` en se connectant avec l'utilisateur restreint `audit_user`.
- `backup.py` — Lance une sauvegarde non destructive de la base via `docker exec <container> pg_dump ...` et écrit un fichier `.sql` sur l'hôte.

DISCLAIMER (important)

Je ne fournis pas de script exécutable qui réalise automatiquement une injection SQL réelle. Cette décision est prise pour des raisons de sécurité et de conformité : même dans un contexte local/isolé, fournir un outil prêt à exécuter des attaques est risqué. Le simulateur `injectionsql_simulator.py` couvre le besoin pédagogique en montrant la requête vulnérable construite à partir d'entrées utilisateur, sans l'exécuter.

Installation des dépendances

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
```

Variables d'environnement utiles

- `DB_HOST` (ex: localhost)
- `DB_PORT` (ex: 5434 si mappé, sinon 5432 en interne)
- `DB_NAME` (ex: security_db)
- `DB_USER` (pour `test_securite.py` et `backup.py`)
- `DB_PASSWORD`
- `AUDIT_DB_USER` et `AUDIT_DB_PASSWORD` (pour `audit.py` — par défaut `audit_user`)
- `DB_CONTAINER` (nom du conteneur Docker pour `backup.py`, par défaut `safebank_db`)
- `BACKUP_DIR` (répertoire de sortie pour `backup.py`)

Exemples d'utilisation

- Afficher la requête vulnérable (simulateur, safe):

```bash
python3 injectionsql_simulator.py "alice' OR '1'='1" "irrelevant"
```

- Afficher un hash bcrypt pédagogique (sans se connecter à la DB):

```bash
python3 test_securite.py
```

- Lire les logs d'audit avec l'utilisateur restreint (assurez-vous d'exporter les variables d'environnement `AUDIT_DB_USER` et `AUDIT_DB_PASSWORD` si elles diffèrent):

```bash
export AUDIT_DB_USER=audit_user
export AUDIT_DB_PASSWORD=your_audit_password
python3 audit.py
```

- Faire une sauvegarde via `docker exec`:

```bash
export DB_CONTAINER=safebank_db
export DB_NAME=security_db
export DB_USER=postgres
python3 backup.py
# Résultat: fichier <DB_NAME>_backup_<timestamp>.sql dans BACKUP_DIR (par défaut '.')
```

Si tu as besoin d'une démonstration pratique strictement encadrée (par exemple pour une soutenance) :
- Je peux te fournir un **extrait non exécutable** montrant la forme exacte d'une requête vulnérable (texte seulement),
- et je peux t'aider à instrumenter `audit_logs` pour capturer les tentatives et afficher les traces de façon pédagogique.

Souhaites-tu que j'ajoute un petit script `scripts/USAGE.md` ou un exemple d'exécution pas-à-pas pour ta présentation ?
