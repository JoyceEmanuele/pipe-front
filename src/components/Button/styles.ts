import styled from 'styled-components';

import { colors } from '../../styles/colors';

export const Base = styled.button`
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  font-size: 1em;
  font-family: 'Open Sans', sans-serif;
  font-weight: bold;
  outline: none;
  padding: 12px;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
  width: 100%;
`;

export const Primary = styled(Base)`
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  border-radius: 10px;
  background-color: ${colors.Blue300};
  border-color: ${colors.Blue300};

  :hover {
    background-color: ${colors.BlueMenu};
    border-color: ${colors.BlueMenu};
  }
`;

export const Green = styled(Base)`
  color: #01FF9B;
  transition: all 0.3s ease-in-out;
  border-radius: 10px;
  background-color: ${colors.Blue300};
  border-color: ${colors.Blue300};

  :hover {
    background-color: ${colors.BlueMenu};
    border-color: ${colors.BlueMenu};
  }
`;

export const Secondary = styled(Base)`
  background-color: ${colors.White};
  border-color: ${colors.Pink200};
  color: ${colors.Pink200};
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: ${colors.White};
    color: ${colors.Pink300};
    border-color: ${colors.Pink300};
  }
`;

export const BlueWhite = styled(Base)`
  color: #363BC4;
  transition: all 0.3s ease-in-out;
  border-radius: 5px;
  background-color: ${colors.White};
  border-color: #363BC4;

  :hover {
    background-color: #363BC4;
    border-color: #363BC4;
    color: ${colors.White};
  }
`;

export const Disabled = styled(Base)`
  border-radius: 10px;
  background-color: ${colors.Grey100};
  border-color: ${colors.Grey100};
  color: ${colors.White};
  cursor: not-allowed;
`;
export const RedInvert = styled(Base)`
  background-color: ${colors.White};
  border-color: ${colors.White};
  color: ${colors.Red};
  border-radius: 5px;
  &:hover {
    background-color: ${colors.LightRed};
  }
`;

export const Blue = styled(Base)`
  background-color: ${colors.Blue300};
  border-color: ${colors.Blue300};
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: ${colors.Blue400};
    border-color: ${colors.Blue400};
  }
`;

export const BlueInvert = styled(Base)`
  background-color: ${colors.White};
  border-color: ${colors.White};
  color: ${colors.DarkBlue};
  border-radius: 5px;
  &:hover {
    background-color: ${colors.VeryLightBlue};
  }
`;

export const BorderBlue = styled(Base)`
  background-color: ${colors.White};
  border-color: ${colors.Blue300};
  border-width: 2px;
  color: ${colors.Blue300};
  transition: all 0.3s ease-in-out;
  &:hover {
    background-color: ${colors.White};
    border-color: ${colors.Blue300};
  }
`;

export const Red = styled(Base)`
  color: ${colors.White};
  transition: all 0.3s ease-in-out;
  border-radius: 10px;
  background-color: ${colors.RedDark};
  border-color: ${colors.RedDark};

  :hover {
    background-color: ${colors.Red};
    border-color: ${colors.Red};
  }
`;

export const RedInvertWithBorder = styled(Base)`
  background-color: ${colors.White};
  border-color: ${colors.Red};
  color: ${colors.Red};
  border-radius: 10px;
  font-weight: 600;
  &:hover {
    background-color: ${colors.LightRed};
  }
`;
