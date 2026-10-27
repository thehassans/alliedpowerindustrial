// Dedicated SEO Engine for Allied Power Industrial Company
// Manages per-product SEO titles, meta descriptions, keywords, OpenGraph, Canonical URLs, and Google Rich Snippet JSON-LD Schema

const SITE_URL = 'https://alliedpowerindustrial.com';
const COMPANY_NAME = 'Allied Power Industrial Company';
const DEFAULT_LOGO = `${SITE_URL}/alliedpowerlogo-removebg-preview.png`;

export function getProductSlug(product) {
  if (!product) return '';
  if (product.slug && typeof product.slug === 'string' && product.slug.trim()) {
    return product.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  }
  const base = `${product.name || 'product'}-${product.sku || product.id || ''}`;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProductUrl(product) {
  return `/product/${getProductSlug(product)}`;
}

export function findProductBySlug(products, slugOrId) {
  if (!slugOrId || !Array.isArray(products)) return null;
  const decoded = decodeURIComponent(String(slugOrId))
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '');

  return (
    products.find(p => getProductSlug(p) === decoded) ||
    products.find(p => String(p.sku || '').toLowerCase() === decoded) ||
    products.find(p => String(p.id) === decoded) ||
    null
  );
}

export function getAbsoluteImageUrl(imgPath) {
  if (!imgPath) return DEFAULT_LOGO;
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
  if (imgPath.startsWith('data:')) return DEFAULT_LOGO;
  return `${SITE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
}

export function buildProductSeoData(product) {
  const slug = getProductSlug(product);
  const canonical = `${SITE_URL}/product/${slug}`;
  const brand = product.brand || 'Allied Power';
  const sku = product.sku || `API-${product.id}`;
  const category = product.category || 'Industrial Electrical Supplies';
  const price = Number(product.price || 0).toFixed(2);
  const cleanDesc = (product.fullDescription || product.description || product.name || '')
    .replace(/\s+/g, ' ')
    .trim();

  const title = `${product.name} | ${brand} (${sku}) - ${COMPANY_NAME} Saudi Arabia`;
  const description = `${product.name} (${sku}) by ${brand}. Category: ${category}. Price: ${price} SAR. ${cleanDesc.slice(0, 140)} Supplied in Al Khobar & across Saudi Arabia by ${COMPANY_NAME} (Aramco Vendor #10121504 | SEC Vendor #0002017931).`;

  const keywords = [
    product.name,
    sku,
    brand,
    category,
    `${brand} Saudi Arabia`,
    `${sku} Al Khobar`,
    'Allied Power Industrial Company',
    'Saudi Aramco Vendor 10121504',
    'SEC Vendor 0002017931',
    'Industrial Electrical Supplies KSA',
    'Dammam',
    'Jubail',
    'Riyadh',
  ].join(', ');

  const imageUrl = getAbsoluteImageUrl(product.image);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${canonical}#product`,
        name: product.name,
        sku: sku,
        mpn: sku,
        image: [imageUrl],
        description: cleanDesc || description,
        category: category,
        brand: {
          '@type': 'Brand',
          name: brand,
        },
        offers: {
          '@type': 'Offer',
          url: canonical,
          priceCurrency: product.currency || 'SAR',
          price: price,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability:
            product.inStock === false
              ? 'https://schema.org/PreOrder'
              : 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: COMPANY_NAME,
            identifier: 'Aramco Vendor #10121504 | SEC Vendor #0002017931',
            telephone: '+966534017242',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Prince Naif Street, Cross 13',
              addressLocality: 'Al Khobar',
              postalCode: '34428',
              addressCountry: 'SA',
            },
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products Catalog',
            item: `${SITE_URL}/products`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category,
            item: `${SITE_URL}/products?category=${encodeURIComponent(category)}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.name,
            item: canonical,
          },
        ],
      },
    ],
  };

  return {
    title,
    description,
    keywords,
    canonical,
    ogType: 'product',
    image: imageUrl,
    jsonLd,
  };
}

export function buildCatalogSeoData({ category = 'All', brand = 'All', search = '', totalCount = 134 } = {}) {
  let titlePrefix = 'All Industrial Electrical & Mechanical Products Catalog';
  if (search) {
    titlePrefix = `Search Results for "${search}" - Industrial Materials`;
  } else if (category !== 'All' && brand !== 'All') {
    titlePrefix = `${brand} ${category} Catalog`;
  } else if (category !== 'All') {
    titlePrefix = `${category} - Certified Industrial Supplies`;
  } else if (brand !== 'All') {
    titlePrefix = `${brand} Authorized Industrial Products`;
  }

  const title = `${titlePrefix} (${totalCount} Items) | ${COMPANY_NAME} Saudi Arabia`;
  const description = `Browse ${totalCount} certified industrial electrical & mechanical products from ${COMPANY_NAME} in Al Khobar, KSA. Official Saudi Aramco Vendor (#10121504) & SEC Vendor (#0002017931). Authorized supplier of Raychem, Appleton, Crouse-Hinds, BURNDY, and SEICO.`;
  const canonical = `${SITE_URL}/products`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    provider: {
      '@type': 'Organization',
      name: COMPANY_NAME,
      url: SITE_URL,
      telephone: '+966534017242',
    },
  };

  return {
    title,
    description,
    keywords: 'Allied Power Industrial Company catalog, Raychem Saudi Arabia, Appleton plugs Al Khobar, Crouse-Hinds KSA, BURNDY lugs, SEICO exothermic mould, Aramco Vendor 10121504, SEC Vendor 0002017931',
    canonical,
    ogType: 'website',
    image: DEFAULT_LOGO,
    jsonLd,
  };
}

export function buildHomeSeoData() {
  const title = `${COMPANY_NAME} - Electrical & Industrial Material Supplies | Al Khobar, Saudi Arabia (Aramco Vendor #10121504)`;
  const description = `${COMPANY_NAME} is an approved Saudi Aramco Vendor (#10121504) & Saudi Electricity Company (SEC) Vendor (#0002017931) at Prince Naif Street, Cross 13, Al Khobar 34428, KSA. Stocking Raychem cable terminations, Appleton & Crouse-Hinds explosion-proof equipment, BURNDY lugs, and SEICO earthing systems.`;
  const canonical = `${SITE_URL}/`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY_NAME,
    url: SITE_URL,
    logo: DEFAULT_LOGO,
    telephone: '+966534017242',
    email: 'farzand@alliedpowerindustrial.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Prince Naif Street, Cross 13',
      addressLocality: 'Al Khobar',
      postalCode: '34428',
      addressCountry: 'SA',
    },
  };

  return {
    title,
    description,
    keywords: 'Allied Power Industrial Company, Aramco Vendor 10121504, SEC Vendor 0002017931, Electrical Supplies Al Khobar, Raychem Termination Kit KSA, Appleton Receptacles Saudi Arabia, BURNDY Compression Lugs, Crouse-Hinds Hazardous Area',
    canonical,
    ogType: 'website',
    image: DEFAULT_LOGO,
    jsonLd,
  };
}

function setOrCreateMeta(attrName, attrValue, content) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content || '');
}

export function applySeoMetadata(seo) {
  if (typeof document === 'undefined' || !seo) return;

  document.title = seo.title;

  setOrCreateMeta('name', 'description', seo.description);
  setOrCreateMeta('name', 'keywords', seo.keywords);
  setOrCreateMeta('name', 'robots', 'index, follow, max-image-preview:large');

  // OpenGraph
  setOrCreateMeta('property', 'og:title', seo.title);
  setOrCreateMeta('property', 'og:description', seo.description);
  setOrCreateMeta('property', 'og:url', seo.canonical);
  setOrCreateMeta('property', 'og:type', seo.ogType || 'website');
  setOrCreateMeta('property', 'og:image', seo.image || DEFAULT_LOGO);
  setOrCreateMeta('property', 'og:site_name', COMPANY_NAME);

  // Twitter Card
  setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
  setOrCreateMeta('name', 'twitter:title', seo.title);
  setOrCreateMeta('name', 'twitter:description', seo.description);
  setOrCreateMeta('name', 'twitter:image', seo.image || DEFAULT_LOGO);

  // Canonical link
  let canonicalEl = document.head.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', seo.canonical);

  // JSON-LD Structured Data
  let scriptEl = document.getElementById('allied-seo-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'allied-seo-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(seo.jsonLd);
}
