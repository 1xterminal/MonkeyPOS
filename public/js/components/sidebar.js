function createMenu(data) {
  return $("<a>", {
    "class": "menu",
    "href": data.url,
    text: data.label
  }).prepend(
    $("<span>", {
      "class": "material-symbols-outlined",
      text: data.icon
    })
  )
}

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
          "src": "public/img/logo/logo.svg",
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


$(document).ready(() => {
  createSidebar(
    $(".sidebar"),
    [
      {
        "label": "Dashboard",
        "icon": "dashboard",
        "url": "dashboard.html",
        "top": true
      },
      {
        "label": "Terminal POS",
        "icon": "point_of_sale",
        "url": "pos_terminal.html"
      },
      {
        "label": "Daftar Produk",
        "icon": "box",
        "url": "product_list.html"
      },
      {
        "label": "Riwayat Penjualan",
        "icon": "history",
        "url": "sales_history.html"
      },
      {
        "label": "Daftar Member",
        "icon": "badge",
        "url": "member_list.html"
      },
      {
        "label": "Laporan",
        "icon": "insert_chart",
        "url": "report.html"
      },
      // {
      //   "label": "Pengaturan",
      //   "icon": "settings",
      //   "url": "#",
      //   "bottom": true
      // },
    ]
  );
});


function createMenu(data) {
  const currentPage = window.location.pathname.split('/').pop();

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

  if (data.url === currentPage) {
    link.addClass("active");
  }

  return link;
}