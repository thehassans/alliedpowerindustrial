import React from 'react';
import { downloadRfqPdf } from '../utils/generatePdf';
import { ALLIED_PRODUCTS } from '../data/alliedProducts';

export default function RfqDocumentModal({ rfq, onClose }) {
  if (!rfq) return null;

  const handlePrint = () => {
    const printArea = document.getElementById('rfq-printable-area');
    if (!printArea) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe to avoid parent CSS/overflow clipping
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Procurement_Requisition_${rfq.id || 'RFQ'}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #e2e8f0;
            }
          </style>
        </head>
        <body style="padding: 12px 16px; background: #ffffff !important;">
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    const triggerPrint = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print failed:', err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    };

    // Ensure header/footer images are loaded in iframe before calling print
    const images = iframe.contentDocument ? iframe.contentDocument.images : [];
    if (images && images.length > 0) {
      let loaded = 0;
      const onImgDone = () => {
        loaded++;
        if (loaded >= images.length) triggerPrint();
      };
      for (let i = 0; i < images.length; i++) {
        if (images[i].complete) {
          loaded++;
        } else {
          images[i].onload = onImgDone;
          images[i].onerror = onImgDone;
        }
      }
      if (loaded >= images.length) {
        setTimeout(triggerPrint, 150);
      }
    } else {
      setTimeout(triggerPrint, 250);
    }
  };

  const handleDownload = () => {
    downloadRfqPdf(rfq);
  };

  const formattedDate = new Date(rfq.date || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const subtotal = rfq.subtotal || rfq.items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const vat = rfq.vat !== undefined ? rfq.vat : subtotal * 0.15;
  const total = rfq.total !== undefined ? rfq.total : subtotal + vat;

  const generateWhatsAppShare = () => {
    let msg = `*ALLIED POWER INDUSTRIAL COMPANY — PROCUREMENT REQUISITION*\n`;
    msg += `RFQ Reference: ${rfq.id}\n`;
    msg += `Date: ${formattedDate}\n`;
    msg += `Company: ${rfq.company || 'N/A'}\n`;
    msg += `Contact: ${rfq.name || 'N/A'} (${rfq.phone || 'N/A'})\n`;
    msg += `Project: ${rfq.project || 'General Inquiry'}\n`;
    msg += `------------------------------------\n`;
    rfq.items.forEach((it, i) => {
      msg += `${i + 1}. ${it.name} | Qty: ${it.quantity} | Total: ${(it.price * it.quantity).toFixed(2)} SAR\n`;
    });
    msg += `------------------------------------\n`;
    msg += `Total Estimated Value: ${total.toFixed(2)} SAR (incl. VAT)\n`;
    msg += `Please confirm stock availability and formal delivery lead time.`;
    return encodeURIComponent(msg);
  };

  return (
    <div
      className="rfq-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100005,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="rfq-document-container"
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar (Hidden during Print) */}
        <div
          className="no-print"
          style={{
            padding: '16px 26px',
            backgroundColor: '#0a1018',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid var(--color-green)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 104, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00b862',
              fontSize: '18px'
            }}>
              <i className="bi bi-file-earmark-pdf-fill"></i>
            </div>
            <div>
              <strong style={{ fontSize: '15px', color: '#ffffff', display: 'block', fontWeight: 800 }}>
                Procurement Requisition &bull; {rfq.id}
              </strong>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Allied Power Industrial Company &bull; Official Stamped Procurement Document
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDownload}
              style={{
                backgroundColor: '#006837',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 104, 55, 0.35)'
              }}
              title="Download formal PDF file"
            >
              <i className="bi bi-download"></i> Download PDF
            </button>

            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Print document or save using browser dialog"
            >
              <i className="bi bi-printer"></i> Print
            </button>

            <a
              href={`https://wa.me/966534017242?text=${generateWhatsAppShare()}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#25d366',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="bi bi-whatsapp"></i> WhatsApp
            </a>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
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

        {/* Printable Document Body - Ultra-Minimalistic Professional Layout */}
        <div
          id="rfq-printable-area"
          style={{
            padding: '40px 46px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif"
          }}
        >
          {/* Official Letterhead Header Image */}
          <div style={{ marginBottom: '16px' }}>
            <img
              src="/apicheader.jpeg"
              alt="Allied Power Industrial Company Header"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '4px'
              }}
            />
          </div>

          {/* Requisition Identification Meta Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #006837',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#006837', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block' }}>
                REQUEST FOR QUOTATION (RFQ)
              </span>
              <strong style={{ fontSize: '16px', color: '#0f172a', letterSpacing: '-0.01em', fontFamily: 'monospace' }}>
                Ref: {rfq.id}
              </strong>
            </div>

            <div style={{ fontSize: '12px', color: '#475569', lineHeight: '18px', textAlign: 'center' }}>
              <div>Issue Date: <strong style={{ color: '#0f172a' }}>{formattedDate}</strong></div>
              <div>Validity: <strong>30 Calendar Days</strong></div>
            </div>

            <div>
              <span style={{
                display: 'inline-block',
                backgroundColor: rfq.status === 'Pending Review' ? '#fef3c7' : '#dcfce7',
                color: rfq.status === 'Pending Review' ? '#92400e' : '#166534',
                border: `1px solid ${rfq.status === 'Pending Review' ? '#fde68a' : '#bbf7d0'}`,
                padding: '5px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                Status: {rfq.status || 'Active Procurement'}
              </span>
            </div>
          </div>

          {/* Supplier & Buyer Two-Column Block */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #006837' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#006837', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Stockist / Vendor Logistics
              </span>
              <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: '21px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>Allied Power Industrial Company</strong><br />
                <span>Sales Manager: <strong>Farzand Naeem</strong></span><br />
                <span>Phone / WhatsApp: +966 53 401 7242</span><br />
                <span>Email: farzand@alliedpowerindustrial.com</span><br />
                <span style={{ color: '#006837', fontWeight: 700 }}>
                  <i className="bi bi-truck"></i> Fast delivery all over the Kingdom of Saudi Arabia
                </span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #c8102e' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#c8102e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Client / Requisitioner Details
              </span>
              <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: '21px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{rfq.company || 'Enterprise Contractor'}</strong><br />
                <span>Requisitioner: <strong>{rfq.name || 'Procurement Officer'}</strong></span><br />
                <span>Contact: {rfq.phone || rfq.email || 'N/A'}</span><br />
                <span>Email: {rfq.email || 'N/A'}</span><br />
                <span>Project / Site: <strong style={{ color: '#0f172a' }}>{rfq.project || 'General Project Delivery'}</strong></span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', border: '1px solid #0f172a', width: '32px' }}>#</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #0f172a', width: '90px' }}>SKU</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #0f172a' }}>Material Description &amp; Technical Specifications</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #0f172a', width: '110px' }}>Brand</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #0f172a', width: '45px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #0f172a', width: '95px', textAlign: 'right' }}>Unit (SAR)</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #0f172a', width: '100px', textAlign: 'right' }}>Total (SAR)</th>
                </tr>
              </thead>
              <tbody>
                {rfq.items.map((item, idx) => {
                  const catProd = ALLIED_PRODUCTS.find(p => p.sku === item.sku || p.id === item.id);
                  const specs = item.description || (catProd && (catProd.description || catProd.fullDescription));
                  return (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontFamily: 'monospace', color: '#475569' }}>
                        {item.sku}
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#0f172a', display: 'block', marginBottom: '3px', fontSize: '13px' }}>
                          {item.name}
                        </strong>
                        {specs && (
                          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '3px', lineHeight: '16px' }}>
                            {specs}
                          </div>
                        )}
                        <span style={{ fontSize: '10.5px', color: '#006837', fontWeight: 600 }}>
                          Category: {item.category || (catProd && catProd.category)} &bull; Aramco 9COM / SABIC Conformance
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', color: '#006837', fontWeight: 700 }}>
                        {item.brand}
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 800 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', textAlign: 'right' }}>
                        {item.price.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700, color: '#006837' }}>
                        {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Commercial Totals & Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '22px', marginBottom: '26px' }}>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569', lineHeight: '19px' }}>
              <strong style={{ color: '#0f172a', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Technical Compliance &amp; Delivery Terms:
              </strong>
              <div>&bull; <strong>Kingdom-Wide Logistics:</strong> Fast delivery all over the Kingdom of Saudi Arabia.</div>
              <div>&bull; <strong>Aramco / SABIC Conformance:</strong> Materials supplied with official Mill Test Certificates (MTC).</div>
              <div>&bull; <strong>Validity:</strong> 30 calendar days from issue date.</div>
              <div>&bull; <strong>Invoicing:</strong> ZATCA phase 2 compliant electronic tax invoicing.</div>
              {rfq.notes && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <strong>Client Instructions:</strong> {rfq.notes}
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Materials Subtotal:</span>
                <strong style={{ color: '#0f172a' }}>{subtotal.toFixed(2)} SAR</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>ZATCA VAT (15%):</span>
                <strong style={{ color: '#0f172a' }}>{vat.toFixed(2)} SAR</strong>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                color: '#006837',
                borderTop: '2px solid #cbd5e1',
                paddingTop: '10px',
                marginTop: '10px'
              }}>
                <span>Grand Requisition Value:</span>
                <span>{total.toFixed(2)} SAR</span>
              </div>
            </div>
          </div>

          {/* Signatures & Corporate Stamp Block */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px', paddingTop: '22px', borderTop: '1px dashed #cbd5e1' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '40px', letterSpacing: '0.5px' }}>
                Prepared &amp; Verified By (Vendor Stockist)
              </div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontSize: '12px' }}>
                <strong>Farzand Naeem &mdash; Sales Manager</strong><br />
                <span style={{ color: '#64748b' }}>Allied Power Industrial Company &bull; Al-Khobar</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '40px', letterSpacing: '0.5px' }}>
                Client Procurement Acceptance &amp; Stamp
              </div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontSize: '12px' }}>
                <strong>Authorized Signatory / Official Stamp</strong><br />
                <span style={{ color: '#64748b' }}>{rfq.company || 'Enterprise Client Organization'}</span>
              </div>
            </div>
          </div>

          {/* Official Letterhead Footer Image */}
          <div style={{ marginTop: '28px' }}>
            <img
              src="/apicfooter.jpeg"
              alt="Allied Power Industrial Company Footer"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
