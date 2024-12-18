type ExitButtonProps = {
    colors?: string;
  }

export const ExitButtonIcon = ({ colors = 'white' }: ExitButtonProps): JSX.Element => (
  <svg width="52" height="50" viewBox="0 0 41 39" fill={colors} xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_12110_16329)">
      <rect x="4" y="1" width="33" height="31" rx="10" fill="white" />
      <rect x="3.6" y="0.6" width="33.8" height="31.8" rx="10.4" stroke="#868686" strokeOpacity="0.31" strokeWidth="0.8" />
      <path d="M16 12L26 22" stroke="#363BC4" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 12L16 22" stroke="#363BC4" strokeWidth="2" strokeLinecap="round" />
    </g>
    <defs>
      <filter id="filter0_d_12110_16329" x="0.200195" y="0.199951" width="40.5996" height="38.6001" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="3" />
        <feGaussianBlur stdDeviation="1.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_12110_16329" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_12110_16329" result="shape" />
      </filter>
    </defs>
  </svg>
);
