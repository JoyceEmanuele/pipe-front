type AlarmIconProps = {
    style?: React.CSSProperties;
}
export const AlarmIcon = ({ style }: AlarmIconProps): JSX.Element => (
  <svg style={style} width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.25 3.75L2.5 7.5M27.5 7.5L23.75 3.75M7.5 23.75L5 26.25M22.5 23.75L25 26.25M15 26.25C17.6522 26.25 20.1957 25.1964 22.0711 23.3211C23.9464 21.4457 25 18.9022 25 16.25C25 13.5978 23.9464 11.0543 22.0711 9.17893C20.1957 7.30357 17.6522 6.25 15 6.25C12.3478 6.25 9.8043 7.30357 7.92893 9.17893C6.05357 11.0543 5 13.5978 5 16.25C5 18.9022 6.05357 21.4457 7.92893 23.3211C9.8043 25.1964 12.3478 26.25 15 26.25Z" stroke="#7D7D7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 16.6374L13.8 19.7143L19 14" stroke="#7D7D7D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
