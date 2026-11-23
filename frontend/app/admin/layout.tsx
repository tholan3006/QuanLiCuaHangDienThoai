'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu } from 'antd';
import AuthGuard from '../../components/auth/AuthGuard';
import { clearAuth } from '../../lib/auth';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          className="border-r border-gray-200"
          width={240}
        >
          <div className="flex h-16 items-center justify-center border-b border-gray-100 px-4">
            <Link href="/admin/accounts" className="font-bold text-gray-900 no-underline">
              {collapsed ? 'ADMIN' : 'ADMIN PORTAL'}
            </Link>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname || '/admin/accounts']}
            items={[
              {
                key: '/admin/accounts',
                icon: <TeamOutlined />,
                label: <Link href="/admin/accounts">Quản lý tài khoản</Link>,
              },
            ]}
            className="border-none pt-2"
          />
        </Sider>
        <Layout>
          <Header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">Quản trị hệ thống</span>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: 'Đăng xuất',
                      onClick: () => {
                        clearAuth();
                        router.replace('/auth');
                      },
                    },
                  ],
                }}
                trigger={['click']}
              >
                <Avatar className="cursor-pointer bg-blue-600">A</Avatar>
              </Dropdown>
            </div>
          </Header>
          <Content className="min-h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 p-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">{children}</div>
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}
