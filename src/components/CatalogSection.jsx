import React, { useState, useEffect, useMemo } from 'react';
import { ALLIED_CATEGORIES, ALLIED_BRANDS } from '../data/alliedProducts';
import { getCatalogProducts, syncServerDatabase } from '../utils/productStorage';
import { getProductUrl, buildCatalogSeoData, applySeoMetadata } from '../utils/seoEngine';

export default function CatalogSection({
  selectedCategory: propCategory,
  onCategoryChange,
  onSelectProduct,
  onOpenProductPage,
  onOpenDedicatedCatalog,
  onNavigateHome,
  onAddToCart,
  isDedicatedPage = false,
  initialSearch = '',
  initialBrand = 'All',
}) {
  const [products, setProducts] = useState(getCatalogProducts);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [internalCategory, setInternalCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || 'All');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isDedicatedPage ? 32 : 16);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setSearchTerm(initialSearch || '');
    setCurrentPage(1);
  }, [initialSearch]);

  useEffect(() => {
    if (initialBrand) {
      setSelectedBrand(initialBrand);
      setCurrentPage(1);
    }
  }, [initialBrand]);

  // Sync with storage updates & cPanel server database
  useEffect(() => {
    const handleSync = () => {
      setProducts(getCatalogProducts());
    };
    window.addEventListener('allied_products_updated', handleSync);
    syncServerDatabase();
    return () => window.removeEventListener('allied_products_updated', handleSync);
  }, []);

  // Use prop category if provided, otherwise internal
  const activeCategory = propCategory !== undefined ? propCategory : internalCategory;

  const handleCategorySelect = (cat) => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      setInternalCategory(cat);
    }
    setCurrentPage(1);
  };

  // Category counts & dynamic lists (auto-includes custom brands/categories added in Admin)
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const availableCategories = useMemo(() => {
    const set = new Set(ALLIED_CATEGORIES);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const availableBrands = useMemo(() => {
    const set = new Set(ALLIED_BRANDS);
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.fullDescription && item.fullDescription.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;

      const matchesBrand =
        selectedBrand === 'All' || item.brand === selectedBrand;

      return matchesSearch && matchesCategory && matchesBrand;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [products, searchTerm, activeCategory, selectedBrand, sortBy]);

  // Apply SEO Metadata when on dedicated /products page
  useEffect(() => {
    if (isDedicatedPage) {
      const seo = buildCatalogSeoData({
        category: activeCategory,
        brand: selectedBrand,
        search: searchTerm,
        totalCount: filteredProducts.length || products.length,
      });
      applySeoMetadata(seo);
    }
  }, [isDedicatedPage, activeCategory, selectedBrand, searchTerm, filteredProducts.length, products.length]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart(product, 1);
    setToastMessage(`Added "${product.name.slice(0, 30)}..." to RFQ list`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const resetFilters = () => {
    setSearchTerm('');
    handleCategorySelect('All');
    setSelectedBrand('All');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const handleCardNavigation = (e, product) => {
    if (e) e.preventDefault();
    if (onOpenProductPage) {
      onOpenProductPage(product);
    } else if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <section
      id="catalog"
      style={{
        backgroundColor: '#f8fafc',
        padding: isDedicatedPage ? '0 0 80px' : '80px 20px',
        borderTop: isDedicatedPage ? 'none' : '1px solid #e2e8f0',
      }}
    >
      {/* Dedicated /products Top Breadcrumb Banner */}
      {isDedicatedPage && (
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '18px 20px',
            borderBottom: '3px solid #00b862',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              maxWidth: '1360px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateHome) onNavigateHome();
                }}
                style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}
              >
                <i className="bi bi-house-door-fill" style={{ color: '#4ade80', marginRight: '4px' }}></i>
                Home
              </a>
              <span style={{ color: '#475569' }}>/</span>
              <span style={{ color: '#4ade80', fontWeight: 800 }}>All Products Catalog ({products.length} Items)</span>
            </nav>

            <button
              type="button"
              onClick={() => onNavigateHome && onNavigateHome()}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="bi bi-arrow-left"></i>
              <span>Back to Home Page</span>
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: isDedicatedPage ? '0 20px' : '0' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-green-subtle)',
              border: '1px solid #a7f3d0',
              color: 'var(--color-green)',
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'uppercase',
              padding: '5px 18px',
              borderRadius: '50px',
              letterSpacing: '1px',
              marginBottom: '14px',
            }}
          >
            <span style={{ color: 'var(--color-red)', marginRight: '4px' }}>●</span> Certified Industrial Inventory &bull; Dedicated SEO Product Pages
          </span>

          {isDedicatedPage ? (
            <h1
              style={{
                color: 'var(--color-black)',
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 800,
                lineHeight: 1.25,
                marginBottom: '14px',
              }}
            >
              Allied Power Industrial Company &mdash; Complete Products Catalog
            </h1>
          ) : (
            <h2
              style={{
                color: 'var(--color-black)',
                fontSize: '38px',
                fontWeight: 800,
                lineHeight: '48px',
                marginBottom: '14px',
              }}
            >
              Allied Power Industrial Company Catalog
            </h2>
          )}

          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '16px',
              maxWidth: '820px',
              margin: '0 auto',
              textAlign: 'center',
              lineHeight: '26px',
            }}
          >
            Explore our complete portfolio of <strong style={{ color: 'var(--color-green)' }}>certified industrial electrical &amp; mechanical materials</strong> in stock at Al-Khobar. Click any product below to open its dedicated technical specification &amp; SEO page.
          </p>

          {!isDedicatedPage && onOpenDedicatedCatalog && (
            <div style={{ marginTop: '18px' }}>
              <a
                href="/products"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenDedicatedCatalog({ category: activeCategory, brand: selectedBrand, search: searchTerm });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '10px 22px',
                  borderRadius: '50px',
                  fontSize: '13px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.16)',
                }}
              >
                <i className="bi bi-box-arrow-up-right" style={{ color: '#4ade80' }}></i>
                <span>Open Dedicated All Products Page (/products)</span>
              </a>
            </div>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            marginBottom: '35px',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Top row: Search input + Sort + Items per page */}
          <div
            className="catalog-search-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '16px',
              marginBottom: '22px',
              alignItems: 'center',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1 }}>
              <i
                className="bi bi-search"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '16px',
                }}
              ></i>
              <input
                type="text"
                placeholder="Search catalog by name, SKU (e.g. CC-TH, EPKT, YA27), brand or specs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 46px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  color: 'var(--color-black)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-green)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            {/* Controls (Sort & Display Count) */}
            <div className="catalog-controls-group" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: 'var(--color-black)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="featured">Sort by: Default Featured</option>
                <option value="price-low">Price: Low to High (SAR)</option>
                <option value="price-high">Price: High to Low (SAR)</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: 'var(--color-black)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="16">16 per page</option>
                <option value="32">32 per page</option>
                <option value="64">64 per page</option>
                <option value="999">Show All Products</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-black)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
              Filter by Category:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', ...availableCategories].map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`cat-pill-btn ${isSelected ? 'active' : ''}`}
                  >
                    <span>{cat}</span>
                    <span className="pill-count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand Filter Pills */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-black)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Filter by Manufacturer / Brand:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', ...availableBrands].map((brand) => {
                const isSelected = selectedBrand === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => {
                      setSelectedBrand(brand);
                      setCurrentPage(1);
                    }}
                    className={`brand-pill-btn ${isSelected ? 'active' : ''}`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div>
              Showing <strong style={{ color: 'var(--color-black)' }}>{filteredProducts.length}</strong> of <strong style={{ color: 'var(--color-green)' }}>{products.length}</strong> certified industrial materials
              {(activeCategory !== 'All' || selectedBrand !== 'All' || searchTerm) && (
                <span style={{ marginLeft: '8px', color: 'var(--color-red)', fontWeight: 700 }}>
                  (filtered results)
                </span>
              )}
            </div>

            {(activeCategory !== 'All' || selectedBrand !== 'All' || searchTerm) && (
              <button
                onClick={resetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-red)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <i className="bi bi-arrow-counterclockwise"></i> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {paginatedProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
            }}
          >
            <i className="bi bi-search" style={{ fontSize: '48px', color: '#cbd5e1', display: 'block', marginBottom: '16px' }}></i>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '8px' }}>
              No Products Match Your Filter
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Try searching with a broader keyword, different brand, or clearing category filters.
            </p>
            <button onClick={resetFilters} className="btn-primary-green">
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            className="products-cards-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
              gap: '24px',
            }}
          >
            {paginatedProducts.map((product) => {
              const productHref = getProductUrl(product);
              const waQuoteMsg = encodeURIComponent(
                `Hello Allied Power Industrial Company (Mr. Farzand Naeem),\n\nI would like to inquire about this product:\n• Product: ${product.name}\n• SKU: ${product.sku}\n• Brand: ${product.brand}\n• Price: ${product.price} SAR\n\nPlease let me know availability and technical submittal.`
              );

              return (
                <div
                  key={product.id}
                  onClick={(e) => handleCardNavigation(e, product)}
                  className="premium-product-card"
                >
                  {/* Image Container */}
                  <a
                    href={productHref}
                    onClick={(e) => handleCardNavigation(e, product)}
                    className="product-img-box"
                    style={{ textDecoration: 'none', display: 'flex' }}
                  >
                    {/* Brand Tag Top Left */}
                    <span className="product-brand-tag">{product.brand}</span>

                    {/* Stock Tag Top Right */}
                    <span
                      className="product-stock-tag"
                      style={
                        product.inStock === false
                          ? { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }
                          : undefined
                      }
                    >
                      {product.inStock === false ? 'CALL OFF' : 'IN STOCK'}
                    </span>

                    <img
                      src={product.image}
                      alt={`${product.name} (${product.sku})`}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = '/wp-content/uploads/2024/09/RAYCHEM.png';
                      }}
                    />
                  </a>

                  {/* Card Body */}
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      {/* Category Tag */}
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--color-green)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '6px',
                        }}
                      >
                        {product.category}
                      </div>

                      {/* Product Name - Clickable SEO link to dedicated page */}
                      <h3
                        title={product.name}
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--color-black)',
                          lineHeight: '21px',
                          marginBottom: '8px',
                          minHeight: '42px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        <a
                          href={productHref}
                          onClick={(e) => handleCardNavigation(e, product)}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {product.name}
                        </a>
                      </h3>

                      {/* Technical Specifications Snippet */}
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#64748b',
                          lineHeight: '17px',
                          marginBottom: '10px',
                          minHeight: '34px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.description || (product.features && product.features[0]) || product.category}
                      </div>

                      {/* SKU & Origin info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px', flexWrap: 'wrap', gap: '4px' }}>
                        <span>
                          SKU: <strong style={{ color: 'var(--color-black)' }}>{product.sku}</strong>
                        </span>
                        <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>Aramco / SEC Approved</span>
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #f1f5f9',
                          marginBottom: '14px',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-black)' }}>
                            {Number(product.price || 0).toFixed(2)}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-red)', marginLeft: '4px' }}>
                            SAR
                          </span>
                        </div>
                        <a
                          href={productHref}
                          onClick={(e) => handleCardNavigation(e, product)}
                          style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-green)', textDecoration: 'none' }}
                        >
                          Full Page &rarr;
                        </a>
                      </div>

                      {/* Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px' }}>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          style={{
                            backgroundColor: 'var(--color-green)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-green-dark)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-green)';
                          }}
                          title="Add to Request for Quotation list"
                        >
                          <i className="bi bi-cart-plus"></i> Add to RFQ
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectProduct) onSelectProduct(product);
                          }}
                          style={{
                            backgroundColor: '#ffffff',
                            color: 'var(--color-black)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Quick View Modal"
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        <a
                          href={`https://wa.me/966534017242?text=${waQuoteMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            backgroundColor: '#25d366',
                            color: '#ffffff',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Instant WhatsApp quote from Sales Manager Farzand Naeem"
                        >
                          <i className="bi bi-whatsapp"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '45px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                color: currentPage === 1 ? '#cbd5e1' : 'var(--color-black)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <i className="bi bi-chevron-left"></i> Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  backgroundColor: currentPage === page ? 'var(--color-green)' : '#ffffff',
                  color: currentPage === page ? '#ffffff' : 'var(--color-black)',
                  border: currentPage === page ? '1px solid var(--color-green)' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  width: '38px',
                  height: '38px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                color: currentPage === totalPages ? '#cbd5e1' : 'var(--color-black)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Next <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '30px',
              backgroundColor: 'var(--color-black)',
              color: '#ffffff',
              padding: '14px 22px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 600,
              borderLeft: '4px solid var(--color-green)',
            }}
          >
            <i className="bi bi-check-circle-fill" style={{ color: 'var(--color-green-light)', fontSize: '18px' }}></i>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
}
