'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Typography,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { getRoleHome, saveAuth } from '../../lib/auth';
import { login, register } from '../../services/auth.api';

interface AuthFormValues {
  identifier?: string;
  email?: string;
  password: string;
}

export default function AuthPage() {
  const [registerMode, setRegisterMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm<AuthFormValues>();
  const router = useRouter();

  const submit = async (values: AuthFormValues) => {
    setSubmitting(true);
    setError('');
    try {
      const response = registerMode
        ? await register({
            email: values.email!,
            password: values.password,
          })
        : await login(values.identifier!, values.password);

      saveAuth(response);
      router.replace(getRoleHome(response.user.role));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể kết nối máy chủ',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setError('');
    form.resetFields();
    setRegisterMode(!registerMode);
  };

  return (
    <main className="auth-page">
      <Card className="auth-card" bordered={false}>
        <Link href="/" className="auth-brand">iPhone Store</Link>
        <Typography.Title level={2}>
          {registerMode ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          {registerMode
            ? 'Đăng ký tài khoản khách hàng để bắt đầu mua sắm.'
            : 'Đăng nhập để tiếp tục với cửa hàng.'}
        </Typography.Paragraph>
        {error && <Alert className="auth-alert" type="error" showIcon message={error} />}
        <Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
          {registerMode ? (
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
                { max: 100, message: 'Email không được vượt quá 100 ký tự' },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="ban@example.com"
                autoComplete="email"
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="identifier"
              label="Tên đăng nhập hoặc email"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email' }]}
            >
              <Input size="large" prefix={<MailOutlined />} autoComplete="username" />
            </Form.Item>
          )}
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu cần ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              autoComplete={registerMode ? 'new-password' : 'current-password'}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
            {registerMode ? 'Đăng ký' : 'Đăng nhập'}
          </Button>
        </Form>
        <div className="auth-toggle">
          {registerMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <Button type="link" onClick={toggleMode}>
            {registerMode ? 'Đăng nhập' : 'Đăng ký ngay'}
          </Button>
        </div>
        <Link href="/" className="auth-back">← Quay lại trang chủ</Link>
      </Card>
    </main>
  );
}
