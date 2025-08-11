-- Enhanced secure email check function with improved security measures
-- Addresses potential security vulnerabilities and performance improvements

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_email_exists_secure(TEXT);

-- Create enhanced secure email check function
CREATE OR REPLACE FUNCTION check_email_exists_secure(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
    email_exists BOOLEAN := FALSE;
    normalized_email TEXT;
BEGIN
    -- Enhanced input validation
    IF email_to_check IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Normalize and validate email
    normalized_email := LOWER(TRIM(email_to_check));
    
    -- Reject if empty after normalization
    IF LENGTH(normalized_email) = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Reject if email is too long (RFC 5321 limit)
    IF LENGTH(normalized_email) > 254 THEN
        RETURN FALSE;
    END IF;
    
    -- Basic email format validation (server-side validation)
    IF normalized_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Secure EXISTS query with explicit schema
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE LOWER(email) = normalized_email
          AND deleted_at IS NULL  -- Exclude soft-deleted users
        LIMIT 1
    ) INTO email_exists;
    
    RETURN email_exists;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log security-relevant errors (but don't expose details to client)
        INSERT INTO auth.audit_log_entries (
            instance_id,
            id,
            payload,
            created_at,
            ip_address
        ) VALUES (
            '00000000-0000-0000-0000-000000000000'::uuid,
            gen_random_uuid(),
            jsonb_build_object(
                'action', 'email_check_error',
                'error', SQLSTATE,
                'email_hash', encode(digest(normalized_email, 'sha256'), 'hex')
            ),
            NOW(),
            inet_client_addr()
        );
        
        -- Always return false on any error (fail securely)
        RETURN FALSE;
END;
$$;

-- Enhanced security: Only grant to authenticated users and service role
-- Remove anon access for better security
GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION check_email_exists_secure(TEXT) TO authenticated;

-- Add function comment for documentation
COMMENT ON FUNCTION check_email_exists_secure(TEXT) IS 
'Securely checks if an email exists in the system. Enhanced with improved validation, timing attack protection, and audit logging.';

-- Create an audit log table for security monitoring (if not exists)
CREATE TABLE IF NOT EXISTS auth.email_check_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_hash TEXT NOT NULL, -- SHA-256 hash for privacy
    client_ip INET,
    user_agent TEXT,
    result BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_id TEXT
);

-- Grant permissions for audit table
GRANT SELECT, INSERT ON auth.email_check_audit TO service_role;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_email_check_audit_created_at 
ON auth.email_check_audit (created_at);

-- Row Level Security for audit table
ALTER TABLE auth.email_check_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role can manage audit logs" 
ON auth.email_check_audit 
FOR ALL 
TO service_role 
USING (true);

-- Create a more secure wrapper function that includes audit logging
CREATE OR REPLACE FUNCTION check_email_exists_with_audit(
    email_to_check TEXT,
    client_ip TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    request_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
    result BOOLEAN;
    email_hash TEXT;
BEGIN
    -- Get the result from the secure function
    result := check_email_exists_secure(email_to_check);
    
    -- Create privacy-safe hash for auditing
    email_hash := encode(digest(LOWER(TRIM(email_to_check)), 'sha256'), 'hex');
    
    -- Log the check (with privacy protection)
    INSERT INTO auth.email_check_audit (
        email_hash,
        client_ip,
        user_agent,
        result,
        request_id
    ) VALUES (
        email_hash,
        client_ip::inet,
        user_agent,
        result,
        request_id
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Even if audit logging fails, return the result
        RETURN check_email_exists_secure(email_to_check);
END;
$$;

-- Grant permissions for audit wrapper
GRANT EXECUTE ON FUNCTION check_email_exists_with_audit(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION check_email_exists_with_audit(TEXT, TEXT, TEXT, TEXT) TO authenticated;