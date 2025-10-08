// Init variables
const laporanData = [];

function populateTables(container, data, column) {
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

    // Prepare data with formatted income
    const formattedData = data.map(item => ({
        ...item,
        income: convertCurrency(item.income) // Format the income for display
    }));

    // Call createTable to render the table
    createTable(container, column, formattedData, tableActions);
}

function generateIncomeSummary(container, data) {
    // Calculate total income for the summary
    const totalIncome = data.reduce((sum, item) => sum + item.income, 0);

    // Render the summary and new report ("Tambah Laporan") button
    const summaryElement = $("<div>", { "class": "table-summary" }).append([
        $("<div>").append([
            $("<span>", { "class": "total-label", text: "Total Pemasukan " }),
            $("<span>", { "class": "total-amount", text: convertCurrency(totalIncome) })
        ]),
        $("<button>", { "class": "add-report-btn" })
            .append([
                $("<span>", { "class": "material-symbols-outlined", text: "add" }),
                $("<span>", { text: "Tambah Laporan" })
            ])
            .on("click", () => {
                alert("Navigasi ke halaman Tambah Laporan!");
                // window.location.href = "../reports/report_add.html"; // Placeholder
            })
    ]);
    container.empty().append(summaryElement);
}

// Currency conversion function
function convertCurrency(val) {
    return Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(val);
}

$(document).ready(() => {
    // Dummy data, will use localStorage.getItem("reports") later
    reportData = [
        { id: 1, date: "Jumat, 3 Oktober 2025", income: 120500, details: "Sale #1234" },
        { id: 2, date: "Senin, 6 Oktober 2025", income: 230000, details: "Sale #1235" },
        { id: 2, date: "Rabu, 8 Oktober 2025", income: 400000, details: "Sale #1235" },
    ];

    // Define table columns
    const tableColumns = [
        { key: "date", label: "Tanggal" },
        { key: "income", label: "Pemasukan" }
    ];

    // Populate tables
    populateTables($("#report-table-container"), reportData, tableColumns);

    // Generate summary
    generateIncomeSummary($("#report-summary-container"), reportData);
});