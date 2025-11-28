'use client';

import { memo } from 'react';

import { Button } from '@web/components/ui/button';
import { COMMUNITY_MESSAGES, POST_LIMITS } from '@repo/shared/features/community/constants';

import clsx from 'clsx';
import styles from './styles/comment-forms.module.scss';

interface CommentReplyFormProps {
  content: string;
  onChange: (content: string) => void;
  onSubmit: () => void;
}

export const CommentReplyForm = memo<CommentReplyFormProps>(({ content, onChange, onSubmit }) => {
  const isValid = content.trim().length > 0;
  const charCount = content.length;

  return (
    <div className={styles.replyForm}>
      {/* header */}
      <div className={styles.header}>
        <p>{COMMUNITY_MESSAGES.CURRENT_USER}</p>
      </div>

      {/* textarea wrapper */}
      <div className={styles.textareaWrapper}>
        <textarea
          id="comment-reply-content"
          name="reply-content"
          aria-label="Reply to comment"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          maxLength={POST_LIMITS.CONTENT_MAX_LENGTH}
          autoFocus
          className={clsx(styles.textarea)}
        />
        <span className={clsx(styles.charCount)}>
          {charCount}/{POST_LIMITS.CONTENT_MAX_LENGTH}
        </span>
      </div>

      {/* action buttons */}
      <div className={styles.actions}>
        <Button
          type="button"
          colorScheme="pink"
          onClick={onSubmit}
          disabled={!isValid}
          className={styles.actionButton}
          fullWidth
        >
          Reply
        </Button>
      </div>
    </div>
  );
});

CommentReplyForm.displayName = 'CommentReplyForm';
