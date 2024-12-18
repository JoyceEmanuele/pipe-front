type BellIconProps = {
  color?: string;
}

export const BellIcon = ({ color, ...props }: BellIconProps): JSX.Element => (
  <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.8537 19.7633C21.5402 17.7425 20.3675 15.3508 20.3675 12.6545V8.72989C20.3889 5.73775 18.0997 3.75316 16.1327 2.96291C15.5781 2.74036 14.9938 2.57542 14.398 2.44887V2.18182C14.398 0.978764 13.2845 0 11.9157 0C10.5469 0 9.43336 0.978764 9.43336 2.18182V2.48989C8.89768 2.61338 8.37142 2.76436 7.87148 2.96684C5.69746 3.84742 3.49513 5.96989 3.47527 8.72727V12.6545C3.47527 15.442 2.35525 17.8337 0.146469 19.7633C0.0149051 19.8785 -0.0327557 20.0483 0.0228485 20.2041C0.0784527 20.3594 0.228882 20.4751 0.412078 20.503L5.12404 21.2182C6.01271 21.353 6.81947 21.4608 7.57857 21.5489C8.4449 23.0417 10.1463 24 12.0061 24C13.8663 24 15.5682 23.0409 16.434 21.5472C17.1897 21.4595 17.9924 21.3521 18.8761 21.2177L23.5876 20.5025C23.7708 20.4751 23.9207 20.3594 23.9768 20.2036C24.0329 20.0483 23.9853 19.8785 23.8537 19.7633ZM10.4258 2.18182C10.4258 1.46007 11.094 0.872727 11.9152 0.872727C12.7364 0.872727 13.4046 1.46007 13.4046 2.18182V2.26604C12.4151 2.14298 11.4068 2.14996 10.4258 2.28785V2.18182ZM6.45407 9.16364H6.45109C6.17704 9.16189 5.95612 8.96553 5.9576 8.72465C5.9725 6.6816 7.82035 5.38953 8.91059 4.94836C10.8215 4.17382 13.1772 4.17513 15.101 4.94749C15.3502 5.04742 15.46 5.30618 15.3463 5.52567C15.2321 5.74473 14.9377 5.8416 14.688 5.7408C13.0233 5.07185 10.9799 5.07011 9.32662 5.7408C8.44937 6.096 6.96245 7.12538 6.95103 8.72989C6.94905 8.97033 6.72713 9.16364 6.45407 9.16364ZM15.1949 21.6777C14.4407 22.577 13.2646 23.1273 12.0061 23.1273C10.748 23.1273 9.57237 22.5775 8.81824 21.6785C9.01484 21.6964 9.20598 21.7104 9.39663 21.7248C9.48748 21.7318 9.58082 21.7401 9.67068 21.7466C9.74018 21.7514 9.8072 21.7545 9.87621 21.7588C11.3189 21.8513 12.6475 21.8513 14.0892 21.761C14.1721 21.7558 14.2531 21.7519 14.337 21.7462C14.4452 21.7388 14.5574 21.7287 14.6671 21.7204C14.8354 21.7073 15.0027 21.6951 15.176 21.6794C15.1819 21.6785 15.1884 21.6781 15.1949 21.6777Z"
      fill={color || '#5D5D5D'}
    />
  </svg>
);
