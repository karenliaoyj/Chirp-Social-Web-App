export interface SignupFormState {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignupErrorState {
  usernameError?: string;
  firstNameError?: string;
  lastNameError?: string;
  emailError?: string;
  passwordError?: string;
}

export type SignupState = SignupFormState & SignupErrorState;
