'use client';

import { memo } from 'react';

import { Button } from '@web/components/ui/button';
import { POST_LIMITS } from '@repo/shared/features/community/constants';

import clsx from 'clsx';
import styles from './styles/comment-forms.module.scss';

/**
 * CommentEditForm Props
 */
interface CommentEditFormProps {
  content: string;
  onChange: (content: string) => void;
  onSubmit: () => void;
}

/**
 * CommentEditForm - Form for editing existing comments
 */
export const CommentEditForm = memo<CommentEditFormProps>(({ content, onChange, onSubmit }) => {
  const isValid = content.trim().length > 0;
  const charCount = content.length;

  return (
    <div className={styles.editForm}>
      {/* textarea wrapper */}
      <div className={styles.textareaWrapper}>
        <textarea
          id="comment-edit-content"
          name="edit-content"
          aria-label="Edit comment content"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          maxLength={POST_LIMITS.CONTENT_MAX_LENGTH}
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
          Save
        </Button>
      </div>
    </div>
  );
});

CommentEditForm.displayName = 'CommentEditForm';
