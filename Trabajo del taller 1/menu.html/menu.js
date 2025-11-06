// ===== MENÚ LATERAL =====
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const main = document.querySelector('main');
const content = document.getElementById('content');

function closeMenu() {
  sidebar.classList.remove('active');
  main.classList.remove('shift');
}

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.toggle('active');
  main.classList.toggle('shift');
});

document.addEventListener('click', (e) => {
  if (sidebar.classList.contains('active') && !sidebar.contains(e.target)) {
    closeMenu();
  }
});

// ===== DATOS SIMULADOS =====
let libros = [
  { titulo: "Cien años de soledad", autor: "García Márquez", categoria: "Novela", anio: 1967, estado: "Disponible" },
  { titulo: "El principito", autor: "Antoine de Saint-Exupéry", categoria: "Fábula", anio: 1943, estado: "Prestado" },
  { titulo: "Don Quijote", autor: "Cervantes", categoria: "Clásico", anio: 1605, estado: "Disponible" },
];

let historial = [];
let usuarios = JSON.parse(localStorage.getItem('usuarios_biblio') || 'null') || [
  { nombre: "Admin", rol: "Administrador" },
  { nombre: "Juan Pérez", rol: "Editor" },
  { nombre: "María López", rol: "Visor" },
];
function persistirUsuarios() {
  localStorage.setItem('usuarios_biblio', JSON.stringify(usuarios));
}
let reservas = [];

// ===== SECCIONES DINÁMICAS =====
const secciones = {
  inicio: `
    <h1>Inicio</h1>
    <p>Bienvenido al sistema de gestión de biblioteca.</p>
  `,
  registrar: `
    <h1>Registrar Libros</h1>
    <form id="formRegistrarLibro" style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin:auto;">
        <input type="text" id="tituloLibro" placeholder="Título del libro" required>
        <input type="text" id="autorLibro" placeholder="Autor" required>
        <input type="text" id="categoriaLibro" placeholder="Categoría" required>
        <input type="number" id="anioLibro" placeholder="Año de lanzamiento" required>
        <button type="submit">Registrar Libro</button>
    </form>
    <div id="mensajeRegistro" style="margin-top:15px; font-weight:bold;"></div>
  `,
  usuarios: `
    <h1>Gestión de usuarios y roles</h1>
    <form id="formUsuarios" style="display:flex; flex-direction:column; gap:10px; max-width:520px; margin:auto;">
        <input type="text" id="nombreUsuario" placeholder="Nombre del usuario" required>
        <select id="rolUsuario">
            <option value="Administrador">Administrador</option>
            <option value="Editor">Editor</option>
            <option value="Visor">Visor</option>
        </select>
        <button type="submit">Agregar usuario</button>
    </form>
    <div id="mensajeUsuario" style="margin-top:15px; font-weight:bold; text-align:center;"></div>
    <h3>Usuarios</h3>
    <div id="listaUsuarios"></div>
  `,
  consultar: `
    <h1>Consultar Libros</h1>
    <input type="text" id="buscarLibro" placeholder="Buscar por título, autor o categoría">
    <div id="listaLibros"></div>
  `,
  prestamos: `
    <h1>Préstamos y Devoluciones</h1>
    <div id="tablaPrestamos"></div>
  `,
  historialPrestamos: `
    <h1>Historial de Préstamos</h1>
    <ul id="listaHistorialPrestamos"></ul>
  `,
  alertas: `
    <h1>Alertas Automáticas</h1>
    <p>Recordatorios de libros prestados:</p>
    <ul id="listaAlertas"></ul>
    <button id="enviarRecordatorio">Enviar recordatorio manual</button>
  `,
  reportes: `
    <h1>Reportes de Uso y Préstamos</h1>
    <div id="filtrosReportes">
        <input type="text" id="filtroUsuario" placeholder="Filtrar por usuario">
        <input type="text" id="filtroLibro" placeholder="Filtrar por libro">
    </div>
    <table id="tablaReportes" border="1" cellpadding="5">
        <thead><tr><th>Libro</th><th>Usuario</th><th>Acción</th><th>Fecha</th></tr></thead>
        <tbody></tbody>
    </table>
    <button id="exportarPDF">Exportar a PDF</button>
  `,
  reservas: `
    <h1>Reservas en Línea</h1>
    <p>Selecciona un libro para reservar:</p>
    <div id="listaLibrosReserva"></div>
    <h3>Reservas Activas</h3>
    <ul id="reservasActivas"></ul>
  `,
  copias: `
    <h1>Copias de Seguridad</h1>
    <p>Esta sección permite gestionar copias de seguridad de los datos de la biblioteca.</p>
    <div style="display:flex; gap:10px; justify-content:center; margin:10px 0;">
      <button id="btnExportar">Exportar datos (JSON)</button>
      <button id="btnImportar">Importar datos (JSON)</button>
      <input type="file" id="fileImport" accept="application/json" style="display:none;" />
    </div>
    <div id="estadoCopias" style="text-align:center; font-weight:bold; margin-top:10px;"></div>
  `,
  salir: `
    <h1>Sesión cerrada</h1>
    <p>Redirigiendo al inicio de sesión...</p>
  `
};

// ===== CAMBIO DE SECCIONES =====
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const section = e.target.closest('a').dataset.section;
    content.innerHTML = secciones[section] || '<h1>Sección no encontrada</h1>';

    if (section === 'salir') {
      setTimeout(() => window.location.href = '/index.html', 1500);
      return;
    }

    switch(section) {
      case 'consultar': mostrarLibros(); break;
      case 'prestamos': mostrarPrestamos(); break;
      case 'historialPrestamos': mostrarHistorialPrestamos(); break;
      case 'alertas': mostrarAlertas(); break;
      case 'reportes': mostrarReportes(); break;
      case 'registrar': registrarLibro(); break;
      case 'usuarios': gestionarUsuarios(); break;
      case 'reservas': mostrarReservas(); break;
      case 'copias': gestionarCopias(); break;
    }

    closeMenu();
  });
});

// ===== FUNCIONES =====

// Registrar Libros
function registrarLibro() {
  const form = document.getElementById('formRegistrarLibro');
  const mensaje = document.getElementById('mensajeRegistro');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const titulo = document.getElementById('tituloLibro').value.trim();
    const autor = document.getElementById('autorLibro').value.trim();
    const categoria = document.getElementById('categoriaLibro').value.trim();
    const anio = document.getElementById('anioLibro').value.trim();

    if (titulo && autor && categoria && anio) {
      libros.push({ titulo, autor, categoria, anio, estado: "Disponible" });
      mensaje.style.color = "green";
      mensaje.textContent = `✅ Libro "${titulo}" registrado correctamente.`;
      form.reset();
    } else {
      mensaje.style.color = "red";
      mensaje.textContent = "❌ Por favor completa todos los campos.";
    }
  });
}

// Consultar Libros
function mostrarLibros() {
  const contenedor = document.getElementById('listaLibros');
  const buscador = document.getElementById('buscarLibro');

  function renderizar(lista) {
    contenedor.innerHTML = lista.map(libro => `
      <div style="border:1px solid #ccc; margin:10px; padding:10px; border-radius:8px;">
        <strong>${libro.titulo}</strong> — ${libro.autor} (${libro.categoria}, ${libro.anio})
        <span style="color:${libro.estado === 'Disponible' ? 'green' : 'red'};">[${libro.estado}]</span>
      </div>
    `).join('');
  }

  renderizar(libros);

  buscador.addEventListener('input', e => {
    const texto = e.target.value.toLowerCase();
    const filtrados = libros.filter(l =>
      l.titulo.toLowerCase().includes(texto) ||
      l.autor.toLowerCase().includes(texto) ||
      l.categoria.toLowerCase().includes(texto)
    );
    renderizar(filtrados);
  });
}

// Préstamos y Devoluciones
function mostrarPrestamos() {
  const tabla = document.getElementById('tablaPrestamos');

  function renderTabla() {
    tabla.innerHTML = libros.map((l, i) => `
      <div style="margin:10px; padding:10px; border:1px solid #ddd; border-radius:8px;">
        <strong>${l.titulo}</strong> — ${l.autor} (${l.categoria}, ${l.anio})
        <span style="color:${l.estado === 'Disponible' ? 'green' : 'red'};">[${l.estado}]</span>
        <button onclick="prestarLibro(${i})" ${l.estado === 'Prestado' ? 'disabled' : ''}>Prestar</button>
        <button onclick="devolverLibro(${i})" ${l.estado === 'Disponible' ? 'disabled' : ''}>Devolver</button>
      </div>
    `).join('');
  }

  window.prestarLibro = (index) => {
    const libro = libros[index];
    libro.estado = "Prestado";
    historial.push({ libro: libro.titulo, accion: "Préstamo", fecha: new Date().toLocaleString() });
    renderTabla();
    mostrarHistorialPrestamos();
  };

  window.devolverLibro = (index) => {
    const libro = libros[index];
    libro.estado = "Disponible";
    historial.push({ libro: libro.titulo, accion: "Devolución", fecha: new Date().toLocaleString() });
    renderTabla();
    mostrarHistorialPrestamos();
  };

  renderTabla();
}

// Historial de Préstamos
function mostrarHistorialPrestamos() {
  const lista = document.getElementById('listaHistorialPrestamos');
  if (!lista) return;
  if (historial.length === 0) {
    lista.innerHTML = "<li>No hay movimientos registrados.</li>";
  } else {
    lista.innerHTML = historial.map(h =>
      `<li>${h.fecha}: ${h.accion} - ${h.libro}</li>`
    ).join('');
  }
}

// Copias de seguridad (Exportar / Importar JSON)
function gestionarCopias() {
  const btnExportar = document.getElementById('btnExportar');
  const btnImportar = document.getElementById('btnImportar');
  const inputFile = document.getElementById('fileImport');
  const estado = document.getElementById('estadoCopias');

  if (!btnExportar || !btnImportar || !inputFile) return;

  btnExportar.addEventListener('click', () => {
    try {
      const data = { libros, historial, usuarios, reservas };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-biblioteca-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      estado.style.color = 'green';
      estado.textContent = '✅ Exportación realizada correctamente.';
    } catch (e) {
      estado.style.color = 'red';
      estado.textContent = '❌ Error al exportar datos.';
    }
  });

  btnImportar.addEventListener('click', () => inputFile.click());

  inputFile.addEventListener('change', () => {
    const file = inputFile.files && inputFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object') throw new Error('Formato inválido');
        if (!Array.isArray(data.libros) || !Array.isArray(data.historial) || !Array.isArray(data.usuarios) || !Array.isArray(data.reservas)) {
          throw new Error('Estructura incompleta');
        }
        // Reemplazar datos en memoria
        libros = data.libros;
        historial = data.historial;
        usuarios = data.usuarios;
        reservas = data.reservas;
        estado.style.color = 'green';
        estado.textContent = '✅ Importación completada. Los datos han sido cargados.';
        // Re-render si estamos en alguna sección visible que dependa de datos
        const current = document.querySelector('.sidebar a.active');
        // Opcional: refrescar algunas vistas si existen contenedores
        const listaLibros = document.getElementById('listaLibros');
        if (listaLibros) mostrarLibros();
        const tablaPrestamos = document.getElementById('tablaPrestamos');
        if (tablaPrestamos) mostrarPrestamos();
        const listaHistorial = document.getElementById('listaHistorialPrestamos');
        if (listaHistorial) mostrarHistorialPrestamos();
      } catch (e) {
        estado.style.color = 'red';
        estado.textContent = '❌ Archivo inválido. Verifique el formato.';
      }
    };
    reader.readAsText(file);
  });
}

// Alertas
function mostrarAlertas() {
  const lista = document.getElementById('listaAlertas');
  const prestamosActivos = libros.filter(l => l.estado === "Prestado");

  lista.innerHTML = prestamosActivos.length === 0
    ? "<li>No hay alertas pendientes.</li>"
    : prestamosActivos.map(l => `<li>📚 ${l.titulo} — pendiente de devolución</li>`).join('');

  document.getElementById('enviarRecordatorio').addEventListener('click', () => {
    alert("Recordatorios enviados a los usuarios con libros prestados ✅");
  });
}

// Reportes
function mostrarReportes() {
  const cuerpo = document.querySelector('#tablaReportes tbody');
  cuerpo.innerHTML = historial.map(h => `
    <tr>
      <td>${h.libro}</td>
      <td>Usuario Demo</td>
      <td>${h.accion}</td>
      <td>${h.fecha}</td>
    </tr>
  `).join('');

  document.getElementById('exportarPDF').addEventListener('click', () => {
    alert("Exportación a PDF simulada ✅");
  });
}

// Gestión de Usuarios
function gestionarUsuarios() {
  const form = document.getElementById('formUsuarios');
  const mensaje = document.getElementById('mensajeUsuario');
  const lista = document.getElementById('listaUsuarios');

  function renderUsuarios() {
    if (usuarios.length === 0) {
      lista.innerHTML = "<p>No hay usuarios registrados.</p>";
      return;
    }

    lista.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios.map((u, i) => `
            <tr>
              <td>${u.nombre}</td>
              <td>
                <select data-rol-index="${i}">
                  <option value="Administrador" ${u.rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
                  <option value="Editor" ${u.rol === 'Editor' ? 'selected' : ''}>Editor</option>
                  <option value="Visor" ${u.rol === 'Visor' ? 'selected' : ''}>Visor</option>
                </select>
              </td>
              <td>
                <button onclick="guardarRol(${i})">Guardar</button>
                <button onclick="eliminarUsuario(${i})">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    // listeners para cambios de rol inline
    lista.querySelectorAll('select[data-rol-index]').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-rol-index'), 10);
        usuarios[idx].rol = e.target.value;
      });
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = document.getElementById('nombreUsuario').value.trim();
    const rol = document.getElementById('rolUsuario').value;

    if (!nombre) {
      mensaje.style.color = "red";
      mensaje.textContent = "❌ El nombre no puede estar vacío.";
      return;
    }

    if (usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase())) {
      mensaje.style.color = 'red';
      mensaje.textContent = '❌ Ya existe un usuario con ese nombre.';
      return;
    }

    usuarios.push({ nombre, rol });
    persistirUsuarios();
    mensaje.style.color = "green";
    mensaje.textContent = `✅ Usuario "${nombre}" agregado correctamente.`;
    form.reset();
    renderUsuarios();
  });

  window.eliminarUsuario = (index) => {
    if (confirm(`¿Eliminar al usuario "${usuarios[index].nombre}"?`)) {
      usuarios.splice(index, 1);
      persistirUsuarios();
      renderUsuarios();
    }
  };

  window.editarUsuario = (index) => {
    const nuevoNombre = prompt("Nuevo nombre:", usuarios[index].nombre);
    if (nuevoNombre) {
      usuarios[index].nombre = nuevoNombre;
      persistirUsuarios();
      renderUsuarios();
    }
  };

  window.guardarRol = (index) => {
    persistirUsuarios();
    mensaje.style.color = 'green';
    mensaje.textContent = `✅ Rol de "${usuarios[index].nombre}" actualizado a ${usuarios[index].rol}.`;
    setTimeout(() => mensaje.textContent = '', 1500);
  };

  renderUsuarios();
}

// Reservas en línea
function mostrarReservas() {
  const contenedor = document.getElementById('listaLibrosReserva');
  const listaReservas = document.getElementById('reservasActivas');

  function renderLibros() {
    contenedor.innerHTML = libros.map((l, i) => `
      <div style="border:1px solid #ccc; margin:10px; padding:10px; border-radius:8px;">
        <strong>${l.titulo}</strong> — ${l.autor} (${l.categoria}, ${l.anio})
        <span style="color:${l.estado === 'Disponible' ? 'green' : 'red'};">[${l.estado}]</span>
        <button class="btn-reservar" data-index="${i}" ${l.estado !== 'Disponible' ? 'disabled' : ''}>Reservar</button>
      </div>
    `).join('');

    contenedor.querySelectorAll('.btn-reservar').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.index;
        const libro = libros[index];
        reservas.push({ titulo: libro.titulo, anio: libro.anio, fecha: new Date().toLocaleString() });
        libro.estado = "Prestado"; 
        renderLibros();
        renderReservas();
        mostrarHistorialPrestamos();
        alert(`✅ Libro "${libro.titulo}" reservado correctamente.`);
      });
    });
  }

  function renderReservas() {
    if (reservas.length === 0) {
      listaReservas.innerHTML = "<li>No hay reservas activas.</li>";
    } else {
      listaReservas.innerHTML = reservas.map(r => `<li>📚 ${r.titulo} (${r.anio}) — ${r.fecha}</li>`).join('');
    }
  }

  renderLibros();
  renderReservas();
}
