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

<<<<<<< HEAD
  // abrir modal
=======

>>>>>>> 7cb9c0488d43d85d9a593ef3d882cb82662e3fb6
  botonSesion.addEventListener('click', () => {
    modal.style.display = 'flex';
    formRegistro.classList.add('activo');
    formLogin.classList.remove('activo');
  });

<<<<<<< HEAD
  // cerrar modal
=======
  
>>>>>>> 7cb9c0488d43d85d9a593ef3d882cb82662e3fb6
  cerrar.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

<<<<<<< HEAD
  // cambiar entre login y registro
=======
  
>>>>>>> 7cb9c0488d43d85d9a593ef3d882cb82662e3fb6
  mostrarLogin.addEventListener('click', () => {
    formRegistro.classList.remove('activo');
    formLogin.classList.add('activo');
  });

  mostrarRegistro.addEventListener('click', () => {
    formLogin.classList.remove('activo');
    formRegistro.classList.add('activo');
  });

<<<<<<< HEAD
  // función para crear avatar
  function crearAvatar(nombreUsuario) {
    const iniciales = nombreUsuario.slice(0, 2).toUpperCase();
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = iniciales;
    botonSesion.replaceWith(avatar);
  }

  // --- REGISTRO ---
  formRegistroForm.addEventListener('submit', async (e) => {
=======
  
  function crearAvatar(nombreUsuario) {
    const iniciales = nombreUsuario.slice(0, 2).toUpperCase(); 
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.textContent = iniciales;

    
    botonSesion.replaceWith(avatar);
  }

  
  const formRegistroForm = formRegistro.querySelector('form');
  formRegistroForm.addEventListener('submit', (e) => {
>>>>>>> 7cb9c0488d43d85d9a593ef3d882cb82662e3fb6
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
      alert("Error al conectar con el servidor");
    }
  });

<<<<<<< HEAD
  // --- LOGIN ---
  formLoginForm.addEventListener('submit', async (e) => {
=======
  
  const formLoginForm = formLogin.querySelector('form');
  formLoginForm.addEventListener('submit', (e) => {
>>>>>>> 7cb9c0488d43d85d9a593ef3d882cb82662e3fb6
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
      alert("Error al conectar con el servidor");
    }
  });
<<<<<<< HEAD
=======
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
>>>>>>> 7cb9c0488d43d85d9a593ef3d882cb82662e3fb6
});