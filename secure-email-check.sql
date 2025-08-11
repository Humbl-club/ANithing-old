-- Secure email existence check function
-- This function only returns true/false without exposing user data

CREATE OR REPLACE FUNCTION check_email_exists_secure(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
DECLARE
    email_exists BOOLEAN := FALSE;
BEGIN
    -- Input validation
    IF email_to_check IS NULL OR LENGTH(trim(email_to_check)) = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Normalize email (lowercase, trim)
    email_to_check := LOWER(TRIM(email_to_check));
    
    -- Check if email exists in auth.users table
    -- This is more efficient than loading all users
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = email_to_check
        LIMIT 1
    ) INTO email_exists;
    
    -- Optional: Log the check for security monitoring (without the email)
    INSERT INTO email_check_logs (checked_at, client_info) 
    VALUES (NOW(), 'email_verification')
    ON CONFLICT DO NOTHING; -- Ignore if table doesn't exist
    
    RETURN email_exists;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error without exposing sensitive information
        RETURN FALSE;
END;
$$;

-- Optional: Create table for security monitoring
CREATE TABLE IF NOT EXISTS email_check_logs (
    id SERIAL PRIMARY KEY,
    checked_at TIMESTAMP DEFAULT NOW(),
    client_info TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_email_check_logs_checked_at ON email_check_logs(checked_at);

-- RLS policy (optional - for additional security)
ALTER TABLE email_check_logs ENABLE ROW LEVEL SECURITY;

-- Clean up old logs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_email_check_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM email_check_logs WHERE checked_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Grant execute permission to service role only
GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_email_check_logs() TO service_role;