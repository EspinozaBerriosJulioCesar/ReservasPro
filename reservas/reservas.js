const API = "http://localhost:8080/api";

const form = document.getElementById("formReserva");
const clienteSelect = document.getElementById("clienteId");
const servicioSelect = document.getElementById("servicioId");
const fechaInput = document.getElementById("fechaReserva");
const estadoSelect = document.getElementById("estado");
const tabla = document.getElementById("tablaReservas");
const mensaje = document.getElementById("mensaje");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelarEdicion");

let reservas = [];
let idEnEdicion = null;

async function peticion(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            ...(opciones.body ? { "Content-Type": "application/json" } : {}),
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

async function cargarClientes() {
    const clientes = await peticion(`${API}/clientes`);

    clienteSelect.replaceChildren(
        new Option("Selecciona un cliente", "")
    );

    clientes.forEach(cliente => {
        clienteSelect.add(new Option(
            `${cliente.nombre} (${cliente.correo})`,
            cliente.id
        ));
    });
}

async function cargarServicios() {
    const servicios = await peticion(`${API}/servicios`);

    servicioSelect.replaceChildren(
        new Option("Selecciona un servicio", "")
    );

    servicios.forEach(servicio => {
        servicioSelect.add(new Option(
            `${servicio.nombre} - S/ ${Number(servicio.precio).toFixed(2)}`,
            servicio.id
        ));
    });
}

function renderizarReservas() {
    tabla.replaceChildren();

    if (reservas.length === 0) {
        const fila = tabla.insertRow();
        const celda = fila.insertCell();
        celda.colSpan = 6;
        celda.textContent = "No hay reservas registradas.";
        return;
    }

    reservas.forEach(reserva => {
        const fila = tabla.insertRow();

        [
            reserva.id,
            reserva.cliente?.nombre ?? "Sin cliente",
            reserva.servicio?.nombre ?? "Sin servicio",
            String(reserva.fechaReserva ?? "").replace("T", " "),
            reserva.estado
        ].forEach(valor => {
            fila.insertCell().textContent = valor ?? "";
        });

        const acciones = fila.insertCell();
        acciones.className = "acciones";

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.addEventListener("click", () => prepararEdicion(reserva));

        const eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";
        eliminar.className = "eliminar";
        eliminar.addEventListener("click", () => eliminarReserva(reserva.id));

        acciones.append(editar, eliminar);
    });
}

async function cargarReservas() {
    reservas = await peticion(`${API}/reservas`);
    renderizarReservas();
}

function prepararEdicion(reserva) {
    idEnEdicion = reserva.id;

    clienteSelect.value = String(reserva.cliente.id);
    servicioSelect.value = String(reserva.servicio.id);
    fechaInput.value = reserva.fechaReserva.slice(0, 16);
    estadoSelect.value = reserva.estado;

    document.getElementById("tituloFormulario").textContent =
        `Editar reserva #${reserva.id}`;

    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.hidden = false;

    mostrarMensaje(`Editando reserva ${reserva.id}`);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function limpiarFormulario() {
    idEnEdicion = null;
    form.reset();

    document.getElementById("tituloFormulario").textContent =
        "Registrar una reserva";

    btnGuardar.textContent = "Registrar reserva";
    btnCancelar.hidden = true;
}

form.addEventListener("submit", async evento => {
    evento.preventDefault();
    btnGuardar.disabled = true;

    const datos = {
        clienteId: Number(clienteSelect.value),
        servicioId: Number(servicioSelect.value),
        fechaReserva: fechaInput.value,
        estado: estadoSelect.value
    };

    try {
        const editando = idEnEdicion !== null;

        await peticion(
            editando
                ? `${API}/reservas/${idEnEdicion}`
                : `${API}/reservas`,
            {
                method: editando ? "PUT" : "POST",
                body: JSON.stringify(datos)
            }
        );

        limpiarFormulario();

        mostrarMensaje(
            editando
                ? "Reserva actualizada correctamente."
                : "Reserva registrada correctamente."
        );

        await cargarReservas();
    } catch (error) {
        mostrarMensaje(`No se pudo guardar: ${error.message}`, "error");
    } finally {
        btnGuardar.disabled = false;
    }
});

async function eliminarReserva(id) {
    if (!confirm(`¿Seguro que deseas eliminar la reserva ${id}?`)) {
        return;
    }

    try {
        await peticion(`${API}/reservas/${id}`, {
            method: "DELETE"
        });

        if (idEnEdicion === id) limpiarFormulario();

        mostrarMensaje("Reserva eliminada correctamente.");
        await cargarReservas();
    } catch (error) {
        mostrarMensaje(`No se pudo eliminar: ${error.message}`, "error");
    }
}

btnCancelar.addEventListener("click", () => {
    limpiarFormulario();
    mostrarMensaje("Edición cancelada.");
});

document.getElementById("btnActualizar").addEventListener("click", inicializar);

async function inicializar() {
    try {
        await Promise.all([
            cargarClientes(),
            cargarServicios()
        ]);

        await cargarReservas();
        mostrarMensaje("Datos cargados correctamente.");
    } catch (error) {
        mostrarMensaje(
            `No se pudieron cargar los datos. Comprueba que Spring Boot esté activo. ${error.message}`,
            "error"
        );
    }
}

inicializar();