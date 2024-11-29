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
      const traductor = {
        "Camisa": "Shirt",
        "Chompa": "Sweater",
        "Gorra": "Hat",
        "Cartuchera": "Pencil Case",
        "Celular": "Cell Phone",
        "Mousepad": "Mousepad",
        "Cuaderno": "Notebook",
        "Rompecabezas": "Puzzle",
        "Termo": "Thermos"
      };
      
      const producto = productos[key];  
      const varianteAzulMarino = producto["Azul Marino"];
      
      if (varianteAzulMarino) {
        const swiperSlide = document.createElement('div');
        swiperSlide.className = 'swiper-slide';

        swiperSlide.innerHTML = `
          <div class="banner-item image-zoom-effect">
            <div class="image-holder ratio ratio-1x1">
              <a href="#" class="mt-5">
                <img src="${varianteAzulMarino.imagen}" alt="${key} ${"Azul Marino"}" class="img-fluid">
              </a>
              <p class="text-center display-6"> 
                ${traductor[key]}
              </p>
            </div>
          </div>
        `;

        swiperWrapper.appendChild(swiperSlide);
      }
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
}

document.addEventListener('DOMContentLoaded', cargarProductos);
