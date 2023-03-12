// TODO: handle iframe
import { observable } from "@legendapp/state";
import { useEffect } from "react";

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
	onError?: (scannedString: string, error: string) => void;
	/**
	 * Callback after detecting a keyDown (key char in parameter) - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!
	 */
	onKeyDetect?: (event: KeyboardEvent) => void;
	/**
	 * Callback after receiving and processing a char (scanned char in parameter)
	 */
	onReceive?: (event: KeyboardEvent) => void;
	/**
	 * Callback after detection of a successfull scanning (scanned string in parameter)
	 */
	onScan?: (scannedString: string, count: number) => void;
	/**
	 * Callback after detection of a successfull scan while the scan button was pressed and held down
	 */
	onScanButtonLongPressed?: (scannedString: string, count: number) => void;
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

const defaultProps = {
	avgTimeByChar: 30,
	endChar: [9, 13],
	minLength: 6,
	scanButtonLongPressThreshold: 3,
	stopPropagation: false,
	preventDefault: false,
	timeBeforeScanTest: 100,
} as const;

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
	const {
		avgTimeByChar,
		endChar,
		minLength,
		onError,
		onKeyDetect,
		onReceive,
		onScan,
		onScanButtonLongPressed,
		preventDefault,
		scanButtonKeyCode,
		scanButtonLongPressThreshold,
		startChar,
		stopPropagation,
		timeBeforeScanTest,
	} = { ...defaultProps, ..._props } as BarcyProps;

	const state = observable({
		firstCharTime: 0,
		lastCharTime: 0,
		stringWriting: "",
		callIsScanner: false,
		testTimer: undefined as number | undefined,
		scanButtonCounter: 0,
	});

	useEffect(() => {
		const initScannerDetection = () => {
			state.firstCharTime.set(0);
			state.stringWriting.set("");
			state.scanButtonCounter.set(0);
		};

		const scannerDetectionTest = (str?: string) => {
			if (str) {
				state.stringWriting.set(str);
				state.firstCharTime.set(0);
				state.lastCharTime.set(0);
			}

			if (!state.scanButtonCounter.get()) state.scanButtonCounter.set(1);

			// If all condition are good (length, time...), call the callback and re-initialize the plugin for next scanning
			// Else, just re-initialize
			if (state.stringWriting.get().length >= minLength && state.lastCharTime.get() - state.firstCharTime.get() < state.stringWriting.get().length * avgTimeByChar) {
				if (state.scanButtonCounter.get() > scanButtonLongPressThreshold)
					onScanButtonLongPressed?.(state.stringWriting.get(), state.scanButtonCounter.get());
				else onScan?.(state.stringWriting.get(), state.scanButtonCounter.get());

				initScannerDetection();
				return true;
			}

			let errorMsg = "";
			if (state.stringWriting.get().length < minLength) {
				errorMsg = `String length should be greater or equal ${minLength}`;
			} else if (state.lastCharTime.get() - state.firstCharTime.get() > state.stringWriting.get().length * avgTimeByChar) {
				errorMsg = `Average key character time should be less or equal ${avgTimeByChar}ms`;
			}

			onError?.(state.stringWriting.get(), errorMsg);

			initScannerDetection();
			return false;
		};

		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLElement && isInput(event.target)) {
				return;
			}

			if (scanButtonKeyCode && event.charCode === scanButtonKeyCode) {
				state.scanButtonCounter.set(state.scanButtonCounter.get() + 1);
				event.preventDefault();
				event.stopImmediatePropagation();
			}

			onKeyDetect?.(event);

			if (stopPropagation) event.stopImmediatePropagation();
			if (preventDefault) event.preventDefault();

			if (state.firstCharTime.get() && endChar.includes(event.charCode)) {
				event.preventDefault();
				event.stopImmediatePropagation();
				state.callIsScanner.set(true);
			} else if (!state.firstCharTime.get() && startChar?.includes(event.charCode)) {
				event.preventDefault();
				event.stopImmediatePropagation();
				state.callIsScanner.set(false);
			} else {
				if (typeof event.charCode !== "undefined") {
					state.stringWriting.set(`${state.stringWriting.get()}${String.fromCodePoint(event.charCode)}`);
				}

				state.callIsScanner.set(false);
			}

			if (!state.firstCharTime.get()) state.firstCharTime.set(Date.now());
			state.lastCharTime.set(Date.now());

			if (state.testTimer.get()) window.clearTimeout(state.testTimer.get());
			if (state.callIsScanner.get()) {
				scannerDetectionTest();
				state.testTimer.set(undefined);
			} else {
				state.testTimer.set(window.setTimeout(scannerDetectionTest, timeBeforeScanTest));
			}

			onReceive?.(event);
		};

		window.addEventListener("keypress", handleKeyPress);

		return () => {
			window.removeEventListener("keypress", handleKeyPress);
		};
	}, [
		avgTimeByChar,
		minLength,
		onError,
		onScan,
		onScanButtonLongPressed,
		scanButtonLongPressThreshold,
		endChar,
		onKeyDetect,
		onReceive,
		preventDefault,
		scanButtonKeyCode,
		startChar,
		stopPropagation,
		timeBeforeScanTest,
		state
	]);

	return null;
}

export default Barcy;
