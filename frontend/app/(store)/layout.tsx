import React from 'react';
import StoreFooter from '../../components/store/Footer';
import StoreNavbar from '../../components/store/Navbar';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900">
      <StoreNavbar />
      <div className="flex-1">{children}</div>
      <StoreFooter />
    </div>
  );
}
