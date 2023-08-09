import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useErrorContext } from "../../contexts/ErrorContextProvider";
import { useUser } from "../../contexts/UserContextProvider";
import { SignupState } from "../../models/signup";
import { AppRoute } from "../../routers/AppRouter";

import Signup from "./Signup";

interface SignupContext {
  firstName?: string;
  lastName?: string;
  email?: string;
}

const Context = React.createContext<SignupContext>(null as any);

export function useSignupContext() {
  return React.useContext(Context);
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorContext();
  const { user, signup } = useUser();
  const [context, setContext] = useState<SignupContext>({
    firstName: user && user.firstName,
    lastName: user && user.lastName,
    email: user && user.email,
  });
  const submit = useCallback(
    async (value: SignupState) => {
      setContext({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
      });

      try {
        await signup(
          value.username,
          value.firstName,
          value.lastName,
          value.email,
          value.password
        );
        navigate(AppRoute.HOME);
      } catch (e: any) {
        handleError(e);
      }
    },
    [signup, setContext, handleError, navigate]
  );

  return (
    <Context.Provider value={context}>
      <Signup submit={submit} />
    </Context.Provider>
  );
};

export default SignupPage;
