$(document).ready(() => {
    const addForm = $('#product-add-form');
    let productImageBase64 = null; // untuk simpan data gambar

    // Listener untuk input file gambar
    $('#product-image').on('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Simpan hasil gambar sebagai Base64 string
                productImageBase64 = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    addForm.on('submit', (e) => {
        e.preventDefault();

        const newProduct = {
            name: $('#product-name').val(),
            sku: $('#product-sku').val(),
            category: $('#product-category').val(),
            price: parseFloat($('#product-price').val()),
            stock: parseInt($('#product-stock').val(), 10),
            image: productImageBase64
        };

        // Validasi sederhana
        if (!newProduct.name || !newProduct.sku || !newProduct.price) {
            alert("Nama Produk, SKU, dan Harga tidak boleh kosong!");
            return;
        }

        let products = Storage.getLocal("products", []);
        
        // Cek apakah SKU sudah ada
        if (products.some(p => p.sku === newProduct.sku)) {
            alert("SKU sudah ada. Harap gunakan SKU yang unik.");
            return;
        }

        products.push(newProduct);
        Storage.setLocal("products", products);

        alert('Produk berhasil ditambahkan!');
        window.location.href = 'products-list.html';
    });
});