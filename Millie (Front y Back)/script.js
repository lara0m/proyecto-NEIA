function abrirInput(e) {
    if (e.target.id !== "removeBtn") {
      document.getElementById("fileInput").click();
    }
  }

  function mostrarImagen(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        document.querySelector(".icono").style.display = "none";
        const preview = document.getElementById("preview");
        preview.src = e.target.result;
        preview.style.display = "block";
        document.getElementById("removeBtn").style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  }

  function eliminarImagen(e) {
    e.stopPropagation();
    const preview = document.getElementById("preview");
    preview.src = "";
    preview.style.display = "none";
    document.querySelector(".icono").style.display = "block";
    document.getElementById("removeBtn").style.display = "none";
    document.getElementById("fileInput").value = "";
  }

  document.addEventListener('DOMContentLoaded', () => {
  const botonSesion = document.querySelector('.iniciosesion');
  const modal = document.getElementById('modalSesion');
  const cerrar = document.querySelector('.cerrar');
  const formRegistro = document.getElementById('formRegistro');
  const formLogin = document.getElementById('formLogin');
  const mostrarLogin = document.getElementById('mostrarLogin');
  const mostrarRegistro = document.getElementById('mostrarRegistro');

  // Mostrar modal con formulario de registro por defecto
  botonSesion.addEventListener('click', () => {
    modal.style.display = 'flex';
    formRegistro.classList.add('activo');
    formLogin.classList.remove('activo');
  });

  // Cerrar modal
  cerrar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Cambiar entre formularios
  mostrarLogin.addEventListener('click', () => {
    formRegistro.classList.remove('activo');
    formLogin.classList.add('activo');
  });

  mostrarRegistro.addEventListener('click', () => {
    formLogin.classList.remove('activo');
    formRegistro.classList.add('activo');
  });

  // --- FUNCIÓN PARA CREAR AVATAR ---
  function crearAvatar(nombreUsuario) {
    const iniciales = nombreUsuario.slice(0, 2).toUpperCase(); // primeras 2 letras
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = iniciales;

    // Reemplaza la imagen por el avatar
    botonSesion.replaceWith(avatar);
  }

  // --- Simular registro ---
  const formRegistroForm = formRegistro.querySelector('form');
  formRegistroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = formRegistroForm.querySelector('input[type="text"]').value;
    if (nombre.trim() !== "") {
      crearAvatar(nombre);
      modal.style.display = 'none';
    }
  });

  // --- Simular inicio de sesión ---
  const formLoginForm = formLogin.querySelector('form');
  formLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = formLoginForm.querySelector('input[type="text"]').value;
    if (nombre.trim() !== "") {
      crearAvatar(nombre);
      modal.style.display = 'none';
    }
  });
});

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
      crearAvatar(data.usuario.nombre);
      modal.style.display = 'none';
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
  }
});

// Login
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
      crearAvatar(data.usuario.nombre);
      modal.style.display = 'none';
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
  }
});