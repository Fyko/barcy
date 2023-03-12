export const appThemeNames = ["dark"] as const;

export type AppTheme = {
	colors: {
		accent: string;
		alternateBackground: string;
		background: string;
		inputBackground: string;
		text: string;
	};
};

export const appTheme: AppTheme = {
	colors: {
		background: "var(--bg)",
		text: "var(--text)",
		alternateBackground: "var(--alt-bg)",
		accent: "var(--accent)",
		inputBackground: "var(--input-bg)",
	},
};
