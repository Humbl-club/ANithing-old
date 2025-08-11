export function useAuthValidation() {
  const validatePasswordStrength = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    validatePasswordStrength,
    validateEmailFormat,
  };
}