'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@web/components/ui/button/button';
import { Input } from '@web/components/ui/input/input';
import { toast } from '@web/components/ui/toast';
import { withAuth } from '@web/features/auth/hoc/with-auth';
import { updateUserSettingAPI } from '@web/features/chat/api/chat.api';
import { usePersonalizationStore } from '@web/features/chat/stores';
import { updateSettingReqSchema, type ToneLevel } from '@web/features/chat/types';

import styles from './settings.module.scss';

const TONE_LEVELS: ToneLevel[] = ['HIGH', 'DEFAULT', 'LESS'];

interface ToneSelectorProps {
  label: string;
  value: ToneLevel;
  onChange: (level: ToneLevel) => void;
}

function ToneSelector({ label, value, onChange }: ToneSelectorProps) {
  const t = useTranslations('chat.settings.tone');

  return (
    <div className={styles.toneRow}>
      <span className={styles.toneLabel}>• {label}</span>
      <div className={styles.toneButtons}>
        {TONE_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            className={`${styles.toneButton} ${value === level ? styles.toneButtonActive : ''}`}
            onClick={() => onChange(level)}
            aria-label={`${label} ${t(level.toLowerCase() as 'high' | 'default' | 'less')}`}
            aria-pressed={value === level}
          >
            <span className={styles.toneButtonDot} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatSettingsPage() {
  const t = useTranslations('chat.settings');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    chatNickName,
    warmth,
    enthusiastic,
    formal,
    personalSetting,
    setChatNickName,
    setWarmth,
    setEnthusiastic,
    setFormal,
    setPersonalSetting,
  } = usePersonalizationStore();

  const handleSave = useCallback(() => {
    const payload = { chatNickName, warmth, enthusiastic, formal, personalSetting };
    const result = updateSettingReqSchema.safeParse(payload);
    if (!result.success) {
      toast.error(t('saveError'));
      return;
    }
    startTransition(async () => {
      try {
        await updateUserSettingAPI(result.data);
        toast.success(t('saveSuccess'));
      } catch {
        toast.error(t('saveError'));
      }
    });
  }, [chatNickName, warmth, enthusiastic, formal, personalSetting, t]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          fullWidth={false}
          aria-label="back"
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <ChevronLeft />
        </Button>
        <h1 className={styles.title}>{t('title')}</h1>
        <Button
          variant="ghost"
          fullWidth={false}
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isPending}
        >
          {tCommon('save')}
        </Button>
      </div>

      <div className={styles.content}>
        {/* Nickname */}
        <section className={styles.section}>
          <label className={styles.sectionTitle} htmlFor="nickname">
            {t('nickname.label')}
          </label>
          <Input
            id="nickname"
            value={chatNickName}
            onChange={(e) => setChatNickName(e.target.value)}
            placeholder={t('nickname.placeholder')}
            fullWidth
          />
        </section>

        {/* Tone Settings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('tone.title')}</h2>
          <ToneSelector label={t('tone.warmth')} value={warmth} onChange={setWarmth} />
          <ToneSelector
            label={t('tone.enthusiastic')}
            value={enthusiastic}
            onChange={setEnthusiastic}
          />
          <ToneSelector label={t('tone.formal')} value={formal} onChange={setFormal} />
        </section>

        {/* Custom Instructions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('personalSetting.title')}</h2>
          <textarea
            className={styles.textarea}
            value={personalSetting}
            onChange={(e) => setPersonalSetting(e.target.value)}
            placeholder={t('personalSetting.placeholder')}
            maxLength={1000}
            rows={4}
          />
        </section>

        {/* Memory Link */}
        <button
          type="button"
          className={styles.memoryLink}
          onClick={() => router.push('settings/memory')}
        >
          <span className={styles.memoryLinkText}>{t('memory.title')}</span>
          <ChevronRight className={styles.memoryLinkIcon} />
        </button>
      </div>
    </div>
  );
}

export default withAuth(ChatSettingsPage);
