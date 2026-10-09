// RFQ Data Storage & Procurement Management

const RFQ_STORAGE_KEY = 'allied_rfq_records';

const INITIAL_DEMO_RFQS = [
  {
    id: 'API-RFQ-2026-0842',
    date: '2026-10-08T14:32:00.000Z',
    status: 'Pending Review',
    company: 'Nesma & Partners Contracting Co.',
    name: 'Eng. Tariq Al-Mansoor',
    email: 'tariq.mansoor@nesmapartners.com',
    phone: '+966 50 123 4567',
    project: 'Saudi Aramco Marjan Package 4 Substation',
    notes: 'Urgent material requirement. Full Saudi Aramco 9COM approval and manufacturer MTC certificates required upon delivery.',
    items: [
      {
        id: 9860,
        sku: 'API-9860',
        name: '100 Amp, Pin & Sleeve Receptacle Only, 4-Pole, 3-Wire, 250V DC, 600V AC, ADR1034 , APPLETON',
        brand: 'Appleton',
        category: 'Plugs & Receptacles',
        price: 1250,
        quantity: 8
      },
      {
        id: 9894,
        sku: 'API-9894',
        name: '150A CLAMP Ring Plug 3W4P ST2 ACP15034CD',
        brand: 'Appleton',
        category: 'Plugs & Receptacles',
        price: 1850,
        quantity: 6
      },
      {
        id: 9895,
        sku: 'API-9895',
        name: 'Raychem Heat Shrink Cable Termination Kit 15kV 3-Core',
        brand: 'Raychem',
        category: 'Cable Termination & Splicing',
        price: 920,
        quantity: 12
      }
    ],
    subtotal: 32140,
    vat: 4821,
    total: 36961
  },
  {
    id: 'API-RFQ-2026-0791',
    date: '2026-10-06T10:15:00.000Z',
    status: 'Quoted',
    company: 'Al-Khodari & Sons Industrial',
    name: 'Mustafa Al-Salem',
    email: 'procurement@alkhodari.com.sa',
    phone: '+966 55 987 6543',
    project: 'SABIC Petrochemical Plant Turnaround',
    notes: 'Ex-stock delivery to Jubail Industrial City requested within 48 hours.',
    items: [
      {
        id: 9896,
        sku: 'API-9896',
        name: 'BURNDY Heavy Duty Copper Compression Lug 2-Hole Long Barrel 4/0 AWG',
        brand: 'BURNDY',
        category: 'Cable Lugs & Connectors',
        price: 65,
        quantity: 150
      },
      {
        id: 9897,
        sku: 'API-9897',
        name: 'SEICO Exothermic Welding Powder #150 Cartridge',
        brand: 'SEICO',
        category: 'Earthing & Lightning Protection',
        price: 88,
        quantity: 60
      }
    ],
    subtotal: 15030,
    vat: 2254.5,
    total: 17284.5
  }
];

export function getStoredRfqs() {
  try {
    const raw = localStorage.getItem(RFQ_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RFQ_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_RFQS));
      return INITIAL_DEMO_RFQS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading RFQs from localStorage:', err);
    return INITIAL_DEMO_RFQS;
  }
}

export function saveRfqRecord(rfqData) {
  try {
    const existing = getStoredRfqs();
    const newId = `API-RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const subtotal = rfqData.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    const newRecord = {
      id: rfqData.id || newId,
      date: new Date().toISOString(),
      status: 'Pending Review',
      company: rfqData.company || 'Not Specified',
      name: rfqData.name || 'Procurement Officer',
      email: rfqData.email || '',
      phone: rfqData.phone || '',
      project: rfqData.project || 'Standard Industrial Supply',
      notes: rfqData.notes || '',
      items: rfqData.items || [],
      subtotal,
      vat,
      total
    };

    const updated = [newRecord, ...existing];
    localStorage.setItem(RFQ_STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  } catch (err) {
    console.error('Error saving RFQ to localStorage:', err);
    return null;
  }
}

export function updateRfqStatus(id, newStatus) {
  try {
    const existing = getStoredRfqs();
    const updated = existing.map(item => item.id === id ? { ...item, status: newStatus } : item);
    localStorage.setItem(RFQ_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error updating RFQ status:', err);
    return [];
  }
}

export function deleteRfqRecord(id) {
  try {
    const existing = getStoredRfqs();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(RFQ_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting RFQ:', err);
    return [];
  }
}
