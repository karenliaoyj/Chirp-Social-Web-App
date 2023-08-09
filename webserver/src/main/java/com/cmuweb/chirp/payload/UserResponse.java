package com.cmuweb.chirp.payload;

public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;

    public UserResponse(Long id, String username, String email, String firstName, String lastName) {
        this.id = Long.toString(id);
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }


    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return this.username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return this.lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
