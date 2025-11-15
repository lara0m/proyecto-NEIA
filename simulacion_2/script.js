document.addEventListener('DOMContentLoaded', () => {
  // ===== ANIMACIONES DEL LOGO =====
  const logo = document.querySelector('.logoHeader');
  
  // Animación del logo del header
  if (logo) {
    logo.classList.add('pulse');
    
    // Remover la clase de pulso después de la animación
    setTimeout(() => {
      logo.classList.remove('pulse');
    }, 6000);
    
    // Animación especial al hacer click en el logo
    logo.addEventListener('click', () => {
      logo.classList.add('loading');
      setTimeout(() => {
        logo.classList.remove('loading');
      }, 2000);
    });
    
    // Animación al pasar el mouse (ya está en CSS con :hover)
    // Pero podemos agregar efectos adicionales
    logo.addEventListener('mouseenter', () => {
      logo.style.animationPlayState = 'paused';
    });
    
    logo.addEventListener('mouseleave', () => {
      logo.style.animationPlayState = 'running';
    });
  }

  // Modo oscuro
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
  }
  
  // Toggle de tema
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  const userIcon = document.getElementById('userIcon');
  const userIconContainer = document.getElementById('userIconContainer');
  const modal = document.getElementById('modalSesion');
  const cerrar = document.querySelector('.cerrar');
  const formRegistro = document.getElementById('formRegistro');
  const formLogin = document.getElementById('formLogin');
  const mostrarLogin = document.getElementById('mostrarLogin');
  const mostrarRegistro = document.getElementById('mostrarRegistro');
  const formRegistroForm = formRegistro.querySelector('form');
  const formLoginForm = formLogin.querySelector('form');

  // Abrir modal al hacer clic en el icono de usuario
  if (userIcon) {
    userIcon.addEventListener('click', () => {
      modal.style.display = 'flex';
      formRegistro.classList.add('activo');
      formLogin.classList.remove('activo');
    });
    
    userIcon.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        modal.style.display = 'flex';
        formRegistro.classList.add('activo');
        formLogin.classList.remove('activo');
      }
    });
  }

  
  cerrar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  
  mostrarLogin.addEventListener('click', () => {
    formRegistro.classList.remove('activo');
    formLogin.classList.add('activo');
  });

  mostrarRegistro.addEventListener('click', () => {
    formLogin.classList.remove('activo');
    formRegistro.classList.add('activo');
  });

  
  function crearAvatar(nombreUsuario) {
    const userIconContainer = document.getElementById('userIconContainer');
    if (!userIconContainer) return;

    // Crear contenedor del avatar
    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add('avatar-container');

    // Crear icono de usuario con hover
    const avatarIcon = document.createElement('div');
    avatarIcon.classList.add('avatar-icon');
    avatarIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    avatarIcon.setAttribute('title', nombreUsuario);

    // Crear menú de logout mejorado
    const logoutMenu = document.createElement('div');
    logoutMenu.classList.add('logout-menu');

    const userInfo = document.createElement('div');
    userInfo.classList.add('logout-user-info');
    userInfo.innerHTML = `
      <div class="logout-avatar-circle">
        <span>${nombreUsuario.slice(0, 2).toUpperCase()}</span>
      </div>
      <div class="logout-user-details">
        <div class="logout-username">${nombreUsuario}</div>
        <div class="logout-email">Usuario</div>
      </div>
    `;

    const logoutDivider = document.createElement('div');
    logoutDivider.classList.add('logout-divider');

    const logoutBtn = document.createElement('button');
    logoutBtn.classList.add('logout-button');
    logoutBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      <span>Cerrar sesión</span>
    `;
    
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuario');
      document.getElementById('btnHistorial').style.display = 'none';
      logoutMenu.style.display = 'none';
      
      // Restaurar el icono de usuario original
      const newUserIconContainer = document.createElement('div');
      newUserIconContainer.classList.add('user-icon-container');
      newUserIconContainer.id = 'userIconContainer';
      newUserIconContainer.innerHTML = `
        <svg class="user-icon" id="userIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="button" tabindex="0" aria-label="Abrir menú de sesión">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
      
      // Agregar event listeners al nuevo icono
      const newUserIcon = newUserIconContainer.querySelector('#userIcon');
      if (newUserIcon) {
        newUserIcon.addEventListener('click', () => {
          modal.style.display = 'flex';
          formRegistro.classList.add('activo');
          formLogin.classList.remove('activo');
        });
        
        newUserIcon.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            modal.style.display = 'flex';
            formRegistro.classList.add('activo');
            formLogin.classList.remove('activo');
          }
        });
      }
      
      avatarContainer.replaceWith(newUserIconContainer);
    });

    logoutMenu.appendChild(userInfo);
    logoutMenu.appendChild(logoutDivider);
    logoutMenu.appendChild(logoutBtn);
    avatarContainer.appendChild(avatarIcon);
    avatarContainer.appendChild(logoutMenu);

    // Toggle del menú
    avatarIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      logoutMenu.style.display =
        logoutMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!avatarContainer.contains(e.target)) {
        logoutMenu.style.display = 'none';
      }
    });

    // Reemplazar el contenedor del icono con el avatar
    const container = document.getElementById('userIconContainer');
    if (container && container.parentNode) {
      container.parentNode.replaceChild(avatarContainer, container);
    }
  }

  
  function mostrarHistorial() {
    const btnHistorial = document.getElementById('btnHistorial');
    const modalHistorial = document.getElementById('modalHistorial');
    const cerrarHistorial = document.querySelector('.cerrar-historial');
  
    btnHistorial.style.display = 'block';
  
    btnHistorial.addEventListener('click', async () => {
      modalHistorial.style.display = 'flex';
      await cargarHistorial();
    });
  
    cerrarHistorial.addEventListener('click', () => {
      modalHistorial.style.display = 'none';
    });
  
    window.addEventListener('click', (e) => {
      if (e.target === modalHistorial) {
        modalHistorial.style.display = 'none';
      }
    });
  }

  // Función para cargar el historial desde el servidor
  async function cargarHistorial() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.id) return;

    try {
      const response = await fetch(`/api/historial/${usuario.id}`);
      const data = await response.json();
      
      if (data.success) {
        mostrarHistorialEnModal(data.historial);
      } else {
        console.error("Error cargando historial:", data.error);
      }
    } catch (error) {
      console.error("Error de conexión al cargar historial:", error);
    }
  }

  // Función para mostrar el historial en el modal
  function mostrarHistorialEnModal(historial) {
    const historialLista = document.getElementById('historialLista');
    
    if (historial.length === 0) {
      historialLista.innerHTML = '<p>No hay análisis previos</p>';
      return;
    }
    
    historialLista.innerHTML = historial.map(item => {
      const fecha = new Date(item.fecha_analisis).toLocaleString();
      const confianza = (item.confianza * 100).toFixed(1);
      
      let colorClass = '';
      if (item.sentimiento.toLowerCase().includes('positivo')) {
        colorClass = 'resultado-positivo';
      } else if (item.sentimiento.toLowerCase().includes('negativo')) {
        colorClass = 'resultado-negativo';
      } else {
        colorClass = 'resultado-neutro';
      }
      
      return `
        <div class="historial-item">
          <div class="historial-archivo">📄 ${item.archivo_nombre}</div>
          <div class="historial-resultado ${colorClass}">${item.sentimiento}</div>
          <div class="historial-confianza">${confianza}%</div>
          <div class="historial-fecha">${fecha}</div>
        </div>
      `;
    }).join('');
  }
  

  formRegistroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = formRegistroForm.querySelector('input[type="text"]').value;
    const email = formRegistroForm.querySelector('input[type="email"]').value;
    const password = formRegistroForm.querySelector('input[type="password"]').value;

    try {
      const res = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        crearAvatar(data.usuario.nombre);
        mostrarHistorial();
        modal.style.display = 'none';
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor");
    }
  });

 
  formLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = formLoginForm.querySelector('input[type="text"]').value;
    const password = formLoginForm.querySelector('input[type="password"]').value;

    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        crearAvatar(data.usuario.nombre);
        mostrarHistorial();
        modal.style.display = 'none';
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor");
    }
  });

  
  const usuarioGuardado = localStorage.getItem('usuario');
  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    crearAvatar(usuario.nombre);
    mostrarHistorial();
  }

  
  window.abrirInput = function (e) {
    if (e.target.id !== "removeBtn") {
      document.getElementById("fileInput").click();
    }
  }

  window.mostrarArchivo = function (event) {
    const file = event.target.files[0];
    if (file) {
      // Verificar que es un archivo CSV
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Por favor selecciona un archivo CSV válido');
        event.target.value = ''; // Limpiar el input
        return;
      }
      
      const icono = document.querySelector(".icono");
      const fileInfo = document.getElementById("file-info");
      const fileName = document.getElementById("file-name");
      const fileSize = document.getElementById("file-size");
      const removeBtn = document.getElementById("removeBtn");
      
      if (icono) icono.style.display = "none";
      if (fileName) fileName.textContent = ` ${file.name}`;
      if (fileSize) fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      if (fileInfo) fileInfo.style.display = "block";
      if (removeBtn) removeBtn.style.display = "block";
    }
  }

  window.eliminarArchivo = function (e) {
    e.stopPropagation();
    const fileInfo = document.getElementById("file-info");
    const icono = document.querySelector(".icono");
    const removeBtn = document.getElementById("removeBtn");
    const fileInput = document.getElementById("fileInput");
    const resultadoText = document.getElementById("resultado-text");
    const confianzaText = document.getElementById("confianza-text");
    
    if (fileInfo) fileInfo.style.display = "none";
    if (icono) {
      // Resetear estilos inline problemáticos pero mantener display
      icono.style.display = "block";
      icono.style.opacity = "0.6"; // Opacidad original según CSS
      icono.style.filter = "";
      icono.style.color = "";
      // Asegurar que no tenga filtros de color aplicados
      icono.style.webkitFilter = "";
      icono.style.mozFilter = "";
    }
    if (removeBtn) removeBtn.style.display = "none";
    if (fileInput) fileInput.value = "";
    
    // Limpiar resultados y resetear color al original
    if (resultadoText) {
      resultadoText.textContent = "(sube un archivo CSV con datos EEG)";
      // Resetear el color al original (#6A1B9A)
      resultadoText.style.color = "#6A1B9A";
    }
    if (confianzaText) {
      confianzaText.style.display = "none";
      confianzaText.textContent = "";
    }
  }

  // Función para analizar EEG
  window.analizarEEG = async function() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    
    if (!file) {
      alert("Por favor selecciona un archivo CSV con datos EEG");
      return;
    }
    
    const loading = document.getElementById("loading");
    const resultadoText = document.getElementById("resultado-text");
    const confianzaText = document.getElementById("confianza-text");
    
    // Mostrar loading y proceso de análisis
    loading.style.display = "block";
    resultadoText.textContent = "Procesando...";
    confianzaText.style.display = "none";
    
    // Mostrar visualización del proceso
    if (typeof mostrarProcesoAnalisis === 'function') {
      mostrarProcesoAnalisis();
    }
    
    try {
      const formData = new FormData();
      formData.append('eegFile', file);
      
      // Agregar información del usuario si está logueado
      const usuario = localStorage.getItem('usuario');
      if (usuario) {
        formData.append('usuario', usuario);
      }
      
      const response = await fetch('/api/analizar-eeg', {
        method: 'POST',
        body: formData
      });
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        resultadoText.textContent = data.resultado;
        confianzaText.textContent = `Confianza: ${(data.confianza * 100).toFixed(1)}%`;
        confianzaText.style.display = "block";
        
        // Cambiar color según el resultado
        if (data.resultado.toLowerCase().includes('positivo')) {
          resultadoText.style.color = '#4CAF50';
        } else if (data.resultado.toLowerCase().includes('negativo')) {
          resultadoText.style.color = '#f44336';
        } else {
          resultadoText.style.color = '#FF9800';
        }
        
        console.log("✅ Análisis completado:", data);
        
        // Ocultar proceso después de completar
        if (typeof ocultarProcesoAnalisis === 'function') {
          ocultarProcesoAnalisis();
        }
      } else {
        resultadoText.textContent = "Error en el análisis";
        resultadoText.style.color = '#f44336';
        confianzaText.style.display = "none";
        alert(data.error || "Error procesando el archivo");
      }
      
    } catch (error) {
      console.error("❌ Error:", error);
      resultadoText.textContent = "Error de conexión";
      resultadoText.style.color = '#f44336';
      confianzaText.style.display = "none";
      
      // Mostrar mensaje de error más específico
      let errorMessage = "Error de conexión con el servidor";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en el puerto 3000.";
      }
      
      alert(errorMessage);
      
      // Ocultar proceso en caso de error
      if (typeof ocultarProcesoAnalisis === 'function') {
        ocultarProcesoAnalisis();
      }
    } finally {
      loading.style.display = "none";
    }
  }
});

// ===== MODAL HISTORIAL =====
const modalHistorial = document.getElementById("modalHistorial");
const cerrarHistorial = document.querySelector(".cerrar-historial");
const btnHistorial = document.getElementById("btnHistorial");

btnHistorial.addEventListener("click", () => {
  modalHistorial.style.display = "flex";
});

cerrarHistorial.addEventListener("click", () => {
  modalHistorial.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalHistorial) {
    modalHistorial.style.display = "none";
  }
});

const formGuardarAnalisis = document.getElementById('formGuardarAnalisis');

function limpiarUploadBox() {
  document.getElementById('file-info').style.display = 'none';
  document.querySelector('.icono').style.display = 'block';
  document.getElementById('removeBtn').style.display = 'none';
  document.getElementById('fileInput').value = '';
  document.getElementById('resultado-text').textContent = '(sube un archivo CSV con datos EEG)';
  document.getElementById('confianza-text').style.display = 'none';
}

formGuardarAnalisis.addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    alert('Debes iniciar sesión');
    return;
  }

  const file = document.getElementById('fileInput').files[0];
  const nombre = document.getElementById('nombreAnalisis').value.trim();
  const descripcion = document.getElementById('descripcionAnalisis').value.trim();
  const resultado = document.getElementById('resultadoActual').textContent;
  const confianza = document.getElementById('confianza-text').textContent.replace('Confianza: ', '').replace('%', '');

  if (!nombre || !file) {
    alert('Por favor ingresa un nombre y selecciona un archivo');
    return;
  }

  const formData = new FormData();
  formData.append('usuarioId', usuario.id);
  formData.append('nombre', nombre);
  formData.append('descripcion', descripcion);
  formData.append('resultado', resultado);
  formData.append('confianza', confianza);
  formData.append('archivo', file);

  try {
    const res = await fetch('http://localhost:3000/api/guardar-analisis', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      alert('Análisis guardado correctamente');
      modalFormularioGuardar.style.display = 'none';
      limpiarUploadBox();
      await cargarHistorial();
    } else {
      alert('Error al guardar análisis');
    }
  } catch (err) {
    console.error(err);
    alert('Error de conexión con el servidor');
  }
});

async function cargarHistorial() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || !usuario.id) return;

  try {
    const response = await fetch(`http://localhost:3000/api/historial/${usuario.id}`);
    const data = await response.json();

    if (data.success && Array.isArray(data.historial)) {
     // mostrarHistorialEnModal(data.historial);
    } else {
      console.error('Error cargando historial:', data.error || 'Formato incorrecto');
      document.getElementById('historialLista').innerHTML = '<p>No hay análisis guardados</p>';
    }
  } catch (error) {
    console.error('Error de conexión al cargar historial:', error);
  }
}


function mostrarHistorialEnModal(historial) {
  const historialLista = document.getElementById('historialLista');

  if (!historial || historial.length === 0) {
    historialLista.innerHTML = `
      <p style="text-align:center; color:#4A148C; font-family:'Rubik', sans-serif;">
        No hay análisis guardados todavía.
      </p>`;
    return;
  }

  historialLista.innerHTML = ""; 

  historial.forEach((item) => {
    const fecha = new Date(item.fecha).toLocaleString();
    const confianza = item.confianza ? `${parseFloat(item.confianza).toFixed(1)}%` : "–";
    const descripcion = item.descripcion ? item.descripcion : "Sin descripción";

    const div = document.createElement("div");
    div.classList.add("historial-item");
    div.dataset.id = item.id;

    div.innerHTML = `
      <div class="archivo-nombre">
        <a href="${item.archivo_url}" target="_blank" download="${item.archivo_nombre}">
          ${item.archivo_nombre}
        </a>
      </div>
      <h3>${item.nombre}</h3>
      <p class="desc">${descripcion}</p>
      <div class="historial-detalles">
        <span class="resultado">${item.resultado}</span>
        <span class="confianza">Confianza: ${confianza}</span>
        <span class="fecha">${fecha}</span>
      </div>
      <button class="eliminar-analisis">Eliminar</button>
    `;

    historialLista.appendChild(div);
  });

  document.querySelectorAll(".eliminar-analisis").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".historial-item").dataset.id;
      if (confirm("¿Deseas eliminar este análisis definitivamente?")) {
        try {
          const res = await fetch(`http://localhost:3000/api/analisis/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            alert("Análisis eliminado correctamente");
            await cargarHistorial();
          } else {
            alert("Error al eliminar el análisis");
          }
        } catch (err) {
          console.error("Error al eliminar:", err);
          alert("Error al conectar con el servidor");
        }
      }
    });
  });
}

