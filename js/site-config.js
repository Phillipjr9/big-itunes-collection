/**
 * Site config — safe to commit PUBLIC values only.
 *
 * Paste your Paystack PUBLIC key below (pk_test_… or pk_live_…).
 * Never put the secret key (sk_…) here.
 *
 * Priority order for the public key:
 *  1. window.BITC_PAYSTACK_PUBLIC_KEY (set here)
 *  2. localStorage (Admin → Settings, or checkout key form)
 *  3. bitc_admin_settings.paystackPublicKey
 */
window.BITC_PAYSTACK_PUBLIC_KEY = window.BITC_PAYSTACK_PUBLIC_KEY || "";
// Example after you paste your key:
// window.BITC_PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx";
