import { Fragment } from "react";
import Home from "./components/Home";
import { AuthState } from "./context/Auth/AuthState";
import { AlertState } from "./context/Alert/AlertState";
import { ThemeState } from "./context/Theme/ThemeContext";
import { RelationState } from "./context/Relations/RelationState";
import ChatState from "./context/Chat/ChatState";
import AlertNotify from "./components/Tools/AlertNotify";

const App = () => {
  return (
    <Fragment>
      <ThemeState>
        <AlertState>
          <AuthState>
            <ChatState>
              <RelationState>
                <AlertNotify />
                <Home />
              </RelationState>
            </ChatState>
          </AuthState>
        </AlertState>
      </ThemeState>
    </Fragment>
  );
};

export default App;
