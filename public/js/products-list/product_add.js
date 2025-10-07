$(document).ready(() => {
    const addForm = $('#product-add-form');

    addForm.on('submit', (e) => {
        e.preventDefault();

        const newProduct = {
            name: $('#product-name').val(),
            sku: $('#product-sku').val(),
            category: $('#product-category').val(),
            price: parseFloat($('#product-price').val()),
            stock: parseInt($('#product-stock').val(), 10),
            // Handle image later
        };

        let products = Storage.getLocal("products", []);
        // dummy data for testing
        // let products = [
        //     { name: "Product A", sku: "A123", category: "Category 1", price: 1000, stock: 10 },
        //     { name: "Product B", sku: "B456", category: "Category 2", price: 2000, stock: 5 },
        //     { name: "Product C", sku: "C789", category: "Category 1", price: 1500, stock: 15 },
        // ];

        products.push(newProduct);
        Storage.setLocal("products", products);

        alert('Produk berhasil ditambahkan!');
        window.location.href = 'products-list.html';
    });
});
