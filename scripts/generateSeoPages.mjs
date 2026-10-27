import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALLIED_PRODUCTS } from '../src/data/alliedProducts.js';
import {
  getProductSlug,
  buildProductSeoData,
  buildCatalogSeoData,
  buildHomeSeoData,
} from '../src/utils/seoEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSeoHeadBlock(seoData) {
  const title = escapeHtml(seoData.title);
  const desc = escapeHtml(seoData.description);
  const keywords = escapeHtml(seoData.keywords || '');
  const canonical = escapeHtml(seoData.canonicalUrl || 'https://alliedpowerindustrial.com/');
  const ogImage = escapeHtml(seoData.ogImage || 'https://alliedpowerindustrial.com/alliedpowerlogo-removebg-preview.png');
  const ogType = escapeHtml(seoData.ogType || 'website');
  const jsonLdString = JSON.stringify(seoData.jsonLd || {});

  return `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="Allied Power Industrial Company" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script id="allied-seo-jsonld" type="application/ld+json">${jsonLdString}</script>`;
}

function injectSeoIntoHtml(baseHtml, seoData) {
  const withoutTitle = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  const headBlock = buildSeoHeadBlock(seoData);
  return withoutTitle.replace('</head>', `${headBlock}\n  </head>`);
}

function run() {
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  // 1. Update root dist/index.html with complete Home SEO metadata
  const homeSeo = buildHomeSeoData();
  fs.writeFileSync(indexHtmlPath, injectSeoIntoHtml(baseHtml, homeSeo), 'utf-8');

  // 2. Generate dist/products/index.html for the dedicated /products catalog page
  const catalogSeo = buildCatalogSeoData({ totalCount: ALLIED_PRODUCTS.length });
  const productsDir = path.join(distDir, 'products');
  fs.mkdirSync(productsDir, { recursive: true });
  fs.writeFileSync(
    path.join(productsDir, 'index.html'),
    injectSeoIntoHtml(baseHtml, catalogSeo),
    'utf-8'
  );

  // 3. Generate static SEO HTML pages for every single product: dist/product/<slug>/index.html
  let generatedCount = 0;
  const sitemapEntries = [];
  const today = new Date().toISOString().split('T')[0];

  sitemapEntries.push({
    loc: 'https://alliedpowerindustrial.com/',
    priority: '1.0',
    changefreq: 'daily',
    lastmod: today,
  });

  sitemapEntries.push({
    loc: 'https://alliedpowerindustrial.com/products',
    priority: '0.9',
    changefreq: 'daily',
    lastmod: today,
  });

  for (const product of ALLIED_PRODUCTS) {
    const slug = getProductSlug(product);
    if (!slug) continue;

    const productSeo = buildProductSeoData(product);
    const productPageDir = path.join(distDir, 'product', slug);
    fs.mkdirSync(productPageDir, { recursive: true });
    fs.writeFileSync(
      path.join(productPageDir, 'index.html'),
      injectSeoIntoHtml(baseHtml, productSeo),
      'utf-8'
    );
    generatedCount++;

    sitemapEntries.push({
      loc: `https://alliedpowerindustrial.com/product/${encodeURIComponent(slug)}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: today,
      image: productSeo.ogImage,
      imageTitle: product.name,
    });
  }

  // 4. Write dist/sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>${
      entry.image
        ? `
    <image:image>
      <image:loc>${escapeXml(entry.image)}</image:loc>
      <image:title>${escapeXml(entry.imageTitle || '')}</image:title>
    </image:image>`
        : ''
    }
  </url>`
  )
  .join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

  // 5. Write dist/robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://alliedpowerindustrial.com/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf-8');

  console.log(
    `[SEO Generator] Built ${generatedCount} static product SEO pages (/product/:slug), /products page, sitemap.xml (${sitemapEntries.length} URLs), and robots.txt.`
  );
}

run();
