function createHeader(root, userData) {
  const header = $("<div>", {
    "class": "header-actions"
  }).append([
    $("<div>", {
      "class": "user-profile"
    }).append([
      $("<span>", {
        "class": "material-symbols-outlined",
        text: "person"
      }),
      $("<span>", {
        text: `Hello, ${userData ? userData.name : "Guest"}`
      })
    ]),
    $("<a>", {
      "class": "logout-btn",
      "href": "#"
    }).append(
      $("<span>", {
        "class": "material-symbols-outlined",
        text: "logout"
      })
    )
  ]);

  root.replaceWith(header);

  // Logout handler
  $(".logout-btn").on("click", (e) => {
    e.preventDefault();
    sessionStorage.removeItem("currentUser");
    window.location.href = "../../pages/login/login.html";
  });
}

$(document).ready(() => {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.href = "../../pages/login/login.html";
    return;
  }

  // Render header ke elemen .header-actions lama
  createHeader($(".header-actions"), currentUser);
});
