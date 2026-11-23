'use client';

import React from 'react';
import { Card, Col, Row, Statistic, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { DashboardSummaryData } from '../../../services/reports.api';

interface SummaryCardsProps {
  data: DashboardSummaryData | null;
  loading: boolean;
}

export function SummaryCards({ data, loading }: SummaryCardsProps) {
  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const netRevenue = data?.revenue?.netRevenue ?? 0;
  const issuedInvoices = data?.revenue?.issuedInvoiceCount ?? 0;
  const voidInvoices = data?.revenue?.voidInvoiceCount ?? 0;
  const totalSold = data?.products?.totalSoldQuantity ?? 0;
  const totalOrders = data?.orders?.totalOrders ?? 0;
  const completedOrders = data?.orders?.completedOrders ?? 0;
  const cancelledOrders = data?.orders?.cancelledOrders ?? 0;
  const cancellationRate = data?.orders?.cancellationRate ?? 0;

  return (
    <Row gutter={[16, 16]}>
      {/* 1. Tổng doanh thu bán ròng */}
      <Col xs={24} sm={12} lg={6}>
        <Card bordered size="small" className="shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 font-semibold text-sm">Doanh thu bán ròng</span>
            <Tooltip title="Chỉ tính từ các hóa đơn hợp lệ (ISSUED). Tuyệt đối loại trừ hóa đơn VOID do đơn hàng bị hủy.">
              <InfoCircleOutlined className="text-gray-400 cursor-pointer" />
            </Tooltip>
          </div>
          <div className="text-2xl font-black text-blue-600 mb-2">
            {formatVnd(netRevenue)}
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-between border-t pt-2">
            <span>HĐ hợp lệ: <strong className="text-green-600">{issuedInvoices}</strong></span>
            <span>HĐ hủy (VOID): <strong className="text-red-500">{voidInvoices}</strong></span>
          </div>
        </Card>
      </Col>

      {/* 2. Tổng số iPhone đã bán */}
      <Col xs={24} sm={12} lg={6}>
        <Card bordered size="small" className="shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 font-semibold text-sm">Sản phẩm đã bán</span>
            <MobileOutlined className="text-blue-500 text-lg" />
          </div>
          <div className="text-2xl font-black text-gray-900 mb-2">
            {totalSold} <span className="text-sm font-normal text-gray-500">máy iPhone</span>
          </div>
          <div className="text-xs text-gray-500 border-t pt-2 flex items-center gap-1">
            <CheckCircleOutlined className="text-green-500" />
            <span>Đã giao thành công tới khách hàng</span>
          </div>
        </Card>
      </Col>

      {/* 3. Tổng số đơn hàng */}
      <Col xs={24} sm={12} lg={6}>
        <Card bordered size="small" className="shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 font-semibold text-sm">Tổng đơn hàng</span>
            <ShoppingOutlined className="text-indigo-500 text-lg" />
          </div>
          <div className="text-2xl font-black text-gray-900 mb-2">
            {totalOrders} <span className="text-sm font-normal text-gray-500">đơn</span>
          </div>
          <div className="text-xs text-gray-500 border-t pt-2 flex items-center justify-between">
            <span>Thành công: <strong className="text-green-600">{completedOrders}</strong></span>
            <span>Chờ duyệt: <strong className="text-orange-500">{data?.orders?.pendingOrders || 0}</strong></span>
          </div>
        </Card>
      </Col>

      {/* 4. Tỷ lệ đơn hủy */}
      <Col xs={24} sm={12} lg={6}>
        <Card bordered size="small" className="shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 font-semibold text-sm">Tỷ lệ hủy đơn hàng</span>
            <Tooltip title="Tỷ lệ giữa các đơn hàng bị hủy (trước duyệt hoặc sau duyệt) trên tổng số đơn tiếp nhận">
              <CloseCircleOutlined className="text-red-500 text-lg" />
            </Tooltip>
          </div>
          <div className="text-2xl font-black text-red-600 mb-2">
            {cancellationRate}%
          </div>
          <div className="text-xs text-gray-500 border-t pt-2 flex items-center justify-between">
            <span>Tổng đơn hủy: <strong className="text-red-500">{cancelledOrders}</strong> đơn</span>
            <span className="text-gray-400">Tồn kho đã hoàn trả</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
