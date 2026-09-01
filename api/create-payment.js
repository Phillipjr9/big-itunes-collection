const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');

async function readOrders() {
  try {
    const txt = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (e) {
    return [];
  }
}

async function writeOrders(orders) {
  await fs.mkdir(path.dirname(ORDERS_FILE), { recursive: true });
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function kobo(amount) {
  return Math.round(Number(amount) * 100);
}

// Use native fetch when available (Node 18+ / Vercel), fallback to node-fetch if needed
const fetchImpl = global.fetch || (async (...args) => {
  const { default: nodeFetch } = await import('node-fetch');
  return nodeFetch(...args);
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orderId, amount, email } = req.body || {};
  if (!orderId || !amount || !email) return res.status(400).json({ error: 'orderId, amount and email required' });

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET) return res.status(500).json({ error: 'Missing PAYSTACK_SECRET_KEY env var' });

  // Prevent duplicate submissions by checking existing order
  const orders = await readOrders();
  const existing = orders.find(o => o.orderId === orderId);
  if (existing && (existing.status === 'pending' || existing.status === 'processing')) {
    return res.status(409).json({ error: 'Order already being processed', order: existing });
  }

  // create or update order to pending
  const order = {
    orderId,
    amount: Number(amount),
    currency: 'NGN',
    email,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const filtered = orders.filter(o => o.orderId !== orderId);
  filtered.push(order);
  await writeOrders(filtered);

  // Initialize Paystack transaction
  const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/payment-success.html`;

  const initResp = await fetchImpl('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      amount: kobo(amount),
      currency: 'NGN',
      reference: orderId,
      callback_url: callbackUrl
    })
  });

  const data = await initResp.json();
  if (!data || !data.status) {
    return res.status(502).json({ error: 'Failed to initialize payment', details: data });
  }

  // mark order as processing and save paystack metadata
  order.status = 'processing';
  order.paystack = { reference: data.data.reference, authorization_url: data.data.authorization_url };
  const updated = filtered.filter(o => o.orderId !== orderId);
  updated.push(order);
  await writeOrders(updated);

  return res.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
};
