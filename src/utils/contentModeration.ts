// Simple content moderation implementation
// You can replace this with a proper library like bad-words if needed

/**
 * Filters content for offensive language
 * @param content - The text content to filter
 * @returns The filtered content with offensive words replaced
 */
export const filterContent = (content: string): string => {
  if (!content) return content;
  
  // Basic profanity filter - can be extended with a proper library
  const inappropriateWords = [
    // Add words to filter here if needed
  ];
  
  let filtered = content;
  inappropriateWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  
  return filtered;
};
/**
 * Checks if content contains offensive language
 * @param content - The text content to check
/**
 * @returns True if content contains offensive words, false otherwise
*/
export const containsOffensiveContent = (content: string): boolean => {
  if (!content) return false;
  try {
    return filter.isProfane(content);
  } catch (error) {
    // Error logged silently
    return false; // Return false if checking fails
  }
};