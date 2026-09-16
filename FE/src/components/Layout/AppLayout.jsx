import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
export { useToast } from '../../context/ToastContext';

export default function AppLayout({ children, title }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <Navbar title={title} />
        <main className="content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
}
