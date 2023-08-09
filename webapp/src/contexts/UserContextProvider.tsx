import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { User } from "../models/user";

import { UserAPIClient } from "../apiClient/user";
import { UserPersister } from "../localStorage/user";
import { AuthRoute } from "../routers/AppRouter";

interface UserContext {
  user?: User;
  signup: (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<User>;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const Context = React.createContext<UserContext>(null as any);

function useMakeContext(apiClient: UserAPIClient): UserContext {
  const [user, setUser] = useState<User | undefined>(UserPersister.retrieve());
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      UserPersister.persist(user);
    }
  }, [user]);

  const signup = useCallback(
    async (
      username: string,
      firstName: string,
      lastName: string,
      email: string,
      password: string
    ) => {
      const userResp = await apiClient.signup(
        username,
        firstName,
        lastName,
        email,
        password
      );
      const user = userResp.user;
      setUser(user);
      return user;
    },
    [apiClient]
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const userResp = await apiClient.login(username, password);
      const user = userResp.user;
      setUser(user);
      return user;
    },
    [apiClient]
  );

  const logout = useCallback(async () => {
    await apiClient.logout();
    UserPersister.revoke();
    navigate(AuthRoute.LOGIN);
    window.location.reload();
  }, [apiClient, navigate]);

  return {
    user,
    signup: signup,
    login: login,
    logout: logout,
  };
}

type Props = {
  apiClient: UserAPIClient;
} & React.PropsWithChildren;

export const UserContextProvider: React.FC<Props> = (props) => {
  const { apiClient, children } = props;
  const value = useMakeContext(apiClient);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export function useUser() {
  return React.useContext(Context);
}
