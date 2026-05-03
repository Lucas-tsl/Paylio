-- create_audit_user.sql
-- Run as a DBA on the postgres database (e.g., psql -U postgres -d postgres)
-- Replace 'audit_pw_here' with a secure password stored safely (or use a secret manager)

-- For local lab use we set a temporary audit password. Change for production.
CREATE ROLE audit_user
  LOGIN
  PASSWORD 'audit_local_pw'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOINHERIT;

-- Grant connect to the target DB
GRANT CONNECT ON DATABASE security_db TO audit_user;

-- Ensure usage on schema containing audit_logs
GRANT USAGE ON SCHEMA public TO audit_user;

-- Least-privilege: only SELECT on the audit_logs table
GRANT SELECT ON TABLE public.audit_logs TO audit_user;

-- Optional: show permissions (run in psql after connecting to security_db)
-- \c security_db
-- \dp public.audit_logs
