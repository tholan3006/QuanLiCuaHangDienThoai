'use client';

import React from 'react';
import { Card, Progress, Table, Tag } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { TopProductItem } from '../../../services/reports.api';

interface TopProductsChartProps {
  products: TopProductItem[];
  loading: boolean;
}

export function TopProductsChart({ products, loading }: TopProductsChartProps) {
  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const maxSold = Math.max(...products.map((p) => p.soldQuantity), 1);

  const columns = [
    {
      title: 'Top',
      key: 'rank',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => {
        let badgeColor = 'bg-gray-100 text-gray-700';
        if (index === 0) badgeColor = 'bg-yellow-100 text-yellow-800 font-bold border border-yellow-300';
        if (index === 1) badgeColor = 'bg-slate-200 text-slate-800 font-bold border border-slate-300';
        if (index === 2) badgeColor = 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
        return (
          <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 text-xs ${badgeColor}`}>
            {index + 1}
          </span>
        );
      },
    },
    {
      title: 'Sản phẩm iPhone',
      key: 'product',
      render: (_: any, record: TopProductItem) => (
        <div className="flex items-center gap-3">
          {record.hinhanh ? (
            <img
              src={record.hinhanh}
              alt={record.tensanpham}
              className="w-10 h-10 object-contain rounded border border-gray-100 p-0.5"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
              
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900 text-sm">{record.tensanpham}</div>
            <div className="text-xs text-gray-500">
              {record.dungluong} | {record.mausac}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'giaban',
      key: 'giaban',
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-xs text-gray-600">{formatVnd(Number(price))}</span>
      ),
    },
    {
      title: 'Đã bán',
      key: 'sold',
      width: 140,
      render: (_: any, record: TopProductItem) => (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-gray-800">{record.soldQuantity} máy</span>
          </div>
          <Progress
            percent={Math.round((record.soldQuantity / maxSold) * 100)}
            showInfo={false}
            strokeColor="#2563eb"
            size="small"
          />
        </div>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right' as const,
      render: (val: number) => (
        <span className="font-bold text-blue-600 text-sm">{formatVnd(Number(val))}</span>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500" />
          <span className="font-bold text-gray-800">Top 5 Sản Phẩm iPhone Bán Chạy Nhất</span>
        </div>
      }
      bordered
      size="small"
      className="shadow-sm h-full"
      loading={loading}
    >
      <Table
        dataSource={products}
        columns={columns}
        rowKey={(r) => r.masanpham}
        pagination={false}
        size="small"
      />
    </Card>
  );
}
