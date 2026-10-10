import React, { useState } from 'react';
import { updateRfqStatus, deleteRfqRecord } from '../utils/rfqStorage';
import { ALLIED_PRODUCTS } from '../data/alliedProducts';

export default function RfqManager({ rfqs, onRefreshRfqs, onOpenRfqDocument }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filteredRfqs = rfqs.filter(r => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.project && r.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    updateRfqStatus(id, newStatus);
    onRefreshRfqs();
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete requisition ${id}?`)) {
      deleteRfqRecord(id);
      onRefreshRfqs();
    }
  };

  return (
    <div>
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
            Requisitions &amp; RFQs
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Inspect client material bills, manage workflow statuses, and generate official stamped documents
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Pending Review', 'Quoted', 'Approved', 'Dispatched'].map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  backgroundColor: isActive ? '#090d16' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: `1px solid ${isActive ? '#090d16' : '#eaedf1'}`,
                  borderRadius: '7px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st} {st !== 'All' && `(${rfqs.filter(r => r.status === st).length})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative',
        marginBottom: '20px'
      }}>
        <i className="bi bi-search" style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
          fontSize: '14px'
        }}></i>
        <input
          type="text"
          placeholder="Search RFQs by reference, contractor company, project, or email..."
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

      {/* RFQ List */}
      {filteredRfqs.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          padding: '60px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#64748b',
          border: '1px solid #eaedf1',
          fontSize: '13px'
        }}>
          <i className="bi bi-inbox" style={{ fontSize: '40px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}></i>
          No procurement requests match your filter criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredRfqs.map((rfq) => {
            const isExpanded = expandedId === rfq.id;

            return (
              <div
                key={rfq.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #eaedf1',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Collapsed Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? '#fafbfc' : '#ffffff'
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : rfq.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '7px',
                      backgroundColor: '#f0fdf4',
                      color: '#006837',
                      border: '1px solid #dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}>
                      <i className="bi bi-file-earmark-text"></i>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#006837', fontFamily: 'ui-monospace, monospace' }}>
                          {rfq.id}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          &bull; {new Date(rfq.date).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#090d16', marginTop: '2px' }}>
                        {rfq.company || 'Enterprise Client'} &mdash; <span style={{ fontWeight: 400, color: '#64748b' }}>{rfq.name}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#090d16', fontVariantNumeric: 'tabular-nums' }}>
                        {rfq.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {rfq.items.length} materials {rfq.includeVat === false ? '• Excl. VAT' : ''}
                      </div>
                    </div>

                    {/* Status Select */}
                    <select
                      value={rfq.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(rfq.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: rfq.status === 'Pending Review' ? '#fffbeb' : '#f0fdf4',
                        color: rfq.status === 'Pending Review' ? '#92400e' : '#166534',
                        border: `1px solid ${rfq.status === 'Pending Review' ? '#fef3c7' : '#dcfce7'}`,
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Quoted">Quoted</option>
                      <option value="Approved">Approved</option>
                      <option value="Dispatched">Dispatched</option>
                    </select>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRfqDocument(rfq);
                      }}
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
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      title="Generate and print official stamped RFQ PDF document"
                    >
                      <i className="bi bi-file-earmark-pdf" style={{ color: '#006837' }}></i> PDF
                    </button>

                    <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ color: '#94a3b8', fontSize: '13px' }}></i>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    padding: '24px',
                    borderTop: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                  }}>
                    {/* Buyer Details Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      marginBottom: '20px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Email Address</span>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{rfq.email || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Contact Phone</span>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{rfq.phone || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Delivery City / Hub</span>
                        <strong style={{ fontSize: '13px', color: '#006837' }}>{rfq.city || 'Kingdom-Wide'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Project Destination</span>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>{rfq.project || 'General Inquiry'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Tax / VAT Status</span>
                        <strong style={{ fontSize: '13px', color: rfq.includeVat !== false ? '#006837' : '#64748b' }}>
                          {rfq.includeVat !== false ? '15% ZATCA VAT Included' : 'VAT Excluded (0%)'}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Buyer Instructions</span>
                        <span style={{ fontSize: '12px', color: '#334155' }}>{rfq.notes || 'None provided'}</span>
                      </div>
                    </div>

                    {/* Material Items Table */}
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Requisitioned Material Items ({rfq.items.length})
                    </h4>

                    <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '10px 12px' }}>SKU</th>
                            <th style={{ padding: '10px 12px' }}>Item Name</th>
                            <th style={{ padding: '10px 12px' }}>Brand</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Unit Price (SAR)</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Subtotal (SAR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rfq.items.map((it, idx) => {
                            const catProd = ALLIED_PRODUCTS.find(p => p.sku === it.sku || p.id === it.id);
                            const specs = it.description || (catProd && (catProd.description || catProd.fullDescription));
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a' }}>
                                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#64748b' }}>{it.sku}</td>
                                <td style={{ padding: '10px 12px' }}>
                                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                                  {specs && (
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: '14px' }}>
                                      {specs}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '10px 12px', color: '#006837', fontWeight: 600 }}>{it.brand}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right' }}>{it.price.toFixed(2)}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#006837' }}>
                                  {(it.price * it.quantity).toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => onOpenRfqDocument(rfq)}
                          style={{
                            backgroundColor: '#006837',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(0, 104, 55, 0.2)'
                          }}
                        >
                          <i className="bi bi-printer-fill"></i> View / Print Official Document
                        </button>

                        {rfq.phone && (
                          <a
                            href={`https://wa.me/${rfq.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(rfq.name)},%20this%20is%20Allied%20Power%20Industrial%20regarding%20RFQ%20${rfq.id}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: '#25d366',
                              color: '#ffffff',
                              borderRadius: '6px',
                              padding: '8px 14px',
                              fontSize: '13px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.2)'
                            }}
                          >
                            <i className="bi bi-whatsapp"></i> WhatsApp Buyer
                          </a>
                        )}

                        {rfq.email && (
                          <a
                            href={`mailto:${rfq.email}?subject=Official%20Quotation%20for%20${rfq.id}%20-%20Allied%20Power%20Industrial`}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '8px 14px',
                              fontSize: '13px',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <i className="bi bi-envelope" style={{ color: '#006837' }}></i> Email Buyer
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(rfq.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <i className="bi bi-trash"></i> Delete Requisition
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
