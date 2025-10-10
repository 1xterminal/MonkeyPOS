/**
 * Creates and renders a data table inside a specified root element.
 * Displays the header even if there is no data.
 */
function createTable(root, columns, dataRows, actions = []) {

  // 1. Create the main <table> element
  const table = $("<table>", { "class": "data-table" });

  // 2. Define all columns that will be displayed
  const displayColumns = [{ key: "no", label: "No", width: 60, class: "num" }, ...columns];
  if (actions.length > 0) {
    displayColumns.push({ key: "actions", label: "Actions", width: 200 });
  }

  // 3. Build the table header (<thead>) - This part is always the same
  const tableHead = $("<thead>").append(
    $("<tr>").append(
      $.map(displayColumns, (col) => {
        return $("<th>", { text: col.label, width: col.width, "class": col.class });
      })
    )
  );

  // 4. Build the table body (<tbody>) - This part will now have a condition
  let tableBody;

  // NEW: Check if dataRows is empty
  if (dataRows.length === 0) {
    // If no data, create a single row with a message
    tableBody = $("<tbody>").append(
      $("<tr>").append(
        $("<td>", {
          text: "Tidak ada data yang tersedia.",
          class: "no-data-cell",
          // The 'colspan' attribute makes this cell span all columns
          colspan: displayColumns.length
        })
      )
    );
  } else {
    // If data exists, build the rows as before
    tableBody = $("<tbody>").append(
      $.map(dataRows, (row, index) => {
        const tableRow = $("<tr>");

        // Add "No" cell
        tableRow.append($("<td>", { text: index + 1, "class": "num", "data-label": "No" }));

        // Add data cells
        $.map(columns, (col) => {
          const cellData = row[col.key] !== undefined ? row[col.key] : '';
          tableRow.append($("<td>", { text: cellData, "data-label": col.label }));
        });

        // Add Action buttons
        if (actions.length > 0) {
          const actionCell = $("<td>", { "class": "table-actions", "data-label": "Actions" });
          $.map(actions, (action) => {
            const button = $("<button>", {
            "class": `action-btn ${action.className || ''}`,
            text: action.label
            }).prepend(
            $("<span>", {
                "class": "material-symbols-outlined",
                text: action.icon
            })
            ).on("click", (e) => {
            e.preventDefault();
            action.onClick(row, index);
            });

            actionCell.append(button);
        });
        tableRow.append(actionCell);
        }

        return tableRow;
      })
    );
  }

  // 5. Assemble the table and render it
  const tableWrapper = $("<div>", { "class": "table-container-wrapper" });
  table.append([tableHead, tableBody]);
  tableWrapper.append(table);
  root.empty().append(tableWrapper);
}