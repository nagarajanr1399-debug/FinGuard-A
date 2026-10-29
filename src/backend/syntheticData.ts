/**
 * FinGuard AI — Synthetic Financial Dataset Generator
 * Track 01: Money, Risk & Regulation | ExaThon India 2026
 * Generates realistic retail, SME, corporate, and fraud ring transaction patterns.
 */

import { Customer, Transaction, PaymentChannel } from './types.ts';

// PRNG for 100% reproducible test data
class LCG {
  private m = 0x80000000;
  private a = 1103515245;
  private c = 12345;
  private state: number;

  constructor(seed: number) {
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }

  next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(array: T[]): T {
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }
}

export interface SyntheticDataset {
  customers: Customer[];
  transactions: Transaction[];
  metadata: {
    generated_at: string;
    seed: number;
    customer_count: number;
    transaction_count: number;
    typology_counts: {
      mule_ring: number;
      structuring_cluster: number;
      account_takeover: number;
      geo_anomaly: number;
      normal: number;
    };
  };
}

const INDIAN_CITIES = [
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Delhi NCR', lat: 28.7041, lon: 77.1025 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
];

const GLOBAL_OFFSHORE = [
  { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708, country: 'ARE', bank: 'Emirates NBD' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'SGP', bank: 'DBS Bank Singapore' },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278, country: 'GBR', bank: 'Barclays UK' },
  { name: 'Zurich, Switzerland', lat: 47.3769, lon: 8.5417, country: 'CHE', bank: 'UBS Zurich' },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, country: 'HKG', bank: 'HSBC Hong Kong' },
];

const BANKS = [
  'HDFC Bank Ltd',
  'State Bank of India',
  'ICICI Bank Ltd',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Federal Bank',
  'IndusInd Bank',
];

const NORMAL_MERCHANTS = [
  { cat: 'GROCERY_DELIVERY', desc: 'Blinkit / Zepto Quick Commerce' },
  { cat: 'UTILITIES', desc: 'BESCOM Electricity Bill Auto-Pay' },
  { cat: 'E_COMMERCE', desc: 'Amazon India Retail Purchase' },
  { cat: 'DINING', desc: 'Swiggy / Zomato Online Order' },
  { cat: 'SUBSCRIPTION', desc: 'Netflix / Spotify Digital Services' },
  { cat: 'SALARY_CREDIT', desc: 'Monthly Payroll Disbursement' },
  { cat: 'INVESTMENT', desc: 'Zerodha Broking SIP Investment' },
  { cat: 'FUEL_TRANSPORT', desc: 'HPCL Fuel Station UPI' },
  { cat: 'HEALTHCARE', desc: 'Apollo Pharmacy Medical Supplies' },
  { cat: 'TELECOM', desc: 'Airtel Broadband Prepaid Recharge' },
];

export function generateSyntheticDataset(seed: number = 2026, targetTxnCount: number = 250): SyntheticDataset {
  const rng = new LCG(seed);
  const now = new Date('2026-10-29T10:00:00Z').getTime();

  // 1. Build Archetype Customers
  const customerProfiles: {
    name: string;
    segment: 'RETAIL' | 'SME' | 'CORPORATE' | 'HNI';
    avgAmt: number;
    stdDev: number;
    monthlyVol: number;
    dormantDaysAgo?: number;
  }[] = [
    { name: 'Aarav Sharma', segment: 'RETAIL', avgAmt: 1850, stdDev: 620, monthlyVol: 45000 },
    { name: 'Priya Narang', segment: 'RETAIL', avgAmt: 3200, stdDev: 1100, monthlyVol: 65000 },
    { name: 'Rajesh Verma (Apex Traders)', segment: 'SME', avgAmt: 42000, stdDev: 15000, monthlyVol: 850000 },
    { name: 'Kavita Iyer (Zenith Exports)', segment: 'CORPORATE', avgAmt: 280000, stdDev: 85000, monthlyVol: 6200000 },
    { name: 'Vikramaditya Singhania', segment: 'HNI', avgAmt: 125000, stdDev: 45000, monthlyVol: 2400000 },
    { name: 'Rohit K. Deshmukh', segment: 'RETAIL', avgAmt: 2100, stdDev: 800, monthlyVol: 52000 },
    { name: 'Ananya Banerjee', segment: 'RETAIL', avgAmt: 4500, stdDev: 1400, monthlyVol: 88000 },
    { name: 'Siddharth M. Nair', segment: 'RETAIL', avgAmt: 1200, stdDev: 450, monthlyVol: 35000, dormantDaysAgo: 125 }, // Dormant victim
    { name: 'Meera Krishnan (FinTech Global)', segment: 'SME', avgAmt: 35000, stdDev: 12000, monthlyVol: 720000 },
    { name: 'Karanvir Grover (FastPay Merchant)', segment: 'SME', avgAmt: 8500, stdDev: 3000, monthlyVol: 250000 }, // Mule funnel
  ];

  const customers: Customer[] = customerProfiles.map((p, index) => {
    const custId = `CUST-${String(index + 101).padStart(4, '0')}`;
    const createdDaysAgo = Math.floor(rng.range(180, 900));
    const createdDate = new Date(now - createdDaysAgo * 86400000).toISOString();
    
    let lastActive = new Date(now - Math.floor(rng.range(1, 10)) * 86400000).toISOString();
    if (p.dormantDaysAgo) {
      lastActive = new Date(now - p.dormantDaysAgo * 86400000).toISOString();
    }

    return {
      customer_id: custId,
      full_name: p.name,
      email: `${p.name.toLowerCase().replace(/[^a-z]/g, '')}@finguard-demo.in`,
      segment: p.segment,
      kyc_status: p.dormantDaysAgo ? 'PENDING_RECHECK' : 'VERIFIED',
      risk_tier: p.dormantDaysAgo ? 'HIGH' : (p.segment === 'HNI' ? 'MEDIUM' : 'LOW'),
      account_created_at: createdDate,
      monthly_avg_volume: p.monthlyVol,
      avg_txn_amount: p.avgAmt,
      std_dev_amount: p.stdDev,
      primary_country: 'IND',
      device_count: p.segment === 'CORPORATE' ? 5 : (p.segment === 'HNI' ? 3 : 2),
      last_activity_at: lastActive,
    };
  });

  const transactions: Transaction[] = [];
  let txnCounter = 9001;

  // --- Typology 1: Mule Pass-through Ring (Bengaluru Mule) ---
  // Customer 9 (Karanvir / CUST-0110) receives multiple quick incoming transfers and sends 98% out to UAE offshore account within 12 minutes
  const muleCust = customers[9];
  const ringStartTime = now - 45 * 60 * 1000; // 45 mins ago
  const muleSenders = ['Aakash Logistics', 'Vertex Media', 'BlueSky Retailers'];

  muleSenders.forEach((sender, i) => {
    const amt = 480000 + i * 25000;
    transactions.push({
      txn_id: `TXN-${txnCounter++}-IN`,
      customer_id: muleCust.customer_id,
      timestamp: new Date(ringStartTime + i * 2 * 60 * 1000).toISOString(),
      amount: amt,
      currency: 'INR',
      channel: 'IMPS',
      counterparty_id: `CP-MULE-SRC-${i + 1}`,
      counterparty_name: sender,
      counterparty_bank: rng.choice(BANKS),
      counterparty_country: 'IND',
      is_new_beneficiary: true,
      ip_address: '103.212.45.18',
      geo_lat: 12.9716,
      geo_lon: 77.5946,
      device_id: 'DEV-MULE-NODE-1',
      merchant_category: 'P2P_TRANSFER',
      description: `Rapid inbound liquidity tranche from ${sender}`,
      status: 'FLAGGED',
    });
  });

  // Outbound drain from mule account to Dubai offshore recipient
  const totalInbound = 480000 + 505000 + 530000;
  transactions.push({
    txn_id: `TXN-${txnCounter++}-IN`,
    customer_id: muleCust.customer_id,
    timestamp: new Date(ringStartTime + 11 * 60 * 1000).toISOString(),
    amount: Math.round(totalInbound * 0.985),
    currency: 'INR',
    channel: 'RTGS',
    counterparty_id: 'CP-OFFSHORE-DXB-99',
    counterparty_name: 'Al-Mansoor Holdings FZE',
    counterparty_bank: 'Emirates NBD Dubai',
    counterparty_country: 'ARE',
    is_new_beneficiary: true,
    ip_address: '103.212.45.18',
    geo_lat: 12.9716,
    geo_lon: 77.5946,
    device_id: 'DEV-MULE-NODE-1',
    merchant_category: 'OFFSHORE_WIRE',
    description: 'Urgent offshore trade clearance balance settlement',
    status: 'FLAGGED',
  });

  // --- Typology 2: Structuring / Smurfing Burst ---
  // Customer 0 (Aarav / CUST-0101) makes 7 rapid UPI transactions between ₹48,000 and ₹49,800 to bypass ₹50,000 reporting threshold
  const structCust = customers[0];
  const structStartTime = now - 120 * 60 * 1000; // 2 hours ago
  const structuredAmounts = [48500, 49200, 48900, 49500, 47800, 49100];

  structuredAmounts.forEach((amt, idx) => {
    transactions.push({
      txn_id: `TXN-${txnCounter++}-IN`,
      customer_id: structCust.customer_id,
      timestamp: new Date(structStartTime + idx * 3 * 60 * 1000).toISOString(),
      amount: amt,
      currency: 'INR',
      channel: 'UPI',
      counterparty_id: 'CP-CRYPTO-OTC-88',
      counterparty_name: 'BitCoin India P2P Escrow',
      counterparty_bank: 'Federal Bank',
      counterparty_country: 'IND',
      is_new_beneficiary: true,
      ip_address: '49.207.188.42',
      geo_lat: 28.7041,
      geo_lon: 77.1025,
      device_id: 'DEV-STRUCT-V2',
      merchant_category: 'CRYPTO_EXCHANGE',
      description: `Structured micro-settlement token buy #${idx + 1}`,
      status: 'FLAGGED',
    });
  });

  // --- Typology 3: Account Takeover of Dormant Customer ---
  // Customer 7 (Siddharth / CUST-0108) was dormant for 125 days, suddenly issues massive IMPS transfer
  const dormantCust = customers[7];
  transactions.push({
    txn_id: `TXN-${txnCounter++}-IN`,
    customer_id: dormantCust.customer_id,
    timestamp: new Date(now - 15 * 60 * 1000).toISOString(),
    amount: 185000,
    currency: 'INR',
    channel: 'IMPS',
    counterparty_id: 'CP-UNKNOWN-BENEF-44',
    counterparty_name: 'Sahil Gold Bullion Trader',
    counterparty_bank: 'Kotak Mahindra Bank',
    counterparty_country: 'IND',
    is_new_beneficiary: true,
    ip_address: '182.74.88.19',
    geo_lat: 22.5726,
    geo_lon: 88.3639,
    device_id: 'DEV-NEW-UNKNOWN-MAC',
    merchant_category: 'HIGH_VALUE_JEWELLERY',
    description: 'Immediate gold sovereign purchase & locker delivery',
    status: 'FLAGGED',
  });

  // --- Typology 4: Impossible Geolocation Jump ---
  // Customer 1 (Priya / CUST-0102) makes transaction in Mumbai at 08:00, then in London at 08:25
  const geoCust = customers[1];
  const geoTime = now - 3 * 3600 * 1000;
  transactions.push({
    txn_id: `TXN-${txnCounter++}-IN`,
    customer_id: geoCust.customer_id,
    timestamp: new Date(geoTime).toISOString(),
    amount: 4500,
    currency: 'INR',
    channel: 'UPI',
    counterparty_id: 'CP-CAFE-MUMBAI',
    counterparty_name: 'Blue Tokai Coffee Roasters',
    counterparty_bank: 'HDFC Bank Ltd',
    counterparty_country: 'IND',
    is_new_beneficiary: false,
    ip_address: '115.112.44.12',
    geo_lat: 19.0760,
    geo_lon: 72.8777,
    device_id: 'DEV-PRIYA-IPHONE',
    merchant_category: 'DINING',
    description: 'Morning breakfast coffee UPI transfer',
    status: 'NORMAL',
  });

  transactions.push({
    txn_id: `TXN-${txnCounter++}-IN`,
    customer_id: geoCust.customer_id,
    timestamp: new Date(geoTime + 22 * 60 * 1000).toISOString(), // 22 minutes later
    amount: 320000,
    currency: 'INR',
    channel: 'CARD',
    counterparty_id: 'CP-LUXURY-LDN',
    counterparty_name: 'Harrods Knightsbridge London',
    counterparty_bank: 'Barclays UK',
    counterparty_country: 'GBR',
    is_new_beneficiary: true,
    ip_address: '82.165.197.1',
    geo_lat: 51.5074,
    geo_lon: -0.1278,
    device_id: 'DEV-UNKNOWN-BROWSER',
    merchant_category: 'LUXURY_GOODS',
    description: 'High-end designer watch POS swipe',
    status: 'FLAGGED',
  });

  // --- Normal Realistic Background Transactions ---
  const remainingCount = targetTxnCount - transactions.length;
  const channels: PaymentChannel[] = ['UPI', 'UPI', 'UPI', 'IMPS', 'CARD', 'CARD', 'NEFT', 'RTGS'];

  for (let i = 0; i < remainingCount; i++) {
    const cust = rng.choice(customers);
    const city = rng.choice(INDIAN_CITIES);
    const merchant = rng.choice(NORMAL_MERCHANTS);
    const channel = rng.choice(channels);

    // Realistic Gaussian-like amount around customer mean
    const variance = (rng.next() - 0.5) * 1.5;
    let amt = Math.round(Math.max(50, cust.avg_txn_amount + variance * cust.std_dev_amount));
    if (cust.segment === 'CORPORATE') amt = Math.round(rng.range(50000, 800000));
    else if (cust.segment === 'HNI') amt = Math.round(rng.range(15000, 250000));

    // Distribution across past 7 days
    const hoursAgo = rng.range(0.5, 168);
    const txnDate = new Date(now - hoursAgo * 3600 * 1000).toISOString();

    transactions.push({
      txn_id: `TXN-${txnCounter++}-IN`,
      customer_id: cust.customer_id,
      timestamp: txnDate,
      amount: amt,
      currency: 'INR',
      channel: channel,
      counterparty_id: `CP-NORM-${Math.floor(rng.range(100, 999))}`,
      counterparty_name: merchant.desc.split(' ')[0] + ' Vendor Network',
      counterparty_bank: rng.choice(BANKS),
      counterparty_country: 'IND',
      is_new_beneficiary: rng.next() > 0.85,
      ip_address: `103.${Math.floor(rng.range(50, 240))}.${Math.floor(rng.range(10, 250))}.${Math.floor(rng.range(1, 250))}`,
      geo_lat: city.lat + (rng.next() - 0.5) * 0.08,
      geo_lon: city.lon + (rng.next() - 0.5) * 0.08,
      device_id: `DEV-${cust.customer_id.substring(5)}-01`,
      merchant_category: merchant.cat,
      description: merchant.desc,
      status: 'NORMAL',
    });
  }

  // Sort descending by timestamp
  transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    customers,
    transactions,
    metadata: {
      generated_at: new Date(now).toISOString(),
      seed,
      customer_count: customers.length,
      transaction_count: transactions.length,
      typology_counts: {
        mule_ring: 4,
        structuring_cluster: 6,
        account_takeover: 1,
        geo_anomaly: 2,
        normal: transactions.length - 13,
      },
    },
  };
}
