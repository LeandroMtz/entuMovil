// Script para cargar datos de negocios desde archivos JSON

class DataLoader {
  constructor() {
    this.data = null;
    this.categorias = {};
    this.negocios = {};
  }

  // Cargar datos desde archivo JSON
  async loadData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al cargar datos: ${response.status}`);
      }
      this.data = await response.json();
      this.processData();
      return this.data;
    } catch (error) {
      console.error('Error al cargar datos:', error);
      return null;
    }
  }

  // Procesar datos y estructurarlos para fácil acceso
  processData() {
    if (!this.data || !this.data.categorias) return;

    this.categorias = this.data.categorias;
    this.negocios = {};

    // Extraer todos los negocios en un objeto plano
    Object.keys(this.categorias).forEach(catId => {
      const categoria = this.categorias[catId];
      if (categoria.negocios) {
        Object.keys(categoria.negocios).forEach(negocioId => {
          const negocio = categoria.negocios[negocioId];
          negocio.categoriaId = catId;
          this.negocios[negocioId] = negocio;
        });
      }
    });
  }

  // Obtener categorías
  getCategorias() {
    return this.categorias;
  }

  // Obtener negocios por categoría
  getNegociosByCategoria(categoriaId) {
    const categoria = this.categorias[categoriaId];
    return categoria ? categoria.negocios : {};
  }

  // Obtener negocio por ID
  getNegocioById(negocioId) {
    return this.negocios[negocioId] || null;
  }

  // Obtener todos los negocios
  getAllNegocios() {
    return this.negocios;
  }

  // Obtener configuración de colores por categoría
  getColoresCategoria(categoriaId) {
    const categoria = this.categorias[categoriaId];
    if (!categoria) return null;

    return {
      primary: categoria.color || '#9d00ff',
      secondary: categoria.secundario || '#00e5ff',
      accent: categoria.accento || '#be36b8'
    };
  }
}

// Instancia global del cargador de datos
const dataLoader = new DataLoader();

// Función para cargar datos y actualizar página
async function cargarDatosNegocios(url) {
  try {
    await dataLoader.loadData(url);
    return dataLoader;
  } catch (error) {
    console.error('Error al cargar datos de negocios:', error);
    return null;
  }
}

// Función para generar HTML de lista de negocios
function generarListaNegocios(negocios, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  Object.keys(negocios).forEach(negocioId => {
    const negocio = negocios[negocioId];
    const negocioElement = document.createElement('a');
    negocioElement.href = `negocio.html?id=${negocioId}`;
    negocioElement.className = 'business-card';
    
    negocioElement.innerHTML = `
      <div class="business-name">${negocio.nombre}</div>
      <div class="business-phone">${negocio.contacto.telefonos[0] || 'No disponible'}</div>
    `;
    
    container.appendChild(negocioElement);
  });
}

// Función para cargar datos de un negocio específico
function cargarDatosNegocio(negocioId, callback) {
  const negocio = dataLoader.getNegocioById(negocioId);
  if (callback) {
    callback(negocio);
  }
  return negocio;
}

// Función para aplicar colores de categoría a la página
function aplicarColoresCategoria(categoriaId) {
  const colores = dataLoader.getColoresCategoria(categoriaId);
  if (!colores) return;

  const root = document.documentElement;
  root.style.setProperty('--primary', colores.primary);
  root.style.setProperty('--secondary', colores.secondary);
  root.style.setProperty('--accent', colores.accent);
}

// Inicialización automática cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
  // Cargar datos de negocios automáticamente
  const dataUrl = '../data/negocios.json';
  cargarDatosNegocios(dataUrl);
});