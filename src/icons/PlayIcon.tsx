type IconProps = {
  color?: string;
}

export const PlayIcon = ({ color = '#363BC4', ...props }: IconProps) => (

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 11A5 5 0 1 0 6 1a5 5 0 0 0 0 10Z"
    />
    <path
      stroke="#363BC4"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.75 4.483c0-.239 0-.358.05-.425a.25.25 0 0 1 .182-.1c.083-.005.184.06.384.188l2.36 1.518c.175.112.262.168.292.239a.25.25 0 0 1 0 .194c-.03.071-.117.127-.291.24l-2.36 1.517c-.201.129-.302.193-.385.187a.25.25 0 0 1-.182-.1c-.05-.066-.05-.185-.05-.424V4.483Z"
    />
  </svg>
);
