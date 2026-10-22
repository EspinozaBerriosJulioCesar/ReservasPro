const API = "http://localhost:8080/api/servicios";
const API_RESERVAS = "http://localhost:8080/api/reservas";

const form = document.getElementById("formServicio");
const nombreInput = document.getElementById("nombre");
const descripcionInput = document.getElementById("descripcion");
const precioInput = document.getElementById("precio");
const tabla = document.getElementById("tablaServicios");
const mensaje = document.getElementById("mensaje");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const btnActualizar = document.getElementById("btnActualizar");
const tituloFormulario = document.getElementById("tituloFormulario");

let servicios = [];
let idEnEdicion = null;

async function peticion(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            ...(opciones.body
                ? { "Content-Type": "application/json" }
                : {}),
            ...opciones.headers
        }
    });

    if (!respuesta.ok) {
        const detalle = await respuesta.text();
        throw new Error(detalle || `Error HTTP ${respuesta.status}`);
    }

    if (respuesta.status === 204) return null;
    return respuesta.json();
}

function mostrarMensaje(texto, tipo = "exito") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}

function celda(fila, valor) {
    const td = fila.insertCell();
    td.textContent = valor ?? "";
    return td;
}

async function obtenerCantidadReservas(servicioId) {
    const reservas = await peticion(API_RESERVAS);

    if (!Array.isArray(reservas)) {
        throw new Error("La API no devolvió una lista de reservas.");
    }

    return reservas.filter(reserva =>
        Number(reserva.servicio?.id) === Number(servicioId)
    ).length;
}

async function cargarServicios() {
    servicios = await peticion(API);
    await renderizarServicios();
}

async function renderizarServicios() {
    tabla.replaceChildren();

    if (servicios.length === 0) {
        const fila = tabla.insertRow();
        const td = fila.insertCell();
        td.colSpan = 6;
        td.textContent = "No hay servicios registrados.";
        return;
    }

    for (const servicio of servicios) {
        const fila = tabla.insertRow();

        celda(fila, servicio.id);
        celda(fila, servicio.nombre);
        celda(fila, servicio.descripcion);
        celda(fila, `S/ ${Number(servicio.precio).toFixed(2)}`);

        const tdReservas = fila.insertCell();
        const estado = document.createElement("span");
        estado.className = "estado-reservas";
        estado.textContent = "Consultando...";
        tdReservas.appendChild(estado);

        const tdAcciones = fila.insertCell();
        tdAcciones.className = "acciones";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => prepararEdicion(servicio));

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.textContent = "Eliminar";
        eliminar.className = "eliminar";
        eliminar.disabled = true;
        eliminar.addEventListener("click", () => eliminarServicio(servicio));

        tdAcciones.append(editar, eliminar);

        try {
            const cantidad = await obtenerCantidadReservas(servicio.id);

            if (cantidad > 0) {
                estado.textContent =
                    `${cantidad} reserva${cantidad === 1 ? "" : "s"}`;
                estado.classList.add("con-reservas");
                eliminar.disabled = true;
                eliminar.title = "El servicio tiene reservas asociadas.";
            } else {
                estado.textContent = "Sin reservas";
                estado.classList.add("sin-reservas");
                eliminar.disabled = false;
                eliminar.title = "Eliminar servicio";
            }
        } catch (error) {
            estado.textContent = "No verificado";
            estado.classList.add("error-reservas");
            eliminar.disabled = true;
            eliminar.title = "No se pudo comprobar si tiene reservas.";
        }
    }
}

function prepararEdicion(servicio) {
    idEnEdicion = servicio.id;

    nombreInput.value = servicio.nombre;
    descripcionInput.value = servicio.descripcion ?? "";
    precioInput.value = servicio.precio;

    tituloFormulario.textContent = `Editar servicio #${servicio.id}`;
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.hidden = false;

    mostrarMensaje(`Editando servicio ${servicio.nombre}`);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function limpiarFormulario() {
    idEnEdicion = null;
    form.reset();
    tituloFormulario.textContent = "Registrar servicio";
    btnGuardar.textContent = "Registrar servicio";
    btnCancelar.hidden = true;
}

form.addEventListener("submit", async evento => {
    evento.preventDefault();
    btnGuardar.disabled = true;

    const datos = {
        nombre: nombreInput.value.trim(),
        descripcion: descripcionInput.value.trim(),
        precio: Number(precioInput.value)
    };

    try {
        const editando = idEnEdicion !== null;

        await peticion(
            editando ? `${API}/${idEnEdicion}` : API,
            {
                method: editando ? "PUT" : "POST",
                body: JSON.stringify(datos)
            }
        );

        limpiarFormulario();
        mostrarMensaje(
            editando
                ? "Servicio actualizado correctamente."
                : "Servicio registrado correctamente."
        );

        await cargarServicios();
    } catch (error) {
        mostrarMensaje(
            `No se pudo guardar el servicio: ${error.message}`,
            "error"
        );
    } finally {
        btnGuardar.disabled = false;
    }
});

async function eliminarServicio(servicio) {
    if (!confirm(`¿Eliminar el servicio ${servicio.nombre}?`)) return;

    try {
        await peticion(`${API}/${servicio.id}`, { method: "DELETE" });
        mostrarMensaje("Servicio eliminado correctamente.");
        await cargarServicios();
    } catch (error) {
        const detalle = error.message || "";

        if (
            detalle.includes("reservas asociadas") ||
            detalle.includes("409") ||
            detalle.includes("Conflict")
        ) {
            mostrarMensaje(
                "No se puede eliminar este servicio porque tiene reservas asociadas.",
                "error"
            );
        } else {
            mostrarMensaje(
                `No se pudo eliminar el servicio: ${detalle}`,
                "error"
            );
        }

        await cargarServicios().catch(() => {});
    }
}

btnCancelar.addEventListener("click", () => {
    limpiarFormulario();
    mostrarMensaje("Edición cancelada.");
});

btnActualizar.addEventListener("click", async () => {
    btnActualizar.disabled = true;

    try {
        await cargarServicios();
        mostrarMensaje("Lista de servicios actualizada.");
    } catch (error) {
        mostrarMensaje(
            `No se pudo actualizar la lista: ${error.message}`,
            "error"
        );
    } finally {
        btnActualizar.disabled = false;
    }
});

async function inicializar() {
    try {
        await cargarServicios();
        mostrarMensaje("Servicios cargados correctamente.");
    } catch (error) {
        mostrarMensaje(
            `No se pudieron cargar los servicios. Comprueba Spring Boot. ${error.message}`,
            "error"
        );
    }
}

inicializar();