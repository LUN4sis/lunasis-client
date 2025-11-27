'use client';

import { useRouter } from 'next/navigation';

import { useCreatePostMutation } from '@web/features/community/hooks';
import { COMMUNITY_MESSAGES, type CreatePostRequest } from '@repo/shared/features/community';

import { PostForm, type PostFormData, Header } from '@web/features/community/components';
import { useToastStore } from '@web/components/ui/toast';

import styles from './create-post.module.scss';

const CreatePostPage = () => {
  const router = useRouter();
  const { addToast } = useToastStore();

  const createPostMutation = useCreatePostMutation({
    onSuccess: (data) => {
      addToast(COMMUNITY_MESSAGES.POST_CREATE_SUCCESS, 'success');
      router.push(`/community/post/${data.postId}`);
    },
    onError: () => {
      addToast(COMMUNITY_MESSAGES.POST_CREATE_ERROR, 'error');
    },
  });

  const handleSubmit = (formData: PostFormData) => {
    if (!formData.category) {
      addToast(COMMUNITY_MESSAGES.POST_CREATE_ERROR, 'error');
      return;
    }

    const createData: CreatePostRequest = {
      category: formData.category,
      title: formData.title,
      content: formData.content,
    };

    createPostMutation.mutate(createData);
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <Header handleBackClick={handleBackClick} />

      <div className={styles.formContainer}>
        <PostForm onSubmit={handleSubmit} isLoading={createPostMutation.isPending} />
      </div>
    </div>
  );
};

CreatePostPage.displayName = 'CreatePostPage';

export default CreatePostPage;
