type ChillerIconProps = {
  color?: string;
}

export const ChillerIcon = ({ color = '#363BC4', ...props }: ChillerIconProps): JSX.Element => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0.5C11.933 0.5 13.5 2.067 13.5 4L13.5 4.5L2.5 4.5L2.5 4C2.5 2.067 4.067 0.5 6 0.5L10 0.5Z" fill="white" stroke={color} />
    <path d="M10 2.5C10.8284 2.5 11.5 3.17157 11.5 4L11.5 4.5L4.5 4.5L4.5 4C4.5 3.17157 5.17157 2.5 6 2.5L10 2.5Z" fill="white" stroke={color} />
    <rect x="0.5" y="11.5" width="15" height="4" rx="2" stroke={color} />
    <rect x="0.5" y="4.5" width="15" height="5" rx="2.5" stroke={color} />
    <rect x="13.5" y="6.5" width="7" height="5" rx="1.5" transform="rotate(90 13.5 6.5)" fill="white" stroke={color} />
    <rect x="17.5" y="6.5" width="2" height="2" rx="0.5" transform="rotate(90 17.5 6.5)" fill="white" stroke={color} />
    <rect x="4.5" y="9.5" width="2" height="2" rx="0.5" transform="rotate(90 4.5 9.5)" fill="white" stroke={color} />
    <rect x="9.5" y="0.5" width="2" height="3" rx="0.5" transform="rotate(90 9.5 0.5)" fill="white" stroke={color} />
    <rect x="17.5" y="12.5" width="2" height="2" rx="0.5" transform="rotate(90 17.5 12.5)" fill="white" stroke={color} />
    <path d="M3 17L5 17" stroke={color} strokeLinecap="round" />
    <path d="M4 16L4 17" stroke={color} strokeLinecap="round" />
    <path d="M11 17L13 17" stroke={color} strokeLinecap="round" />
    <path d="M12 16L12 17" stroke={color} strokeLinecap="round" />
  </svg>
);
