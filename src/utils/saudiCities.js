// Saudi Arabia Major Industrial Cities & Logistics Hubs for RFQs

export const SAUDI_CITIES = [
  { name: 'Al-Khobar', region: 'Eastern Province', hub: 'Central Warehouse Hub', popular: true },
  { name: 'Dammam', region: 'Eastern Province', hub: 'King Abdulaziz Port & 2nd Industrial', popular: true },
  { name: 'Jubail Industrial City', region: 'Eastern Province', hub: 'Royal Commission & Petrochemical Hub', popular: true },
  { name: 'Ras Tanura', region: 'Eastern Province', hub: 'Refinery & Marine Terminal', popular: true },
  { name: 'Riyadh', region: 'Central Province', hub: 'Kingdom Capital Central Logistics', popular: true },
  { name: 'Jeddah', region: 'Western Province', hub: 'Islamic Port & Commercial Logistics', popular: true },
  { name: 'Yanbu Industrial City', region: 'Western Province', hub: 'Red Sea Petrochemical Hub', popular: true },
  { name: 'Rabigh', region: 'Western Province', hub: 'King Abdullah Port & Refining', popular: false },
  { name: 'Hofuf / Al-Ahsa', region: 'Eastern Province', hub: 'Ghawar Oilfield Support', popular: false },
  { name: 'Khafji', region: 'Eastern Province', hub: 'Offshore & Neutral Zone Operations', popular: false },
  { name: 'Tabuk / NEOM', region: 'Tabuk Province', hub: 'Mega-Project Logistics Corridor', popular: true },
  { name: 'Jazan', region: 'Jazan Province', hub: 'Economic City & Aramco Refinery', popular: false },
  { name: 'Abha / Khamis Mushait', region: 'Asir Province', hub: 'Southern Logistics Center', popular: false },
  { name: 'Medina', region: 'Al Madinah', hub: 'Knowledge Economic City', popular: false },
  { name: 'Mecca', region: 'Makkah Region', hub: 'Infrastructure & Projects', popular: false },
  { name: 'Ha\'il', region: 'Ha\'il Province', hub: 'Northern Logistics Link', popular: false },
  { name: 'Turaif / Waad Al Shamal', region: 'Northern Borders', hub: 'Phosphate Mining & Industrial City', popular: false },
  { name: 'Other / Kingdom-Wide', region: 'Kingdom-Wide', hub: 'Express Door-to-Site Dispatch', popular: false }
];

export const POPULAR_SAUDI_CITIES = SAUDI_CITIES.filter(c => c.popular);
