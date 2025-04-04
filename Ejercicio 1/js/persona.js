
let currentPage = 1;
const itemsPerPage = 10;
let personas = JSON.parse(localStorage.getItem("personas")) || [];
let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];

function verificarRegistrador() {
    let userRole = localStorage.getItem("userRole");
    if (userRole === "registrador") {
        alert("Acceso denegado. No tienes permiso para ver esta sección.");
        window.location.href = "login.html";
    }
}

function cargarPersonas() {

    verificarRegistrador();

    let editIndex = localStorage.getItem("editIndex")

    if (!editIndex) {
        localStorage.removeItem("editPersona");
        localStorage.removeItem("editIndex");
    }

    let personas = JSON.parse(localStorage.getItem("personas")) || [];

    let tbody = document.getElementById("personas-list");

    let filtro = document.getElementById("busqueda").value.toLowerCase();
    let opcionFiltro = document.getElementById("filtro-opcion").value;

    tbody.innerHTML = "";

    let userRole = localStorage.getItem("userRole");
    let esAdmin = userRole === "admin";
    let acciones = document.getElementById("acciones");
    if (!esAdmin && acciones) {
        acciones.remove();
    }


    let personasFiltradas = personas.filter(persona => {
        let valorCampo = persona[opcionFiltro];

        if (opcionFiltro === "estado" && filtro === "") {
            return true;
        }

        if (opcionFiltro === "oficinas") {
            let idOficina = persona.idOficina;
            console.log(`Comparando oficina de persona: ${idOficina}`);

            let oficinaEncontrada = oficinas.find(ofi => String(ofi.id) === String(idOficina));

            valorCampo = oficinaEncontrada ? oficinaEncontrada.nombre.toLowerCase() : "";
        }

        if (opcionFiltro === "estado") {
            return valorCampo && valorCampo.toLowerCase() === filtro;
        }

        return String(valorCampo).toLowerCase().includes(filtro);
    });


    let totalPages = Math.ceil(personasFiltradas.length / itemsPerPage);
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }

    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let personasPaginadas = personasFiltradas.slice(startIndex, endIndex);


    if (personasPaginadas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${esAdmin ? 10 : 9}" class='text-center'> No hay personas registradas. </td></tr>`;
    } else {
        personasPaginadas.forEach((persona, index) => {

            let oficina = oficinas.find(of => String(of.id) === String(persona.idOficina));
            let nombreOficina = oficina ? oficina.nombre : "No asignada";

            let fila = `<tr>
                    <td>${persona.id}</td>
                    <td>${persona.nombre}</td>
                    <td>${persona.email}</td>
                    <td>${persona.telefono}</td>
                    <td>${persona.cargo}</td>
                    <td>${persona.direccion}</td>
                    <td>${persona.fechaNacimiento}</td>
                    <td>${nombreOficina}</td>
                    <td>${persona.estado}</td>`;

            if (esAdmin) {
                fila += `<td>
                            <button onclick="editarPersona(${index})" class="btn btn-warning"> 
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button onclick="eliminarPersona(${index})" class="btn btn-danger"> 
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                         </td>`;
            }

            fila += `</tr>`;
            tbody.innerHTML += fila;
        });
    }

    actualizarPaginacion(totalPages);
}

function eliminarPersona(index) {
    let personas = JSON.parse(localStorage.getItem("personas")) || [];
    let registros = JSON.parse(localStorage.getItem("registros")) || [];

    let personaAEliminar = personas[index];

    let historialPersona = registros.filter(r => r.personaId === personaAEliminar.id);
    // Obtener el último registro de la persona
    let ultimoRegistro = historialPersona.length > 0 ? historialPersona[historialPersona.length - 1] : null;

    if (ultimoRegistro && ultimoRegistro.tipo === "Ingreso") {
        console.log("Tipo de alerta antes de mostrar:", "warning");
        mostrarAlerta("No se puede eliminar porque tiene un registro de entrada activo.", "warning");
        return;
    }

    let confirmacion = confirm("¿Estás seguro de eliminar a esta persona?");
    if(confirmacion) {
        personas.splice(index, 1);
        localStorage.setItem("personas", JSON.stringify(personas));
        cargarPersonas();

        setTimeout(() => {
            mostrarAlerta("Persona eliminada del registro.", "danger");
        }, 50);

    }
}

function editarPersona(index) {
    let personas = JSON.parse(localStorage.getItem("personas")) || [];

    if (personas[index]) {
        localStorage.setItem("editIndex", index);
        localStorage.setItem("editPersona", JSON.stringify(personas[index]));
        window.location.href = "form.html";
    }
}


document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.includes("form.html")) {
        let editPersona = JSON.parse(localStorage.getItem("editPersona"));
        let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
        let selectOficinas = document.getElementById("oficinas");

        if (!editPersona) return;

        document.getElementById("id").value = editPersona.id;
        document.getElementById("nombre").value = editPersona.nombre;
        document.getElementById("email").value = editPersona.email;
        document.getElementById("telefono").value = editPersona.telefono;
        document.getElementById("cargo").value = editPersona.cargo;
        document.getElementById("direccion").value = editPersona.direccion;
        document.getElementById("fechaNacimiento").value = editPersona.fechaNacimiento;
        document.getElementById("estado").value = editPersona.estado;

        selectOficinas.innerHTML = "";

        oficinas.forEach(oficina => {
            let opcion = document.createElement("option");
            opcion.value = String(oficina.id);
            opcion.textContent = oficina.nombre;
            selectOficinas.appendChild(opcion);
        });

        [...selectOficinas.options].forEach(opt => console.log(opt.value, opt.textContent));

        setTimeout(() => {
            let found = false;
            [...selectOficinas.options].forEach(option => {
                if (option.value === String(editPersona.idOficina)) {
                    option.selected = true;
                    found = true;
                }
            });
        },100);
    }
});

function guardarPersona(event) {
    event.preventDefault();

    let form = event.target;

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

    let id = document.getElementById("id").value;
    let nombre = document.getElementById("nombre").value;
    let email = document.getElementById("email").value;
    let telefono = document.getElementById("telefono").value;
    let cargo = document.getElementById("cargo").value;
    let direccion = document.getElementById("direccion").value;
    let fechaNacimiento = document.getElementById("fechaNacimiento").value;
    let idOficina = document.getElementById("oficinas").value;
    let estado = document.getElementById("estado").value;

    if (!id || !nombre || !email || !telefono || !cargo || !direccion || !fechaNacimiento || !idOficina || !estado) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    let idOficinaNum = Number(idOficina);
    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
    let personas = JSON.parse(localStorage.getItem("personas")) || [];

    let index = localStorage.getItem("editIndex");

    let personaEditada = index !== null ? personas[Number(index)] : null;
    let idPersonaEditada = personaEditada ? personaEditada.id : null;

    let oficinaSeleccionada = oficinas.find(o => Number(o.id) === idOficinaNum);

    let personasEnOficina = personas.filter(p =>
        Number(p.idOficina) === idOficinaNum && p.id !== idPersonaEditada
    ).length;

    if (oficinaSeleccionada && personasEnOficina >= oficinaSeleccionada.capacidad) {
        mostrarAlerta("Se llegó a la capacidad máxima de personas permitida. Intente con otra oficina.", "warning");
        return;
    }

    let persona = { id, nombre, email, telefono, cargo, direccion, fechaNacimiento, idOficina: idOficinaNum, estado };

    if (index !== null) {
        index = Number(index);
        personas[index] = persona;
        localStorage.removeItem("editIndex");
    } else {
        personas.push(persona);
    }

    localStorage.setItem("personas", JSON.stringify(personas));

    mostrarAlerta("¡Persona guardada con éxito!");
}

function mostrarOficinas() {

    let selectOficinas = document.getElementById("oficinas");

    if (!selectOficinas) {
        console.error("No se encontró el select con ID 'oficinas'");
        return;
    }

    let oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];
    selectOficinas.innerHTML = "";

    if (oficinas.length === 0) {
        let option = document.createElement("option");
        option.textContent = "No hay oficinas registradas.";
        option.disabled = true;
        selectOficinas.appendChild(option);
    } else {

        oficinas.forEach(oficina => {
            let option = document.createElement("option");
            option.value = oficina.id;
            option.textContent = oficina.nombre;
            selectOficinas.appendChild(option);

        });
    }
}

document.addEventListener("DOMContentLoaded", mostrarOficinas);

function mostrarAlerta(mensaje, tipo = "success") {
    let alertaExito = document.getElementById("alerta-exito");
    let alertaBorrar = document.getElementById("alerta-borrar");
    let alertaWarning = document.getElementById("alerta-warning");

    let alerta = tipo === "success"
        ? alertaExito
        : tipo === "warning"
            ? alertaWarning
            : alertaBorrar;

    console.log("Alerta seleccionada:", alerta);

    if (!alerta) return;

    if (alerta.timeoutID) {
        clearTimeout(alerta.timeoutID);
    }

    alerta.classList.remove("d-none", "fade", "show");
    alerta.innerHTML = `
        ${mensaje}
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

    alerta.querySelector(".btn-close").addEventListener("click", () => {
        clearTimeout(alerta.timeoutID);
        alerta.classList.remove("show");
        setTimeout(() => {
            alerta.classList.add("d-none");
        }, 500);
    }, { once: true });
}

function actualizarPaginacion(totalPages) {
    let pageInfo = document.getElementById("pageInfo");
    let prevButton = document.getElementById("prevPage");
    let nextButton = document.getElementById("nextPage");

    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;

    prevButton.onclick = function () {
        if (currentPage > 1) {
            currentPage--;
            cargarPersonas();
        }
    };

    nextButton.onclick = function () {
        if (currentPage < totalPages) {
            currentPage++;
            cargarPersonas();
        }
    };
}

function exportarPDF() {
    const personas = JSON.parse(localStorage.getItem("personas")) || [];
    const oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];

    if (personas.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text("Lista de Personas", 14, 15);


    const rows = personas.map(p => {
        const oficina = oficinas.find(o => String(o.id) === String(p.idOficina)); // Asegurar coincidencia como string
        return [
            p.id,
            p.nombre,
            p.email,
            p.telefono,
            p.cargo,
            p.direccion,
            p.fechaNacimiento,
            oficina ? oficina.nombre : "Sin asignar",
            p.estado
        ];
    });


    doc.autoTable({
        head: [["Id", "Nombre", "Correo", "Teléfono", "Cargo", "Dirección", "Fecha de Nacimiento", "Oficina", "Estado"]],
        body: rows,
        startY: 20
    });


    doc.save("personas.pdf");
}


function exportarExcel() {
    const personas = JSON.parse(localStorage.getItem("personas")) || [];
    const oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];

    if (personas.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }


    const datos = personas.map(p => {
        const oficina = oficinas.find(o => String(o.id) === String(p.idOficina)); // Asegurar coincidencia como string
        return {
            Id: p.id,
            Nombre: p.nombre,
            Correo: p.email,
            Teléfono: p.telefono,
            Cargo: p.cargo,
            Dirección: p.direccion,
            "Fecha de Nacimiento": p.fechaNacimiento,
            Oficina: oficina ? oficina.nombre : "Sin asignar",
            Estado: p.estado
        };
    });

    const wb = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, hoja, "Personas");
    XLSX.writeFile(wb, "personas.xlsx");
}


document.addEventListener("DOMContentLoaded", function() {
    cargarPersonas();
    localStorage.removeItem("editIndex");
    document.getElementById("busqueda").addEventListener("input", cargarPersonas);
    document.getElementById("filtro-opcion").addEventListener("change", cargarPersonas);
});