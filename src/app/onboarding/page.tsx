'use client';

import { withAuth } from '@/features/auth';

function OnboardingPage() {
  return (
    <div>
      <h1>온보딩 페이지</h1>
      <p>첫 로그인 사용자를 위한 온보딩 페이지입니다.</p>
    </div>
  );
}

export default withAuth(OnboardingPage);
