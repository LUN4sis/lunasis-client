'use client';

import { useParams } from 'next/navigation';

import { CommunityCategory } from '@repo/shared/features/community/types';

export default function CategoryPage() {
  const { category: _category } = useParams<{ category: CommunityCategory }>();

  return <div>CategoryPage</div>;
}
