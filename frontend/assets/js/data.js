export const inventoryItems = [
  { sku: "CA-AMX-500", name: "Amoxicillin", strength: "500 mg", form: "Capsule", category: "Antibiotics", onHand: 24, reorder: 10, price: 12.4, expiry: "12 Aug 2026", controlled: false, status: "in" },
  { sku: "CA-IBU-200", name: "Ibuprofen", strength: "200 mg", form: "Tablet", category: "Analgesics", onHand: 8, reorder: 20, price: 5.1, expiry: "03 Mar 2027", controlled: false, status: "low" },
  { sku: "CA-MET-850", name: "Metformin", strength: "850 mg", form: "Tablet", category: "Diabetes", onHand: 61, reorder: 25, price: 9.75, expiry: "21 Nov 2026", controlled: false, status: "in" },
  { sku: "CA-OXY-05", name: "Oxycodone", strength: "5 mg", form: "Tablet", category: "Opioids", onHand: 14, reorder: 10, price: 28.9, expiry: "09 Jun 2026", controlled: true, status: "controlled" },
  { sku: "CA-LIS-10", name: "Lisinopril", strength: "10 mg", form: "Tablet", category: "Cardiovascular", onHand: 0, reorder: 15, price: 7.3, expiry: "30 Jan 2027", controlled: false, status: "out" },
  { sku: "CA-SAL-100", name: "Salbutamol", strength: "100 mcg", form: "Inhaler", category: "Respiratory", onHand: 5, reorder: 12, price: 14.2, expiry: "18 Jul 2026", controlled: false, status: "low" },
  { sku: "CA-ATO-20", name: "Atorvastatin", strength: "20 mg", form: "Tablet", category: "Cardiovascular", onHand: 88, reorder: 30, price: 11.05, expiry: "14 Sep 2027", controlled: false, status: "in" },
  { sku: "CA-DIA-05", name: "Diazepam", strength: "5 mg", form: "Tablet", category: "Anxiolytics", onHand: 9, reorder: 8, price: 19.6, expiry: "02 May 2026", controlled: true, status: "controlled" },
  { sku: "CA-PAR-500", name: "Paracetamol", strength: "500 mg", form: "Tablet", category: "Analgesics", onHand: 142, reorder: 40, price: 3.8, expiry: "27 Dec 2027", controlled: false, status: "in" },
  { sku: "CA-OME-20", name: "Omeprazole", strength: "20 mg", form: "Capsule", category: "Gastro", onHand: 33, reorder: 20, price: 8.45, expiry: "05 Apr 2026", controlled: false, status: "expiring" },
  { sku: "CA-CET-10", name: "Cetirizine", strength: "10 mg", form: "Tablet", category: "Antihistamine", onHand: 56, reorder: 25, price: 4.6, expiry: "11 Oct 2027", controlled: false, status: "in" },
  { sku: "CA-AML-5", name: "Amlodipine", strength: "5 mg", form: "Tablet", category: "Cardiovascular", onHand: 18, reorder: 20, price: 6.9, expiry: "22 Feb 2026", controlled: false, status: "low" },
];

export const prescriptionQueue = [
  { id: "RX-10293", patient: "Amara Okafor", state: "new" },
  { id: "RX-10294", patient: "James Whitlock", state: "verifying" },
  { id: "RX-10295", patient: "Sofia Marchetti", state: "verifying" },
  { id: "RX-10296", patient: "Daniel Kim", state: "ready" },
  { id: "RX-10297", patient: "Grace Mensah", state: "ready" },
  { id: "RX-10298", patient: "Tomas Rivera", state: "dispensed" },
];

export const branch = {
  name: "Riverside branch",
  shiftLead: "Jade Okafor",
  role: "Pharmacist",
};

export const navigation = [
  { id: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "layout-dashboard" },
  { id: "inventory", label: "Inventory", href: "inventory.html", icon: "package" },
  { id: "pos", label: "Point of sale", href: "pos.html", icon: "shopping-cart" },
  { id: "prescriptions", label: "Prescriptions", href: "prescriptions.html", icon: "clipboard-list" },
  { id: "patients", label: "Patients", href: "patients.html", icon: "users" },
  { id: "orders", label: "Orders", href: "orders.html", icon: "truck" },
];