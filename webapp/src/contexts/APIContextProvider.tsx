import React, { useMemo } from "react";

import { UserContextProvider } from "./UserContextProvider";
import makeAPIClient, { APIClient } from "../apiClient";

interface APIContext {
  apiClient: APIClient;
}

const Context = React.createContext<APIContext>(null as any);
type Props = React.PropsWithChildren;

const APIContextProvider: React.FC<Props> = (props) => {
  const apiClient = useMemo(() => {
    return makeAPIClient();
  }, []);

  const value = {
    apiClient: apiClient,
  };
  return (
    <Context.Provider value={value}>
      <UserContextProvider apiClient={apiClient} {...props} />
    </Context.Provider>
  );
};

export function useAPIContext() {
  return React.useContext(Context);
}

export default APIContextProvider;
