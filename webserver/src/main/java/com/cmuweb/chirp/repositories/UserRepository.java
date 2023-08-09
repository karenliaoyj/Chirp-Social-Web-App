package com.cmuweb.chirp.repositories;

import com.cmuweb.chirp.models.ChirpUser;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.transaction.annotation.Transactional;

@RepositoryRestResource
@Transactional(readOnly = true)
public interface UserRepository extends JpaRepository<ChirpUser, Long> {
    Optional<ChirpUser> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
