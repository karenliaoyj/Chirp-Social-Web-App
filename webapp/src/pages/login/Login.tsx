import * as yup from "yup";
import React, { useCallback, useState } from "react";

import InputField from "../../components/InputField/InputField";
import { validateFields, ValidationRule } from "../../utils/inputValidation";

import {
  LoginErrorState,
  LoginFormState,
  LoginState,
} from "../../models/login";

import "./Login.scss";

const InitialState: LoginState = {
  username: "",
  password: "",
};

const validateRules: ValidationRule<LoginFormState, LoginErrorState>[] = [
  {
    inputKey: "username",
    errorKey: "usernameError",
    schema: yup.string().trim().required("The username field is required"),
  },
  {
    inputKey: "password",
    errorKey: "passwordError",
    schema: yup.string().trim().required("The password field is required"),
  },
];

export interface LoginProps {
  submit: (values: LoginState) => void;
}

const Login: React.FC<LoginProps> = (props) => {
  const [state, setState] = useState<LoginState>(InitialState);
  const onSubmit = useCallback(async () => {
    validateFields(["username", "password"], state, validateRules)
      .then(({ isValid, errorList }) => {
        if (isValid) {
          props.submit(state);
        } else {
          setState((state) => ({
            ...state,
            ...errorList,
          }));
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [state, setState, props]);

  const onFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit().catch((e) => {
        console.error(e);
      });
    },
    [onSubmit]
  );

  const validateFormField = useCallback(
    async (field: keyof LoginState) => {
      return validateFields([field], state, validateRules).then(
        ({ errorList }) => {
          setState((state) => ({
            ...state,
            ...errorList,
          }));
        }
      );
    },
    [state, setState]
  );

  const onInputChange = useCallback(
    (key: keyof LoginState, data: LoginState[keyof LoginState]) => {
      setState((state: LoginState) => ({
        ...state,
        [key]: data,
      }));
    },
    [setState]
  );

  return (
    <div className="login">
      <div className="login__title">Login</div>
      <div className="login__form-container">
        <form onSubmit={onFormSubmit}>
          <InputField
            name="username"
            inputType="text"
            label="Username"
            value={state.username}
            errorMessage={state.usernameError}
            placeholder="Enter username"
            onBlur={() => {
              validateFormField("username").catch((e) => {
                console.error(e);
              });
            }}
            onInputStateChanged={(text) => {
              onInputChange("username", text);
              onInputChange("usernameError", undefined);
            }}
          />
          <InputField
            name="password"
            inputType="password"
            label="Password"
            value={state.password}
            errorMessage={state.passwordError}
            placeholder="Please fill in the password"
            onBlur={() => {
              validateFormField("password").catch((e) => {
                console.error(e);
              });
            }}
            onInputStateChanged={(text) => {
              onInputChange("password", text);
              onInputChange("passwordError", undefined);
            }}
          />
          <p className="login__button">
            <button className="button__primary">Login</button>
          </p>
        </form>
        <hr className="login__separator" />
        <div className="login__signup-hint-container">
          <p className="login__signup-hint">New to Chirp?</p>
          <p className="login__signup-hint">
            <a href="/signup">
              <button className="button__outline button__outline--capitalise">
                Create a new account
              </button>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
