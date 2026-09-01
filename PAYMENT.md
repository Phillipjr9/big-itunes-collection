Payment flow (Paystack) setup

Overview
- This project includes a minimal Vercel serverless implementation for initializing Paystack payments and handling webhooks.
- Files:
  - `api/create-payment.js` — serverless API to initialize a Paystack transaction (uses `PAYSTACK_SECRET_KEY`).
  - `api/webhook.js` — webhook endpoint to receive Paystack confirmations and update `data/orders.json`.
  - `js/payment.js` — frontend helper used by `checkout.html` to call the API and redirect to Paystack.

Important: Do NOT put secret keys in frontend code.

Vercel environment variables (set in the Vercel dashboard):
- `PAYSTACK_SECRET_KEY` — your Paystack secret key (starts with `sk_...`). Required.
- `PAYSTACK_PUBLIC_KEY` — optional, for client-side Paystack widgets if you use them.
- `PAYSTACK_CALLBACK_URL` — optional; defaults to `https://<your-deployment>/payment-success.html`.

Webhook configuration
- Set the webhook URL in your Paystack dashboard to:
  `https://<your-deployment>/api/webhook`
- Paystack will send signed payloads. The `api/webhook.js` verifies the `x-paystack-signature` header using `PAYSTACK_SECRET_KEY`.

Persistence and production notes
- This demo stores orders in `data/orders.json` for simplicity. On Vercel, filesystem persistence is ephemeral and not suitable for production.
- For production use, replace the file store with a persistent database (Supabase, Neon, Airtable, or any hosted DB) and update the `api/*` functions to use that DB.

How it works (brief)
1. Customer selects `Card / Online Payment` on `checkout.html` and places order.
2. Frontend saves a pending order locally and calls `/api/create-payment` with `orderId`, `amount`, `email`.
3. Server initializes Paystack transaction and returns `authorization_url`.
4. Frontend redirects the user to Paystack checkout.
5. Paystack calls the webhook at `/api/webhook` when payment is confirmed — the server updates the order to `successful` or `failed`.

Retry and duplicate prevention
- Duplicate submissions are guarded server-side by checking existing order status.
- If payment fails, the order is marked `failed` and the frontend can offer retry by re-initiating payment for the same `orderId`.
