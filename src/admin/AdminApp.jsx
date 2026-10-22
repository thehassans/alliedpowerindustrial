import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import RfqManager from './RfqManager';
import ProductManager from './ProductManager';
import SeoSettings from './SeoSettings';
import GeneralSettings from './GeneralSettings';
import RfqDocumentModal from '../components/RfqDocumentModal';
import { getStoredRfqs } from '../utils/rfqStorage';
import { getCatalogProducts, syncServerDatabase } from '../utils/productStorage';

export default function AdminApp({ onBackToSite }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rfqs, setRfqs] = useState([]);
  const [products, setProducts] = useState([]);
  const [viewingDocumentRfq, setViewingDocumentRfq] = useState(null);

  // Check login session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem('allied_admin_session');
      if (session) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Load data
  const loadData = () => {
    setRfqs(getStoredRfqs());
    setProducts(getCatalogProducts());
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      syncServerDatabase();
    }
    const handleSync = () => loadData();
    window.addEventListener('allied_products_updated', handleSync);
    window.addEventListener('allied_rfqs_updated', handleSync);
    return () => {
      window.removeEventListener('allied_products_updated', handleSync);
      window.removeEventListener('allied_rfqs_updated', handleSync);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('allied_admin_session');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          loadData();
        }}
        onBackToSite={onBackToSite}
      />
    );
  }

  const pendingCount = rfqs.filter(r => r.status === 'Pending Review').length;

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f8fafc',
      color: '#090d16',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      WebkitFontSmoothing: 'antialiased'
    }}>
      {/* Top Console Bar - Ultra Premium Minimalistic */}
      <header style={{
        height: '60px',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eaedf1',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100
      }}>
        {/* Left Brand & Workspace Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="/alliedpowerlogo-removebg-preview.png"
            alt="Allied Power Industrial Company"
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
          />

          <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} className="d-none d-sm-block"></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="d-none d-sm-flex">
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#090d16', letterSpacing: '-0.01em' }}>
              Allied Power Industrial Company
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>/</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>
              Console
            </span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f0fdf4',
            border: '1px solid #dcfce7',
            padding: '3px 9px',
            borderRadius: '50px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#166534',
            marginLeft: '6px'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            <span>Eastern Province Node</span>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onBackToSite}
            style={{
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #e2e8f0',
              borderRadius: '7px',
              padding: '6px 13px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <span>Storefront</span>
            <i className="bi bi-box-arrow-up-right" style={{ fontSize: '11px', color: '#64748b' }}></i>
          </button>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: '#64748b',
              border: '1px solid transparent',
              borderRadius: '7px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <i className="bi bi-box-arrow-right" style={{ fontSize: '13px' }}></i>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace with Fixed Sidebar & Scrollable Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Navigation - Ultra Clean & Sticky */}
        <aside style={{
          width: '240px',
          flexShrink: 0,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #eaedf1',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '0 10px 8px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Modules
          </div>

          {[
            { id: 'dashboard', label: 'Executive Overview', icon: 'bi-grid-1x2' },
            { id: 'rfqs', label: 'Requisitions (RFQs)', icon: 'bi-inbox', badge: pendingCount > 0 ? pendingCount : null },
            { id: 'products', label: 'Product Catalog', icon: 'bi-box-seam', count: products.length },
            { id: 'seo', label: 'SEO & Metadata', icon: 'bi-search' },
            { id: 'settings', label: 'Enterprise Settings', icon: 'bi-sliders' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px 9px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #006837' : '3px solid transparent',
                  backgroundColor: isActive ? '#f1f5f9' : 'transparent',
                  color: isActive ? '#090d16' : '#475569',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#090d16';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className={`bi ${tab.icon}`} style={{ fontSize: '15px', color: isActive ? '#006837' : '#64748b' }}></i>
                  <span>{tab.label}</span>
                </div>

                {tab.badge && (
                  <span style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '50px'
                  }}>
                    {tab.badge}
                  </span>
                )}

                {tab.count && !tab.badge && (
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #eaedf1',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-cloud-check-fill" style={{ color: '#059669', fontSize: '14px' }}></i>
              <div>
                <strong style={{ color: '#090d16', display: 'block', fontWeight: 600 }}>Storage Synced</strong>
                <span>All changes live on storefront</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Body */}
        <main style={{ flex: 1, padding: '35px 40px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                products={products}
                rfqs={rfqs}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenRfqDocument={(rfq) => setViewingDocumentRfq(rfq)}
              />
            )}

            {activeTab === 'rfqs' && (
              <RfqManager
                rfqs={rfqs}
                onRefreshRfqs={loadData}
                onOpenRfqDocument={(rfq) => setViewingDocumentRfq(rfq)}
              />
            )}

            {activeTab === 'products' && (
              <ProductManager
                products={products}
                onRefreshProducts={loadData}
              />
            )}

            {activeTab === 'seo' && (
              <SeoSettings />
            )}

            {activeTab === 'settings' && (
              <GeneralSettings
                onRefreshProducts={loadData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Official RFQ Document Viewer Modal (Triggerable from anywhere in admin) */}
      {viewingDocumentRfq && (
        <RfqDocumentModal
          rfq={viewingDocumentRfq}
          onClose={() => setViewingDocumentRfq(null)}
        />
      )}
    </div>
  );
}
