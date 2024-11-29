async function cargarProductoss() {
  try {
    const response = await fetch('https://landing-1d04d-default-rtdb.firebaseio.com/.json', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos de Firebase');
    }

    const productos = await response.json();
    console.log(productos);

    const swiperWrapper = document.getElementById('container-productselements'); // Verifica que el ID coincida

    // Iteramos sobre las claves de los productos
    Object.keys(productos).forEach(key => {
      const producto = productos[key];

      // Iterar sobre las variantes de cada producto (por ejemplo, Azul Marino, Gris)
      Object.keys(producto).forEach(vari => {
        const variante = producto[vari];

        // Crear el swiperSlide para cada variante del producto
        const swiperSlide = document.createElement('div');

        // Crear el contenido de la imagen y su texto
        swiperSlide.innerHTML = `
          <div class="image-holder ratio ratio-1x1 colors p-5" style="width: 200px; height: 200px; padding: 10px; margin: 40px 10px">
            <a href="#" class="mt-5">
              <img src="${variante.imagen}" alt="${key} ${vari}" class="img-fluid h-100 w-100 object-fit-cover mt-4">
            </a>
            <p class="text-center titleprod mb-5 text-black">${key}</p>
            <p class="text-center subtitleprod mt-4 text-black">${vari}</p>
          </div>
        `;

        // Agregar el swiperSlide al contenedor
        swiperWrapper.appendChild(swiperSlide);
      });
    });
  } catch (error) {
    console.error('Error al cargar los productos:', error);
  }
}

// Espera a que el DOM se cargue antes de ejecutar la función
document.addEventListener('DOMContentLoaded', cargarProductoss);
