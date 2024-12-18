export const CloseIcon = ({
  onClick,
}: {
  onClick?: () => void;
}): JSX.Element => (
  <svg
    width="12"
    height="17"
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <path
      d="M1 1L15.5 15.5"
      stroke="#686868"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15.5 1L1 15.5"
      stroke="#686868"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
