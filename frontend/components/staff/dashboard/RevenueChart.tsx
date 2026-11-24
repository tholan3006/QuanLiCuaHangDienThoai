'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from 'antd';
import { Chart } from 'chart.js/auto';
import { RevenueTrendData } from '../../../services/reports.api';

interface RevenueChartProps {
  data: RevenueTrendData | null;
  loading: boolean;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const formattedLabels = data.labels.map((dateStr) => {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return dateStr;
    });

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: formattedLabels,
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: data.datasets.revenues,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: '#2563eb',
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y',
          },
          {
            label: 'Số đơn hàng',
            data: data.datasets.orders,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderDash: [5, 5],
            fill: false,
            tension: 0.2,
            borderWidth: 2,
            pointBackgroundColor: '#10b981',
            pointRadius: 3,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              font: { family: 'inherit', size: 12 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.dataset.yAxisID === 'y') {
                  const val = context.parsed.y ?? 0;
                  return ` Doanh thu: ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(val)}`;
                }
                return ` Số đơn hàng: ${context.parsed.y} đơn`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: '#f3f4f6' },
            ticks: {
              callback: (value) => {
                const num = Number(value);
                if (num >= 1000000) return `${(num / 1000000).toFixed(0)}Tr`;
                return `${num}`;
              },
              font: { size: 11 },
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: {
              stepSize: 1,
              font: { size: 11 },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <Card
      title={<span className="font-bold text-gray-800">Biến Động Doanh Thu & Đơn Hàng Theo Thời Gian</span>}
      bordered
      size="small"
      className="shadow-sm"
      loading={loading}
    >
      <div className="h-72 w-full relative">
        <canvas ref={canvasRef} />
      </div>
    </Card>
  );
}
