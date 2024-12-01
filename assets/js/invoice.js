// Función para generar el PDF
function generateInvoice(formData) {
  try {
    window.jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF();

    const logoUrl = 'assets/images/LogoFactura.png';
    const img = new Image();
    img.src = logoUrl;

    img.onload = function () {
      const imgWidth = 30;
      const imgHeight = (img.height * imgWidth) / img.width;
      const pageWidth = doc.internal.pageSize.getWidth();
      const x = (pageWidth - imgWidth) / 2;

      doc.addImage(img, 'PNG', x, 10, imgWidth, imgHeight);

      doc.setFontSize(20);
      doc.text('TawsShop Invoice', 105, imgHeight + 25, { align: 'center' });

      const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

      const startY = imgHeight + 35;
      doc.setFontSize(12);
      doc.text('Customer Information:', 20, startY);
      doc.setFontSize(10);
      doc.text(`Name: ${formData.fullName}`, 20, startY + 10);
      doc.text(`Email: ${formData.email}`, 20, startY + 20);
      doc.text(`Phone: ${formData.phone}`, 20, startY + 30);
      doc.text(`Payment Method: ${formData.paymentMethod}`, 20, startY + 40);

      const date = new Date().toLocaleDateString();
      doc.text(`Date: ${date}`, 20, startY + 50);

      doc.setFontSize(12);
      doc.text('Products:', 20, startY + 60);

      const productsData = carrito.map(producto => [
        producto.nombre,
        `$${producto.precio}`,
        producto.cantidad,
        `$${(producto.precio * producto.cantidad).toFixed(2)}`
      ]);

      doc.autoTable({
        startY: startY + 70,
        head: [['Product', 'Price', 'Quantity', 'Subtotal']],
        body: productsData,
        theme: 'striped',
        headStyles: { fillColor: [51, 51, 51] }
      });

      const finalY = doc.lastAutoTable.finalY || startY + 100;
      doc.setFontSize(12);
      doc.text(`Total: ${formData.total}`, 20, finalY + 20);

      doc.setFontSize(8);
      doc.text('Thank you for shopping at TawsShop!', 105, 280, { align: 'center' });

      doc.save(`TawsShop_Invoice_${date}.pdf`);
      
      actualizarInventarios();
      localStorage.removeItem('carrito');
      const modal = document.getElementById('paymentModal');
      modal.style.display = 'none';
      modal.classList.remove('show');
      document.getElementById('container-selectedProducts').innerHTML = '';
      document.getElementById('total-price').textContent = '$ 0';

      const successToast = document.getElementById('successToast');
      successToast.style.display = 'block';
      setTimeout(() => {
        successToast.style.display = 'none';
      }, 2000);

    };

    img.onerror = function () {
      console.error('Error cargando la imagen del logo');
      generatePDFWithoutLogo(doc, formData);
    };

  } catch (error) {
    console.error('Error generando PDF:', error);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', function (event) {
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
        paymentMethod: document.getElementById('paymentMethod')?.value || 'Not specified',
        total: document.getElementById('modal-total').textContent
      };

      generateInvoice(formData);
    });
  } else {
    console.error('Formulario de pago no encontrado');
  }
});

async function actualizarInventarios() {
  try {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const response = await fetch('https://landing-1d04d-default-rtdb.firebaseio.com/.json');
    if (!response.ok) {
      throw new Error('Error al obtener datos de Firebase');
    }
    const inventarioActual = await response.json();

    for (const itemCarrito of carrito) {
      const palabras = itemCarrito.nombre.split(' ');
      let nombreProducto, variante;
      
      // Verificar si termina en "Navy Blue"
      if (palabras.slice(-2).join(' ') === 'Navy Blue') {
        variante = 'Navy Blue';
        nombreProducto = palabras.slice(0, -2).join(' ');
      } else {
        variante = palabras.pop();
        nombreProducto = palabras.join(' ');
      }

      let encontrado = false;

      // Buscar en todas las categorías sin romper el ciclo
      for (const categoria in inventarioActual) {
        if (nombreProducto in inventarioActual[categoria]) {
          const stockActual = inventarioActual[categoria][nombreProducto][variante]?.stock;
          console.log(stockActual);
          if (stockActual !== undefined) {
            const nuevoStock = Math.max(0, stockActual - itemCarrito.cantidad);
            
            const updateResponse = await fetch(
              `https://landing-1d04d-default-rtdb.firebaseio.com/${categoria}/${nombreProducto}/${variante}/stock.json`,
              {
                method: 'PUT',
                body: JSON.stringify(nuevoStock),
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );

            if (!updateResponse.ok) {
              throw new Error(`Error actualizando stock de ${nombreProducto} ${variante}`);
            }
            
            encontrado = true;
          }
        }
      }
      
      if (!encontrado) {
        console.warn(`Producto no encontrado en inventario: ${nombreProducto} ${variante}`);
      }
    }

  } catch (error) {
    console.error('Error actualizando inventarios:', error);
  }
}