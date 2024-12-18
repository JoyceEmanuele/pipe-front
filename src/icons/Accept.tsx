import styled from 'styled-components';

type AcceptIconProps = {
  color?: string;
}

export const AcceptIcon = ({ color, ...props }: AcceptIconProps): JSX.Element => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <CPath color={color} d="M 14,18 26,6 30,10 14,26 4,16 8,12 z" />
  </svg>
);

const CPath = styled.path`
  fill:${({ color }) => (color || '#000000')};
  fill-opacity:1;
  stroke:${({ color }) => (color || '#000000')};
  stroke-width:0.44591081;
  stroke-linecap:butt;
  stroke-linejoin:miter;
  stroke-miterlimit:4;
  stroke-dasharray:none;
  stroke-opacity:1;
`;
