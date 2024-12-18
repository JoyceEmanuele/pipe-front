type ThunderIconProps = {
    color?: string;
  }

export const ThunderIcon = ({ color, ...props }: ThunderIconProps): JSX.Element => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 3C0 1.34315 1.34315 0 3 0H17C18.6569 0 20 1.34315 20 3V17C20 18.6569 18.6569 20 17 20H3C1.34315 20 0 18.6569 0 17V3Z"
      fill={color || '#4B4B4B'}
    />
    <path
      d="M9.3887 15.2461C9.33489 15.246 9.28148 15.2367 9.23083 15.2185C9.13516 15.1841 9.05357 15.1189 8.99878 15.0333C8.94399 14.9476 8.91908 14.8462 8.92793 14.7449L9.24919 11.3029H6.4497C6.36661 11.3013 6.28553 11.277 6.21512 11.2329C6.14471 11.1887 6.08761 11.1263 6.04992 11.0522C6.01222 10.9782 5.99535 10.8953 6.0011 10.8123C6.00685 10.7294 6.035 10.6496 6.08256 10.5815L10.235 4.6117C10.2929 4.52861 10.3767 4.46703 10.4733 4.43655C10.5699 4.40607 10.6739 4.40841 10.769 4.44319C10.8641 4.47798 10.9451 4.54325 10.9992 4.62885C11.0534 4.71445 11.0777 4.81557 11.0684 4.91643L10.7471 8.35291H13.5503C13.6334 8.35458 13.7145 8.37879 13.7849 8.42294C13.8553 8.46709 13.9124 8.52953 13.9501 8.6036C13.9878 8.67767 14.0046 8.76058 13.9989 8.84349C13.9932 8.9264 13.965 9.00619 13.9174 9.07435L9.76503 15.0496C9.72264 15.1102 9.66633 15.1596 9.60083 15.1938C9.53534 15.228 9.46258 15.2459 9.3887 15.2461ZM7.32902 10.3851H9.75768C9.82154 10.3853 9.88464 10.3988 9.94296 10.4248C10.0013 10.4508 10.0535 10.4887 10.0964 10.536C10.1392 10.5834 10.1717 10.6391 10.1918 10.6997C10.2119 10.7604 10.2191 10.8245 10.2129 10.8881L10.0055 13.0909L12.671 9.27077H10.2442C10.1802 9.27085 10.1169 9.25749 10.0584 9.23156C9.99986 9.20563 9.94746 9.16771 9.90454 9.12024C9.86123 9.07347 9.82835 9.01801 9.8081 8.95757C9.78784 8.89712 9.78067 8.83305 9.78706 8.76962L9.99266 6.56675L7.32902 10.3851Z"
      fill={color || 'white'}
    />
  </svg>
);
