import { usePersonalizationStore } from '../stores/use-personalization-store';
import type { SavedMemory, ToneLevel } from '../types';

describe('usePersonalizationStore', () => {
  beforeEach(() => {
    usePersonalizationStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have empty chatNickName by default', () => {
      expect(usePersonalizationStore.getState().chatNickName).toBe('');
    });

    it('should have DEFAULT tone levels by default', () => {
      const state = usePersonalizationStore.getState();
      expect(state.warmth).toBe('DEFAULT');
      expect(state.enthusiastic).toBe('DEFAULT');
      expect(state.formal).toBe('DEFAULT');
    });

    it('should have empty personalSetting by default', () => {
      expect(usePersonalizationStore.getState().personalSetting).toBe('');
    });

    it('should have empty savedMemories by default', () => {
      expect(usePersonalizationStore.getState().savedMemories).toEqual([]);
    });
  });

  describe('setChatNickName', () => {
    it('should update chatNickName', () => {
      usePersonalizationStore.getState().setChatNickName('루나야');
      expect(usePersonalizationStore.getState().chatNickName).toBe('루나야');
    });

    it('should update to empty string', () => {
      usePersonalizationStore.getState().setChatNickName('이름');
      usePersonalizationStore.getState().setChatNickName('');
      expect(usePersonalizationStore.getState().chatNickName).toBe('');
    });
  });

  describe('tone level setters', () => {
    const levels: ToneLevel[] = ['HIGH', 'DEFAULT', 'LESS'];

    levels.forEach((level) => {
      it(`should set warmth to ${level}`, () => {
        usePersonalizationStore.getState().setWarmth(level);
        expect(usePersonalizationStore.getState().warmth).toBe(level);
      });

      it(`should set enthusiastic to ${level}`, () => {
        usePersonalizationStore.getState().setEnthusiastic(level);
        expect(usePersonalizationStore.getState().enthusiastic).toBe(level);
      });

      it(`should set formal to ${level}`, () => {
        usePersonalizationStore.getState().setFormal(level);
        expect(usePersonalizationStore.getState().formal).toBe(level);
      });
    });

    it('should update each tone independently', () => {
      usePersonalizationStore.getState().setWarmth('HIGH');
      usePersonalizationStore.getState().setEnthusiastic('LESS');
      usePersonalizationStore.getState().setFormal('DEFAULT');

      const state = usePersonalizationStore.getState();
      expect(state.warmth).toBe('HIGH');
      expect(state.enthusiastic).toBe('LESS');
      expect(state.formal).toBe('DEFAULT');
    });
  });

  describe('setPersonalSetting', () => {
    it('should update personalSetting', () => {
      usePersonalizationStore.getState().setPersonalSetting('친절하게 대화해줘');
      expect(usePersonalizationStore.getState().personalSetting).toBe('친절하게 대화해줘');
    });
  });

  describe('setSavedMemories', () => {
    it('should replace savedMemories with new list', () => {
      const memories: SavedMemory[] = [
        { savedMemoryId: 'uuid-1', savedMemory: '사용자는 생리통이 심함' },
        { savedMemoryId: 'uuid-2', savedMemory: '생리 주기 28일' },
      ];
      usePersonalizationStore.getState().setSavedMemories(memories);
      expect(usePersonalizationStore.getState().savedMemories).toEqual(memories);
    });

    it('should replace existing memories', () => {
      const first: SavedMemory[] = [{ savedMemoryId: 'uuid-1', savedMemory: '첫 번째' }];
      const second: SavedMemory[] = [{ savedMemoryId: 'uuid-2', savedMemory: '두 번째' }];

      usePersonalizationStore.getState().setSavedMemories(first);
      usePersonalizationStore.getState().setSavedMemories(second);

      expect(usePersonalizationStore.getState().savedMemories).toEqual(second);
    });
  });

  describe('removeMemory', () => {
    const memories: SavedMemory[] = [
      { savedMemoryId: 'uuid-1', savedMemory: '사용자는 생리통이 심함' },
      { savedMemoryId: 'uuid-2', savedMemory: '생리 주기 28일' },
      { savedMemoryId: 'uuid-3', savedMemory: '알레르기 없음' },
    ];

    beforeEach(() => {
      usePersonalizationStore.getState().setSavedMemories(memories);
    });

    it('should remove the memory with matching id', () => {
      usePersonalizationStore.getState().removeMemory('uuid-2');
      const remaining = usePersonalizationStore.getState().savedMemories;
      expect(remaining).toHaveLength(2);
      expect(remaining.find((m) => m.savedMemoryId === 'uuid-2')).toBeUndefined();
    });

    it('should preserve other memories after removal', () => {
      usePersonalizationStore.getState().removeMemory('uuid-1');
      const remaining = usePersonalizationStore.getState().savedMemories;
      expect(remaining).toHaveLength(2);
      expect(remaining[0].savedMemoryId).toBe('uuid-2');
      expect(remaining[1].savedMemoryId).toBe('uuid-3');
    });

    it('should not mutate other state when removing memory', () => {
      usePersonalizationStore.getState().setChatNickName('테스트');
      usePersonalizationStore.getState().removeMemory('uuid-1');
      expect(usePersonalizationStore.getState().chatNickName).toBe('테스트');
    });

    it('should do nothing when id does not exist', () => {
      usePersonalizationStore.getState().removeMemory('non-existent-id');
      expect(usePersonalizationStore.getState().savedMemories).toHaveLength(3);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const store = usePersonalizationStore.getState();
      store.setChatNickName('닉네임');
      store.setWarmth('HIGH');
      store.setEnthusiastic('LESS');
      store.setFormal('HIGH');
      store.setPersonalSetting('설정값');
      store.setSavedMemories([{ savedMemoryId: 'uuid-1', savedMemory: '메모리' }]);

      store.reset();

      const state = usePersonalizationStore.getState();
      expect(state.chatNickName).toBe('');
      expect(state.warmth).toBe('DEFAULT');
      expect(state.enthusiastic).toBe('DEFAULT');
      expect(state.formal).toBe('DEFAULT');
      expect(state.personalSetting).toBe('');
      expect(state.savedMemories).toEqual([]);
    });
  });
});
