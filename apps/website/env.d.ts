import "styled-components";
import { type AppTheme } from "./src/core/app-themes";

declare module "styled-components" {
	export type DefaultTheme = AppTheme & {};
}
