package com.reservaspro.controller;

import com.reservaspro.model.Servicio;
import com.reservaspro.repository.ServicioRepository;
import com.reservaspro.repository.ReservaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioRepository servicioRepository;
    private final ReservaRepository reservaRepository;

    public ServicioController(
            ServicioRepository servicioRepository,
            ReservaRepository reservaRepository) {
        this.servicioRepository = servicioRepository;
        this.reservaRepository = reservaRepository;
    }

    @PostMapping
    public ResponseEntity<Servicio> registrarServicio(
            @Valid @RequestBody Servicio servicio) {

        Servicio nuevoServicio = servicioRepository.save(servicio);

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoServicio);
    }

    @GetMapping
    public List<Servicio> listarServicios() {
        return servicioRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificarServicio(
            @PathVariable Long id,
            @Valid @RequestBody Servicio datosServicio) {

        return servicioRepository.findById(id)
                .map(servicioExistente -> {
                    servicioExistente.setNombre(datosServicio.getNombre());
                    servicioExistente.setDescripcion(datosServicio.getDescripcion());
                    servicioExistente.setPrecio(datosServicio.getPrecio());

                    Servicio actualizado =
                            servicioRepository.save(servicioExistente);

                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarServicio(@PathVariable Long id) {

        var servicio = servicioRepository.findById(id);

        if (servicio.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (reservaRepository.existsByServicio_Id(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede eliminar este servicio porque tiene reservas asociadas.");
        }

        servicioRepository.delete(servicio.get());

        return ResponseEntity.noContent().build();
    }
}