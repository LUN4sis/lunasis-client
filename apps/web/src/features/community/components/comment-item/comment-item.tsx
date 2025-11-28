'use client';

import { memo, useState } from 'react';
import clsx from 'clsx';

import { COMMUNITY_MESSAGES } from '@repo/shared/features/community/constants';
import type { Comment } from '@repo/shared/features/community/types';

import { CommentHeader } from './comment-header';
import { CommentEditForm } from './comment-edit-form';
import { CommentReplyForm } from './comment-reply-form';

import styles from './styles/comment-item.module.scss';

export interface CommentItemProps {
  comment: Comment;
  postId: string;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onCreateReply?: (parentCommentId: string, content: string) => void;
  className?: string;
}

export const CommentItem = memo<CommentItemProps>(
  ({ comment, postId, onEdit, onDelete, onCreateReply, className }) => {
    // state management
    const [isEditing, setIsEditing] = useState(false);
    const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    // derived state
    const isReply = !comment.replies;
    const isDeleted = comment.content === '삭제된 댓글입니다.';
    const hasReplies = comment.replies && comment.replies.length > 0;

    // event handlers
    const handleEditSubmit = () => {
      const trimmedContent = editContent.trim();
      if (!trimmedContent || !onEdit) return;

      onEdit(comment.commentId, trimmedContent);
      setIsEditing(false);
    };

    const handleReplySubmit = () => {
      const trimmedContent = replyContent.trim();
      if (!trimmedContent || !onCreateReply) return;

      onCreateReply(comment.commentId, trimmedContent);
      setReplyContent('');
      setIsReplyFormOpen(false);
    };

    const handleDelete = () => {
      if (!window.confirm(COMMUNITY_MESSAGES.COMMENT_DELETE_CONFIRM)) return;

      onDelete?.(comment.commentId);
      setShowMenu(false);
    };

    const handleToggleReply = () => {
      setIsReplyFormOpen((prev) => !prev);
    };

    const handleToggleMenu = () => {
      setShowMenu((prev) => !prev);
    };

    const handleStartEdit = () => {
      setIsEditing(true);
      setShowMenu(false);
    };

    return (
      <div className={styles.commentItem}>
        <div className={clsx(styles.commentWrapper, className)}>
          <div className={styles.comment}>
            <CommentHeader
              comment={comment}
              isReply={isReply}
              isDeleted={isDeleted}
              showMenu={showMenu}
              isReplyFormOpen={isReplyFormOpen}
              onToggleReply={handleToggleReply}
              onToggleMenu={handleToggleMenu}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
            />

            {isEditing ? (
              <CommentEditForm
                content={editContent}
                onChange={setEditContent}
                onSubmit={handleEditSubmit}
              />
            ) : (
              <p className={styles.content}>{comment.content}</p>
            )}
          </div>
        </div>

        {isReplyFormOpen && (
          <CommentReplyForm
            content={replyContent}
            onChange={setReplyContent}
            onSubmit={handleReplySubmit}
          />
        )}

        {/* nested replies */}
        {hasReplies && (
          <div className={styles.replies}>
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply.commentId}
                comment={reply}
                postId={postId}
                onCreateReply={onCreateReply}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

CommentItem.displayName = 'CommentItem';
