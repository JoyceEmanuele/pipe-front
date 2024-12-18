type CompleteListProps = {
  color?: string;
  width?: string;
};

export const CompleteListIcon = ({ width, color, ...props }: CompleteListProps): JSX.Element => (
  <svg
    {...props}
    width={width || '20'}
    height="16"
    viewBox="0 0 20 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >

    <path fillRule="evenodd" clipRule="evenodd" d="M0 0H20V15.7576H0V0ZM1.21208 3.03027H9.09087V6.06058H1.21208V3.03027ZM9.09087 7.27279H1.21208V10.3031H9.09087V7.27279ZM1.21208 11.5153H9.09087V14.5456H1.21208V11.5153ZM18.7878 3.03027H10.909V6.06058H18.7878V3.03027ZM10.909 7.27279H18.7878V10.3031H10.909V7.27279ZM18.7878 11.5153H10.909V14.5456H18.7878V11.5153Z" fill={color || '#363BC4'} />
  </svg>
);
