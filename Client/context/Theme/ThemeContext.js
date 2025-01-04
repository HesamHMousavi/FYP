import { createContext, useReducer, useEffect } from "react";
export const ThemeContext = createContext();
import { TOGGLE_THEME, TOGGLE_SYSTEM_THEME } from "../Types";
import {  Appearance } from "react-native";
import * as SecureStore from "expo-secure-store";
const Reducer = (state, action) => {
  switch (action.type) {
    default:
      return { ...state };
    case TOGGLE_THEME: {
      return { ...state, isDarkMode: action.payload };
    }
  }
};

export const ThemeState = (props) => {
  useEffect(() => {
    // Listener to handle theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch({
        type: TOGGLE_SYSTEM_THEME,
        payload: colorScheme,
      });
      setTheme();
    });

    // Cleanup function to remove the listener on component unmount
    return () => {
      subscription.remove();
    };
  }, []);
  const initialState = {
    isDarkMode: true,
  };
  // console.log(.sysTheme);
  // 1 - system
  // 2 - light
  // 3 - dark
  const [state, dispatch] = useReducer(Reducer, initialState);

  const setDarkMode = async (flag) => {
    dispatch({ type: TOGGLE_THEME, payload: flag });
    await SecureStore.setItemAsync("theme", flag ? "3" : "2");
  };

  const setTheme = async () => {
    const flag = await SecureStore.getItemAsync("theme");
    let res = null;
    if (flag === "1")
      res = Appearance.getColorScheme() === "dark" ? true : false;
    else if (flag === "2") res = false;
    else res = true;
    dispatch({ type: TOGGLE_THEME, payload: res });
  };

  const changeTheme = async (id) => {
    await SecureStore.setItemAsync("theme", id);
    setTheme();
  };

  return (
    <ThemeContext.Provider
      value={{
        setTheme: setTheme,
        setDarkMode: setDarkMode,
        changeTheme: changeTheme,
        isDarkMode: state.isDarkMode,
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};
