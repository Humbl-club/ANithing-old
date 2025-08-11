export const VALIDATION_LABELS = {
  hidden_gem: 'Hidden Gem',
  undervalued: 'Undervalued',
  accurate_af: 'Accurate',
  overrated: 'Overrated',
  trash: 'Trash'
};

export const VALIDATION_ORDER = ['hidden_gem', 'undervalued', 'accurate_af', 'overrated', 'trash'];

export function useScoreValidation() {
  return {
    validate: (score: number) => score >= 0 && score <= 10,
    getValidationType: (score: number) => 'accurate',
    validationStats: {},
    userValidation: null,
    loading: false,
    submitting: false,
    submitValidation: async () => {},
    removeValidation: async () => {}
  };
}
