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