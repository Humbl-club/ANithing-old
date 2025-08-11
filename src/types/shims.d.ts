// Ambient module shims for packages without types
// This keeps strict mode while unblocking build.
declare module 'validator' {
  const validator: any;
  export default validator;
}
declare module 'zxcvbn' {
  interface ZXCVBNFeedback {
    suggestions: string[];
    warning?: string;
  }
  interface ZXCVBNResult {
    score: number;
    feedback: ZXCVBNFeedback;
  }
  function zxcvbn(password: string): ZXCVBNResult;
  export default zxcvbn;
}
