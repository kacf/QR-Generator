/* ================================================================
   QR-Gen — Application Logic
   ================================================================ */

(function () {
  'use strict';

  // --- DOM refs ---
  const $ = (s) => document.querySelector(s);
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabBar = $('.tab-bar');

  // Link → QR tab
  const urlInput = $('#url-input');
  const urlLabelInput = $('#url-label');
  const btnLinkGenerate = $('#btn-link-generate');
  const qrOutputLink = $('#qr-output-link');
  const qrCanvasLink = $('#qr-canvas-link');
  const qrLinkLabel = $('#qr-link-label');
  const qrLinkUrl = $('#qr-link-url');
  const btnDownloadLink = $('#btn-download-link');
  const btnCopyUrl = $('#btn-copy-url');

  // UPI QR tab
  const upiIdInput = $('#upi-id');
  const payeeInput = $('#payee-name');
  const amountInput = $('#amount');
  const anyAmountToggle = $('#any-amount-toggle');
  const expiryInput = $('#expiry-date');
  const noExpiryToggle = $('#no-expiry-toggle');
  const expiryHint = $('#expiry-hint');
  const txnNoteInput = $('#txn-note');
  const btnGenerate = $('#btn-generate');
  const qrOutput = $('#qr-output');
  const qrCanvas = $('#qr-canvas');
  const qrPayeeLabel = $('#qr-payee-label');
  const qrUpiLabel = $('#qr-upi-label');
  const qrAmountLabel = $('#qr-amount-label');
  const qrExpiryLabel = $('#qr-expiry-label');
  const qrStatusBadge = $('#qr-status-badge');
  const upiLinkDisplay = $('#upi-link-display');
  const btnDownload = $('#btn-download');
  const btnCopyLink = $('#btn-copy-link');

  const toast = $('#toast');
  const toastText = $('#toast-text');

  let currentQR = null;
  let currentLinkQR = null;
  let currentUpiLink = '';
  let currentUrl = '';

  // --- Tabs ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      tabBar.dataset.active = tab;

      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      $(`#panel-${tab}`).classList.add('active');
    });
  });

  // --- Toggles ---
  anyAmountToggle.addEventListener('change', () => {
    amountInput.disabled = anyAmountToggle.checked;
    if (anyAmountToggle.checked) {
      amountInput.value = '';
      clearError('amount');
    }
  });

  noExpiryToggle.addEventListener('change', () => {
    expiryInput.disabled = noExpiryToggle.checked;
    if (noExpiryToggle.checked) {
      expiryInput.value = '';
      expiryHint.textContent = 'QR code will never expire';
    } else {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      expiryInput.value = formatDate(future);
      expiryInput.min = formatDate(new Date());
      expiryHint.textContent = 'QR will be invalid after this date';
    }
  });

  // --- Helpers ---
  function formatDate(d) {
    return d.toISOString().split('T')[0];
  }

  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  function setError(id, msg) {
    const el = $(`#${id}-error`);
    const input = $(`#${id}`);
    if (el) el.textContent = msg;
    if (input) input.classList.add('has-error');
  }

  function clearError(id) {
    const el = $(`#${id}-error`);
    const input = $(`#${id}`);
    if (el) el.textContent = '';
    if (input) input.classList.remove('has-error');
  }

  function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.has-error').forEach(e => e.classList.remove('has-error'));
  }

  function buildUpiLink(pa, pn, am, tn) {
    let link = `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&cu=INR`;
    if (am) link += `&am=${am}`;
    if (tn) link += `&tn=${encodeURIComponent(tn)}`;
    return link;
  }

  function validateUpiId(val) {
    return /^[\w.\-]+@[\w]+$/.test(val);
  }

  function isValidUrl(str) {
    // Accept any non-empty string that looks like a URL or common shorthand
    if (!str) return false;
    // Add protocol if missing
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(str)) {
      str = 'https://' + str;
    }
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function normalizeUrl(str) {
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(str)) {
      return 'https://' + str;
    }
    return str;
  }

  function renderQR(container, data) {
    container.innerHTML = '';
    const qr = new QRCode(container, {
      text: data,
      width: 200,
      height: 200,
      colorDark: '#111111',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
    return qr;
  }

  function downloadQR(frameSelector, filename) {
    const frame = $(frameSelector);
    const canvas = frame.querySelector('canvas');
    if (!canvas) { showToast('No QR code to download'); return; }

    const exportCanvas = document.createElement('canvas');
    const pad = 40;
    const size = canvas.width + pad * 2;
    exportCanvas.width = size;
    exportCanvas.height = size + 32;
    const ctx = exportCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, pad, pad);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generated by QR-Gen', exportCanvas.width / 2, exportCanvas.height - 10);

    const link = document.createElement('a');
    link.download = filename || 'payqr-code.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showToast('QR code downloaded!');
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied to clipboard!`);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(`${label} copied!`);
    });
  }

  function isExpired(dateStr) {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry < today;
  }

  // =============================================
  // TAB 1 — Link → QR (any URL)
  // =============================================
  btnLinkGenerate.addEventListener('click', () => {
    clearAllErrors();
    const raw = urlInput.value.trim();
    const label = urlLabelInput.value.trim();

    if (!raw) {
      setError('url-input', 'Please enter a URL');
      return;
    }
    if (!isValidUrl(raw)) {
      setError('url-input', 'Enter a valid URL (e.g. https://example.com)');
      return;
    }

    currentUrl = normalizeUrl(raw);
    currentLinkQR = renderQR(qrCanvasLink, currentUrl);

    qrLinkLabel.textContent = label || 'QR Code';
    qrLinkUrl.textContent = currentUrl;

    qrOutputLink.classList.remove('hidden');
    qrOutputLink.classList.add('visible');
    qrOutputLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  btnDownloadLink.addEventListener('click', () => downloadQR('#qr-frame-link', 'payqr-link.png'));
  btnCopyUrl.addEventListener('click', () => {
    if (currentUrl) copyToClipboard(currentUrl, 'Link');
  });

  // =============================================
  // TAB 2 — UPI QR
  // =============================================
  btnGenerate.addEventListener('click', () => {
    clearAllErrors();
    let valid = true;
    const upiId = upiIdInput.value.trim();
    const payee = payeeInput.value.trim();
    const amount = anyAmountToggle.checked ? '' : amountInput.value.trim();
    const note = txnNoteInput.value.trim();
    const expiryDate = noExpiryToggle.checked ? '' : expiryInput.value;

    if (!upiId) { setError('upi-id', 'UPI ID is required'); valid = false; }
    else if (!validateUpiId(upiId)) { setError('upi-id', 'Enter a valid UPI ID (e.g. name@upi)'); valid = false; }

    if (!payee) { setError('payee-name', 'Payee name is required'); valid = false; }

    if (!anyAmountToggle.checked) {
      if (!amount || parseFloat(amount) <= 0) {
        amountInput.classList.add('has-error');
        valid = false;
      }
    }

    if (!valid) return;

    const expired = isExpired(expiryDate);
    const link = buildUpiLink(upiId, payee, amount, note);
    currentUpiLink = link;

    currentQR = renderQR(qrCanvas, link);

    qrPayeeLabel.textContent = payee;
    qrUpiLabel.textContent = upiId;
    qrAmountLabel.textContent = amount ? `₹${parseFloat(amount).toFixed(2)}` : 'Any Amount';

    if (expiryDate) {
      const d = new Date(expiryDate);
      qrExpiryLabel.textContent = expired
        ? `Expired on ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : `Valid until ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      qrExpiryLabel.textContent = 'No expiration';
    }

    qrStatusBadge.textContent = expired ? 'Expired' : 'Active';
    qrStatusBadge.className = 'qr-badge' + (expired ? ' expired' : '');
    upiLinkDisplay.textContent = link;

    qrOutput.classList.remove('hidden');
    qrOutput.classList.add('visible');
    qrOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  btnDownload.addEventListener('click', () => downloadQR('#qr-frame', 'payqr-upi.png'));
  btnCopyLink.addEventListener('click', () => {
    if (currentUpiLink) copyToClipboard(currentUpiLink, 'UPI link');
  });

  // --- Clear errors on typing ---
  [upiIdInput, payeeInput, amountInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('has-error');
      const errEl = input.parentElement.querySelector('.field-error');
      if (errEl) errEl.textContent = '';
    });
  });

  urlInput.addEventListener('input', () => {
    urlInput.classList.remove('has-error');
    const errEl = urlInput.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
  });

})();
