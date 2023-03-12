import styled from "styled-components";
import { Code } from "../components/icons";

export const StyledNavbar = styled.div`
	@media only screen and (max-width: 600px) {
		text-align: center;
	}

	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 10px;

	a {
		padding: 10px;
		text-decoration: none;
		font-weight: 600;
		display: inline-flex;
		color: ${(props) => props.theme.colors.text};
		align-items: center;
		transition: 100ms ease-out;
		margin: 0 10px;
		opacity: 0.6;

		&:hover {
			color: ${(props) => props.theme.colors.text};
			opacity: 1;
		}

		svg {
			height: 18px;
			width: 18px;
			margin-right: 10px;
		}
	}
`;

export function Navbar() {
	return (
		<StyledNavbar>
			<a href="https://github.com/Fyko/barcy">
				<Code /> GitHub
			</a>
		</StyledNavbar>
	);
}
