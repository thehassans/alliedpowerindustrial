// Product Catalog Storage & CRUD Manager
import { ALLIED_PRODUCTS, ALLIED_CATEGORIES, ALLIED_BRANDS } from '../data/alliedProducts';

const PRODUCTS_STORAGE_KEY = 'allied_custom_products';

export function getCatalogProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      return ALLIED_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure existing cached products have full descriptions from ALLIED_PRODUCTS if empty
      return parsed.map(item => {
        const base = ALLIED_PRODUCTS.find(p => p.sku === item.sku || p.id === item.id);
        if (base) {
          return {
            ...item,
            name: base.name || item.name,
            description: (item.description && item.description.trim()) ? item.description : base.description,
            fullDescription: (item.fullDescription && item.fullDescription.trim()) ? item.fullDescription : base.fullDescription,
            features: (item.features && item.features.length > 0) ? item.features : base.features,
            category: item.category || base.category
          };
        }
        return item;
      });
    }
    return ALLIED_PRODUCTS;
  } catch (err) {
    console.error('Error reading products from localStorage:', err);
    return ALLIED_PRODUCTS;
  }
}

export function saveCatalogProducts(products) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    // Dispatch custom event so public catalog components update immediately
    window.dispatchEvent(new Event('allied_products_updated'));
    return true;
  } catch (err) {
    console.error('Error saving products:', err);
    return false;
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
    image: newProductData.image || 'https://alliedpowerindustrial.com/wp-content/uploads/2025/09/s-l400.png',
    images: newProductData.images && newProductData.images.length > 0 ? newProductData.images : [newProductData.image || 'https://alliedpowerindustrial.com/wp-content/uploads/2025/09/s-l400.png'],
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
    return ALLIED_PRODUCTS;
  } catch (err) {
    console.error('Error resetting catalog:', err);
    return ALLIED_PRODUCTS;
  }
}
