-- Update check_email_exists function with your modifications
-- Example: Return more information about the email check

CREATE OR REPLACE FUNCTION check_email_exists(email_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Example modification: Return more details about the email
  SELECT jsonb_build_object(
    'exists', EXISTS(SELECT 1 FROM auth.users WHERE email = LOWER(TRIM(email_input))),
    'normalized_email', LOWER(TRIM(email_input)),
    'checked_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO service_role;

-- Note: To revert to simple boolean version, uncomment below:
-- CREATE OR REPLACE FUNCTION check_email_exists(email_input TEXT)
-- RETURNS BOOLEAN
-- LANGUAGE sql
-- SECURITY DEFINER
-- STABLE
-- AS $$
--   SELECT EXISTS(
--     SELECT 1 FROM auth.users 
--     WHERE email = LOWER(TRIM(email_input))
--     LIMIT 1
--   );
-- $$;