export const Seta = ({ color }: { color?: string }) => (
  <svg
    className="icon_seta"
    xmlns="http://www.w3.org/2000/svg"
    width="5"
    height="6"
    fill="none"
    viewBox="0 0 5 6"
  >
    <path
      fill={color || '#C2C2C2'}
      d="M4.5 2.134a1 1 0 010 1.732l-3 1.732A1 1 0 010 4.732V1.268A1 1 0 011.5.402l3 1.732z"
    />
  </svg>
);
