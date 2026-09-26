import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
export { useToast } from '../../context/ToastContext';

export default function AppLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay Backdrop */}
      <div 
        className={`sidebar-backdrop ${mobileOpen ? "show" : ""}`} 
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="app-main">
        <Navbar title={title} onToggleSidebar={() => setMobileOpen((prev) => !prev)} />
        <main className="content-wrapper">
          {children}
        </main>
      </div>
    </div>
  );
}

