type OrderIconProps = {
  color?: string
  cursor?: string
  orderDesc?: boolean
}

export const OrderIcon = ({ color = '#363BC4', ...props }: OrderIconProps): JSX.Element => (
  <svg width="6" height="22" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" style={props}>
    <path d="M2.93301 8.25C2.74056 8.58333 2.25944 8.58333 2.06699 8.25L0.767949 6C0.575499 5.66667 0.816062 5.25 1.20096 5.25L3.79904 5.25C4.18394 5.25 4.4245 5.66667 4.23205 6L2.93301 8.25Z" fill={props.orderDesc != null && !props.orderDesc ? '#D7D7D7' : '#686868'} />
    <path d="M2.06699 0.75C2.25944 0.416667 2.74056 0.416667 2.93301 0.75L4.23205 3C4.4245 3.33333 4.18394 3.75 3.79904 3.75L1.20096 3.75C0.816062 3.75 0.575499 3.33333 0.767949 3L2.06699 0.75Z" fill={props.orderDesc ? '#D7D7D7' : '#686868'} />
  </svg>
);
