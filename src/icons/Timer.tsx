type TimerIconProps = {
  color?: string;
}

export const TimerIcon = ({ color, ...props }: TimerIconProps): JSX.Element => (
  <svg {...props} width="150" height="167" viewBox="0 0 150 167" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M131.452 44.4436L136.29 49.2919L150 35.5548L136.29 21.8177L122.581 35.5548L127.419 40.4032L120.968 46.8677C111.828 38.5177 100.269 32.5919 87.3656 30.4371V20.471H101.075V0H49.4624V20.471H62.9032V30.4371C50 32.8613 38.4409 38.7871 29.3011 47.4065L22.3118 40.4032L27.1505 35.5548L13.7097 21.8177L0 35.5548L13.7097 49.2919L18.5484 44.4436L25.2688 51.1774C13.7097 63.5677 6.72043 79.9984 6.72043 98.0452C6.72043 136.024 37.6344 167 75.5376 167C113.441 167 144.355 136.024 144.355 98.0452C144.355 79.729 137.097 63.029 125.269 50.6387L131.452 44.4436ZM136.29 29.629L142.204 35.5548L136.29 41.4806L130.376 35.5548L136.29 29.629ZM13.7097 41.4806L7.7957 35.5548L13.7097 29.629L19.6237 35.5548L13.7097 41.4806ZM54.8387 14.8145V5.65645H95.9677V14.8145H87.6344H81.9892H68.2796H62.6344H54.8387ZM68.2796 20.471H81.9892V29.629C79.8387 29.3597 77.4193 29.3597 75.2688 29.3597C72.8495 29.3597 70.4301 29.3597 68.2796 29.629V20.471ZM138.71 95.3516H128.226V101.008H138.71C137.366 133.6 111.021 159.997 78.2258 161.613V150.839H72.5806V161.344C40.0538 159.997 13.7097 133.6 12.3656 101.008H22.8495V95.3516H12.3656C13.7097 62.7597 40.0538 36.3629 72.5806 34.7468V45.2516H78.2258V34.7468C110.753 36.3629 137.097 62.7597 138.71 95.3516Z"
      fill={color || '#5d5d5d'}
    />
  </svg>
);
