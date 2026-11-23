'use client';

import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { InvoiceFilterParams, InvoiceItem, InvoiceListResponse, fetchInvoices } from '../../../services/invoices.api';
import { InvoiceTable } from '../../../components/staff/invoices/InvoiceTable';

const { Title, Paragraph } = Typography;

export default function StaffInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [meta, setMeta] = useState<InvoiceListResponse['meta']>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    totalIssued: 0,
    totalVoid: 0,
    totalIssuedRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InvoiceFilterParams>({});

  const loadData = async (params: InvoiceFilterParams = {}) => {
    setLoading(true);
    try {
      const res = await fetchInvoices(params);
      setInvoices(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error('Lỗi khi tải danh sách hóa đơn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filters);
  }, []);

  const handleFilterChange = (newParams: InvoiceFilterParams) => {
    const updated = { ...filters, ...newParams };
    setFilters(updated);
    loadData(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản Lý Hóa Đơn Bán Hàng
          </Title>
          <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
            Tra cứu, kiểm tra tình trạng hóa đơn hợp lệ (ISSUED) / đã hủy (VOID) và in hóa đơn khổ A4
          </Paragraph>
        </div>
      </div>

      <InvoiceTable
        data={invoices}
        meta={meta}
        loading={loading}
        onFilterChange={handleFilterChange}
        onRefresh={() => loadData(filters)}
      />
    </div>
  );
}
