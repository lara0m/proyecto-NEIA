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

  // === ABRIR Y CERRAR MODAL DE SESIÓN ===
  botonSesion.addEventListener('click', () => {
    modal.style.display = 'flex';
    formRegistro.classList.add('activo');
    formLogin.classList.remove('activo');
  });

  cerrar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // === CAMBIAR ENTRE LOGIN Y REGISTRO ===
  mostrarLogin.addEventListener('click', () => {
    formRegistro.classList.remove('activo');
    formLogin.classList.add('activo');
  });

  mostrarRegistro.addEventListener('click', () => {
    formLogin.classList.remove('activo');
    formRegistro.classList.add('activo');
  });

  // === CREAR AVATAR Y LOGOUT ===
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

  // === MOSTRAR MODAL DE HISTORIAL ===
  function mostrarHistorial() {
    const btnHistorial = document.getElementById('btnHistorial');
    const modalHistorial = document.getElementById('modalHistorial');
    const cerrarHistorial = document.querySelector('.cerrar-historial');

    btnHistorial.style.display = 'block';

    btnHistorial.addEventListener('click', () => {
      modalHistorial.style.display = 'flex';
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

  // === REGISTRO ===
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

  // === LOGIN ===
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

  // === SI YA HAY SESIÓN GUARDADA ===
  const usuarioGuardado = localStorage.getItem('usuario');
  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    crearAvatar(usuario.nombre);
    mostrarHistorial();
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

// ===== FUNCIONES NUEVAS PARA SUBIR ARCHIVOS =====
function abrirInputArchivo(event) {
  event.stopPropagation();
  const fileInput = event.currentTarget.querySelector('#fileInput');
  fileInput.click();

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    const fileNameSpan = event.currentTarget.querySelector('#fileName');
    if (file) {
      fileNameSpan.textContent = file.name;
      fileNameSpan.style.display = "block";
    }
  };
}

function eliminarArchivo(event) {
  event.stopPropagation();
  const uploadBox = event.currentTarget.closest('.upload-box');
  const fileInput = uploadBox.querySelector('#fileInput');
  const fileNameSpan = uploadBox.querySelector('#fileName');

  fileInput.value = "";
  fileNameSpan.textContent = "";
  fileNameSpan.style.display = "none";
}

