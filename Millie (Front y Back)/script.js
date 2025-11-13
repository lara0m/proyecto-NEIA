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

async function cargarHistorial() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || !usuario.id) return;

  try {
    const response = await fetch(`http://localhost:3000/api/historial/${usuario.id}`);
    const data = await response.json();

    if (data.success && Array.isArray(data.historial)) {
      mostrarHistorialEnModal(data.historial);
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

    
     formRegistroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = formRegistroForm.querySelector('input[type="text"]').value;
    const email = formRegistroForm.querySelector('input[type="email"]').value;
    const password = formRegistroForm.querySelector('input[type="password"]').value;

    try {
      const res = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        crearAvatar(data.usuario.nombre);
        mostrarHistorial();
        modal.style.display = 'none';
      } else alert(data.error);
    } catch {
      alert('Error al conectar con el servidor');
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
        body: JSON.stringify({ nombre, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        crearAvatar(data.usuario.nombre);
        mostrarHistorial();
        modal.style.display = 'none';
      } else alert(data.error);
    } catch {
      alert('Error al conectar con el servidor');
    }
  });

  const usuarioGuardado = localStorage.getItem('usuario');
  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    crearAvatar(usuario.nombre);
    mostrarHistorial();
  }

  window.abrirInput = function (e) {
    if (e.target.id !== 'removeBtn') document.getElementById('fileInput').click();
  };

  window.mostrarArchivo = function (event) {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Por favor selecciona un archivo CSV válido');
        return;
      }

      document.querySelector('.icono').style.display = 'none';
      document.getElementById('file-info').style.display = 'block';
      document.getElementById('file-name').textContent = file.name;
      document.getElementById('file-size').textContent = `${(file.size / 1024).toFixed(1)} KB`;
      document.getElementById('removeBtn').style.display = 'block';
    }
  };

  function limpiarUploadBox() {
    document.getElementById('file-info').style.display = 'none';
    document.querySelector('.icono').style.display = 'block';
    document.getElementById('removeBtn').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('resultado-text').textContent = '(sube un archivo CSV con datos EEG)';
    document.getElementById('confianza-text').style.display = 'none';
  }

  const modalConfirmarGuardar = document.getElementById('modalConfirmarGuardar');
  const modalFormularioGuardar = document.getElementById('modalFormularioGuardar');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnNoGuardar = document.getElementById('btnNoGuardar');
  const cerrarFormularioGuardar = document.getElementById('cerrarFormularioGuardar');
  const formGuardarAnalisis = document.getElementById('formGuardarAnalisis');

  window.eliminarArchivo = function (e) {
    e.stopPropagation();
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
      limpiarUploadBox();
      return;
    }
    modalConfirmarGuardar.style.display = 'flex';
  };

  btnNoGuardar.addEventListener('click', () => {
    modalConfirmarGuardar.style.display = 'none';
    limpiarUploadBox();
  });

  btnGuardar.addEventListener('click', () => {
    modalConfirmarGuardar.style.display = 'none';
    const file = document.getElementById('fileInput').files[0];
    document.getElementById('archivoAdjunto').textContent = file ? file.name : '(sin archivo)';
    document.getElementById('resultadoActual').textContent = document.getElementById('resultado-text').textContent;
    modalFormularioGuardar.style.display = 'flex';
  });

  cerrarFormularioGuardar.addEventListener('click', () => {
    modalFormularioGuardar.style.display = 'none';
  });

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
  

  window.addEventListener('click', (e) => {
    if (e.target === modalConfirmarGuardar) modalConfirmarGuardar.style.display = 'none';
    if (e.target === modalFormularioGuardar) modalFormularioGuardar.style.display = 'none';
  });

  window.analizarEEG = async function () {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
      alert('Por favor selecciona un archivo CSV con datos EEG');
      return;
    }

    const loading = document.getElementById('loading');
    const resultadoText = document.getElementById('resultado-text');
    const confianzaText = document.getElementById('confianza-text');

    loading.style.display = 'block';
    resultadoText.textContent = 'Procesando...';
    confianzaText.style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('eegFile', file);
      const usuario = localStorage.getItem('usuario');
      if (usuario) formData.append('usuario', usuario);

      const response = await fetch('/api/analizar-eeg', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        resultadoText.textContent = data.resultado;
        confianzaText.textContent = `Confianza: ${(data.confianza * 100).toFixed(1)}%`;
        confianzaText.style.display = 'block';
        if (data.resultado.toLowerCase().includes('positivo')) resultadoText.style.color = '#4CAF50';
        else if (data.resultado.toLowerCase().includes('negativo')) resultadoText.style.color = '#f44336';
        else resultadoText.style.color = '#FF9800';
      } else {
        resultadoText.textContent = 'Error en el análisis';
        resultadoText.style.color = '#f44336';
      }
    } catch {
      resultadoText.textContent = 'Error de conexión';
      resultadoText.style.color = '#f44336';
    } finally {
      loading.style.display = 'none';
    }
  };
});
