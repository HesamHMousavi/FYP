import {
  LOADING,
  LOG_IN,
  LOG_OUT,
  SET_USER,
  SEARCH_LOADING,
  SET_SEARCH_USERS,
  SET_REFRESH_LOADING,
} from "../Types";

const AuthReducer = (state, action) => {
  switch (action.type) {
    default:
      return { ...state };
    case LOG_IN:
      return {
        ...state,
        isLoggedIn: true,
        Token: action.payload,
      };
    case LOG_OUT:
      return {
        ...state,
        isLoggedIn: false,
      };
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case LOADING:
      return {
        ...state,
        isSettingsLoading: action.payload,
      };
    case SEARCH_LOADING:
      return {
        ...state,
        isSearchLoading: action.payload,
      };
    case SET_REFRESH_LOADING:
      return {
        ...state,
        isRefreshLoading: action.payload,
      };
    case SET_SEARCH_USERS:
      return {
        ...state,
        UsersFound: action.payload,
      };
  }
};
export default AuthReducer;
