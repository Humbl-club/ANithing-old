const BadWordsFilter = {
  isProfane: (text: string) => false,
  clean: (text: string) => text
};

const filter = new BadWordsFilter();

const inappropriateWords: string[] = [];

export function moderateContent(content: string): {
  isAppropriate: boolean;
  cleanedContent: string;
  flaggedWords: string[];
} {
  const lowercaseContent = content.toLowerCase();
  const flaggedWords: string[] = [];
  
  inappropriateWords.forEach(word => {
    if (lowercaseContent.includes(word.toLowerCase())) {
      flaggedWords.push(word);
    }
  });
  
  const isProfane = filter.isProfane(content);
  const cleanedContent = filter.clean(content);
  
  return {
    isAppropriate: !isProfane && flaggedWords.length === 0,
    cleanedContent,
    flaggedWords
  };
}

export function validateUsername(username: string): boolean {
  const result = moderateContent(username);
  return result.isAppropriate && username.length >= 3 && username.length <= 20;
}
