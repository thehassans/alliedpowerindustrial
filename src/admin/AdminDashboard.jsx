import React from 'react';

export default function AdminDashboard({
  products,
  rfqs,
  onNavigateTab,
  onOpenRfqDocument
}) {
  const pendingRfqs = rfqs.filter(r => r.status === 'Pending Review');
  const totalValueSAR = rfqs.reduce((acc, r) => acc + (r.total || 0), 0);

  return (
    <div>
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#090d16',
            margin: '0 0 4px',
            letterSpacing: '-0.02em'
          }}>
            Executive Overview
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Real-time material inventory, client procurement requisitions &amp; Eastern Province logistics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateTab('products')}
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
            <i className="bi bi-plus-lg"></i>
            <span>Add Product</span>
          </button>

          <button
            onClick={() => onNavigateTab('rfqs')}
            style={{
              backgroundColor: '#ffffff',
              color: '#090d16',
              border: '1px solid #e2e8f0',
              borderRadius: '7px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <i className="bi bi-inbox" style={{ color: '#c8102e' }}></i>
            <span>Review RFQs ({pendingRfqs.length})</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards - Ultra Minimalist & Crisp */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Catalog Inventory */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #eaedf1',
          borderRadius: '12px',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Catalog SKUs
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              <i className="bi bi-box-seam"></i>
            </div>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#090d16',
            margin: '8px 0 6px',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em'
          }}>
            {products.length}
          </div>
          <div style={{ fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>
            <i className="bi bi-check2"></i>
            <span>Active SKUs in SAR</span>
          </div>
        </div>

        {/* Card 2: Total RFQs */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #eaedf1',
          borderRadius: '12px',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Requisitions
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              backgroundColor: '#fef2f2',
              color: '#c8102e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              <i className="bi bi-file-earmark-text"></i>
            </div>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#090d16',
            margin: '8px 0 6px',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em'
          }}>
            {rfqs.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>
            <span>Client procurement submissions</span>
          </div>
        </div>

        {/* Card 3: Pending Action */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #eaedf1',
          borderRadius: '12px',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pending Quotes
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              <i className="bi bi-clock"></i>
            </div>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#090d16',
            margin: '8px 0 6px',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em'
          }}>
            {pendingRfqs.length}
          </div>
          <div style={{
            fontSize: '12px',
            color: pendingRfqs.length > 0 ? '#b45309' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 500
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: pendingRfqs.length > 0 ? '#f59e0b' : '#94a3b8'
            }}></span>
            <span>{pendingRfqs.length > 0 ? 'Awaiting formal quotation' : 'All requisitions processed'}</span>
          </div>
        </div>

        {/* Card 4: Estimated Pipeline Value */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #eaedf1',
          borderRadius: '12px',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Requisition Pipeline
            </span>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              <i className="bi bi-graph-up"></i>
            </div>
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#090d16',
            margin: '8px 0 6px',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap'
          }}>
            {totalValueSAR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>SAR</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>
            <span>Estimated project value</span>
          </div>
        </div>
      </div>

      {/* Recent RFQs Section - Sleek Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #eaedf1',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden'
      }}>
        {/* Table Header Strip */}
        <div style={{
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eaedf1'
        }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#090d16', margin: '0 0 2px' }}>
              Recent Procurement Requisitions (RFQs)
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Click any RFQ to inspect line items or generate official printable PDF
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('rfqs')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#006837',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '5px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span>View All ({rfqs.length})</span>
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>

        {rfqs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b', fontSize: '13px' }}>
            No RFQs received yet. When users submit the RFQ drawer on the public site, they will appear here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafbfc', color: '#64748b', borderBottom: '1px solid #eaedf1', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600, whiteSpace: 'nowrap' }}>Reference</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, whiteSpace: 'nowrap' }}>Client / Organization</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, whiteSpace: 'nowrap' }}>Project Reference</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, whiteSpace: 'nowrap' }}>Items</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, whiteSpace: 'nowrap' }}>Est. Total</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.slice(0, 5).map((rfq) => {
                  const isPending = rfq.status === 'Pending Review';
                  const isQuoted = rfq.status === 'Quoted';
                  const isApproved = rfq.status === 'Approved';

                  let statusBg = '#f8fafc';
                  let statusColor = '#475569';
                  let statusBorder = '#e2e8f0';
                  let dotColor = '#94a3b8';

                  if (isPending) {
                    statusBg = '#fffbeb';
                    statusColor = '#92400e';
                    statusBorder = '#fef3c7';
                    dotColor = '#f59e0b';
                  } else if (isQuoted) {
                    statusBg = '#f0f9ff';
                    statusColor = '#0369a1';
                    statusBorder = '#e0f2fe';
                    dotColor = '#0284c7';
                  } else if (isApproved) {
                    statusBg = '#f0fdf4';
                    statusColor = '#166534';
                    statusBorder = '#dcfce7';
                    dotColor = '#16a34a';
                  }

                  return (
                    <tr
                      key={rfq.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        color: '#090d16',
                        transition: 'background-color 0.1s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafbfc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {/* Reference */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#006837',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #dcfce7',
                          padding: '3px 8px',
                          borderRadius: '5px'
                        }}>
                          {rfq.id}
                        </span>
                      </td>

                      {/* Client / Organization */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#090d16', fontSize: '13px' }}>
                          {rfq.company || 'Enterprise Client'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          Attn: {rfq.name} {rfq.phone ? `(${rfq.phone})` : ''}
                        </div>
                      </td>

                      {/* Project Reference */}
                      <td style={{ padding: '14px 18px', color: '#475569', fontSize: '13px' }}>
                        {rfq.project || 'Standard Industrial Supply'}
                      </td>

                      {/* Items */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          padding: '3px 9px',
                          borderRadius: '50px',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap'
                        }}>
                          {rfq.items.length} {rfq.items.length === 1 ? 'material' : 'materials'}
                        </span>
                      </td>

                      {/* Est. Total */}
                      <td style={{
                        padding: '14px 18px',
                        fontWeight: 700,
                        color: '#090d16',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                        fontSize: '13px'
                      }}>
                        {rfq.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>SAR</span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          backgroundColor: statusBg,
                          color: statusColor,
                          border: `1px solid ${statusBorder}`,
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '50px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dotColor }}></span>
                          <span>{rfq.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => onOpenRfqDocument(rfq)}
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#090d16',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '5px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <i className="bi bi-file-earmark-pdf" style={{ color: '#006837' }}></i>
                          <span>Official PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
