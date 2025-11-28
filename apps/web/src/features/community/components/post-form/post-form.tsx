import { memo, useState, useEffect } from 'react';
import {
  COMMUNITY_CATEGORIES,
  POST_LIMITS,
  getCommunityCategoryDisplay,
} from '@repo/shared/features/community';
import { useUnsavedChangesWarning } from '@web/features/community/utils';

import { Input } from '@web/components/ui/input';
import { Button } from '@web/components/ui/button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import type { CommunityCategory } from '@repo/shared/features/community/types';

import clsx from 'clsx';
import styles from './post-form.module.scss';

export interface PostFormData {
  title: string;
  content: string;
  category?: CommunityCategory;
}

interface PostFormProps {
  initialTitle?: string;
  initialContent?: string;
  initialCategory?: CommunityCategory;
  isEdit?: boolean;
  onSubmit: (data: PostFormData) => void;
  isLoading?: boolean;
  className?: string;
}

export const PostForm = memo<PostFormProps>(
  ({
    initialTitle = '',
    initialContent = '',
    initialCategory,
    isEdit = false,
    onSubmit,
    isLoading = false,
    className,
  }) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [category, setCategory] = useState<CommunityCategory | undefined>(initialCategory);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasChanges =
      title.trim() !== initialTitle.trim() ||
      content.trim() !== initialContent.trim() ||
      category !== initialCategory;

    useUnsavedChangesWarning(hasChanges && !isSubmitting);

    useEffect(() => {
      setTitle(initialTitle);
      setContent(initialContent);
      setCategory(initialCategory);
    }, [initialTitle, initialContent, initialCategory]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!title.trim() || !content.trim()) {
        return;
      }

      if (!isEdit && !category) {
        return;
      }

      setIsSubmitting(true);

      onSubmit({ title: title.trim(), content: content.trim(), category });
    };

    const isValid = title.trim() && content.trim() && (isEdit || category);

    const currentCategoryDisplay = category ? getCommunityCategoryDisplay(category) : 'Category';

    return (
      <form onSubmit={handleSubmit} className={clsx(styles.form, className)}>
        {!isEdit && (
          <div className={styles.selectField}>
            <label htmlFor="category" className={styles.selectWrapper}>
              {/* display text */}
              <span className={styles.selectedValue}>{currentCategoryDisplay}</span>
              <ArrowDropDownIcon className={styles.chevronIcon} />

              {/* actual select - positioned below text */}
              <select
                id="category"
                value={category || ''}
                onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                disabled={isLoading}
                className={styles.select}
                required
              >
                <option value="" disabled hidden>
                  Category
                </option>
                {Object.values(COMMUNITY_CATEGORIES).map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {getCommunityCategoryDisplay(cat.key)}
                  </option>
                ))}
              </select>
            </label>
            <hr />
          </div>
        )}

        {/* Title */}
        <div className={styles.field}>
          <Input
            aria-label="Title"
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write a title for your post"
            className={styles.input}
            inputClassName={styles.inputField}
            disabled={isLoading}
            required
            maxLength={POST_LIMITS.TITLE_MAX_LENGTH}
          />
          <span className={styles.charCount}>
            {title.length}/{POST_LIMITS.TITLE_MAX_LENGTH}
          </span>
        </div>

        {/* Content */}
        <div className={styles.field}>
          <textarea
            aria-label="Content"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts comfortably"
            className={styles.textarea}
            disabled={isLoading}
            required
            rows={10}
            maxLength={POST_LIMITS.CONTENT_MAX_LENGTH}
          />
          <span className={styles.charCount}>
            {content.length}/{POST_LIMITS.CONTENT_MAX_LENGTH}
          </span>
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            colorScheme="pink"
            className={styles.submitButton}
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Post'}
          </Button>
        </div>
      </form>
    );
  },
);

PostForm.displayName = 'PostForm';
