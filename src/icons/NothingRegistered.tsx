type NothingRegisteredProps = {
  color?: string;
};

export const NothingRegistered = ({ color = '#818181' }: NothingRegisteredProps): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" width="47" height="47" viewBox="0 0 47 47" fill="none">
    <path d="M24.2686 25.5952H9.14995C8.62235 25.5952 8.11636 25.3856 7.7433 25.0125C7.37023 24.6395 7.16064 24.1335 7.16064 23.6059C7.16064 23.0783 7.37023 22.5723 7.7433 22.1992C8.11636 21.8262 8.62235 21.6166 9.14995 21.6166H24.2686C24.7962 21.6166 25.3022 21.8262 25.6753 22.1992C26.0484 22.5723 26.2579 23.0783 26.2579 23.6059C26.2579 24.1335 26.0484 24.6395 25.6753 25.0125C25.3022 25.3856 24.7962 25.5952 24.2686 25.5952Z" fill={color} />
    <path d="M28.2472 15.254H9.14995C8.62235 15.254 8.11636 15.0444 7.7433 14.6713C7.37023 14.2983 7.16064 13.7923 7.16064 13.2647C7.16064 12.7371 7.37023 12.2311 7.7433 11.858C8.11636 11.485 8.62235 11.2754 9.14995 11.2754H28.2472C28.7748 11.2754 29.2808 11.485 29.6539 11.858C30.027 12.2311 30.2366 12.7371 30.2366 13.2647C30.2366 13.7923 30.027 14.2983 29.6539 14.6713C29.2808 15.0444 28.7748 15.254 28.2472 15.254Z" fill={color} />
    <path d="M18.6986 35.6745H9.14995C8.62235 35.6745 8.11636 35.4649 7.7433 35.0919C7.37023 34.7188 7.16064 34.2128 7.16064 33.6852C7.16064 33.1576 7.37023 32.6516 7.7433 32.2786C8.11636 31.9055 8.62235 31.6959 9.14995 31.6959H18.6986C19.2262 31.6959 19.7322 31.9055 20.1053 32.2786C20.4783 32.6516 20.6879 33.1576 20.6879 33.6852C20.6879 34.2128 20.4783 34.7188 20.1053 35.0919C19.7322 35.4649 19.2262 35.6745 18.6986 35.6745Z" fill={color} />
    <path d="M23.6727 46.9475H8.35507C6.13981 46.9454 4.01589 46.0645 2.44947 44.4981C0.883047 42.9317 0.00210676 40.8077 0 38.5925L0 8.35507C0.00210676 6.13982 0.883047 4.01589 2.44947 2.44947C4.01589 0.883047 6.13981 0.00210676 8.35507 0L30.6353 0C32.8505 0.00210676 34.9744 0.883047 36.5409 2.44947C38.1073 4.01589 38.9882 6.13982 38.9903 8.35507V20.3466C38.9903 20.8742 38.7807 21.3802 38.4077 21.7532C38.0346 22.1263 37.5286 22.3359 37.001 22.3359C36.4734 22.3359 35.9674 22.1263 35.5944 21.7532C35.2213 21.3802 35.0117 20.8742 35.0117 20.3466V8.35507C35.0096 7.19501 34.5479 6.08306 33.7276 5.26277C32.9073 4.44248 31.7953 3.98071 30.6353 3.97861H8.35507C7.19501 3.98071 6.08306 4.44248 5.26276 5.26277C4.44247 6.08306 3.98071 7.19501 3.9786 8.35507V38.5925C3.98071 39.7525 4.44247 40.8645 5.26276 41.6848C6.08306 42.5051 7.19501 42.9668 8.35507 42.9689H23.6727C24.2003 42.9689 24.7063 43.1785 25.0793 43.5516C25.4524 43.9247 25.662 44.4306 25.662 44.9582C25.662 45.4858 25.4524 45.9918 25.0793 46.3649C24.7063 46.738 24.2003 46.9475 23.6727 46.9475Z" fill={color} />
    <path d="M34.8514 40.468L30.459 41.5979L31.581 37.1975L41.5115 27.2749L44.782 30.5453L34.8514 40.468Z" fill={color} />
    <path d="M30.4608 43.5896C30.1572 43.591 29.8573 43.5225 29.5843 43.3895C29.3113 43.2565 29.0726 43.0626 28.8864 42.8226C28.7003 42.5827 28.5719 42.3032 28.511 42.0057C28.4501 41.7082 28.4583 41.4007 28.5352 41.107L29.6571 36.7066C29.7473 36.3666 29.9258 36.0564 30.1744 35.8075L40.105 25.8689C40.2891 25.6839 40.5079 25.5371 40.7489 25.4369C40.99 25.3367 41.2484 25.2852 41.5094 25.2852C41.7704 25.2852 42.0289 25.3367 42.2699 25.4369C42.5109 25.5371 42.7297 25.6839 42.9139 25.8689L46.1524 29.1393C46.3387 29.3236 46.4865 29.5429 46.5874 29.7847C46.6883 30.0264 46.7402 30.2858 46.7402 30.5478C46.7402 30.8097 46.6883 31.0691 46.5874 31.3108C46.4865 31.5526 46.3387 31.7719 46.1524 31.9562L36.2616 41.8788C36.008 42.1312 35.6924 42.3123 35.3465 42.404L30.9542 43.526C30.7927 43.5662 30.6272 43.5876 30.4608 43.5896ZM33.3732 38.1946L33.222 38.8073L33.8347 38.6482L41.9669 30.5478L41.5134 30.0862L33.3732 38.1946Z" fill={color} />
  </svg>
);