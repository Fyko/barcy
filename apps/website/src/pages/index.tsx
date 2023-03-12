import Barcy from "barcy";
import React from "react";
import { Title, Subtitle, LearnMore } from "../components/Headers";

export default function Index() {
	const [scanned, setScanned] = React.useState<string>("");

	return (
		<div className="app">
			<Barcy onScan={(code) => setScanned(code)} />
			<Title>Barcy</Title>
			<Subtitle>A modern React Component for reading USB Barcode Scanners.</Subtitle>
			<LearnMore>This is a live demo of the Barcy component. Scan a barcode and see the result below.</LearnMore>
			<Subtitle>{scanned}</Subtitle>
		</div>
	);
}
