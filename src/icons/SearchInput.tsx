type SearchInputIconProps = {
  color?: string;
}

export const SearchInputIcon = ({ color }: SearchInputIconProps): JSX.Element => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 13.5L10.377 10.377M11.9399 6.46995C11.9399 9.49091 9.49091 11.9399 6.46995 11.9399C3.44898 11.9399 1 9.49091 1 6.46995C1 3.44898 3.44898 1 6.46995 1C9.49091 1 11.9399 3.44898 11.9399 6.46995Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 11L13.5 13.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
