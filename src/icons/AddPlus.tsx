type AddIconProps = {
  color?: string;
  width?: string;
  heigth?: string;
}

export const AddPlusIcon = ({ ...props }: AddIconProps): JSX.Element => (
  <svg width="30" height="31" viewBox="0 -2 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="1" width="18" height="18" rx="5" fill="#4950CC" />
    <path d="M8.11009 13.4482V6.40838H9.88991V13.4482H8.11009ZM5.48011 10.8182V9.03835H12.5199V10.8182H5.48011Z" fill="white" />
  </svg>
);
