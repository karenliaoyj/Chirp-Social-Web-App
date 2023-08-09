export interface LoginFormState {
  username: string;
  password: string;
}

export interface LoginErrorState {
  usernameError?: string;
  passwordError?: string;
}

export type LoginState = LoginFormState & LoginErrorState;
