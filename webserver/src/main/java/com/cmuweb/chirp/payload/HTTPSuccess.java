package com.cmuweb.chirp.payload;

public class HTTPSuccess<T> {
    private String status;
    private T response;

    public HTTPSuccess(T response) {
        this.status = "ok";
        this.response = response;
    }

    public String getStatus() {
        return status;
    }

    public T getResponse() {
        return response;
    }
}
