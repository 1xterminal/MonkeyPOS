// public/js/sales-history/sales_history.js
(function () {
  if (!window.Storage || typeof Storage.getLocal !== 'function') {
    console.warn('Storage helper tidak ditemukan. sales_history memerlukan Storage.getLocal.');
    return;
  }

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

  function loadHistory() {
    return Storage.getLocal('salesHistory', []) || [];
  }

  function computeFromItems(tx) {
    const items = tx.items || tx.cart || [];
    const subtotal = items.reduce((acc, it) => acc + ((Number(it.price) || 0) * (Number(it.quantity || it.qty) || 1)), 0);
    const taxRate = tx.taxRate != null ? Number(tx.taxRate) : 0.11;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }

  function productNames(tx) {
    const items = tx.items || tx.cart || [];
    const names = items.map(it => (it.name || it.product || '').toString().trim()).filter(Boolean);
    if (names.length === 0) return '-';
    if (names.length <= 3) return names.join(', ');
    return names.slice(0, 3).join(', ') + ` (+${names.length - 3})`;
  }

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

      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      tr.setAttribute('data-id', tx.id ?? tx.transactionId ?? tx.invoiceId ?? '');

      // Kolom tabel
      tr.innerHTML = `
        <td>${tx.id ?? tx.transactionId ?? tx.invoiceId ?? '-'}</td>
        <td>${fmtDateTime(tx.date || tx.datetime || tx.createdAt)}</td>
        <td>${fmtCurrency(total)}</td>
        <td>${productNames(tx)}</td>
        <td style="display:none">${subtotal}</td>
        <td style="display:none">${tax}</td>
      `;

      // Tombol "Lihat"
      const actionTd = document.createElement('td');
      const detailUrl = `../transaction_detail/transaction_detail.html?id=${encodeURIComponent(tr.getAttribute('data-id'))}`;
      actionTd.innerHTML = `<a class="btn-small" href="${detailUrl}">Lihat</a>`;
      tr.appendChild(actionTd);

      // Klik baris = buka detail
      tr.addEventListener('click', function (e) {
        if (e.target && (e.target.tagName && e.target.tagName.toLowerCase() === 'a' || e.target.closest && e.target.closest('a'))) return;
        const id = this.getAttribute('data-id');
        if (id) {
          window.location.href = `../transaction_detail/transaction_detail.html?id=${encodeURIComponent(id)}`;
        }
      });

      tbody.appendChild(tr);
    });
  }

  function ensureControls() {
    const main = document.querySelector('main.content');
    if (!main) return;
    if (document.getElementById('sh-controls')) return;
    const controls = document.createElement('div');
    controls.id = 'sh-controls';
    controls.style.margin = '12px 0';
    const section = document.getElementById('sales-history') || document.querySelector('.table-wrapper') || document.querySelector('section');
    if (section) section.parentNode.insertBefore(controls, section);
    else {
      const h1 = document.querySelector('main.content h1');
      if (h1) h1.insertAdjacentElement('afterend', controls);
      else main.insertBefore(controls, main.firstChild);
    }
  }

  function init() {
    ensureControls();
    let all = loadHistory();
    renderRows(all);

    // === 🔍 Hubungkan Filter & Search dari .filter-box ===
    const filterButtons = document.querySelectorAll('.filter-box [data-filter]');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.filter-box .btn-primary');

    // Filter tanggal
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.getAttribute('data-filter');
        const now = new Date();
        let start, end;

        if (f === 'today') {
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start);
          end.setDate(start.getDate() + 1);
        } else if (f === 'week') {
          start = new Date(now);
          start.setDate(now.getDate() - 6);
          start.setHours(0, 0, 0, 0);
          end = new Date(now);
          end.setHours(23, 59, 59, 999);
        } else if (f === 'month') {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        const filtered = (!start || !end)
          ? all.slice()
          : all.filter(tx => {
              const d = parseISO(tx.date || tx.datetime || tx.createdAt);
              return d && d >= start && d <= end;
            });

        renderRows(filtered);
      });
    });

    // Search transaksi
    if (searchBtn && searchInput) {
      const doSearch = () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered =
          q === ''
            ? all
            : all.filter(tx => {
                const id = (tx.id || tx.transactionId || '').toLowerCase();
                const cashier = (tx.cashier || tx.kasir || '').toLowerCase();
                const items = (tx.items || tx.cart || [])
                  .map(it => (it.name || it.product || '').toLowerCase())
                  .join(' ');
                return id.includes(q) || cashier.includes(q) || items.includes(q);
              });
        renderRows(filtered);
      };

      searchBtn.addEventListener('click', doSearch);
      searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') doSearch();
      });
    }

    // Re-render jika localStorage berubah
    window.addEventListener('storage', () => {
      all = loadHistory();
      renderRows(all);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
