package com.reservaspro.repository;

import com.reservaspro.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    boolean existsByCliente_Id(Long clienteId);

    long countByCliente_Id(Long clienteId);
}
