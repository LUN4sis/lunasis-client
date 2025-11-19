import { BottomNavigation } from '@/components/layouts/bottom-navigation';

export default function WithBottomNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="app-content">{children}</main>
      <BottomNavigation />
    </>
  );
}
