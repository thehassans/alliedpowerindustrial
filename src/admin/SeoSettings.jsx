import React, { useState, useEffect } from 'react';

const SEO_STORAGE_KEY = 'allied_seo_config';

const DEFAULT_SEO = {
  metaTitle: 'Allied Power Industrial Company | Electrical & Industrial Supplies KSA',
  metaDescription: 'Allied Power Industrial Company is Saudi Arabia’s premier stocking distributor of certified Raychem cable terminations, Appleton & Crouse-Hinds explosion-proof fittings, BURNDY lugs, and SEICO earthing systems in Al-Khobar.',
  keywords: 'Raychem terminations Saudi Arabia, Appleton explosion proof Al-Khobar, BURNDY lugs KSA, SEICO earthing, Saudi Aramco 9COM electrical supplies, SABIC approved electrical distributor',
  canonicalUrl: 'https://alliedpowerindustrial.com/',
  ogTitle: 'Allied Power Industrial Company — Powering Industry. Delivering Reliability.',
  ogDescription: 'Premier distributor of certified electrical and mechanical materials for EPC megaprojects in Saudi Arabia.',
  ogImage: 'https://alliedpowerindustrial.com/wp-content/uploads/2024/09/RAYCHEM.png',
  googleAnalyticsId: 'G-APCO2026KSA',
  searchConsoleVerification: 'google-site-verification=apco-industrial-al-khobar-2026',
  robotsDirective: 'index, follow'
};

export default function SeoSettings() {
  const [seo, setSeo] = useState(DEFAULT_SEO);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEO_STORAGE_KEY);
      if (stored) {
        setSeo(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading SEO settings:', err);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(seo));

    // Update document title dynamically
    if (seo.metaTitle) {
      document.title = seo.metaTitle;
    }

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#090d16', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          SEO &amp; Metadata Controls
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Configure search engine indexing, social card previews, and Google Search Console tags
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
          SEO settings have been successfully updated and cached.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Core Metadata Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Primary Page Metadata
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Meta Title Tag (Recommended: 50-60 characters)
              </label>
              <input
                type="text"
                required
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Current length: {seo.metaTitle.length} characters
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Meta Description (Recommended: 150-160 characters)
              </label>
              <textarea
                rows="3"
                required
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', resize: 'vertical', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Current length: {seo.metaDescription.length} characters
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Target Keywords &amp; Search Queries
              </label>
              <textarea
                rows="2"
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', resize: 'vertical', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Social Sharing / Open Graph */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Open Graph (OG) &amp; Social Card Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                OG Social Title
              </label>
              <input
                type="text"
                value={seo.ogTitle}
                onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                OG Preview Image URL
              </label>
              <input
                type="url"
                value={seo.ogImage}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Canonical URL
            </label>
            <input
              type="url"
              value={seo.canonicalUrl}
              onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Analytics & Search Verification */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            Analytics &amp; Verification Keys
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                value={seo.googleAnalyticsId}
                onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Google Search Console Verification Tag
              </label>
              <input
                type="text"
                value={seo.searchConsoleVerification}
                onChange={(e) => setSeo({ ...seo, searchConsoleVerification: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                placeholder="google-site-verification=..."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            style={{
              backgroundColor: '#006837',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 104, 55, 0.25)'
            }}
          >
            <i className="bi bi-cloud-check-fill"></i> Save &amp; Deploy SEO Settings
          </button>
        </div>
      </form>
    </div>
  );
}
