package com.example.demo.infra.repository;

import com.example.demo.domain.people.Astronauta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AstronautaRepository extends JpaRepository<Astronauta, Long> {
    
}
