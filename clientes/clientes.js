const API = "http://localhost:8080/api/clientes";

const form = document.getElementById("formCliente");
const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");
const telefonoInput = document.getElementById("telefono");
const tabla = document.getElementById("tablaClientes");
const mensaje = document.getElementById("mensaje");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const btnActualizar = document.getElementById("btnActualizar");
const tituloFormulario = document.getElementById("tituloFormulario");

let clientes = [];
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

        throw new Error(
            detalle || `Error HTTP ${respuesta.status}`
        );
    }

    if (respuesta.status === 204) {
        return null;
    }

    return respuesta.json();
}

function mostrarMensaje(texto, tipo = "exito") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}

function crearCelda(fila, valor) {
    const celda = fila.insertCell();
    celda.textContent = valor ?? "";
    return celda;
}

async function obtenerCantidadReservas(clienteId) {
    return peticion(`${API}/${clienteId}/reservas-count`);
}

async function renderizarClientes() {
    tabla.replaceChildren();

    if (clientes.length === 0) {
        const fila = tabla.insertRow();
        const celda = fila.insertCell();

        celda.colSpan = 6;
        celda.textContent = "No hay clientes registrados.";
        return;
    }

    for (const cliente of clientes) {
        const fila = tabla.insertRow();

        crearCelda(fila, cliente.id);
        crearCelda(fila, cliente.nombre);
        crearCelda(fila, cliente.correo);
        crearCelda(fila, cliente.telefono);

        const celdaReservas = fila.insertCell();
        const estado = document.createElement("span");

        estado.className = "estado-reservas";
        estado.textContent = "Consultando...";
        celdaReservas.appendChild(estado);

        const celdaAcciones = fila.insertCell();
        celdaAcciones.className = "acciones";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => {
            prepararEdicion(cliente);
        });

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.textContent = "Eliminar";
        eliminar.className = "eliminar";
        eliminar.disabled = true;

        eliminar.addEventListener("click", () => {
            eliminarCliente(cliente);
        });

        celdaAcciones.append(editar, eliminar);

        try {
            const cantidad = await obtenerCantidadReservas(cliente.id);

            if (cantidad > 0) {
                estado.textContent =
                    `${cantidad} reserva${cantidad === 1 ? "" : "s"}`;

                estado.classList.add("con-reservas");
                eliminar.disabled = true;
                eliminar.title =
                    "No se puede eliminar: el cliente tiene reservas.";
            } else {
                estado.textContent = "Sin reservas";
                estado.classList.add("sin-reservas");
                eliminar.disabled = false;
                eliminar.title = "Eliminar cliente";
            }
        } catch (error) {
            estado.textContent = "No verificado";
            estado.classList.add("error-reservas");
            eliminar.disabled = true;
            eliminar.title =
                "No se puede eliminar hasta verificar sus reservas.";
        }
    }
}

async function cargarClientes() {
    clientes = await peticion(API);
    await renderizarClientes();
}

function prepararEdicion(cliente) {
    idEnEdicion = cliente.id;

    nombreInput.value = cliente.nombre;
    correoInput.value = cliente.correo;
    telefonoInput.value = cliente.telefono;

    tituloFormulario.textContent = `Editar cliente #${cliente.id}`;
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.hidden = false;

    mostrarMensaje(`Editando cliente ${cliente.nombre}`);
    form.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function limpiarFormulario() {
    idEnEdicion = null;
    form.reset();

    tituloFormulario.textContent = "Registrar cliente";
    btnGuardar.textContent = "Registrar cliente";
    btnCancelar.hidden = true;
}

form.addEventListener("submit", async evento => {
    evento.preventDefault();
    btnGuardar.disabled = true;

    const datos = {
        nombre: nombreInput.value.trim(),
        correo: correoInput.value.trim(),
        telefono: telefonoInput.value.trim()
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
                ? "Cliente actualizado correctamente."
                : "Cliente registrado correctamente."
        );

        await cargarClientes();
    } catch (error) {
        mostrarMensaje(
            `No se pudo guardar el cliente: ${error.message}`,
            "error"
        );
    } finally {
        btnGuardar.disabled = false;
    }
});

async function eliminarCliente(cliente) {
    if (!confirm(
        `¿Seguro que deseas eliminar al cliente ${cliente.nombre}?`
    )) {
        return;
    }

    try {
        await peticion(`${API}/${cliente.id}`, {
            method: "DELETE"
        });

        if (idEnEdicion === cliente.id) {
            limpiarFormulario();
        }

        mostrarMensaje("Cliente eliminado correctamente.");
        await cargarClientes();
    } catch (error) {
        const detalle = error.message || "";

        if (
            detalle.includes("reservas asociadas") ||
            detalle.includes("409") ||
            detalle.includes("Conflict")
        ) {
            mostrarMensaje(
                "No se puede eliminar este cliente porque tiene reservas asociadas. El cliente y sus reservas se conservarán.",
                "error"
            );
        } else if (
            detalle.includes("404") ||
            detalle.includes("Not Found")
        ) {
            mostrarMensaje(
                "El cliente no existe o ya fue eliminado.",
                "error"
            );
        } else {
            mostrarMensaje(
                "No se pudo eliminar el cliente. Comprueba que el servidor esté funcionando.",
                "error"
            );
        }

        await cargarClientes().catch(() => {});
    }
}

btnCancelar.addEventListener("click", () => {
    limpiarFormulario();
    mostrarMensaje("Edición cancelada.");
});

btnActualizar.addEventListener("click", async () => {
    btnActualizar.disabled = true;

    try {
        await cargarClientes();
        mostrarMensaje("Lista de clientes actualizada.");
    } catch (error) {
        mostrarMensaje(
            `No se pudo cargar la lista: ${error.message}`,
            "error"
        );
    } finally {
        btnActualizar.disabled = false;
    }
});

async function inicializar() {
    try {
        await cargarClientes();
        mostrarMensaje("Clientes cargados correctamente.");
    } catch (error) {
        mostrarMensaje(
            `No se pudieron cargar los clientes. Comprueba que Spring Boot esté activo. ${error.message}`,
            "error"
        );
    }
}

inicializar();