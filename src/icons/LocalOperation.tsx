type LocalOperationIconProps = {
    color?: string;
}

export const LocalOperationIcon = ({ color = '#363BC4' }: LocalOperationIconProps): JSX.Element => (
  <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M11 2C9.89543 2 9 2.89543 9 4C9 5.10457 9.89543 6 11 6C12.1046 6 13 5.10457 13 4C13 2.89543 12.1046 2 11 2ZM7 4C7 1.79086 8.79086 0 11 0C13.2091 0 15 1.79086 15 4C15 5.86384 13.7252 7.42994 12 7.87398V15C12 15.5523 11.5523 16 11 16C10.4477 16 10 15.5523 10 15V7.87398C8.27477 7.42994 7 5.86384 7 4ZM7.98121 11.1815C8.08776 11.7234 7.73483 12.2491 7.19292 12.3557C5.51131 12.6863 4.14894 13.2181 3.23474 13.8347C2.29844 14.4662 2 15.0598 2 15.5C2 16.104 2.59225 16.9839 4.3393 17.7701C5.99248 18.514 8.34649 19 11 19C13.6535 19 16.0075 18.514 17.6607 17.7701C19.4077 16.9839 20 16.104 20 15.5C20 15.0598 19.7016 14.4662 18.7653 13.8347C17.8511 13.2181 16.4887 12.6863 14.8071 12.3557C14.2652 12.2491 13.9122 11.7234 14.0188 11.1815C14.1253 10.6396 14.651 10.2867 15.1929 10.3932C17.0431 10.757 18.6807 11.3653 19.8836 12.1766C21.0643 12.9729 22 14.0949 22 15.5C22 17.3813 20.3537 18.7514 18.4814 19.5939C16.5153 20.4787 13.8693 21 11 21C8.13066 21 5.48468 20.4787 3.51857 19.5939C1.64633 18.7514 0 17.3813 0 15.5C0 14.0949 0.935656 12.9729 2.11641 12.1766C3.31925 11.3653 4.95688 10.757 6.80708 10.3932C7.34899 10.2867 7.87467 10.6396 7.98121 11.1815Z" fill={color} />
  </svg>
);