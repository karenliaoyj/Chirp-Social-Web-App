package com.cmuweb.chirp.controllers;

import com.cmuweb.chirp.payload.HTTPSuccess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.cmuweb.chirp.models.ChirpUser;
import com.cmuweb.chirp.payload.LoginRequest;
import com.cmuweb.chirp.payload.SignupRequest;
import com.cmuweb.chirp.payload.UserResponse;
import com.cmuweb.chirp.repositories.UserRepository;
import com.cmuweb.chirp.security.UserDetailsImpl;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("api/")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("username: " + loginRequest.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
        UserResponse userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getFname(),
                user.getLname());

        HTTPSuccess<UserResponse> response = new HTTPSuccess<UserResponse>(userResponse);
        return ResponseEntity.ok(response);
    }

    @PostMapping("signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        // Create new user's account
        System.out.println("username: " + signUpRequest.getUsername());
        ChirpUser user = new ChirpUser(signUpRequest.getUsername(), signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                signUpRequest.getEmail(), encoder.encode(signUpRequest.getPassword()));
        userRepository.save(user);
        UserResponse userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getFname(),
                user.getLname());

        HTTPSuccess<UserResponse> response = new HTTPSuccess<UserResponse>(userResponse);
        return ResponseEntity.ok(response);
    }

    @GetMapping("logout")
    public ResponseEntity<?> logoutUser() {
        HTTPSuccess<String> response = new HTTPSuccess<String>("User has been logged out");
        return ResponseEntity.ok(null);
    }
}
