import type { DocumentContext } from "next/document";
import Document, { Html, Main, NextScript, Head } from "next/document";
import React from "react";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
	public static async getInitialProps(ctx: DocumentContext) {
		const sheet = new ServerStyleSheet();
		const originalRenderPage = ctx.renderPage;

		try {
			ctx.renderPage = async () =>
				originalRenderPage({
					enhanceApp: (App) => {
						return (props) => sheet.collectStyles(<App {...props} />);
					},
				});

			const initialProps = await Document.getInitialProps(ctx);
			return {
				...initialProps,
				styles: (
					<>
						{initialProps.styles}
						{sheet.getStyleElement()}
					</>
				),
			};
		} finally {
			sheet.seal();
		}
	}

	public render(): JSX.Element {
		return (
			<Html lang="en">
				<Head>
					<link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
					<meta content="#000000" name="theme-color" />
					<meta content="Barcy" property="og:title" />
					<meta content="A modern React Component for reading USB Barcode Scanners" property="og:description" />
					<meta content="A modern React Component for reading USB Barcode Scanners" name="description" />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
