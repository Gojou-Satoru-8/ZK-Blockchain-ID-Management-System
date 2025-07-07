import { Toaster } from "sonner";
import { Geist } from "next/font/google";
const josefin = Geist({
  subsets: ["latin"],
  display: "swap",
});
import ThemeProvider from "../context/ThemeContext";
import "../styles/globals.css";
import Waves from "./_components/Waves";

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ZK Verifiable credentials App</title>
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body className={josefin.className}>
        <ThemeProvider>{children}</ThemeProvider>
        <Waves />

        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
