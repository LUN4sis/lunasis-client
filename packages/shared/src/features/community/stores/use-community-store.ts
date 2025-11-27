import { create } from 'zustand';
import { CommunityCategory } from '../types';

/**
 * initial state
 */
interface EditingState {
  postId?: string;
  commentId?: string;
}

interface CommunityStore {
  selectedCategory?: CommunityCategory;
  setSelectedCategory: (category?: CommunityCategory) => void;

  // editing
  editingState: EditingState;
  setEditingPost: (postId?: string) => void;
  setEditingComment: (commentId?: string) => void;
  clearEditing: () => void;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
  selectedCategory: CommunityCategory.PERIOD_CRAMPS,
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  editingState: {},
  setEditingPost: (postId) => set((state) => ({ editingState: { ...state.editingState, postId } })),
  setEditingComment: (commentId) =>
    set((state) => ({ editingState: { ...state.editingState, commentId } })),
  clearEditing: () => set({ editingState: {} }),
}));
