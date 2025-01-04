import { LOADING, SET_REQUESTS, SET_REQ_COUNTER } from "../Types";
const RelationReducer = (state, action) => {
  switch (action.type) {
    default:
      return { ...state };
    case LOADING: {
      return { ...state, isFriendsLoading: action.payload };
    }
    case SET_REQUESTS: {
      return { ...state, Requests: action.payload };
    }
    case SET_REQ_COUNTER: {
      return { ...state, ReqCounter: action.payload };
    }
  }
};
export default RelationReducer;
