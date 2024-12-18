import { colors } from '../styles/colors';

type TrashIconProps = {
  color?: string;
  width?: string;
}

export const TrashIcon = ({ width = '24px', color = colors.Grey400, ...props }: TrashIconProps): JSX.Element => (
  <svg {...props} width={width} height={width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 5.99997H16V4.32997C15.9765 3.68979 15.7002 3.08503 15.2316 2.64827C14.7629 2.2115 14.1402 1.97837 13.5 1.99997H10.5C9.85975 1.97837 9.23706 2.2115 8.76843 2.64827C8.2998 3.08503 8.02346 3.68979 8 4.32997V5.99997H3C2.73478 5.99997 2.48043 6.10533 2.29289 6.29287C2.10536 6.4804 2 6.73476 2 6.99997C2 7.26519 2.10536 7.51955 2.29289 7.70708C2.48043 7.89462 2.73478 7.99997 3 7.99997H4V19C4 19.7956 4.31607 20.5587 4.87868 21.1213C5.44129 21.6839 6.20435 22 7 22H17C17.7956 22 18.5587 21.6839 19.1213 21.1213C19.6839 20.5587 20 19.7956 20 19V7.99997H21C21.2652 7.99997 21.5196 7.89462 21.7071 7.70708C21.8946 7.51955 22 7.26519 22 6.99997C22 6.73476 21.8946 6.4804 21.7071 6.29287C21.5196 6.10533 21.2652 5.99997 21 5.99997ZM10 4.32997C10 4.16997 10.21 3.99997 10.5 3.99997H13.5C13.79 3.99997 14 4.16997 14 4.32997V5.99997H10V4.32997Z"
      fill={color}
    />
  </svg>
);

export const SmallTrashIcon = ({
  width = '20px', color = 'black', ...props
}: TrashIconProps): JSX.Element => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" height={width} viewBox="0 0 16 18" fill="none">
    <path d="M11.1111 4.11111V3.48889C11.1111 2.6177 11.1111 2.1821 10.9416 1.84935C10.7924 1.55665 10.5545 1.31868 10.2618 1.16955C9.92901 1 9.49342 1 8.62222 1H7.37778C6.50658 1 6.07099 1 5.73824 1.16955C5.44554 1.31868 5.20757 1.55665 5.05843 1.84935C4.88889 2.1821 4.88889 2.6177 4.88889 3.48889V4.11111M6.44444 8.38889V12.2778M9.55556 8.38889V12.2778M1 4.11111H15M13.4444 4.11111V12.8222C13.4444 14.129 13.4444 14.7824 13.1901 15.2815C12.9664 15.7206 12.6095 16.0775 12.1704 16.3012C11.6713 16.5556 11.0179 16.5556 9.71111 16.5556H6.28889C4.9821 16.5556 4.32871 16.5556 3.82958 16.3012C3.39053 16.0775 3.03358 15.7206 2.80987 15.2815C2.55556 14.7824 2.55556 14.129 2.55556 12.8222V4.11111" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
