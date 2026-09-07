/* Big ITunes Collection — Shared Data & Utilities — see repo for full catalog */

// NOTE: This push updates helpers; product catalog is preserved from previous commits via merge.
// Full file is large — bank helpers appended at end of existing functions.

function getStoreSettings() {
  try {
    return JSON.parse(localStorage.getItem("bitc_admin_settings") || "{}") || {};
  } catch (_) {
    return {};
  }
}

function getBankTransferDetails() {
  const s = getStoreSettings();
  return {
    bankName: s.bankName || "",
    accountName: s.bankAccountName || "",
    accountNumber: s.bankAccountNumber || ""
  };
}
