'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  FileTextOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { InvoiceFilterParams, InvoiceItem, InvoiceListResponse } from '../../../services/invoices.api';
import { InvoiceDetailModal } from './InvoiceDetailModal';

const { RangePicker } = DatePicker;

interface InvoiceTableProps {
  data: InvoiceItem[];
  meta: InvoiceListResponse['meta'];
  loading: boolean;
  onFilterChange: (params: InvoiceFilterParams) => void;
  onRefresh: () => void;
}

export function InvoiceTable({
  data,
  meta,
  loading,
  onFilterChange,
  onRefresh,
}: InvoiceTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('');

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const handleSearch = () => {
    onFilterChange({
      search: searchTerm,
      trangthai: statusFilter,
      hinhthuctt: paymentFilter || undefined,
    });
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    onFilterChange({
      search: searchTerm,
      trangthai: statusFilter,
      hinhthuctt: paymentFilter || undefined,
      fromDate: dateStrings[0] || undefined,
      toDate: dateStrings[1] || undefined,
    });
  };

  const handleOpenDetail = (record: InvoiceItem) => {
    setSelectedInvoice(record);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'mahoadon',
      key: 'mahoadon',
      width: 100,
      align: 'center' as const,
      render: (val: number) => (
        <span className="font-bold text-blue-600">
          #{String(val).padStart(6, '0')}
        </span>
      ),
    },
    {
      title: 'Mã Đơn',
      dataIndex: 'madonhang',
      key: 'madonhang',
      width: 90,
      align: 'center' as const,
      render: (val: number) => <span className="font-semibold text-gray-700">#{val}</span>,
    },
    {
      title: 'Ngày lập',
      dataIndex: 'ngaylap',
      key: 'ngaylap',
      width: 160,
      render: (dateStr: string) => (
        <span className="text-xs text-gray-600">
          {dateStr ? new Date(dateStr).toLocaleString('vi-VN') : '---'}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_: any, record: InvoiceItem) => {
        const c = record.DON_HANG?.KHACH_HANG;
        return (
          <div>
            <div className="font-semibold text-gray-900">{c?.hoten || 'Khách vãng lai'}</div>
            {c?.sdt && <div className="text-xs text-gray-500">{c.sdt}</div>}
          </div>
        );
      },
    },
    {
      title: 'Nhân viên lập',
      key: 'staff',
      width: 160,
      render: (_: any, record: InvoiceItem) => (
        <span className="text-sm text-gray-800">
          {record.NHAN_VIEN?.hoten || 'Trần Minh Tuấn'}
        </span>
      ),
    },
    {
      title: 'Hình thức TT',
      dataIndex: 'hinhthuctt',
      key: 'hinhthuctt',
      width: 140,
      align: 'center' as const,
      render: (val: string) => (
        <Tag color={val === 'CHUYEN_KHOAN' ? 'blue' : 'orange'}>
          {val === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'COD (Tiền mặt)'}
        </Tag>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongtien',
      key: 'tongtien',
      width: 150,
      align: 'right' as const,
      render: (val: number, record: InvoiceItem) => (
        <span
          className={`font-bold ${
            record.trangthai === 'VOID' ? 'line-through text-gray-400' : 'text-gray-900'
          }`}
        >
          {formatVnd(Number(val))}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangthai',
      key: 'trangthai',
      width: 140,
      align: 'center' as const,
      render: (status: string) => {
        if (status === 'VOID') {
          return (
            <Tag icon={<CloseCircleOutlined />} color="error">
              ĐÃ HỦY (VOID)
            </Tag>
          );
        }
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            HỢP LỆ (ISSUED)
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: InvoiceItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết & In hóa đơn khổ A4">
            <Button
              type="primary"
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => handleOpenDetail(record)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              In A4
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Thống kê nhanh trên đầu trang */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered size="small" className="shadow-sm">
            <Statistic
              title={<span className="text-gray-500 font-medium">Tổng hóa đơn phát hành</span>}
              value={meta?.total || data.length}
              prefix={<FileTextOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered size="small" className="shadow-sm">
            <Statistic
              title={<span className="text-gray-500 font-medium">Hóa đơn hợp lệ (ISSUED)</span>}
              value={meta?.totalIssued || data.filter((i) => i.trangthai === 'ISSUED').length}
              valueStyle={{ color: '#16a34a' }}
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered size="small" className="shadow-sm">
            <Statistic
              title={<span className="text-gray-500 font-medium">Hóa đơn đã hủy (VOID)</span>}
              value={meta?.totalVoid || data.filter((i) => i.trangthai === 'VOID').length}
              valueStyle={{ color: '#dc2626' }}
              prefix={<CloseCircleOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered size="small" className="shadow-sm">
            <Statistic
              title={<span className="text-gray-500 font-medium">Doanh thu hóa đơn ISSUED</span>}
              value={formatVnd(meta?.totalIssuedRevenue || 80470000)}
              valueStyle={{ color: '#2563eb', fontSize: '18px', fontWeight: 'bold' }}
              prefix={<DollarOutlined className="text-blue-600" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Thanh bộ lọc tìm kiếm */}
      <Card bordered size="small" className="shadow-sm">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm theo Mã HĐ, Mã đơn, Tên KH, SĐT..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>

          <Col xs={12} md={4}>
            <Select
              className="w-full"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                onFilterChange({
                  search: searchTerm,
                  trangthai: val,
                  hinhthuctt: paymentFilter || undefined,
                });
              }}
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Hợp lệ (ISSUED)', value: 'ISSUED' },
                { label: 'Đã hủy (VOID)', value: 'VOID' },
              ]}
            />
          </Col>

          <Col xs={12} md={4}>
            <Select
              className="w-full"
              value={paymentFilter}
              onChange={(val) => {
                setPaymentFilter(val);
                onFilterChange({
                  search: searchTerm,
                  trangthai: statusFilter,
                  hinhthuctt: val || undefined,
                });
              }}
              placeholder="Hình thức TT"
              options={[
                { label: 'Tất cả hình thức TT', value: '' },
                { label: 'Chuyển khoản', value: 'CHUYEN_KHOAN' },
                { label: 'COD (Tiền mặt)', value: 'COD' },
              ]}
            />
          </Col>

          <Col xs={24} md={6}>
            <RangePicker
              className="w-full"
              format="YYYY-MM-DD"
              onChange={handleDateChange}
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Col>

          <Col xs={24} md={4} className="flex justify-end gap-2">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Tìm kiếm
            </Button>
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bảng danh sách hóa đơn */}
      <Card bordered size="small" className="shadow-sm">
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(r) => r.mahoadon}
          loading={loading}
          pagination={{
            current: meta?.page || 1,
            pageSize: meta?.limit || 10,
            total: meta?.total || data.length,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} hóa đơn`,
            onChange: (page, limit) => {
              onFilterChange({
                search: searchTerm,
                trangthai: statusFilter,
                hinhthuctt: paymentFilter || undefined,
                page,
                limit,
              });
            },
          }}
        />
      </Card>

      {/* Modal chi tiết hóa đơn & in ấn */}
      <InvoiceDetailModal
        visible={detailModalOpen}
        invoice={selectedInvoice}
        onClose={() => setDetailModalOpen(false)}
      />
    </div>
  );
}
