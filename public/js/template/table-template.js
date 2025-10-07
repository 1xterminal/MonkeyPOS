$(document).ready(() => {
    // Dummy data for Laporan (replace with localStorage.getItem("reports") later)
    const laporanData = [
        { id: 1, date: "Jumat, 3 Oktober 2025", income: 120500, details: "Sale #1234" },
        { id: 2, date: "Senin, 6 Oktober 2025", income: 230000, details: "Sale #1235" },
    ];

    // Define table columns
    const tableColumns = [
        { key: "date", label: "Tanggal" },
        { key: "income", label: "Pemasukan" }
    ];

    // Define table actions (buttons)
    const tableActions = [
        {
            label: "Lihat",
            icon: "visibility",
            onClick: (rowData) => {
                alert(`Melihat detail laporan ${rowData.id} (${rowData.details})`);
                // In a real app, you'd navigate to transaction_detail.html with rowData.id
                // window.location.href = `../transactions/transaction_detail.html?id=${rowData.id}`;
            }
        },
        {
            label: "Cetak",
            icon: "print",
            onClick: (rowData) => {
                alert(`Mencetak laporan ${rowData.id} (${rowData.details})`);
                // Simulate print or open a print-friendly view
            }
        }
    ];

    // Get the table container
    const tableContainer = $("#report-table-container");

    // Format currency function
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Prepare data with formatted income
    const formattedLaporanData = laporanData.map(item => ({
        ...item,
        income: formatCurrency(item.income) // Format the income for display
    }));

    // Call createTable to render the table
    createTable(tableContainer, tableColumns, formattedLaporanData, tableActions);

    // Calculate total income for the summary
    const totalIncome = laporanData.reduce((sum, item) => sum + item.income, 0);

    // Render the summary and "Tambah Laporan" button
    const summaryContainer = $("#report-summary-container");
    const summaryElement = $("<div>", { "class": "table-summary" }).append([
        $("<div>").append([
            $("<span>", { "class": "total-label", text: "Total Pemasukan " }),
            $("<span>", { "class": "total-amount", text: formatCurrency(totalIncome) })
        ]),
        $("<button>", { "class": "add-report-btn" })
            .append([
                $("<span>", { "class": "material-symbols-outlined", text: "add" }),
                $("<span>", { text: "Tambah Laporan" })
            ])
            .on("click", () => {
                alert("Navigasi ke halaman Tambah Laporan!");
                // window.location.href = "../reports/report_add.html"; // Example
            })
    ]);
    summaryContainer.empty().append(summaryElement);
});