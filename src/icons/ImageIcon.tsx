type ImageIconProps = {
  color?: string;
};

export const ImageIcon = ({
  color = '#363BC4',
  ...props
}: ImageIconProps): JSX.Element => (
  <svg
    width="29"
    height="27"
    viewBox="0 0 29 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4.06733 24.9327L12.9727 16.0273C13.5073 15.4927 13.7746 15.2254 14.0828 15.1253C14.354 15.0372 14.646 15.0372 14.9172 15.1253C15.2254 15.2254 15.4927 15.4927 16.0274 16.0273L24.8733 24.8733M17.2 17.2L21.0727 13.3273C21.6073 12.7927 21.8746 12.5254 22.1828 12.4253C22.454 12.3372 22.746 12.3372 23.0172 12.4253C23.3254 12.5254 23.5927 12.7927 24.1274 13.3273L28 17.2M11.8 9.1C11.8 10.5912 10.5912 11.8 9.1 11.8C7.60883 11.8 6.4 10.5912 6.4 9.1C6.4 7.60883 7.60883 6.4 9.1 6.4C10.5912 6.4 11.8 7.60883 11.8 9.1ZM7.48 25.3H21.52C23.7882 25.3 24.9223 25.3 25.7887 24.8586C26.5507 24.4703 27.1703 23.8507 27.5586 23.0887C28 22.2223 28 21.0882 28 18.82V7.48C28 5.21179 28 4.07768 27.5586 3.21134C27.1703 2.44928 26.5507 1.82971 25.7887 1.44142C24.9223 1 23.7882 1 21.52 1H7.48C5.21179 1 4.07768 1 3.21134 1.44142C2.44928 1.82971 1.82971 2.44928 1.44142 3.21134C1 4.07768 1 5.21179 1 7.48V18.82C1 21.0882 1 22.2223 1.44142 23.0887C1.82971 23.8507 2.44928 24.4703 3.21134 24.8586C4.07768 25.3 5.21179 25.3 7.48 25.3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);