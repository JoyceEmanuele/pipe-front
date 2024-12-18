type EvapIconProps = {
  color?: string;
};

export const EvapReturnIcon = ({
  color = '#373737',
  ...props
}: EvapIconProps): JSX.Element => (
  <svg {...props} width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.092 10.3158H2.74994C2.24852 10.3158 1.84204 10.7223 1.84204 11.2237V18.4868C1.84204 18.9883 2.24852 19.3947 2.74994 19.3947H19.092C19.5935 19.3947 19.9999 18.9883 19.9999 18.4868V11.2237C19.9999 10.7223 19.5935 10.3158 19.092 10.3158Z" stroke={color} strokeWidth="1.81579" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.5526 12.7368H16.3684M10.921 1.8421V5.77631M6.0789 2.75V4.86842M15.7631 2.75V4.86842M5.47363 15.4605H16.3684V19.0921H5.47363V15.4605Z" stroke={color} strokeWidth="1.81579" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.0954 7.71342C11.0002 7.8124 10.8417 7.8124 10.7465 7.71342L8.69458 5.581C8.54658 5.42719 8.65558 5.17103 8.86904 5.17103L12.9729 5.17103C13.1863 5.17103 13.2953 5.42719 13.1473 5.581L11.0954 7.71342Z" fill={color} />
  </svg>
);

export const EvapInsufIcon = ({
  color = '#373737',
  ...props
}: EvapIconProps): JSX.Element => (
  <svg {...props} width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.25 1.8421H1.90789C1.40648 1.8421 1 2.24858 1 2.75V10.0132C1 10.5146 1.40648 10.921 1.90789 10.921H18.25C18.7514 10.921 19.1579 10.5146 19.1579 10.0132V2.75C19.1579 2.24858 18.7514 1.8421 18.25 1.8421Z" stroke={color} strokeWidth="1.81579" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.7105 4.5658H15.5263M10.079 13.6447V17.579M5.23685 14.5526V16.6711M14.9211 14.5526V16.6711M4.63159 7.28948H15.5263V10.9211H4.63159V7.28948Z" stroke={color} strokeWidth="1.81579" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.2534 19.8187C10.1581 19.9177 9.9997 19.9177 9.90445 19.8187L7.85254 17.6863C7.70454 17.5325 7.81354 17.2763 8.027 17.2763L12.1308 17.2763C12.3443 17.2763 12.4533 17.5325 12.3053 17.6863L10.2534 19.8187Z" fill={color} />
  </svg>

);
