// TODO: handle iframe
import React, { useEffect } from "react";

type BarcyProps = {
	/**
	 * Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
	 */
	avgTimeByChar: number;
	/**
	 * Chars to remove and means end of scanning
	 */
	endChar: number[];
	/**
	 * Minimum length for a scanning
	 */
	minLength: number;
	/**
	 * Callback after detection of a unsuccessfull scanning (scanned string in parameter)
	 */
	onError?(scannedString: string, error: string): void;
	/**
	 * Callback after detecting a keyDown (key char in parameter) - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!
	 */
	onKeyDetect?(event: KeyboardEvent): void;
	/**
	 * Callback after receiving and processing a char (scanned char in parameter)
	 */
	onReceive?(event: KeyboardEvent): void;
	/**
	 * Callback after detection of a successfull scanning (scanned string in parameter)
	 */
	onScan?(scannedString: string, count: number): void;
	/**
	 * Callback after detection of a successfull scan while the scan button was pressed and held down
	 */
	onScanButtonLongPressed?(scannedString: string, count: number): void;
	/**
	 * Prevent default action on keypress event
	 */
	preventDefault: boolean;
	/**
	 * Key code of the scanner hardware button (if the scanner button a acts as a key itself)
	 */
	scanButtonKeyCode?: number;
	/**
	 * How many times the hardware button should issue a pressed event before a barcode is read to detect a longpress
	 */
	scanButtonLongPressThreshold: number;
	/**
	 * Chars to remove and means start of scanning
	 */
	startChar?: number[];
	/**
	 * Stop immediate propagation on keypress event
	 */
	stopPropagation: boolean;
	/**
	 * Test string for simulating
	 */
	testCode?: string;
	/**
	 * Wait duration (ms) after keypress event to check if scanning is finished
	 */
	timeBeforeScanTest: number;
};

const defaultProps: Partial<BarcyProps> = {
	avgTimeByChar: 30,
	endChar: [9, 13],
	minLength: 6,
	scanButtonLongPressThreshold: 3,
	stopPropagation: false,
	preventDefault: false,
	timeBeforeScanTest: 100,
};

function isContentEditable(element: HTMLElement) {
	if (typeof element.getAttribute !== "function") {
		return false;
	}

	return Boolean(element.getAttribute("contenteditable"));
}

function isInput(element: HTMLElement) {
	if (!element) {
		return false;
	}

	const { tagName } = element;
	const editable = isContentEditable(element);

	return tagName === "INPUT" || tagName === "TEXTAREA" || editable;
}

function Barcy(_props: Partial<BarcyProps>) {
	// merge props with default props
	const props = { ...defaultProps, ..._props } as BarcyProps;

	const [firstCharTime, setFirstCharTime] = React.useState(0);
	const [lastCharTime, setLastCharTime] = React.useState(0);
	const [stringWriting, setStringWriting] = React.useState("");
	const [callIsScanner, setCallIsScanner] = React.useState(false);
	const [testTimer, setTestTimer] = React.useState<NodeJS.Timeout | undefined>(undefined);
	const [scanButtonCounter, setScanButtonCounter] = React.useState(0);

	const initScannerDetection = () => {
		setFirstCharTime(0);
		setStringWriting("");
		setScanButtonCounter(0);
	};

	const scannerDetectionTest = (str?: string) => {
		if (str) {
			setFirstCharTime(0);
			setLastCharTime(0);
			setStringWriting("");
		}

		if (!scanButtonCounter) {
			setScanButtonCounter(1);
		}

		// If all condition are good (length, time...), call the callback and re-initialize the plugin for next scanning
		// Else, just re-initialize
		if (
			stringWriting.length >= props.minLength &&
			lastCharTime - firstCharTime < stringWriting.length * props.avgTimeByChar
		) {
			if (props.onScanButtonLongPressed && scanButtonCounter > props.scanButtonLongPressThreshold)
				props.onScanButtonLongPressed(stringWriting, scanButtonCounter);
			else if (props.onScan) props.onScan(stringWriting, scanButtonCounter);

			initScannerDetection();
			return true;
		}

		let errorMsg = "";
		if (stringWriting.length < props.minLength) {
			errorMsg = `String length should be greater or equal ${props.minLength}`;
		} else if (lastCharTime - firstCharTime > stringWriting.length * props.avgTimeByChar) {
			errorMsg = `Average key character time should be less or equal ${props.avgTimeByChar}ms`;
		}

		if (props.onError) props.onError(stringWriting, errorMsg);

		initScannerDetection();
		return false;
	};

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.target instanceof HTMLElement && isInput(event.target)) {
			return;
		}

		if (props.scanButtonKeyCode && event.which === props.scanButtonKeyCode) {
			setScanButtonCounter(scanButtonCounter + 1);
			event.preventDefault();
			event.stopImmediatePropagation();
		}

		if (props.onKeyDetect) props.onKeyDetect(event);

		if (props.stopPropagation) event.stopImmediatePropagation();
		if (props.preventDefault) event.preventDefault();

		if (firstCharTime && props.endChar?.indexOf(event.which) !== -1) {
			event.preventDefault();
			event.stopImmediatePropagation();
			setCallIsScanner(true);
		} else if (!firstCharTime && props.startChar?.indexOf(event.which) !== -1) {
			event.preventDefault();
			event.stopImmediatePropagation();
			setCallIsScanner(false);
		} else {
			if (typeof event.which !== "undefined") {
				setStringWriting(`${stringWriting}${String.fromCodePoint(event.which)}`);
			}

			setCallIsScanner(false);
		}

		if (!firstCharTime) setFirstCharTime(Date.now());
		setLastCharTime(Date.now());

		if (testTimer) clearTimeout(testTimer);
		if (callIsScanner) {
			scannerDetectionTest();
			setTestTimer(undefined);
		} else {
			setTestTimer(setTimeout(scannerDetectionTest, props.timeBeforeScanTest));
		}

		if (props.onReceive) props.onReceive(event);
	};

	useEffect(() => {
		window.addEventListener("keypress", handleKeyPress);

		return () => {
			window.removeEventListener("keypress", handleKeyPress);
		};
	}, [handleKeyPress]);

	return null;
}

export default Barcy;
