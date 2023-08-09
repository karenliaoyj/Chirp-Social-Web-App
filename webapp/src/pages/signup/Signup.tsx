import * as yup from "yup";
import React, { useState, useCallback } from "react";

import InputField from "../../components/InputField/InputField";

import {
  SignupErrorState,
  SignupFormState,
  SignupState,
} from "../../models/signup";
import { validateFields, ValidationRule } from "../../utils/inputValidation";

import "./Signup.scss";
import { useSignupContext } from "./SignupPage";

const InitialState = (
  username?: string,
  firstName?: string,
  lastName?: string,
  email?: string
): SignupState => ({
  username: username || "",
  firstName: firstName || "",
  lastName: lastName || "",
  email: email || "",
  password: "",
});

const validateRules: ValidationRule<SignupFormState, SignupErrorState>[] = [
  {
    inputKey: "username",
    errorKey: "usernameError",
    schema: yup
      .string()
      .trim()
      .required("The field username is required")
      .max(255, "The length should be less than 256 characters"),
  },
  {
    inputKey: "lastName",
    errorKey: "lastNameError",
    schema: yup
      .string()
      .trim()
      .required("The field last name is required")
      .max(255, "The length should be less than 256 characters"),
  },
  {
    inputKey: "firstName",
    errorKey: "firstNameError",
    schema: yup
      .string()
      .trim()
      .required("The field first name is required")
      .max(255, "The length should be less than 256 characters"),
  },
  {
    inputKey: "email",
    errorKey: "emailError",
    schema: yup
      .string()
      .trim()
      .required("The email field is required")
      .max(255, "The length should be less than 256 characters")
      .email("Invalid email format")
      .test(
        "is-andrew-email",
        "Email domain must be @andrew.cmu.edu",
        (value) => {
          if (value != null) {
            return /@andrew\.cmu\.edu$/.test(value);
          }
          return true;
        }
      ),
  },
  {
    inputKey: "password",
    errorKey: "passwordError",
    schema: yup.string().trim().required("The password field is required"),
  },
];

export interface SignupProps {
  submit: (values: SignupState) => Promise<void>;
}

const Signup: React.FC<SignupProps> = (props) => {
  const context = useSignupContext();
  const [state, setState] = useState<SignupState>(
    InitialState(context.firstName, context.lastName, context.email)
  );

  const onSubmit = useCallback(async () => {
    validateFields(
      ["username", "firstName", "lastName", "email", "password"],
      state,
      validateRules
    )
      .then(({ isValid, errorList }) => {
        if (isValid) {
          props.submit(state).catch((e) => {
            setState((state) => ({
              ...state,
              emailErrorId: e.message,
            }));
          });
        } else {
          setState((state) => ({
            ...state,
            ...errorList,
          }));
        }
      })
      .catch((e) => console.error(e));
  }, [state, setState, props]);

  const onFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );

  const validateFormField = useCallback(
    async (field: keyof SignupState) => {
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
    (key: keyof SignupState, data: SignupState[keyof SignupState]) => {
      setState((state: SignupState) => ({
        ...state,
        [key]: data,
      }));
    },
    [setState]
  );

  return (
    <form className="signup" onSubmit={onFormSubmit}>
      <div className="signup__title">Sign Up</div>
      <div className="signup__form-container">
        <InputField
          name="username"
          label="Username"
          value={state.username}
          errorMessage={state.usernameError}
          placeholder="Enter Username"
          onBlur={() => {
            validateFormField("username").catch((e) => console.error(e));
          }}
          onInputStateChanged={(text) => {
            onInputChange("username", text);
            onInputChange("usernameError", undefined);
          }}
        />
        <InputField
          name="firstName"
          label="First Name"
          value={state.firstName}
          errorMessage={state.firstNameError}
          placeholder="Enter first name"
          onBlur={() => {
            validateFormField("firstName").catch((e) => console.error(e));
          }}
          onInputStateChanged={(text) => {
            onInputChange("firstName", text);
            onInputChange("firstNameError", undefined);
          }}
        />
        <InputField
          name="lastName"
          label="Last Name"
          value={state.lastName}
          errorMessage={state.lastNameError}
          placeholder="Enter last name"
          onBlur={() => {
            validateFormField("lastName").catch((e) => console.error(e));
          }}
          onInputStateChanged={(text) => {
            onInputChange("lastName", text);
            onInputChange("lastNameError", undefined);
          }}
        />
        <InputField
          name="email"
          inputType="email"
          label="Email"
          value={state.email}
          errorMessage={state.emailError}
          placeholder="Enter email"
          onBlur={() => {
            validateFormField("email").catch((e) => console.error(e));
          }}
          onInputStateChanged={(text) => {
            onInputChange("email", text);
            onInputChange("emailError", undefined);
          }}
        />
        <InputField
          name="password"
          inputType="password"
          label="Password"
          value={state.password}
          errorMessage={state.passwordError}
          placeholder="Enter password"
          onBlur={() => {
            validateFormField("password").catch((e) => console.error(e));
          }}
          onInputStateChanged={(text) => {
            onInputChange("password", text);
            onInputChange("passwordError", undefined);
          }}
        />
        <div className="signup__button-container">
          <button className="button__primary">Sign up</button>
        </div>
        <div className="signup__login-hint-container">
          <span className="signup__login-hint">Already signed up?</span>
          <a href="/login" className="signup__login-link">
            Login
          </a>
        </div>
      </div>
    </form>
  );
};

export default Signup;
