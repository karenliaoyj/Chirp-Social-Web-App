import * as yup from "yup";
import {
  AuthResponse,
  UserListResponse,
  UserResponse,
} from "../../models/response";
import { User } from "../../models/user";

export const AuthResponseSchema: yup.Schema<AuthResponse> = yup
  .object<AuthResponse>({
    authToken: yup.string().required(),
  })
  .required()
  .camelCase();

export const UserSchema: yup.Schema<User> = yup
  .object<User>({
    id: yup.string().required(),
    username: yup.string().required(),
    email: yup.string().required(),
    firstName: yup.string().required(),
    lastName: yup.string().required(),
  })
  .required()
  .camelCase();

export const UserResponseSchema: yup.Schema<UserResponse> = yup
  .object<UserResponse>({
    user: UserSchema,
  })
  .required()
  .camelCase();

export const UserListResponseSchema: yup.Schema<UserListResponse> = yup
  .object<UserListResponse>({
    users: yup.array().defined().of(UserSchema),
  })
  .required()
  .camelCase();
