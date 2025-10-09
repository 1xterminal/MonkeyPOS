$(document).ready(() => {
    const editForm = $('#product-edit-form');
    const urlParams = new URLSearchParams(window.location.search);
    const productSku = urlParams.get('sku');

    let products = Storage.getLocal("products", []);
    const product = products.find(p => p.sku === productSku);

    if (product) {
        $('#product-original-sku').val(product.sku);
        $('#product-name').val(product.name);
        $('#product-sku').val(product.sku);
        $('#product-category').val(product.category);
        $('#product-price').val(product.price);
        $('#product-stock').val(product.stock);
        if (product.image) {
            $('#product-image-preview').attr('src', product.image).show();
        }
    } else {
        alert('Produk tidak ditemukan!');
        window.location.href = 'products-list.html';
    }

    editForm.on('submit', (e) => {
        e.preventDefault();

        const originalSku = $('#product-original-sku').val();
        const productIndex = products.findIndex(p => p.sku === originalSku);

        if (productIndex !== -1) {
            const imageInput = $('#product-image')[0];
            if (imageInput.files && imageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    products[productIndex] = {
                        name: $('#product-name').val(),
                        sku: $('#product-sku').val(),
                        category: $('#product-category').val(),
                        price: parseFloat($('#product-price').val()),
                        stock: parseInt($('#product-stock').val(), 10),
                        image: e.target.result
                    };
                    Storage.setLocal("products", products);
                    alert('Produk berhasil diperbarui!');
                    window.location.href = 'products-list.html';
                };
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                products[productIndex] = {
                    name: $('#product-name').val(),
                    sku: $('#product-sku').val(),
                    category: $('#product-category').val(),
                    price: parseFloat($('#product-price').val()),
                    stock: parseInt($('#product-stock').val(), 10),
                    image: products[productIndex].image
                };
                Storage.setLocal("products", products);
                alert('Produk berhasil diperbarui!');
                window.location.href = 'products-list.html';
            }
        } else {
            alert('Produk tidak ditemukan!');
        }
    });
});