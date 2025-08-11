export function useScoreValidation() {
  return {
    validate: (score: number) => score >= 0 && score <= 10,
    getValidationType: (score: number) => 'accurate'
  };
}
