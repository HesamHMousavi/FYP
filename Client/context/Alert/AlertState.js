import { createContext, useReducer } from "react";
import {
  SET_ALERT,
  REMOVE_ALERT,
  LOADING,
  SET_NOTIFY,
  SET_MODEL,
  SET_TASKS_LOADING,
} from "../Types";
import AlertReducer from "./AlertReducer";
export const AlertContext = createContext();

export const AlertState = (props) => {
  const initialState = {
    Alert: null,
    isLoading: false,
    isTasksLoading: false,
    isNotify: false,
    notificationMessage: null,
    sender: null,
    ModelVisible: false,
  };

  // create a reducer and a state
  const [state, dispatch] = useReducer(AlertReducer, initialState);

  const SetAlert = (message, type = "warning") => {
    dispatch({ type: SET_ALERT, payload: { message, type } });
  };
  const RemoveAlert = () => {
    dispatch({ type: REMOVE_ALERT, payload: null });
  };
  const SetLoading = (flag) => {
    dispatch({ type: LOADING, payload: flag });
  };

  const SetTasksLoading = (flag) => {
    dispatch({ type: SET_TASKS_LOADING, payload: flag });
  };
  const setModel = (flag) => {
    dispatch({ type: SET_MODEL, payload: flag });
  };

  const setNotify = (msg, flag, sender) => {
    dispatch({ type: SET_NOTIFY, payload: { msg, flag, sender } });
    setTimeout(() => {
      dispatch({
        type: SET_NOTIFY,
        payload: { sender: null, msg: null, flag: false },
      });
    },5400);
  };

  return (
    <AlertContext.Provider
      value={{
        SetAlert:SetAlert,
        RemoveAlert: RemoveAlert,
        SetLoading: SetLoading,
        setNotify: setNotify,
        setModel: setModel,
        SetTasksLoading: SetTasksLoading,
        isTasksLoading: state.isTasksLoading,
        Alert: state.Alert,
        isLoading: state.isLoading,
        isNotify: state.isNotify,
        sender: state.sender,
        notificationMessage: state.notificationMessage,
        ModelVisible: state.ModelVisible,
      }}
    >
      {props.children}
    </AlertContext.Provider>
  );
};
