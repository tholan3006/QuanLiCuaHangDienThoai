'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppstoreOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, theme } from 'antd';
import { authApi, CustomerProfile } from '../../services/auth.api';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    setMounted(true);
    setCustomer(authApi.getCurrentCustomer());

    const handleAuth = () => {
      setCustomer(authApi.getCurrentCustomer());
    };
    window.addEventListener('auth-change', handleAuth);
    return () => window.removeEventListener('auth-change', handleAuth);
  }, []);

  const handleAdminLogin = () => {
    const admin = authApi.loginAdmin();
    setCustomer(admin);
  };

  const handleLogout = () => {
    authApi.logout();
    setCustomer(null);
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-xs text-gray-400">
        Đang xác thực quyền Quản Trị Viên (Admin Server)...
      </div>
    );
  }

  // BẢO VỆ PHÂN QUYỀN ADMIN SERVER: CHỈ ADMIN MỚI ĐƯỢC PHÉP TRUY CẬP
  const isAdmin = customer && customer.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 mx-auto shadow-inner">
            <SafetyCertificateOutlined className="text-2xl text-purple-600" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-gray-900">
              Cổng Quản Trị Hệ Thống (Admin Server)
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Theo quy định Đồ án PTTK HTTT (Mục II.2 - 10 điểm), giao diện Admin Server tách biệt hoàn toàn với Nhân viên. Yêu cầu quyền Quản Trị Viên tối cao.
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleAdminLogin}
              className="w-full flex items-center justify-between rounded-xl border border-purple-300 bg-purple-600 p-3.5 text-xs font-bold text-white shadow-lg hover:bg-purple-700 transition-all"
            >
              <span>Đăng nhập quyền Admin (Tài khoản: admin / 123456)</span>
              <span>➔</span>
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-900 font-semibold">
              ← Về Cửa Hàng
            </Link>
            <Link href="/staff/products" className="hover:text-blue-600 font-semibold">
              Sang Cổng Nhân Viên →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: <Link href="/admin/users">Quản lý Tài Khoản & Phân Quyền</Link>,
    },
    {
      key: '/staff/dashboard',
      icon: <AppstoreOutlined />,
      label: <Link href="/staff/dashboard">Xem Cổng Nhân Viên (Staff)</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        className="border-r border-slate-800 bg-slate-900"
        width={260}
      >
        <div className="h-16 flex items-center justify-between border-b border-slate-800 px-4">
          <Link href="/admin/users" className="flex items-center gap-2 no-underline text-white">
            <span className="bg-purple-600 text-white px-2 py-0.5 rounded font-black text-base shadow"></span>
            {!collapsed && (
              <div>
                <span className="font-black text-white text-sm tracking-tight block">
                  ADMIN SERVER
                </span>
                <span className="text-[10px] text-purple-400 font-bold block">
                  Hệ thống Quản Trị
                </span>
              </div>
            )}
          </Link>
        </div>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[pathname || '/admin/users']}
          items={menuItems}
          className="border-none pt-2 bg-slate-900"
        />

        <div className="p-4 border-t border-slate-800 mt-auto space-y-2">
          <Link href="/">
            <Button
              icon={<HomeOutlined />}
              block={!collapsed}
              type="dashed"
              size="small"
              className="text-xs text-slate-300 border-slate-700 hover:text-white"
            >
              {!collapsed && 'Về trang bán hàng'}
            </Button>
          </Link>
          <Button
            icon={<LogoutOutlined />}
            block={!collapsed}
            danger
            size="small"
            className="text-xs"
            onClick={handleLogout}
          >
            {!collapsed && 'Đăng xuất Admin'}
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{ background: colorBgContainer, lineHeight: 'normal' }}
          className="px-6 flex items-center justify-between border-b border-gray-200 h-16 leading-normal"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-base"
          />

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-gray-900">{customer.hoten}</div>
              <div className="text-[11px] text-purple-600 font-bold">
                Quản Trị Viên Tối Cao (Server Admin)
              </div>
            </div>
            <Avatar icon={<SafetyCertificateOutlined />} className="bg-purple-600 shadow" />
          </div>
        </Header>

        <Content className="p-6 bg-slate-100 min-h-[calc(100vh-64px)] overflow-y-auto">
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
  );
}
