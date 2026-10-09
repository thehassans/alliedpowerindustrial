import React, { useState } from 'react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.image || (product.images && product.images[0]) || '');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Allied Power Industrial (Mr. Farzand Naeem),\n\nI would like to request an official quotation for:\n• Product: ${product.name}\n• SKU: ${product.sku}\n• Brand: ${product.brand}\n• Quantity: ${quantity}\n• Listed Price: ${product.price} SAR\n\nPlease advise stock availability and commercial terms.`
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          borderTop: '4px solid var(--color-green)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'var(--color-black)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          aria-label="Close modal"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {/* Left Column: Image Gallery */}
          <div>
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              marginBottom: '14px',
              minHeight: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={activeImage}
                alt={product.name}
                style={{
                  maxHeight: '260px',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.src = 'https://alliedpowerindustrial.com/wp-content/uploads/2024/09/RAYCHEM.png';
                }}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    style={{
                      border: activeImage === img ? '2px solid var(--color-green)' : '1px solid #e2e8f0',
                      background: '#fff',
                      borderRadius: '8px',
                      padding: '4px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '52px', height: '52px', objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Specs Box */}
            <div style={{
              marginTop: '16px',
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '16px 20px',
              fontSize: '13px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>SKU Code:</span>
                <strong style={{ color: 'var(--color-black)' }}>{product.sku}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Brand / OEM:</span>
                <strong style={{ color: 'var(--color-green)' }}>{product.brand}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Category:</span>
                <strong style={{ color: 'var(--color-black)' }}>{product.category}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Compliance:</span>
                <strong style={{ color: '#006837' }}>Saudi Aramco / SABIC Approved</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Availability:</span>
                <span style={{ color: 'var(--color-green)', fontWeight: 700 }}>
                  <i className="bi bi-check-circle-fill" style={{ marginRight: '4px' }}></i> Ready Stock (Al-Khobar Hub)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Logistics:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>Fast delivery all over the Kingdom</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{
                  background: 'var(--color-black)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '50px',
                  textTransform: 'uppercase'
                }}>
                  {product.brand}
                </span>
                <span style={{
                  background: 'var(--color-green-subtle)',
                  color: 'var(--color-green)',
                  border: '1px solid #a7f3d0',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '50px'
                }}>
                  {product.category}
                </span>
                <span style={{
                  background: 'var(--color-red-subtle)',
                  color: 'var(--color-red)',
                  border: '1px solid #fecaca',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '50px'
                }}>
                  Aramco &amp; SABIC Standards
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--color-black)',
                lineHeight: '1.3',
                marginBottom: '14px'
              }}>
                {product.name}
              </h2>

              {/* Price */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                marginBottom: '18px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '30px', fontWeight: 800, color: 'var(--color-black)' }}>
                  {product.price.toFixed(2)}
                </span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-red)' }}>
                  SAR
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                  (Excl. VAT / Bulk EPC contractor pricing on request)
                </span>
              </div>

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-black)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Key Specifications &amp; Features:
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {product.features.map((feat, i) => (
                      <li key={i} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <i className="bi bi-check-circle-fill" style={{ color: 'var(--color-green)', fontWeight: 'bold' }}></i>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Product Detailed Overview & Engineering Summary */}
              {(product.fullDescription || product.description) && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-black)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    Engineering &amp; Product Overview:
                  </h4>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '22px', textAlign: 'left', margin: 0 }}>
                    {product.fullDescription || product.description}
                  </p>
                  {product.fullDescription && product.description && product.fullDescription !== product.description && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid var(--color-green)', fontSize: '12px', color: '#334155' }}>
                      <strong>Technical Summary:</strong> {product.description}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons & Quantity */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-black)' }}>Required Quantity:</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ background: '#f8fafc', border: 'none', padding: '6px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 700, color: 'var(--color-black)' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '6px 16px', fontWeight: 800, fontSize: '14px', minWidth: '40px', textAlign: 'center', color: 'var(--color-black)' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ background: '#f8fafc', border: 'none', padding: '6px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 700, color: 'var(--color-black)' }}
                  >
                    +
                  </button>
                </div>

                {addedNotice && (
                  <span style={{ color: 'var(--color-green)', fontSize: '13px', fontWeight: 700, animation: 'fadeIn 0.3s' }}>
                    <i className="bi bi-check-circle-fill" style={{ marginRight: '4px' }}></i> Successfully Added to RFQ!
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAdd}
                  style={{
                    flex: '1',
                    minWidth: '180px',
                    backgroundColor: 'var(--color-green)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '13px 20px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 104, 55, 0.25)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-green-dark)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-green)'; }}
                >
                  <i className="bi bi-file-earmark-plus-fill"></i> Add to RFQ List
                </button>

                <a
                  href={`https://wa.me/966534017242?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: '1',
                    minWidth: '180px',
                    backgroundColor: '#25d366',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    padding: '13px 20px',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1ebc59'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#25d366'; }}
                >
                  <i className="bi bi-whatsapp"></i> Instant WhatsApp RFQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
