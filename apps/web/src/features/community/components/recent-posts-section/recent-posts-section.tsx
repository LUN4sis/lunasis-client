import { Button } from '@web/components/ui/button';
import { RecentPostCard } from '../recent-post/recent-post-card';
import { CommunityCategory } from '@repo/shared/features/community/types';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import type { Post } from '@repo/shared/features/community/types';
import clsx from 'clsx';
import styles from './recent-posts-section.module.scss';

interface RecentPostsSectionProps {
  category: CommunityCategory;
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  onCreatePost: (category: CommunityCategory) => void;
  onSeeMore: (category: CommunityCategory) => void;
  onPostClick: (postId: string) => void;
  className?: string;
}

export const RecentPostsSection = ({
  category,
  posts,
  // isLoading,
  // isError,
  onCreatePost,
  onSeeMore,
  onPostClick,
  className,
}: RecentPostsSectionProps) => {
  // TODO: 로딩, 에러 상태 처리

  if (posts.length === 0) {
    return (
      <section className={clsx(styles.section, className)}>
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            No posts yet in this category.
            <br />
            Be the first to share your story!
          </p>
          <Button
            variant="outline"
            colorScheme="pink"
            onClick={() => onCreatePost(category)}
            aria-label="Write first post"
            className={clsx(styles.button, styles.write)}
          >
            Write a Post ✏️
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <Button
        variant="outline"
        colorScheme="pink"
        onClick={() => onCreatePost(category)}
        aria-label="Write a post"
        className={clsx(styles.button, styles.write)}
      >
        Write a Post ✏️
      </Button>

      {/* posts list */}
      <div className={styles.list}>
        {posts.map((post) => (
          <RecentPostCard key={post.postId} post={post} onClick={() => onPostClick(post.postId)} />
        ))}
      </div>

      <Button
        colorScheme="pink"
        onClick={() => onSeeMore(category)}
        aria-label="See more posts"
        className={clsx(styles.button, styles.more)}
      >
        See more stories
        <ArrowForwardIosIcon className={styles.arrowIcon} />
      </Button>
    </section>
  );
};

RecentPostsSection.displayName = 'RecentPostsSection';
