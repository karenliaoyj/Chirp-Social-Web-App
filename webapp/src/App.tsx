import React from "react";

import { BrowserRouter } from "react-router-dom";
import APIContextProvider from "./contexts/APIContextProvider";
import ErrorContextProvider from "./contexts/ErrorContextProvider";
import AppRouter from "./routers/AppRouter";

import "./App.css";
import { ConversationMenuListProvider } from "./contexts/ConversationMenuListProvider";
import { ChannelMenuListProvider } from "./contexts/ChannelMenuListProvider";
import { ConversationViewContextProvider } from "./pages/home/ConversationView/ConversationViewContextProvider";
import { ChannelViewContextProvider } from "./pages/home/ChannelView/ChannelViewContextProvider";

const App = () => {
  return (
    <BrowserRouter>
      <APIContextProvider>
        <ErrorContextProvider>
          <ChannelMenuListProvider>
            <ConversationMenuListProvider>
              <ConversationViewContextProvider>
                <ChannelViewContextProvider>
                  <div className="App" id="app">
                    <div className="body">
                      <AppRouter />
                    </div>
                  </div>
                </ChannelViewContextProvider>
              </ConversationViewContextProvider>
            </ConversationMenuListProvider>
          </ChannelMenuListProvider>
        </ErrorContextProvider>
      </APIContextProvider>
    </BrowserRouter>
  );
};

export default App;
