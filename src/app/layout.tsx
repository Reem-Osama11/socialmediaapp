"use client";

import "./globals.css";
import Navbar from "./_Components/navbar/page";
import { Geist } from "next/font/google";
import { store } from "@/lib/store";
import { Provider } from "react-redux";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const theme = createTheme({
  // لو عندك تخصيصات ألوان أو خطوط تحطها هنا لاحقًا
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        <AppRouterCacheProvider options={{ key: "css" }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Provider store={store}>
              <Navbar></Navbar>
              {children}
            </Provider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}