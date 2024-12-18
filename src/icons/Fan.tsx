import { colors } from '../styles/colors';

type FanIconProps = {
  color?: string;
  width?: string;
  variant?: string;
}

export const FanIcon = ({
  width = '24px', color = colors.Grey400, variant, ...props
}: FanIconProps): JSX.Element => {
  switch (variant) {
    case 'primary':
      return (
        <svg width="27" height="25" viewBox="0 0 27 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.7526 16.1084C15.2174 16.6751 14.6287 17.0317 13.9217 17.1667C13.6479 17.2191 13.3633 17.2243 13.0831 17.2281C12.9505 17.2299 12.8783 17.2571 12.8108 17.3799C12.0834 18.7104 11.285 19.9958 10.3144 21.1686C9.61206 22.0172 8.8502 22.8047 7.87827 23.3571C7.18293 23.7521 6.44641 23.9607 5.6367 23.7873C5.06909 23.6659 4.60142 23.3641 4.17282 22.9935C3.32545 22.2611 2.73216 21.3476 2.27892 20.3395C1.62158 18.8775 1.27602 17.3457 1.27637 15.7431C1.27637 15.1077 1.34041 14.4772 1.58216 13.8791C1.64269 13.7291 1.71764 13.5815 1.80738 13.4471C2.18144 12.8861 2.76911 12.706 3.38668 12.9887C3.98174 13.2612 4.55568 13.5783 5.14968 13.854C6.20149 14.3418 7.27618 14.7717 8.42758 14.9737C8.87378 15.0519 9.3228 15.0944 9.77182 14.9901C9.85557 14.9706 9.9365 14.9392 10.0294 14.9099C9.87985 14.4029 9.84501 13.9025 9.9256 13.3962C9.99281 12.9726 10.1343 12.5731 10.3704 12.2137C10.445 12.1003 10.4316 12.0294 10.3651 11.9234C9.58778 10.6829 8.89349 9.39956 8.35051 8.03944C8.00249 7.16746 7.72484 6.27595 7.61435 5.34047C7.54995 4.79439 7.55206 4.24971 7.69001 3.71271C7.93844 2.74618 8.56235 2.11985 9.48467 1.76045C10.4239 1.39547 11.4014 1.273 12.3998 1.32638C14.1448 1.4199 15.7903 1.88153 17.3316 2.69977C17.8921 2.99741 18.4242 3.3411 18.8486 3.81634C19.0323 4.02221 19.1984 4.25634 19.3163 4.50408C19.5647 5.02713 19.4342 5.57634 18.9689 5.92388C18.5674 6.22396 18.1293 6.47519 17.7113 6.75398C16.7316 7.40648 15.7846 8.10015 14.9637 8.9477C14.6051 9.31756 14.2764 9.71185 14.0583 10.1826C13.9882 10.3333 13.9428 10.4956 13.8809 10.6658C14.0487 10.7178 14.1934 10.7565 14.3341 10.8068C15.1463 11.0968 15.7604 11.6191 16.171 12.3707C16.2319 12.482 16.2988 12.5096 16.4191 12.5057C18.1807 12.4506 19.9349 12.5169 21.668 12.8658C22.5734 13.048 23.4496 13.3173 24.2453 13.7996C25.5033 14.5613 25.9836 15.6873 25.6764 17.1158C25.4238 18.2889 24.866 19.3133 24.1376 20.2541C23.2139 21.4467 22.1135 22.4474 20.7999 23.207C20.2044 23.5514 19.5795 23.8281 18.8848 23.9066C18.0396 24.0019 17.3499 23.6139 17.3133 22.6121C17.2714 21.4676 17.2024 20.3252 16.9976 19.1958C16.8544 18.4058 16.6823 17.6207 16.2952 16.9064C16.1475 16.6336 15.9462 16.39 15.7526 16.1084ZM10.2852 15.5194C9.95304 15.5683 9.64936 15.6367 9.34286 15.6527C8.6257 15.6904 7.93422 15.5296 7.2533 15.3268C5.87845 14.9172 4.59157 14.3045 3.32897 13.6377C2.77826 13.3467 2.44783 13.4552 2.19165 14.0169C2.16279 14.0801 2.13006 14.1447 2.1174 14.2116C2.04385 14.5927 1.93511 14.972 1.91295 15.3565C1.81758 17.0132 2.17687 18.5879 2.85145 20.0967C3.22974 20.9425 3.71922 21.7178 4.39803 22.3626C4.75591 22.7021 5.13982 23.0071 5.62614 23.1505C6.32289 23.356 6.95912 23.1722 7.56403 22.8351C8.32553 22.4108 8.93888 21.812 9.50754 21.1658C10.4598 20.0838 11.2382 18.8821 11.9599 17.642C12.0609 17.4686 12.1541 17.2909 12.2551 17.1085C11.3708 16.8178 10.7195 16.2808 10.2852 15.5194ZM16.0901 15.6527C16.4874 15.9807 16.7552 16.3939 16.9586 16.8496C17.4927 18.0453 17.6828 19.3196 17.8038 20.6058C17.8651 21.259 17.8823 21.9164 17.921 22.572C17.953 23.1132 18.2053 23.3372 18.7473 23.3023C19.2797 23.2681 19.7607 23.0671 20.221 22.8218C21.6764 22.0462 22.8672 20.968 23.8374 19.6487C24.4304 18.8426 24.8741 17.9654 25.0761 16.9787C25.2232 16.2599 25.182 15.5791 24.695 14.9814C24.4332 14.66 24.1066 14.4154 23.7435 14.2193C22.7173 13.6649 21.5962 13.4231 20.4525 13.2926C19.5809 13.1931 18.7012 13.1551 17.8242 13.109C17.3808 13.0857 16.9353 13.1048 16.4758 13.1048C16.676 14.01 16.5648 14.8467 16.0901 15.6527ZM10.8532 11.5577C10.8961 11.5375 10.9084 11.5347 10.9165 11.5273C11.5528 10.9418 12.3044 10.6383 13.1722 10.6079C13.2172 10.6062 13.2792 10.5392 13.3003 10.4889C13.4079 10.2328 13.4829 9.96169 13.6096 9.71569C13.8675 9.21428 14.2405 8.79347 14.6389 8.39744C15.672 7.37054 16.8646 6.54916 18.0938 5.77558C18.281 5.65764 18.4671 5.53447 18.6357 5.39246C18.8247 5.23335 18.8775 5.01317 18.7701 4.7916C18.6776 4.60039 18.5632 4.41197 18.4232 4.25285C18.0565 3.83588 17.5937 3.53685 17.1085 3.27376C15.7329 2.5288 14.2613 2.08845 12.7013 1.9583C11.7551 1.87944 10.8173 1.94085 9.90906 2.25733C8.7654 2.65581 8.2358 3.36762 8.19814 4.55887C8.17457 5.30662 8.33046 6.02507 8.54722 6.73304C8.92797 7.97802 9.48925 9.14624 10.1174 10.2837C10.3528 10.7108 10.6048 11.1289 10.8532 11.5577ZM15.9426 13.9182C15.9412 12.4161 14.7251 11.2321 13.1845 11.2325C11.7315 11.2328 10.5045 12.4691 10.5048 13.9318C10.5052 15.4071 11.74 16.6322 13.2267 16.6329C14.73 16.6336 15.9441 15.42 15.9426 13.9182Z" fill={color} stroke={color} strokeWidth="1.3" />
        </svg>
      );
    default:
      return (
        <svg {...props} width={width} height={width} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill={color}
            d="M474.476,327.033c-21.055-12.156-102.244-45.654-160.273-57.754c-2.689-8.685-7.306-16.527-13.342-23.037
            c7.731-23.478,14.352-52.576,19.466-80.368c32.586,17.409,57.004,47.626,66.823,83.677c2.177,7.992,10.42,12.707,18.414,10.53
            c7.992-2.177,12.707-10.421,10.529-18.414c-12.883-47.299-46.317-86.377-90.585-106.688c1.707-11.266,3.097-21.771,4.138-30.944
            c68.609,27.636,116.718,92.879,121.767,167.591c0.535,7.92,7.127,13.988,14.95,13.988c0.34,0,0.683-0.011,1.026-0.035
            c8.265-0.559,14.512-7.711,13.953-15.977c-6.236-92.276-67.657-167.961-149.525-196.808
            c-1.176-40.331-34.327-72.786-74.939-72.786c-41.352,0-74.995,33.643-74.995,74.995c0,23.955,12.228,114.196,31.012,171.238
            c-6.036,6.51-10.653,14.35-13.342,23.034c-23.781,4.943-51.572,13.443-77.571,22.589c-1.346-37.503,12.645-73.204,39.091-99.873
            c5.833-5.882,5.793-15.379-0.089-21.211c-5.883-5.833-15.378-5.794-21.212,0.089c-35.808,36.11-51.643,84.332-47.127,131.848
            c-10.592,4.112-20.368,8.121-28.814,11.772c-10.476-74.3,22.141-147.485,84.226-189.323c6.87-4.629,8.685-13.951,4.057-20.82
            c-4.629-6.869-13.949-8.685-20.82-4.056C56.749,150.524,19.331,239.752,35.676,328.163C1.216,349.378-10.3,394.185,10.079,429.478
            c20.557,35.604,66.068,48.186,102.071,27.664c0.124-0.07,0.249-0.142,0.373-0.214c0.001,0,0.003-0.001,0.003-0.001
            c20.273-11.706,91.15-66.739,131.041-111.449c8.733,1.987,17.692,2.031,26.613,0.002c15.808,17.782,36.583,37.508,57.151,55.499
            c-31.898,20.227-70.6,26.067-106.64,16.551c-8.009-2.115-16.216,2.664-18.331,10.672c-2.115,8.009,2.664,16.217,10.673,18.332
            c46.608,12.306,97.415,3.69,138.067-25.426c8.744,7.164,17.043,13.694,24.433,19.264c-59.552,46.862-140.039,54.21-206.135,21.799
            c-7.435-3.646-16.424-0.574-20.07,6.864c-3.647,7.438-0.574,16.424,6.864,20.071c78.449,38.467,175.345,28.677,245.163-31.136
            c35.354,19.121,80.065,7.026,100.572-28.491C522.651,393.581,510.377,347.759,474.476,327.033z M97.523,430.948
            c-21.537,12.436-49.03,5.071-61.467-16.471c-12.436-21.538-5.07-49.029,16.47-61.467c16.827-9.714,91.034-40.179,145.845-52.782
            c2.721,12.024,9.052,22.688,17.804,30.785C177.378,372.698,113.797,421.553,97.523,430.948z M256.877,316.985
            c-16.541,0-29.998-13.457-29.998-29.998c0-16.541,13.457-29.998,29.998-29.998s29.998,13.457,29.998,29.998
            C286.875,303.528,273.418,316.985,256.877,316.985z M274.64,229.678c-11.519-3.578-23.982-3.586-35.526,0
            c-16.449-54.189-27.234-136.023-27.234-154.675c0.001-24.811,20.186-44.997,44.998-44.997c24.811,0,44.997,20.186,44.997,44.997
            C301.874,93.71,291.064,175.574,274.64,229.678z M475.947,414.478c-12.435,21.538-39.925,28.907-61.467,16.47
            c-17.409-10.051-79.408-59.492-116.911-99.926c8.749-8.091,15.082-18.75,17.806-30.766
            c54.262,12.646,127.695,43.283,144.103,52.755C481.017,365.448,488.382,392.939,475.947,414.478z"
          />
        </svg>
      );
  }
};