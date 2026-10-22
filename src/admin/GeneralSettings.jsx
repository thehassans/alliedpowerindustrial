import React, { useState, useEffect } from 'react';
import { resetCatalogToDefault } from '../utils/productStorage';
import { getStoredSocialLinks, saveSocialLinks, SOCIAL_PLATFORMS } from '../utils/socialStorage';

const GENERAL_SETTINGS_KEY = 'allied_general_settings';

const DEFAULT_SETTINGS = {
  companyName: 'Allied Power Industrial Company',
  aramcoVendorCode: '10121504',
  secVendorCode: '0002017931',
  crNumber: '7054403162',
  vatNumber: '314807049800003',
  address: 'Prince Naif Street, Cross 13, Al Khobar 34428, KSA',
  salesManagerName: 'Farzand Naeem',
  salesPhone: '+966 53 401 7242',
  salesEmail: 'farzand@alliedpowerindustrial.com',
  workingHours: 'Sat - Thu: 08:00 AM – 07:30 PM (Friday Off)',
  currency: 'SAR',
  vatRate: '15',
  rfqPrefix: 'API-RFQ-',
  validityDays: '30',
  defaultLeadTime: 'Ex-stock Al-Khobar / 24h Regional Dispatch'
};

export default function GeneralSettings({ onRefreshProducts }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [socialLinks, setSocialLinks] = useState(getStoredSocialLinks);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GENERAL_SETTINGS_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
      setSocialLinks(getStoredSocialLinks());
    } catch (err) {
      console.error('Error loading general settings:', err);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(GENERAL_SETTINGS_KEY, JSON.stringify(settings));
    saveSocialLinks(socialLinks);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog back to original 134 authentic products? Any custom products will be restored to the initial factory list.')) {
      resetCatalogToDefault();
      if (onRefreshProducts) onRefreshProducts();
      alert('Product catalog has been restored to default 134 items.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#090d16', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          Enterprise Settings
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Manage corporate credentials, Saudi Aramco &amp; SEC vendor codes, ZATCA tax registrations, sales manager contact details &amp; RFQ prefixes
        </p>
      </div>

      {savedToast && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="bi bi-check-circle-fill" style={{ color: '#006837' }}></i>
          Settings saved successfully. All changes are live across the public site and RFQ documents.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Enterprise Profile */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Corporate Identity, Vendor Codes &amp; Government Registrations
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Legal Entity Name
              </label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#006837', marginBottom: '6px' }}>
                Saudi Aramco Vendor Code
              </label>
              <input
                type="text"
                required
                value={settings.aramcoVendorCode || '10121504'}
                onChange={(e) => setSettings({ ...settings, aramcoVendorCode: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#006837', fontWeight: 800, fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#c8102e', marginBottom: '6px' }}>
                Saudi Electric (SEC) Vendor Code
              </label>
              <input
                type="text"
                required
                value={settings.secVendorCode || '0002017931'}
                onChange={(e) => setSettings({ ...settings, secVendorCode: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#c8102e', fontWeight: 800, fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Commercial Registration (CR)
              </label>
              <input
                type="text"
                required
                value={settings.crNumber}
                onChange={(e) => setSettings({ ...settings, crNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                ZATCA VAT Identification Number
              </label>
              <input
                type="text"
                required
                value={settings.vatNumber}
                onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Headquarters Facility Address (Eastern Province)
            </label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Commercial Sales Representative */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Designated Commercial Sales Contact
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Sales Manager Name
              </label>
              <input
                type="text"
                required
                value={settings.salesManagerName}
                onChange={(e) => setSettings({ ...settings, salesManagerName: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Hotline &amp; WhatsApp Number
              </label>
              <input
                type="text"
                required
                value={settings.salesPhone}
                onChange={(e) => setSettings({ ...settings, salesPhone: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Official Sales Email
              </label>
              <input
                type="email"
                required
                value={settings.salesEmail}
                onChange={(e) => setSettings({ ...settings, salesEmail: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Commercial Requisition & RFQ Settings */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            RFQ &amp; Procurement Document Parameters
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Currency Code
              </label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Standard ZATCA VAT Rate (%)
              </label>
              <input
                type="number"
                value={settings.vatRate}
                onChange={(e) => setSettings({ ...settings, vatRate: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                RFQ Document Number Prefix
              </label>
              <input
                type="text"
                value={settings.rfqPrefix}
                onChange={(e) => setSettings({ ...settings, rfqPrefix: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Quote Validity Period (Days)
              </label>
              <input
                type="number"
                value={settings.validityDays}
                onChange={(e) => setSettings({ ...settings, validityDays: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Social Media & Public Channels */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #eaedf1',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#090d16', margin: 0 }}>
              Social Media &amp; Public Channel Links
            </h3>
            <span style={{ fontSize: '11px', color: '#059669', background: '#f0fdf4', border: '1px solid #dcfce7', padding: '3px 9px', borderRadius: '50px', fontWeight: 600 }}>
              <i className="bi bi-broadcast" style={{ marginRight: '4px' }}></i>
              Live in Public Footer
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px', lineHeight: '18px' }}>
            Configure official social profiles, corporate network pages, and instant communication links displayed in the website footer.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {SOCIAL_PLATFORMS.map((platform) => {
              const currentVal = socialLinks[platform.id] || '';
              return (
                <div key={platform.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <i className={`bi ${platform.icon}`} style={{ color: platform.color, fontSize: '14px' }}></i>
                      <span>{platform.name}</span>
                    </span>
                    {currentVal && (
                      <a
                        href={currentVal}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '11px', color: '#006837', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <span>Test Link</span>
                        <i className="bi bi-box-arrow-up-right" style={{ fontSize: '10px' }}></i>
                      </a>
                    )}
                  </label>
                  <div style={{ display: 'flex', border: '1px solid #eaedf1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                    <div style={{ padding: '0 12px', backgroundColor: '#f8fafc', borderRight: '1px solid #eaedf1', display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '14px' }}>
                      <i className={`bi ${platform.icon}`} style={{ color: platform.color }}></i>
                    </div>
                    <input
                      type="url"
                      placeholder={platform.placeholder}
                      value={currentVal}
                      onChange={(e) => setSocialLinks({ ...socialLinks, [platform.id]: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: 'none',
                        color: '#090d16',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <button
            type="submit"
            style={{
              backgroundColor: '#006837',
              color: '#ffffff',
              border: 'none',
              borderRadius: '7px',
              padding: '11px 22px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0, 104, 55, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00522c'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#006837'; }}
          >
            <i className="bi bi-check2-circle"></i> Save Enterprise Settings
          </button>

          <button
            type="button"
            onClick={handleResetCatalog}
            style={{
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="bi bi-arrow-counterclockwise"></i> Reset Catalog to 134 Factory Items
          </button>
        </div>
      </form>
    </div>
  );
}
