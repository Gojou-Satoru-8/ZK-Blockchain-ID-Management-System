"use client";
import { createContext, useEffect, useState } from "react";

export type ThemeType = "light" | "dark" | "system";

const ThemeContext = createContext({
  theme: "dark",
  changeTheme: (theme: ThemeType) => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>("system");

  useEffect(() => {
    // For initial theme selection
    const initialTheme = localStorage.getItem("theme") as ThemeType;
    if (initialTheme === null || initialTheme === "system") setTheme("system");
    else setTheme(initialTheme);
  }, []);

  useEffect(() => {
    // Reacts to theme change, via setTheme
    if (theme === "dark") document.documentElement.classList.add("dark");
    else if (theme === "light") document.documentElement.classList.remove("dark");
    // Shorter way: document.documentElement.classList.toggle("dark", theme === "dark")
    else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.matches) window.document.documentElement.classList.add("dark");
      else window.document.documentElement.classList.remove("dark");
      // That's not all, gotta add event listener to theme changes by user from system/browser settings
      const ac = new AbortController();
      mq.addEventListener(
        "change",
        (e) => {
          //   if (e.matches) document.documentElement.classList.add("dark");
          //   else document.documentElement.classList.remove("dark");
          document.documentElement.classList.toggle("dark", e.matches);
        },
        { signal: ac.signal }
      );
      return () => {
        ac.abort();
      };
    }
  }, [theme]);

  const changeTheme = (theme: ThemeType) => {
    localStorage.setItem("theme", theme);
    setTheme(theme);
  };

  console.log("🚀 ~ theme:", theme);
  return <ThemeContext.Provider value={{ theme, changeTheme }}>{children}</ThemeContext.Provider>;
};
export default ThemeProvider;
export { ThemeContext };
