/* Paystack public-key helpers — never put secret keys (sk_) in the frontend */
const PAYSTACK_PUBLIC_KEY_STORAGE = "bitc_paystack_public_key";

function getPaystackPublicKey() {
  if (typeof window !== "undefined" && window.BITC_PAYSTACK_PUBLIC_KEY) {
    return String(window.BITC_PAYSTACK_PUBLIC_KEY).trim();
  }
  try {
    const fromLs = localStorage.getItem(PAYSTACK_PUBLIC_KEY_STORAGE);
    if (fromLs && fromLs.trim()) return fromLs.trim();
  } catch (_) {}
  try {
    const settings = JSON.parse(localStorage.getItem("bitc_admin_settings") || "{}");
    if (settings.paystackPublicKey) return String(settings.paystackPublicKey).trim();
  } catch (_) {}
  return "";
}

function setPaystackPublicKey(key) {
  const k = String(key || "").trim();
  localStorage.setItem(PAYSTACK_PUBLIC_KEY_STORAGE, k);
  try {
    const settings = JSON.parse(localStorage.getItem("bitc_admin_settings") || "{}");
    settings.paystackPublicKey = k;
    localStorage.setItem("bitc_admin_settings", JSON.stringify(settings));
  } catch (_) {}
}

function isPaystackConfigured() {
  const k = getPaystackPublicKey();
  return k.startsWith("pk_test_") || k.startsWith("pk_live_");
}
