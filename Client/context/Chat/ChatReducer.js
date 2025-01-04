import {
  SET_SELECTED_CHAT,
  ON_NEW_TEXT,
  USER_TYPING,
  SET_CHAT_LOADING,
  SET_TASKS,
  ADD_TASK,
  SET_IS_CHAT_PAGE,
} from "../Types";

const Reducer = (state, action) => {
  switch (action.type) {
    default:
      return { ...state };
    case SET_SELECTED_CHAT:
      return { ...state, selectedChat: action.payload };
    case ON_NEW_TEXT:
      return { ...state, sender: action.payload };
    case USER_TYPING:
      return { ...state, userTyping: action.payload };
    case SET_CHAT_LOADING:
      return { ...state, isChatLoading: action.payload };
    case SET_TASKS:
      return { ...state, Tasks: action.payload };
    case ADD_TASK:
      return { ...state, Tasks: [...state.Tasks, action.payload] };
    case SET_IS_CHAT_PAGE:
      return { ...state, isChatPage: action.payload };
  }
};

export default Reducer;
