'use client';

import { memo } from 'react';
import Image from 'next/image';

import { Button } from '@web/components/ui/button';
import { DEFAULT_BLUR_DATA_URL } from '@web/lib/constants';
import { COMMUNITY_MESSAGES } from '@repo/shared/features/community/constants';
import { formatCommentDate } from '@repo/shared/features/community/utils';

import type { Comment } from '@repo/shared/features/community/types';

import styles from './styles/comment-header.module.scss';

/**
 * CommentHeader Props
 */
interface CommentHeaderProps {
  comment: Comment;
  isReply: boolean;
  isDeleted: boolean;
  showMenu: boolean;
  isReplyFormOpen: boolean;
  onToggleReply: () => void;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * CommentHeader - Author info and action buttons
 */
export const CommentHeader = memo<CommentHeaderProps>(
  ({
    comment,
    isReply,
    isDeleted,
    showMenu,
    isReplyFormOpen,
    onToggleReply,
    onToggleMenu,
    onEdit,
    onDelete,
  }) => {
    const { author, createdAt, updatedAt, isEdited, isAuthor } = comment;

    return (
      <div className={styles.header}>
        {/* author section */}
        <div className={styles.author}>
          {/* profile image */}
          <div className={styles.avatar}>
            <Image
              src={author.profile ?? ''}
              alt={author.nickname ?? ''}
              width={40}
              height={40}
              quality={85}
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_DATA_URL}
            />
          </div>

          {/* user info */}
          <div className={styles.info}>
            <span className={styles.nickname}>{author.nickname}</span>
            <div className={styles.timestamp}>
              <time>{formatCommentDate(createdAt)}</time>
              {isEdited && (
                <time className={styles.edited}>
                  {COMMUNITY_MESSAGES.EDITED_LABEL} {formatCommentDate(updatedAt)}
                </time>
              )}
            </div>
          </div>
        </div>

        {/* actions section */}
        <div className={styles.actions}>
          {/* reply button (parent comments only) */}
          {!isReply && !isDeleted && (
            <Button
              type="button"
              colorScheme="gray"
              variant="ghost"
              onClick={onToggleReply}
              aria-label="Reply to comment"
              aria-expanded={isReplyFormOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.messageCircleIcon}
              >
                <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
              </svg>
            </Button>
          )}

          {/* author menu */}
          {isAuthor && !isDeleted && (
            <>
              {!isReply && (
                <span role="separator" aria-hidden="true" className={styles.separator}>
                  |
                </span>
              )}

              <div className={styles.menuWrapper}>
                <Button
                  type="button"
                  colorScheme="gray"
                  variant="ghost"
                  onClick={onToggleMenu}
                  aria-label="Toggle comment menu"
                  aria-expanded={showMenu}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.ellipsisVerticalIcon}
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>

                {showMenu && (
                  <div className={styles.menu}>
                    <Button type="button" colorScheme="gray" variant="ghost" onClick={onEdit}>
                      Edit
                    </Button>
                    <Button type="button" colorScheme="pink" variant="ghost" onClick={onDelete}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
);

CommentHeader.displayName = 'CommentHeader';
