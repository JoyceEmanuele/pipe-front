type DeactivateUserIconProps = {
  colors?: string;
  size?: string;
}

export const DeactivateUserIcon = ({ colors, size, ...props }: DeactivateUserIconProps): JSX.Element => (
  <svg {...props} width={size || '18'} height={size || '18'} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.86 8.9625C10.9875 8.9775 11.115 9 11.25 9C12.9075 9 14.25 7.6575 14.25 6C14.25 4.3425 12.9075 3 11.25 3C9.5925 3 8.25 4.3425 8.25 6C8.25 6.135 8.2725 6.2625 8.2875 6.39L10.86 8.9625ZM12.5175 10.62L16.8975 15H17.25V13.5C17.25 11.895 14.58 10.875 12.5175 10.62ZM3 5.34L6.66 9L8.5425 10.8825C6.8925 11.3325 5.25 12.225 5.25 13.5V15H12.66L15.66 18L16.7175 16.9425L4.0575 4.2825L3 5.34Z" fill={colors || '#E00030'} />
  </svg>

);
