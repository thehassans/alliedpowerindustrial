import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ALLIED_PRODUCTS, ALLIED_CATEGORIES, ALLIED_BRANDS } from './data/alliedProducts';
import { getCatalogProducts, syncServerDatabase } from './utils/productStorage';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, formatFullPhoneNumber } from './utils/countryCodes';
import { getStoredSocialLinks, SOCIAL_PLATFORMS } from './utils/socialStorage';
import {
  getProductSlug,
  getProductUrl,
  findProductBySlug,
  buildHomeSeoData,
  applySeoMetadata,
} from './utils/seoEngine';
import CatalogSection from './components/CatalogSection';
import ProductSearchBox from './components/ProductSearchBox';
import ProductDetailPage from './components/ProductDetailPage';

const ProductModal = lazy(() => import('./components/ProductModal'));
const RfqDrawer = lazy(() => import('./components/RfqDrawer'));
const RfqDocumentModal = lazy(() => import('./components/RfqDocumentModal'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function parseWindowRoute() {
  if (typeof window === 'undefined') {
    return { route: 'site', slug: '', search: '', category: 'All', brand: 'All' };
  }
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const hash = window.location.hash || '';
  const params = new URLSearchParams(window.location.search);

  if (path.startsWith('/admin') || hash.includes('/admin')) {
    return { route: 'admin', slug: '', search: '', category: 'All', brand: 'All' };
  }
  if (path.startsWith('/product/')) {
    const slug = path.replace(/^\/product\//, '').replace(/\/+$/, '');
    return { route: 'product', slug, search: '', category: 'All', brand: 'All' };
  }
  if (path === '/products' || path === '/catalog') {
    return {
      route: 'products',
      slug: '',
      search: params.get('q') || '',
      category: params.get('category') || 'All',
      brand: params.get('brand') || 'All',
    };
  }
  return { route: 'site', slug: '', search: '', category: 'All', brand: 'All' };
}

export default function App() {
  const initialLoc = parseWindowRoute();
  const [currentRoute, setCurrentRoute] = useState(initialLoc.route);
  const [activeProductSlug, setActiveProductSlug] = useState(initialLoc.slug);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState(initialLoc.search);
  const [catalogBrandFilter, setCatalogBrandFilter] = useState(initialLoc.brand);

  const [allCatalogProducts, setAllCatalogProducts] = useState(getCatalogProducts);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [offeringPage, setOfferingPage] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Active Category state synced across Header Dropdown, SBU cards, and Catalog
  const [selectedCategory, setSelectedCategory] = useState(initialLoc.category || 'All');

  // RFQ Cart State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewingRfqDoc, setViewingRfqDoc] = useState(null);
  const [showAramcoLetterModal, setShowAramcoLetterModal] = useState(false);

  // Contact Form
  const [contactCountryCode, setContactCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [contactPhone, setContactPhone] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Social Media Links (synced with /admin General Settings)
  const [socialLinks, setSocialLinks] = useState(getStoredSocialLinks);

  useEffect(() => {
    const handleProductsSync = () => {
      setAllCatalogProducts(getCatalogProducts());
    };
    window.addEventListener('allied_products_updated', handleProductsSync);
    syncServerDatabase();
    return () => window.removeEventListener('allied_products_updated', handleProductsSync);
  }, []);

  useEffect(() => {
    const handleSocialUpdate = () => {
      setSocialLinks(getStoredSocialLinks());
    };
    window.addEventListener('allied_social_updated', handleSocialUpdate);
    window.addEventListener('storage', handleSocialUpdate);
    return () => {
      window.removeEventListener('allied_social_updated', handleSocialUpdate);
      window.removeEventListener('storage', handleSocialUpdate);
    };
  }, []);

  // Apply Home SEO when on home route
  useEffect(() => {
    if (currentRoute === 'site') {
      applySeoMetadata(buildHomeSeoData());
    }
  }, [currentRoute]);

  // Handle URL changes & popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const parsed = parseWindowRoute();
      setCurrentRoute(parsed.route);
      setActiveProductSlug(parsed.slug);
      setCatalogSearchQuery(parsed.search);
      setCatalogBrandFilter(parsed.brand);
      if (parsed.category) {
        setSelectedCategory(parsed.category);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToRoute = (route) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    if (route === 'admin') {
      setCurrentRoute('admin');
      window.history.pushState(null, '', '/admin');
    } else if (route === 'products') {
      setCurrentRoute('products');
      window.history.pushState(null, '', '/products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentRoute('site');
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openProductPage = (product) => {
    if (!product) return;
    const slug = getProductSlug(product);
    const url = getProductUrl(product);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveProductSlug(slug);
    setCurrentRoute('product');
    window.history.pushState(null, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductsCatalogPage = ({ search = '', category = 'All', brand = 'All' } = {}) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setCatalogSearchQuery(search || '');
    setSelectedCategory(category || 'All');
    setCatalogBrandFilter(brand || 'All');
    setCurrentRoute('products');

    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category && category !== 'All') params.set('category', category);
    if (brand && brand !== 'All') params.set('brand', brand);
    const qs = params.toString();
    window.history.pushState(null, '', qs ? `/products?${qs}` : '/products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll listener for sticky header and back to top
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Slider auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    if (currentRoute !== 'site') {
      setCurrentRoute('site');
      window.history.pushState(null, '', '/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategoryAndScroll = (categoryName) => {
    setSelectedCategory(categoryName);
    if (currentRoute === 'products') {
      openProductsCatalogPage({ category: categoryName, search: catalogSearchQuery, brand: catalogBrandFilter });
    } else {
      scrollToSection('catalog');
    }
  };

  // Cart Management
  const handleAddToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setContactForm({ name: '', email: '', company: '', message: '' });
        setContactPhone('');
        setContactCountryCode(DEFAULT_COUNTRY_CODE);
      }, 5000);
    }
  };

  // Offerings tailored to Allied Power Industrial Company
  const offerings = [
    {
      title: 'Cable Splicing & Terminations',
      icon: '/assets/asset-022.png',
      desc: 'Authorized Raychem heat shrink and cold shrink kits up to 36kV for power plants and substations.',
    },
    {
      title: 'Explosion-Proof Equipment',
      icon: '/assets/asset-023.png',
      desc: 'Certified Appleton and Crouse-Hinds pin & sleeve plugs, receptacles, and hazardous area fittings.',
    },
    {
      title: 'Compression Lugs & Connectors',
      icon: '/assets/asset-024.png',
      desc: 'BURNDY UL-listed copper compression lugs, 1-hole & 2-hole long barrel connectors for industrial grids.',
    },
    {
      title: 'Exothermic Earthing Systems',
      icon: '/assets/asset-025.png',
      desc: 'SEICO graphite moulds, thermite weld powders, and lightning protection bonding systems.',
    },
    {
      title: 'Conduit & Cable Tray Fittings',
      icon: '/assets/asset-026.png',
      desc: 'OZ-Gedney drain breathers, EYS sealings, and heavy-duty steel channel fittings.',
    },
    {
      title: 'Industrial Chemicals & Sealants',
      icon: '/assets/asset-027.png',
      desc: 'Loctite anaerobic thread sealants, Molyslip Copaslip anti-seize, and high-temp fiberglass tapes.',
    },
    {
      title: 'Aramco Cable Marker Posts',
      icon: '/assets/asset-028.png',
      desc: 'Heavy-duty fiberglass orange marker posts and GI warning signs compliant with Aramco standards.',
    },
    {
      title: 'EPC Project Material Sourcing',
      icon: '/assets/asset-029.png',
      desc: 'Turnkey electrical and mechanical procurement packages with complete Mill Test Certificates (MTC).',
    },
    {
      title: 'Vendor Managed Inventory (VMI)',
      icon: '/assets/asset-030.png',
      desc: 'Dedicated stock reservations in Al-Khobar for scheduled call-offs and emergency shutdown deliveries.',
    },
  ];

  const visibleOfferings = offerings.slice(offeringPage * 3, offeringPage * 3 + 3);

  // Key Advantages of Allied Power Industrial Company
  const benefits = [
    {
      icon: '/assets/asset-031.png',
      title: 'Prompt Formal Quotations',
      desc: 'Allied Power Industrial Company ensures rapid quotation turnaround led by Farzand Naeem and our technical sales team to meet critical project procurement deadlines and bidding requirements.',
    },
    {
      icon: '/assets/asset-032.png',
      title: 'Competitive Direct OEM Pricing',
      desc: 'Through our authorized tier-one partnerships with Raychem, Appleton, Crouse-Hinds, BURNDY, and SEICO, we deliver competitive bulk and project pricing across Saudi Arabia.',
    },
    {
      icon: '/assets/asset-033.png',
      title: 'Ready Stock in Eastern Province',
      desc: 'Our central warehouse facility in Al-Khobar maintains comprehensive stock of cable terminations, hazardous area fittings, lugs, and sealants for fast delivery all over the Kingdom.',
    },
    {
      icon: '/assets/asset-034.png',
      title: 'Certified Technical Compliance',
      desc: 'Every item supplied is accompanied by manufacturer certificates of conformity, factory test reports, and compliance documentation satisfying Saudi Aramco (Vendor #10121504), SEC (Vendor #0002017931), and SABIC audits.',
    },
    {
      icon: '/assets/asset-035.png',
      title: 'Flexible Commercial Terms',
      desc: 'We support leading EPC contractors, industrial facilities, and maintenance operators with transparent commercial terms, verified ZATCA electronic invoicing, and dedicated account management.',
    },
    {
      icon: '/assets/asset-036.png',
      title: 'Kingdom Vision 2030 Support',
      desc: 'Allied Power Industrial Company actively strengthens the Kingdom’s industrial supply chain infrastructure, supporting national manufacturing and localization initiatives.',
    },
  ];

  const partnerBrands = [
    { name: 'Raychem (TE Connectivity)', desc: 'Cable Terminations & Joints', category: 'Cable Termination & Splicing' },
    { name: 'Appleton (Emerson)', desc: 'Explosion-Proof Equipment', category: 'Plugs & Receptacles' },
    { name: 'Crouse-Hinds (Eaton)', desc: 'Hazardous Area Plugs & Fittings', category: 'Plugs & Receptacles' },
    { name: 'BURNDY', desc: 'Compression Lugs & Connectors', category: 'Cable Lugs & Connectors' },
    { name: 'SEICO', desc: 'Exothermic Welding Moulds', category: 'Earthing & Lightning Protection' },
    { name: 'ABB', desc: 'Channel & Tray Fittings', category: 'Conduit & Fittings' },
    { name: 'OZ-Gedney', desc: 'Conduit Drain Breathers', category: 'Conduit & Fittings' },
    { name: 'Loctite (Henkel)', desc: 'Thread Sealants & Adhesives', category: 'Chemicals & Consumables' },
    { name: 'Molyslip', desc: 'High-Temp Anti-Seize Compounds', category: 'Chemicals & Consumables' },
    { name: 'Thomas & Betts', desc: 'Industrial Fasteners & Fittings', category: 'Cable Lugs & Connectors' },
  ];

  const markets = [
    { name: 'Oil & Gas Refineries', img: '/assets/asset-050.jpg' },
    { name: 'Petrochemical Plants', img: '/assets/asset-048.jpg' },
    { name: 'Power & Substations', img: '/assets/asset-047.jpg' },
    { name: 'Mining & Metals', img: '/assets/asset-049.jpg' },
    { name: 'EPC Mega Construction', img: '/assets/asset-052.jpg' },
    { name: 'Offshore & Marine', img: '/assets/asset-046.jpg' },
    { name: 'Water & Desalination', img: '/assets/asset-051.jpg' },
    { name: 'Industrial Infrastructure', img: '/assets/asset-053.jpg' },
  ];

  const sbuList = [
    { name: 'Cable Termination & Splicing', count: '56 Items' },
    { name: 'Cable Lugs & Connectors', count: '41 Items' },
    { name: 'Plugs & Receptacles', count: '18 Items' },
    { name: 'Conduit & Fittings', count: '5 Items' },
    { name: 'Chemicals & Consumables', count: '5 Items' },
    { name: 'Earthing & Lightning Protection', count: '4 Items' },
    { name: 'Cable Marker Posts & Signage', count: '4 Items' },
    { name: 'Lighting & Panels', count: '1 Item' },
  ];

  // If in admin mode, render the AdminApp directly
  if (currentRoute === 'admin') {
    return (
      <Suspense fallback={
        <div style={{ minHeight: '100vh', backgroundColor: '#0a121c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#00b862', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Loading Allied Power Admin Studio...
            </div>
          </div>
        </div>
      }>
        <AdminApp
          onBackToSite={() => navigateToRoute('site')}
        />
      </Suspense>
    );
  }

  return (
    <div className="site-container">
      {/* ========================================================
          1. ULTRA-PREMIUM HEADER & NAVIGATION
          ======================================================== */}
      <header className={`top-header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        {/* Top Utility Contact Bar */}
        <div className="top-utility-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
              <i className="bi bi-geo-alt-fill" style={{ color: 'var(--color-green-light)' }}></i>
              <span>Prince Naif Street, Cross 13, Al Khobar 34428, KSA</span>
            </a>
            <a href="tel:+966534017242">
              <i className="bi bi-telephone-fill" style={{ color: 'var(--color-green-light)' }}></i>
              <span>+966 53 401 7242 (Farzand Naeem)</span>
            </a>
            <a href="mailto:farzand@alliedpowerindustrial.com" className="d-none d-md-inline-flex">
              <i className="bi bi-envelope-fill" style={{ color: 'var(--color-green-light)' }}></i>
              <span>farzand@alliedpowerindustrial.com</span>
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="#certifications"
              onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); }}
              className="top-utility-badge"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
              title="Click to view Official Saudi Aramco Approval Letter"
            >
              <i className="bi bi-patch-check-fill"></i> Aramco Vendor: <strong>10121504</strong> &bull; SEC Vendor: <strong>0002017931</strong>
            </a>
            <span style={{ color: '#94a3b8', fontSize: '11px' }} className="d-none d-xl-inline-block">
              <i className="bi bi-clock"></i> Sat-Thu: 08:00 AM – 07:30 PM
            </span>
          </div>
        </div>

        {/* Main Glassmorphic Navigation Bar */}
        <div className="main-nav-bar" style={{ gap: '12px' }}>
          {/* Logo with official transparent branding */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigateToRoute('site'); }}
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <img
                src="/alliedpowerlogo-removebg-preview.png"
                alt="Allied Power Industrial Company"
                style={{
                  height: isScrolled ? '44px' : '50px',
                  width: 'auto',
                  objectFit: 'contain',
                  transition: 'height 0.25s ease'
                }}
              />
            </a>
          </div>

          {/* Instant Searchable Products Bar in Header (Desktop) */}
          <div className="desktop-nav-wrap" style={{ flex: '1 1 240px', maxWidth: '330px', margin: '0 6px' }}>
            <ProductSearchBox
              variant="header"
              onSelectProductPage={openProductPage}
              onSearchCatalog={(q) => openProductsCatalogPage({ search: q })}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav-wrap" style={{ flexShrink: 0 }}>
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigateToRoute('site'); }}
              className={`nav-link-item ${currentRoute === 'site' ? 'active' : ''}`}
              title="Home"
            >
              <i className="bi bi-house-door-fill" style={{ fontSize: '15px' }}></i>
            </a>

            <a
              href="#welcome"
              onClick={(e) => { e.preventDefault(); scrollToSection('welcome'); }}
              className="nav-link-item"
            >
              About Us
            </a>

            <a
              href="#certifications"
              onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); }}
              className="nav-link-item"
              style={{ color: 'var(--color-green)', fontWeight: 700 }}
            >
              <i className="bi bi-award-fill" style={{ fontSize: '13px', marginRight: '4px' }}></i>
              <span>Aramco Approval</span>
            </a>

            {/* Direct Clickable All-Products Page Link */}
            <a
              href="/products"
              onClick={(e) => { e.preventDefault(); openProductsCatalogPage({ category: 'All' }); }}
              className={`nav-link-item ${currentRoute === 'products' ? 'active' : ''}`}
              style={{ fontWeight: 700, color: currentRoute === 'products' ? 'var(--color-green)' : undefined }}
            >
              <i className="bi bi-grid-3x3-gap-fill" style={{ fontSize: '13px', color: 'var(--color-green)', marginRight: '3px' }}></i>
              <span>All Products</span>
            </a>

            {/* Categories Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setActiveDropdown('categories')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href="/products"
                onClick={(e) => { e.preventDefault(); openProductsCatalogPage({ category: 'All' }); }}
                className="nav-link-item"
              >
                <span>Categories</span>
                <i className="bi bi-chevron-down" style={{ fontSize: '11px', color: 'var(--color-green)' }}></i>
              </a>

              {activeDropdown === 'categories' && (
                <div className="nav-dropdown-menu">
                  <div style={{ padding: '4px 18px 8px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Select Portfolio Category
                  </div>
                  {ALLIED_CATEGORIES.map((cat, idx) => (
                    <div
                      key={idx}
                      className="nav-dropdown-item"
                      onClick={() => openProductsCatalogPage({ category: cat })}
                    >
                      <span>{cat}</span>
                      <i className="bi bi-arrow-right-short" style={{ color: 'var(--color-green)', fontSize: '16px' }}></i>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
                    <div
                      className="nav-dropdown-item"
                      onClick={() => openProductsCatalogPage({ category: 'All' })}
                      style={{ fontWeight: 700, color: 'var(--color-green)' }}
                    >
                      <span>Open Dedicated Products Page (/products)</span>
                      <i className="bi bi-grid-fill" style={{ fontSize: '12px' }}></i>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#brands"
              onClick={(e) => { e.preventDefault(); scrollToSection('brands'); }}
              className="nav-link-item"
            >
              Brands
            </a>

            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
              className="nav-link-item"
            >
              Contact
            </a>

            {/* RFQ Cart Drawer Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="header-rfq-btn"
              title="Open Request for Quotation Drawer"
            >
              <i className="bi bi-cart3" style={{ fontSize: '15px' }}></i>
              <span>RFQ Cart</span>
              {totalCartCount > 0 && (
                <span className="nav-counter-pill">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp Call to Action */}
            <a
              href="https://wa.me/966534017242?text=Hello%20Allied%20Power%20Industrial%20Company,%20I%20would%20like%20to%20request%20a%20quotation%20for%20materials."
              target="_blank"
              rel="noopener noreferrer"
              className="header-whatsapp-btn"
            >
              <i className="bi bi-whatsapp"></i>
              <span>+966 53 401 7242</span>
            </a>
          </nav>

          {/* Mobile Right Action Group */}
          <div className="mobile-nav-toggle-wrap">
            <button
              onClick={() => setIsCartOpen(true)}
              className="header-rfq-btn"
              style={{ padding: '7px 12px', fontSize: '13px' }}
              title="Open RFQ Cart"
            >
              <i className="bi bi-cart3"></i>
              {totalCartCount > 0 && (
                <span className="nav-counter-pill">{totalCartCount}</span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-hamburger-btn"
              aria-label="Toggle navigation menu"
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            padding: '20px 24px 24px',
            borderBottom: '3px solid var(--color-green)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
          }}>
            {/* Mobile Instant Product Search */}
            <div style={{ marginBottom: '16px' }}>
              <ProductSearchBox
                variant="header"
                onSelectProductPage={openProductPage}
                onSearchCatalog={(q) => openProductsCatalogPage({ search: q })}
                onAddToCart={handleAddToCart}
              />
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li>
                <a
                  href="/"
                  onClick={(e) => { e.preventDefault(); navigateToRoute('site'); }}
                  style={{ fontWeight: 700, color: 'var(--color-black)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <i className="bi bi-house-door-fill" style={{ color: 'var(--color-green)' }}></i>
                  <span>Home Page</span>
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  onClick={(e) => { e.preventDefault(); openProductsCatalogPage({ category: 'All' }); }}
                  style={{ color: 'var(--color-green)', fontWeight: 800, fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span><i className="bi bi-grid-3x3-gap-fill" style={{ marginRight: '6px' }}></i> All Products Catalog Page (/products)</span>
                  <i className="bi bi-arrow-right"></i>
                </a>
              </li>
              <li>
                <a
                  href="#certifications"
                  onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); }}
                  style={{ color: 'var(--color-green)', fontWeight: 700, fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span><i className="bi bi-award-fill" style={{ marginRight: '6px' }}></i> Saudi Aramco Approval Letter (#10121504)</span>
                  <i className="bi bi-arrow-right"></i>
                </a>
              </li>
              <li>
                <a
                  href="#welcome"
                  onClick={(e) => { e.preventDefault(); scrollToSection('welcome'); }}
                  style={{ fontWeight: 600, color: 'var(--color-black)', fontSize: '15px' }}
                >
                  About Allied Power Industrial Company
                </a>
              </li>
              <li>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Product Categories:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {ALLIED_CATEGORIES.map((cat, idx) => (
                    <a
                      key={idx}
                      href="/products"
                      onClick={(e) => { e.preventDefault(); openProductsCatalogPage({ category: cat }); }}
                      style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: '4px 0' }}
                    >
                      &bull; {cat}
                    </a>
                  ))}
                </div>
              </li>
              <li>
                <a href="#brands" onClick={(e) => { e.preventDefault(); scrollToSection('brands'); }} style={{ color: 'var(--color-black)', fontWeight: 500 }}>
                  Authorized Brands
                </a>
              </li>
              <li>
                <a href="#offerings" onClick={(e) => { e.preventDefault(); scrollToSection('offerings'); }} style={{ color: 'var(--color-black)', fontWeight: 500 }}>
                  Procurement Services
                </a>
              </li>
              <li>
                <a href="#markets" onClick={(e) => { e.preventDefault(); scrollToSection('markets'); }} style={{ color: 'var(--color-black)', fontWeight: 500 }}>
                  Sectors Served
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} style={{ color: 'var(--color-black)', fontWeight: 500 }}>
                  Contact &amp; Location
                </a>
              </li>
              <li style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <a
                  href="https://wa.me/966534017242?text=Hello%20Allied%20Power%20Industrial%20Company,%20I%20would%20like%20to%20inquire%20about%20materials."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    background: 'var(--color-green)',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <i className="bi bi-whatsapp" style={{ marginRight: '8px' }}></i> WhatsApp: +966 53 401 7242
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* ========================================================
          CONDITIONAL ROUTE VIEW:
          1. /product/:slug -> Dedicated SEO Product Page
          2. /products      -> Dedicated All Products Catalog Page
          3. /              -> Main Corporate Landing Page + Hero Search
          ======================================================== */}
      {currentRoute === 'product' ? (
        <ProductDetailPage
          product={findProductBySlug(allCatalogProducts, activeProductSlug)}
          allProducts={allCatalogProducts}
          onNavigateHome={() => navigateToRoute('site')}
          onNavigateCatalog={openProductsCatalogPage}
          onSelectProductPage={openProductPage}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setIsCartOpen(true)}
        />
      ) : currentRoute === 'products' ? (
        <CatalogSection
          isDedicatedPage={true}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => openProductsCatalogPage({ category: cat, search: catalogSearchQuery, brand: catalogBrandFilter })}
          initialSearch={catalogSearchQuery}
          initialBrand={catalogBrandFilter}
          onSelectProduct={(product) => setSelectedProduct(product)}
          onOpenProductPage={openProductPage}
          onNavigateHome={() => navigateToRoute('site')}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <>
      {/* ========================================================
          2. ULTRA-PREMIUM CINEMATIC HERO SLIDER + INSTANT PRODUCT SEARCH
          ======================================================== */}
      <section className="hero-clean-section">
        {/* Background Crossfade Images */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          <img
            src="/assets/refinery-night-real.jpg"
            alt="Allied Power Industrial Company Facilities"
            className="hero-slide-bg"
            style={{ opacity: currentSlide === 0 ? 1 : 0 }}
          />
          <img
            src="/assets/hero-industrial-clean.jpg"
            alt="Allied Power Industrial Company Electrical Materials Stock"
            className="hero-slide-bg"
            style={{ opacity: currentSlide === 1 ? 1 : 0 }}
          />
        </div>

        {/* Persistent Foreground Overlay with Live Search Bar */}
        <div className="hero-overlay-cinematic">
          <div style={{ maxWidth: '880px', width: '100%', color: '#ffffff' }}>
            <div className="hero-pill-tag">
              <i className="bi bi-shield-check" style={{ color: '#4ade80', fontSize: '14px' }}></i>
              <span>Aramco Vendor Code: <strong>10121504</strong></span>
              <span className="badge-red">&bull;</span>
              <span>SEC Vendor Code: <strong>0002017931</strong> &bull; Al Khobar</span>
            </div>

            {currentSlide === 0 ? (
              <>
                <h1 className="hero-clean-title">
                  ALLIED POWER INDUSTRIAL COMPANY<br />
                  <span style={{ color: '#00b862' }}>DELIVERING RELIABILITY.</span>
                </h1>
                <p className="hero-clean-subtitle" style={{ marginBottom: '22px' }}>
                  Allied Power Industrial Company is an officially approved Saudi Aramco Vendor (#10121504) &amp; Saudi Electricity Company Vendor (#0002017931), stocking certified Raychem cable terminations, Appleton &amp; Crouse-Hinds explosion-proof fittings, BURNDY compression lugs, and SEICO earthing systems in Al Khobar.
                </p>
              </>
            ) : (
              <>
                <h1 className="hero-clean-title">
                  CERTIFIED INDUSTRIAL<br />
                  <span style={{ color: '#ff4757' }}>ELECTRICAL SUPPLIES</span>
                </h1>
                <p className="hero-clean-subtitle" style={{ marginBottom: '22px' }}>
                  Allied Power Industrial Company supplies factory-tested electrical equipment with complete Mill Test Certificates (MTC), origin documentation, and hazardous area compliance (UL, ATEX, IECEx) from Prince Naif Street, Cross 13, Al Khobar 34428, KSA.
                </p>
              </>
            )}

            {/* Instant Searchable Products Bar in Hero Section */}
            <ProductSearchBox
              variant="hero"
              onSelectProductPage={openProductPage}
              onSearchCatalog={(q) => openProductsCatalogPage({ search: q })}
              onAddToCart={handleAddToCart}
            />

            <div className="hero-action-buttons" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '24px' }}>
              <a
                href="/products"
                onClick={(e) => { e.preventDefault(); openProductsCatalogPage({ category: 'All' }); }}
                className="btn-primary-green"
                style={{ textDecoration: 'none' }}
              >
                <i className="bi bi-grid-3x3-gap-fill"></i> Browse All Products Page
              </a>

              <button
                onClick={() => scrollToSection('certifications')}
                className="btn-primary-red"
              >
                <i className="bi bi-award-fill"></i> View Aramco Approval Letter
              </button>

              <a
                href="https://wa.me/966534017242?text=Hello%20Allied%20Power%20Industrial%20Company,%20I%20would%20like%20to%20inquire%20about%20materials."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white"
              >
                <i className="bi bi-whatsapp"></i> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. ULTRA-PREMIUM STATS & VENDOR CREDENTIALS STRIP
          (Emerald Green & Vibrant Red Key Metrics + Vendor Codes)
          ======================================================== */}
      <section className="ultra-stats-strip">
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '18px'
        }}>
          <div
            className="stats-card-premium"
            style={{ cursor: 'pointer', border: '1px solid rgba(0, 184, 98, 0.4)' }}
            onClick={() => scrollToSection('certifications')}
          >
            <div className="stats-number-green" style={{ fontSize: '26px', letterSpacing: '0.5px' }}>10121504</div>
            <div className="stats-title-white">Saudi Aramco Vendor Code</div>
            <div className="stats-desc-subtle">Approved Materials Vendor &bull; E-Ref #0020679</div>
          </div>

          <div
            className="stats-card-premium"
            style={{ cursor: 'pointer', border: '1px solid rgba(255, 71, 87, 0.35)' }}
            onClick={() => scrollToSection('certifications')}
          >
            <div className="stats-number-red" style={{ fontSize: '26px', letterSpacing: '0.5px' }}>0002017931</div>
            <div className="stats-title-white">Saudi Electric Vendor Code</div>
            <div className="stats-desc-subtle">SEC Approved Electrical Supplier</div>
          </div>

          <div
            className="stats-card-premium"
            style={{ cursor: 'pointer', border: '1px solid rgba(0, 184, 98, 0.35)' }}
            onClick={() => openProductsCatalogPage({ category: 'All' })}
          >
            <div className="stats-number-green">{allCatalogProducts.length}+</div>
            <div className="stats-title-white">Clickable SEO Product Pages</div>
            <div className="stats-desc-subtle">Click to open full /products directory</div>
          </div>

          <div className="stats-card-premium">
            <div className="stats-number-red">24h</div>
            <div className="stats-title-white">Kingdom-Wide Fast Delivery</div>
            <div className="stats-desc-subtle">Prince Naif St, Cross 13, Al Khobar</div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. EXECUTIVE ABOUT SECTION
          (Clean Corporate Profile with Saudi Vision 2030 Credentials)
          ======================================================== */}
      <section id="welcome" className="about-executive-section">
        <div
          className="about-main-grid"
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: '50px',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-green-subtle)',
              border: '1px solid #a7f3d0',
              color: 'var(--color-green)',
              fontSize: '12px',
              fontWeight: 800,
              padding: '5px 14px',
              borderRadius: '50px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              <i className="bi bi-building-check"></i> Approved Saudi Aramco &amp; SEC Vendor
            </div>

            <h2 style={{
              fontSize: '38px',
              fontWeight: 800,
              lineHeight: '48px',
              color: 'var(--color-black)',
              marginBottom: '18px'
            }}>
              Welcome to <span style={{ color: 'var(--color-green)' }}>Allied Power Industrial Company</span>
            </h2>

            <p style={{
              fontSize: '15px',
              lineHeight: '26px',
              color: 'var(--color-text-secondary)',
              marginBottom: '18px'
            }}>
              Headquartered at <strong>Prince Naif Street, Cross 13, Al Khobar 34428, KSA</strong>, <strong>Allied Power Industrial Company</strong> is an officially registered supplier of specialized electrical, mechanical, and industrial instrumentation materials (<strong>Saudi Aramco Vendor Code: 10121504</strong> | <strong>Saudi Electric Vendor Code: 0002017931</strong>). We support major EPC contractors, industrial operators, and maintenance contractors executing high-spec projects across the Kingdom.
            </p>

            <p style={{
              fontSize: '15px',
              lineHeight: '26px',
              color: 'var(--color-text-secondary)',
              marginBottom: '26px'
            }}>
              Our portfolio encompasses globally recognized OEM manufacturers including <strong>Raychem</strong>, <strong>Appleton</strong>, <strong>Crouse-Hinds</strong>, <strong>BURNDY</strong>, <strong>SEICO</strong>, <strong>ABB</strong>, <strong>Loctite</strong>, and <strong>Molyslip</strong>, backed by immediate warehouse availability and comprehensive technical support.
            </p>

            {/* 4 Feature Value Props */}
            <div className="about-features-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '30px'
            }}>
              <div className="about-feature-box">
                <i className="bi bi-shield-fill-check" style={{ fontSize: '22px', color: 'var(--color-green)', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-black)' }}>Aramco Vendor: 10121504</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Approved Materials Vendor &bull; 9COM Compliant</span>
                </div>
              </div>

              <div className="about-feature-box">
                <i className="bi bi-lightning-charge-fill" style={{ fontSize: '22px', color: 'var(--color-red)', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-black)' }}>SEC Vendor: 0002017931</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Saudi Electricity Company Approved Vendor</span>
                </div>
              </div>

              <div className="about-feature-box">
                <i className="bi bi-geo-alt-fill" style={{ fontSize: '22px', color: 'var(--color-green)', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-black)' }}>Al Khobar 34428 Facility</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Prince Naif Street, Cross 13, Al Khobar, KSA</span>
                </div>
              </div>

              <div className="about-feature-box">
                <i className="bi bi-receipt-cutoff" style={{ fontSize: '22px', color: 'var(--color-red)', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-black)' }}>CR: 7054403162</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ZATCA Phase-2 Tax Invoicing (VAT: 314807049800003)</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => scrollToSection('catalog')}
                className="btn-primary-green"
              >
                Explore Products Catalog <i className="bi bi-arrow-right"></i>
              </button>

              <button
                onClick={() => scrollToSection('certifications')}
                className="btn-primary-red"
              >
                View Aramco Approval Letter <i className="bi bi-file-earmark-check-fill"></i>
              </button>
            </div>
          </div>

          {/* Right Executive Profile Card */}
          <div>
            <div className="about-corp-card">
              {/* Logo Presentation */}
              <div style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid var(--color-border)',
                display: 'inline-block'
              }}>
                <img
                  src="/alliedpowerlogo-removebg-preview.png"
                  alt="Allied Power Industrial Company"
                  style={{ maxHeight: '72px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-black)', marginBottom: '8px' }}>
                Allied Power Industrial Company
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '22px' }}>
                Specialized Stockist for Electrical &amp; Mechanical Project Supplies
              </p>

              {/* Corporate Snapshot */}
              <div style={{
                background: 'var(--color-surface-soft)',
                borderRadius: '10px',
                padding: '16px 20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '13px',
                marginBottom: '20px',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', gap: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Saudi Aramco Vendor Code:</span>
                  <strong style={{ color: 'var(--color-green)', fontFamily: 'monospace', fontSize: '14px' }}>10121504</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', gap: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Saudi Electric Vendor Code:</span>
                  <strong style={{ color: 'var(--color-red)', fontFamily: 'monospace', fontSize: '14px' }}>0002017931</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', gap: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>CR Number:</span>
                  <strong style={{ color: 'var(--color-black)' }}>7054403162</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', gap: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Headquarters:</span>
                  <strong style={{ color: 'var(--color-black)', textAlign: 'right' }}>Prince Naif St, Cross 13, Al Khobar 34428, KSA</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Sales Representative:</span>
                  <strong style={{ color: 'var(--color-black)' }}>Farzand Naeem (+966 53 401 7242)</strong>
                </div>
              </div>

              {/* National Vision 2030 / Saudi Made Banner */}
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                marginBottom: '16px'
              }}>
                <img
                  src="/assets/asset-044.jpg"
                  alt="Kingdom of Saudi Arabia Vision 2030 &amp; Saudi Made Alignment"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                Supporting Kingdom Vision 2030 industrial supply chain localization
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4B. OFFICIAL SAUDI ARAMCO APPROVAL LETTER & VENDOR CREDENTIALS
          (Interactive Document Showcase + Downloadable Official PDF)
          ======================================================== */}
      <section
        id="certifications"
        style={{
          padding: '85px 20px',
          background: 'linear-gradient(135deg, #06140d 0%, #0a192f 100%)',
          color: '#ffffff',
          borderTop: '3px solid var(--color-green)',
          borderBottom: '3px solid var(--color-red)'
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 184, 98, 0.18)',
              border: '1px solid #00b862',
              color: '#4ade80',
              fontSize: '12px',
              fontWeight: 800,
              padding: '6px 18px',
              borderRadius: '50px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '14px'
            }}>
              <i className="bi bi-patch-check-fill" style={{ color: '#00b862', fontSize: '14px' }}></i>
              <span>Official Government &amp; Enterprise Registrations</span>
            </div>

            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Saudi Aramco <span style={{ color: '#00b862' }}>Approval Letter</span> &amp; Vendor Credentials
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '15px', maxWidth: '780px', margin: '0 auto', lineHeight: '25px' }}>
              <strong>Allied Power Industrial Company</strong> is an officially approved Materials Vendor with <strong>Saudi Aramco (Vendor Code: 10121504)</strong> and <strong>Saudi Electricity Company (Vendor Code: 0002017931)</strong>.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Left Column: Vendor Code Cards & Verification Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Saudi Aramco Vendor Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(0, 184, 98, 0.45)',
                borderLeft: '5px solid #00b862',
                borderRadius: '14px',
                padding: '24px 26px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>
                      Saudi Aramco Supplier Registration
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      ALLIED POWER INDUSTRIAL COMPANY
                    </h3>
                  </div>
                  <span style={{
                    background: '#006837',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '50px',
                    border: '1px solid #00b862'
                  }}>
                    APPROVED VENDOR
                  </span>
                </div>

                <div style={{
                  marginTop: '18px',
                  padding: '14px 18px',
                  background: 'rgba(0, 104, 55, 0.25)',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 184, 98, 0.35)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>
                    Saudi Aramco Vendor Code:
                  </span>
                  <strong style={{ fontSize: '24px', fontWeight: 900, color: '#4ade80', fontFamily: 'monospace', letterSpacing: '1px' }}>
                    10121504
                  </strong>
                </div>

                <div style={{
                  marginTop: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '10px',
                  fontSize: '12.5px',
                  color: '#cbd5e1'
                }}>
                  <div><span style={{ color: '#94a3b8' }}>E-Reference No.:</span> <strong style={{ color: '#ffffff' }}>0020679</strong></div>
                  <div><span style={{ color: '#94a3b8' }}>CR Number:</span> <strong style={{ color: '#ffffff' }}>7054403162</strong></div>
                  <div><span style={{ color: '#94a3b8' }}>Supplier Type:</span> <strong style={{ color: '#ffffff' }}>Materials Vendor</strong></div>
                  <div><span style={{ color: '#94a3b8' }}>VAT Number:</span> <strong style={{ color: '#ffffff' }}>314807049800003</strong></div>
                </div>
              </div>

              {/* Saudi Electricity Company (SEC) Vendor Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 71, 87, 0.45)',
                borderLeft: '5px solid #ff4757',
                borderRadius: '14px',
                padding: '24px 26px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '4px' }}>
                      Saudi Electricity Company (SEC) Registration
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      ALLIED POWER INDUSTRIAL COMPANY
                    </h3>
                  </div>
                  <span style={{
                    background: '#c8102e',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '50px',
                    border: '1px solid #ff4757'
                  }}>
                    SEC VENDOR
                  </span>
                </div>

                <div style={{
                  marginTop: '18px',
                  padding: '14px 18px',
                  background: 'rgba(200, 16, 46, 0.22)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 71, 87, 0.35)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>
                    Saudi Electric Vendor Code:
                  </span>
                  <strong style={{ fontSize: '24px', fontWeight: 900, color: '#ff6b81', fontFamily: 'monospace', letterSpacing: '1px' }}>
                    0002017931
                  </strong>
                </div>

                <div style={{ marginTop: '14px', fontSize: '12.5px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-geo-alt-fill" style={{ color: '#ff4757' }}></i>
                  <span>Headquarters: <strong>Prince Naif Street, Cross 13, Al Khobar 34428, KSA</strong></span>
                </div>
              </div>

              {/* Action Buttons for Certificate */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
                <button
                  onClick={() => setShowAramcoLetterModal(true)}
                  className="btn-primary-green"
                  style={{ flex: 1, justifyContent: 'center', minWidth: '210px' }}
                >
                  <i className="bi bi-zoom-in"></i> Inspect Approval Letter
                </button>

                <a
                  href="/Saudi_Aramco_Approval_Letter.pdf"
                  download="Allied_Power_Industrial_Company_Saudi_Aramco_Approval_Letter_10121504.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-white"
                  style={{ flex: 1, justifyContent: 'center', minWidth: '210px', textDecoration: 'none' }}
                >
                  <i className="bi bi-file-earmark-pdf-fill" style={{ color: '#ff4757' }}></i> Download Official PDF
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Certificate Frame */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                onClick={() => setShowAramcoLetterModal(true)}
                title="Click to inspect full-resolution Saudi Aramco Approval Letter"
                style={{
                  background: '#ffffff',
                  padding: '14px',
                  borderRadius: '16px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                  border: '3px solid #00b862',
                  maxWidth: '470px',
                  width: '100%',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 30px 70px rgba(0, 184, 98, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.5)';
                }}
              >
                <div style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '10px 10px 0 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bi bi-patch-check-fill" style={{ color: '#4ade80' }}></i>
                    Saudi Aramco Approval Letter (Vendor #10121504)
                  </span>
                  <span style={{ color: '#4ade80', fontSize: '11px' }}>
                    <i className="bi bi-arrows-fullscreen"></i> Click to Enlarge
                  </span>
                </div>

                <div style={{
                  border: '1px solid #e2e8f0',
                  borderTop: 'none',
                  borderRadius: '0 0 10px 10px',
                  overflow: 'hidden',
                  background: '#f8fafc'
                }}>
                  <img
                    src="/aramco_approval_letter.png"
                    alt="Saudi Aramco Approval Letter - Allied Power Industrial Company - Vendor Code 10121504"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. COMPLETE PRODUCTS CATALOG
          (Fully synchronized category pills, SAR prices, modals)
          ======================================================== */}
      <CatalogSection
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => setSelectedCategory(cat)}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onOpenProductPage={openProductPage}
        onOpenDedicatedCatalog={openProductsCatalogPage}
        onAddToCart={handleAddToCart}
      />

      {/* ========================================================
          6. AUTHORIZED BRANDS & MANUFACTURERS
          ======================================================== */}
      <section id="brands" style={{ padding: '80px 20px', backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--color-green-subtle)',
              border: '1px solid #a7f3d0',
              color: 'var(--color-green)',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 16px',
              borderRadius: '50px',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Tier-1 Global Partnerships
            </span>
            <h2 style={{ color: 'var(--color-black)', fontSize: '36px', fontWeight: 800, margin: 0 }}>
              Authorized Brands &amp; Manufacturers
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: '10px' }}>
              We stock and supply genuine materials directly certified by the world’s leading industrial manufacturers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '20px'
          }}>
            {partnerBrands.map((b, idx) => (
              <div
                key={idx}
                onClick={() => openProductsCatalogPage({ category: b.category })}
                style={{
                  backgroundColor: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--color-green)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 104, 55, 0.1)';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)';
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  backgroundColor: 'var(--color-green-subtle)',
                  color: 'var(--color-green)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontSize: '24px',
                  border: '1px solid #a7f3d0'
                }}>
                  <i className="bi bi-patch-check-fill"></i>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '6px' }}>
                  {b.name}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 10px' }}>
                  {b.desc}
                </p>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-red)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  View In Catalog <i className="bi bi-arrow-right-short"></i>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          7. PROCUREMENT SERVICES & CORE OFFERINGS
          (Boldly visible "Turnkey Capabilities" & "Allied Power Material Services")
          ======================================================== */}
      <section id="offerings" className="home-offering-bg" style={{ padding: '85px 20px', backgroundColor: '#071a10' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              {/* Boldly Visible Turnkey Capabilities Tag */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0, 104, 55, 0.35)',
                border: '1px solid #00b862',
                color: '#4ade80',
                fontWeight: 800,
                fontSize: '12px',
                padding: '6px 18px',
                borderRadius: '50px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                <i className="bi bi-gear-wide-connected" style={{ color: '#00b862', fontSize: '14px' }}></i>
                <span>Turnkey Capabilities</span>
              </div>

              {/* Boldly Visible Allied Power Industrial Company Material Services Heading */}
              <h2 style={{ color: '#ffffff', fontSize: '38px', fontWeight: 800, margin: '6px 0 0', letterSpacing: '-0.02em' }}>
                Allied Power Industrial Company <span style={{ color: '#00b862' }}>Material Services</span>
              </h2>

              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px', maxWidth: '640px' }}>
                Comprehensive procurement, vendor managed inventory, and hazardous area engineering supply chain solutions for Kingdom mega-projects.
              </p>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setOfferingPage(Math.max(0, offeringPage - 1))}
                disabled={offeringPage === 0}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: offeringPage === 0 ? 'transparent' : 'var(--color-green)',
                  color: offeringPage === 0 ? 'rgba(255,255,255,0.3)' : '#ffffff',
                  cursor: offeringPage === 0 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                onClick={() => setOfferingPage(Math.min(2, offeringPage + 1))}
                disabled={offeringPage === 2}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: offeringPage === 2 ? 'transparent' : 'var(--color-green)',
                  color: offeringPage === 2 ? 'rgba(255,255,255,0.3)' : '#ffffff',
                  cursor: offeringPage === 2 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '24px'
          }}>
            {visibleOfferings.map((item, idx) => (
              <div
                key={idx}
                className="home-offering-box"
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  padding: '32px 28px',
                  borderTop: '4px solid var(--color-green)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                }}
              >
                <img src={item.icon} alt={item.title} style={{ height: '48px', marginBottom: '18px' }} />
                <h3 style={{ color: 'var(--color-black)', fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '22px', textAlign: 'left', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          8. BENEFITS / WHY ALLIED POWER INDUSTRIAL COMPANY
          ======================================================== */}
      <section id="benefits" className="home-benefits-bg" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--color-red-subtle)',
              border: '1px solid #fecaca',
              color: 'var(--color-red)',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 16px',
              borderRadius: '50px',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Operational Excellence
            </span>
            <h2 style={{ color: 'var(--color-black)', fontSize: '36px', fontWeight: 800, marginBottom: '10px' }}>
              Why Industrial Leaders Choose Us
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', maxWidth: '750px', margin: '0 auto' }}>
              Proven track record supplying Saudi Arabia’s critical energy, petrochemical, and power generation installations.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '24px'
          }}>
            {benefits.map((b, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid var(--color-border)',
                  borderLeft: '4px solid var(--color-green)',
                  display: 'flex',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={b.icon} alt={b.title} style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
                <div>
                  <h4 style={{ color: 'var(--color-black)', fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
                    {b.title}
                  </h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '20px', textAlign: 'left', margin: 0 }}>
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          9. INDUSTRIAL SECTORS SERVED
          ======================================================== */}
      <section id="markets" className="home-markets-served-bg" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--color-green-subtle)',
              border: '1px solid #a7f3d0',
              color: 'var(--color-green)',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 16px',
              borderRadius: '50px',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Critical Infrastructure
            </span>
            <h2 style={{ color: 'var(--color-black)', fontSize: '36px', fontWeight: 800, marginBottom: '10px' }}>
              Industrial Sectors Served
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
              Engineering materials engineered for hazardous locations and severe industrial environments.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            {markets.map((m, idx) => (
              <div key={idx} className="home-market-box">
                <img src={m.img} alt={m.name} />
                <h3>{m.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          10. PORTFOLIO BREAKDOWN (SBU)
          (Clickable categories that filter catalog and scroll)
          ======================================================== */}
      <section id="sbu" className="home-sbu-bg" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--color-green-subtle)',
              border: '1px solid #a7f3d0',
              color: 'var(--color-green)',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 16px',
              borderRadius: '50px',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Eastern Province Warehouse Stocks
            </span>
            <h2 style={{
              color: 'var(--color-black)',
              fontWeight: 800,
              fontSize: '36px',
              margin: '0 0 10px'
            }}>
              Product Portfolio Distribution
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', margin: 0 }}>
              Click any category below to filter in-stock industrial supplies ready for immediate dispatch.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {sbuList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => openProductsCatalogPage({ category: item.name })}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '22px',
                  border: '1px solid var(--color-border)',
                  borderLeft: '4px solid var(--color-green)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-green)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 104, 55, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.borderLeftColor = 'var(--color-green)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-black)', margin: '0 0 4px' }}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Al-Khobar Stock &bull; Open Category Page
                  </span>
                </div>
                <span className="nav-counter-pill" style={{ fontSize: '11px', padding: '3px 10px' }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          11. COMMERCIAL & TECHNICAL CONTACT
          (Farzand Naeem Sales Card & Interactive RFQ Form)
          ======================================================== */}
      <section id="contact" className="home-footer-connect-bg" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div className="home-footer-connect-card" style={{ padding: '45px 40px', borderTop: '4px solid var(--color-green)' }}>
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <span style={{
                background: 'var(--color-green-subtle)',
                border: '1px solid #a7f3d0',
                color: 'var(--color-green)',
                fontSize: '12px',
                fontWeight: 800,
                padding: '4px 16px',
                borderRadius: '50px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '12px'
              }}>
                Commercial &amp; Technical Support
              </span>
              <h2 style={{
                fontWeight: 800,
                fontSize: '34px',
                color: 'var(--color-black)',
                margin: 0
              }}>
                Connect with Allied Power Industrial Company
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', marginTop: '10px' }}>
                Contact our Sales Manager or submit your inquiry for prompt formal quotations and technical submittals.
              </p>
            </div>

            {/* Sales Representative Card */}
            <div style={{
              background: 'var(--color-surface-soft)',
              borderRadius: '12px',
              padding: '22px 28px',
              marginBottom: '35px',
              border: '1px solid var(--color-border)',
              borderLeft: '4px solid var(--color-red)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '18px'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-red)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Designated Sales Contact &bull; Aramco Vendor: 10121504 &bull; SEC Vendor: 0002017931
                </span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-black)', margin: '4px 0' }}>
                  Farzand Naeem &mdash; Sales Manager (Allied Power Industrial Company)
                </h4>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span>
                    <i className="bi bi-telephone-fill" style={{ color: 'var(--color-green)', marginRight: '6px' }}></i>
                    +966 53 401 7242
                  </span>
                  <span>
                    <i className="bi bi-envelope-fill" style={{ color: 'var(--color-green)', marginRight: '6px' }}></i>
                    farzand@alliedpowerindustrial.com
                  </span>
                  <span>
                    <i className="bi bi-geo-alt-fill" style={{ color: 'var(--color-green)', marginRight: '6px' }}></i>
                    Prince Naif Street, Cross 13, Al Khobar 34428, KSA
                  </span>
                </div>
              </div>

              <a
                href="https://wa.me/966534017242?text=Hello%20Mr.%20Farzand%20Naeem,%20I%20am%20contacting%20you%20regarding%20Allied%20Power%20Industrial%20Company%20materials."
                target="_blank"
                rel="noopener noreferrer"
                className="header-whatsapp-btn"
              >
                <i className="bi bi-whatsapp"></i> Chat on WhatsApp
              </a>
            </div>

            {formSubmitted ? (
              <div style={{
                background: '#d1e7dd',
                color: '#0a3622',
                padding: '28px',
                borderRadius: '10px',
                textAlign: 'center',
                fontWeight: 600,
                border: '1px solid #badbcc'
              }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: '36px', color: 'var(--color-green)', display: 'block', marginBottom: '10px' }}></i>
                Thank you! Your inquiry has been sent directly to Allied Power Industrial Company Sales Team. We will revert with a formal quotation within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="footer-connect-form">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '18px',
                  marginBottom: '18px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Eng. Ahmed Al-Ghamdi"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '6px' }}>
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '6px' }}>
                      Mobile / Phone Number *
                    </label>
                    <div style={{
                      display: 'flex',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      overflow: 'hidden'
                    }}>
                      <select
                        value={contactCountryCode}
                        onChange={(e) => setContactCountryCode(e.target.value)}
                        title="Select Country Calling Code"
                        style={{
                          padding: '0 10px',
                          backgroundColor: '#f8fafc',
                          border: 'none',
                          borderRight: '1px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0f172a',
                          cursor: 'pointer',
                          outline: 'none',
                          maxWidth: '96px',
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
                        placeholder={COUNTRY_CODES.find(c => c.code === contactCountryCode)?.example || '5X XXX XXXX *'}
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: 'none',
                          fontSize: '14px',
                          outline: 'none',
                          minWidth: 0,
                          color: '#0f172a'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '6px' }}>
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EPC Contractor / Industrial Co."
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-black)', marginBottom: '6px' }}>
                    Required Items, SKUs, or Project Details *
                  </label>
                  <textarea
                    rows="3"
                    placeholder="List required Raychem kits, BURNDY lugs, Appleton fittings, quantities, or project bidding deadlines..."
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                  ></textarea>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="submit"
                    className="btn-primary-green"
                    style={{ padding: '14px 40px', fontSize: '15px' }}
                  >
                    <i className="bi bi-send-fill"></i> Submit Procurement Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      </>
      )}

      {/* ========================================================
          12. ULTRA-PREMIUM ENTERPRISE FOOTER
          (Official Logo, Pre-Footer Trust Bar, Quick Links, Contacts, Kingdom Vision, Admin Link)
          ======================================================== */}
      <footer style={{
        backgroundColor: '#060b11',
        color: '#ffffff',
        borderTop: '3px solid var(--color-green)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative top red accent line */}
        <div style={{ height: '2px', background: 'var(--color-red)', width: '100%' }}></div>

        {/* Pre-Footer Strategic Trust Bar */}
        <div style={{
          backgroundColor: '#0a121c',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '24px 30px'
        }}>
          <div style={{
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#86efac', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-shield-fill-check" style={{ fontSize: '18px', color: 'var(--color-green-light)' }}></i>
              <span>Saudi Aramco Vendor Code: 10121504</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-lightning-charge-fill" style={{ fontSize: '18px', color: '#ff4757' }}></i>
              <span>Saudi Electric Vendor Code: 0002017931</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#bae6fd', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-patch-check-fill" style={{ fontSize: '18px', color: '#38bdf8' }}></i>
              <span>SABIC &amp; 9COM Approved Supplier</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde68a', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-truck" style={{ fontSize: '18px', color: '#fbbf24' }}></i>
              <span>Fast Delivery All Over the Kingdom</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d8b4fe', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-award-fill" style={{ fontSize: '18px', color: '#c084fc' }}></i>
              <span>100% Genuine Factory Test Certs (MTC)</span>
            </div>
          </div>
        </div>

        {/* Main Footer Body */}
        <div
          className="main-footer-grid"
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '65px 30px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '40px'
          }}
        >
          {/* Column 1: Brand & Enterprise Profile */}
          <div>
            <div style={{
              background: '#ffffff',
              padding: '12px 18px',
              borderRadius: '10px',
              display: 'inline-block',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
            }}>
              <img
                src="/alliedpowerlogo-removebg-preview.png"
                alt="Allied Power Industrial Company"
                style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '23px', marginBottom: '14px' }}>
              <strong>Allied Power Industrial Company</strong> is Saudi Arabia’s premier stocking distributor of certified Raychem cable terminations, Appleton &amp; Crouse-Hinds explosion-proof fittings, BURNDY compression lugs, and SEICO earthing systems.
            </p>

            <div style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#86efac',
              marginBottom: '12px',
              lineHeight: '19px'
            }}>
              <div>Saudi Aramco Vendor Code: <strong style={{ color: '#ffffff' }}>10121504</strong></div>
              <div>Saudi Electric Vendor Code: <strong style={{ color: '#ffffff' }}>0002017931</strong></div>
            </div>

            {/* Address Tag */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 104, 55, 0.2)',
              border: '1px solid rgba(0, 184, 98, 0.4)',
              color: '#86efac',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '50px'
            }}>
              <i className="bi bi-geo-alt-fill" style={{ color: '#00b862' }}></i>
              <span>Prince Naif Street, Cross 13, Al Khobar 34428, KSA</span>
            </div>

            {/* Social Media Channels (Configurable from /admin) */}
            <div style={{ marginTop: '22px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#cbd5e1',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'block',
                marginBottom: '10px'
              }}>
                Official Channels &amp; Network:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SOCIAL_PLATFORMS.map((platform) => {
                  const url = socialLinks[platform.id];
                  if (!url) return null;
                  return (
                    <a
                      key={platform.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${platform.name} — Allied Power Industrial Company`}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#006837';
                        e.currentTarget.style.borderColor = '#00b862';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 104, 55, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <i className={`bi ${platform.icon}`}></i>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Material Portfolio */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              position: 'relative',
              paddingBottom: '8px'
            }}>
              Material Portfolio
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '2px', backgroundColor: 'var(--color-green)' }}></span>
            </h4>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              {ALLIED_CATEGORIES.map((cat, idx) => (
                <li key={idx}>
                  <a
                    href="/products"
                    onClick={(e) => { e.preventDefault(); openProductsCatalogPage({ category: cat }); }}
                    style={{
                      color: '#94a3b8',
                      transition: 'color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#00b862'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <i className="bi bi-chevron-right" style={{ fontSize: '10px', color: 'var(--color-green)' }}></i>
                    <span>{cat}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Corporate Links */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              position: 'relative',
              paddingBottom: '8px'
            }}>
              Corporate Links
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '2px', backgroundColor: 'var(--color-red)' }}></span>
            </h4>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px' }}>
              <li>
                <a href="#certifications" onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); }} style={{ color: '#4ade80', fontWeight: 700 }}>
                  &bull; Saudi Aramco Approval Letter (#10121504)
                </a>
              </li>
              <li>
                <a href="/products" onClick={(e) => { e.preventDefault(); openProductsCatalogPage({ category: 'All' }); }} style={{ color: '#4ade80', fontWeight: 700 }}>
                  &bull; All Products Catalog Page (/products)
                </a>
              </li>
              <li>
                <a href="#welcome" onClick={(e) => { e.preventDefault(); scrollToSection('welcome'); }} style={{ color: '#cbd5e1' }}>
                  &bull; About Allied Power Industrial Company
                </a>
              </li>
              <li>
                <a href="#brands" onClick={(e) => { e.preventDefault(); scrollToSection('brands'); }} style={{ color: '#cbd5e1' }}>
                  &bull; Authorized OEM Brands (Raychem, Appleton)
                </a>
              </li>
              <li>
                <a href="#offerings" onClick={(e) => { e.preventDefault(); scrollToSection('offerings'); }} style={{ color: '#cbd5e1' }}>
                  &bull; Turnkey Material Services
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} style={{ color: '#cbd5e1' }}>
                  &bull; Request Formal Quotation (RFQ)
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  onClick={(e) => { e.preventDefault(); navigateToRoute('admin'); }}
                  style={{
                    color: '#4ade80',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="bi bi-shield-lock-fill"></i>
                  <span>Enterprise Admin Console (/admin)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Sales Representative & Headquarters Card */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              position: 'relative',
              paddingBottom: '8px'
            }}>
              Headquarters &amp; Sales
              <span style={{ position: 'absolute', bottom: 0, left: 0, width: '32px', height: '2px', backgroundColor: 'var(--color-green)' }}></span>
            </h4>

            <div style={{
              backgroundColor: '#0a121c',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderLeft: '4px solid var(--color-green)',
              borderRadius: '12px',
              padding: '18px 20px',
              fontSize: '13px',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-green-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Allied Power Industrial Company
                </span>
                <strong style={{ fontSize: '15px', color: '#ffffff', display: 'block', marginTop: '2px' }}>
                  Farzand Naeem (Sales Manager)
                </strong>
              </div>

              <div>
                <i className="bi bi-telephone-fill" style={{ color: 'var(--color-green-light)', marginRight: '8px' }}></i>
                <a href="tel:+966534017242" style={{ color: '#ffffff', fontWeight: 700 }}>+966 53 401 7242</a>
              </div>

              <div>
                <i className="bi bi-envelope-fill" style={{ color: 'var(--color-green-light)', marginRight: '8px' }}></i>
                <a href="mailto:farzand@alliedpowerindustrial.com" style={{ color: '#93c5fd' }}>farzand@alliedpowerindustrial.com</a>
              </div>

              <div>
                <i className="bi bi-geo-alt-fill" style={{ color: 'var(--color-green-light)', marginRight: '8px' }}></i>
                <span>Prince Naif Street, Cross 13, Al Khobar 34428, KSA</span>
              </div>

              <div>
                <i className="bi bi-clock-fill" style={{ color: 'var(--color-green-light)', marginRight: '8px' }}></i>
                <span>Sat &ndash; Thu: 08:00 AM &ndash; 07:30 PM (Friday Off)</span>
              </div>

              <div style={{ paddingTop: '6px' }}>
                <a
                  href="https://wa.me/966534017242?text=Hello%20Mr.%20Farzand%20Naeem,%20I%20am%20contacting%20you%20regarding%20Allied%20Power%20Industrial%20Company%20materials."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#25d366',
                    color: '#ffffff',
                    padding: '9px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}
                >
                  <i className="bi bi-whatsapp"></i> Chat with Sales Manager
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Legal & Compliance Strip */}
        <div style={{
          backgroundColor: '#04070b',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '22px 30px'
        }}>
          <div
            className="footer-bottom-bar"
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '12px',
              color: '#94a3b8'
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} Allied Power Industrial Company. All Rights Reserved. &bull; Aramco Vendor: <strong style={{ color: '#86efac' }}>10121504</strong> &bull; SEC Vendor: <strong style={{ color: '#fca5a5' }}>0002017931</strong> &bull; CR: 7054403162 &bull; VAT: 314807049800003
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Quick Social Channels */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {SOCIAL_PLATFORMS.map((platform) => {
                  const url = socialLinks[platform.id];
                  if (!url) return null;
                  return (
                    <a
                      key={platform.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={platform.name}
                      style={{
                        color: '#94a3b8',
                        fontSize: '14px',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease, transform 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#00b862'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <i className={`bi ${platform.icon}`}></i>
                    </a>
                  );
                })}
              </div>

              <div>
                Developed by{' '}
                <a
                  href="https://devolopy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                    paddingBottom: '1px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#00b862'; e.currentTarget.style.borderBottomColor = '#00b862'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderBottomColor = 'rgba(255, 255, 255, 0.3)'; }}
                >
                  Devolopy (devolopy.com)
                </a>
              </div>

              <span style={{ color: '#00b862', fontWeight: 700 }}>
                <i className="bi bi-patch-check-fill" style={{ marginRight: '6px' }}></i>
                Fast delivery all over the Kingdom of Saudi Arabia
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================
          13. FLOATING ACTION BUTTONS
          ======================================================== */}
      {/* 1. Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        style={{
          position: 'fixed',
          bottom: '95px',
          right: '25px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: '2px solid var(--color-green)',
          borderRadius: '50px',
          padding: '12px 22px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '14px',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <i className="bi bi-cart-check-fill" style={{ fontSize: '18px', color: 'var(--color-green-light)' }}></i>
        <span>RFQ List</span>
        {totalCartCount > 0 && (
          <span className="nav-counter-pill">
            {totalCartCount}
          </span>
        )}
      </button>

      {/* 2. Floating WhatsApp Button */}
      <a
        href="https://wa.me/966534017242?text=Hello%20Mr.%20Farzand%20Naeem,%20I%20am%20contacting%20Allied%20Power%20Industrial%20Company%20regarding%20materials."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          backgroundColor: '#25d366',
          color: '#ffffff',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          zIndex: 9998,
          fontSize: '30px',
          textDecoration: 'none',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        title="Direct WhatsApp with Sales Manager Farzand Naeem"
      >
        <i className="bi bi-whatsapp"></i>
      </a>

      {/* 3. Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '165px',
            right: '25px',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 9998,
            fontSize: '18px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--color-green)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
          title="Back to Top"
        >
          <i className="bi bi-chevron-up"></i>
        </button>
      )}

      {/* ========================================================
          14. MODALS & DRAWERS
          ======================================================== */}
      {/* Full-Screen Saudi Aramco Approval Letter Lightbox Modal */}
      {showAramcoLetterModal && (
        <div
          onClick={() => setShowAramcoLetterModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(6, 11, 17, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 100010,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.65)',
              border: '2px solid #00b862'
            }}
          >
            <div style={{
              backgroundColor: '#0a121c',
              color: '#ffffff',
              padding: '14px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #00b862',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <strong style={{ fontSize: '15px', display: 'block', color: '#ffffff' }}>
                  <i className="bi bi-patch-check-fill" style={{ color: '#4ade80', marginRight: '8px' }}></i>
                  Saudi Aramco Approval Letter &mdash; Allied Power Industrial Company
                </strong>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Aramco Vendor Code: <strong style={{ color: '#4ade80' }}>10121504</strong> &bull; E-Reference No. 0020679 &bull; CR: 7054403162
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href="/Saudi_Aramco_Approval_Letter.pdf"
                  download="Allied_Power_Industrial_Company_Saudi_Aramco_Approval_Letter_10121504.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#006837',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="bi bi-download"></i> Download PDF
                </a>

                <button
                  onClick={() => setShowAramcoLetterModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
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
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', backgroundColor: '#f1f5f9', textAlign: 'center' }}>
              <img
                src="/aramco_approval_letter.png"
                alt="Saudi Aramco Approval Letter - Allied Power Industrial Company"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                  margin: '0 auto',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lazy-Loaded Interactive Modals & Drawers */}
      <Suspense fallback={null}>
        {/* Product Quick View Modal */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* RFQ Cart Drawer */}
        {isCartOpen && (
          <RfqDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onViewRfqDocument={(doc) => {
              setIsCartOpen(false);
              setViewingRfqDoc(doc);
            }}
          />
        )}

        {/* Official RFQ Document Viewer Modal (Print / Download PDF) */}
        {viewingRfqDoc && (
          <RfqDocumentModal
            rfq={viewingRfqDoc}
            onClose={() => setViewingRfqDoc(null)}
          />
        )}
      </Suspense>
    </div>
  );
}
