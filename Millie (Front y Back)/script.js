document.addEventListener('DOMContentLoaded', () => {
  const botonSesion = document.querySelector('.iniciosesion');
  const modal = document.getElementById('modalSesion');
  const cerrar = document.querySelector('.cerrar');
  const formRegistro = document.getElementById('formRegistro');
  const formLogin = document.getElementById('formLogin');
  const mostrarLogin = document.getElementById('mostrarLogin');
  const mostrarRegistro = document.getElementById('mostrarRegistro');
  const formRegistroForm = formRegistro.querySelector('form');
  const formLoginForm = formLogin.querySelector('form');

  
  botonSesion.addEventListener('click', () => {
    modal.style.display = 'flex';
    formRegistro.classList.add('activo');
    formLogin.classList.remove('activo');
  });

  
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
    const iniciales = nombreUsuario.slice(0, 2).toUpperCase();

    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add('avatar-container');

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = iniciales;

    const logoutMenu = document.createElement('div');
    logoutMenu.classList.add('logout-menu');

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Cerrar sesión';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuario');
      avatarContainer.replaceWith(botonSesion);
      document.getElementById('btnHistorial').style.display = 'none';
    });

    logoutMenu.appendChild(logoutBtn);
    avatarContainer.appendChild(avatar);
    avatarContainer.appendChild(logoutMenu);

    
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      logoutMenu.style.display =
        logoutMenu.style.display === 'block' ? 'none' : 'block';
    });

    
    document.addEventListener('click', () => {
      logoutMenu.style.display = 'none';
    });

    botonSesion.replaceWith(avatarContainer);
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
        return;
      }
      
      document.querySelector(".icono").style.display = "none";
      const fileInfo = document.getElementById("file-info");
      const fileName = document.getElementById("file-name");
      const fileSize = document.getElementById("file-size");
      
      fileName.textContent = ` ${file.name}`;
      fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      
      fileInfo.style.display = "block";
      document.getElementById("removeBtn").style.display = "block";
    }
  }

    // === NUEVA FUNCIÓN ELIMINAR ARCHIVO CON MODAL ===
    window.eliminarArchivo = function (e) {
      e.stopPropagation();
      const usuario = localStorage.getItem('usuario');
      const modalConfirmarGuardar = document.getElementById('modalConfirmarGuardar');
  
      // Si no hay usuario, borrar directamente
      if (!usuario) {
        limpiarUploadBox();
        return;
      }
  
      // Mostrar modal de confirmación
      modalConfirmarGuardar.style.display = 'flex';
    };
  
    // Limpia la caja de carga (upload box)
    function limpiarUploadBox() {
      document.getElementById("file-info").style.display = "none";
      document.querySelector(".icono").style.display = "block";
      document.getElementById("removeBtn").style.display = "none";
      document.getElementById("fileInput").value = "";
      document.getElementById("resultado-text").textContent = "(sube un archivo CSV con datos EEG)";
      document.getElementById("confianza-text").style.display = "none";
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
    
    // Mostrar loading
    loading.style.display = "block";
    resultadoText.textContent = "Procesando...";
    confianzaText.style.display = "none";
    
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
        
        console.log(" Análisis completado:", data);
      } else {
        resultadoText.textContent = "Error en el análisis";
        resultadoText.style.color = '#f44336';
        confianzaText.style.display = "none";
        alert(data.error || "Error procesando el archivo");
      }
      
    } catch (error) {
      console.error(" Error:", error);
      resultadoText.textContent = "Error de conexión";
      resultadoText.style.color = '#f44336';
      confianzaText.style.display = "none";
      alert("Error de conexión con el servidor");
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

    // === MODAL GUARDAR EN HISTORIAL ===

  // Obtenemos los elementos SOLO cuando el DOM ya está cargado
  const modalConfirmarGuardar = document.getElementById('modalConfirmarGuardar');
  const modalFormularioGuardar = document.getElementById('modalFormularioGuardar');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnNoGuardar = document.getElementById('btnNoGuardar');
  const cerrarFormularioGuardar = document.getElementById('cerrarFormularioGuardar');
  const formGuardarAnalisis = document.getElementById('formGuardarAnalisis');

  // Función auxiliar para limpiar el upload box
  function limpiarUploadBox() {
    document.getElementById("file-info").style.display = "none";
    document.querySelector(".icono").style.display = "block";
    document.getElementById("removeBtn").style.display = "none";
    document.getElementById("fileInput").value = "";
    document.getElementById("resultado-text").textContent = "(sube un archivo CSV con datos EEG)";
    document.getElementById("confianza-text").style.display = "none";
  }

  // Sobrescribimos eliminarArchivo
  window.eliminarArchivo = function (e) {
    e.stopPropagation();
    const usuario = localStorage.getItem('usuario');

    if (!usuario) {
      limpiarUploadBox();
      return;
    }

    modalConfirmarGuardar.style.display = 'flex';
  };

  // Si elige "No guardar"
  btnNoGuardar.addEventListener('click', () => {
    modalConfirmarGuardar.style.display = 'none';
    limpiarUploadBox();
  });

  // Si elige "Guardar"
  btnGuardar.addEventListener('click', () => {
    modalConfirmarGuardar.style.display = 'none';

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const resultadoText = document.getElementById("resultado-text").textContent;

    document.getElementById("archivoAdjunto").textContent = file ? file.name : "(sin archivo)";
    document.getElementById("resultadoActual").textContent = resultadoText;

    modalFormularioGuardar.style.display = 'flex';
  });

  // Cierra el modal del formulario
  cerrarFormularioGuardar.addEventListener('click', () => {
    modalFormularioGuardar.style.display = 'none';
  });

  // Envío del formulario (por ahora solo simula)
  formGuardarAnalisis.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('✅ El análisis se guardaría aquí (simulado)');
    modalFormularioGuardar.style.display = 'none';
    limpiarUploadBox();
  });

  // Cierra los modales si se hace clic fuera
  window.addEventListener('click', (e) => {
    if (e.target === modalConfirmarGuardar) modalConfirmarGuardar.style.display = 'none';
    if (e.target === modalFormularioGuardar) modalFormularioGuardar.style.display = 'none';
  });

});
