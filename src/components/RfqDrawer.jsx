import React, { useState, useRef, useEffect } from 'react';
import { saveRfqRecord } from '../utils/rfqStorage';
import { downloadRfqPdf } from '../utils/generatePdf';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, formatFullPhoneNumber } from '../utils/countryCodes';
import { SAUDI_CITIES, POPULAR_SAUDI_CITIES } from '../utils/saudiCities';

export default function RfqDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onViewRfqDocument
}) {
  if (!isOpen) return null;

  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCity, setSelectedCity] = useState('Al-Khobar');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [includeVat, setIncludeVat] = useState(true);

  const [rfqForm, setRfqForm] = useState({
    name: '',
    company: '',
    email: '',
    project: '',
    notes: ''
  });
  const [submittedRfq, setSubmittedRfq] = useState(null);

  const cityDropdownRef = useRef(null);

  // Close city dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const vat = includeVat ? subtotal * 0.15 : 0;
  const total = subtotal + vat;

  // Filter cities by search query
  const filteredCities = SAUDI_CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
    c.hub.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const handleSelectCity = (city) => {
    setSelectedCity(city.name);
    setCitySearchQuery('');
    setIsCityDropdownOpen(false);
  };

  const getCombinedProjectLocation = () => {
    const parts = [selectedCity, rfqForm.project].filter(Boolean);
    return parts.join(' — ') || selectedCity || 'Kingdom Mega-Project Site';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullPhone = formatFullPhoneNumber(countryCode, phoneNumber);
    const combinedDestination = getCombinedProjectLocation();

    const record = saveRfqRecord({
      name: rfqForm.name,
      company: rfqForm.company,
      email: rfqForm.email,
      phone: fullPhone,
      city: selectedCity,
      project: combinedDestination,
      notes: rfqForm.notes,
      items: cartItems,
      includeVat,
      subtotal,
      vat,
      total
    });

    setSubmittedRfq(record);
    onClearCart();
    // Auto-trigger direct PDF download with full details
    downloadRfqPdf(record);
  };

  const handlePreviewDocument = () => {
    const fullPhone = formatFullPhoneNumber(countryCode, phoneNumber);
    const combinedDestination = getCombinedProjectLocation();

    const draft = {
      id: `API-RFQ-${new Date().getFullYear()}-DRAFT`,
      date: new Date().toISOString(),
      company: rfqForm.company || 'Corporate Client',
      name: rfqForm.name || 'Procurement Officer',
      email: rfqForm.email,
      phone: fullPhone,
      city: selectedCity,
      project: combinedDestination,
      notes: rfqForm.notes,
      items: cartItems,
      includeVat,
      subtotal,
      vat,
      total,
      status: 'Draft Requisition'
    };
    if (onViewRfqDocument) {
      onViewRfqDocument(draft);
    }
  };

  const generateWhatsAppMessage = () => {
    const fullPhone = formatFullPhoneNumber(countryCode, phoneNumber);
    const combinedDestination = getCombinedProjectLocation();

    let msg = `*ALLIED POWER INDUSTRIAL COMPANY — OFFICIAL RFQ*\n`;
    msg += `------------------------------------\n`;
    msg += `To: Mr. Farzand Naeem (Sales Manager)\n`;
    if (rfqForm.company) msg += `Company: ${rfqForm.company}\n`;
    if (rfqForm.name) msg += `Contact Person: ${rfqForm.name}\n`;
    if (fullPhone) msg += `Phone: ${fullPhone}\n`;
    if (selectedCity) msg += `Delivery Hub / City: ${selectedCity}\n`;
    if (rfqForm.project) msg += `Project / Site: ${rfqForm.project}\n`;
    msg += `Logistics: Fast delivery all over the Kingdom\n`;
    msg += `------------------------------------\n`;
    msg += `*REQUESTED MATERIAL LIST (${cartItems.length} Items):*\n\n`;

    cartItems.forEach((item, index) => {
      msg += `${index + 1}. *${item.name}*\n`;
      msg += `   • Brand: ${item.brand} | SKU: ${item.sku}\n`;
      msg += `   • Qty: ${item.quantity} | Unit: ${item.price.toFixed(2)} SAR\n`;
      msg += `   • Subtotal: ${(item.price * item.quantity).toFixed(2)} SAR\n\n`;
    });

    msg += `------------------------------------\n`;
    msg += `Materials Subtotal: ${subtotal.toFixed(2)} SAR\n`;
    if (includeVat) {
      msg += `ZATCA VAT (15%): ${vat.toFixed(2)} SAR\n`;
      msg += `*Grand Total: ${total.toFixed(2)} SAR (incl. 15% VAT)*\n`;
    } else {
      msg += `VAT: 0.00 SAR (Optional / Excluded)\n`;
      msg += `*Grand Total: ${total.toFixed(2)} SAR (VAT Excluded)*\n`;
    }
    if (rfqForm.notes) msg += `Notes: ${rfqForm.notes}\n`;
    msg += `------------------------------------\n`;
    msg += `Please review availability and provide an official quotation with test certificates.`;

    return encodeURIComponent(msg);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'all 0.3s ease'
      }}
      onClick={onClose}
    >
      <div
        className="rfq-drawer-content-box"
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100000,
          borderLeft: '4px solid var(--color-green)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header (Theme: Deep Green) */}
        <div
          className="rfq-drawer-header"
          style={{
            padding: '22px 26px',
            backgroundColor: 'var(--color-green)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid var(--color-red)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-cart-check-fill" style={{ color: '#ffffff' }}></i>
              Quotation Request (RFQ)
            </h3>
            <span style={{ fontSize: '12px', color: '#dcfce7', fontWeight: 600 }}>
              {cartItems.length} {cartItems.length === 1 ? 'material item selected' : 'material items selected'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="rfq-drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {submittedRfq ? (
            <div style={{
              textAlign: 'center',
              padding: '30px 20px',
              background: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              <i className="bi bi-check-circle-fill" style={{ fontSize: '48px', color: 'var(--color-green)', display: 'block', marginBottom: '14px' }}></i>
              <h4 style={{ color: 'var(--color-green)', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
                RFQ Successfully Generated!
              </h4>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                Requisition Ref: <span style={{ color: 'var(--color-green)', fontFamily: 'monospace' }}>{submittedRfq.id}</span>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '22px', marginBottom: '24px' }}>
                Your quotation request has been formally recorded and routed to <strong>Mr. Farzand Naeem (Sales Manager)</strong> with delivery to <strong>{submittedRfq.city || 'Kingdom-Wide'}</strong>. Complete details and official stamped PDF have been prepared.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => {
                    downloadRfqPdf(submittedRfq);
                  }}
                  style={{
                    backgroundColor: '#006837',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 104, 55, 0.35)'
                  }}
                >
                  <i className="bi bi-download" style={{ fontSize: '16px' }}></i>
                  <span>Download Official RFQ PDF</span>
                </button>

                <button
                  onClick={() => {
                    if (onViewRfqDocument) {
                      onViewRfqDocument(submittedRfq);
                    }
                  }}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bi bi-printer-fill" style={{ color: '#00b862' }}></i>
                  <span>View &amp; Print Stamped Document</span>
                </button>

                <a
                  href={`https://wa.me/966534017242?text=${generateWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#25d366',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <i className="bi bi-whatsapp"></i> Also Send Direct via WhatsApp
                </a>

                <button
                  onClick={() => {
                    setSubmittedRfq(null);
                    onClose();
                  }}
                  style={{
                    background: '#ffffff',
                    color: 'var(--color-black)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close &amp; Continue Browsing
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
              <i className="bi bi-cart-x" style={{ fontSize: '54px', color: '#cbd5e1', display: 'block', marginBottom: '16px' }}></i>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-black)', marginBottom: '8px' }}>Your RFQ List is Empty</h4>
              <p style={{ fontSize: '13px', lineHeight: '20px', marginBottom: '20px' }}>
                Browse our catalog of certified industrial materials from Raychem, Appleton, BURNDY, and SEICO, and add items to request a formal quotation.
              </p>
              <button
                onClick={onClose}
                className="btn-primary-green"
              >
                Browse Products Catalog
              </button>
            </div>
          ) : (
            <div>
              {/* Product List */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-black)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Selected Materials ({cartItems.length})
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handlePreviewDocument}
                      style={{ background: 'none', border: 'none', color: 'var(--color-green)', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      <i className="bi bi-file-earmark-text"></i> Preview PDF
                    </button>
                    <button
                      onClick={onClearCart}
                      style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '2px', border: '1px solid #e2e8f0' }}
                        onError={(e) => {
                          e.target.src = '/wp-content/uploads/2024/09/RAYCHEM.png';
                        }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-black)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </h4>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', gap: '8px' }}>
                          <span>SKU: {item.sku}</span>
                          <span>&bull;</span>
                          <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>{item.brand}</span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-black)', marginTop: '4px' }}>
                          {item.price.toFixed(2)} SAR
                        </div>
                      </div>

                      {/* Quantity & Remove */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            style={{ border: 'none', background: 'none', padding: '3px 8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '24px', textAlign: 'center', color: 'var(--color-black)' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            style={{ border: 'none', background: 'none', padding: '3px 8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '15px'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-red)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                          title="Remove item"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Estimate Summary & Optional VAT Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '22px'
              }}>
                {/* VAT Optional Switch / Toggle */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px dashed #cbd5e1',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: includeVat ? 'rgba(0, 104, 55, 0.12)' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: includeVat ? 'var(--color-green)' : '#64748b',
                      fontSize: '15px'
                    }}>
                      <i className="bi bi-percent"></i>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                        Include 15% ZATCA VAT
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Optional tax calculation for quotation &amp; PDF
                      </span>
                    </div>
                  </div>

                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                    <input
                      type="checkbox"
                      checked={includeVat}
                      onChange={(e) => setIncludeVat(e.target.checked)}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                    <div style={{
                      width: '44px',
                      height: '24px',
                      backgroundColor: includeVat ? '#006837' : '#cbd5e1',
                      borderRadius: '12px',
                      transition: 'background-color 0.2s ease',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: includeVat ? '23px' : '3px',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </label>
                </div>

                {/* Subtotal & VAT Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Materials Subtotal:</span>
                    <strong style={{ color: '#0f172a' }}>{subtotal.toFixed(2)} SAR</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      ZATCA VAT (15%):
                      {!includeVat && <span style={{ marginLeft: '6px', color: '#94a3b8', fontStyle: 'italic' }}>(Excluded)</span>}
                    </span>
                    <strong style={{ color: includeVat ? '#0f172a' : '#94a3b8' }}>
                      {includeVat ? `${vat.toFixed(2)} SAR` : '0.00 SAR'}
                    </strong>
                  </div>
                </div>

                {/* Grand Total Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '2px solid #e2e8f0'
                }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-black)', display: 'block' }}>
                      Estimated Requisition Total:
                    </span>
                    <span style={{ fontSize: '11px', color: includeVat ? 'var(--color-green)' : '#64748b', fontWeight: 600 }}>
                      {includeVat ? '15% VAT included on document' : 'Net subtotal / VAT excluded'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-black)', marginRight: '4px' }}>
                      {total.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-red)' }}>SAR</span>
                  </div>
                </div>
              </div>

              {/* RFQ Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-black)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Procurement Information
                </h4>

                <div className="rfq-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    required
                    value={rfqForm.name}
                    onChange={(e) => setRfqForm({ ...rfqForm, name: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Company / Enterprise *"
                    required
                    value={rfqForm.company}
                    onChange={(e) => setRfqForm({ ...rfqForm, company: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div className="rfq-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="email"
                    placeholder="Corporate Email *"
                    required
                    value={rfqForm.email}
                    onChange={(e) => setRfqForm({ ...rfqForm, email: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />

                  {/* Mobile Number with Country Code */}
                  <div style={{
                    display: 'flex',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      title="Select Country Calling Code"
                      style={{
                        padding: '0 8px',
                        backgroundColor: '#f8fafc',
                        border: 'none',
                        borderRight: '1px solid #cbd5e1',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        outline: 'none',
                        maxWidth: '92px',
                        flexShrink: 0
                      }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code} title={`${c.name} (${c.code})`}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder={selectedCountry ? `${selectedCountry.example} *` : '5X XXX XXXX *'}
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: 'none',
                        fontSize: '13px',
                        outline: 'none',
                        minWidth: 0,
                        color: '#0f172a'
                      }}
                    />
                  </div>
                </div>

                {/* Delivery City (Searchable & Dropdown) */}
                <div ref={cityDropdownRef} style={{ position: 'relative' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <i className="bi bi-geo-alt-fill" style={{ color: 'var(--color-green)' }}></i>
                    Delivery Destination City (Searchable Hub) *
                  </label>

                  <div
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isCityDropdownOpen ? '1px solid var(--color-green)' : '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      boxShadow: isCityDropdownOpen ? '0 0 0 2px rgba(0, 104, 55, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <i className="bi bi-building" style={{ color: '#64748b', fontSize: '14px' }}></i>
                      <strong style={{ color: '#0f172a' }}>{selectedCity}</strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        &bull; {SAUDI_CITIES.find(c => c.name === selectedCity)?.region || 'Saudi Arabia'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                      <i className={`bi ${isCityDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '12px' }}></i>
                    </div>
                  </div>

                  {/* Dropdown Menu Popup */}
                  {isCityDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '6px',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      zIndex: 100010,
                      maxHeight: '260px',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
                      {/* Search box inside dropdown */}
                      <div style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <div style={{ position: 'relative' }}>
                          <i className="bi bi-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }}></i>
                          <input
                            type="text"
                            placeholder="Type to search Saudi city or hub..."
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '6px 10px 6px 30px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      {/* City list items */}
                      <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
                        {filteredCities.length === 0 ? (
                          <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                            No matching Saudi city found
                          </div>
                        ) : (
                          filteredCities.map((c) => {
                            const isSelected = selectedCity === c.name;
                            return (
                              <div
                                key={c.name}
                                onClick={() => handleSelectCity(c)}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                                  color: isSelected ? 'var(--color-green)' : '#0f172a',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '12px',
                                  transition: 'background-color 0.1s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <div>
                                  <strong style={{ display: 'block', fontSize: '12.5px' }}>{c.name}</strong>
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>{c.hub} &bull; {c.region}</span>
                                </div>
                                {isSelected && (
                                  <i className="bi bi-check-lg" style={{ color: 'var(--color-green)', fontSize: '16px', fontWeight: 800 }}></i>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Popular City Quick-Select Chips */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {POPULAR_SAUDI_CITIES.slice(0, 6).map((c) => (
                      <button
                        type="button"
                        key={c.name}
                        onClick={() => setSelectedCity(c.name)}
                        style={{
                          backgroundColor: selectedCity === c.name ? '#006837' : '#f1f5f9',
                          color: selectedCity === c.name ? '#ffffff' : '#475569',
                          border: selectedCity === c.name ? '1px solid #006837' : '1px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '3px 10px',
                          fontSize: '11px',
                          fontWeight: selectedCity === c.name ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project / Site Name */}
                <input
                  type="text"
                  placeholder="Project Name / Site Reference (e.g. Aramco Marjan, SABIC Turnaround, Substation #4 - Optional)"
                  value={rfqForm.project}
                  onChange={(e) => setRfqForm({ ...rfqForm, project: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />

                <textarea
                  rows="2"
                  placeholder="Special instructions, required Mill Test Certificates (MTC), or bidding deadlines..."
                  value={rfqForm.notes}
                  onChange={(e) => setRfqForm({ ...rfqForm, notes: e.target.value })}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                />

                {/* Submit & Preview Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="submit"
                    style={{
                      background: 'var(--color-green)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '13px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(0, 104, 55, 0.25)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-green-dark)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-green)'; }}
                  >
                    <i className="bi bi-file-earmark-pdf-fill"></i> Submit &amp; Generate Official RFQ Document
                  </button>

                  <a
                    href={`https://wa.me/966534017242?text=${generateWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#25d366',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      padding: '13px',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1ebc59'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#25d366'; }}
                  >
                    <i className="bi bi-whatsapp"></i> Send Direct to Sales Manager (+966 53 401 7242)
                  </a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
