async function cargarProductosSelected() {
  try {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length != 0) {

    const containerSelectedProducts = document.getElementById('container-selectedProducts');
    carrito.forEach(producto => {
      const productoDiv = document.createElement('div');
      productoDiv.classList.add('d-flex','flex-column');
      
      productoDiv.innerHTML = `
        <p class="text-black"><strong>${producto.nombre}</strong></p>
        <div class="product-image d-flex">
          <img src="${producto.image}" alt="${producto.nombre}" class="img-fluid" style="width: 100px; height: 100px; object-fit: cover;">
          <div class="product-info ml-3 d-flex flex-column justify-content-center">
            <p>Cantidad: <span class="product-quantity">${producto.cantidad}</span></p>
            <p>Precio: $${producto.precio}</p>
          </div>
        </div>
      `;
      containerSelectedProducts.appendChild(productoDiv);
    });
    }

  } catch (error) {
    console.error('Error al cargar los productos desde localStorage:', error);
  }
}

// Ejecutar la función cuando el DOM se haya cargado completamente
document.addEventListener('DOMContentLoaded', cargarProductosSelected);
