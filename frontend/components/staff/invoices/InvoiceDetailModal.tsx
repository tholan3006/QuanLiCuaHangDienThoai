'use client';

import React, { useRef } from 'react';
import { Badge, Button, Descriptions, Divider, Modal, Table, Tag } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { InvoiceItem } from '../../../services/invoices.api';
import { PrintableInvoice } from './PrintableInvoice';

interface InvoiceDetailModalProps {
  visible: boolean;
  invoice: InvoiceItem | null;
  onClose: () => void;
}

export function InvoiceDetailModal({ visible, invoice, onClose }: InvoiceDetailModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: invoice ? `HoaDon_HD${String(invoice.mahoadon).padStart(6, '0')}` : 'HoaDon',
  });

  if (!invoice) return null;

  const order = invoice.DON_HANG;
  const customer = order?.KHACH_HANG;
  const items = order?.CHI_TIET_DON_HANG || [];
  const isVoid = invoice.trangthai === 'VOID';

  const formatVnd = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      key: 'product',
      render: (_: any, record: any) => (
        <div>
          <div className="font-semibold text-gray-900">
            {record.SAN_PHAM?.tensanpham || `Sản phẩm #${record.masanpham}`}
          </div>
          {record.SAN_PHAM && (
            <div className="text-xs text-gray-500">
              Dung lượng: {record.SAN_PHAM.dungluong} | Màu: {record.SAN_PHAM.mausac}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'dongia',
      key: 'dongia',
      align: 'right' as const,
      render: (price: number) => formatVnd(Number(price)),
    },
    {
      title: 'Số lượng',
      dataIndex: 'soluong',
      key: 'soluong',
      width: 90,
      align: 'center' as const,
      render: (qty: number) => <span className="font-semibold">{qty}</span>,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'thanhtien',
      key: 'thanhtien',
      align: 'right' as const,
      render: (total: number) => (
        <span className="font-bold text-gray-900">{formatVnd(Number(total))}</span>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        title={
          <div className="flex items-center justify-between pr-8">
            <span className="text-lg font-bold">
              Chi tiết Hóa đơn #{String(invoice.mahoadon).padStart(6, '0')}
            </span>
            <Tag color={isVoid ? 'error' : 'success'} className="px-3 py-1 font-semibold text-sm">
              {isVoid ? 'HÓA ĐƠN ĐÃ HỦY (VOID)' : 'HÓA ĐƠN HỢP LỆ (ISSUED)'}
            </Tag>
          </div>
        }
        width={800}
        footer={[
          <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            In hóa đơn A4
          </Button>,
        ]}
      >
        <div className="space-y-4 py-2">
          {isVoid && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              <strong>Lưu ý:</strong> Hóa đơn này đã chuyển sang trạng thái <strong>VOID</strong> do đơn hàng tương ứng đã bị hủy sau khi duyệt. Doanh thu của hóa đơn này không được tính vào báo cáo tài chính.
            </div>
          )}

          <Descriptions bordered size="small" column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Mã hóa đơn">
              <span className="font-bold text-blue-600">
                #{String(invoice.mahoadon).padStart(6, '0')}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Mã đơn hàng">
              <span className="font-semibold">#{order?.madonhang || invoice.madonhang}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày lập">
              {invoice.ngaylap ? new Date(invoice.ngaylap).toLocaleString('vi-VN') : '---'}
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức thanh toán">
              <Tag color={invoice.hinhthuctt === 'CHUYEN_KHOAN' ? 'blue' : 'green'}>
                {invoice.hinhthuctt === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'COD (Tiền mặt)'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên lập">
              {invoice.NHAN_VIEN?.hoten || 'Trần Minh Tuấn'} (Mã #{invoice.manhanvien || 1})
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {customer?.hoten || 'Khách vãng lai'}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {customer?.sdt || '---'}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ nhận">
              {customer?.diachi || '---'}
            </Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: '16px 0 8px 0' }} />

          <h4 className="font-semibold text-gray-800 text-sm">Danh sách sản phẩm trong hóa đơn:</h4>
          <Table
            dataSource={items}
            columns={columns}
            rowKey={(r) => r.machitiet || r.masanpham}
            pagination={false}
            size="small"
            bordered
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-gray-50 font-bold">
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    Tổng cộng:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <span className="text-base text-red-600">
                      {formatVnd(Number(invoice.tongtien))}
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </Modal>

      {/* Component ẩn dùng để render ra khổ in A4 */}
      <PrintableInvoice ref={printRef} invoice={invoice} />
    </>
  );
}
