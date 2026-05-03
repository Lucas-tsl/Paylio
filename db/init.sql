BEGIN;

DROP TABLE IF EXISTS comptes CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(25),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE comptes (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type_compte VARCHAR(30) NOT NULL CHECK (type_compte IN ('courant', 'epargne', 'professionnel')),
  solde NUMERIC(12, 2) NOT NULL DEFAULT 0,
  devise CHAR(3) NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Users table for authentication testing (password_hash should store bcrypt hashes)
CREATE TABLE IF NOT EXISTS users (
  login VARCHAR(100) PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO clients (nom, prenom, email, telephone) VALUES
  ('Dupont', 'Alice', 'alice.dupont@example.com', '+33611111111'),
  ('Martin', 'Bruno', 'bruno.martin@example.com', '+33622222222'),
  ('Petit', 'Claire', 'claire.petit@example.com', '+33633333333');

INSERT INTO comptes (client_id, type_compte, solde, devise) VALUES
  (1, 'courant', 1520.45, 'EUR'),
  (1, 'epargne', 8200.00, 'EUR'),
  (2, 'courant', 400.12, 'EUR'),
  (3, 'professionnel', 15400.00, 'EUR');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'role_directeur') THEN
    CREATE ROLE role_directeur NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'role_conseiller') THEN
    CREATE ROLE role_conseiller NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'role_analyste') THEN
    CREATE ROLE role_analyste NOLOGIN;
  END IF;
END
$$;

REVOKE ALL ON TABLE clients, comptes FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

GRANT ALL PRIVILEGES ON TABLE clients, comptes TO role_directeur;
GRANT SELECT, INSERT, UPDATE ON TABLE clients, comptes TO role_conseiller;
GRANT SELECT ON TABLE clients, comptes TO role_analyste;

GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO role_directeur;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO role_conseiller;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO role_analyste;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin
      LOGIN
      INHERIT
      NOSUPERUSER
      CREATEDB
      CREATEROLE
      NOBYPASSRLS
      PASSWORD 'admin_secure_pw';
  ELSE
    ALTER ROLE admin WITH
      LOGIN
      INHERIT
      NOSUPERUSER
      CREATEDB
      CREATEROLE
      NOBYPASSRLS
      PASSWORD 'admin_secure_pw';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user
      LOGIN
      INHERIT
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOBYPASSRLS
      PASSWORD 'app_user_pw';
  ELSE
    ALTER ROLE app_user WITH
      LOGIN
      INHERIT
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOBYPASSRLS
      PASSWORD 'app_user_pw';
  END IF;
END
$$;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO role_directeur, role_conseiller, role_analyste;
GRANT CREATE ON SCHEMA public TO admin;

GRANT role_directeur TO admin;
GRANT role_analyste TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO role_directeur;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE ON TABLES TO role_conseiller;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO role_analyste;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO role_directeur;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO role_conseiller;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON SEQUENCES TO role_analyste;

COMMIT;
