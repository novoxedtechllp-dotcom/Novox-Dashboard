-- This script enables Row Level Security (RLS) for ALL tables in the public schema.
-- Since your backend uses the SUPABASE_SERVICE_ROLE_KEY, it will bypass RLS and continue to work normally.
-- However, any malicious requests coming from the outside (e.g. using the public anon key) will be completely blocked.

DO $$
DECLARE
    row record;
BEGIN
    FOR row IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', row.tablename);
    END LOOP;
END;
$$;
