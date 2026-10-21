package com.reservaspro.controller;

import com.reservaspro.model.Cliente;
import com.reservaspro.repository.ClienteRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @PostMapping
    public ResponseEntity<?> registrarCliente(@Valid @RequestBody Cliente cliente) {
        if (clienteRepository.existsByCorreo(cliente.getCorreo())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un cliente con ese correo");
        }

        Cliente nuevoCliente = clienteRepository.save(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
    }

    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modificarCliente(
            @PathVariable Long id,
            @Valid @RequestBody Cliente datosCliente) {

        return clienteRepository.findById(id)
                .map(clienteExistente -> {
                    if (!clienteExistente.getCorreo().equals(datosCliente.getCorreo())
                            && clienteRepository.existsByCorreo(datosCliente.getCorreo())) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Ya existe otro cliente con ese correo");
                    }

                    clienteExistente.setNombre(datosCliente.getNombre());
                    clienteExistente.setCorreo(datosCliente.getCorreo());
                    clienteExistente.setTelefono(datosCliente.getTelefono());

                    Cliente actualizado = clienteRepository.save(clienteExistente);
                    return ResponseEntity.ok(actualizado);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
