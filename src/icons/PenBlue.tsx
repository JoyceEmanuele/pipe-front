type TPenBlue = {
  color?: string
}

export function PenBlue({ color }: TPenBlue) {
  let ColorChose = '#363BC4';
  if (color) {
    ColorChose = color;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
    >
      <g>
        <g fill={ColorChose}>
          <path d="M12.285 6.289a.559.559 0 01-.407-.176L7.632 1.725a.604.604 0 01.006-.831.565.565 0 01.805-.009l4.248 4.39a.614.614 0 01.121.646.592.592 0 01-.21.266.563.563 0 01-.317.102z" />
          <path d="M.574 14a.574.574 0 01-.554-.437.615.615 0 01-.002-.303l.712-2.877a.608.608 0 01.15-.272L10.496.172a.57.57 0 01.813 0l2.067 2.136a.608.608 0 010 .84l-9.613 9.943a.58.58 0 01-.265.154l-2.783.736A.59.59 0 01.574 14zm1.228-3.166l-.425 1.742 1.693-.446 9.101-9.397-1.268-1.31-9.1 9.411z" />
        </g>
      </g>
    </svg>
  );
}

export default PenBlue;
