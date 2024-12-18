type TTrashSample = {
  color?: string
}

export function TrashSample({ color }: TTrashSample) {
  let ColorChose = '#363BC4';
  if (color) {
    ColorChose = color;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="13"
      fill="none"
      viewBox="0 0 10 13"
    >
      <g>
        <g>
          <rect
            width="7"
            height="9"
            x="1.5"
            y="3.5"
            stroke="red"
            rx="0.5"
          />
          <rect
            width="7"
            height="9"
            x="1.5"
            y="3.5"
            stroke="#000"
            strokeOpacity="0.2"
            rx="0.5"
          />
        </g>
        <path stroke="#C00" d="M0 1.5h10" />
        <path stroke="#C00" d="M3 0.5L7 0.5" />
      </g>
    </svg>
  );
}

export default TrashSample;
