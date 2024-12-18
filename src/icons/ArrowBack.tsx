type ArrowBackIconProps = {
  color?: string;
}

export const ArrowBackIcon = ({ color }: ArrowBackIconProps): JSX.Element => (
  <svg width="6" height="7" viewBox="0 0 6 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.499999 4.04258C-0.166668 3.65768 -0.166666 2.69543 0.500001 2.31053L4.25 0.145473C4.91667 -0.239427 5.75 0.241697 5.75 1.0115L5.75 5.34163C5.75 6.11143 4.91667 6.59255 4.25 6.20765L0.499999 4.04258Z" fill={color || 'black'} />
  </svg>
);
