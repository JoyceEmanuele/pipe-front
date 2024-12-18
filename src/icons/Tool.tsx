type ToolIconProps = {
  color?: string;
  width?: string;
}

export const ToolIcon = ({ color, width = '18px', ...props }: ToolIconProps): JSX.Element => (
  <svg {...props} width={width} height={width} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4.47624 4.86637L8.60124 8.99137M4.47624 4.86637H1.72624L0.80957 2.11637L1.72624 1.19971L4.47624 2.11637V4.86637ZM16.6303 1.87897L14.2217 4.28762C13.8586 4.65063 13.6771 4.83214 13.6091 5.04144C13.5493 5.22555 13.5493 5.42387 13.6091 5.60797C13.6771 5.81727 13.8586 5.99878 14.2217 6.3618L14.4391 6.57928C14.8022 6.9423 14.9837 7.12381 15.193 7.19181C15.3771 7.25163 15.5754 7.25163 15.7595 7.19181C15.9688 7.12381 16.1503 6.9423 16.5133 6.57928L18.7664 4.3262C19.0091 4.91668 19.1429 5.5634 19.1429 6.24137C19.1429 9.02581 16.8857 11.283 14.1012 11.283C13.7655 11.283 13.4375 11.2502 13.1202 11.1876C12.6745 11.0998 12.4517 11.0558 12.3167 11.0693C12.1731 11.0836 12.1023 11.1051 11.975 11.1732C11.8554 11.2373 11.7353 11.3573 11.4952 11.5974L4.93457 18.158C4.17518 18.9174 2.94396 18.9174 2.18457 18.158C1.42518 17.3986 1.42518 16.1674 2.18457 15.408L8.74518 8.84743C8.98529 8.60731 9.10535 8.48726 9.1694 8.36757C9.23749 8.24033 9.25903 8.16955 9.27333 8.02595C9.28679 7.89087 9.24285 7.66806 9.15496 7.22243C9.09238 6.90509 9.05957 6.57706 9.05957 6.24137C9.05957 3.45694 11.3168 1.19971 14.1012 1.19971C15.0229 1.19971 15.8869 1.44704 16.6303 1.87897ZM9.97628 13.1163L15.0179 18.1579C15.7773 18.9173 17.0085 18.9173 17.7679 18.1579C18.5273 17.3985 18.5273 16.1673 17.7679 15.4079L13.6203 11.2604C13.3267 11.2326 13.0404 11.1796 12.7636 11.1037C12.407 11.0058 12.0158 11.0768 11.7543 11.3383L9.97628 13.1163Z"
      stroke={color || 'black'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);