async function cargarProductos() {
  try {
    const response = await fetch('https://landing-1d04d-default-rtdb.firebaseio.com/.json', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos de Firebase');
    }

    const productos = await response.json();
    console.log(productos);

    const swiperWrapper = document.getElementById('swiperWrapper');

    Object.keys(productos).forEach(key => {
      
      const dicProductos = productos[key];  
      
      Object.keys(dicProductos).forEach(keyProducto => {
        const producto = dicProductos[keyProducto];
        const varianteAzulMarino = producto["Navy Blue"];

        if (varianteAzulMarino) {
          const swiperSlide = document.createElement('div');
          swiperSlide.className = 'swiper-slide';
  
          swiperSlide.innerHTML = `
            <div class="banner-item image-zoom-effect">
              <div class="image-holder ratio ratio-1x1">
                <a href="#" class="mt-5">
                  <img src="${varianteAzulMarino.image}" alt="${keyProducto} Navy Blue" class="img-fluid">
                </a>
                <p class="text-center display-6"> 
                  ${keyProducto}
                </p>
              </div>
            </div>
          `;
  
          swiperWrapper.appendChild(swiperSlide);
        }
      });
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
}

document.addEventListener('DOMContentLoaded', cargarProductos);
