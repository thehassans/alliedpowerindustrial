import React, { useState, useEffect, useMemo } from 'react';
import { buildProductSeoData, applySeoMetadata, getProductUrl } from '../utils/seoEngine';

export default function ProductDetailPage({
  product,
  allProducts = [],
  onNavigateHome,
  onNavigateCatalog,
  onSelectProductPage,
  onAddToCart,
  onOpenCart,
}) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      const seo = buildProductSeoData(product);
      applySeoMetadata(seo);
    }
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product || !Array.isArray(allProducts)) return [];
    const sameCat = allProducts.filter(
      (p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand)
    );
    return sameCat.slice(0, 4);
  }, [product, allProducts]);

  if (!product) {
    return (
      <section style={{ padding: '120px 20px', backgroundColor: '#f8fafc', textAlign: 'center', minHeight: '65vh' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: '#ffffff', padding: '48px 32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <i className="bi bi-exclamation-circle" style={{ fontSize: '48px', color: '#dc2626', display: 'block', marginBottom: '16px' }}></i>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Product Not Found
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>
            The requested industrial material could not be located or may have been updated in our catalog.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigateCatalog && onNavigateCatalog({})} className="btn-primary-green">
              <i className="bi bi-grid-3x3-gap-fill"></i> View All Products Catalog
            </button>
            <button onClick={onNavigateHome} className="btn-primary-red">
              <i className="bi bi-house-door-fill"></i> Return to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || '/wp-content/uploads/2024/09/RAYCHEM.png'];

  const waMessage = encodeURIComponent(
    `Hello Allied Power Industrial Company (Mr. Farzand Naeem),\n\nI would like to request an official quotation and technical submittal for:\n• Product: ${product.name}\n• SKU: ${product.sku}\n• Brand: ${product.brand}\n• Category: ${product.category}\n• Required Qty: ${quantity}\n• Unit Price: ${Number(product.price || 0).toFixed(2)} SAR\n• Product Link: https://alliedpowerindustrial.com${getProductUrl(product)}`
  );

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    }
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}${getProductUrl(product)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      style={{ backgroundColor: '#f8fafc', paddingBottom: '80px' }}
    >
      {/* Top Breadcrumb & Back Navigation Strip */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '16px 20px',
          borderBottom: '3px solid #00b862',
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '13px' }}>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateHome) onNavigateHome();
              }}
              style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}
            >
              <i className="bi bi-house-door-fill" style={{ marginRight: '4px', color: '#4ade80' }}></i>
              Home
            </a>
            <span style={{ color: '#475569' }}>/</span>
            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateCatalog) onNavigateCatalog({});
              }}
              style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}
            >
              All Products Catalog
            </a>
            <span style={{ color: '#475569' }}>/</span>
            <a
              href={`/products?category=${encodeURIComponent(product.category)}`}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateCatalog) onNavigateCatalog({ category: product.category });
              }}
              style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 700 }}
            >
              {product.category}
            </a>
            <span style={{ color: '#475569' }}>/</span>
            <span style={{ color: '#ffffff', fontWeight: 700, maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.sku}
            </span>
          </nav>

          {/* Back to Catalog & Share Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleCopyUrl}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className={`bi ${copiedLink ? 'bi-check2-circle' : 'bi-share-fill'}`} style={{ color: '#4ade80' }}></i>
              <span>{copiedLink ? 'Product Link Copied!' : 'Share Product URL'}</span>
            </button>

            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateCatalog) onNavigateCatalog({});
              }}
              style={{
                backgroundColor: '#006837',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="bi bi-arrow-left"></i>
              <span>All Products</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Product Studio Card */}
      <div style={{ maxWidth: '1320px', margin: '36px auto 0', padding: '0 20px' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)',
            padding: 'clamp(22px, 4vw, 44px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '44px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Product Image Gallery */}
          <div>
            <div
              style={{
                position: 'relative',
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '18px',
                height: '420px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px',
                overflow: 'hidden',
              }}
            >
              {/* Brand Pill Top Left */}
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: '8px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {product.brand}
              </span>

              {/* Stock Status Pill Top Right */}
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: product.inStock === false ? '#fef2f2' : '#ecfdf5',
                  color: product.inStock === false ? '#dc2626' : '#006837',
                  border: `1px solid ${product.inStock === false ? '#fecaca' : '#a7f3d0'}`,
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '6px 14px',
                  borderRadius: '50px',
                }}
              >
                ● {product.inStock === false ? 'CALL-OFF / LEAD TIME' : 'IN STOCK — AL KHOBAR'}
              </span>

              <img
                itemProp="image"
                src={gallery[selectedImageIdx]}
                alt={`${product.name} - ${product.brand} (${product.sku})`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '350px',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  e.target.src = '/wp-content/uploads/2024/09/RAYCHEM.png';
                }}
              />
            </div>

            {/* Thumbnail Strip if multiple images */}
            {gallery.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '10px',
                      border: selectedImageIdx === idx ? '2.5px solid #006837' : '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      padding: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Official Vendor Compliance Strip under Image */}
            <div
              style={{
                marginTop: '20px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="bi bi-patch-check-fill" style={{ fontSize: '22px', color: '#006837' }}></i>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Saudi Aramco Vendor
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>#10121504</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="bi bi-lightning-charge-fill" style={{ fontSize: '22px', color: '#dc2626' }}></i>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Saudi Electric (SEC)
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>#0002017931</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Complete SEO Details, Specs & RFQ Conversion */}
          <div>
            {/* Category & SKU Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <a
                href={`/products?category=${encodeURIComponent(product.category)}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateCatalog) onNavigateCatalog({ category: product.category });
                }}
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#006837',
                  border: '1px solid #a7f3d0',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {product.category}
              </a>

              <span
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '50px',
                }}
              >
                SKU / Part #: <strong itemProp="sku">{product.sku}</strong>
              </span>
            </div>

            {/* H1 Product Name for SEO */}
            <h1
              itemProp="name"
              style={{
                fontSize: 'clamp(22px, 2.6vw, 30px)',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.32,
                marginBottom: '16px',
              }}
            >
              {product.name}
            </h1>

            {/* Pricing & Commercial Box */}
            <div
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
              style={{
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#006837', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Unit Reference Price (Excl. 15% VAT)
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span
                    itemProp="price"
                    content={Number(product.price || 0).toFixed(2)}
                    style={{ fontSize: '34px', fontWeight: 900, color: '#0f172a' }}
                  >
                    {Number(product.price || 0).toFixed(2)}
                  </span>
                  <span itemProp="priceCurrency" content="SAR" style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>
                    SAR
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#006837',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '5px 12px',
                    borderRadius: '6px',
                    marginBottom: '4px',
                  }}
                >
                  <i className="bi bi-file-earmark-check-fill" style={{ marginRight: '4px' }}></i>
                  MTC &amp; Certificate of Conformity Included
                </span>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  Bulk &amp; EPC Project Discounts Available
                </div>
              </div>
            </div>

            {/* Quantity & Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'stretch' }}>
              {/* Quantity Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    width: '42px',
                    height: '48px',
                    border: 'none',
                    background: '#f8fafc',
                    fontSize: '18px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#0f172a',
                  }}
                >
                  &minus;
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{
                    width: '56px',
                    height: '48px',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    width: '42px',
                    height: '48px',
                    border: 'none',
                    background: '#f8fafc',
                    fontSize: '18px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#0f172a',
                  }}
                >
                  +
                </button>
              </div>

              {/* Add to RFQ Button */}
              <button
                type="button"
                onClick={handleAdd}
                style={{
                  flex: '1 1 200px',
                  backgroundColor: '#006837',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 22px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(0, 104, 55, 0.25)',
                }}
              >
                <i className="bi bi-cart-plus-fill"></i>
                <span>Add to Official RFQ List</span>
              </button>

              {/* Direct WhatsApp Quote Button */}
              <a
                href={`https://wa.me/966534017242?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <i className="bi bi-whatsapp" style={{ fontSize: '17px' }}></i>
                <span>WhatsApp Quote</span>
              </a>
            </div>

            {addedToast && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <span>
                  <i className="bi bi-check-circle-fill" style={{ color: '#4ade80', marginRight: '8px' }}></i>
                  Added {quantity} &times; {product.sku} to your RFQ list!
                </span>
                {onOpenCart && (
                  <button
                    type="button"
                    onClick={onOpenCart}
                    style={{
                      backgroundColor: '#00b862',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Open RFQ Cart &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Complete Technical Description */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Technical Description &amp; Specifications
              </h2>
              <p
                itemProp="description"
                style={{
                  fontSize: '14.5px',
                  color: '#334155',
                  lineHeight: '24px',
                  backgroundColor: '#f8fafc',
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  margin: 0,
                }}
              >
                {product.fullDescription || product.description || product.name}
              </p>
            </div>

            {/* Key Engineering Features */}
            {product.features && product.features.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Key Compliance &amp; Engineering Highlights
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                  {product.features.map((feat, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '13.5px',
                        color: '#1e293b',
                        fontWeight: 600,
                      }}
                    >
                      <i className="bi bi-check-circle-fill" style={{ color: '#006837', marginTop: '2px', flexShrink: 0 }}></i>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Structured Specification Sheet Table */}
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Material Procurement Datasheet
              </h2>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                {[
                  ['Catalog SKU / Part #', product.sku],
                  ['Manufacturer / OEM Brand', product.brand],
                  ['Material Category', product.category],
                  ['Supplier', 'Allied Power Industrial Company'],
                  ['Saudi Aramco Vendor Code', '10121504 (Approved Vendor)'],
                  ['Saudi Electricity (SEC) Vendor Code', '0002017931'],
                  ['Warehouse Dispatch Hub', 'Prince Naif Street, Cross 13, Al Khobar 34428, KSA'],
                ].map(([label, val], idx) => (
                  <div
                    key={label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '42% 58%',
                      padding: '10px 14px',
                      backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                      borderBottom: idx < 6 ? '1px solid #f1f5f9' : 'none',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: '#64748b', fontWeight: 700 }}>{label}</span>
                    <span style={{ color: '#0f172a', fontWeight: 800 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section (Internal SEO Linking) */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Related Industrial Materials in {product.category}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0' }}>
                  Click any item below to open its dedicated technical specification &amp; SEO page
                </p>
              </div>
              <a
                href={`/products?category=${encodeURIComponent(product.category)}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateCatalog) onNavigateCatalog({ category: product.category });
                }}
                style={{
                  color: '#006837',
                  fontWeight: 800,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                View All in {product.category} &rarr;
              </a>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                gap: '20px',
              }}
            >
              {relatedProducts.map((rel) => {
                const relHref = getProductUrl(rel);
                return (
                  <a
                    key={rel.id}
                    href={relHref}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSelectProductPage) onSelectProductPage(rel);
                    }}
                    className="premium-product-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="product-img-box">
                      <span className="product-brand-tag">{rel.brand}</span>
                      <span className="product-stock-tag">IN STOCK</span>
                      <img
                        src={rel.image}
                        alt={rel.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.src = '/wp-content/uploads/2024/09/RAYCHEM.png';
                        }}
                      />
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#006837', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {rel.category}
                      </div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: '20px', marginBottom: '8px', minHeight: '40px' }}>
                        {rel.name}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>SKU: {rel.sku}</span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#006837' }}>
                          {Number(rel.price || 0).toFixed(2)} SAR
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
