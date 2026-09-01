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

// Paystack sends x-paystack-signature header which is HMAC SHA512 of the raw body
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET) return res.status(500).send('Missing PAYSTACK_SECRET_KEY');

  // Read raw body - Vercel may have parsed JSON already, but webhook signature requires raw
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  const signature = req.headers['x-paystack-signature'];
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex');
  if (signature !== hash) {
    return res.status(400).send('Invalid signature');
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return res.status(400).send('Invalid JSON');
  }

  // Identify reference and status
  const event = payload.event;
  const data = payload.data || {};
  const reference = data.reference || (data.transaction && data.transaction.reference);
  const status = data.status || (data.transaction && data.transaction.status);

  if (!reference) {
    return res.status(400).send('Missing reference');
  }

  // Read orders and update
  const orders = await readOrders();
  const idx = orders.findIndex(o => o.orderId === reference || (o.paystack && o.paystack.reference === reference));
  if (idx === -1) {
    // unknown order - still ack
    return res.status(200).send('ok');
  }

  const order = orders[idx];
  if (status === 'success' || status === 'successful') {
    order.status = 'successful';
    order.confirmedAt = new Date().toISOString();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: 'successful', at: new Date().toISOString(), by: 'Paystack webhook' });
  } else if (status === 'failed') {
    order.status = 'failed';
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status: 'failed', at: new Date().toISOString(), by: 'Paystack webhook' });
  } else {
    // mark processing (pending)
    order.status = 'processing';
  }

  orders[idx] = order;
  await writeOrders(orders);

  // Acknowledge to Paystack
  res.status(200).send('ok');
};
