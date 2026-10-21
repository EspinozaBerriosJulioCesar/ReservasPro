package com.reservaspro.controller;

import com.reservaspro.model.Servicio;
import com.reservaspro.repository.ServicioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioRepository servicioRepository;

    public ServicioController(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
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
}
