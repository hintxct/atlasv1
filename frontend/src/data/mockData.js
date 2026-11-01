// ============================================================
// ATLAS demo data — powers the full experience while offline.
// Swap these with live API / socket payloads when the backend
// is connected; every dashboard already mutates local state.
// ============================================================

export const CHART_TOOLTIP_STYLE = {
  background: 'rgba(13,17,23,0.95)',
  border: '1px solid rgba(201,169,110,0.3)',
  borderRadius: 12,
  color: '#ede6d6',
  fontSize: 12,
};

export const CONVOYS = [
  { id: 'CV-2201', driver: 'Rajesh Kumar', cargo: 'Medicine', from: 'Guwahati', to: 'Tawang', lat: 26.63, lng: 92.10, status: 'in_progress', progress: 62, speed: 48, eta: '3h 40m', priority: 'emergency' },
  { id: 'CV-2202', driver: 'Bikash Deka', cargo: 'Food Grain', from: 'Silchar', to: 'Aizawl', lat: 24.20, lng: 92.85, status: 'in_progress', progress: 41, speed: 38, eta: '5h 10m', priority: 'high' },
  { id: 'CV-2203', driver: 'Tashi Norbu', cargo: 'Construction', from: 'Gangtok', to: 'Kalimpong', lat: 27.30, lng: 88.61, status: 'delayed', progress: 77, speed: 0, eta: 'Held — landslide', priority: 'medium' },
  { id: 'CV-2204', driver: 'John Sangma', cargo: 'General', from: 'Shillong', to: 'Agartala', lat: 24.90, lng: 91.60, status: 'in_progress', progress: 55, speed: 52, eta: '4h 05m', priority: 'low' },
  { id: 'CV-2205', driver: 'Moa Ao', cargo: 'Fuel Tanker', from: 'Dimapur', to: 'Kohima', lat: 25.83, lng: 93.95, status: 'in_progress', progress: 88, speed: 34, eta: '45m', priority: 'high' },
  { id: 'CV-2206', driver: 'Rina Devi', cargo: 'Medicine', from: 'Imphal', to: 'Churachandpur', lat: 24.55, lng: 93.80, status: 'in_progress', progress: 30, speed: 44, eta: '2h 20m', priority: 'emergency' },
  { id: 'CV-2207', driver: 'Karma Lepcha', cargo: 'Food Grain', from: 'Itanagar', to: 'Ziro', lat: 27.10, lng: 93.70, status: 'in_progress', progress: 18, speed: 40, eta: '3h 55m', priority: 'medium' },
  { id: 'CV-2208', driver: 'Lalrin Mawia', cargo: 'General', from: 'Aizawl', to: 'Lunglei', lat: 23.55, lng: 92.75, status: 'delayed', progress: 64, speed: 0, eta: 'Held — dense fog', priority: 'low' },
];

export const BLOCKAGES = [
  { id: 'BK-101', type: 'Landslide', location: 'NH-13 · Bomdila Pass', lat: 27.26, lng: 92.41, severity: 'critical', reportedBy: 'Rajesh Kumar', time: '25 min ago', status: 'active' },
  { id: 'BK-102', type: 'Flooding', location: 'NH-37 · Kaziranga Stretch', lat: 26.58, lng: 93.17, severity: 'high', reportedBy: 'Priya Sharma', time: '1h ago', status: 'active' },
  { id: 'BK-103', type: 'Heavy Fog', location: 'NH-6 · Shillong Bypass', lat: 25.60, lng: 91.90, severity: 'medium', reportedBy: 'Field Unit 7', time: '2h ago', status: 'active' },
  { id: 'BK-104', type: 'Fallen Trees', location: 'NH-102B · Ukhrul Road', lat: 24.98, lng: 94.35, severity: 'medium', reportedBy: 'Moa Ao', time: '3h ago', status: 'clearing' },
  { id: 'BK-105', type: 'Road Under Repair', location: 'NH-15 · Dibrugarh East', lat: 27.47, lng: 95.02, severity: 'low', reportedBy: 'District PWD', time: '6h ago', status: 'active' },
  { id: 'BK-106', type: 'Accident', location: 'NH-8 · Agartala Ring Road', lat: 23.85, lng: 91.28, severity: 'high', reportedBy: 'Field Unit 3', time: '40 min ago', status: 'clearing' },
];

export const DELIVERIES = [
  { id: 'DL-8801', cargo: 'Medicine', from: 'Guwahati', to: 'Tezpur', distance: '182 km', payout: 14500, priority: 'emergency', status: 'pending', vehicle: '10-ton Truck' },
  { id: 'DL-8802', cargo: 'Food Grain', from: 'Silchar', to: 'Imphal', distance: '214 km', payout: 16800, priority: 'high', status: 'pending', vehicle: '20-ton Truck' },
  { id: 'DL-8803', cargo: 'Construction', from: 'Shillong', to: 'Aizawl', distance: '296 km', payout: 21200, priority: 'medium', status: 'pending', vehicle: '20-ton Truck' },
  { id: 'DL-8804', cargo: 'General', from: 'Guwahati', to: 'Itanagar', distance: '318 km', payout: 19400, priority: 'low', status: 'pending', vehicle: 'Mini Truck' },
  { id: 'DL-8805', cargo: 'Emergency', from: 'Dimapur', to: 'Kohima', distance: '74 km', payout: 9800, priority: 'emergency', status: 'pending', vehicle: 'Mini Truck' },
  { id: 'DL-8806', cargo: 'Food Grain', from: 'Agartala', to: 'Aizawl', distance: '342 km', payout: 23600, priority: 'high', status: 'pending', vehicle: '10-ton Truck' },
];

export const STATE_STATS = [
  { name: 'Assam', convoys: 96, roadsOpen: 88, alerts: 3, status: 'stable' },
  { name: 'Arunachal Pradesh', convoys: 41, roadsOpen: 71, alerts: 4, status: 'watch' },
  { name: 'Manipur', convoys: 33, roadsOpen: 79, alerts: 2, status: 'stable' },
  { name: 'Meghalaya', convoys: 28, roadsOpen: 84, alerts: 1, status: 'stable' },
  { name: 'Mizoram', convoys: 22, roadsOpen: 68, alerts: 2, status: 'watch' },
  { name: 'Nagaland', convoys: 30, roadsOpen: 81, alerts: 0, status: 'stable' },
  { name: 'Sikkim', convoys: 18, roadsOpen: 62, alerts: 3, status: 'critical' },
  { name: 'Tripura', convoys: 26, roadsOpen: 90, alerts: 1, status: 'stable' },
];

export const WEEKLY_FLOW = [
  { day: 'Mon', deliveries: 186, disruptions: 9 },
  { day: 'Tue', deliveries: 204, disruptions: 6 },
  { day: 'Wed', deliveries: 178, disruptions: 14 },
  { day: 'Thu', deliveries: 232, disruptions: 8 },
  { day: 'Fri', deliveries: 251, disruptions: 5 },
  { day: 'Sat', deliveries: 219, disruptions: 11 },
  { day: 'Sun', deliveries: 164, disruptions: 7 },
];

export const WEEKLY_EARNINGS = [
  { day: 'Mon', earnings: 4200 },
  { day: 'Tue', earnings: 5100 },
  { day: 'Wed', earnings: 3800 },
  { day: 'Thu', earnings: 6400 },
  { day: 'Fri', earnings: 7200 },
  { day: 'Sat', earnings: 5800 },
  { day: 'Sun', earnings: 3100 },
];

export const BLOCKAGE_MIX = [
  { name: 'Landslide', value: 34 },
  { name: 'Flooding', value: 22 },
  { name: 'Heavy Fog', value: 18 },
  { name: 'Accident', value: 12 },
  { name: 'Repair Work', value: 14 },
];

export const ALERT_FEED = [
  { id: 'AL-1', severity: 'critical', title: 'Landslide on NH-13', detail: 'Bomdila Pass fully blocked — 3 convoys held. Dozer dispatched.', time: '25 min ago' },
  { id: 'AL-2', severity: 'high', title: 'Flash flood warning', detail: 'Kaziranga stretch of NH-37 waterlogging above axle level.', time: '1h ago' },
  { id: 'AL-3', severity: 'high', title: 'Fuel tanker delayed', detail: 'CV-2205 rerouted via NH-29 — ETA revised +50 min.', time: '2h ago' },
  { id: 'AL-4', severity: 'medium', title: 'Dense fog advisory', detail: 'Shillong Bypass visibility under 40 m until 09:00 IST.', time: '3h ago' },
  { id: 'AL-5', severity: 'medium', title: 'Bridge load restriction', detail: 'Barak Bridge limited to 10-ton vehicles for 48 hours.', time: '5h ago' },
  { id: 'AL-6', severity: 'low', title: 'Convoy milestone', detail: 'Medicine convoy CV-2206 crossed into Churachandpur sector.', time: '6h ago' },
];

export const PENDING_APPROVALS = [
  { id: 'U-101', name: 'David Khongsai', role: 'Driver', phone: '9864210375', district: 'Kamrup', applied: '2h ago' },
  { id: 'U-102', name: 'Mary Lyngdoh', role: 'Field Official', phone: '9864210382', district: 'East Khasi Hills', applied: '5h ago' },
  { id: 'U-103', name: 'Sanjay Boro', role: 'Driver', phone: '9864210391', district: 'Dibrugarh', applied: '8h ago' },
  { id: 'U-104', name: 'Lalthan Zuala', role: 'Field Official', phone: '9864210404', district: 'Aizawl', applied: '1d ago' },
];

export const VERIFY_QUEUE = [
  { id: 'VR-301', type: 'Landslide', location: 'NH-13 · Sela Pass approach', reportedBy: 'Rajesh Kumar', time: '35 min ago', severity: 'critical' },
  { id: 'VR-302', type: 'Fallen Trees', location: 'NH-715 · Nameri Forest', reportedBy: 'Bikash Deka', time: '1h ago', severity: 'medium' },
  { id: 'VR-303', type: 'Flooding', location: 'NH-37 · Golaghat Lowland', reportedBy: 'Rina Devi', time: '2h ago', severity: 'high' },
  { id: 'VR-304', type: 'Accident', location: 'NH-6 · Jowai Junction', reportedBy: 'John Sangma', time: '4h ago', severity: 'medium' },
];

export const ACTIVITY = [
  { text: 'Delivered DL-8796 to Tezpur Civil Hospital', time: '2h ago', tone: 'emerald' },
  { text: 'Reported landslide near Bomdila Pass', time: '5h ago', tone: 'red' },
  { text: 'Route auto-updated via NH-15 corridor', time: '8h ago', tone: 'sky' },
  { text: 'Bonus ₹1,200 credited for verified report', time: '1d ago', tone: 'gold' },
  { text: 'Completed 4 deliveries this week', time: '1d ago', tone: 'emerald' },
];

export const TICKER_ITEMS = [
  { severity: 'critical', text: 'NH-13 Bomdila Pass — landslide, road closed' },
  { severity: 'high', text: 'NH-37 Kaziranga — flooding above axle level' },
  { severity: 'medium', text: 'NH-6 Shillong Bypass — dense fog advisory' },
  { severity: 'high', text: 'CV-2205 fuel tanker rerouted via NH-29' },
  { severity: 'medium', text: 'Barak Bridge — 10-ton load restriction 48h' },
  { severity: 'low', text: 'CV-2206 medicine convoy entered Churachandpur' },
  { severity: 'medium', text: 'NH-102B Ukhrul — fallen trees, clearing underway' },
];

export const ROUTE_OPTIONS = [
  {
    id: 'route-a',
    name: 'Route A',
    tag: 'Recommended',
    from: 'Guwahati',
    to: 'Tawang',
    via: 'Tezpur → Bomdila → Sela Pass',
    distanceKm: 325,
    eta: '8h 30m',
    risk: 18,
    roadCondition: 82,
    weatherRisk: 28,
    trafficRisk: 22,
    landslideRisk: 16,
    floodRisk: 8,
    delay: '+15 min',
    reason: 'Best live balance for public travel and medicine delivery.',
    warning: 'Minor rain watch near Bomdila, road still open.',
    color: '#34d399',
    tone: 'emerald',
    path: [[26.14, 91.73], [26.63, 92.10], [27.05, 92.28], [27.26, 92.41], [27.59, 91.87]],
  },
  {
    id: 'route-b',
    name: 'Route B',
    tag: 'Shortest but risky',
    from: 'Guwahati',
    to: 'Tawang',
    via: 'Mangaldoi → Orang → Sela approach',
    distanceKm: 280,
    eta: '7h 00m',
    risk: 68,
    roadCondition: 46,
    weatherRisk: 66,
    trafficRisk: 42,
    landslideRisk: 74,
    floodRisk: 20,
    delay: '+1h 45m',
    reason: 'Short route, but landslide probability is high near hill stretch.',
    warning: 'Avoid for tourist and heavy essential-goods movement right now.',
    color: '#f87171',
    tone: 'red',
    path: [[26.14, 91.73], [26.45, 91.98], [26.88, 92.22], [27.30, 92.42], [27.59, 91.87]],
  },
  {
    id: 'route-c',
    name: 'Route C',
    tag: 'Safest alternate',
    from: 'Guwahati',
    to: 'Tawang',
    via: 'Nagaon → Tezpur relief corridor → West Kameng',
    distanceKm: 410,
    eta: '11h 00m',
    risk: 7,
    roadCondition: 88,
    weatherRisk: 12,
    trafficRisk: 18,
    landslideRisk: 5,
    floodRisk: 6,
    delay: '+2h 30m',
    reason: 'Longer but safest for hospital, food and medicine priority.',
    warning: 'Recommended when emergency priority is active.',
    color: '#38bdf8',
    tone: 'sky',
    path: [[26.14, 91.73], [26.18, 92.35], [26.65, 92.78], [27.08, 92.62], [27.59, 91.87]],
  },
  {
    id: 'route-d',
    name: 'Route D',
    tag: 'Flood-aware bypass',
    from: 'Guwahati',
    to: 'Tawang',
    via: 'North bank road → Bhalukpong → Dirang',
    distanceKm: 365,
    eta: '9h 50m',
    risk: 29,
    roadCondition: 74,
    weatherRisk: 35,
    trafficRisk: 24,
    landslideRisk: 22,
    floodRisk: 10,
    delay: '+50 min',
    reason: 'Avoids Kaziranga flood belt and keeps essential vehicles moving.',
    warning: 'Use for food/fuel convoys if NH-37 flood level rises.',
    color: '#fbbf24',
    tone: 'amber',
    path: [[26.14, 91.73], [26.72, 91.96], [27.02, 92.38], [27.36, 92.24], [27.59, 91.87]],
  },
];

export const EMERGENCY_PRIORITIES = [
  { id: 'hospital', label: 'Hospital access', cargo: 'Ambulance / patient movement', route: 'Route C', priority: 'critical', eta: 'Fastest safe medical corridor' },
  { id: 'medicine', label: 'Medicine supply', cargo: 'Emergency medicines / vaccines', route: 'Route C', priority: 'critical', eta: 'Safest low-risk route' },
  { id: 'food', label: 'Food supply', cargo: 'Rice, grain and relief food', route: 'Route D', priority: 'high', eta: 'Flood-aware bypass' },
  { id: 'fuel', label: 'Fuel supply', cargo: 'Fuel tanker movement', route: 'Route A', priority: 'high', eta: 'Bridge/load checked route' },
  { id: 'relief', label: 'Disaster relief', cargo: 'NDRF / SDRF relief material', route: 'Route C', priority: 'critical', eta: 'Emergency-only corridor' },
];

export const LOCAL_LANGUAGE_ALERTS = [
  {
    code: 'en',
    label: 'English',
    short: 'EN',
    message: 'Alert: NH-13 has landslide risk. Use the safer alternate route.',
    safe: 'Safe route selected for travel and essential supply movement.',
  },
  {
    code: 'hi',
    label: 'Hindi',
    short: 'HI',
    message: 'सतर्कता: NH-13 पर भूस्खलन का खतरा है। सुरक्षित वैकल्पिक मार्ग लें।',
    safe: 'यात्रा और आवश्यक आपूर्ति के लिए सुरक्षित मार्ग चुना गया है।',
  },
  {
    code: 'as',
    label: 'Assamese',
    short: 'অসম',
    message: 'সতৰ্কতা: NH-13ত ভূমিস্খলনৰ আশংকা আছে। সুৰক্ষিত বিকল্প পথ ব্যৱহাৰ কৰক।',
    safe: 'যাত্ৰা আৰু জৰুৰী সামগ্ৰীৰ বাবে সুৰক্ষিত পথ বাছনি কৰা হৈছে।',
  },
  {
    code: 'bn',
    label: 'Bengali',
    short: 'BN',
    message: 'সতর্কতা: NH-13 পথে ভূমিধসের ঝুঁকি আছে। নিরাপদ বিকল্প রুট নিন।',
    safe: 'ভ্রমণ ও জরুরি সরবরাহের জন্য নিরাপদ রুট নির্বাচন করা হয়েছে।',
  },
  {
    code: 'mni',
    label: 'Manipuri',
    short: 'MNI',
    message: 'Alert: NH-13 da landslide risk leiri. Safer alternate route sijinnou.',
    safe: 'Travel amasung essential supply gidamak safe route selected toure.',
  },
  {
    code: 'lus',
    label: 'Mizo',
    short: 'MZ',
    message: 'Fimkhur rawh: NH-13 ah leimin hlauhawm a awm. Kawng dang him zawk hmang rawh.',
    safe: 'Zin leh mamawh thil phurhna atan kawng him zawk thlan a ni.',
  },
  {
    code: 'kha',
    label: 'Khasi',
    short: 'KH',
    message: 'Ka jingma: NH-13 ka don ka jingma twa khyndew. Pyndonkam ka lynti kaba kham turvall.',
    safe: 'La jied ka lynti kaba kham shngain na ka bynta ka leit ka wan bad ki mar donkam.',
  },
];

