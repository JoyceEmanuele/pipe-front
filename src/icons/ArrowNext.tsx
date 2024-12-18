type ArrowNextIconProps = {
  color?: string;
}

export const ArrowNextIcon = ({ color }: ArrowNextIconProps): JSX.Element => (
  <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.17578 2.63392C6.84245 3.01882 6.84245 3.98107 6.17578 4.36597L2.42578 6.53103C1.75912 6.91593 0.925781 6.43481 0.925781 5.66501L0.925782 1.33488C0.925782 0.565079 1.75912 0.0839559 2.42578 0.468856L6.17578 2.63392Z" fill={color || 'black'} />
  </svg>
);
