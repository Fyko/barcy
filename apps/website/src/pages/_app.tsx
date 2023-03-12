import type { AppProps } from "next/app";
import Head from "next/head";
import React, { Fragment } from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "../components/GlobalStyle";
import { appTheme } from "../core/app-themes";
import { Navbar } from "../molecules/Navbar";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Barcy</title>
			</Head>

			<ThemeProvider theme={appTheme}>
				<GlobalStyle />
				<Navbar />
				<Component {...pageProps} />
			</ThemeProvider>
		</>
	);
}
