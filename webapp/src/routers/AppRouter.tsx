import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContextProvider";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/login/LoginPage";
import SignupPage from "../pages/signup/SignupPage";
import ErrorPage from "../pages/error/ErrorPage";

export enum AuthRoute {
  ROOT = "/",
  LOGIN = "/login",
  SIGNUP = "/signup",
}

export enum AppRoute {
  HOME = "/home",
  ERROR = "/error",
}

const privateRoute = (
  isLoggedIn: boolean,
  path: string,
  element: React.ReactElement | null
) => {
  return isLoggedIn ? (
    <Route path={path} element={element} />
  ) : (
    <Route path={path} element={<Navigate to={AuthRoute.LOGIN} replace />} />
  );
};

const AppRouter: React.FC = () => {
  const { user } = useUser();
  return (
    <Routes>
      {user ? (
        <Route
          path={AuthRoute.ROOT}
          element={<Navigate to={AppRoute.HOME} replace />}
        />
      ) : (
        <Route
          path={AuthRoute.ROOT}
          element={<Navigate to={AuthRoute.LOGIN} replace />}
        />
      )}
      <Route path={AuthRoute.LOGIN} element={<LoginPage />} />
      <Route path={AuthRoute.SIGNUP} element={<SignupPage />} />
      {privateRoute(user != null, AppRoute.HOME, <HomePage />)}
      <Route path={AppRoute.ERROR} element={<ErrorPage />} />
      <Route path="*" element={<Navigate to={AuthRoute.ROOT} />} />
    </Routes>
  );
};

export default AppRouter;
