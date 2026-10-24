// Product Catalog Storage & CRUD Manager
import { ALLIED_PRODUCTS, ALLIED_CATEGORIES, ALLIED_BRANDS } from '../data/alliedProducts';

const PRODUCTS_STORAGE_KEY = 'allied_custom_products';

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '/wp-content/uploads/2024/09/RAYCHEM.png';
  return url.replace(/^https?:\/\/(www\.)?alliedpowerindustrial\.com\/wp-content\/uploads\//i, '/wp-content/uploads/');
}

function normalizeProductItem(item) {
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    image: normalizeImageUrl(item.image),
    images: Array.isArray(item.images) ? item.images.map(normalizeImageUrl) : [normalizeImageUrl(item.image)],
  };
}

export function getCatalogProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      return ALLIED_PRODUCTS.map(normalizeProductItem);
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure existing cached products have full descriptions and normalized local image paths
      return parsed.map(rawItem => {
        const item = normalizeProductItem(rawItem);
        const base = ALLIED_PRODUCTS.find(p => p.sku === item.sku || p.id === item.id);
        if (base) {
          return {
            ...item,
            name: base.name || item.name,
            image: item.image || normalizeImageUrl(base.image),
            images: (item.images && item.images.length > 0) ? item.images : (base.images || [base.image]).map(normalizeImageUrl),
            description: (item.description && item.description.trim()) ? item.description : base.description,
            fullDescription: (item.fullDescription && item.fullDescription.trim()) ? item.fullDescription : base.fullDescription,
            features: (item.features && item.features.length > 0) ? item.features : base.features,
            category: item.category || base.category
          };
        }
        return item;
      });
    }
    return ALLIED_PRODUCTS.map(normalizeProductItem);
  } catch (err) {
    console.error('Error reading products from localStorage:', err);
    return ALLIED_PRODUCTS.map(normalizeProductItem);
  }
}

export function saveCatalogProducts(products, skipServerSync = false) {
  try {
    const normalized = Array.isArray(products) ? products.map(normalizeProductItem) : products;
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(normalized));
    // Dispatch custom event so public catalog components update immediately
    window.dispatchEvent(new Event('allied_products_updated'));

    if (!skipServerSync && typeof fetch !== 'undefined') {
      fetch('/api.php?action=save_products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: normalized })
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.ok && Array.isArray(data.products)) {
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data.products.map(normalizeProductItem)));
            window.dispatchEvent(new Event('allied_products_updated'));
          }
        })
        .catch(() => {
          // Silent fallback on static hosts like Vercel where PHP is not active
        });
    }
    return true;
  } catch (err) {
    console.error('Error saving products:', err);
    return false;
  }
}

export async function syncServerDatabase() {
  if (typeof fetch === 'undefined') return;
  try {
    const res = await fetch('/api.php?action=sync', { cache: 'no-store' });
    if (!res.ok) return;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return;
    const data = await res.json();
    if (!data || !data.ok) return;

    if (Array.isArray(data.products) && data.products.length > 0) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data.products.map(normalizeProductItem)));
      window.dispatchEvent(new Event('allied_products_updated'));
    }
    if (Array.isArray(data.rfqs) && data.rfqs.length > 0) {
      localStorage.setItem('allied_rfq_records', JSON.stringify(data.rfqs));
      window.dispatchEvent(new Event('allied_rfqs_updated'));
    }
    if (data.social && typeof data.social === 'object') {
      localStorage.setItem('allied_social_links', JSON.stringify(data.social));
      window.dispatchEvent(new Event('allied_social_updated'));
    }
    if (data.settings && typeof data.settings === 'object') {
      localStorage.setItem('allied_general_settings', JSON.stringify(data.settings));
    }
  } catch {
    // Graceful fallback when running offline or on static host
  }
}

export function addCatalogProduct(newProductData) {
  const current = getCatalogProducts();
  const newId = Date.now();
  const newSku = newProductData.sku || `API-${Math.floor(1000 + Math.random() * 9000)}`;

  const created = {
    id: newId,
    name: newProductData.name || 'New Industrial Material',
    slug: (newProductData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    sku: newSku,
    brand: newProductData.brand || 'Allied Power',
    category: newProductData.category || ALLIED_CATEGORIES[0],
    price: parseFloat(newProductData.price) || 0,
    currency: 'SAR',
    inStock: newProductData.inStock !== false,
    image: normalizeImageUrl(newProductData.image || '/wp-content/uploads/2025/09/s-l400.png'),
    images: newProductData.images && newProductData.images.length > 0 ? newProductData.images.map(normalizeImageUrl) : [normalizeImageUrl(newProductData.image || '/wp-content/uploads/2025/09/s-l400.png')],
    description: newProductData.description || 'Certified industrial equipment conforming to Saudi standards.',
    fullDescription: newProductData.fullDescription || newProductData.description || 'Full technical specifications available upon quotation.',
    features: newProductData.features && newProductData.features.length > 0 ? newProductData.features : [
      'Saudi Aramco 9COM compliant',
      'Factory Test Certificate (MTC) included',
      'High corrosion resistance'
    ],
    permalink: '#'
  };

  const updated = [created, ...current];
  saveCatalogProducts(updated);
  return created;
}

export function updateCatalogProduct(id, updatedFields) {
  const current = getCatalogProducts();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updatedFields,
        price: updatedFields.price !== undefined ? parseFloat(updatedFields.price) : item.price
      };
    }
    return item;
  });
  saveCatalogProducts(updated);
  return updated;
}

export function deleteCatalogProduct(id) {
  const current = getCatalogProducts();
  const updated = current.filter(item => item.id !== id);
  saveCatalogProducts(updated);
  return updated;
}

export function resetCatalogToDefault() {
  try {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    window.dispatchEvent(new Event('allied_products_updated'));
    if (typeof fetch !== 'undefined') {
      fetch('/api.php?action=save_products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true })
      }).catch(() => {});
    }
    return ALLIED_PRODUCTS;
  } catch (err) {
    console.error('Error resetting catalog:', err);
    return ALLIED_PRODUCTS;
  }
}
