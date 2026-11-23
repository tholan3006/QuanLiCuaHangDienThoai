'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppstoreOutlined,
  BarChartOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, theme } from 'antd';
import AuthGuard from '../../components/auth/AuthGuard';
import { clearAuth } from '../../lib/auth';

const { Header, Sider, Content } = Layout;

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/staff/dashboard',
      icon: <BarChartOutlined />,
      label: <Link href="/staff/dashboard">Thống kê bán hàng</Link>,
    },
    {
      key: '/staff/invoices',
      icon: <FileTextOutlined />,
      label: <Link href="/staff/invoices">Hóa đơn bán hàng</Link>,
    },
    {
      key: '/staff/products',
      icon: <AppstoreOutlined />,
      label: <Link href="/staff/products">Quản lý sản phẩm</Link>,
    },
    {
      key: '/staff/orders',
      icon: <ShoppingOutlined />,
      label: <Link href="/staff/orders">Quản lý đơn hàng</Link>,
    },
  ];

  return (
    <AuthGuard allowedRoles={['ADMIN', 'STAFF']}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          className="border-r border-gray-200"
          width={240}
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-100 px-4">
            <Link href="/staff/dashboard" className="flex items-center gap-2 no-underline">
              <span className="bg-black text-white px-2 py-0.5 rounded font-black text-base"></span>
              {!collapsed && (
                <span className="font-bold text-gray-900 text-sm tracking-tight">
                  STAFF PORTAL
                </span>
              )}
            </Link>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname || '/staff/dashboard']}
            items={menuItems}
            className="border-none pt-2"
          />
          <div className="p-4 border-t border-gray-100 mt-auto">
            <Link href="/">
              <Button
                icon={<HomeOutlined />}
                block={!collapsed}
                type="dashed"
                size="small"
                className="text-xs"
              >
                {!collapsed && 'Về trang bán hàng'}
              </Button>
            </Link>
          </div>
        </Sider>
        <Layout>
          <Header
            style={{ background: colorBgContainer }}
            className="px-6 flex items-center justify-between border-b border-gray-200 h-16"
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-base"
            />
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <div className="text-xs font-bold text-gray-800">Trần Minh Tuấn</div>
                <div className="text-xs text-gray-500">Chuyên viên bán hàng (Staff)</div>
              </div>
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
                <Avatar
                  icon={<UserOutlined />}
                  className="cursor-pointer bg-blue-600"
                />
              </Dropdown>
            </div>
          </Header>
          <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)] overflow-y-auto">
            <div
              style={{
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                padding: 24,
              }}
            >
              {children}
            </div>
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}
