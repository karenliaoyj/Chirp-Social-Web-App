import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useErrorContext } from "../../contexts/ErrorContextProvider";
import { useUser } from "../../contexts/UserContextProvider";
import { LoginState } from "../../models/login";
import { AppRoute } from "../../routers/AppRouter";

import Login from "./Login";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { handleError } = useErrorContext();

  const submit = useCallback(
    async (value: LoginState) => {
      try {
        await login(value.username, value.password);
        navigate(AppRoute.HOME, { replace: true });
      } catch (e: any) {
        handleError(e);
      }
    },
    [login, handleError, navigate]
  );
  return <Login submit={submit} />;
};

export default LoginPage;
