# Bank Lab - PostgreSQL + API + Dashboard

Ce projet fournit un environnement local conteneurise avec:
- PostgreSQL sur le port 5432
- API Node.js/Express + dashboard web sur le port 3001
- Initialisation SQL avec RBAC et principe de moindre privilege
- Pipeline GitHub Actions de build

## Demarrage rapide

1. Lancer les services:

   docker compose up --build

2. Ouvrir le dashboard:

   http://localhost:3001

3. Verifier la sante API:

   http://localhost:3001/api/health

## Fichiers principaux

- docker-compose.yml
- .env
- db/init.sql
- app/server.js
- public/index.html
- .github/workflows/ci.yml

## RBAC configure dans init.sql

- role_directeur: ALL PRIVILEGES sur tables clients/comptes
- role_conseiller: SELECT, INSERT, UPDATE
- role_analyste: SELECT uniquement

Comptes SQL crees:
- admin: LOGIN, CREATEDB, CREATEROLE, NOSUPERUSER, herite de role_directeur
- app_user: LOGIN, NOSUPERUSER, herite de role_analyste (lecture seule)

## Identifiants DBeaver

Host: localhost
Port: 5434
Database: bank_lab

Compte admin:
- User: admin
- Password: admin_secure_pw

Compte application:
- User: app_user
- Password: app_user_pw

## Requetes de verification (legitimes)

SELECT * FROM clients;
SELECT * FROM comptes;

## CI

Le workflow .github/workflows/ci.yml declenche sur push/pull_request vers main et execute:
- docker compose build
