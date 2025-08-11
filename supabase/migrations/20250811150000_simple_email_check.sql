-- Simple, efficient email existence check
-- Replaces over-engineered solution with clean, minimal approach

DROP FUNCTION IF EXISTS check_email_exists_secure(TEXT);
DROP FUNCTION IF EXISTS check_email_exists_with_audit(TEXT, TEXT, TEXT, TEXT);
DROP TABLE IF EXISTS auth.email_check_audit;

-- Simple, fast email check function
CREATE OR REPLACE FUNCTION check_email_exists(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE email = LOWER(TRIM(email_input))
    LIMIT 1
  );
$$;

-- Minimal permissions
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO service_role;