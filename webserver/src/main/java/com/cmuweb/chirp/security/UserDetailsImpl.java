package com.cmuweb.chirp.security;

import java.util.Collection;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.cmuweb.chirp.models.ChirpUser;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class UserDetailsImpl implements UserDetails {
    private Long id;
    private String username;
    private String fname;
    private String lname;
    private String email;
    @JsonIgnore
    private String password;

    public UserDetailsImpl(Long id, String username, String fname, String lname, String email, String password) {
        this.id = id;
        this.username = username;
        this.fname = fname;
        this.lname = lname;
        this.email = email;
        this.password = password;
    }

    public static UserDetailsImpl build(ChirpUser user) {
		return new UserDetailsImpl(
				user.getId(), 
				user.getUsername(), 
                user.getFname(),
                user.getLname(),
				user.getEmail(),
				user.getPassword());
	}

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null;
    }

    public Long getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

    public String getFname() {
        return fname;
    }

    public String getLname() {
        return lname;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;
		UserDetailsImpl user = (UserDetailsImpl) o;
		return Objects.equals(id, user.id);
	}
}
