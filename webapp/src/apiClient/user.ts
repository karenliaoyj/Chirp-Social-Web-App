import {
  AuthResponse,
  UserListResponse,
  UserResponse,
} from "../models/response";
import { makeRequest, RequestData } from "../utils/request";
import {
  AuthResponseSchema,
  UserListResponseSchema,
  UserResponseSchema,
} from "./schemas/user";

export function makeUserAPIClient() {
  async function signup(
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) {
    const requestData: RequestData = {
      method: "POST",
      payload: {
        username: username,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      },
    };
    return makeRequest<UserResponse>(
      "/api/signup",
      requestData,
      UserResponseSchema
    );
  }

  async function login(username: string, password: string) {
    const requestData: RequestData = {
      method: "POST",
      payload: {
        username: username,
        password: password,
      },
    };
    return makeRequest<UserResponse>(
      "/api/login",
      requestData,
      UserResponseSchema
    );
  }

  async function logout() {
    const requestData: RequestData = {
      method: "POST",
    };
    return makeRequest("/api/logout", requestData);
  }

  async function getUsers(query?: { [key: string]: string }) {
    const requestData: RequestData = {
      method: "GET",
      queryParams: {
        ...query,
      },
    };
    return makeRequest<UserListResponse>(
      "/api/users",
      requestData,
      UserListResponseSchema
    );
  }

  async function getAuthToken() {
    const requestData: RequestData = {
      method: "GET",
    };
    return makeRequest<AuthResponse>(
      "/api/auth_token",
      requestData,
      AuthResponseSchema
    );
  }

  return {
    getAuthToken,
    login,
    signup,
    logout,
    getUsers,
  };
}

export type UserAPIClient = ReturnType<typeof makeUserAPIClient>;
