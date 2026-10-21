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

    @GetMapping
    public ResponseEntity<List<Reserva>> consultarReservas() {
        List<Reserva> reservas = reservaRepository.findAll();
        return ResponseEntity.ok(reservas);
    }
}
