type ZoomOutProps = {
  color?: string;
}

export const ZoomOutIcon = ({ color, ...props }: ZoomOutProps): JSX.Element => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5ZM6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M9.46967 9.46967C9.76256 9.17678 10.2374 9.17678 10.5303 9.46967L13.5303 12.4697C13.8232 12.7626 13.8232 13.2374 13.5303 13.5303C13.2374 13.8232 12.7626 13.8232 12.4697 13.5303L9.46967 10.5303C9.17678 10.2374 9.17678 9.76256 9.46967 9.46967Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M3.25011 6.12109C3.25011 5.70688 3.5859 5.37109 4.00011 5.37109L8.24275 5.37109C8.65697 5.37109 8.99275 5.70688 8.99275 6.12109C8.99275 6.53531 8.65697 6.87109 8.24275 6.87109L4.00011 6.87109C3.5859 6.87109 3.25011 6.53531 3.25011 6.12109Z" fill="currentColor" />
  </svg>
);
