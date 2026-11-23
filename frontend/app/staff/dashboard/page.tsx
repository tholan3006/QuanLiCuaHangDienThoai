'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Row, Select, Space, Typography } from 'antd';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import {
  DashboardSummaryData,
  PaymentAndStatusData,
  ReportFilterParams,
  RevenueTrendData,
  TopProductItem,
  fetchDashboardSummary,
  fetchPaymentAndStatusStats,
  fetchRevenueTrend,
  fetchTopSellingProducts,
} from '../../../services/reports.api';
import { SummaryCards } from '../../../components/staff/dashboard/SummaryCards';
import { RevenueChart } from '../../../components/staff/dashboard/RevenueChart';
import { TopProductsChart } from '../../../components/staff/dashboard/TopProductsChart';
import { OrderStatusChart } from '../../../components/staff/dashboard/OrderStatusChart';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function StaffDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [trendData, setTrendData] = useState<RevenueTrendData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<PaymentAndStatusData | null>(null);

  const [dateRange, setDateRange] = useState<ReportFilterParams>({
    startDate: '2026-11-01',
    endDate: '2026-11-30',
  });

  const loadAllReports = async (params: ReportFilterParams = dateRange) => {
    setLoading(true);
    try {
      const [sumRes, trendRes, topRes, psRes] = await Promise.all([
        fetchDashboardSummary(params),
        fetchRevenueTrend(params),
        fetchTopSellingProducts(5, params),
        fetchPaymentAndStatusStats(params),
      ]);

      setSummaryData(sumRes.data);
      setTrendData(trendRes.data);
      setTopProducts(topRes.data);
      setPaymentStatusData(psRes.data);
    } catch (err) {
      console.error('Lỗi khi tải báo cáo thống kê:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports(dateRange);
  }, []);

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    const params: ReportFilterParams = {
      startDate: dateStrings[0] || undefined,
      endDate: dateStrings[1] || undefined,
    };
    setDateRange(params);
    loadAllReports(params);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Dashboard Báo Cáo & Thống Kê Doanh Thu
          </Title>
          <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
            Tổng hợp doanh thu bán ròng (loại trừ hóa đơn hủy VOID), sản phẩm bán chạy và tỷ lệ đơn hàng
          </Paragraph>
        </div>

        <Space wrap>
          <RangePicker
            format="YYYY-MM-DD"
            onChange={handleDateChange}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadAllReports(dateRange)}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* 4 Thẻ Thống Kê Chính */}
      <SummaryCards data={summaryData} loading={loading} />

      {/* Biểu đồ Doanh Thu Theo Thời Gian */}
      <RevenueChart data={trendData} loading={loading} />

      {/* Hàng dưới: Top Sản Phẩm Bán Chạy & Cơ Cấu Đơn Hàng */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <TopProductsChart products={topProducts} loading={loading} />
        </Col>
        <Col xs={24} lg={10}>
          <OrderStatusChart data={paymentStatusData} loading={loading} />
        </Col>
      </Row>
    </div>
  );
}
