type GreatSignalIconProps = {
  color?: string;
  width?: string;
  heigth?: string;
}

export const GreatSignalIcon = ({ color = '#363BC4', ...props }: GreatSignalIconProps): JSX.Element => (
  <svg {...props} width={props.width || '12'} height={props.heigth || 19} viewBox="0 0 25 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.9277 7.11941C23.7885 7.11991 23.6505 7.09178 23.5218 7.03665C23.3931 6.98152 23.2761 6.90048 23.1777 6.79819C21.7738 5.34027 20.1071 4.18378 18.2728 3.39475C16.4385 2.60573 14.4725 2.19962 12.487 2.19962C10.5016 2.19962 8.53558 2.60573 6.70127 3.39475C4.86696 4.18378 3.20027 5.34027 1.79637 6.79819C1.59685 6.99889 1.32941 7.11018 1.05165 7.10809C0.773881 7.106 0.508021 6.9907 0.311329 6.78702C0.114637 6.58334 0.00285237 6.30759 5.38334e-05 6.01915C-0.0027447 5.73072 0.103666 5.45268 0.296366 5.24493C1.89707 3.58212 3.79756 2.26307 5.88926 1.36314C7.98097 0.463198 10.2229 0 12.487 0C14.7512 0 16.9931 0.463198 19.0848 1.36314C21.1765 2.26307 23.077 3.58212 24.6777 5.24493C24.8248 5.39901 24.9247 5.59481 24.9649 5.80771C25.0051 6.02061 24.9838 6.2411 24.9036 6.44144C24.8235 6.64179 24.6881 6.81305 24.5144 6.93368C24.3408 7.05431 24.1366 7.11893 23.9277 7.11941Z" fill={color} />
    <path d="M4.31284 10.5161C4.10341 10.5156 3.89882 10.4507 3.72492 10.3295C3.55101 10.2083 3.4156 10.0363 3.33579 9.83528C3.25598 9.63421 3.23536 9.41309 3.27653 9.19985C3.31769 8.98661 3.4188 8.79083 3.56708 8.63724C5.93272 6.18079 9.14114 4.80078 12.4866 4.80078C15.832 4.80078 19.0404 6.18079 21.4061 8.63724C21.605 8.84438 21.7165 9.1251 21.7161 9.41763C21.7157 9.71016 21.6034 9.99055 21.4039 10.1971C21.2045 10.4037 20.9341 10.5195 20.6524 10.5191C20.3707 10.5187 20.1007 10.4021 19.9018 10.1949C17.934 8.15494 15.2671 7.0092 12.4866 7.0092C9.70604 7.0092 7.03913 8.15494 5.07132 10.1949C4.8694 10.402 4.59664 10.5175 4.31284 10.5161Z" fill={color} />
    <path d="M17.3892 13.9085C17.2499 13.909 17.112 13.8809 16.9833 13.8257C16.8545 13.7706 16.7376 13.6896 16.6392 13.5873C15.5378 12.4437 14.0441 11.8012 12.4866 11.8012C10.9292 11.8012 9.43546 12.4437 8.3341 13.5873C8.13519 13.7938 7.8654 13.9099 7.5841 13.9099C7.30279 13.9099 7.03301 13.7938 6.8341 13.5873C6.63519 13.3807 6.52344 13.1006 6.52344 12.8084C6.52344 12.5163 6.63519 12.2362 6.8341 12.0296C8.33513 10.4765 10.3677 9.60449 12.4866 9.60449C14.6056 9.60449 16.6381 10.4765 18.1392 12.0296C18.2877 12.1835 18.3889 12.3797 18.4299 12.5933C18.471 12.8069 18.45 13.0284 18.3697 13.2297C18.2893 13.4309 18.1533 13.6029 17.9787 13.7237C17.8041 13.8446 17.599 13.9089 17.3892 13.9085Z" fill={color} />
    <path d="M12.4868 19C12.2058 19 11.9361 18.8845 11.7368 18.6788L10.1055 16.9803C10.0059 16.8791 9.92682 16.7583 9.87282 16.6249C9.81883 16.4915 9.79102 16.3483 9.79102 16.2037C9.79102 16.059 9.81883 15.9158 9.87282 15.7824C9.92682 15.6491 10.0059 15.5282 10.1055 15.427C10.7399 14.7767 11.5954 14.4121 12.4868 14.4121C13.3782 14.4121 14.2338 14.7767 14.8682 15.427C14.9677 15.5282 15.0468 15.6491 15.1008 15.7824C15.1548 15.9158 15.1826 16.059 15.1826 16.2037C15.1826 16.3483 15.1548 16.4915 15.1008 16.6249C15.0468 16.7583 14.9677 16.8791 14.8682 16.9803L13.2368 18.6788C13.0375 18.8845 12.7679 19 12.4868 19Z" fill={color} />
  </svg>
);