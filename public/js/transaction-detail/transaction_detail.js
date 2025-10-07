// public/js/transaction-detail/transaction_detail.js
// Ambil data transaksi berdasarkan ID dari URL dan tampilkan detailnya

(function () {
  if (!window.Storage || typeof Storage.getLocal !== 'function') {
    console.warn('❌ Storage helper tidak ditemukan.');
    return;
  }

  const fmtCurrency = v => 'Rp ' + Number(v || 0).toLocaleString('id-ID');

  function getTransactionId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function loadAllTransactions() {
    return Storage.getLocal('salesHistory', []) || [];
  }

  function computeTotals(items, tx) {
    const subtotal = (items || []).reduce(
      (acc, it) => acc + ((Number(it.price) || 0) * (Number(it.quantity || it.qty) || 1)),
      0
    );
    const taxRate = tx?.taxRate != null ? Number(tx.taxRate) : 0.11;
    const tax = tx?.tax != null ? Number(tx.tax) : Math.round(subtotal * taxRate);
    const total = tx?.total != null ? Number(tx.total) : subtotal + tax;
    return { subtotal, tax, total };
  }

  function renderTransaction(tx) {
    document.getElementById('detail-id').textContent = tx.id || '-';
    const date = tx.date || tx.datetime || tx.createdAt;
    document.getElementById('detail-date').textContent = date ? new Date(date).toLocaleString('id-ID') : '-';

    const items = tx.items || tx.cart || [];
    const totals = computeTotals(items, tx);

    document.getElementById('detail-subtotal').textContent = fmtCurrency(totals.subtotal);
    document.getElementById('detail-tax').textContent = fmtCurrency(totals.tax);
    document.getElementById('detail-total').textContent = fmtCurrency(totals.total);
    document.getElementById('detail-payment-method').textContent = tx.paymentMethod || tx.method || '-';

    const tbody = document.getElementById('transaction-items-body');
    tbody.innerHTML = '';

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Tidak ada item.</td></tr>`;
      return;
    }

    items.forEach(it => {
      const qty = Number(it.quantity || it.qty) || 1;
      const price = Number(it.price) || 0;
      const subtotal = qty * price;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.name || it.product || '-'}</td>
        <td>${qty}</td>
        <td>${fmtCurrency(price)}</td>
        <td>${fmtCurrency(subtotal)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function showNotFound(id) {
    const container = document.getElementById('transaction-detail-container');
    container.innerHTML = `
      <div style="padding:20px; text-align:center;">
        <p>Transaksi dengan ID <strong>${id}</strong> tidak ditemukan.</p>
        <button onclick="window.location.href='sales_history.html'">Kembali ke Riwayat</button>
      </div>
    `;
  }

  function init() {
    const id = getTransactionId();
    if (!id) return showNotFound('(tanpa ID)');

    const transactions = loadAllTransactions();
    const tx = transactions.find(t => String(t.id) === String(id));

    if (!tx) return showNotFound(id);

    renderTransaction(tx);

    document.getElementById('back-to-history').addEventListener('click', () => {
      window.location.href = 'sales_history.html';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');
    
    if (!transactionId) {
        alert('ID Transaksi tidak ditemukan');
        window.location.href = '../sales_history/sales_history.html';
        return;
    }

    loadTransactionDetail(transactionId);
});

function loadTransactionDetail(transactionId) {
    const salesHistory = Storage.getLocal('salesHistory', []);
    const transaction = salesHistory.find(sale => sale.id === transactionId);

    if (!transaction) {
        alert('Data transaksi tidak ditemukan');
        window.location.href = '../sales_history/sales_history.html';
        return;
    }

    // Format date and time
    const dateTime = new Date(transaction.date || transaction.datetime || transaction.createdAt);
    const formattedDate = dateTime.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const formattedTime = dateTime.toLocaleTimeString('id-ID');

    // Display transaction info
    document.getElementById('transactionId').textContent = transaction.id;
    document.getElementById('transactionDate').textContent = formattedDate;
    document.getElementById('transactionTime').textContent = formattedTime;

    // Display items
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    
    const items = transaction.items || transaction.cart || [];
    items.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = item.price * (item.quantity || item.qty || 1);
        
        row.innerHTML = `
            <td>${item.name || item.product}</td>
            <td>Rp ${Number(item.price).toLocaleString('id-ID')}</td>
            <td>${item.quantity || item.qty || 1}</td>
            <td>Rp ${itemTotal.toLocaleString('id-ID')}</td>
        `;
        itemsList.appendChild(row);
    });

    // Calculate and display totals
    const subtotal = items.reduce((sum, item) => 
        sum + (item.price * (item.quantity || item.qty || 1)), 0);
    const tax = Math.round(subtotal * 0.11); // 11% tax
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('tax').textContent = `Rp ${tax.toLocaleString('id-ID')}`;
    document.getElementById('total').textContent = `Rp ${total.toLocaleString('id-ID')}`;
    document.getElementById('paymentMethod').textContent = transaction.paymentMethod || 'Tunai';
}
