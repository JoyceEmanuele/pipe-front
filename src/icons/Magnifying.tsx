import styled from 'styled-components';

type MagnifyingIconProps = {
  color?: string;
}

export const MagnifyingIcon = ({ color, ...props }: MagnifyingIconProps): JSX.Element => (
  <svg {...props} viewBox="0 0 4.57 4.6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <CCircle color={color} cx="1.9777497" cy="2.0282097" r="1.2724873" />
    <CPath color={color} d="M 4.3649278,4.4384075 2.8656333,2.9391123" />
  </svg>
);

const CCircle = styled.circle`
  fill: none;
  fill-opacity: 1;
  stroke: ${({ color }) => color || '#000000'};
  stroke-width: 0.44591081;
  stroke-miterlimit: 4;
  stroke-dasharray: none;
  stroke-opacity: 1;
`;
const CPath = styled.path`
  fill: none;
  stroke: ${({ color }) => color || '#000000'};
  stroke-width: 0.44591081;
  stroke-linecap: butt;
  stroke-linejoin: miter;
  stroke-miterlimit: 4;
  stroke-dasharray: none;
  stroke-opacity: 1;
`;
