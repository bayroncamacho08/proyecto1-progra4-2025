let registros = JSON.parse(localStorage.getItem("registros")) || [];
let currentPage = 1;
const itemsPerPage = 10;

function guardarRegistro(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add("was-validated");
        return;
    }

    const personaId = document.getElementById("persona").value;
    const tipo = document.getElementById("tipo").value;
    const fechaHora = document.getElementById("fechaHora").value;

    const personas = JSON.parse(localStorage.getItem("personas")) || [];
    const oficinas = JSON.parse(localStorage.getItem("oficinas")) || [];

    const persona = personas.find(p => p.id === personaId);
    if (!persona) return mostrarAlerta("Persona no encontrada.", "danger");

    const oficina = oficinas.find(o => String(o.id) === String(persona.idOficina));
    if (!oficina) return mostrarAlerta("Oficina no asignada o no encontrada.", "danger");

    const historialPersona = registros.filter(r => r.personaId === personaId);
    const ultimoRegistro = historialPersona[historialPersona.length - 1];

    const editIndex = localStorage.getItem("editRegistroIndex");

    if (tipo === "Ingreso") {
        if (editIndex === null && ultimoRegistro && ultimoRegistro.tipo === "Ingreso") {
            return mostrarAlerta("La persona ya tiene un ingreso registrado. Primero debe registrar una salida.", "warning");
        }

        const registrosOficina = registros.filter(r => {
            const p = personas.find(per => per.id === r.personaId);
            return p && String(p.idOficina) === String(oficina.id);
        });

        const personasDentro = {};
        for (const r of registrosOficina) {
            if (!personasDentro[r.personaId]) personasDentro[r.personaId] = [];
            personasDentro[r.personaId].push(r.tipo);
        }

        let cantidadActual = 0;
        for (const movimientos of Object.values(personasDentro)) {
            let estado = 0;
            for (const tipo of movimientos) {
                if (tipo === "Ingreso") estado++;
                else if (tipo === "Salida") estado = Math.max(estado - 1, 0);
            }
            if (estado > 0) cantidadActual++;
        }

        if (editIndex === null && parseInt(oficina.capacidad) && cantidadActual >= parseInt(oficina.capacidad)) {
            return mostrarAlerta("La oficina ya alcanzó su capacidad máxima.", "warning");
        }
    }

    if (tipo === "Salida") {
        if (editIndex === null && (!historialPersona.length || ultimoRegistro.tipo !== "Ingreso")) {
            return mostrarAlerta("No se puede registrar una salida sin un ingreso previo.", "warning");
        }

        const fechaEntrada = new Date(ultimoRegistro?.fechaHora);
        const fechaSalida = new Date(fechaHora);
        if (fechaSalida <= fechaEntrada) {
            return mostrarAlerta("La fecha de salida debe ser posterior a la fecha de ingreso.", "warning");
        }
    }

    const nuevoRegistro = { personaId, tipo, fechaHora };

    if (editIndex !== null) {
        registros[editIndex] = nuevoRegistro;
        localStorage.setItem("registroAccion", "editado");
        localStorage.removeItem("editRegistroIndex");
    } else {
        registros.push(nuevoRegistro);
        localStorage.setItem("registroAccion", "creado");
    }

    localStorage.setItem("registros", JSON.stringify(registros));
    form.reset();
    cargarRegistros();
    mostrarAlerta("¡Registro guardado con éxito!");
}

function cargarOpcionesPersonas() {
    const personas = JSON.parse(localStorage.getItem("personas")) || [];
    const select = document.getElementById("persona");
    select.innerHTML = "";

    const activas = personas.filter(p => p.estado === "Activo");

    if (activas.length === 0) {
        let option = document.createElement("option");
        option.textContent = "No hay personas activas";
        option.disabled = true;
        select.appendChild(option);
        return;
    }

    activas.forEach(p => {
        let option = document.createElement("option");
        option.value = p.id;
        option.textContent = `${p.nombre} (${p.id})`;
        select.appendChild(option);
    });
}

function cargarRegistros() {
    const personas = JSON.parse(localStorage.getItem("personas")) || [];
    const tabla = document.getElementById("tabla-registros");
    tabla.innerHTML = "";

    let role = localStorage.getItem("userRole");
    const mostrarAcciones = (role !== "ver");

    const headerAcciones = document.getElementById("acciones-columna");
    if (headerAcciones) {
        headerAcciones.style.display = mostrarAcciones ? "table-cell" : "none";
    }

    let totalPages = Math.ceil(registros.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * itemsPerPage;
    const paginados = registros.slice(start, start + itemsPerPage);

    if (paginados.length === 0) {
        tabla.innerHTML = `<tr><td colspan="${mostrarAcciones ? 4 : 3}" class="text-center">No hay registros disponibles.</td></tr>`;
    } else {
        paginados.forEach((r, index) => {
            const persona = personas.find(p => p.id === r.personaId) || { nombre: "Desconocido" };

            let fila = `<tr>
                    <td>${persona.nombre}</td>
                    <td>${r.tipo}</td>
                    <td>${r.fechaHora}</td>`;

            if (mostrarAcciones) {
                fila += `<td>
                    <button onclick="editarRegistro(${start + index})" class="btn btn-warning">
                      <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button onclick="eliminarRegistro(${start + index})" class="btn btn-danger">
                      <i class="bi bi-trash"></i> Eliminar
                    </button>
                  </td>`;
            }

            fila += `</tr>`;
            tabla.innerHTML += fila;
        });
    }

    actualizarPaginacion(totalPages);
}

function actualizarPaginacion(totalPages) {
    document.getElementById("pageInfo").textContent = `Página ${currentPage} de ${totalPages || 1}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages || totalPages === 0;
}

function cambiarPagina(delta) {
    currentPage += delta;
    cargarRegistros();
}

function editarRegistro(index) {
    const registro = registros[index];
    document.getElementById("persona").value = registro.personaId;
    document.getElementById("tipo").value = registro.tipo;
    document.getElementById("fechaHora").value = registro.fechaHora;
    localStorage.setItem("editRegistroIndex", index);
}

function eliminarRegistro(index) {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
        registros.splice(index, 1);
        localStorage.setItem("registros", JSON.stringify(registros));
        mostrarAlerta("Registro eliminado correctamente", "danger");
        cargarRegistros();
    }
}

function exportarPDF() {
    const personas = JSON.parse(localStorage.getItem("personas")) || [];
    const doc = new jspdf.jsPDF();
    doc.setFontSize(12);
    doc.text("Registros de Entradas y Salidas", 14, 15);

    const rows = registros.map(r => {
        const persona = personas.find(p => p.id === r.personaId);
        return [persona ? persona.nombre : "Desconocido", r.tipo, r.fechaHora];
    });

    doc.autoTable({
        head: [["Nombre", "Tipo", "Fecha y Hora"]],
        body: rows,
        startY: 20
    });

    doc.save("registros.pdf");
}

function exportarExcel() {
    const personas = JSON.parse(localStorage.getItem("personas")) || [];
    const wb = XLSX.utils.book_new();

    const datos = registros.map(r => {
        const persona = personas.find(p => p.id === r.personaId);
        return {
            Nombre: persona ? persona.nombre : "Desconocido",
            Tipo: r.tipo,
            FechaHora: r.fechaHora
        };
    });

    const hoja = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, hoja, "Registros");
    XLSX.writeFile(wb, "registros.xlsx");
}

function mostrarAlerta(mensaje, tipo = "success") {
    const alertaExito = document.getElementById("alerta-exito");
    const alertaDanger = document.getElementById("alerta-danger");
    const alertaWarning = document.getElementById("alerta-warning");

    let alerta = tipo === "success" ? alertaExito : tipo === "danger" ? alertaDanger : alertaWarning;

    if (!alerta) return;

    alerta.classList.remove("d-none", "fade", "show");
    alerta.querySelector("span").textContent = mensaje;

    setTimeout(() => {
        alerta.classList.add("show", "fade");
    }, 10);

    setTimeout(() => {
        alerta.classList.remove("show");
        setTimeout(() => {
            alerta.classList.add("d-none");
        }, 500);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    cargarOpcionesPersonas();
    cargarRegistros();

    document.getElementById("prevPage").addEventListener("click", () => cambiarPagina(-1));
    document.getElementById("nextPage").addEventListener("click", () => cambiarPagina(1));

    const role = localStorage.getItem("userRole");
    const form = document.querySelector("form.needs-validation");
    if (role !== "admin" && role !== "registrador") {
        form.style.display = "none";
    }
});
