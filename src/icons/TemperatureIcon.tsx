type TemperatureIconProps = {
  color?: string;
};

export const TemperatureIcon = ({
  color = '#363BC4',
}: TemperatureIconProps): JSX.Element => (
  <svg
    width="8"
    height="17"
    viewBox="0 0 8 17"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.49536 0C3.67862 0 3.86138 0 4.04464 0C4.20942 0.0466061 4.37769 0.0824192 4.53748 0.141781C5.49272 0.495496 6.02601 1.29467 6.02701 2.37642C6.029 4.72831 6.0285 7.0802 6.02501 9.43209C6.02501 9.58074 6.06096 9.68328 6.1848 9.78581C6.77002 10.271 7.17598 10.8779 7.38421 11.6044C7.45062 11.837 7.48907 12.0774 7.54 12.3138C7.54 12.5101 7.54 12.7063 7.54 12.9025C7.52602 12.9482 7.50455 12.9933 7.49955 13.0399C7.32878 14.5784 6.19478 15.8603 4.6763 16.2238C4.48455 16.2699 4.28881 16.2994 4.09457 16.3367C3.87836 16.3367 3.66164 16.3367 3.44543 16.3367C3.39849 16.3224 3.35305 16.3018 3.30512 16.295C1.75517 16.0693 0.730531 15.2137 0.20373 13.7782C0.100866 13.4991 0.0659126 13.1949 0 12.9025C0 12.7063 0 12.5101 0 12.3138C0.0139815 12.277 0.0364517 12.2407 0.0404464 12.2029C0.145807 11.2419 0.583227 10.4496 1.31975 9.82015C1.46855 9.69309 1.51649 9.56799 1.51599 9.38303C1.5105 7.03948 1.51399 4.69593 1.5115 2.35238C1.5105 1.50808 1.82808 0.817814 2.5626 0.364999C2.84123 0.192802 3.18278 0.118723 3.49536 0ZM2.25201 6.03328C2.25201 7.29214 2.24852 8.5505 2.25601 9.80936C2.25701 9.98303 2.20408 10.0841 2.05577 10.1856C0.954234 10.9412 0.499837 12.2814 0.904301 13.5388C1.29328 14.7476 2.47122 15.5978 3.76101 15.5998C5.0543 15.6018 6.23223 14.7624 6.63071 13.555C7.04566 12.2971 6.58726 10.9407 5.47674 10.1807C5.33592 10.0846 5.2815 9.99088 5.28349 9.82555C5.29248 9.17159 5.28699 8.51812 5.28699 7.86417C5.28699 6.00875 5.28948 4.15334 5.28599 2.29842C5.28399 1.40701 4.61488 0.731471 3.75252 0.736376C2.91813 0.741282 2.25651 1.41633 2.25301 2.28174C2.24852 3.53225 2.25251 4.78277 2.25201 6.03328Z"
      fill={color}
    />
    <path
      d="M4.51488 8.16341C4.51488 8.88212 4.51837 9.60084 4.51238 10.3196C4.51138 10.4687 4.55582 10.5423 4.70413 10.61C5.67234 11.0515 6.20014 12.0867 5.97844 13.0732C5.74674 14.1035 4.86242 14.8266 3.79733 14.856C2.7632 14.8845 1.82495 14.1457 1.56978 13.1017C1.32811 12.1136 1.85491 11.0569 2.83111 10.6129C2.9929 10.5393 3.02735 10.4545 3.02685 10.2999C3.02236 8.91156 3.02286 7.52269 3.02635 6.13432C3.02685 5.98126 3.03384 5.82035 3.08128 5.67709C3.18514 5.36312 3.5197 5.16737 3.84127 5.20318C4.1983 5.24292 4.46445 5.50637 4.5004 5.86106C4.51038 5.9582 4.51338 6.05681 4.51338 6.15444C4.51538 6.82409 4.51488 7.49375 4.51488 8.16341Z"
      fill={color}
    />
  </svg>
);