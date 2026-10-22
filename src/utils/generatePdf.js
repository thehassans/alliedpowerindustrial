// Pure JavaScript Ultra-Minimalistic Professional PDF Generator for RFQs
// Generates standard PDF-1.4 binary blob with authentic APIC letterhead images
import { ALLIED_PRODUCTS } from '../data/alliedProducts.js';
import {
  APIC_HEADER_JPEG_BASE64,
  APIC_FOOTER_JPEG_BASE64,
  APIC_HEADER_DIMS,
  APIC_FOOTER_DIMS
} from './pdfLetterheadData.js';

function base64ToUint8Array(base64) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Escape special PDF characters: (, ), \
function escapePdfText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\)')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Keep printable ASCII
}

// Wrap text into clean lines without truncating words or adding '...'
function wrapText(str, maxCharsPerLine = 60) {
  if (!str) return [];
  const clean = escapePdfText(str).trim();
  if (!clean) return [];
  if (clean.length <= maxCharsPerLine) return [clean];

  const words = clean.split(/\s+/).filter(Boolean);
  const lines = [];
  let curLine = '';

  for (const word of words) {
    if (!curLine) {
      curLine = word;
    } else if ((curLine + ' ' + word).length <= maxCharsPerLine) {
      curLine += ' ' + word;
    } else {
      lines.push(curLine);
      curLine = word;
    }
  }
  if (curLine) lines.push(curLine);
  return lines;
}

export function generateRfqPdfBlob(rfq) {
  const dateStr = new Date(rfq.date || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const subtotal = rfq.subtotal !== undefined
    ? rfq.subtotal
    : (rfq.items || []).reduce((acc, it) => acc + (it.price * it.quantity), 0);

  // Optional VAT handling (default to true if not specified or if vat > 0)
  const includeVat = rfq.includeVat !== undefined
    ? rfq.includeVat
    : (rfq.vat !== undefined ? rfq.vat > 0 : true);

  const vat = includeVat
    ? (rfq.vat !== undefined ? rfq.vat : subtotal * 0.15)
    : 0;

  const total = rfq.total !== undefined
    ? rfq.total
    : (subtotal + vat);

  const headerBytes = base64ToUint8Array(APIC_HEADER_JPEG_BASE64);
  const footerBytes = base64ToUint8Array(APIC_FOOTER_JPEG_BASE64);

  // A4 geometry: 595.28 pt wide x 841.89 pt high
  // Usable width: 515 pt (from X=40 to X=555)
  const targetW = 515;
  const renderHeaderH = Math.round(targetW * (APIC_HEADER_DIMS.height / APIC_HEADER_DIMS.width) * 100) / 100; // 77.25 pt
  const renderFooterH = Math.round(targetW * (APIC_FOOTER_DIMS.height / APIC_FOOTER_DIMS.width) * 100) / 100; // 42.17 pt

  const headerX = 40;
  const headerY = Math.round((841.89 - 22 - renderHeaderH) * 100) / 100; // 742.64 pt
  const footerX = 40;
  const footerY = 22; // 22 pt bottom margin

  // Build stream content
  let stream = '';

  // 1. Draw Official Header Image across top
  stream += `q ${targetW} 0 0 ${renderHeaderH} ${headerX} ${headerY} cm /HeaderImg Do Q\n`;

  // 2. Draw Official Footer Image across bottom
  stream += `q ${targetW} 0 0 ${renderFooterH} ${footerX} ${footerY} cm /FooterImg Do Q\n`;

  // 3. Requisition Identification Meta Bar (Placed below the header image)
  const metaY = headerY - 10;
  stream += `0.96 0.98 0.96 rg 40 ${metaY - 34} 515 34 re f\n`;
  stream += `0.80 0.88 0.82 RG 0.5 w 40 ${metaY - 34} 515 34 re S\n`;
  stream += `0 0.408 0.216 rg 40 ${metaY - 34} 4 34 re f\n`;

  stream += `BT /F2 10 Tf 0 0.408 0.216 rg 52 ${metaY - 15} Td (REQUEST FOR QUOTATION (RFQ)) Tj ET\n`;
  stream += `BT /F1 7 Tf 0.3 0.35 0.4 rg 52 ${metaY - 26} Td (Official Material Schedule & Procurement Requisition) Tj ET\n`;

  stream += `BT /F2 9.5 Tf 0.05 0.08 0.12 rg 280 ${metaY - 15} Td (Ref: ${escapePdfText(rfq.id)}) Tj ET\n`;
  stream += `BT /F1 7 Tf 0.3 0.35 0.4 rg 280 ${metaY - 26} Td (Date: ${escapePdfText(dateStr)}   |   Validity: 30 Days) Tj ET\n`;

  stream += `BT /F2 8 Tf 0.784 0.063 0.180 rg 450 ${metaY - 18} Td (Status: ${escapePdfText(rfq.status || 'Active Procurement')}) Tj ET\n`;

  // 4. Supplier & Buyer Info Boxes (Two columns, height 64pt for full details without truncation)
  const boxY = metaY - 42;
  const boxHeight = 64;

  // Supplier Box (Left)
  stream += `0.97 0.98 0.99 rg 40 ${boxY - boxHeight} 250 ${boxHeight} re f\n`;
  stream += `0.85 0.88 0.92 RG 0.5 w 40 ${boxY - boxHeight} 250 ${boxHeight} re S\n`;
  stream += `0 0.408 0.216 rg 40 ${boxY - boxHeight} 3 ${boxHeight} re f\n`;
  stream += `BT /F2 7.5 Tf 0 0.408 0.216 rg 48 ${boxY - 12} Td (STOCKIST / WAREHOUSE LOGISTICS) Tj ET\n`;
  stream += `BT /F2 8.5 Tf 0.05 0.08 0.12 rg 48 ${boxY - 22} Td (Allied Power Industrial Company) Tj ET\n`;
  stream += `BT /F2 6.8 Tf 0 0.408 0.216 rg 48 ${boxY - 31} Td (Aramco Vendor: 10121504  |  SEC Vendor: 0002017931) Tj ET\n`;
  stream += `BT /F1 6.8 Tf 0.25 0.3 0.35 rg 48 ${boxY - 40} Td (Sales Contact: Farzand Naeem (+966 53 401 7242)) Tj ET\n`;
  stream += `BT /F1 6.8 Tf 0.25 0.3 0.35 rg 48 ${boxY - 49} Td (Address: Prince Naif St, Cross 13, Al Khobar 34428, KSA) Tj ET\n`;
  stream += `BT /F1 6.8 Tf 0.25 0.3 0.35 rg 48 ${boxY - 58} Td (Email: farzand@alliedpowerindustrial.com) Tj ET\n`;

  // Buyer Box (Right) - Full company name, customer name, contact & destination
  const buyerCompanyLines = wrapText(rfq.company || 'Corporate Enterprise Client', 38);
  const buyerName = escapePdfText(rfq.name || 'Procurement Team');
  const buyerContact = escapePdfText([rfq.phone, rfq.email].filter(Boolean).join(' | ') || 'N/A');
  const buyerDestStr = [rfq.city, rfq.project].filter(Boolean).join(' - ') || rfq.city || rfq.project || 'Kingdom Mega-Project Site';
  const buyerDestLines = wrapText(`Destination: ${buyerDestStr}`, 38);

  stream += `0.97 0.98 0.99 rg 305 ${boxY - boxHeight} 250 ${boxHeight} re f\n`;
  stream += `0.85 0.88 0.92 RG 0.5 w 305 ${boxY - boxHeight} 250 ${boxHeight} re S\n`;
  stream += `0.784 0.063 0.180 rg 305 ${boxY - boxHeight} 3 ${boxHeight} re f\n`;
  stream += `BT /F2 7.5 Tf 0.784 0.063 0.180 rg 313 ${boxY - 12} Td (BUYER / REQUISITIONER DETAILS) Tj ET\n`;
  
  // Render Company (1 or 2 lines in bold)
  let buyerTextY = boxY - 23;
  stream += `BT /F2 8.2 Tf 0.05 0.08 0.12 rg 313 ${buyerTextY} Td (${buyerCompanyLines[0] || 'Corporate Client'}) Tj ET\n`;
  if (buyerCompanyLines[1]) {
    buyerTextY -= 9;
    stream += `BT /F2 8.2 Tf 0.05 0.08 0.12 rg 313 ${buyerTextY} Td (${buyerCompanyLines[1]}) Tj ET\n`;
  }
  
  // Attn / Requisitioner Name in Full
  buyerTextY -= 10;
  stream += `BT /F1 7.2 Tf 0.25 0.3 0.35 rg 313 ${buyerTextY} Td (Attn: ${buyerName}) Tj ET\n`;
  
  // Contact Phone / Email in Full
  buyerTextY -= 9;
  stream += `BT /F1 6.8 Tf 0.25 0.3 0.35 rg 313 ${buyerTextY} Td (Contact: ${buyerContact}) Tj ET\n`;
  
  // Destination in Full
  buyerTextY -= 9;
  stream += `BT /F1 6.8 Tf 0.25 0.3 0.35 rg 313 ${buyerTextY} Td (${buyerDestLines[0] || 'Destination: Kingdom Project Site'}) Tj ET\n`;
  if (buyerDestLines[1] && buyerTextY - 8 > boxY - boxHeight + 2) {
    buyerTextY -= 8;
    stream += `BT /F1 6.8 Tf 0.25 0.3 0.35 rg 313 ${buyerTextY} Td (${buyerDestLines[1]}) Tj ET\n`;
  }

  // 5. Table Header
  const tableTopY = boxY - boxHeight - 12;
  stream += `0.06 0.09 0.16 rg 40 ${tableTopY - 18} 515 18 re f\n`;
  stream += `BT /F2 7.5 Tf 1 1 1 rg 46 ${tableTopY - 12} Td (#) Tj ET\n`;
  stream += `BT /F2 7.5 Tf 1 1 1 rg 65 ${tableTopY - 12} Td (SKU) Tj ET\n`;
  stream += `BT /F2 7.5 Tf 1 1 1 rg 118 ${tableTopY - 12} Td (MATERIAL DESCRIPTION & TECHNICAL SPECIFICATIONS) Tj ET\n`;
  stream += `BT /F2 7.5 Tf 1 1 1 rg 364 ${tableTopY - 12} Td (BRAND) Tj ET\n`;
  stream += `BT /F2 7.5 Tf 1 1 1 rg 414 ${tableTopY - 12} Td (QTY) Tj ET\n`;
  stream += `BT /F2 7.5 Tf 1 1 1 rg 448 ${tableTopY - 12} Td (UNIT (SAR)) Tj ET\n`;
  stream += `BT /F2 7.5 Tf 1 1 1 rg 504 ${tableTopY - 12} Td (TOTAL (SAR)) Tj ET\n`;

  // 6. Table Rows - Dynamic row height for complete product detail without '...'
  let curY = tableTopY - 18;
  const maxItems = Math.min(rfq.items.length, 12);

  for (let i = 0; i < maxItems; i++) {
    const item = rfq.items[i];

    const catProd = ALLIED_PRODUCTS.find(p => p.sku === item.sku || p.id === item.id);
    const fullName = item.name || (catProd && catProd.name) || '';
    const fullSpecs = item.description || (catProd && (catProd.description || catProd.fullDescription)) || (item.category ? `Category: ${item.category} | Aramco 9COM / SABIC Standard` : 'Saudi Aramco 9COM / SABIC Specification Compliant');

    // Wrap product title and specs into complete lines without truncation
    const titleLines = wrapText(fullName, 56);
    const specLines = wrapText(fullSpecs, 68);

    // Calculate dynamic row height based on line count
    const totalLines = titleLines.length + specLines.length;
    const rowHeight = Math.max(28, totalLines * 8.5 + 8);

    curY -= rowHeight;

    // Row alternating background
    if (i % 2 === 1) {
      stream += `0.97 0.98 0.99 rg 40 ${curY} 515 ${rowHeight} re f\n`;
    }
    // Bottom border
    stream += `0.90 0.92 0.95 RG 0.5 w 40 ${curY} m 555 ${curY} l S\n`;

    const itemTotal = (item.price * item.quantity).toFixed(2);
    const unitPrice = item.price.toFixed(2);

    // Vertical top alignment for single-line columns
    const colAlignY = curY + rowHeight - 13;

    // Col 1: #
    stream += `BT /F1 7.5 Tf 0.2 0.25 0.3 rg 46 ${colAlignY} Td (${i + 1}) Tj ET\n`;

    // Col 2: SKU
    stream += `BT /F1 7 Tf 0.3 0.35 0.4 rg 65 ${colAlignY} Td (${escapePdfText(item.sku)}) Tj ET\n`;

    // Col 3: Complete Material Title & Complete Technical Specifications
    let itemTextY = curY + rowHeight - 11;
    for (const tl of titleLines) {
      stream += `BT /F2 7.2 Tf 0.05 0.08 0.12 rg 118 ${itemTextY} Td (${tl}) Tj ET\n`;
      itemTextY -= 8.5;
    }
    for (const sl of specLines) {
      stream += `BT /F1 5.8 Tf 0.35 0.40 0.45 rg 118 ${itemTextY} Td (${sl}) Tj ET\n`;
      itemTextY -= 7.2;
    }

    // Col 4: Brand
    stream += `BT /F2 7 Tf 0 0.408 0.216 rg 364 ${colAlignY} Td (${escapePdfText(item.brand || 'APIC')}) Tj ET\n`;

    // Col 5: Qty
    stream += `BT /F2 7.5 Tf 0.05 0.08 0.12 rg 416 ${colAlignY} Td (${item.quantity}) Tj ET\n`;

    // Col 6: Unit Price
    stream += `BT /F1 7.5 Tf 0.2 0.25 0.3 rg 450 ${colAlignY} Td (${unitPrice}) Tj ET\n`;

    // Col 7: Total Price
    stream += `BT /F2 7.5 Tf 0 0.408 0.216 rg 506 ${colAlignY} Td (${itemTotal}) Tj ET\n`;
  }

  // 7. Commercial Summary & Technical Terms
  const summaryY = curY - 12;

  // Summary Totals Box (Right Side)
  stream += `0.96 0.97 0.98 rg 340 ${summaryY - 54} 215 58 re f\n`;
  stream += `0.85 0.88 0.92 RG 0.5 w 340 ${summaryY - 54} 215 58 re S\n`;

  stream += `BT /F1 8 Tf 0.3 0.35 0.4 rg 350 ${summaryY - 12} Td (Materials Subtotal:) Tj ET\n`;
  stream += `BT /F2 8.5 Tf 0.05 0.08 0.12 rg 470 ${summaryY - 12} Td (${subtotal.toFixed(2)} SAR) Tj ET\n`;

  if (includeVat) {
    stream += `BT /F1 8 Tf 0.3 0.35 0.4 rg 350 ${summaryY - 26} Td (ZATCA VAT (15%):) Tj ET\n`;
    stream += `BT /F2 8.5 Tf 0.05 0.08 0.12 rg 470 ${summaryY - 26} Td (${vat.toFixed(2)} SAR) Tj ET\n`;

    stream += `0 0.408 0.216 rg 340 ${summaryY - 54} 215 20 re f\n`;
    stream += `BT /F2 9 Tf 1 1 1 rg 350 ${summaryY - 48} Td (ESTIMATED TOTAL:) Tj ET\n`;
    stream += `BT /F2 9.5 Tf 1 1 1 rg 460 ${summaryY - 48} Td (${total.toFixed(2)} SAR) Tj ET\n`;
  } else {
    stream += `BT /F1 8 Tf 0.3 0.35 0.4 rg 350 ${summaryY - 26} Td (VAT (Excluded / 0%):) Tj ET\n`;
    stream += `BT /F2 8.5 Tf 0.4 0.45 0.5 rg 470 ${summaryY - 26} Td (0.00 SAR) Tj ET\n`;

    stream += `0 0.408 0.216 rg 340 ${summaryY - 54} 215 20 re f\n`;
    stream += `BT /F2 8.5 Tf 1 1 1 rg 350 ${summaryY - 48} Td (TOTAL (EXCL. VAT):) Tj ET\n`;
    stream += `BT /F2 9.5 Tf 1 1 1 rg 460 ${summaryY - 48} Td (${total.toFixed(2)} SAR) Tj ET\n`;
  }

  // Terms and Quality Endorsement (Left Side)
  stream += `0.96 0.97 0.98 rg 40 ${summaryY - 54} 290 58 re f\n`;
  stream += `0.85 0.88 0.92 RG 0.5 w 40 ${summaryY - 54} 290 58 re S\n`;
  stream += `BT /F2 7 Tf 0 0.408 0.216 rg 48 ${summaryY - 12} Td (QUALITY ASSURANCE & TECHNICAL COMPLIANCE) Tj ET\n`;
  stream += `BT /F1 6.5 Tf 0.25 0.3 0.35 rg 48 ${summaryY - 22} Td (- Fully compliant with Saudi Aramco 9COM & SABIC specifications.) Tj ET\n`;
  stream += `BT /F1 6.5 Tf 0.25 0.3 0.35 rg 48 ${summaryY - 32} Td (- Genuine Mill Test Certificates (MTC) and Origin Docs included.) Tj ET\n`;
  stream += `BT /F1 6.5 Tf 0.25 0.3 0.35 rg 48 ${summaryY - 42} Td (- Fast delivery all over the Kingdom of Saudi Arabia.) Tj ET\n`;
  stream += `BT /F1 6.5 Tf 0.25 0.3 0.35 rg 48 ${summaryY - 52} Td (- Electronic tax invoices issued compliant with ZATCA phase 2.) Tj ET\n`;

  // 8. Signatures Section (Placed directly above the official footer image)
  const sigY = summaryY - 74;
  stream += `0.85 0.88 0.92 RG 0.5 w 40 ${sigY} m 260 ${sigY} l S\n`;
  stream += `BT /F2 7.5 Tf 0.05 0.08 0.12 rg 40 ${sigY - 10} Td (PREPARED & VERIFIED BY) Tj ET\n`;
  stream += `BT /F1 7 Tf 0.3 0.35 0.4 rg 40 ${sigY - 20} Td (Farzand Naeem -- Sales Manager) Tj ET\n`;
  stream += `BT /F1 6.5 Tf 0 0.408 0.216 rg 40 ${sigY - 29} Td (Allied Power Industrial Company (Al-Khobar Hub)) Tj ET\n`;

  stream += `0.85 0.88 0.92 RG 0.5 w 335 ${sigY} m 555 ${sigY} l S\n`;
  stream += `BT /F2 7.5 Tf 0.05 0.08 0.12 rg 335 ${sigY - 10} Td (CLIENT PROCUREMENT ACCEPTANCE & STAMP) Tj ET\n`;
  stream += `BT /F1 7 Tf 0.3 0.35 0.4 rg 335 ${sigY - 20} Td (Authorized Signatory: ${escapePdfText(rfq.name || 'Procurement Officer')}) Tj ET\n`;
  
  const clientCompanySigLines = wrapText(rfq.company || 'Enterprise Client Organization', 38);
  stream += `BT /F1 6.5 Tf 0.4 0.45 0.5 rg 335 ${sigY - 29} Td (${clientCompanySigLines[0] || 'Enterprise Client Organization'}) Tj ET\n`;
  if (clientCompanySigLines[1]) {
    stream += `BT /F1 6.5 Tf 0.4 0.45 0.5 rg 335 ${sigY - 37} Td (${clientCompanySigLines[1]}) Tj ET\n`;
  }

  // 9. Assemble Binary PDF with Images
  const enc = new TextEncoder();
  const streamBytes = enc.encode(stream);

  const pHeader = enc.encode("%PDF-1.4\n");
  const pObj1 = enc.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const pObj2 = enc.encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  const pObj3 = enc.encode("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /HeaderImg 7 0 R /FooterImg 8 0 R >> >> /Contents 6 0 R >>\nendobj\n");
  const pObj4 = enc.encode("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
  const pObj5 = enc.encode("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

  const pObj6Head = enc.encode(`6 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`);
  const pObj6Tail = enc.encode("\nendstream\nendobj\n");
  const pObj6Len = pObj6Head.length + streamBytes.length + pObj6Tail.length;

  const pObj7Head = enc.encode(`7 0 obj\n<< /Type /XObject /Subtype /Image /Width ${APIC_HEADER_DIMS.width} /Height ${APIC_HEADER_DIMS.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${headerBytes.length} >>\nstream\n`);
  const pObj7Tail = enc.encode("\nendstream\nendobj\n");
  const pObj7Len = pObj7Head.length + headerBytes.length + pObj7Tail.length;

  const pObj8Head = enc.encode(`8 0 obj\n<< /Type /XObject /Subtype /Image /Width ${APIC_FOOTER_DIMS.width} /Height ${APIC_FOOTER_DIMS.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${footerBytes.length} >>\nstream\n`);
  const pObj8Tail = enc.encode("\nendstream\nendobj\n");
  const pObj8Len = pObj8Head.length + footerBytes.length + pObj8Tail.length;

  let curOffset = pHeader.length;
  const offsets = [];

  offsets.push(curOffset); curOffset += pObj1.length;
  offsets.push(curOffset); curOffset += pObj2.length;
  offsets.push(curOffset); curOffset += pObj3.length;
  offsets.push(curOffset); curOffset += pObj4.length;
  offsets.push(curOffset); curOffset += pObj5.length;
  offsets.push(curOffset); curOffset += pObj6Len;
  offsets.push(curOffset); curOffset += pObj7Len;
  offsets.push(curOffset); curOffset += pObj8Len;

  const startxref = curOffset;
  let xrefStr = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xrefStr += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  xrefStr += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  const pTrailer = enc.encode(xrefStr);

  return new Blob([
    pHeader,
    pObj1,
    pObj2,
    pObj3,
    pObj4,
    pObj5,
    pObj6Head, streamBytes, pObj6Tail,
    pObj7Head, headerBytes, pObj7Tail,
    pObj8Head, footerBytes, pObj8Tail,
    pTrailer
  ], { type: 'application/pdf' });
}

export function downloadRfqPdf(rfq) {
  try {
    const blob = generateRfqPdfBlob(rfq);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Allied_Power_Industrial_RFQ_${(rfq.id || 'RFQ').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (err) {
    console.error('Error downloading PDF:', err);
    return false;
  }
}
