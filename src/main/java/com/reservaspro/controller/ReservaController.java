package com.reservaspro.controller;

import com.reservaspro.dto.ReservaRequest;
import com.reservaspro.model.Cliente;
import com.reservaspro.model.Reserva;
import com.reservaspro.model.Servicio;
import com.reservaspro.repository.ClienteRepository;
import com.reservaspro.repository.ReservaRepository;
import com.reservaspro.repository.ServicioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final ServicioRepository servicioRepository;

    public ReservaController(
            ReservaRepository reservaRepository,
            ClienteRepository clienteRepository,
            ServicioRepository servicioRepository) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.servicioRepository = servicioRepository;
    }

    // REGISTRAR UNA RESERVA
    @PostMapping
    public ResponseEntity<?> registrarReserva(
            @Valid @RequestBody ReservaRequest solicitud) {

        Cliente cliente = clienteRepository.findById(solicitud.getClienteId())
                .orElse(null);

        if (cliente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe el cliente indicado");
        }

        Servicio servicio = servicioRepository.findById(solicitud.getServicioId())
                .orElse(null);

        if (servicio == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe el servicio indicado");
        }

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setServicio(servicio);
        reserva.setFechaReserva(solicitud.getFechaReserva());

        String estado = solicitud.getEstado();
        reserva.setEstado(
                estado == null || estado.isBlank()
                        ? "PENDIENTE"
                        : estado.trim().toUpperCase()
        );

        Reserva guardada = reservaRepository.save(reserva);

        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    // LISTAR TODAS LAS RESERVAS
    @GetMapping
    public List<Reserva> listarReservas() {
        return reservaRepository.findAll();
    }

    // CONSULTAR UNA RESERVA POR ID
    @GetMapping("/{id}")
    public ResponseEntity<?> consultarReserva(@PathVariable Long id) {
        return reservaRepository.findById(id)
                .map(reserva -> ResponseEntity.ok((Object) reserva))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // EDITAR UNA RESERVA
    @PutMapping("/{id}")
    public ResponseEntity<?> modificarReserva(
            @PathVariable Long id,
            @Valid @RequestBody ReservaRequest solicitud) {

        Reserva reserva = reservaRepository.findById(id).orElse(null);

        if (reserva == null) {
            return ResponseEntity.notFound().build();
        }

        Cliente cliente = clienteRepository.findById(solicitud.getClienteId())
                .orElse(null);

        if (cliente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe el cliente indicado");
        }

        Servicio servicio = servicioRepository.findById(solicitud.getServicioId())
                .orElse(null);

        if (servicio == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No existe el servicio indicado");
        }

        reserva.setCliente(cliente);
        reserva.setServicio(servicio);
        reserva.setFechaReserva(solicitud.getFechaReserva());

        String estado = solicitud.getEstado();
        if (estado != null && !estado.isBlank()) {
            reserva.setEstado(estado.trim().toUpperCase());
        }

        Reserva actualizada = reservaRepository.save(reserva);

        return ResponseEntity.ok(actualizada);
    }

    // ELIMINAR UNA RESERVA
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long id) {

        Reserva reserva = reservaRepository.findById(id).orElse(null);

        if (reserva == null) {
            return ResponseEntity.notFound().build();
        }

        reservaRepository.delete(reserva);

        return ResponseEntity.noContent().build();
    }
}