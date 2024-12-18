type ReactivateUserIconProps = {
  colors?: string;
  size?: string;
}

export const ReactivateUserIcon = ({ colors, size, ...props }: ReactivateUserIconProps): JSX.Element => (
  <svg {...props} width={size || '16'} height={size || '16'} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.6 5.6H11.6L13.088 4.112C11.92 2.584 10.072 1.6 8 1.6C4.464 1.6 1.6 4.464 1.6 8C1.6 9.464 2.088 10.8 2.912 11.88C3.888 10.76 5.72 10 8 10C10.28 10 12.12 10.76 13.088 11.88C13.912 10.8 14.4 9.464 14.4 8H16C16 12.4 12.4 16 8 16C3.6 16 0 12.4 0 8C0 3.6 3.6 0 8 0C10.512 0 12.76 1.16 14.224 2.976L15.6 1.6V5.6ZM8 4C9.328 4 10.4 5.072 10.4 6.4C10.4 7.728 9.328 8.8 8 8.8C6.672 8.8 5.6 7.728 5.6 6.4C5.6 5.072 6.672 4 8 4Z" fill={colors || '#363BC4'} />
  </svg>
);
