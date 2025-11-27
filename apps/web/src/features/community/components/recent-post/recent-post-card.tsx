import { memo } from 'react';
import Image from 'next/image';

import { DEFAULT_BLUR_DATA_URL } from '@web/lib/constants';

import type { Post } from '@repo/shared/features/community/types/post.type';

import clsx from 'clsx';
import styles from './recent-post-card.module.scss';

interface RecentPostCardProps {
  post: Post;
  onClick: (postId: string) => void;
  className?: string;
}

export const RecentPostCard = memo<RecentPostCardProps>(({ post, onClick, className }) => {
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
      className={clsx(styles.recentPostCard, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Read post: ${post.title}`}
    >
      <div className={styles.header}>
        <h3>{post.title}</h3>
        <div className={styles.author}>
          <span>{post.author.nickname}</span>
          <Image
            src={post.author.profile ?? ''}
            alt={post.author.nickname || 'Author profile'}
            width={24}
            height={24}
            quality={85}
            placeholder="blur"
            blurDataURL={DEFAULT_BLUR_DATA_URL}
          />
        </div>
      </div>

      <div className={styles.content}>
        <p>{post.content}</p>
      </div>
    </article>
  );
});

RecentPostCard.displayName = 'RecentPostCard';
