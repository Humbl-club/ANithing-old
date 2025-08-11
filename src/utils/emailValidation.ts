export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: re.test(email),
    errors: re.test(email) ? [] : ['Invalid email format'],
    suggestions: []
  };
}
