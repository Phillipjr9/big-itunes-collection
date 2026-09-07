/**
 * Vercel Serverless Function — Paystack payment verification
 *
 * POST /api/verify-paystack
 * Body: { reference: string, amount?: number, orderId?: string }
 *
 * Env (Vercel → Settings → Environment Variables):
 *   PAYSTACK_SECRET_KEY = sk_live_… or sk_test_…
 *
 * Never expose the secret key to the browser.
 */

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}

function json(res, status, body) {
  res.statusCode = status;
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { verified: false, error: "Method not allowed" });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || (!secret.startsWith("sk_live_") && !secret.startsWith("sk_test_"))) {
    return json(res, 500, {
      verified: false,
      error: "Server misconfigured: set PAYSTACK_SECRET_KEY in Vercel environment variables"
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return json(res, 400, { verified: false, error: "Invalid JSON body" });
    }
  }
  body = body || {};

  const reference = String(body.reference || "").trim();
  if (!reference) {
    return json(res, 400, { verified: false, error: "Missing payment reference" });
  }

  const expectedNaira =
    body.amount != null && body.amount !== "" ? Number(body.amount) : null;
  const expectedKobo =
    expectedNaira != null && Number.isFinite(expectedNaira)
      ? Math.round(expectedNaira * 100)
      : null;

  try {
    const verifyRes = await fetch(
      `${PAYSTACK_VERIFY_URL}/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json"
        }
      }
    );

    const payload = await verifyRes.json();

    if (!verifyRes.ok || !payload.status) {
      return json(res, 400, {
        verified: false,
        error: payload.message || "Paystack verification failed",
        paystack: payload
      });
    }

    const data = payload.data || {};
    const status = String(data.status || "").toLowerCase();
    const paidKobo = Number(data.amount);

    if (status !== "success") {
      return json(res, 400, {
        verified: false,
        error: `Transaction not successful (status: ${data.status})`,
        reference,
        paystackStatus: data.status
      });
    }

    if (expectedKobo != null && paidKobo !== expectedKobo) {
      return json(res, 400, {
        verified: false,
        error: "Amount mismatch",
        expectedKobo,
        paidKobo,
        reference
      });
    }

    if (data.currency && data.currency !== "NGN") {
      return json(res, 400, {
        verified: false,
        error: `Unexpected currency: ${data.currency}`,
        reference
      });
    }

    return json(res, 200, {
      verified: true,
      reference: data.reference || reference,
      amount: paidKobo / 100,
      amountKobo: paidKobo,
      currency: data.currency || "NGN",
      channel: data.channel || null,
      paidAt: data.paid_at || data.paidAt || null,
      customerEmail: data.customer?.email || null,
      orderId: body.orderId || null,
      gatewayResponse: data.gateway_response || null
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    return json(res, 502, {
      verified: false,
      error: "Could not reach Paystack verification API"
    });
  }
};
