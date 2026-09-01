async function createPayment(orderId, amount, email) {
  const resp = await fetch('/api/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount, email })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw err;
  }

  return resp.json();
}

// Prevent double-submits by disabling the submit button when called
function disableSubmitButton(form) {
  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = 'Redirecting to payment…';
  }
}

function enableSubmitButton(form) {
  const btn = form.querySelector('button[type="submit"]');
  if (btn && btn.dataset.original) {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.original;
    delete btn.dataset.original;
  }
}

// Export for old-style inclusion
window.createPayment = createPayment;
window.disableSubmitButton = disableSubmitButton;
window.enableSubmitButton = enableSubmitButton;
