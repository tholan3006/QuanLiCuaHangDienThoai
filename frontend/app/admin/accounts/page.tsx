'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Account, CreateAccount, fetchAccounts, setAccountActive, updateAccount, createAccount } from '../../../services/users.api';
import { AppRole, clearAuth, readAuthUser } from '../../../lib/auth';

interface AccountForm {
  email: string;
  password?: string;
  role: AppRole;
}

const roleLabels: Record<AppRole, string> = {
  ADMIN: 'Quản trị viên',
  STAFF: 'Nhân viên',
  CUSTOMER: 'Khách hàng',
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<AccountForm>();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      setAccounts(await fetchAccounts());
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    const user = readAuthUser();
    setCurrentUserId(user?.mataikhoan ?? null);
    setCurrentRole(user?.role ?? null);
    void loadAccounts();
  }, [loadAccounts]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: 'CUSTOMER' });
    setOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditing(account);
    form.resetFields();
    form.setFieldsValue({
      role: account.role ?? 'CUSTOMER',
    });
    setOpen(true);
  };

  const saveAccount = async (values: AccountForm) => {
    setSaving(true);
    try {
      if (editing) {
        await updateAccount(editing.mataikhoan, {
          email: editing.email,
          role: values.role,
        });
        messageApi.success('Đã cập nhật tài khoản');
        if (editing.mataikhoan === currentUserId && values.role !== 'ADMIN') {
          clearAuth();
          router.replace('/auth');
          return;
        }
      } else {
        if (!values.password) throw new Error('Vui lòng nhập mật khẩu');
        const payload: CreateAccount = {
          email: values.email,
          password: values.password,
          role: values.role,
        };
        await createAccount(payload);
        messageApi.success('Đã tạo tài khoản');
      }
      setOpen(false);
      await loadAccounts();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Không thể lưu tài khoản');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (account: Account) => {
    try {
      await setAccountActive(account.mataikhoan, !account.isActive);
      messageApi.success(account.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      await loadAccounts();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Không thể thay đổi trạng thái tài khoản');
    }
  };

  const columns: TableColumnsType<Account> = [
    { title: 'Mã', dataIndex: 'mataikhoan', width: 75 },
    { title: 'Họ và tên', dataIndex: 'fullName' },
    { title: 'Tên đăng nhập', dataIndex: 'tendangnhap' },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      render: (role: AppRole | null) =>
        role ? (
          <Tag color={role === 'ADMIN' ? 'purple' : role === 'STAFF' ? 'blue' : 'default'}>
            {roleLabels[role]}
          </Tag>
        ) : '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>{active ? 'Hoạt động' : 'Đã khóa'}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, account) => {
        const isCurrentAdmin =
          account.mataikhoan === currentUserId &&
          currentRole === 'ADMIN' &&
          account.isActive;
        return (
          <Space>
            <Button type="link" onClick={() => openEdit(account)}>
              Sửa / phân quyền
            </Button>
            <Popconfirm
              title={account.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?'}
              description={
                isCurrentAdmin || account.role === 'ADMIN'
                  ? 'Không thể khóa Admin đang đăng nhập hoặc Admin cuối cùng.'
                  : undefined
              }
              onConfirm={() => void toggleStatus(account)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button type="link" danger={account.isActive} disabled={isCurrentAdmin}>
                {account.isActive ? 'Khóa' : 'Mở khóa'}
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <main className="admin-page">
        <header className="admin-header">
          <div>
            <Link href="/" className="admin-brand">iPhone Store / Admin</Link>
            <Typography.Text type="secondary">Quản lý tài khoản</Typography.Text>
          </div>
          <Button
            onClick={() => {
              clearAuth();
              router.replace('/auth');
            }}
          >
            Đăng xuất
          </Button>
        </header>
        <Card className="admin-card" bordered={false}>
          <div className="admin-title-row">
            <div>
              <Typography.Title level={2}>Quản lý tài khoản</Typography.Title>
              <Typography.Paragraph type="secondary">
                Tạo tài khoản, cập nhật thông tin, phân quyền và khóa/mở khóa người dùng.
              </Typography.Paragraph>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => void loadAccounts()}>
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Thêm tài khoản
              </Button>
            </Space>
          </div>
          <Table<Account>
            rowKey="mataikhoan"
            columns={columns}
            dataSource={accounts}
            loading={loading}
            scroll={{ x: 800 }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>

        <Modal
          title={editing ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => form.submit()}
          confirmLoading={saving}
          okText="Lưu"
          cancelText="Hủy"
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={saveAccount} preserve={false}>
            {!editing && (
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' },
                  { max: 100, message: 'Email không được vượt quá 100 ký tự' },
                ]}
              >
                <Input autoComplete="email" />
              </Form.Item>
            )}
            {!editing && (
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự' },
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            )}
            <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
              <Select
                options={(Object.keys(roleLabels) as AppRole[]).map((role) => ({
                  value: role,
                  label: roleLabels[role],
                }))}
              />
            </Form.Item>
          </Form>
        </Modal>
      </main>
    </>
  );
}
