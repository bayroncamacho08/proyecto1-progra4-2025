let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];

function verificarRegistrador() {
    let userRole = localStorage.getItem("userRole");
    if (userRole === "registrador") {
        alert("Acceso denegado. No tienes permiso para ver esta sección.");
        window.location.href = "login.html";
    }
}

function cargarOficinas() {
    verificarRegistrador();

    let userRole = localStorage.getItem("userRole");
    let tbody = document.getElementById("oficinas-list");

    let filtro = document.getElementById("busqueda").value.toLowerCase();
    let opcionFiltro = document.getElementById("filtro-opcion").value;

    tbody.innerHTML = "";

    let esAdmin = userRole === "admin";

    let acciones = document.getElementById("acciones");
    if (!esAdmin && acciones) {
        acciones.remove();
    }

    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];

    let oficinasFiltradas = oficinas.filter(oficina => {
        let valorCampo = oficina[opcionFiltro];
        if (valorCampo) {
            return String(valorCampo).toLowerCase().includes(filtro);
        }
        return false;
    });

    if (oficinasFiltradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${esAdmin ? 4 : 3}" class='text-center'> No hay oficinas registradas. </td></tr>`;
    } else {
        oficinasFiltradas.forEach((oficina) => {
            let fila = `<tr>
                <td class="px-4">${oficina.nombre}</td>
                <td class="px-4">
                    <iframe 
                        width="200" 
                        height="150" 
                        style="border:0; border-radius: 10px;"
                        loading="lazy"
                        allowfullscreen
                        referrerpolicy="no-referrer-when-downgrade"
                        src="https://www.google.com/maps?q=${oficina.ubicacion}&output=embed">
                    </iframe>
                </td>
                <td class="px-4">${oficina.capacidad}</td>`;

            if (esAdmin) {
                fila += `<td>
                    <button onclick="editarOficina(${oficina.id})" class="btn btn-warning">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button onclick="eliminarOficinaPorId(${oficina.id})" class="btn btn-danger">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>`;
            }

            fila += `</tr>`;
            tbody.innerHTML += fila;
        });
    }
}

function eliminarOficinaPorId(id) {
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
    let personas = JSON.parse(localStorage.getItem("personas")) || [];

    let index = oficinas.findIndex(o => o.id === id);
    if (index === -1) return;

    let oficinaAEliminar = oficinas[index];
    let tienePersonasAsignadas = personas.some(persona => persona.idOficina === oficinaAEliminar.id);

    if (tienePersonasAsignadas) {
        mostrarAlerta("No se puede eliminar esta oficina porque hay personas asignadas a ella.", "warning");
        return;
    }

    let confirmacion = confirm(`¿Estás seguro de que deseas eliminar la oficina "${oficinaAEliminar.nombre}"?`);
    if (confirmacion) {
        oficinas.splice(index, 1);
        localStorage.setItem("oficinas", JSON.stringify(oficinas));
        cargarOficinas();

        setTimeout(() => {
            mostrarAlerta(`Oficina "${oficinaAEliminar.nombre}" eliminada correctamente.`, "danger");
        }, 50);
    }
}

function editarOficina(id) {
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
    let oficina = oficinas.find(o => o.id === id);

    if (oficina) {
        localStorage.setItem("editOficina", JSON.stringify(oficina));
        window.location.href = "formOficina.html";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.includes("formOficina.html")) {
        let editOficina = JSON.parse(localStorage.getItem("editOficina"));
        if (!editOficina) return;

        document.getElementById("nombre").value = editOficina.nombre;
        document.getElementById("ubicacion").value = editOficina.ubicacion;
        document.getElementById("capacidad").value = editOficina.capacidad;
    }
});

function guardarOficina(event) {
    event.preventDefault();
    let form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

    let nombre = document.getElementById("nombre").value;
    let ubicacion = document.getElementById("ubicacion").value;
    let capacidad = parseInt(document.getElementById("capacidad").value, 10);

    if (!nombre || !ubicacion || !capacidad) {
        mostrarAlerta("Todos los campos son obligatorios", "danger");
        return;
    }

    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
    let editOficina = JSON.parse(localStorage.getItem("editOficina"));
    let personas = JSON.parse(localStorage.getItem("personas")) || [];

    if (editOficina) {
        let index = oficinas.findIndex(o => o.id === editOficina.id);
        if (index !== -1) {
            let oficinaActual = oficinas[index];
            let personasEnOficina = personas.filter(p => p.idOficina === oficinaActual.id).length;

            if (capacidad < personasEnOficina) {
                mostrarAlerta("La capacidad máxima es menor a la cantidad actual de personas ingresadas. Intente con un número mayor.", "warning");
                return;
            }

            oficinas[index] = { ...oficinaActual, nombre, ubicacion, capacidad };
        }

        localStorage.removeItem("editOficina");
    } else {
        let nuevaOficina = {
            id: Date.now(),
            nombre: nombre,
            ubicacion: ubicacion,
            capacidad: capacidad
        };
        oficinas.push(nuevaOficina);
    }

    localStorage.setItem("oficinas", JSON.stringify(oficinas));
    mostrarAlerta("¡Oficina guardada con éxito!", "success");
}

function mostrarAlerta(mensajeO, tipoA = "success") {
    let alertaExito = document.getElementById("alerta-exito");
    let alertaDanger = document.getElementById("alerta-danger");
    let alertaWarning = document.getElementById("alerta-warning");

    let alerta = tipoA === "success"
        ? alertaExito
        : tipoA === "warning"
            ? alertaWarning
            : alertaDanger;

    if (!alerta) {
        console.error("No se encontró la alerta en el HTML.");
        return;
    }

    alerta.classList.remove("d-none", "fade", "show");
    alerta.innerHTML = `
        ${mensajeO}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    setTimeout(() => {
        alerta.classList.add("show", "fade");
    }, 10);

    alerta.timeoutID = setTimeout(() => {
        alerta.classList.remove("show");
        setTimeout(() => {
            alerta.classList.add("d-none");
        }, 500);
    }, 3000);
}
