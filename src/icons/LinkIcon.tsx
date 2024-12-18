type LinkIconProps = {
    color?: string;
    height?: string;
    width?: string;
  };

export const LinkIcon = ({ color, height, width }: LinkIconProps): JSX.Element => (
  <svg width={width || '12'} height={height || '12'} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4.33333L11 1M11 1H7.66667M11 1L6.55556 5.44444M4.88889 2.11111H3.66667C2.73325 2.11111 2.26654 2.11111 1.91002 2.29277C1.59641 2.45256 1.34144 2.70752 1.18166 3.02113C1 3.37765 1 3.84436 1 4.77778V8.33333C1 9.26675 1 9.73347 1.18166 10.09C1.34144 10.4036 1.59641 10.6586 1.91002 10.8183C2.26654 11 2.73325 11 3.66667 11H7.22222C8.15564 11 8.62235 11 8.97887 10.8183C9.29248 10.6586 9.54744 10.4036 9.70723 10.09C9.88889 9.73347 9.88889 9.26675 9.88889 8.33333V7.11111" stroke={color || '#363BC4'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
