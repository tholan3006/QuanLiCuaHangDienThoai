'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { AppRole, getRoleHome, readAuthUser } from '../../lib/auth';

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: AppRole[];
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const user = readAuthUser();
      const token = localStorage.getItem('access_token');
      if (!user || !token) {
        router.replace('/auth');
        return;
      }
      if (!allowedRoles.includes(user.role)) {
        router.replace(getRoleHome(user.role));
        return;
      }
      setAuthorized(true);
    };

    checkAccess();
    window.addEventListener('auth-change', checkAccess);
    return () => window.removeEventListener('auth-change', checkAccess);
  }, [allowedRoles, router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  return children;
}
