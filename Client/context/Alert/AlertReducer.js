import {
  SET_ALERT,
  REMOVE_ALERT,
  LOADING,
  SET_NOTIFY,
  SET_MODEL,
  SET_TASKS_LOADING,
} from "../Types";

const AlertReducer = (state, action) => {
  switch (action.type) {
    default:
      return { ...state };
    case SET_ALERT: {
      return { ...state, Alert: action.payload };
    }
    case REMOVE_ALERT: {
      return { ...state, Alert: action.payload };
    }
    case LOADING: {
      return { ...state, isLoading: action.payload };
    }
    case SET_MODEL: {
      return { ...state, ModelVisible: action.payload };
    }
    case SET_TASKS_LOADING: {
      return { ...state, isTasksLoading: action.payload };
    }
    case SET_NOTIFY: {
      return {
        ...state,
        notificationMessage: action.payload.msg,
        isNotify: action.payload.flag,
        sender: action.payload.sender,
      };
    }
  }
};

export default AlertReducer;
