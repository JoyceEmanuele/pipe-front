type ResetZoomIconProps = {
  color?: string;
}

export const ResetZoomIcon = ({ color = '#363BC4', ...props }: ResetZoomIconProps): JSX.Element => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M0.636536 5.33973C0.467975 5.33973 0.306318 5.27277 0.187128 5.15358C0.0679371 5.03439 0.000976563 4.87274 0.000976562 4.70417L0.000976563 0.636597C0.000976563 0.468036 0.0679371 0.306379 0.187128 0.187189C0.306318 0.0679981 0.467975 0.0010376 0.636536 0.0010376L4.70411 0.0010376C4.87267 0.0010376 5.03433 0.0679981 5.15352 0.187189C5.27271 0.306379 5.33967 0.468036 5.33967 0.636597C5.33967 0.805157 5.27271 0.966814 5.15352 1.086C5.03433 1.2052 4.87267 1.27216 4.70411 1.27216H1.27209V4.70417C1.27209 4.87274 1.20513 5.03439 1.08594 5.15358C0.966753 5.27277 0.805096 5.33973 0.636536 5.33973Z"
      fill={color}
    />
    <path
      d="M14.3643 5.33949C14.1957 5.33949 14.0341 5.27253 13.9149 5.15334C13.7957 5.03415 13.7287 4.87249 13.7287 4.70393V1.27191H10.2967C10.1281 1.27191 9.96647 1.20495 9.84728 1.08576C9.72809 0.96657 9.66113 0.804913 9.66113 0.636352C9.66113 0.467792 9.72809 0.306135 9.84728 0.186944C9.96647 0.0677539 10.1281 0.000793457 10.2967 0.000793457L14.3643 0.000793457C14.5328 0.000793457 14.6945 0.0677539 14.8137 0.186944C14.9329 0.306135 14.9998 0.467792 14.9998 0.636352V4.70393C14.9998 4.87249 14.9329 5.03415 14.8137 5.15334C14.6945 5.27253 14.5328 5.33949 14.3643 5.33949Z"
      fill={color}
    />
    <path
      d="M14.3643 15H10.2967C10.1281 15 9.96647 14.9331 9.84728 14.8139C9.72809 14.6947 9.66113 14.533 9.66113 14.3645C9.66113 14.1959 9.72809 14.0342 9.84728 13.915C9.96647 13.7959 10.1281 13.7289 10.2967 13.7289H13.7287V10.2969C13.7287 10.1283 13.7957 9.96666 13.9149 9.84747C14.0341 9.72828 14.1957 9.66132 14.3643 9.66132C14.5328 9.66132 14.6945 9.72828 14.8137 9.84747C14.9329 9.96666 14.9998 10.1283 14.9998 10.2969V14.3645C14.9998 14.533 14.9329 14.6947 14.8137 14.8139C14.6945 14.9331 14.5328 15 14.3643 15Z"
      fill={color}
    />
    <path
      d="M4.70411 15H0.636536C0.467975 15 0.306318 14.9331 0.187128 14.8139C0.0679371 14.6947 0.000976563 14.533 0.000976562 14.3645L0.000976563 10.2969C0.000976563 10.1283 0.0679371 9.96666 0.187128 9.84747C0.306318 9.72828 0.467975 9.66132 0.636536 9.66132C0.805096 9.66132 0.966753 9.72828 1.08594 9.84747C1.20513 9.96666 1.27209 10.1283 1.27209 10.2969V13.7289H4.70411C4.87267 13.7289 5.03433 13.7959 5.15352 13.915C5.27271 14.0342 5.33967 14.1959 5.33967 14.3645C5.33967 14.533 5.27271 14.6947 5.15352 14.8139C5.03433 14.9331 4.87267 15 4.70411 15Z"
      fill={color}
    />
    <path
      d="M9.78842 5.84795C9.70488 5.84823 9.62211 5.83198 9.54488 5.80013C9.46765 5.76828 9.39749 5.72146 9.33844 5.66236C9.22014 5.54247 9.15381 5.38082 9.15381 5.21239C9.15381 5.04396 9.22014 4.8823 9.33844 4.76241L13.9145 0.186386C14.0338 0.0670451 14.1957 0 14.3644 0C14.5332 0 14.6951 0.0670451 14.8144 0.186386C14.9338 0.305727 15.0008 0.467588 15.0008 0.636362C15.0008 0.805136 14.9338 0.966997 14.8144 1.08634L10.2384 5.66236C10.1793 5.72146 10.1092 5.76828 10.032 5.80013C9.95473 5.83198 9.87196 5.84823 9.78842 5.84795Z"
      fill={color}
    />
    <path
      d="M5.21239 5.84795C5.12885 5.84823 5.04608 5.83198 4.96885 5.80013C4.89162 5.76828 4.82146 5.72146 4.76241 5.66236L0.186386 1.08634C0.0670451 0.966997 -2.17799e-09 0.805135 0 0.636362C2.17799e-09 0.467588 0.0670451 0.305727 0.186386 0.186386C0.305727 0.0670451 0.467588 2.17799e-09 0.636362 0C0.805135 -2.17799e-09 0.966997 0.0670451 1.08634 0.186386L5.66236 4.76241C5.78067 4.8823 5.847 5.04396 5.847 5.21239C5.847 5.38082 5.78067 5.54247 5.66236 5.66236C5.60332 5.72146 5.53315 5.76828 5.45593 5.80013C5.3787 5.83198 5.29593 5.84823 5.21239 5.84795Z"
      fill={color}
    />
    <path
      d="M14.3642 15C14.2807 15.0003 14.1979 14.984 14.1207 14.9522C14.0435 14.9203 13.9733 14.8735 13.9143 14.8144L9.33824 10.2384C9.2189 10.119 9.15186 9.95717 9.15186 9.7884C9.15186 9.61963 9.2189 9.45777 9.33824 9.33842C9.45758 9.21908 9.61944 9.15204 9.78822 9.15204C9.95699 9.15204 10.1189 9.21908 10.2382 9.33842L14.8142 13.9144C14.9325 14.0343 14.9989 14.196 14.9989 14.3644C14.9989 14.5329 14.9325 14.6945 14.8142 14.8144C14.7552 14.8735 14.685 14.9203 14.6078 14.9522C14.5306 14.984 14.4478 15.0003 14.3642 15Z"
      fill={color}
    />
    <path
      d="M0.636562 15C0.553022 15.0003 0.470252 14.984 0.393023 14.9522C0.315794 14.9203 0.245633 14.8735 0.186586 14.8144C0.0682831 14.6945 0.00195312 14.5329 0.00195312 14.3644C0.00195312 14.196 0.0682831 14.0343 0.186586 13.9144L4.76261 9.33842C4.88195 9.21908 5.04381 9.15204 5.21259 9.15204C5.38136 9.15204 5.54322 9.21908 5.66256 9.33842C5.7819 9.45777 5.84895 9.61963 5.84895 9.7884C5.84895 9.95717 5.7819 10.119 5.66256 10.2384L1.08654 14.8144C1.02749 14.8735 0.957329 14.9203 0.8801 14.9522C0.802871 14.984 0.720101 15.0003 0.636562 15Z"
      fill={color}
    />
  </svg>
);
