import { colors } from '../styles/colors';

type TermometerIconProps = {
  variant?: string;
  width?: string;
  color?: string;
  children?: string;
}

export const TermometerIcon = ({
  variant, width = '24px', color = colors.Grey400, ...props
}: TermometerIconProps): JSX.Element => {
  switch (variant) {
    case 'primary':
      return (
        <svg {...props} width={width} height={width} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 22C10.9506 22 9.92778 21.6698 9.07645 21.0562C8.22512 20.4426 7.58844 19.5767 7.25658 18.5811C6.92473 17.5856 6.91453 16.5108 7.22743 15.5092C7.54033 14.5075 8.16047 13.6296 9 13V5C9 4.20435 9.31607 3.44129 9.87868 2.87868C10.4413 2.31607 11.2044 2 12 2C12.7956 2 13.5587 2.31607 14.1213 2.87868C14.6839 3.44129 15 4.20435 15 5V13C15.8395 13.6296 16.4597 14.5075 16.7726 15.5092C17.0855 16.5108 17.0753 17.5856 16.7434 18.5811C16.4116 19.5767 15.7749 20.4426 14.9236 21.0562C14.0722 21.6698 13.0494 22 12 22ZM13 9.54V5C13.0021 4.87117 12.9774 4.74332 12.9275 4.62454C12.8776 4.50576 12.8035 4.39865 12.71 4.31C12.6182 4.2137 12.5082 4.13668 12.3862 4.08345C12.2643 4.03022 12.133 4.00185 12 4C11.7348 4 11.4804 4.10536 11.2929 4.29289C11.1054 4.48043 11 4.73478 11 5V9.54H13Z"
            fill={color}
          />
        </svg>
      );
    default:
      return (
        <svg {...props} width={width} height={width} viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 15C10 17.76 7.76 20 5 20C2.24 20 0 17.76 0 15C0 13.36 0.79 11.91 2 11V3C2 1.34 3.34 0 5 0C6.66 0 8 1.34 8 3V11C9.21 11.91 10 13.36 10 15ZM4 6V12.17C2.83 12.58 2 13.69 2 15C2 16.66 3.34 18 5 18C6.66 18 8 16.66 8 15C8 13.69 7.17 12.58 6 12.17V6H4Z"
            fill={color}
          />
        </svg>
      );
  }
};
