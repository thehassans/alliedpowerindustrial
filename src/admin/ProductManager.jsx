import React, { useState } from 'react';
import { ALLIED_CATEGORIES, ALLIED_BRANDS } from '../data/alliedProducts';
import { addCatalogProduct, updateCatalogProduct, deleteCatalogProduct } from '../utils/productStorage';

export default function ProductManager({ products, onRefreshProducts }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    caption: '',
    sku: '',
    brand: 'Allied Power',
    category: ALLIED_CATEGORIES[0],
    price: '',
    inStock: true,
    image: '',
    galleryImages: '',
    description: '',
    fullDescription: '',
    features: ''
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      caption: '',
      sku: `API-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: ALLIED_BRANDS[0] || 'Raychem',
      category: ALLIED_CATEGORIES[0],
      price: '',
      inStock: true,
      image: 'https://alliedpowerindustrial.com/wp-content/uploads/2025/09/s-l400.png',
      galleryImages: '',
      description: 'Certified industrial equipment compliant with Saudi Aramco specifications.',
      fullDescription: 'Comprehensive specifications and factory test certificates (MTC) supplied.',
      features: 'Saudi Aramco 9COM compliant\nFull Mill Test Certificate (MTC)\nHeavy-duty industrial grade'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      caption: product.description || '',
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      inStock: product.inStock !== false,
      image: product.image,
      galleryImages: product.images ? product.images.join('\n') : '',
      description: product.description || '',
      fullDescription: product.fullDescription || '',
      features: product.features ? product.features.join('\n') : ''
    });
    setModalOpen(true);
  };

  // Image file upload handler with canvas auto-scaling for performance
  const handleImageFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      
      // If SVG or small image under 300KB, use directly
      if (file.type === 'image/svg+xml' || file.size < 300 * 1024) {
        setFormData(prev => ({ ...prev, image: dataUrl }));
        return;
      }

      // Optimize/compress larger images via HTML5 Canvas
      const img = new Image();
      img.onload = () => {
        const maxWidth = 900;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
        setFormData(prev => ({ ...prev, image: compressedDataUrl }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const featureList = formData.features.split('\n').map(s => s.trim()).filter(Boolean);
    const galleryList = formData.galleryImages.split('\n').map(s => s.trim()).filter(Boolean);
    const images = galleryList.length > 0 ? galleryList : [formData.image];

    if (editingProduct) {
      updateCatalogProduct(editingProduct.id, {
        name: formData.name,
        sku: formData.sku,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        inStock: formData.inStock,
        image: formData.image,
        images,
        description: formData.description || formData.caption,
        fullDescription: formData.fullDescription,
        features: featureList
      });
    } else {
      addCatalogProduct({
        name: formData.name,
        sku: formData.sku,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        inStock: formData.inStock,
        image: formData.image,
        images,
        description: formData.description || formData.caption,
        fullDescription: formData.fullDescription,
        features: featureList
      });
    }

    setModalOpen(false);
    onRefreshProducts();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove product "${name}"?`)) {
      deleteCatalogProduct(id);
      onRefreshProducts();
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#090d16', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Product Catalog
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Configure product titles, specifications, SAR prices, images, and category tags
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            backgroundColor: '#006837',
            color: '#ffffff',
            border: 'none',
            borderRadius: '7px',
            padding: '8px 14px',
            fontSize: '12px',
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
          <i className="bi bi-plus-lg"></i> Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '18px' }}>
        <div style={{ position: 'relative' }}>
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
            placeholder="Search products by SKU, title, brand, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #eaedf1',
              color: '#090d16',
              fontSize: '13px',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #eaedf1',
            color: '#090d16',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          <option value="All">All Categories ({products.length})</option>
          {ALLIED_CATEGORIES.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
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
                <th style={{ padding: '12px 16px', width: '56px' }}>Image</th>
                <th style={{ padding: '12px 16px' }}>Product Title &amp; Technical Caption</th>
                <th style={{ padding: '12px 16px', width: '110px' }}>SKU</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>Brand</th>
                <th style={{ padding: '12px 16px', width: '160px' }}>Category</th>
                <th style={{ padding: '12px 16px', width: '120px', textAlign: 'right' }}>Price (SAR)</th>
                <th style={{ padding: '12px 16px', width: '90px', textAlign: 'center' }}>Stock</th>
                <th style={{ padding: '12px 16px', width: '110px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.slice(0, 50).map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: '42px', height: '42px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px' }}
                      onError={(e) => {
                        e.target.src = 'https://alliedpowerindustrial.com/wp-content/uploads/2024/09/RAYCHEM.png';
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '3px' }}>
                      {product.name}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.description || 'Full specifications available'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#006837', fontWeight: 700 }}>
                    {product.sku}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#006837', fontWeight: 600 }}>
                    {product.brand}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>
                    {product.category}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                    {product.price.toFixed(2)} SAR
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: product.inStock ? '#dcfce7' : '#fee2e2',
                      color: product.inStock ? '#166534' : '#991b1b',
                      border: `1px solid ${product.inStock ? '#bbf7d0' : '#fecaca'}`,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '50px'
                    }}>
                      {product.inStock ? 'In Stock' : 'Call Off'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEdit(product)}
                        style={{
                          backgroundColor: '#f8fafc',
                          color: '#006837',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Edit product"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>

                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        style={{
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        title="Delete product"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > 50 && (
          <div style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            Showing first 50 of {filteredProducts.length} matching materials. Use search bar to pinpoint specific items.
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 100010,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setModalOpen(false)}
        >
          <div style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            borderTop: '4px solid #006837',
            padding: '30px',
            overflowY: 'auto',
            color: '#0f172a',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {editingProduct ? 'Edit Product Details' : 'Add New Industrial Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Product Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                  placeholder="e.g. Raychem Heat Shrink Kit 15kV"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                    placeholder="API-XXXX"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Unit Price (SAR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Manufacturer / Brand *
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                  >
                    {ALLIED_BRANDS.map((b, idx) => (
                      <option key={idx} value={b}>{b}</option>
                    ))}
                    <option value="Other / OEM">Other / OEM</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Catalog Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                  >
                    {ALLIED_CATEGORIES.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Image Upload & URL Section */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Product Primary Image *
                </label>

                {/* File Upload Drop Area */}
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    transition: 'all 0.2s'
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#006837'; }}
                  onDragLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageFileUpload({ target: { files: e.dataTransfer.files } });
                    }
                  }}
                >
                  <input
                    type="file"
                    id="admin-product-image-file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="admin-product-image-file" style={{ cursor: 'pointer', display: 'block' }}>
                    <i className="bi bi-cloud-arrow-up-fill" style={{ fontSize: '30px', color: '#006837', display: 'block', marginBottom: '4px' }}></i>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                      Upload Image from Computer
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                      PNG, JPG, WEBP, SVG &bull; Auto-optimized for web
                    </span>
                  </label>
                </div>

                {/* Preview Thumbnail */}
                {formData.image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px', padding: '10px 14px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <img
                      src={formData.image}
                      alt="Selected product preview"
                      style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#006837', display: 'block' }}>
                        <i className="bi bi-check-circle-fill" style={{ marginRight: '4px' }}></i> Image Attached
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {formData.image.startsWith('data:') ? 'Local file uploaded successfully' : formData.image}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Direct URL input fallback */}
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Or paste direct image URL:
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px', outline: 'none' }}
                    placeholder="https://... or choose file above"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Technical Caption &amp; Short Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                  placeholder="Summary of voltage, NEMA rating, or application..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Compliance &amp; Key Features (one per line)
                </label>
                <textarea
                  rows="3"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '13px', outline: 'none' }}
                  placeholder="Saudi Aramco 9COM specifications&#10;Full Mill Test Certificate (MTC)&#10;UL listed"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="stockToggle"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#006837' }}
                />
                <label htmlFor="stockToggle" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Item is physically stocked in Al-Khobar Warehouse (ready for 24h dispatch)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '8px', padding: '10px 18px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#006837',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,104,55,0.25)'
                  }}
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
