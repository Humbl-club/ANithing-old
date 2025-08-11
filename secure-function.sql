CREATE OR REPLACE FUNCTION check_email_exists_secure(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    email_exists BOOLEAN := FALSE;
BEGIN
    IF email_to_check IS NULL OR LENGTH(trim(email_to_check)) = 0 THEN
        RETURN FALSE;
    END IF;
    
    email_to_check := LOWER(TRIM(email_to_check));
    
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = email_to_check
        LIMIT 1
    ) INTO email_exists;
    
    RETURN email_exists;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO anon;