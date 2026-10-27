import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getCatalogProducts } from '../utils/productStorage';
import { getProductUrl } from '../utils/seoEngine';

const POPULAR_TAGS = [
  { label: 'Raychem EPKT', query: 'EPKT' },
  { label: 'Appleton Plugs & Receptacles', query: 'Appleton' },
  { label: 'BURNDY Lugs', query: 'BURNDY' },
  { label: 'Crouse-Hinds', query: 'Crouse-Hinds' },
  { label: 'SEICO Moulds', query: 'SEICO' },
  { label: 'Marker Posts', query: 'MARKER POST' },
];

export default function ProductSearchBox({
  variant = 'header', // 'header' | 'hero'
  onSelectProductPage,
  onSearchCatalog,
  onAddToCart,
}) {
  const [products, setProducts] = useState(getCatalogProducts);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleSync = () => setProducts(getCatalogProducts());
    window.addEventListener('allied_products_updated', handleSync);
    return () => window.removeEventListener('allied_products_updated', handleSync);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchedProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);

    const scored = [];
    for (const p of products) {
      const hay = `${p.name || ''} ${p.sku || ''} ${p.brand || ''} ${p.category || ''} ${p.description || ''} ${p.fullDescription || ''}`.toLowerCase();
      const matchesAll = tokens.every(t => hay.includes(t));
      if (!matchesAll) continue;

      let score = 0;
      const nameLower = (p.name || '').toLowerCase();
      const skuLower = (p.sku || '').toLowerCase();
      const brandLower = (p.brand || '').toLowerCase();
      if (skuLower === q || skuLower.includes(q)) score += 50;
      if (nameLower.startsWith(q)) score += 35;
      if (brandLower.includes(q)) score += 25;
      if (nameLower.includes(q)) score += 15;
      scored.push({ product: p, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.product);
  }, [products, query]);

  const topResults = matchedProducts.slice(0, 7);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    setIsOpen(false);
    if (onSearchCatalog) {
      onSearchCatalog(q);
    }
  };

  const handleProductClick = (e, product) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSelectProductPage) {
      onSelectProductPage(product);
    }
  };

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product, 1);
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1600);
    }
  };

  const isHero = variant === 'hero';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: isHero ? '100%' : 'auto',
        maxWidth: isHero ? '740px' : '290px',
        flex: isHero ? '1 1 100%' : '0 1 280px',
        zIndex: isHero ? 40 : 1050,
      }}
    >
      <form
        onSubmit={handleFormSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: isHero ? 'rgba(255, 255, 255, 0.98)' : '#f8fafc',
          border: isOpen
            ? '2px solid #00b862'
            : isHero
              ? '2px solid rgba(0, 184, 98, 0.65)'
              : '1.5px solid #cbd5e1',
          borderRadius: isHero ? '14px' : '50px',
          padding: isHero ? '6px 6px 6px 18px' : '5px 10px 5px 14px',
          boxShadow: isHero
            ? '0 18px 45px rgba(0, 0, 0, 0.38)'
            : isOpen
              ? '0 0 0 3px rgba(0, 184, 98, 0.15)'
              : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <i
          className="bi bi-search"
          style={{
            color: '#006837',
            fontSize: isHero ? '18px' : '14px',
            marginRight: isHero ? '12px' : '8px',
            flexShrink: 0,
          }}
        ></i>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={
            isHero
              ? 'Search 134+ products by Name, Part # (e.g. ADR1034, EPKT, YA27), SKU, or Brand...'
              : 'Search products, SKU, brand...'
          }
          aria-label="Search Industrial Products"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: isHero ? '15px' : '13px',
            fontWeight: 600,
            color: '#0f172a',
            minWidth: isHero ? '140px' : '120px',
            padding: isHero ? '8px 0' : '3px 0',
          }}
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            title="Clear search"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}

        {isHero && (
          <button
            type="submit"
            style={{
              backgroundColor: '#006837',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 22px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap',
              boxShadow: '0 6px 16px rgba(0, 104, 55, 0.3)',
            }}
          >
            <i className="bi bi-search"></i>
            <span>Search Catalog</span>
          </button>
        )}
      </form>

      {/* Quick Filter Tags under Hero Search */}
      {isHero && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '10px',
            marginBottom: '18px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#cbd5e1',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            <i className="bi bi-lightning-charge-fill" style={{ color: '#4ade80', marginRight: '4px' }}></i>
            Quick Search:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                setQuery(tag.query);
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                color: '#f8fafc',
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '4px 11px',
                borderRadius: '50px',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#006837';
                e.currentTarget.style.borderColor = '#4ade80';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.72)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
              }}
            >
              {tag.label}
            </button>
          ))}
        </div>
      )}

      {/* Live Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: isHero ? '58px' : 'calc(100% + 8px)',
            left: 0,
            right: isHero ? 0 : 'auto',
            width: isHero ? '100%' : 'min(92vw, 460px)',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden',
            zIndex: 2000,
          }}
        >
          {/* Dropdown Header */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <span>
              <i className="bi bi-box-seam-fill" style={{ color: '#4ade80', marginRight: '6px' }}></i>
              Found <strong style={{ color: '#4ade80' }}>{matchedProducts.length}</strong> matching materials
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onSearchCatalog) onSearchCatalog(query.trim());
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Open All Products Page &rarr;
            </button>
          </div>

          {topResults.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No exact catalog match for <strong>&ldquo;{query}&rdquo;</strong>. Try searching by brand (Raychem, Appleton, BURNDY) or part number.
            </div>
          ) : (
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {topResults.map((product) => {
                const productHref = getProductUrl(product);
                const isAdded = addedId === product.id;

                return (
                  <a
                    key={product.id}
                    href={productHref}
                    onClick={(e) => handleProductClick(e, product)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderBottom: '1px solid #f1f5f9',
                      textDecoration: 'none',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'contain',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        padding: '3px',
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.src = '/wp-content/uploads/2024/09/RAYCHEM.png';
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '3px',
                        }}
                      >
                        {product.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '11px' }}>
                        <span
                          style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            padding: '1px 7px',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          {product.brand}
                        </span>
                        <span style={{ color: '#006837', fontWeight: 800 }}>SKU: {product.sku}</span>
                        <span style={{ color: '#64748b' }}>&bull; {product.category}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#006837' }}>
                        {Number(product.price || 0).toFixed(2)} <span style={{ fontSize: '10px', color: '#dc2626' }}>SAR</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        style={{
                          marginTop: '4px',
                          backgroundColor: isAdded ? '#16a34a' : '#f0fdf4',
                          color: isAdded ? '#ffffff' : '#006837',
                          border: '1px solid #86efac',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {isAdded ? '✓ Added' : '+ RFQ'}
                      </button>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Dropdown Footer */}
          {matchedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onSearchCatalog) onSearchCatalog(query.trim());
              }}
              style={{
                width: '100%',
                padding: '11px 16px',
                backgroundColor: '#f8fafc',
                border: 'none',
                borderTop: '1px solid #e2e8f0',
                color: '#006837',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>View All {matchedProducts.length} Results on Dedicated Products Page</span>
              <i className="bi bi-arrow-right-circle-fill"></i>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
