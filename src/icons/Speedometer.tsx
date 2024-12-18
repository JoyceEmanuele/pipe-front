import styled from 'styled-components';

import { colors } from '../styles/colors';

type SpeedometerIconProps = {
  percentage?: number;
}

export const SpeedometerIcon = ({ percentage = 100, ...props }: SpeedometerIconProps): JSX.Element => (
  <Container>
    <Chart>
      <Svg {...props} viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M190 100C190 75.0191 179.822 52.4153 163.387 36.109" stroke={colors.Red} strokeWidth="20" />
        <path d="M100 10C124.725 10 147.121 19.9699 163.387 36.1089" stroke={colors.Orange} strokeWidth="20" />
        <path d="M99.9994 10C75.2748 10 52.8788 19.9699 36.6123 36.1089" stroke={colors.Yellow} strokeWidth="20" />
        <path d="M10 100C10 75.0191 20.1778 52.4153 36.6129 36.109" stroke={colors.Green} strokeWidth="20" />
      </Svg>
      <Pointer percentage={percentage * 1.8} />
    </Chart>
    <Percentage percentage={percentage}>
      {percentage}
      {' '}
      %
    </Percentage>
  </Container>
);

const Container = styled.div``;

const Chart = styled.div`
  width: 100%;
  margin-top: 50%;
  padding: 0 40px;
  position: relative;
`;

const Svg = styled.svg`
  width: calc(100% - 80px);
  position: absolute;
  bottom: 0;
`;

const Pointer = styled.span<{ percentage }>`
  width: 20%;
  height: 2px;
  position: absolute;
  left: calc(50% + 1px);
  bottom: 0;
  background-color: ${colors.DarkGrey};
  transform: rotate(${({ percentage }) => (percentage ? `-${percentage}` : 0)}deg);
  transform-origin: bottom left;
  &:before {
    width: 10px;
    height: 10px;
    background-color: ${colors.DarkGrey};
    content: '';
    display: block;
    border-radius: 50%;
    margin: 0;
    padding: 0;
    transform: translateY(-40%);
  }
`;

const Percentage = styled.span<{ percentage }>`
  display: inline-block;
  text-align: center;
  width: 100%;
  font-size: 2em;
  font-weight: bold;
  color: ${({ percentage }) => (percentage <= 25 ? colors.Red : percentage <= 50 ? colors.Orange : percentage <= 75 ? colors.Yellow : colors.Green)};
`;
