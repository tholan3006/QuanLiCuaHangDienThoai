'use client';

import React, { forwardRef } from 'react';
import { InvoiceItem } from '../../../services/invoices.api';

interface PrintableInvoiceProps {
  invoice: InvoiceItem | null;
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice }, ref) => {
    if (!invoice) return null;

    const formatVnd = (num: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(num);
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()} lúc ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const order = invoice.DON_HANG;
    const customer = order?.KHACH_HANG;
    const staff = invoice.NHAN_VIEN;
    const items = order?.CHI_TIET_DON_HANG || [];
    const isVoid = invoice.trangthai === 'VOID';

    return (
      <div style={{ display: 'none' }}>
        <div
          ref={ref}
          className="print-container"
          style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: '#1f2937',
            backgroundColor: '#ffffff',
            padding: '40px',
            maxWidth: '800px',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '20px',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '20px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}
                >
                  
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '22px',
                    letterSpacing: '-0.5px',
                    color: '#111827',
                  }}
                >
                  IPHONE STORE VN
                </span>
              </div>
              <p style={{ margin: '6px 0 2px 0', fontSize: '13px', color: '#4b5563' }}>
                Đại lý Ủy quyền Chính Hãng Apple tại Việt Nam
              </p>
              <p style={{ margin: '2px 0', fontSize: '12px', color: '#6b7280' }}>
                Địa chỉ: 180 Cao Lỗ, Phường 4, Quận 8, TP. Hồ Chí Minh
              </p>
              <p style={{ margin: '2px 0', fontSize: '12px', color: '#6b7280' }}>
                Hotline hỗ trợ & Khiếu nại: 1800 6868 | Email: hotro@iphonestore.vn
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h2
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: isVoid ? '#dc2626' : '#1e40af',
                }}
              >
                {isVoid ? 'HÓA ĐƠN ĐÃ HỦY (VOID)' : 'HÓA ĐƠN BÁN HÀNG'}
              </h2>
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: isVoid ? '#fee2e2' : '#dbeafe',
                  color: isVoid ? '#b91c1c' : '#1d4ed8',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {isVoid ? 'ĐÃ HỦY / VOID' : 'HỢP LỆ / ISSUED'}
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', fontWeight: 600 }}>
                Mã HĐ: <span style={{ color: '#111827' }}>#{String(invoice.mahoadon).padStart(6, '0')}</span>
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                Mã đơn hàng: #{order?.madonhang || invoice.madonhang}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '13px', color: '#4b5563' }}>
            <em>{formatDate(invoice.ngaylap)}</em>
          </div>

          {/* Customer & Staff Info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '13px',
              border: '1px solid #f3f4f6',
            }}
          >
            <div>
              <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#374151' }}>
                THÔNG TIN KHÁCH HÀNG
              </p>
              <p style={{ margin: '3px 0' }}>
                <strong>Họ và tên:</strong> {customer?.hoten || 'Khách vãng lai'}
              </p>
              <p style={{ margin: '3px 0' }}>
                <strong>Điện thoại:</strong> {customer?.sdt || 'Chưa cập nhật'}
              </p>
              <p style={{ margin: '3px 0' }}>
                <strong>Địa chỉ giao:</strong> {customer?.diachi || 'Nhận tại cửa hàng'}
              </p>
            </div>

            <div>
              <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#374151' }}>
                THÔNG TIN GIAO DỊCH
              </p>
              <p style={{ margin: '3px 0' }}>
                <strong>Nhân viên lập:</strong> {staff?.hoten || 'Hệ thống tự động'} (NV#{staff?.manhanvien || 1})
              </p>
              <p style={{ margin: '3px 0' }}>
                <strong>Phương thức:</strong>{' '}
                {invoice.hinhthuctt === 'CHUYEN_KHOAN' ? 'Chuyển khoản Ngân hàng (VNPAY/QR)' : 'Thanh toán tiền mặt khi nhận hàng (COD)'}
              </p>
              <p style={{ margin: '3px 0' }}>
                <strong>Trạng thái:</strong> {isVoid ? 'Hóa đơn đã bị thu hồi / Hủy' : 'Đã thanh toán đầy đủ'}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '24px',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: '40px' }}>STT</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>Tên sản phẩm & Phiên bản</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: '80px' }}>SL</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', width: '130px' }}>Đơn giá</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', width: '140px' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr
                  key={it.machitiet || idx}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6b7280' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {it.SAN_PHAM?.tensanpham || `Sản phẩm #${it.masanpham}`}
                    </div>
                    {it.SAN_PHAM && (
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                        Dung lượng: {it.SAN_PHAM.dungluong} | Màu: {it.SAN_PHAM.mausac} | Bảo hành 12 tháng Apple
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>
                    {it.soluong}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#374151' }}>
                    {formatVnd(Number(it.dongia))}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                    {formatVnd(Number(it.thanhtien))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total & Summary */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '32px',
            }}
          >
            <div style={{ width: '300px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  fontSize: '13px',
                  color: '#4b5563',
                }}
              >
                <span>Cộng tiền hàng:</span>
                <span>{formatVnd(Number(invoice.tongtien))}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  fontSize: '13px',
                  color: '#4b5563',
                }}
              >
                <span>Thuế VAT (0% - đã gồm):</span>
                <span>0 ₫</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderTop: '2px solid #111827',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: isVoid ? '#dc2626' : '#111827',
                }}
              >
                <span>TỔNG CỘNG:</span>
                <span>{formatVnd(Number(invoice.tongtien))}</span>
              </div>
            </div>
          </div>

          {/* Notes & Signatures */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              textAlign: 'center',
              marginTop: '40px',
              fontSize: '13px',
            }}
          >
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 700 }}>KHÁCH HÀNG</p>
              <p style={{ margin: '0', fontSize: '11px', color: '#6b7280' }}>(Ký và ghi rõ họ tên)</p>
              <div style={{ height: '70px' }} />
              <p style={{ margin: '0', fontWeight: 600 }}>{customer?.hoten || 'Khách hàng'}</p>
            </div>

            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 700 }}>NGƯỜI LẬP HÓA ĐƠN</p>
              <p style={{ margin: '0', fontSize: '11px', color: '#6b7280' }}>(Ký và đóng dấu)</p>
              <div style={{ height: '70px' }} />
              <p style={{ margin: '0', fontWeight: 600 }}>{staff?.hoten || 'Trần Minh Tuấn'}</p>
            </div>
          </div>

          {/* Footer Terms */}
          <div
            style={{
              marginTop: '40px',
              paddingTop: '16px',
              borderTop: '1px dashed #d1d5db',
              fontSize: '11px',
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            Cảm ơn quý khách đã mua sắm tại iPhone Store VN! Quý khách vui lòng giữ hóa đơn để được hưởng chính sách bảo hành 1 đổi 1 trong 30 ngày và bảo hành 12 tháng tại các trung tâm bảo hành Apple trên toàn quốc.
          </div>
        </div>
      </div>
    );
  },
);

PrintableInvoice.displayName = 'PrintableInvoice';
