import React, { useState, useEffect } from 'react';
import { ALLIED_PRODUCTS, ALLIED_CATEGORIES, ALLIED_BRANDS } from './data/alliedProducts';
import { getCatalogProducts } from './utils/productStorage';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, formatFullPhoneNumber } from './utils/countryCodes';
import { getStoredSocialLinks, SOCIAL_PLATFORMS } from './utils/socialStorage';
import CatalogSection from './components/CatalogSection';
import ProductModal from './components/ProductModal';
import RfqDrawer from './components/RfqDrawer';
import RfqDocumentModal from './components/RfqDocumentModal';
import AdminApp from './admin/AdminApp';

export default function App() {
  // Navigation / Route Handling (Supports /admin & public site)
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/admin') || hash.includes('/admin')) {
        return 'admin';
      }
    }
    return 'site';
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [offeringPage, setOfferingPage] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Active Category state synced across Header Dropdown, SBU cards, and Catalog
  const [selectedCategory, setSelectedCategory] = useState('All');

  // RFQ Cart State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewingRfqDoc, setViewingRfqDoc] = useState(null);

  // Contact Form
  const [contactCountryCode, setContactCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [contactPhone, setContactPhone] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Social Media Links (synced with /admin General Settings)
  const [socialLinks, setSocialLinks] = useState(getStoredSocialLinks);

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

  // Handle URL changes & popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.startsWith('/admin') || hash.includes('/admin')) {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('site');
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
    setCurrentRoute(route);
    if (route === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleSelectCategoryAndScroll = (categoryName) => {
    setSelectedCategory(categoryName);
    scrollToSection('catalog');
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

  // Offerings tailored to Allied Power Industrial
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

  // Key Advantages of Allied Power Industrial
  const benefits = [
    {
      icon: '/assets/asset-031.png',
      title: 'Prompt Formal Quotations',
      desc: 'Allied Power Industrial ensures rapid quotation turnaround led by Farzand Naeem and our technical sales team to meet critical project procurement deadlines and bidding requirements.',
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
      desc: 'Every item supplied is accompanied by manufacturer certificates of conformity, factory test reports, and compliance documentation satisfying Saudi Aramco, SABIC, and SEC audits.',
    },
    {
      icon: '/assets/asset-035.png',
      title: 'Flexible Commercial Terms',
      desc: 'We support leading EPC contractors, industrial facilities, and maintenance operators with transparent commercial terms, verified ZATCA electronic invoicing, and dedicated account management.',
    },
    {
      icon: '/assets/asset-036.png',
      title: 'Kingdom Vision 2030 Support',
      desc: 'Allied Power Industrial actively strengthens the Kingdom’s industrial supply chain infrastructure, supporting national manufacturing and localization initiatives.',
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
      <AdminApp
        onBackToSite={() => navigateToRoute('site')}
      />
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
              <span>P.O. Box 937, Al-Khobar 31952, Saudi Arabia</span>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="top-utility-badge">
              <i className="bi bi-patch-check-fill"></i> Saudi Aramco &amp; SABIC Spec Compliant
            </span>
            <span style={{ color: '#94a3b8', fontSize: '11px' }} className="d-none d-lg-inline-block">
              <i className="bi bi-clock"></i> Sat-Thu: 08:00 AM – 07:30 PM
            </span>
          </div>
        </div>

        {/* Main Glassmorphic Navigation Bar */}
        <div className="main-nav-bar">
          {/* Logo with official transparent branding */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
              <img
                src="/alliedpowerlogo-removebg-preview.png"
                alt="Allied Power Industrial Company"
                style={{
                  height: isScrolled ? '46px' : '54px',
                  width: 'auto',
                  objectFit: 'contain',
                  transition: 'height 0.25s ease'
                }}
              />
            </a>
          </div>

          {/* Desktop Navigation Links (No 134 next to products) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="d-none d-lg-flex">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="nav-link-item"
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

            {/* Direct Catalog Link without 134 text */}
            <a
              href="#catalog"
              onClick={(e) => { e.preventDefault(); handleSelectCategoryAndScroll('All'); }}
              className="nav-link-item"
              style={{ fontWeight: 700 }}
            >
              <span>Products Catalog</span>
            </a>

            {/* Categories Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setActiveDropdown('categories')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href="#catalog"
                onClick={(e) => { e.preventDefault(); scrollToSection('catalog'); }}
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
                      onClick={() => handleSelectCategoryAndScroll(cat)}
                    >
                      <span>{cat}</span>
                      <i className="bi bi-arrow-right-short" style={{ color: 'var(--color-green)', fontSize: '16px' }}></i>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
                    <div
                      className="nav-dropdown-item"
                      onClick={() => handleSelectCategoryAndScroll('All')}
                      style={{ fontWeight: 700, color: 'var(--color-green)' }}
                    >
                      <span>View Full Catalog</span>
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
              href="#offerings"
              onClick={(e) => { e.preventDefault(); scrollToSection('offerings'); }}
              className="nav-link-item"
            >
              Services
            </a>

            <a
              href="#markets"
              onClick={(e) => { e.preventDefault(); scrollToSection('markets'); }}
              className="nav-link-item"
            >
              Sectors
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
              href="https://wa.me/966534017242?text=Hello%20Allied%20Power%20Industrial,%20I%20would%20like%20to%20request%20a%20quotation%20for%20materials."
              target="_blank"
              rel="noopener noreferrer"
              className="header-whatsapp-btn"
            >
              <i className="bi bi-whatsapp"></i>
              <span>+966 53 401 7242</span>
            </a>
          </nav>

          {/* Mobile Right Action Group */}
          <div style={{ display: 'none' }} className="d-flex d-lg-none align-items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="header-rfq-btn"
              style={{ padding: '6px 12px' }}
            >
              <i className="bi bi-cart3"></i>
              {totalCartCount > 0 && (
                <span className="nav-counter-pill">{totalCartCount}</span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                color: 'var(--color-black)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
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
            padding: '24px',
            borderBottom: '3px solid var(--color-green)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li>
                <a
                  href="#welcome"
                  onClick={(e) => { e.preventDefault(); scrollToSection('welcome'); }}
                  style={{ fontWeight: 600, color: 'var(--color-black)', fontSize: '15px' }}
                >
                  About Allied Power Industrial
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  onClick={(e) => { e.preventDefault(); handleSelectCategoryAndScroll('All'); }}
                  style={{ color: 'var(--color-green)', fontWeight: 700, fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Products Catalog</span>
                  <i className="bi bi-arrow-right"></i>
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
                      href="#catalog"
                      onClick={(e) => { e.preventDefault(); handleSelectCategoryAndScroll(cat); }}
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
                  href="https://wa.me/966534017242?text=Hello%20Allied%20Power%20Industrial,%20I%20would%20like%20to%20inquire%20about%20materials."
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
          2. ULTRA-PREMIUM CINEMATIC HERO SLIDER
          (Zero ghost or baked-in text - clean industrial night visuals)
          ======================================================== */}
      <section className="hero-clean-section">
        {/* Slide 1 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: currentSlide === 0 ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          zIndex: currentSlide === 0 ? 1 : 0
        }}>
          <img
            src="/assets/refinery-night-real.jpg"
            alt="Allied Power Industrial Facilities"
            className="hero-slide-bg"
          />
          <div className="hero-overlay-cinematic">
            <div style={{ maxWidth: '780px', color: '#ffffff' }}>
              <div className="hero-pill-tag">
                <i className="bi bi-shield-check" style={{ color: 'var(--color-green-light)', fontSize: '14px' }}></i>
                <span>Kingdom of Saudi Arabia</span>
                <span className="badge-red">&bull;</span>
                <span>Al-Khobar Headquarters</span>
              </div>

              <h1 className="hero-clean-title">
                POWERING INDUSTRY.<br />
                <span style={{ color: '#00b862' }}>DELIVERING RELIABILITY.</span>
              </h1>

              <p className="hero-clean-subtitle">
                Allied Power Industrial Company is Saudi Arabia’s premier stocking distributor of certified Raychem cable terminations, Appleton &amp; Crouse-Hinds explosion-proof fittings, BURNDY compression lugs, and SEICO earthing systems.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => scrollToSection('catalog')}
                  className="btn-primary-green"
                >
                  <i className="bi bi-grid-3x3-gap-fill"></i> Browse Products Catalog
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="btn-primary-red"
                >
                  <i className="bi bi-file-earmark-text-fill"></i> Request Instant RFQ
                </button>

                <a
                  href="https://wa.me/966534017242?text=Hello%20Allied%20Power%20Industrial,%20I%20would%20like%20to%20inquire%20about%20materials."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-white"
                >
                  <i className="bi bi-whatsapp"></i> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: currentSlide === 1 ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          zIndex: currentSlide === 1 ? 1 : 0
        }}>
          <img
            src="/assets/hero-industrial-clean.jpg"
            alt="Industrial Electrical Materials Stock"
            className="hero-slide-bg"
          />
          <div className="hero-overlay-cinematic">
            <div style={{ maxWidth: '780px', color: '#ffffff' }}>
              <div className="hero-pill-tag">
                <i className="bi bi-patch-check-fill" style={{ color: '#ff4757', fontSize: '14px' }}></i>
                <span>Saudi Aramco, SABIC &amp; SEC Standards</span>
                <span className="badge-red">&bull;</span>
                <span>Ready Stock In Al-Khobar</span>
              </div>

              <h1 className="hero-clean-title">
                CERTIFIED INDUSTRIAL<br />
                <span style={{ color: '#ff4757' }}>ELECTRICAL SUPPLIES</span>
              </h1>

              <p className="hero-clean-subtitle">
                Supplying factory-tested electrical equipment with complete Mill Test Certificates (MTC), origin documentation, and hazardous area compliance (UL, ATEX, IECEx) for mega-infrastructure projects across the Kingdom.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => scrollToSection('catalog')}
                  className="btn-primary-green"
                >
                  <i className="bi bi-box-seam-fill"></i> Explore In-Stock Inventory
                </button>

                <button
                  onClick={() => scrollToSection('contact')}
                  className="btn-primary-red"
                >
                  <i className="bi bi-send-fill"></i> Submit Project Inquiries
                </button>

                <button
                  onClick={() => scrollToSection('brands')}
                  className="btn-outline-white"
                >
                  <i className="bi bi-award-fill"></i> Authorized Brands
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. ULTRA-PREMIUM STATS STRIP
          (Emerald Green & Vibrant Red Key Metrics)
          ======================================================== */}
      <section className="ultra-stats-strip">
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          <div className="stats-card-premium">
            <div className="stats-number-green">134+</div>
            <div className="stats-title-white">Active Catalog Materials</div>
            <div className="stats-desc-subtle">Direct pricing in SAR &bull; Ready stock</div>
          </div>

          <div className="stats-card-premium">
            <div className="stats-number-red">10+</div>
            <div className="stats-title-white">Global Tier-1 OEM Brands</div>
            <div className="stats-desc-subtle">Raychem &bull; Appleton &bull; BURNDY &bull; SEICO</div>
          </div>

          <div className="stats-card-premium">
            <div className="stats-number-green">100%</div>
            <div className="stats-title-white">Factory Test Certificates</div>
            <div className="stats-desc-subtle">Full MTC &bull; Aramco 9COM specifications</div>
          </div>

          <div className="stats-card-premium">
            <div className="stats-number-red">24h</div>
            <div className="stats-title-white">Kingdom-Wide Fast Delivery</div>
            <div className="stats-desc-subtle">Fast delivery all over the Kingdom</div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. EXECUTIVE ABOUT SECTION
          (Clean Corporate Profile with Saudi Vision 2030 Credentials)
          ======================================================== */}
      <section id="welcome" className="about-executive-section">
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '50px',
          alignItems: 'center'
        }}>
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
              <i className="bi bi-building-check"></i> Eastern Province Stockist &amp; Distributor
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
              Headquartered in Al-Khobar, Saudi Arabia, <strong>Allied Power Industrial (APCO)</strong> is an established supplier of specialized electrical, mechanical, and industrial instrumentation materials. We support major EPC contractors, industrial operators, and maintenance contractors executing high-spec projects across the Kingdom.
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '30px'
            }}>
              <div className="about-feature-box">
                <i className="bi bi-shield-fill-check" style={{ fontSize: '22px', color: 'var(--color-green)', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-black)' }}>Saudi Aramco Standards</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Materials fully compliant with Aramco 9COM specifications</span>
                </div>
              </div>

              <div className="about-feature-box">
                <i className="bi bi-geo-alt-fill" style={{ fontSize: '22px', color: 'var(--color-red)', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-black)' }}>Central Al-Khobar Hub</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Fast delivery all over the Kingdom</span>
                </div>
              </div>

              <div className="about-feature-box">
                <i className="bi bi-award-fill" style={{ fontSize: '22px', color: 'var(--color-green)', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-black)' }}>Tier-1 Global OEM Lines</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Raychem, Appleton, Crouse-Hinds, BURNDY, SEICO</span>
                </div>
              </div>

              <div className="about-feature-box">
                <i className="bi bi-receipt-cutoff" style={{ fontSize: '22px', color: 'var(--color-red)', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-black)' }}>ZATCA Compliant Invoicing</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Transparent electronic billing &amp; flexible contractor terms</span>
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
                onClick={() => scrollToSection('contact')}
                className="btn-primary-red"
              >
                Contact Sales Manager <i className="bi bi-person-lines-fill"></i>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Headquarters:</span>
                  <strong style={{ color: 'var(--color-black)' }}>Al-Khobar 31952, KSA</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Warehouse Hub:</span>
                  <strong style={{ color: 'var(--color-green)' }}>Eastern Province Main Facility</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Catalog Inventory:</span>
                  <strong style={{ color: 'var(--color-red)' }}>Direct Factory Stock in SAR</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
          5. COMPLETE PRODUCTS CATALOG
          (Fully synchronized category pills, SAR prices, modals)
          ======================================================== */}
      <CatalogSection
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => setSelectedCategory(cat)}
        onSelectProduct={(product) => setSelectedProduct(product)}
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
                onClick={() => handleSelectCategoryAndScroll(b.category)}
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

              {/* Boldly Visible Allied Power Material Services Heading */}
              <h2 style={{ color: '#ffffff', fontSize: '38px', fontWeight: 800, margin: '6px 0 0', letterSpacing: '-0.02em' }}>
                Allied Power <span style={{ color: '#00b862' }}>Material Services</span>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
          8. BENEFITS / WHY ALLIED POWER INDUSTRIAL
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
                onClick={() => handleSelectCategoryAndScroll(item.name)}
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
                    Al-Khobar Stock &bull; Filter
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
                Connect with Allied Power Industrial
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
                  Designated Sales Contact
                </span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-black)', margin: '4px 0' }}>
                  Farzand Naeem &mdash; Sales Manager
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
                    P.O. Box 937, Al-Khobar 31952, KSA
                  </span>
                </div>
              </div>

              <a
                href="https://wa.me/966534017242?text=Hello%20Mr.%20Farzand%20Naeem,%20I%20am%20contacting%20you%20regarding%20Allied%20Power%20Industrial%20materials."
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
                Thank you! Your inquiry has been sent directly to Allied Power Industrial Sales Team. We will revert with a formal quotation within 24 hours.
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

      {/* ========================================================
          12. ULTRA-PREMIUM FOOTER
          (Official Logo, Quick Links, Contacts, Kingdom Vision, Admin Link)
          ======================================================== */}
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
              <span>Saudi Aramco 9COM Specifications</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#bae6fd', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-patch-check-fill" style={{ fontSize: '18px', color: '#38bdf8' }}></i>
              <span>SABIC Approved Industrial Supplier</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde68a', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-truck" style={{ fontSize: '18px', color: '#fbbf24' }}></i>
              <span>Fast Delivery All Over the Kingdom</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-receipt" style={{ fontSize: '18px', color: '#ff4757' }}></i>
              <span>ZATCA Phase-2 Tax E-Invoicing</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d8b4fe', fontSize: '13px', fontWeight: 700 }}>
              <i className="bi bi-award-fill" style={{ fontSize: '18px', color: '#c084fc' }}></i>
              <span>100% Genuine Factory Test Certs (MTC)</span>
            </div>
          </div>
        </div>

        {/* Main Footer Body */}
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '65px 30px 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px'
        }}>
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

            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '23px', marginBottom: '18px' }}>
              Allied Power Industrial Company (APCO) is Saudi Arabia’s premier stocking distributor of certified Raychem cable terminations, Appleton &amp; Crouse-Hinds explosion-proof fittings, BURNDY compression lugs, and SEICO earthing systems.
            </p>

            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#cbd5e1',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              Powering Industry &bull; Driving Progress &bull; Delivering Reliability
            </div>

            {/* Saudi Vision 2030 / Saudi Made Miniature Tag */}
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
              <span>Headquarters: Al-Khobar &bull; Fast Delivery All Over the Kingdom</span>
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
                      title={`${platform.name} — Allied Power Industrial`}
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
                    href="#catalog"
                    onClick={(e) => { e.preventDefault(); handleSelectCategoryAndScroll(cat); }}
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
                <a href="#catalog" onClick={(e) => { e.preventDefault(); handleSelectCategoryAndScroll('All'); }} style={{ color: '#cbd5e1' }}>
                  &bull; Products Catalog (SAR)
                </a>
              </li>
              <li>
                <a href="#welcome" onClick={(e) => { e.preventDefault(); scrollToSection('welcome'); }} style={{ color: '#cbd5e1' }}>
                  &bull; Logistics Hub &amp; About Us
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
                <a href="#markets" onClick={(e) => { e.preventDefault(); scrollToSection('markets'); }} style={{ color: '#cbd5e1' }}>
                  &bull; Industrial Sectors Served
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
                  Designated Sales Manager
                </span>
                <strong style={{ fontSize: '15px', color: '#ffffff', display: 'block', marginTop: '2px' }}>
                  Farzand Naeem
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
                <span>P.O. Box 937, Prince Humud St, Al-Khobar 31952, KSA</span>
              </div>

              <div>
                <i className="bi bi-clock-fill" style={{ color: 'var(--color-green-light)', marginRight: '8px' }}></i>
                <span>Sat &ndash; Thu: 08:00 AM &ndash; 07:30 PM (Friday Off)</span>
              </div>

              <div style={{ paddingTop: '6px' }}>
                <a
                  href="https://wa.me/966534017242?text=Hello%20Mr.%20Farzand%20Naeem,%20I%20am%20contacting%20you%20regarding%20Allied%20Power%20Industrial%20materials."
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
          <div style={{
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            <div>
              &copy; {new Date().getFullYear()} Allied Power Industrial Company. All Rights Reserved. &bull; CR: 2051061937 &bull; VAT: 310294829100003
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
        href="https://wa.me/966534017242?text=Hello%20Mr.%20Farzand%20Naeem,%20I%20am%20contacting%20Allied%20Power%20Industrial%20regarding%20materials."
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
      {/* Product Quick View Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* RFQ Cart Drawer */}
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

      {/* Official RFQ Document Viewer Modal (Print / Download PDF) */}
      {viewingRfqDoc && (
        <RfqDocumentModal
          rfq={viewingRfqDoc}
          onClose={() => setViewingRfqDoc(null)}
        />
      )}
    </div>
  );
}
