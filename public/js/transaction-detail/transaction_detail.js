// public/js/transaction-detail/transaction_detail.js
$(document).ready(() => {
  // -------------------------
  // Helper: format mata uang
  // -------------------------
  function formatRupiah(value) {
    const n = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(n);
  }

  // -------------------------
  // Read salesHistory safely
  // -------------------------
  function readSalesHistory() {
    try {
      if (window.Storage && typeof Storage.getLocal === 'function') {
        return Storage.getLocal('salesHistory', []) || [];
      }
    } catch (e) {
      // ignore
    }
    try {
      const raw = localStorage.getItem('salesHistory');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Gagal membaca salesHistory dari localStorage', e);
      return [];
    }
  }

  // -------------------------
  // Get transaction id from URL
  // -------------------------
  const params = new URLSearchParams(window.location.search);
  const transactionIdParam = params.get('id');
  if (!transactionIdParam) {
    alert('ID Transaksi tidak ditemukan di URL.');
    window.location.href = '../sales_history/sales_history.html';
    return;
  }

  // -------------------------
  // Find transaction by many possible id fields
  // -------------------------
  const salesHistory = readSalesHistory();
  const transaction = salesHistory.find(t => {
    if (!t) return false;
    const candidates = [
      t.id, t.transactionId, t.invoiceId, t.code,
      t.transactionID, t.transaction_id, t.invoice_id
    ].map(x => x == null ? '' : String(x));
    return candidates.includes(String(transactionIdParam));
  });

  if (!transaction) {
    $('.transaction-card').html('<h1>Transaksi tidak ditemukan.</h1>');
    return;
  }

  // -------------------------
  // Header: date, time, id
  // -------------------------
  const rawDate = transaction.date ?? transaction.datetime ?? transaction.createdAt ?? '';
  const dObj = rawDate ? new Date(rawDate) : null;
  const dateStr = dObj && !isNaN(dObj.getTime())
    ? dObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : (typeof rawDate === 'string' ? rawDate : '-');
  const timeStr = dObj && !isNaN(dObj.getTime()) ? dObj.toLocaleTimeString('id-ID') : (transaction.time ?? '-');

  $('#transactionId').text(transaction.id ?? transaction.transactionId ?? transaction.invoiceId ?? '-');
  $('#transactionDate').text(dateStr);
  $('#transactionTime').text(timeStr);

  // -------------------------
  // Items: support many property names
  // -------------------------
  const items =
    Array.isArray(transaction.items) ? transaction.items
    : Array.isArray(transaction.cart) ? transaction.cart
    : Array.isArray(transaction.products) ? transaction.products
    : Array.isArray(transaction.details) ? transaction.details
    : Array.isArray(transaction.lineItems) ? transaction.lineItems
    : [];

  const $itemsList = $('#itemsList').empty();
  if (!items || items.length === 0) {
    $itemsList.append('<tr><td colspan="4" style="text-align:center; padding:14px">Tidak ada item untuk transaksi ini.</td></tr>');
  } else {
    items.forEach(it => {
      const name = it.name ?? it.product ?? it.title ?? it.nama ?? '-';
      const qty = Number(it.quantity ?? it.qty ?? it.q) || 0;
      const price = Number(it.price ?? it.harga ?? it.unitPrice) || 0;
      const sub = Number(it.subtotal ?? (price * qty)) || (price * qty);
      const row = `<tr>
        <td>${name}</td>
        <td class="text-right">${formatRupiah(price)}</td>
        <td class="text-center">${qty}</td>
        <td class="text-right">${formatRupiah(sub)}</td>
      </tr>`;
      $itemsList.append(row);
    });
  }

  // -------------------------
  // Payment & cashier
  // -------------------------
  $('#paymentMethod').text(transaction.paymentMethod ?? transaction.payment ?? transaction.method ?? '-');
  $('#cashier').text(transaction.cashier ?? transaction.kasir ?? transaction.user ?? '-');

  // -------------------------
  // Determine subtotal: prefer stored, else compute from items
  // -------------------------
  let subtotal = Number(transaction.subtotal ?? transaction.subTotal ?? transaction.amount ?? 0);
  if ((!subtotal || subtotal === 0) && items.length > 0) {
    subtotal = items.reduce((acc, it) => {
      const p = Number(it.price ?? it.harga ?? it.unitPrice) || 0;
      const q = Number(it.quantity ?? it.qty ?? it.q) || 0;
      return acc + (p * q);
    }, 0);
  }

  // -------------------------
  // Determine discount amount
  // priority: transaction.discount (amount) -> transaction.discountAmount -> transaction.discountRate -> transaction.discount as "5%"
  // -------------------------
  let discountAmount = 0;
  // amount fields
  if (transaction.discount != null && !isNaN(Number(transaction.discount))) {
    discountAmount = Math.round(Number(transaction.discount));
  } else if (transaction.discountAmount != null && !isNaN(Number(transaction.discountAmount))) {
    discountAmount = Math.round(Number(transaction.discountAmount));
  } else if (transaction.discountRate != null && !isNaN(Number(transaction.discountRate))) {
    // discountRate stored as decimal (e.g., 0.05) or percent (5)
    const r = Number(transaction.discountRate);
    discountAmount = (r > 1) ? Math.round(subtotal * (r/100)) : Math.round(subtotal * r);
  } else if (transaction.discountPercent != null && !isNaN(Number(transaction.discountPercent))) {
    discountAmount = Math.round(subtotal * (Number(transaction.discountPercent) / 100));
  } else if (transaction.discount && typeof transaction.discount === 'string' && transaction.discount.includes('%')) {
    const parsed = parseFloat(transaction.discount.replace('%',''));
    if (!isNaN(parsed)) discountAmount = Math.round(subtotal * (parsed/100));
  }
  // clamp discount to not exceed subtotal
  discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

  // -------------------------
  // Tax & total (prefer stored, else compute)
  // -------------------------
  const TAX_RATE = 0.11;
  let tax = Number(transaction.tax ?? transaction.pajak ?? 0);
  if (!tax || tax === 0) {
    const taxable = Math.max(0, subtotal - discountAmount);
    tax = Math.round(taxable * TAX_RATE);
  }
  let total = Number(transaction.total ?? transaction.amountPaid ?? 0);
  if (!total || total === 0) {
    total = Math.max(0, subtotal - discountAmount) + tax;
  }

  // -------------------------
  // Render subtotal, discount, tax, total
  // -------------------------
  $('#subtotal').text(formatRupiah(subtotal));

  // If placeholder exists, update it; otherwise inject row
  const $existingDiscountRow = $('.summary-row.discount-row');
  if (discountAmount > 0) {
    if ($('#discount').length) {
      $('#discount').text(formatRupiah(discountAmount));
      $('.summary-row.discount-row').show();
    } else {
      // insert discount row after subtotal row
      const $subtotalRow = $('#subtotal').closest('.summary-row');
      const discountLabel = transaction.discountLabel ?? (transaction.discountRate ? `Diskon (${(Number(transaction.discountRate) > 1 ? Number(transaction.discountRate) : Number(transaction.discountRate)*100).toFixed(0)}%)` : 'Diskon');
      const html = `<div class="summary-row discount-row"><span>${discountLabel}:</span><span id="discount">${formatRupiah(discountAmount)}</span></div>`;
      if ($subtotalRow && $subtotalRow.length) $subtotalRow.after(html);
      else $('.summary-right').prepend(html);
    }
  } else {
    if ($existingDiscountRow.length) $existingDiscountRow.remove();
  }

  $('#tax').text(formatRupiah(tax));
  $('#total').text(formatRupiah(total));

  // -------------------------
  // Member info (if any)
  // -------------------------
  const memberName = transaction.member ?? transaction.memberName ?? transaction.customer ?? null;
  if (memberName) {
    const $summaryLeft = $('.summary-left');
    if ($summaryLeft.length) {
      const existing = $summaryLeft.find('.meta.member-meta');
      const html = `<div class="meta member-meta"><strong>Member:</strong> <span id="memberName">${memberName}</span></div>`;
      if (existing.length) existing.replaceWith(html);
      else $summaryLeft.append(html);
    }
  } else {
    // remove existing member-meta if present
    const $summaryLeft = $('.summary-left');
    if ($summaryLeft.length) $summaryLeft.find('.meta.member-meta').remove();
  }

  // -------------------------
  // Cash details (amountReceived, change)
  // -------------------------
  const paymentMethod = (transaction.paymentMethod ?? transaction.payment ?? transaction.method ?? '').toString().toLowerCase();
  if (paymentMethod === 'cash' || transaction.amountReceived != null) {
    const amt = Number(transaction.amountReceived ?? 0) || 0;
    const ch = Number(transaction.change ?? 0) || (amt - total);
    $('#amountReceived').text(formatRupiah(amt));
    $('#change').text(formatRupiah(ch));
    $('.cash-detail').show();
  } else {
    $('.cash-detail').hide();
  }

  // -------------------------
  // Back button
  // -------------------------
  $('#btnBack').on('click', () => {
    window.location.href = '../sales_history/sales_history.html';
  });

  // Debug: (optional) uncomment to inspect transaction in console
  // console.log('Transaction detail rendered:', transaction);
});
