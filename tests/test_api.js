const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { Readable } = require('stream');

const ROOT = path.join(__dirname, '..');
const ORDERS_FILE = path.join(ROOT, 'data', 'orders.json');

async function readOrders() {
  try {
    const txt = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (e) {
    return [];
  }
}

async function run() {
  process.env.PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'test_secret_key';

  // Mock global.fetch used by api/create-payment.js
  global.fetch = async () => ({
    json: async () => ({ status: true, data: { reference: 'REF_TEST_123', authorization_url: 'https://paystack.test/checkout' } })
  });

  const createPayment = require('../api/create-payment');
  const webhook = require('../api/webhook');

  // Clean orders file
  await fs.writeFile(ORDERS_FILE, '[]');

  console.log('--- Running create-payment handler ---');
  const reqCreate = { method: 'POST', body: { orderId: 'TST-ORDER-1', amount: 2500, email: 'buyer@example.com' } };
  const resCreate = {
    _status: 200,
    _body: null,
    status(code) { this._status = code; return this; },
    json(obj) { this._body = obj; console.log('create-payment response:', obj); return this; }
  };

  await createPayment(reqCreate, resCreate);

  let orders = await readOrders();
  console.log('orders after create:', orders);

  console.log('\n--- Running webhook handler (simulated successful payment) ---');
  const payload = { event: 'charge.success', data: { reference: 'TST-ORDER-1', status: 'success' } };
  const rawBody = Buffer.from(JSON.stringify(payload));
  const sig = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');

  const reqWebhook = new Readable();
  reqWebhook._read = () => {};
  reqWebhook.push(rawBody);
  reqWebhook.push(null);
  reqWebhook.method = 'POST';
  reqWebhook.headers = { 'x-paystack-signature': sig };

  const resWebhook = {
    _status: 200,
    _body: null,
    status(code) { this._status = code; return this; },
    send(msg) { this._body = msg; console.log('webhook response:', msg); return this; }
  };

  await webhook(reqWebhook, resWebhook);

  orders = await readOrders();
  console.log('orders after webhook:', orders);

  // quick assertions
  const order = orders.find(o => o.orderId === 'TST-ORDER-1');
  if (!order) {
    console.error('Test failed: Order not found');
    process.exit(1);
  }
  if (order.status !== 'successful') {
    console.error('Test failed: Order status not updated to successful', order.status);
    process.exit(2);
  }

  console.log('\nAll tests passed locally.');
}

run().catch(err => { console.error(err); process.exit(99); });
