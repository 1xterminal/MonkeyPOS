/**
 * Creates a single menu item link.
 * It correctly identifies the active page by comparing filenames.
 * @param {Object} data - The menu item data { url, label, icon }.
 * @returns {jQuery} The created <a> element.
 */
function createMenu(data) {
  // Get the current page's filename from the browser's URL (e.g., "dashboard.html")
  const currentPage = window.location.pathname.split('/').pop();
  
  // Get the menu item's filename from its URL (e.g., "dashboard.html")
  const menuFilename = data.url.split('/').pop();

  const link = $("<a>", {
    "class": "menu",
    "href": data.url,
    text: data.label
  }).prepend(
    $("<span>", {
      "class": "material-symbols-outlined",
      text: data.icon
    })
  );

  // Compare just the filenames. This will now work correctly.
  if (menuFilename === currentPage) {
    link.addClass("active");
  }

  return link;
}

/**
 * Creates the entire sidebar component and replaces the root placeholder.
 * @param {jQuery} root - The placeholder element to be replaced.
 * @param {Array<Object>} menus - The array of menu item data.
 */
function createSidebar(root, menus) {
  root.replaceWith(
    $("<div>", {
      "class": "sidebar",
    }).append([
      $("<div>", {
        "class": "logo-container",
      }).append(
        $("<img>", {
          "class": "logo",
          "src": "../../public/img/logo/logo.svg", // Man these files are tricky
          "alt": "logo"
        })
      ),
      $("<div>", {
        "class": "menus top",
      }).append($.map(menus.filter((item) => item.top), (item) => {
        return createMenu(item);
      })),
      $("<div>", {
        "class": "menus center",
      }).append($.map(menus.filter((item) => !item.bottom && !item.top), (item) => {
        return createMenu(item);
      })),
      $("<div>", {
        "class": "menus bottom"
      }).append($.map(menus.filter((item) => item.bottom), (item) => {
        return createMenu(item);
      }))
    ])
  )
}

// This block runs when the page is ready
$(document).ready(() => {
  createSidebar(
    $(".sidebar"), // The placeholder to target
    [
      {
        "label": "Dashboard",
        "icon": "dashboard",
        "url": "dashboard/dashboard.html",
        "top": true
      },
      {
        "label": "Terminal POS",
        "icon": "point_of_sale",
        "url": "../pos/pos_terminal.html" 
      },
      {
        "label": "Daftar Produk",
        "icon": "inventory_2",
        "url": "../products-list/products-list.html" 
      },
      {
        "label": "Riwayat Penjualan",
        "icon": "history",
        "url": "../sales_history/sales_history.html" 
      },
      {
        "label": "Daftar Member",
        "icon": "badge",
        "url": "../members-list/member_list.html" 
      },
      {
        "label": "Laporan",
        "icon": "insert_chart",
        "url": "laporan/laporan.html" 
      },
    ]
  );
});