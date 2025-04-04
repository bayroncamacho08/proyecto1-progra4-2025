function cargarNavbar() {
    let navbarMenu = document.getElementById("navbarMenu");
    let role = localStorage.getItem("userRole");
    navbarMenu.innerHTML = "";

    if (role === "admin") {
        navbarMenu.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Personas
        </a>
        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
          <li><a class="dropdown-item" href="index.html">Lista de Personas</a></li>
          <li><a class="dropdown-item" href="form.html">Registro de Personas</a></li>
        </ul>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Oficinas
        </a>
        <ul class="dropdown-menu" aria-labelledby="navbarDropdown2">
          <li><a class="dropdown-item" href="listaOficina.html">Lista de Oficinas</a></li>
          <li><a class="dropdown-item" href="formOficina.html">Registro de Oficinas</a></li>
        </ul>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Registros
        </a>
        <ul class="dropdown-menu" aria-labelledby="navbarDropdown3">
          <li><a class="dropdown-item" href="registroTiempo.html">Registro de Entradas y Salidas</a></li>
          <li><a class="dropdown-item" href="estadisticas.html">Estadísticas</a></li>
        </ul>
      </li>
    `;
    } else if (role === "ver") {
        navbarMenu.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="index.html">Lista de Personas</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="listaOficina.html">Lista de Oficinas</a>
      </li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown3" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Registros
        </a>
        <ul class="dropdown-menu" aria-labelledby="navbarDropdown3">
          <li><a class="dropdown-item" href="registroTiempo.html">Lista de los Registros</a></li>
          <li><a class="dropdown-item" href="estadisticas.html">Estadísticas</a></li>
        </ul>
      </li>
    `;
    } else if (role === "registrador") {
        navbarMenu.innerHTML = `
      <li class="nav-item">
        <a class="nav-link disabled" tabindex = "-1" aria-disabled="true">Registro de Entradas y Salidas</a>
      </li>
    `;
    }
}

document.addEventListener("DOMContentLoaded", cargarNavbar);