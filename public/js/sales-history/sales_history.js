// public/js/sales-history/sales_history.js
// Menampilkan Sales History + filter tanggal + pencarian,
// dan navigasi ke transaction_detail.html?id=...

(function () {
  if (!window.Storage || typeof Storage.getLocal !== 'function') {
    console.warn('Storage helper tidak ditemukan. sales_history memerlukan Storage.getLocal.');
    return;
  }

  // Helpers
  const fmtCurrency = v => 'Rp ' + Number(v || 0).toLocaleString('id-ID');
  const parseISO = s => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };
  const fmtDateTime = s => {
    const d = parseISO(s);
    return d ? d.toLocaleString('id-ID') : (s || '-');
  };

  // Load data
  function loadHistory() {
    return Storage.getLocal('salesHistory', []) || [];
  }

  // Compute subtotal/tax/total from items if not present
  function computeFromItems(tx) {
    const items = tx.items || tx.cart || [];
    const subtotal = items.reduce((acc, it) => acc + ((Number(it.price) || 0) * (Number(it.quantity || it.qty) || 1)), 0);
    // tax rate fallback 11% if not specified
    const taxRate = tx.taxRate != null ? Number(tx.taxRate) : 0.11;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }

  // Render product name column: comma separated unique names (trimmed)
  function productNames(tx) {
    const items = tx.items || tx.cart || [];
    const names = items.map(it => (it.name || it.product || '').toString().trim()).filter(Boolean);
    // show up to 3 names then "..." if many
    if (names.length === 0) return '-';
    if (names.length <= 3) return names.join(', ');
    return names.slice(0, 3).join(', ') + ` (+${names.length - 3})`;
  }

  // Create filter UI if not present: inject before the table
  function ensureControls() {
    const main = document.querySelector('main.content');
    if (!main) return;
    // avoid duplicate
    if (document.getElementById('sh-controls')) return;

    const controls = document.createElement('div');
    controls.id = 'sh-controls';
    controls.style.margin = '12px 0';
    controls.innerHTML = `
    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
    <div style="display:flex; gap:6px; align-items:center;"></div>`;
    // find table section to insert controls above table
    const section = document.getElementById('sales-history') || document.querySelector('.table-wrapper') || document.querySelector('section');
    if (section) section.parentNode.insertBefore(controls, section);
    else {
    const h1 = document.querySelector('main.content h1');
    if (h1) h1.insertAdjacentElement('afterend', controls);
    else main.insertBefore(controls, main.firstChild);
    }
}

  // Filtering utilities
  function filterByQuickRange(list, rangeName) {
    if (!rangeName || rangeName === 'all') return list.slice();
    const now = new Date();
    let start = null, end = null;
    if (rangeName === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start); end.setDate(start.getDate() + 1);
    } else if (rangeName === 'week') {
      start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0,0,0,0);
      end = new Date(now); end.setHours(23,59,59,999);
    } else if (rangeName === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
    }
    if (!start || !end) return list.slice();
    return list.filter(tx => {
      const raw = tx.date || tx.datetime || tx.createdAt;
      const d = parseISO(raw);
      if (!d) return false;
      return d >= start && d <= end;
    });
  }

  function searchFilter(list, q) {
    if (!q) return list.slice();
    const s = q.trim().toLowerCase();
    return list.filter(tx => {
      const id = (tx.id || '').toString().toLowerCase();
      const cashier = (tx.cashier || '').toString().toLowerCase();
      const prod = (tx.items || tx.cart || []).map(it => (it.name || it.product || '').toString().toLowerCase()).join(' ');
      return id.includes(s) || cashier.includes(s) || prod.includes(s);
    });
  }

  // Render rows into #sales-table-body
  function renderRows(list) {
    const tbody = document.getElementById('sales-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px">Belum ada transaksi.</td></tr>`;
      return;
    }

    list.forEach(tx => {
      const items = tx.items || tx.cart || [];
      const { subtotal, tax, total } = (tx.subtotal != null && tx.tax != null && tx.total != null)
        ? { subtotal: Number(tx.subtotal), tax: Number(tx.tax), total: Number(tx.total) }
        : computeFromItems(tx);

      // create clickable row: when row clicked navigate to transaction_detail.html?id=...
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.setAttribute('data-id', tx.id);
      tr.innerHTML = `
        <td>${tx.id}</td>
        <td>${fmtDateTime(tx.date || tx.datetime || tx.createdAt)}</td>
        <td>${fmtCurrency(total)}</td>
        <td>${productNames(tx)}</td>
        <td style="display:none">${subtotal}</td>
        <td style="display:none">${tax}</td>
      `;
      // Append an action cell with explicit Lihat link (for accessibility)
      const actionTd = document.createElement('td');
      actionTd.innerHTML = `<a class="btn-small" href="transaction_detail.html?id=${encodeURIComponent(tx.id)}">Lihat</a>`;
      tr.appendChild(actionTd);

      // clicking row (except on links) navigates to detail
      tr.addEventListener('click', function (e) {
        if (e.target && (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a'))) return;
        window.location.href = `transaction_detail.html"?id=${encodeURIComponent(tx.id)}`;
      });

      tbody.appendChild(tr);
    });
  }

  // Sales History Display
  function displaySalesHistory(sales) {
    const tableBody = document.getElementById('sales-table-body');
    tableBody.innerHTML = '';

    if (!sales || sales.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Tidak ada data</td></tr>';
        return;
    }

    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.transactionId}</td>
            <td>${new Date(sale.date).toLocaleDateString('id-ID')}</td>
            <td>${sale.products.map(p => p.name).join(', ')}</td>
            <td>Rp ${sale.total.toLocaleString('id-ID')}</td>
            <td>
                <button class="btn-view" onclick="viewTransactionDetail('${sale.transactionId}')">
                    Lihat
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
  }

  function viewTransactionDetail(transactionId) {
    window.location.href = `../transaction_detail/transaction_detail.html?id=${transactionId}`;
  }

  // Init & event wiring
  function init() {
    ensureControls();

    let all = loadHistory(); // raw array
    renderRows(all);

    // search button
    const searchBtn = document.getElementById('sh-search');
    const qInput = document.getElementById('sh-q');
    const resetBtn = document.getElementById('sh-reset');

    if (searchBtn && qInput) {
      searchBtn.addEventListener('click', () => {
        const q = qInput.value;
        const filtered = searchFilter(all, q);
        renderRows(filtered);
      });
      qInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchBtn.click();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        qInput.value = '';
        renderRows(all);
      });
    }

    // quick filter buttons
    document.querySelectorAll('#sh-controls [data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.getAttribute('data-filter');
        const filtered = filterByQuickRange(all, f);
        renderRows(filtered);
      });
    });

    // refresh if other tab changed storage
    window.addEventListener('storage', () => {
      all = loadHistory();
      renderRows(all);
    });
  }

  // run
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
