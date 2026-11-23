'use client';

import React, { useEffect, useRef } from 'react';
import { Card, Col, Row } from 'antd';
import { Chart } from 'chart.js/auto';
import { PaymentAndStatusData } from '../../../services/reports.api';

interface OrderStatusChartProps {
  data: PaymentAndStatusData | null;
  loading: boolean;
}

export function OrderStatusChart({ data, loading }: OrderStatusChartProps) {
  const statusCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const paymentCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusChartRef = useRef<Chart | null>(null);
  const paymentChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!data) return;

    // 1. Render Status Chart (Doughnut)
    if (statusCanvasRef.current) {
      if (statusChartRef.current) statusChartRef.current.destroy();
      const ctx = statusCanvasRef.current.getContext('2d');
      if (ctx) {
        statusChartRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Hoàn thành', 'Chờ duyệt', 'Đã hủy'],
            datasets: [
              {
                data: [
                  data.orderStatuses.completed,
                  data.orderStatuses.pending,
                  data.orderStatuses.cancelled,
                ],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { boxWidth: 12, font: { size: 11 } },
              },
            },
            cutout: '65%',
          },
        });
      }
    }

    // 2. Render Payment Chart (Doughnut)
    if (paymentCanvasRef.current) {
      if (paymentChartRef.current) paymentChartRef.current.destroy();
      const ctx = paymentCanvasRef.current.getContext('2d');
      if (ctx) {
        paymentChartRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Chuyển khoản', 'COD (Tiền mặt)'],
            datasets: [
              {
                data: [
                  data.paymentMethods.transfer.revenue,
                  data.paymentMethods.cod.revenue,
                ],
                backgroundColor: ['#3b82f6', '#f97316'],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { boxWidth: 12, font: { size: 11 } },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const val = Number(context.raw);
                    return ` ${context.label}: ${new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(val)}`;
                  },
                },
              },
            },
            cutout: '65%',
          },
        });
      }
    }

    return () => {
      if (statusChartRef.current) statusChartRef.current.destroy();
      if (paymentChartRef.current) paymentChartRef.current.destroy();
    };
  }, [data]);

  return (
    <Card
      title={<span className="font-bold text-gray-800">Cơ Cấu Đơn Hàng & Doanh Thu</span>}
      bordered
      size="small"
      className="shadow-sm h-full"
      loading={loading}
    >
      <Row gutter={[16, 16]}>
        <Col span={12} className="text-center">
          <p className="text-xs font-semibold text-gray-500 mb-2">Trạng thái đơn hàng</p>
          <div className="h-44 relative">
            <canvas ref={statusCanvasRef} />
          </div>
        </Col>

        <Col span={12} className="text-center">
          <p className="text-xs font-semibold text-gray-500 mb-2">Phương thức thanh toán</p>
          <div className="h-44 relative">
            <canvas ref={paymentCanvasRef} />
          </div>
        </Col>
      </Row>
    </Card>
  );
}
