// Función que se llama cuando se carga la página para agregar los productos al carrito desde Firebase
async function cargarProductoss() {
  try {
    const response = await fetch('https://landing-1d04d-default-rtdb.firebaseio.com/.json', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos de Firebase');
    }

    const productos = await response.json();

    const swiperWrapper = document.getElementById('container-productselements');
    const title = document.getElementById('title-products');
    swiperWrapper.innerHTML = '';
    title.textContent = 'All';
    
    Object.keys(productos).forEach(key => {
      const dicProductos = productos[key];

      Object.keys(dicProductos).forEach(keyProducto => {
        const producto = dicProductos[keyProducto];

        Object.keys(producto).forEach(keyVariante => {
          const variante = producto[keyVariante];
          const swiperSlide = document.createElement('div');

          swiperSlide.innerHTML = `
            <div class="swiper-wrapper d-flex" style="width: 150px;">
              <div class="swiper-slide">
                <div class="product-item image-zoom-effect link-effect">
                  <div class="image-holder">
                    <p href="">
                      <img src="${variante.image}" alt="product" class="product-image1 img-fluid object-fit-cover">
                    </p>
                    <div class="product-content">
                      <h5 class="text-uppercase fs-5 mt-3">
                        <p href="index.html">${keyProducto}</p>
                        <p href="index.html">${keyVariante}</p>
                      </h5>
                      <div class="success-message text-center" style="display: none; color: green; font-weight: bold; margin-bottom: 10px;">
                        Product added successfully!
                      </div>
                      <a href="#" class="add-to-cart text-decoration-none" data-after="Add to cart"><span>$${variante.price}</span></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
          swiperWrapper.appendChild(swiperSlide);
        });
      });
    });

    swiperWrapper.addEventListener('click', function (event) {
      if (event.target && event.target.classList.contains('add-to-cart')) {
        event.preventDefault();

        const successMessage = event.target.previousElementSibling;
        successMessage.style.display = 'block';

        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 2000);

        const productoElement = event.target.closest('.product-item');
        const nombreProducto = productoElement.querySelector('h5').textContent
          .replace(/\n/g, ' ')  // Elimina saltos de línea
          .replace(/\s+/g, ' ')  // Elimina espacios múltiples
          .trim();  // Elimina espacios al inicio y al final

        const precio = parseFloat(event.target.querySelector('span').textContent.replace('$', ''));
        const imagen = productoElement.querySelector('img').src;

        const producto = {
          nombre: nombreProducto,
          precio: precio,
          image: imagen,
          cantidad: 1,
        };

        let carrito = localStorage.getItem('carrito');
        carrito = carrito ? JSON.parse(carrito) : [];

        const productoExistente = carrito.find(item => item.nombre === producto.nombre);

        if (productoExistente) {
          productoExistente.cantidad += 1;
        } else {
          carrito.push(producto);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));

        cargarProductosSelected();
        cargarTotal()
      }
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
}

async function cargarTotal() {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  let total = 0;
  carrito.forEach(producto => {
    total += producto.precio * producto.cantidad;
  });
  const totalElement = document.getElementById('total-price');
  totalElement.textContent = `$ ${total.toFixed(2)}`;
}


// Función para cargar los productos seleccionados desde localStorage
async function cargarProductosSelected() {
  try {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const containerSelectedProducts = document.getElementById('container-selectedProducts');

    containerSelectedProducts.innerHTML = '';

    if (carrito.length > 0) {
      carrito.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('d-flex', 'flex-column', 'mb-3');
        productoDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <p class="text-black mb-0"><strong>${producto.nombre}</strong></p>
          <div class="position-relative">
            <button class="btn-close m-2" aria-label="Close"></button>
            <div class="confirm-delete-popup bg-white" 
                style="display: none; 
                        position: absolute; 
                        right: 30px; 
                        top: -10px; 
                        background: white; 
                        border: 1px solid #ddd; 
                        padding: 10px; 
                        border-radius: 5px; 
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2); 
                        z-index: 1000; 
                        width: 250px;
                        text-align: center;">
              <p class="mb-2" style="font-size: 14px;">Are you sure you want to delete this product?</p>
              <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-sm btn-secondary cancel-delete">Cancel</button>
                <button class="btn btn-sm btn-danger confirm-delete">Delete</button>
              </div>
            </div>
          </div>
        </div>
        <div class="product-image d-flex">
          <img src="${producto.image}" alt="${producto.nombre}" class="img-fluid" style="width: 100px; height: 100px; object-fit: cover;">
          <div class="product-info ml-3 d-flex flex-column justify-content-center">
            <p>Precio: $${producto.precio}</p>
            <div class="quantity-controls d-flex align-items-center gap-2">
              <span class="product-quantity">Cantidad : </span>
              <button class="btn btn-sm btn-outline-secondary decrease"> - </button>
              <span class="product-quantity">${producto.cantidad}</span>
              <button class="btn btn-sm btn-outline-secondary increase"> + </button>
            </div>
          </div>
        </div>
      `;
      const decreaseBtn = productoDiv.querySelector('.decrease');
      const increaseBtn = productoDiv.querySelector('.increase');

      decreaseBtn.addEventListener('click', function() {
        if (producto.cantidad > 1) {
          producto.cantidad--;
          updateProductQuantity(producto);
        }
      });

      increaseBtn.addEventListener('click', function() {
        producto.cantidad++;
        updateProductQuantity(producto);
      });

        containerSelectedProducts.appendChild(productoDiv);

        const closeButton = productoDiv.querySelector('.btn-close');
        const confirmPopup = productoDiv.querySelector('.confirm-delete-popup');
        const cancelButton = productoDiv.querySelector('.cancel-delete');
        const confirmButton = productoDiv.querySelector('.confirm-delete');

        if (closeButton && confirmPopup && cancelButton && confirmButton) {
          closeButton.addEventListener('click', function() {
            confirmPopup.style.display = 'block';
          });

          cancelButton.addEventListener('click', function() {
            confirmPopup.style.display = 'none';
          });

          confirmButton.addEventListener('click', function() {
            const index = carrito.findIndex(item => item.nombre === producto.nombre);
            if (index !== -1) {
              carrito.splice(index, 1);
              localStorage.setItem('carrito', JSON.stringify(carrito));
              cargarProductosSelected();
              cargarTotal();
            }
          });
        }
      });
    }

  } catch (error) {
    console.error('Error al cargar los productos desde localStorage:', error);
  }
}

function updateProductQuantity(producto) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const index = carrito.findIndex(item => item.nombre === producto.nombre);
  
  if (index !== -1) {
    carrito[index].cantidad = producto.cantidad;
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarProductosSelected();
    cargarTotal();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarProductoss();
  cargarProductosSelected();
  cargarTotal();
});


document.getElementById('btn-buy').addEventListener('click', function() {
  const total = document.getElementById('total-price').textContent;
  const totalValue = parseFloat(total.replace('$ ', ''));
  
  if (totalValue <= 0) {
      alert('Please add items to your cart before proceeding to checkout');
      return;
  }

  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const productsList = document.getElementById('modal-products-list');
  productsList.innerHTML = ''; 

  carrito.forEach(producto => {
    const productoDiv = document.createElement('div');
    productoDiv.classList.add('d-flex', 'flex-column', 'mb-3');
    productoDiv.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <p class="text-black mb-0"><strong>${producto.nombre}</strong></p>
      </div>
      <div class="product-image d-flex">
        <img src="${producto.image}" alt="${producto.nombre}" class="img-fluid" style="width: 100px; height: 100px; object-fit: cover;">
        <div class="product-info ml-3 d-flex flex-column justify-content-center">
          <p>Precio: $${producto.precio}</p>
          <p>Cantidad: ${producto.cantidad}</p>
        </div>
      </div>
    `;
    productsList.appendChild(productoDiv);
  });

  document.getElementById('modal-total').textContent = total;
  
  const modal = document.getElementById('paymentModal');
  modal.style.display = 'block';
  modal.classList.add('show');
});

document.querySelector('.btn-close').addEventListener('click', function() {
  const modal = document.getElementById('paymentModal');
  modal.style.display = 'none';
  modal.classList.remove('show');
});


document.getElementById('paymentForm').addEventListener('submit', function(event) {
  event.preventDefault();

  if (!this.checkValidity()) {
      event.stopPropagation();
      this.classList.add('was-validated');
      return;
  }


  const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      total: document.getElementById('modal-total').textContent
  };

  
  const modal = document.getElementById('paymentModal');
  modal.style.display = 'none';
  modal.classList.remove('show');
  
  document.getElementById('container-selectedProducts').innerHTML = '';
  document.getElementById('total-price').textContent = '$ 0';
});

window.addEventListener('click', function(event) {
  const modal = document.getElementById('paymentModal');
  if (event.target === modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
  }
});


let id_buttons = ['Clothing', 'Tech', 'Varieties'];
id_buttons.forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    cargarProductosTipo(id);
  });
});

document.getElementById("all").addEventListener('click', () => {
  cargarProductoss();
});



async function cargarProductosTipo(tipo) {
  try {
    const response = await fetch(`https://landing-1d04d-default-rtdb.firebaseio.com/${tipo}/.json`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos de Firebase');
    }

    const productos = await response.json();
    const swiperWrapper = document.getElementById('container-productselements');
    const title = document.getElementById('title-products');
    swiperWrapper.innerHTML = '';
    title.textContent = tipo;

      Object.keys(productos).forEach(keyProducto => {
        const producto = productos[keyProducto];

        Object.keys(producto).forEach(keyVariante => {
          const variante = producto[keyVariante];
          const swiperSlide = document.createElement('div');

          swiperSlide.innerHTML = `
            <div class="swiper-wrapper d-flex" style="width: 150px;">
              <div class="swiper-slide">
                <div class="product-item image-zoom-effect link-effect">
                  <div class="image-holder">
                    <p href="">
                      <img src="${variante.image}" alt="product" class="product-image1 img-fluid object-fit-cover">
                    </p>
                    <div class="product-content">
                      <h5 class="text-uppercase fs-5 mt-3">
                        <p href="index.html">${keyProducto}</p>
                        <p href="index.html">${keyVariante}</p>
                      </h5>
                      <div class="success-message text-center" style="display: none; color: green; font-weight: bold; margin-bottom: 10px;">
                      Product added successfully! 
                      </div>
                      <a href="#" class="add-to-cart text-decoration-none" data-after="Add to cart"><span>$${variante.price}</span></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
          swiperWrapper.appendChild(swiperSlide);
        });
      });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
}
