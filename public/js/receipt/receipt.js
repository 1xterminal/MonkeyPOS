var receiptData = {
  "carts": [
    {
      "name": "Nama barang",
      "price": 5000,
      "amount": 3
    },
    {
      "name": "Nama barang",
      "price": 20000,
      "amount": 4
    }
  ],
  "payment": 150000
};

function convertCurrency(val) {
  return Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',

  }).format(val).replace(',00', '');
}

function populateCarts(carts) {
  $('#carts').append(
    $.map(carts, (cart) => $("<div>", {
      "class": "cart"
    }).append([
      $("<div>", {
        "class": "cart-detail"
      }).append([
        $("<span>", {
          "class": "product-name",
          text: cart.name
        }),
        $("<span>", {
          "class": "product-price",
          text: `${convertCurrency(cart.price)} × ${cart.amount}`
        })
      ]),
      $("<span>", {
        "class": "total-price",
        text: convertCurrency(cart.price * cart.amount)
      })
    ]))
  );
}

function generatePayment(data) {
  let total = data.carts.reduce((sum, item) => sum + (item.price * item.amount), 0);
  $("#payment-total").text(convertCurrency(total));

  $("#payment-received").text(convertCurrency(data.payment));

  let change = data.payment - total;
  $("#payment-change").text(convertCurrency(change));
}

$(document).ready(() => {
  populateCarts(receiptData.carts);
  generatePayment(receiptData);
});