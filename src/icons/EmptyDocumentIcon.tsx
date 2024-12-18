type EmptyDocumentIconProps = {
  color?: string;
}

export const EmptyDocumentIcon = ({ color = '#818181', ...props }: EmptyDocumentIconProps): JSX.Element => (
  <svg
    width="21"
    height="19"
    viewBox="0 0 21 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14 1L20 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M20 1L14 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8.55556 1.94434H5.53333C3.94652 1.94434 3.15311 1.94434 2.54703 2.25315C2.0139 2.52479 1.58046 2.95824 1.30881 3.49136C1 4.09745 1 4.89085 1 6.47767V13.4666C1 15.0534 1 15.8468 1.30881 16.4529C1.58046 16.986 2.0139 17.4194 2.54703 17.6911C3.15311 17.9999 3.94652 17.9999 5.53333 17.9999H12.5222C14.109 17.9999 14.9024 17.9999 15.5085 17.6911C16.0417 17.4194 16.4751 16.986 16.7467 16.4529C17.0556 15.8468 17.0556 15.0534 17.0556 13.4666V10.4443M10.4444 14.2221H4.77778M12.3333 10.4443H4.77778"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
