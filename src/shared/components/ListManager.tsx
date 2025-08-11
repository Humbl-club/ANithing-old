import { ListManagerRefactored } from '@/features/lists/components/ListManagerRefactored';
import { type ListStatus } from '@/types/userLists';

interface ListManagerProps {
  contentType: 'anime' | 'manga' | 'both';
  listStatuses: ListStatus[];
}

export function ListManager(props: ListManagerProps) {
  return <ListManagerRefactored {...props} />;
}

export default ListManager;