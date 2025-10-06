document.addEventListener('DOMContentLoaded', function(){
    //getting the products list
    var products;

    if(localStorage.getItem("products") != null){
        products = JSON.parse(localStorage.getItem("products"));
    }
    else{
        products = [];
    }

    //getting the table
    const table = document.getElementById("products-list-table");

    //getting the delete button
    const deleteButton = document.getElementById("products-list-delete-button");

    //save products to localStorage
    function saveProducts(){
        localStorage.setItem("products", JSON.stringify(products));
    }

    //render table
    function renderProductsTable(){
        table.innerHTML = '';
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadContent = '<thead><tr><th>Nomor</th><th>Nama Produk</th><th>SKU</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Ubah</th><th>Hapus</th></tr></thead>';
        thead.innerHTML = theadContent;
        table.appendChild(thead);

        //if theres nothing in the products array
        if(products.length === 0){
            var rowEmpty = '<tr><td colspan="8">Tidak ada produk</td></tr>';
            tbody.innerHTML = rowEmpty;
            table.appendChild(tbody)
        }
        else{
            //loop through each product and add it as a new row
            for(var i = 0; i < products.length; i++){
                var product = products[i];

                //formats the price to IDR
                var price = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 2
                }).format(product.price);

                //new row element
                var row = document.createElement('tr')

                //fill the row element
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td>${product.category}</td>
                    <td>${price}</td>
                    <td>${product.stock}</td>
                    <td><a href="product_edit.html?sku=${product.sku}"><button class="products-list-edit-button">Ubah</button></a></td>
                    <td><button class="products-list-delete-button data-sku="${product.sku}>Hapus</button></td>`

                //append the new row
                tbody.appendChild(row);
            }
        }
    }

    //delete product
    function deleteProduct(sku){
        //new empty array for the updated list
        var updatedProducts = [];
        for(var i = 0; i < products.length; i++){
            //if the sku doesnt match, then put in updated array
            if(products[i].sku !== sku){
                updatedProducts.push(products[i]);
            }
        }

        //replace old array
        products = updatedProducts;

        //save new array
        saveProducts();

        renderProductsTable();
    }

    if(deleteButton){
        deleteButton.addEventListener("click", function(e){
            //get the sku
            var skuToDeelte = e.target.dataset.sku;

            //delete the product
            deleteProduct(sku);
        });
    }

    renderProductsTable();
});