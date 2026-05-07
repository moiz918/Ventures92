import { redirect } from 'next/navigation';

import { getAdminUserOrNull } from '@/lib/auth';

import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUserOrNull();
  if (!user) {
    // Middleware would normally redirect on missing cookies, but a stale or
    // role-mismatched session can still slip through — enforce here too.
    redirect('/login?next=/admin/dashboard');
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
