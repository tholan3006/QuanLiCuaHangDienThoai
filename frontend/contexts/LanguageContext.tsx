'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'VI' | 'EN';

export interface Translations {
  [key: string]: {
    VI: string;
    EN: string;
  };
}

export const DICTIONARY = {
  // Navbar
  home: { VI: 'Trang chủ', EN: 'Home' },
  products: { VI: 'Sản Phẩm', EN: 'Products' },
  cart: { VI: 'Giỏ hàng', EN: 'Cart' },
  all_iphone: { VI: 'Tất cả iPhone', EN: 'All iPhones' },
  search_placeholder: {
    VI: 'Tìm iPhone 16 Pro Max, Titan Sa Mạc, 256GB...',
    EN: 'Search iPhone 16 Pro, Desert Titanium...',
  },
  sign_in: { VI: 'Đăng Nhập', EN: 'Sign In' },
  sign_out: { VI: 'Đăng xuất', EN: 'Sign Out' },
  member_customer: { VI: 'Khách hàng thành viên', EN: 'Member Customer' },
  order_payment: { VI: 'Đơn hàng & Thanh toán', EN: 'Order & Payment' },
  suggestions: { VI: 'Gợi ý sản phẩm', EN: 'Product suggestions' },
  searching: { VI: 'Đang tìm...', EN: 'Searching...' },
  not_found: { VI: 'Không tìm thấy iPhone nào khớp với', EN: 'No iPhone matched' },
  view_all_for: { VI: 'Xem tất cả kết quả cho', EN: 'View all results for' },
  staff_portal: { VI: 'Cổng Nhân Viên', EN: 'Staff Portal' },
  admin_portal: { VI: 'Trang Quản Trị', EN: 'Admin Panel' },

  // Banner
  flagship_badge: {
    VI: 'Flagship Mới Nhất • iPhone 16 Pro Max',
    EN: 'Latest Flagship • iPhone 16 Pro Max',
  },
  hero_title_1: { VI: 'Sức Mạnh Titan.', EN: 'Titanium Power.' },
  hero_title_2: { VI: 'Titan Sa Mạc Đột Phá.', EN: 'Breakthrough Desert Titanium.' },
  hero_desc: {
    VI: 'Trang bị Chip Apple A18 Pro tối tân, Nút Điều Khiển Camera (Camera Control), Zoom quang 5x và thời lượng pin vượt trội.',
    EN: 'Powered by the advanced Apple A18 Pro chip, Camera Control button, 5x optical zoom, and outstanding all-day battery life.',
  },
  explore_16: { VI: 'Khám Phá iPhone 16 Pro Max', EN: 'Explore iPhone 16 Pro Max' },
  view_all_models: { VI: 'Xem Toàn Bộ Dòng Máy', EN: 'View All Series' },
  spec_chip: { VI: 'Chip 3nm thế hệ mới', EN: 'Next-gen 3nm Chip' },
  spec_cam: { VI: 'Quay 4K 120fps', EN: '4K 120fps Dolby Vision' },
  spec_battery: { VI: 'Xem video liên tục', EN: 'Continuous Video Playback' },
  in_stock_banner: {
    VI: 'Sẵn hàng giao ngay tại hệ thống iStore',
    EN: 'In stock for immediate delivery at iStore',
  },

  // Home Page
  series_heading: { VI: 'Khám Phá Các Dòng iPhone', EN: 'Explore iPhone Series' },
  series_sub: {
    VI: 'Chọn thế hệ iPhone yêu thích để xem đầy đủ phiên bản màu sắc & dung lượng',
    EN: 'Choose your favorite iPhone generation to view all colors & capacities',
  },
  all_products_link: { VI: 'Tất cả sản phẩm', EN: 'All Products' },
  versions: { VI: 'phiên bản', EN: 'models' },
  price_from: { VI: 'Giá chỉ từ', EN: 'From' },
  view_now: { VI: 'Xem ngay', EN: 'Explore Now' },
  featured_heading: { VI: 'Gợi Ý Mua Sắm Nổi Bật', EN: 'Featured Recommendations' },

  // Product Card
  in_stock: { VI: 'Còn hàng', EN: 'In Stock' },
  out_of_stock: { VI: 'Hết hàng', EN: 'Out of Stock' },
  only_left: { VI: 'Còn', EN: 'Only' },
  units_left: { VI: 'máy', EN: 'left' },
  color_label: { VI: 'Màu', EN: 'Color' },
  stock_label: { VI: 'Kho', EN: 'Stock' },
  installment_label: {
    VI: 'Trả góp 0% • Bảo hành 12 tháng Apple Care',
    EN: '0% Installment • 12-Month Apple Care',
  },
  add_to_cart: { VI: 'Thêm Giỏ', EN: 'Add to Cart' },
  view_details: { VI: 'Chi Tiết', EN: 'Details' },
  trade_in_badge: { VI: 'Thu cũ trợ giá 2 Tr', EN: 'Trade-in bonus 2M' },

  // Product Detail
  select_storage_title: { VI: '1. Chọn Dung Lượng Bộ Nhớ', EN: '1. Select Storage Capacity' },
  selected_storage_label: { VI: 'Đang chọn', EN: 'Selected' },
  available_storage: { VI: 'Có sẵn', EN: 'Available' },
  out_storage: { VI: 'Tạm hết', EN: 'Out of stock' },
  select_color_title: { VI: '2. Chọn Màu Sắc', EN: '2. Select Color' },
  colors_count: { VI: 'màu sắc', EN: 'colors' },
  purchase_quantity: { VI: '3. Số Lượng Mua', EN: '3. Quantity' },
  max_stock_label: { VI: 'Tối đa', EN: 'Max' },
  subtotal_label: { VI: 'Thành tiền', EN: 'Subtotal' },
  add_cart_btn: { VI: 'Thêm Vào Giỏ Hàng', EN: 'Add to Cart' },
  buy_now_btn: { VI: 'Mua Ngay', EN: 'Buy Now' },
  warranty_title: {
    VI: 'Bảo Hành Apple Chính Hãng 12 Tháng',
    EN: '12-Month Official Apple Care Warranty',
  },
  warranty_desc: {
    VI: 'Sản phẩm phiên bản VN/A chính hãng, được bảo hành 12 tháng tại các trung tâm Apple Care ủy quyền trên toàn quốc. 1 đổi 1 trong 30 ngày nếu lỗi phần cứng.',
    EN: 'Genuine VN/A model, backed by a 12-month nationwide Apple Authorized Service Provider warranty. 30-day 1-to-1 replacement for hardware faults.',
  },
  specs_title: { VI: 'Thông Số Kỹ Thuật Chi Tiết', EN: 'Technical Specifications' },
  related_title: { VI: 'Sản Phẩm Cùng Dòng Máy', EN: 'Related Products in Series' },

  // Cart
  your_cart: { VI: 'Giỏ Hàng Của Bạn', EN: 'Your Shopping Cart' },
  clear_cart: { VI: 'Xóa tất cả', EN: 'Clear All' },
  empty_cart_title: { VI: 'Giỏ hàng của bạn đang trống!', EN: 'Your cart is empty!' },
  empty_cart_desc: {
    VI: 'Hãy khám phá các dòng iPhone 16 Pro Max, iPhone 15 Series chính hãng với nhiều ưu đãi và thêm vào giỏ hàng ngay.',
    EN: 'Discover genuine iPhone 16 Pro Max and iPhone 15 Series with exclusive deals and add them to your cart now.',
  },
  explore_btn: { VI: 'Khám Phá Sản Phẩm Ngay', EN: 'Explore Products Now' },
  unit_price: { VI: 'Đơn giá', EN: 'Unit Price' },
  free_shipping_title: {
    VI: 'Đơn hàng của bạn đủ điều kiện Miễn Phí Vận Chuyển toàn quốc!',
    EN: 'Your order qualifies for Free Nationwide Delivery!',
  },
  free_shipping_sub: {
    VI: 'Giao nhanh trong 2 giờ tại TP.HCM & Hà Nội, 24-48 giờ trên toàn quốc.',
    EN: 'Express 2-hour delivery in HCMC & Hanoi, 24-48 hours nationwide.',
  },
  order_summary: { VI: 'Tóm Tắt Đơn Hàng', EN: 'Order Summary' },
  total_items: { VI: 'Số lượng sản phẩm', EN: 'Total Items' },
  subtotal_goods: { VI: 'Tạm tính tiền hàng', EN: 'Subtotal' },
  shipping_fee: { VI: 'Phí vận chuyển', EN: 'Shipping Fee' },
  free: { VI: 'Miễn phí (0 ₫)', EN: 'Free (0 ₫)' },
  official_warranty: { VI: 'Bảo hành chính hãng', EN: 'Official Warranty' },
  apple_care_12m: { VI: '12 Tháng Apple Care', EN: '12-Month Apple Care' },
  total_payment: { VI: 'Tổng thanh toán', EN: 'Total Payment' },
  vat_included: { VI: '(Đã bao gồm thuế VAT)', EN: '(VAT included)' },
  proceed_order: { VI: 'Tiến Hành Đặt Hàng & Thanh Toán', EN: 'Proceed to Order & Payment' },
  continue_shopping: { VI: 'Tiếp Tục Chọn Sản Phẩm Khác', EN: 'Continue Shopping' },
  auth_required_title: { VI: 'Yêu Cầu Đăng Nhập Tài Khoản', EN: 'Account Sign-In Required' },
  auth_required_desc: {
    VI: 'Theo quy định mua sắm tại iStore, khách hàng cần đăng nhập tài khoản để xem, quản lý giỏ hàng và thực hiện quy trình đặt hàng an toàn.',
    EN: 'Per iStore shopping policies, please sign in to view and manage your cart and securely place your order.',
  },
  auth_required_btn: { VI: 'Đăng Nhập Hoặc Đăng Ký Ngay', EN: 'Sign In or Register Now' },

  // Checkout
  checkout_heading: { VI: 'Đặt Hàng & Thanh Toán', EN: 'Order & Payment' },
  checkout_sub: {
    VI: 'Vui lòng kiểm tra thông tin người nhận, danh sách sản phẩm và đối chiếu giá bán trước khi gửi đơn hàng.',
    EN: 'Please verify shipping info, product list, and real-time prices before submitting your order.',
  },
  recipient_info_title: {
    VI: 'Thông Tin Người Nhận & Địa Chỉ Giao Hàng',
    EN: 'Recipient Information & Shipping Address',
  },
  recipient_name_label: { VI: 'Họ và tên người nhận', EN: 'Recipient Full Name' },
  recipient_phone_label: { VI: 'Số điện thoại nhận hàng', EN: 'Contact Phone Number' },
  recipient_address_label: { VI: 'Địa chỉ nhận hàng (Cụ thể)', EN: 'Detailed Delivery Address' },
  order_note_label: { VI: 'Ghi chú giao hàng (Tùy chọn)', EN: 'Delivery Notes (Optional)' },
  payment_method_title: { VI: 'Phương Thức Thanh Toán', EN: 'Payment Method' },
  cod_label: { VI: 'Thanh toán khi nhận hàng (COD)', EN: 'Cash on Delivery (COD)' },
  bank_transfer_label: { VI: 'Chuyển khoản qua Ngân hàng / QR Code', EN: 'Bank Transfer / QR Pay' },
  confirm_order_btn: { VI: 'Xác Nhận Đặt Hàng Ngay', EN: 'Place Order Now' },

  // Products Page Filters
  search_live_label: {
    VI: 'Gõ tên máy / màu sắc / SKU (Lọc tức thì)',
    EN: 'Search iPhone name / color / SKU (Live filter)',
  },
  iphone_series_filter: { VI: 'Dòng iPhone', EN: 'iPhone Series' },
  all_series: { VI: 'Tất cả các dòng', EN: 'All Series' },
  storage_filter: { VI: 'Dung lượng lưu trữ', EN: 'Storage Capacity' },
  all_storages: { VI: 'Tất cả dung lượng', EN: 'All Capacities' },
  sort_by: { VI: 'Sắp xếp theo', EN: 'Sort By' },
  sort_newest: { VI: 'Mới nhất', EN: 'Newest' },
  sort_price_asc: { VI: 'Giá: Thấp đến Cao ↗', EN: 'Price: Low to High ↗' },
  sort_price_desc: { VI: 'Giá: Cao đến Thấp ↘', EN: 'Price: High to Low ↘' },
  sort_name_asc: { VI: 'Tên sản phẩm A → Z', EN: 'Product Name A → Z' },
  price_range_label: { VI: 'Mức giá', EN: 'Price Range' },
  reset_filter: { VI: 'Đặt lại bộ lọc', EN: 'Reset Filters' },
  found_products: { VI: 'Tìm thấy', EN: 'Found' },
  products_unit: { VI: 'sản phẩm', EN: 'products' },
  price_under_20: { VI: 'Dưới 20 triệu', EN: 'Under 20M' },
  price_20_30: { VI: '20 - 30 triệu', EN: '20 - 30M' },
  price_30_40: { VI: '30 - 40 triệu', EN: '30 - 40M' },
  price_over_40: { VI: 'Trên 40 triệu', EN: 'Above 40M' },
  price_from_input: { VI: 'Giá từ (₫)', EN: 'From (₫)' },
  price_to_input: { VI: 'Đến giá (₫)', EN: 'To (₫)' },
  no_product_found: {
    VI: 'Không tìm thấy sản phẩm nào phù hợp',
    EN: 'No matching products found',
  },
  no_product_desc: {
    VI: 'Không có phiên bản iPhone nào thỏa mãn điều kiện lọc của bạn.',
    EN: 'No iPhone models match your current filter conditions.',
  },
  reset_view_all: { VI: 'Xóa bộ lọc & Xem tất cả', EN: 'Clear Filters & View All' },
  filter_panel_title: { VI: 'Bộ Lọc Tìm Kiếm Tức Thì', EN: 'Real-time Search & Filter' },
  products_page_title: {
    VI: 'Danh Sách & Bộ Lọc Sản Phẩm iPhone',
    EN: 'iPhone Product Catalog & Filters',
  },
  products_page_sub: {
    VI: 'Hệ thống phân phối các dòng iPhone mới nhất, hỗ trợ lọc tức thì theo tên máy, dung lượng và khoảng giá.',
    EN: 'Official authorized distribution of genuine iPhones, featuring instant filtering by name, capacity, and price.',
  },

  // Checkout extras
  order_success_title: {
    VI: 'Cảm Ơn Quý Khách Đã Đặt Hàng!',
    EN: 'Thank You For Your Order!',
  },
  order_success_sub: {
    VI: 'Đơn hàng của bạn đã được tiếp nhận và ghi nhận ở trạng thái',
    EN: 'Your order has been placed successfully and recorded with status',
  },
  order_code_label: { VI: 'Mã đơn hàng', EN: 'Order ID' },
  recipient_label: { VI: 'Người nhận hàng', EN: 'Recipient' },
  delivery_address_label: { VI: 'Địa chỉ giao', EN: 'Delivery Address' },
  expected_delivery: { VI: '1 - 2 ngày làm việc', EN: '1 - 2 business days' },
  estimated_delivery_label: {
    VI: 'Thời gian giao hàng dự kiến',
    EN: 'Estimated Delivery Time',
  },
  back_home_btn: {
    VI: '➔ Về Trang Chủ Tiếp Tục Mua Sắm',
    EN: '➔ Back to Home & Continue Shopping',
  },
};

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof DICTIONARY) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'VI',
  toggleLang: () => {},
  setLang: () => {},
  t: (key) => DICTIONARY[key]?.VI || String(key),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('VI');

  useEffect(() => {
    const saved = localStorage.getItem('istore_lang') as Language | null;
    if (saved === 'EN' || saved === 'VI') {
      setLangState(saved);
    }
  }, []);

  const toggleLang = () => {
    const next: Language = lang === 'VI' ? 'EN' : 'VI';
    setLangState(next);
    localStorage.setItem('istore_lang', next);
  };

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem('istore_lang', next);
  };

  const t = (key: keyof typeof DICTIONARY): string => {
    const entry = DICTIONARY[key];
    if (!entry) return String(key);
    return entry[lang] || entry.VI || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
