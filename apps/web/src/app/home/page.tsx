'use client';

import { withAuth, LogoutButton } from '@web/features/auth';

function HomePage() {
  return (
    <div>
      <h1>홈 페이지</h1>
      <p>인증된 사용자만 볼 수 있는 페이지입니다.</p>
      <LogoutButton />
    </div>
  );
}

export default withAuth(HomePage);
