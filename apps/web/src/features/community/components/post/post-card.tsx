import { memo } from 'react';
import Image from 'next/image';

import { Button } from '@web/components/ui/button';
import { DEFAULT_BLUR_DATA_URL } from '@web/lib/constants';
import { formatPostDate } from '@repo/shared/features/community/utils';
import type { PostListItem } from '@repo/shared/features/community';
import BookmarkIcon from '@mui/icons-material/Bookmark';

import clsx from 'clsx';
import styles from './post-card.module.scss';

interface PostCardProps {
  post: PostListItem;
  onClick: (postId: string) => void;
  className?: string;
}

export const PostCard = memo<PostCardProps>(({ post, onClick, className }) => {
  const handleClick = () => {
    onClick(post.postId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={clsx(styles.postCard, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Read post: ${post.title}`}
    >
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <div className={styles.footer}>
        <div className={styles.info}>
          <div className={styles.comment}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
            </svg>
            <span className={styles.commentCount}>{post.commentCount}</span>
          </div>
          <span className={styles.separator}>|</span>
          <div className={styles.date}>
            <span>{formatPostDate(post.createdAt)}</span>
          </div>
          <span className={styles.separator}>|</span>
          <div className={styles.author}>
            <Image
              src={post.author.profile ?? ''}
              alt={post.author.nickname ?? ''}
              width={24}
              height={24}
              quality={85}
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_DATA_URL}
            />
            <span>{post.author.nickname}</span>
          </div>
        </div>
        {post.isBookmarked && (
          <div className={styles.bookmark}>
            <Button variant="ghost">
              <BookmarkIcon className={styles.bookmarkIcon} />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
});

PostCard.displayName = 'PostCard';
