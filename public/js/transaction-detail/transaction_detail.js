// public/js/transaction/transaction_detail.js (rapi & kompatibel)
$(document).ready(() => {

  function formatRupiahNumber(value) {
    const n = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n).replace(',', '.').replace(/\.(?=.*\.)/g, ',');
    // NOTE: above replace attempts to keep thousands & decimal in id-ID style.
  }
  function formatRupiah(value) {
    return `Rp ${formatRupiahNumber(value)}`;
  }

  function readHistory() {
    try {
      if (window.Storage && typeof Storage.getLocal === 'function') return Storage.getLocal('salesHistory', []) || [];
    } catch(e){}
    try {
      const raw = localStorage.getItem('salesHistory');
      return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
  }

  const params = new URLSearchParams(window.location.search);
  const txIdParam = params.get('id');
  if (!txIdParam) {
    console.warn('No transaction id in URL');
    return;
  }

  const salesHistory = readHistory();

  const transaction = salesHistory.find(t => {
    const ids = [t.id, t.transactionId, t.invoiceId, t.code, t.transactionID, t.transaction_id, t.invoice_id];
    return ids.some(i => (i != null) && String(i) === String(txIdParam));
  });

  if (!transaction) {
    console.warn('Transaction not found for id', txIdParam);
    // show friendly message in page if needed
    $('#itemsList').html('<tr><td colspan="4" style="text-align:center; padding:18px">Transaksi tidak ditemukan.</td></tr>');
    return;
  }

  // Normalize values
  const txId = transaction.id ?? transaction.transactionId ?? transaction.invoiceId ?? transaction.code ?? '';
  const rawDate = transaction.date ?? transaction.datetime ?? transaction.createdAt ?? '';
  const dt = rawDate ? new Date(rawDate) : null;
  const dateStr = dt && !isNaN(dt.getTime()) ? dt.toLocaleDateString('id-ID') : (typeof rawDate === 'string' ? rawDate.split(' ')[0] : rawDate);
  const timeStr = dt && !isNaN(dt.getTime()) ? dt.toLocaleTimeString('id-ID') : (transaction.time ?? '');

  const cashier = transaction.cashier ?? transaction.kasir ?? transaction.user ?? '-';
  const paymentMethod = transaction.paymentMethod ?? transaction.payment ?? transaction.method ?? transaction.metodePembayaran ?? '-';

  // Write header info
  $('#transactionId').text(txId);
  $('#transactionDate').text(dateStr);
  $('#transactionTime').text(timeStr);

  $('#paymentMethod').text(paymentMethod);
  $('#transCashier').text(cashier);

  // get items
  let items = [];
  if (Array.isArray(transaction.items)) items = transaction.items;
  else if (Array.isArray(transaction.cart)) items = transaction.cart;
  else if (Array.isArray(transaction.products)) items = transaction.products;
  else if (Array.isArray(transaction.details)) items = transaction.details;
  else if (Array.isArray(transaction.lineItems)) items = transaction.lineItems;

  if (!items || items.length === 0) {
    $('#itemsList').html('<tr><td colspan="4" style="text-align:center; padding:18px">Tidak ada item untuk transaksi ini.</td></tr>');
  } else {
    $('#itemsList').empty();
    items.forEach(it => {
      const name = it.name ?? it.product ?? it.title ?? it.nama ?? '-';
      const qty = Number(it.qty ?? it.quantity ?? it.q) || 0;
      const price = Number(it.price ?? it.harga ?? it.unitPrice) || 0;
      const subtotal = Number(it.subtotal ?? (price * qty)) || (price * qty);
      const row = `<tr>
        <td>${name}</td>
        <td class="text-right">${formatRupiah(price)}</td>
        <td class="text-center">${qty}</td>
        <td class="text-right">${formatRupiah(subtotal)}</td>
      </tr>`;
      $('#itemsList').append(row);
    });
  }

  // compute totals if missing
  let subtotal = Number(transaction.subtotal ?? transaction.subTotal ?? 0);
  if ((!subtotal || subtotal === 0) && items.length > 0) {
    subtotal = items.reduce((s, it) => {
      const p = Number(it.price ?? it.harga ?? 0) || 0;
      const q = Number(it.qty ?? it.quantity ?? it.q) || 0;
      return s + (p * q);
    }, 0);
  }

  let tax = Number(transaction.tax ?? transaction.pajak ?? 0);
  if (!tax) {
    const taxPercent = Number(transaction.taxPercent ?? transaction.pajakPercent ?? 11) || 11;
    tax = Math.round(subtotal * (taxPercent/100));
  }

  let total = Number(transaction.total ?? transaction.amountPaid ?? (subtotal + tax)) || (subtotal + tax);

  // Fill totals
  $('#subtotal').text(formatRupiah(subtotal));
  $('#tax').text(formatRupiah(tax));
  $('#total').text(formatRupiah(total));

  // Back button
  $('#btnBack').on('click', () => {
    window.location.href = '../sales_history/sales_history.html';
  });

});
