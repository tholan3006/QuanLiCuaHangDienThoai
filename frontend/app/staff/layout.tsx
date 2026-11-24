'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppstoreOutlined,
  BarChartOutlined,
  FileTextOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, theme } from 'antd';
import { authApi, CustomerProfile } from '../../services/auth.api';

const { Header, Sider, Content } = Layout;

export default function StaffLayout({ children }: { children: React.ReactNode }) {
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

  const handleStaffLogin = (index = 0) => {
    const user = authApi.loginStaff(index);
    setCustomer(user);
  };

  const handleAdminLogin = () => {
    const user = authApi.loginAdmin();
    setCustomer(user);
  };

  const handleLogout = () => {
    authApi.logout();
    setCustomer(null);
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-xs text-gray-500">
        Đang khởi tạo phiên làm việc nhân viên...
      </div>
    );
  }

  // BẢO VỆ PHÂN QUYỀN (RBAC): CHỈ NHAN_VIEN VÀ ADMIN MỚI ĐƯỢC PHÉP TRUY CẬP
  const isAuthorized = customer && (customer.role === 'NHAN_VIEN' || customer.role === 'ADMIN');

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto shadow-inner">
            <LockOutlined className="text-2xl text-amber-600" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-gray-900">
              Cổng Thông Tin Nhân Viên Bán Hàng
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {customer?.role === 'KHACH_HANG'
                ? `Bạn đang đăng nhập bằng tài khoản Khách Hàng (${customer.hoten}). Bạn không có quyền truy cập khu vực nghiệp vụ của Nhân Viên Bán Hàng!`
                : 'Khu vực nghiệp vụ nội bộ (Mục A4 - Đồ án PTTK HTTT). Vui lòng đăng nhập tài khoản Nhân viên hoặc Quản trị viên để tiếp tục.'}
            </p>
          </div>

          {/* Khối chọn tài khoản nhân viên mẫu để test chấm điểm */}
          <div className="space-y-2 pt-2 border-t border-gray-100 text-left">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
              Đăng nhập tài khoản nhân viên (1 Click)
            </div>

            <button
              onClick={() => handleStaffLogin(0)}
              className="w-full flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs hover:bg-blue-100 transition-all text-blue-950 group"
            >
              <div>
                <div className="font-bold text-blue-900 group-hover:text-blue-700">
                  Trần Minh Tuấn (nhanvien1)
                </div>
                <div className="text-[11px] text-blue-600">Chuyên viên bán hàng • Mật khẩu: 123456</div>
              </div>
              <span className="font-bold text-blue-600">Chọn ➔</span>
            </button>

            <button
              onClick={() => handleStaffLogin(1)}
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs hover:bg-gray-100 transition-all text-gray-800 group"
            >
              <div>
                <div className="font-bold text-gray-900">
                  Lê Thị Thu Hà (nhanvien2)
                </div>
                <div className="text-[11px] text-gray-500">Trưởng ca bán hàng • Mật khẩu: 123456</div>
              </div>
              <span className="font-bold text-gray-600">Chọn ➔</span>
            </button>

            <button
              onClick={handleAdminLogin}
              className="w-full flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-xs hover:bg-purple-100 transition-all text-purple-950 group"
            >
              <div>
                <div className="font-bold text-purple-900">
                  Quản Trị Viên (admin)
                </div>
                <div className="text-[11px] text-purple-600">Root Administrator • Mật khẩu: 123456</div>
              </div>
              <span className="font-bold text-purple-600">Chọn ➔</span>
            </button>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <HomeOutlined />
              <span>Quay về trang mua sắm iPhone (Storefront)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  if (customer.role === 'ADMIN') {
    menuItems.push({
      key: '/admin/users',
      icon: <SettingOutlined />,
      label: <Link href="/admin/users">Trang Quản trị (Admin)</Link>,
    });
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="border-r border-gray-200"
        width={250}
      >
        <div className="h-16 flex items-center justify-between border-b border-gray-100 px-4">
          <Link href="/staff/dashboard" className="flex items-center gap-2 no-underline">
            <span className="bg-black text-white px-2 py-0.5 rounded font-black text-base"></span>
            {!collapsed && (
              <span className="font-black text-gray-900 text-sm tracking-tight">
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

        <div className="p-4 border-t border-gray-100 mt-auto space-y-2">
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
          <Button
            icon={<LogoutOutlined />}
            block={!collapsed}
            danger
            size="small"
            className="text-xs"
            onClick={handleLogout}
          >
            {!collapsed && 'Đăng xuất'}
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

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:flex flex-col justify-center">
              <span className="text-sm font-bold text-gray-900 leading-snug">{customer.hoten}</span>
              <span className="text-[11px] text-blue-600 font-semibold leading-tight">
                {customer.chucvu || (customer.role === 'ADMIN' ? 'Quản Trị Viên Hệ Thống' : 'Chuyên viên bán hàng (Staff)')}
              </span>
            </div>
            <Avatar
              icon={<UserOutlined />}
              size={38}
              className={customer.role === 'ADMIN' ? 'bg-purple-600 shrink-0' : 'bg-blue-600 shrink-0'}
            />
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
  );
}
