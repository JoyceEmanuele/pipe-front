type SubCoolingIconProps = {
  color?: string;
}

export const SubCoolingIcon = ({ color, ...props }: SubCoolingIconProps): JSX.Element => (
  <svg {...props} width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.025 0.299988L2.325 5.89999C-0.775 8.99999 -0.775 14.1 2.325 17.2C3.925 18.8 5.925 19.5 8.025 19.5C10.125 19.5 12.125 18.7 13.725 17.2C16.825 14.1 16.825 8.99999 13.725 5.89999L8.025 0.299988ZM12.225 15.8C11.125 16.9 9.625 17.6 8.025 17.6C6.425 17.6 4.925 17 3.825 15.8C2.625 14.7 2.025 13.2 2.025 11.6C2.025 9.99999 2.625 8.49999 3.825 7.39999L8.025 3.09999L12.225 7.39999C13.325 8.49999 14.025 9.99999 14.025 11.6C14.025 13.2 13.425 14.7 12.225 15.8Z"
      fill={color || '#5d5d5d'}
    />
  </svg>
);