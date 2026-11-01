/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Get risk color
 */
export const getRiskColor = (riskScore) => {
  if (riskScore < 30) return '#10b981'; // green
  if (riskScore < 65) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

/**
 * Get risk label
 */
export const getRiskLabel = (riskScore) => {
  if (riskScore < 30) return 'Low Risk';
  if (riskScore < 65) return 'Medium Risk';
  return 'High Risk';
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: '#6b7280',
    assigned: '#3b82f6',
    in_progress: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    active: '#ef4444',
    cleared: '#10b981',
    approved: '#10b981',
    rejected: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    emergency: '#ef4444',
  };
  return colors[priority] || '#6b7280';
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Validate phone number (Indian)
 */
export const validatePhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Get NE states list
 */
export const NE_STATES = [
  'Assam',
  'Arunachal Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
];

/**
 * Get districts by state (sample)
 */
export const DISTRICTS_BY_STATE = {
  Assam: ['Kamrup', 'Dibrugarh', 'Jorhat', 'Tinsukia', 'Goalpara'],
  'Arunachal Pradesh': ['Tawang', 'West Kameng', 'East Kameng', 'Papum Pare'],
  Manipur: ['Imphal East', 'Imphal West', 'Thoubal', 'Bishnupur'],
  Meghalaya: ['East Khasi Hills', 'West Khasi Hills', 'Jaintia Hills'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung'],
  Sikkim: ['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim'],
  Tripura: ['West Tripura', 'Dhalai', 'North Tripura'],
};

/**
 * Get road types
 */
export const ROAD_TYPES = ['National Highway', 'State Highway', 'District Road'];

/**
 * Get blockage types
 */
export const BLOCKAGE_TYPES = [
  'Landslide',
  'Flooding',
  'Bridge Collapse',
  'Heavy Fog',
  'Road Under Repair',
  'Accident',
  'Animal Crossing',
  'Fallen Trees',
];

/**
 * Get cargo types
 */
export const CARGO_TYPES = ['Medicine', 'Food', 'Construction', 'General', 'Emergency'];

/**
 * Get vehicle types
 */
export const VEHICLE_TYPES = [
  '10-ton Truck',
  '20-ton Truck',
  'Tanker',
  'Ambulance',
  'Mini Truck',
];
