type eyesOpen = {
  color?: string
  style?: React.CSSProperties;
}

function OlhoAberto({ color, style }: eyesOpen) {
  let ColorChose = '#363BC4';
  if (color) {
    ColorChose = color;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="16"
      fill="none"
      viewBox="0 0 22 16"
      style={style}
    >
      <path
        stroke={ColorChose}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1.42 8.713c-.136-.215-.204-.323-.242-.49a1.173 1.173 0 010-.446c.038-.167.106-.275.242-.49C2.546 5.505 5.895 1 11 1s8.455 4.505 9.58 6.287c.137.215.205.323.243.49.029.125.029.321 0 .446-.038.167-.106.275-.242.49C19.455 10.495 16.105 15 11 15c-5.106 0-8.455-4.505-9.58-6.287z"
      />
      <path
        stroke={ColorChose}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 11a3 3 0 100-6 3 3 0 000 6z"
      />
    </svg>
  );
}

export default OlhoAberto;
