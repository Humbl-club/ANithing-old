#!/bin/bash

echo "🔧 Creating missing hooks to fix build errors..."

# Create useInfiniteContentData hook
cat > ./src/hooks/useInfiniteContentData.ts << 'EOF'
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteContentData(options: any) {
  const query = useInfiniteQuery({
    queryKey: ['infinite-content', options],
    queryFn: ({ pageParam = 1 }) => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({
        data: [],
        total: 0,
        hasMore: false,
        nextPage: null
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  return {
    ...query,
    animeData: query.data?.pages.flatMap(page => page.data) || [],
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
EOF

echo "✅ Created useInfiniteContentData hook"

# Create any other missing hooks that might be needed
echo "🔍 Checking for other missing imports..."

# Run build to see if there are more missing files
echo "📦 Testing build..."
npm run build 2>&1 | grep "Could not load" | head -5