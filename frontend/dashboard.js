const API_RESERVAS = "http://localhost:8080/api/reservas";
const API_CLIENTES = "http://localhost:8080/api/clientes";
const API_SERVICIOS = "http://localhost:8080/api/servicios";

async function consultarLista(url) {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista.");
    }

    return datos;
}

function actualizarIndicador(id, cantidad, detalleId, detalle) {
    document.getElementById(id).textContent = cantidad;
    document.getElementById(detalleId).textContent = detalle;
}

function obtenerFechaReserva(reserva) {
    const posiblesCampos = [
        reserva.fechaReserva,
        reserva.fecha,
        reserva.fechaHora,
        reserva.fechaInicio
    ];

    for (const valor of posiblesCampos) {
        if (!valor) continue;

        const fecha = new Date(valor);

        if (!Number.isNaN(fecha.getTime())) {
            return fecha;
        }
    }

    return null;
}

async function cargarActividad() {
    const estado = document.getElementById("estadoActividad");

    const resultados = await Promise.allSettled([
        consultarLista(API_RESERVAS),
        consultarLista(API_CLIENTES),
        consultarLista(API_SERVICIOS)
    ]);

    let errores = 0;

    
    if (resultados[0].status === "fulfilled") {
        const reservas = resultados[0].value;

        actualizarIndicador(
            "totalReservas",
            reservas.length,
            "detalleReservas",
            "Reservas en el sistema"
        );

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const proximas = reservas.filter(reserva => {
            const fecha = obtenerFechaReserva(reserva);
            return fecha && fecha >= hoy;
        }).length;

        actualizarIndicador(
            "totalProximas",
            proximas,
            "detalleProximas",
            "Reservas desde hoy en adelante"
        );
    } else {
        errores++;

        actualizarIndicador(
            "totalReservas",
            "—",
            "detalleReservas",
            "No se pudieron consultar las reservas"
        );

        actualizarIndicador(
            "totalProximas",
            "—",
            "detalleProximas",
            "No se pudo consultar la información"
        );
    }

    
    if (resultados[1].status === "fulfilled") {
        actualizarIndicador(
            "totalClientes",
            resultados[1].value.length,
            "detalleClientes",
            "Clientes en el sistema"
        );
    } else {
        errores++;

        actualizarIndicador(
            "totalClientes",
            "—",
            "detalleClientes",
            "No se pudieron consultar los clientes"
        );
    }

    
    if (resultados[2].status === "fulfilled") {
        actualizarIndicador(
            "totalServicios",
            resultados[2].value.length,
            "detalleServicios",
            "Servicios en el catálogo"
        );
    } else {
        errores++;

        actualizarIndicador(
            "totalServicios",
            "—",
            "detalleServicios",
            "No se pudieron consultar los servicios"
        );
    }

    estado.textContent = errores === 0
        ? "Datos actualizados"
        : "Información parcial";

    estado.title = errores === 0
        ? "Todas las consultas finalizaron correctamente."
        : "Una o más consultas no pudieron completarse.";
}

document.addEventListener("DOMContentLoaded", cargarActividad);