type ExportWorksheetProps = {
    color?: string;
  }

export const ExportWorksheetIcon = ({ color, ...props }: ExportWorksheetProps): JSX.Element => (
  <svg width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.26505 7.1H1.26984V8.9H7.26505V7.1ZM14.7302 8.9H8.73489V7.1H14.7302V8.9ZM8.73489 10.1H14.7302V12.1905H8.73489V10.1ZM1.26984 10.1H7.26505V12.1905H1.26984V10.1ZM1.26984 5.9H7.26505V3.55556H1.26984V5.9ZM14.7302 5.9H8.73489V3.55556H14.7302V5.9ZM16 3.55556V12.1905C16 12.8918 15.4315 13.4603 14.7302 13.4603H1.26984C0.568527 13.4603 0 12.8918 0 12.1905V3.55556V1.26984V0H1.26984H14.7302H16V1.26984V3.55556Z"
      fill={color || 'currentColor'}
    />
  </svg>
);
