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
          "src": "./logo.svg",
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
        "icon": "point_of_sale",
        "url": "#",
        "top": true
      },
      {
        "label": "Dashboard",
        "icon": "dashboard",
        "url": "#"
      },
      {
        "label": "Produk",
        "icon": "box",
        "url": "#"
      },
      {
        "label": "Riwayat",
        "icon": "history",
        "url": "#"
      },
      {
        "label": "Member",
        "icon": "badge",
        "url": "#"
      },
      {
        "label": "Laporan",
        "icon": "insert_chart",
        "url": "#"
      },
      {
        "label": "Pengaturan",
        "icon": "settings",
        "url": "#",
        "bottom": true
      },
    ]
  );
});
