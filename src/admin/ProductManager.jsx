import React, { useState, useMemo, useEffect } from 'react';
import { ALLIED_CATEGORIES, ALLIED_BRANDS } from '../data/alliedProducts';
import { addCatalogProduct, updateCatalogProduct, deleteCatalogProduct } from '../utils/productStorage';
import { optimizeProductImage, formatBytes } from '../utils/imageOptimizer';

const COMPLIANCE_PRESETS = [
  'Saudi Aramco 9COM Specification Compliant (Vendor #10121504)',
  'Saudi Electricity Company Approved (SEC Vendor #0002017931)',
  'SABIC Industrial Engineering Standard Approved',
  'Genuine Mill Test Certificate (MTC) & Certificate of Origin Included',
  'UL / ATEX / IECEx Hazardous Location Certified',
  'Ex-Stock Al Khobar 34428 Facility — 24h Kingdom-Wide Dispatch'
];

export default function ProductManager({ products, onRefreshProducts }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [customBrandMode, setCustomBrandMode] = useState(false);
  const [toast, setToast] = useState('');

  // Image Optimization State
  const [isOptimizingImg, setIsOptimizingImg] = useState(false);
  const [framingMode, setFramingMode] = useState('studio'); // 'studio' | 'contain' | 'cover'
  const [rawUploadedFile, setRawUploadedFile] = useState(null);
  const [imageStats, setImageStats] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand: 'Raychem',
    category: ALLIED_CATEGORIES[0],
    price: '',
    inStock: true,
    image: '',
    galleryImages: [],
    description: '',
    fullDescription: '',
    features: ''
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Dynamic Brand list combining default brands + any custom brands added in catalog
  const availableBrands = useMemo(() => {
    const set = new Set(ALLIED_BRANDS);
    products.forEach(p => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesBrand = selectedBrandFilter === 'All' || p.brand === selectedBrandFilter;
      const matchesStock =
        stockFilter === 'All' ||
        (stockFilter === 'inStock' && p.inStock !== false) ||
        (stockFilter === 'callOff' && p.inStock === false);

      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, selectedBrandFilter, stockFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrandFilter, stockFilter, pageSize]);

  const totalPages = pageSize === 'All' ? 1 : Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    if (pageSize === 'All') return filteredProducts;
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const generateNextSku = () => {
    return `API-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setCustomBrandMode(false);
    setRawUploadedFile(null);
    setImageStats(null);
    setFramingMode('studio');
    setFormData({
      name: '',
      sku: generateNextSku(),
      brand: availableBrands[0] || 'Raychem',
      category: ALLIED_CATEGORIES[0],
      price: '',
      inStock: true,
      image: '',
      galleryImages: [],
      description: 'Certified industrial material compliant with Saudi Aramco & SEC specifications.',
      fullDescription: 'Supplied with genuine Mill Test Certificates (MTC), Certificate of Origin, and technical datasheet.',
      features: 'Saudi Aramco 9COM Specification Compliant (Vendor #10121504)\nGenuine Mill Test Certificate (MTC) & Certificate of Origin Included\nEx-Stock Al Khobar 34428 Facility — 24h Kingdom-Wide Dispatch'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setCustomBrandMode(!availableBrands.includes(product.brand));
    setRawUploadedFile(null);
    setImageStats(null);
    setFramingMode('studio');
    setFormData({
      name: product.name || '',
      sku: product.sku || generateNextSku(),
      brand: product.brand || 'Allied Power',
      category: product.category || ALLIED_CATEGORIES[0],
      price: product.price !== undefined ? product.price.toString() : '0',
      inStock: product.inStock !== false,
      image: product.image || '',
      galleryImages: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
      description: product.description || '',
      fullDescription: product.fullDescription || '',
      features: Array.isArray(product.features) ? product.features.join('\n') : ''
    });
    setModalOpen(true);
  };

  const handleDuplicateProduct = (product) => {
    const copySku = `${product.sku}-COPY`;
    addCatalogProduct({
      ...product,
      name: `${product.name} (Copy)`,
      sku: copySku
    });
    onRefreshProducts();
    showToast(`Duplicated "${product.sku}" as "${copySku}"`);
  };

  const handleQuickStockToggle = (product) => {
    updateCatalogProduct(product.id, { inStock: !product.inStock });
    onRefreshProducts();
    showToast(`Updated ${product.sku} status to ${!product.inStock ? 'In Stock' : 'Call Off'}`);
  };

  // Optimize & apply uploaded image
  const processAndOptimizeFile = async (file, modeOverride = framingMode, isGallery = false) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    setIsOptimizingImg(true);
    try {
      if (!isGallery) {
        setRawUploadedFile(file);
      }
      const result = await optimizeProductImage(file, {
        mode: modeOverride,
        maxDimension: 800,
        quality: 0.86
      });

      if (isGallery) {
        setFormData(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, result.dataUrl],
          image: prev.image || result.dataUrl
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          image: result.dataUrl,
          galleryImages: prev.galleryImages.length > 0
            ? [result.dataUrl, ...prev.galleryImages.slice(1)]
            : [result.dataUrl]
        }));
        setImageStats({
          originalSize: formatBytes(result.originalBytes),
          optimizedSize: formatBytes(result.optimizedBytes),
          savingsPercent: result.savingsPercent,
          dimensions: `${result.width}×${result.height}px`,
          format: result.format
        });
      }
    } catch (err) {
      console.error('Image optimization failed:', err);
      alert('Could not process image. Please try another photo.');
    } finally {
      setIsOptimizingImg(false);
    }
  };

  // Re-run optimization when user switches Studio Framing Mode
  const handleFramingModeChange = async (newMode) => {
    setFramingMode(newMode);
    if (rawUploadedFile) {
      await processAndOptimizeFile(rawUploadedFile, newMode, false);
    } else if (formData.image && formData.image.startsWith('data:image/')) {
      setIsOptimizingImg(true);
      try {
        const result = await optimizeProductImage(formData.image, {
          mode: newMode,
          maxDimension: 800,
          quality: 0.86
        });
        setFormData(prev => ({ ...prev, image: result.dataUrl }));
        setImageStats({
          originalSize: formatBytes(result.originalBytes),
          optimizedSize: formatBytes(result.optimizedBytes),
          savingsPercent: result.savingsPercent,
          dimensions: `${result.width}×${result.height}px`,
          format: result.format
        });
      } catch {
        // Ignore if cross-origin URL
      } finally {
        setIsOptimizingImg(false);
      }
    }
  };

  // Support pasting an image directly from clipboard (Cmd+V / Ctrl+V) while modal is open
  useEffect(() => {
    if (!modalOpen) return;
    const handlePaste = (e) => {
      if (!e.clipboardData || !e.clipboardData.items) return;
      for (const item of e.clipboardData.items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            processAndOptimizeFile(blob, framingMode, false);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [modalOpen, framingMode]);

  const handleAddPresetFeature = (preset) => {
    const currentLines = formData.features.split('\n').map(s => s.trim()).filter(Boolean);
    if (!currentLines.includes(preset)) {
      const updated = [...currentLines, preset].join('\n');
      setFormData({ ...formData, features: updated });
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const finalImage = formData.image.trim() || '/alliedpowerlogo-removebg-preview.png';
    const featureList = formData.features.split('\n').map(s => s.trim()).filter(Boolean);
    const images = formData.galleryImages.length > 0
      ? [finalImage, ...formData.galleryImages.filter(img => img !== finalImage)]
      : [finalImage];

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      brand: formData.brand.trim() || 'Allied Power',
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      inStock: formData.inStock,
      image: finalImage,
      images,
      description: formData.description.trim() || `${formData.brand} ${formData.category} — Saudi Aramco & SEC compliant.`,
      fullDescription: formData.fullDescription.trim() || formData.description.trim(),
      features: featureList
    };

    if (editingProduct) {
      updateCatalogProduct(editingProduct.id, payload);
      showToast(`Saved changes to "${payload.name}"`);
    } else {
      addCatalogProduct(payload);
      showToast(`Published "${payload.name}" (${payload.sku}) to live catalog`);
    }

    setModalOpen(false);
    onRefreshProducts();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently remove "${name}" from the catalog?`)) {
      deleteCatalogProduct(id);
      onRefreshProducts();
      showToast(`Removed "${name}" from catalog`);
    }
  };

  const previewPrice = parseFloat(formData.price) || 0;

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#090d16',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
          borderLeft: '4px solid #00b862',
          zIndex: 100020,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="bi bi-check-circle-fill" style={{ color: '#00b862', fontSize: '15px' }}></i>
          <span>{toast}</span>
        </div>
      )}

      {/* Top Executive Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '22px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#090d16', margin: 0, letterSpacing: '-0.02em' }}>
              Product Catalog Studio
            </h1>
            <span style={{
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 10px',
              borderRadius: '50px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
              {products.length} Active SKUs &bull; Server Synced
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Add new industrial materials with automatic WebP studio image optimization, live card preview &amp; instant storefront publishing
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            background: 'linear-gradient(135deg, #006837 0%, #008a49 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 18px rgba(0, 104, 55, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <i className="bi bi-plus-circle-fill" style={{ fontSize: '14px' }}></i>
          <span>Add New Material</span>
        </button>
      </div>

      {/* Multi-Filter & Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '14px 16px',
        borderRadius: '12px',
        border: '1px solid #eaedf1',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        marginBottom: '18px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', gridColumn: 'span 2' }}>
          <i className="bi bi-search" style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: '13px'
          }}></i>
          <input
            type="text"
            placeholder="Search by SKU, material title, OEM brand, or technical specs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 34px 9px 38px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#090d16',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#090d16',
            fontSize: '12.5px',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Categories ({products.length})</option>
          {ALLIED_CATEGORIES.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Brand Filter */}
        <select
          value={selectedBrandFilter}
          onChange={(e) => setSelectedBrandFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#090d16',
            fontSize: '12.5px',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="All">All OEM Brands</option>
          {availableBrands.map((b, idx) => (
            <option key={idx} value={b}>{b}</option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#090d16',
            fontSize: '12.5px',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Stock Status</option>
          <option value="inStock">In Stock Only</option>
          <option value="callOff">Call-Off / Lead Time</option>
        </select>
      </div>

      {/* Products Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #eaedf1',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '1px solid #eaedf1', textAlign: 'left', backgroundColor: '#fafbfc', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '12px 16px', width: '60px' }}>Photo</th>
                <th style={{ padding: '12px 16px' }}>Material Title &amp; Technical Description</th>
                <th style={{ padding: '12px 16px', width: '115px' }}>SKU</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>OEM Brand</th>
                <th style={{ padding: '12px 16px', width: '175px' }}>Category</th>
                <th style={{ padding: '12px 16px', width: '125px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '12px 16px', width: '110px', textAlign: 'center' }}>Availability</th>
                <th style={{ padding: '12px 16px', width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a', transition: 'background-color 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: '10px 16px' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '46px',
                        height: '46px',
                        objectFit: 'contain',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '3px'
                      }}
                      onError={(e) => {
                        e.target.src = '/alliedpowerlogo-removebg-preview.png';
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '3px', lineHeight: '18px' }}>
                      {product.name}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', maxWidth: '430px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.description || 'Saudi Aramco & SEC compliant industrial supply'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#006837', fontWeight: 700, fontSize: '12px' }}>
                    {product.sku}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#0f172a', fontWeight: 600, fontSize: '12.5px' }}>
                    {product.brand}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#475569' }}>
                    {product.category}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                    {Number(product.price || 0).toFixed(2)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SAR</span>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickStockToggle(product)}
                      title="Click to toggle stock availability"
                      style={{
                        backgroundColor: product.inStock !== false ? '#dcfce7' : '#fee2e2',
                        color: product.inStock !== false ? '#166534' : '#991b1b',
                        border: `1px solid ${product.inStock !== false ? '#bbf7d0' : '#fecaca'}`,
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {product.inStock !== false ? '● In Stock' : '○ Call Off'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEdit(product)}
                        style={{
                          backgroundColor: '#f8fafc',
                          color: '#006837',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 9px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Edit material details & image"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>

                      <button
                        onClick={() => handleDuplicateProduct(product)}
                        style={{
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 9px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Duplicate material for fast entry"
                      >
                        <i className="bi bi-copy"></i>
                      </button>

                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '6px 9px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Delete material"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    No materials match your active filters. Try clearing the search query or click <strong>Add New Material</strong>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination & Page Size Controls */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid #eaedf1',
          backgroundColor: '#fafbfc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>
              Showing <strong>{paginatedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> materials
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '11.5px',
                color: '#0f172a'
              }}
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value="All">Show All ({filteredProducts.length})</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                  color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                  fontWeight: 600
                }}
              >
                Prev
              </button>
              <span style={{ padding: '0 8px', fontWeight: 700, color: '#0f172a' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                  color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                  fontWeight: 600
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          ULTRA-PREMIUM ADD / EDIT PRODUCT STUDIO MODAL
          (2-Column Layout: Form + Live Storefront Card & Image Optimizer)
          ======================================================== */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 13, 22, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 100010,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1040px',
              maxHeight: '93vh',
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              color: '#0f172a',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.35)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Studio Modal Top Header */}
            <div style={{
              padding: '18px 28px',
              backgroundColor: '#090d16',
              color: '#ffffff',
              borderBottom: '3px solid #006837',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 184, 98, 0.18)',
                  border: '1px solid rgba(0, 184, 98, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4ade80',
                  fontSize: '18px'
                }}>
                  <i className={`bi ${editingProduct ? 'bi-sliders' : 'bi-box-seam-fill'}`}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.01em' }}>
                    {editingProduct ? `Edit Material — ${editingProduct.sku}` : 'Add New Industrial Material'}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    Allied Power Industrial Company &bull; Smart WebP Image Studio &amp; Live Storefront Preview
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#ffffff',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Studio Modal Body: 2 Columns */}
            <form
              onSubmit={handleSubmitForm}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '26px 28px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
                gap: '28px',
                alignItems: 'start'
              }}
            >
              {/* LEFT COLUMN: Structured Material Specifications */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#006837',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '6px'
                }}>
                  1. Material Identification &amp; Commercial Pricing
                </div>

                {/* Product Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Material Complete Title &amp; Model Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '9px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                    placeholder="e.g. Raychem Heat Shrink Termination Kit 15kV 3-Core (GPTI-15)"
                  />
                </div>

                {/* SKU & Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                        SKU / Part Code *
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, sku: generateNextSku() })}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#006837',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <i className="bi bi-arrow-repeat"></i> Auto-Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '9px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#006837',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '13px',
                        outline: 'none'
                      }}
                      placeholder="API-XXXX"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      Unit Price (SAR, Excl. VAT) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 50px 10px 14px',
                          borderRadius: '9px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontWeight: 800,
                          fontSize: '13.5px',
                          outline: 'none'
                        }}
                        placeholder="0.00"
                      />
                      <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#c8102e'
                      }}>
                        SAR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Brand & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                        OEM Brand *
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomBrandMode(!customBrandMode)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#006837',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {customBrandMode ? 'Select Existing' : '+ New Brand'}
                      </button>
                    </div>
                    {customBrandMode ? (
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Enter OEM brand name..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '9px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #006837',
                          color: '#0f172a',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '9px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontSize: '13px',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      >
                        {availableBrands.map((b, idx) => (
                          <option key={idx} value={b}>{b}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      Portfolio Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '9px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: '13px',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    >
                      {ALLIED_CATEGORIES.map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#006837',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '6px',
                  marginTop: '6px'
                }}>
                  2. Technical Specifications &amp; Aramco / SEC Compliance
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Technical Summary (Displayed on Card &amp; RFQ PDF) *
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '9px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    placeholder="Voltage rating, conductor size, NEMA/IP enclosure rating, or standard conformance..."
                  />
                </div>

                {/* 1-Click Preset Compliance Chips */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                      Key Compliance Bullet Points (One per line)
                    </label>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Click tag to insert:</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {COMPLIANCE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetFeature(preset)}
                        style={{
                          backgroundColor: '#f0fdf4',
                          color: '#006837',
                          border: '1px solid #bbf7d0',
                          borderRadius: '50px',
                          padding: '3px 10px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + {preset.length > 36 ? preset.slice(0, 36) + '…' : preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows="3"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '9px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '12.5px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    placeholder="Saudi Aramco 9COM compliant&#10;Full Mill Test Certificate (MTC)"
                  />
                </div>

                {/* Warehouse Stock Toggle */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: formData.inStock ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${formData.inStock ? '#bbf7d0' : '#fecaca'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                      Al Khobar Warehouse Availability
                    </strong>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {formData.inStock
                        ? 'Ready in stock at Prince Naif St, Cross 13, Al Khobar for immediate dispatch'
                        : 'Scheduled project call-off / factory lead time'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    style={{ width: '20px', height: '20px', accentColor: '#006837', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Smart WebP Image Optimizer & Live Storefront Card Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#006837',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '6px'
                }}>
                  3. Smart Image Studio (Auto-WebP &amp; Studio Framing)
                </div>

                {/* Framing Mode Selector */}
                <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '9px' }}>
                  {[
                    { id: 'studio', label: 'Studio Pad (800×800)', icon: 'bi-aspect-ratio' },
                    { id: 'contain', label: 'Original Ratio', icon: 'bi-arrows-angle-expand' },
                    { id: 'cover', label: 'Square Fill (1:1)', icon: 'bi-crop' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleFramingModeChange(m.id)}
                      style={{
                        flex: 1,
                        padding: '7px 8px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: framingMode === m.id ? '#ffffff' : 'transparent',
                        color: framingMode === m.id ? '#006837' : '#64748b',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer',
                        boxShadow: framingMode === m.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      <i className={`bi ${m.icon}`}></i>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Drag & Drop / Paste Upload Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processAndOptimizeFile(e.dataTransfer.files[0], framingMode, false);
                    }
                  }}
                  style={{
                    border: `2px dashed ${isDraggingOver ? '#006837' : '#cbd5e1'}`,
                    borderRadius: '12px',
                    padding: '18px 16px',
                    textAlign: 'center',
                    backgroundColor: isDraggingOver ? '#f0fdf4' : '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="file"
                    id="studio-primary-image-input"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processAndOptimizeFile(e.target.files[0], framingMode, false);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="studio-primary-image-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#dcfce7',
                      color: '#006837',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      marginBottom: '8px'
                    }}>
                      <i className={`bi ${isOptimizingImg ? 'bi-hourglass-split' : 'bi-cloud-arrow-up-fill'}`}></i>
                    </div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>
                      {isOptimizingImg ? 'Optimizing Image to WebP...' : 'Drop Product Image, Click to Browse, or Paste (Cmd+V)'}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '3px' }}>
                      Auto-converts raw photos into ultra-fast 800×800px WebP studio graphics
                    </span>
                  </label>
                </div>

                {/* Optimization Telemetry Pill */}
                {imageStats && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '9px',
                    padding: '9px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11.5px',
                    color: '#166534'
                  }}>
                    <span>
                      <i className="bi bi-lightning-charge-fill" style={{ color: '#16a34a', marginRight: '5px' }}></i>
                      <strong>Optimized {imageStats.format}</strong> ({imageStats.dimensions})
                    </span>
                    <span>
                      {imageStats.originalSize} &rarr; <strong>{imageStats.optimizedSize}</strong>
                      {imageStats.savingsPercent > 0 && (
                        <span style={{
                          marginLeft: '6px',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '10px'
                        }}>
                          -{imageStats.savingsPercent}%
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {/* Direct Image URL Fallback Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                    Or Paste Direct Image URL:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://... or upload file above"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: '', galleryImages: [] });
                          setImageStats(null);
                          setRawUploadedFile(null);
                        }}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0 12px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* LIVE STOREFRONT PRODUCT CARD PREVIEW */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <i className="bi bi-eye-fill" style={{ color: '#006837', marginRight: '5px' }}></i>
                      Live Storefront Card Preview
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#006837', fontWeight: 700 }}>
                      Real-Time Render
                    </span>
                  </div>

                  {/* Miniature Storefront Card */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                    maxWidth: '310px',
                    margin: '0 auto'
                  }}>
                    <div style={{
                      position: 'relative',
                      height: '175px',
                      backgroundColor: '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '14px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '50px'
                      }}>
                        {formData.brand || 'OEM'}
                      </span>

                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: formData.inStock ? '#dcfce7' : '#fee2e2',
                        color: formData.inStock ? '#166534' : '#991b1b',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '50px'
                      }}>
                        {formData.inStock ? 'IN STOCK' : 'CALL OFF'}
                      </span>

                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Live Product Preview"
                          style={{ maxWidth: '100%', maxHeight: '145px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = '/alliedpowerlogo-removebg-preview.png';
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                          <i className="bi bi-image" style={{ fontSize: '28px', display: 'block', marginBottom: '4px' }}></i>
                          Upload photo to preview
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#006837', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {formData.category}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: '18px', marginBottom: '6px' }}>
                        {formData.name || 'Material Title Preview...'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                        <span>SKU: <strong style={{ color: '#0f172a' }}>{formData.sku || 'API-XXXX'}</strong></span>
                        <span style={{ color: '#006837', fontWeight: 700 }}>Aramco #10121504</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        <div>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                            {previewPrice.toFixed(2)}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#c8102e', marginLeft: '3px' }}>
                            SAR
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Excl. VAT</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      borderRadius: '9px',
                      padding: '11px 18px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isOptimizingImg}
                    style={{
                      background: 'linear-gradient(135deg, #006837 0%, #008a49 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9px',
                      padding: '11px 24px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(0, 104, 55, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="bi bi-check2-circle" style={{ fontSize: '15px' }}></i>
                    <span>{editingProduct ? 'Save Material Updates' : 'Publish to Live Catalog'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
