// Script para manejar la persistencia y modificación de datos de negocios

class DataManager {
    constructor() {
        this.dataUrl = '../data/negocios.json';
        this.data = null;
    }

    // Cargar datos desde archivo JSON
    async loadData() {
        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`Error al cargar datos: ${response.status}`);
            }
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error('Error al cargar datos:', error);
            // Si no se puede cargar, inicializar con estructura vacía
            this.data = { categorias: {} };
            return this.data;
        }
    }

    // Guardar datos en archivo JSON
    async saveData() {
        try {
            // En un entorno real, esto sería un servidor que recibe los datos
            // Para demostración, solo mostramos los datos en la consola
            console.log('Guardando datos:', this.data);
            
            // Como estamos en un entorno local, simulamos el guardado exitoso
            // En un servidor real, aquí se enviarían los datos al backend
            // y se escribirían en el archivo físico del servidor
            
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error);
            return false;
        }
    }

    // Agregar nuevo negocio
    addBusiness(negocioData) {
        if (!this.data || !this.data.categorias) {
            console.error('Datos no cargados');
            return false;
        }

        const categoriaId = negocioData.subcategoria;
        const negocioId = negocioData.id;

        if (!this.data.categorias[categoriaId]) {
            console.error('Categoría no encontrada:', categoriaId);
            return false;
        }

        // Si no existe la propiedad negocios, la creamos
        if (!this.data.categorias[categoriaId].negocios) {
            this.data.categorias[categoriaId].negocios = {};
        }

        // Agregar el nuevo negocio
        this.data.categorias[categoriaId].negocios[negocioId] = negocioData;
        
        console.log('Negocio agregado:', negocioData);
        return true;
    }

    // Editar negocio existente
    editBusiness(negocioId, negocioData) {
        if (!this.data || !this.data.categorias) {
            console.error('Datos no cargados');
            return false;
        }

        // Buscar el negocio en todas las categorías
        let encontrado = false;
        Object.keys(this.data.categorias).forEach(categoriaId => {
            const categoria = this.data.categorias[categoriaId];
            if (categoria.negocios && categoria.negocios[negocioId]) {
                categoria.negocios[negocioId] = negocioData;
                encontrado = true;
            }
        });

        if (!encontrado) {
            console.error('Negocio no encontrado:', negocioId);
            return false;
        }

        console.log('Negocio editado:', negocioData);
        return true;
    }

    // Eliminar negocio
    deleteBusiness(negocioId) {
        if (!this.data || !this.data.categorias) {
            console.error('Datos no cargados');
            return false;
        }

        let encontrado = false;
        Object.keys(this.data.categorias).forEach(categoriaId => {
            const categoria = this.data.categorias[categoriaId];
            if (categoria.negocios && categoria.negocios[negocioId]) {
                delete categoria.negocios[negocioId];
                encontrado = true;
            }
        });

        if (!encontrado) {
            console.error('Negocio no encontrado:', negocioId);
            return false;
        }

        console.log('Negocio eliminado:', negocioId);
        return true;
    }

    // Obtener todos los negocios
    getAllBusinesses() {
        if (!this.data || !this.data.categorias) {
            return {};
        }

        const negocios = {};
        Object.keys(this.data.categorias).forEach(categoriaId => {
            const categoria = this.data.categorias[categoriaId];
            if (categoria.negocios) {
                Object.keys(categoria.negocios).forEach(negocioId => {
                    negocios[negocioId] = categoria.negocios[negocioId];
                });
            }
        });

        return negocios;
    }

    // Obtener negocio por ID
    getBusinessById(negocioId) {
        if (!this.data || !this.data.categorias) {
            return null;
        }

        Object.keys(this.data.categorias).forEach(categoriaId => {
            const categoria = this.data.categorias[categoriaId];
            if (categoria.negocios && categoria.negocios[negocioId]) {
                return categoria.negocios[negocioId];
            }
        });

        return null;
    }

    // Obtener negocios por categoría
    getBusinessesByCategory(categoriaId) {
        if (!this.data || !this.data.categorias[categoriaId]) {
            return {};
        }

        return this.data.categorias[categoriaId].negocios || {};
    }

    // Generar ID único para negocio
    generateBusinessId(nombre) {
        return nombre.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_');
    }

    // Validar datos del negocio
    validateBusinessData(negocioData) {
        const errors = [];

        if (!negocioData.nombre || negocioData.nombre.trim() === '') {
            errors.push('El nombre del negocio es requerido');
        }

        if (!negocioData.subtitulo || negocioData.subtitulo.trim() === '') {
            errors.push('El subtítulo es requerido');
        }

        if (!negocioData.tagline || negocioData.tagline.trim() === '') {
            errors.push('El tagline es requerido');
        }

        if (!negocioData.categoria || negocioData.categoria.trim() === '') {
            errors.push('La categoría es requerida');
        }

        if (!negocioData.subcategoria || negocioData.subcategoria.trim() === '') {
            errors.push('La subcategoría es requerida');
        }

        if (!negocioData.contacto || !negocioData.contacto.direccion || negocioData.contacto.direccion.trim() === '') {
            errors.push('La dirección es requerida');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Instancia global del gestor de datos
const dataManager = new DataManager();

// Funciones para la interfaz de administración
async function saveBusiness(negocioData) {
    // Validar datos
    const validation = dataManager.validateBusinessData(negocioData);
    if (!validation.isValid) {
        return {
            success: false,
            errors: validation.errors
        };
    }

    // Generar ID si no existe
    if (!negocioData.id) {
        negocioData.id = dataManager.generateBusinessId(negocioData.nombre);
    }

    // Cargar datos existentes
    await dataManager.loadData();

    // Agregar o actualizar negocio
    const success = dataManager.addBusiness(negocioData);

    if (success) {
        // Guardar datos
        await dataManager.saveData();
        return {
            success: true,
            message: 'Negocio guardado exitosamente'
        };
    } else {
        return {
            success: false,
            message: 'Error al guardar el negocio'
        };
    }
}

// Función para aplicar colores de categoría a la página
function aplicarColoresCategoria(categoriaId) {
    const dataManager = window.dataManager || new DataManager();
    
    dataManager.loadData().then(() => {
        const categoria = dataManager.data.categorias[categoriaId];
        if (!categoria) return;

        const root = document.documentElement;
        root.style.setProperty('--primary', categoria.color);
        root.style.setProperty('--secondary', categoria.secundario);
        root.style.setProperty('--accent', categoria.accento);
    }).catch(error => {
        console.error('Error al aplicar colores de categoría:', error);
    });
}

// Función para inicializar el gestor de datos
async function initDataManager(dataUrl) {
    if (dataUrl) {
        dataManager.dataUrl = dataUrl;
    }
    await dataManager.loadData();
    return dataManager;
}

// Exportar funciones para uso global
window.dataManager = dataManager;
window.saveBusiness = saveBusiness;
window.initDataManager = initDataManager;