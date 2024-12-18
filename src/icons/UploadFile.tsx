import { colors } from '../styles/colors';

type UploadFileProps = {
  color?: string;
}

export const UploadFileIcon = ({ color, ...props }: UploadFileProps): JSX.Element => (
  <svg width="32px" height="32px" viewBox="-2 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <g id="Lager_3" data-name="Lager 3" transform="translate(-2 0)">
      <g id="Group_2" data-name="Group 2">
        <path id="Path_4" data-name="Path 4" d="M28,14H23.98A1.979,1.979,0,0,0,22,15.98v.04A1.979,1.979,0,0,0,23.98,18H25a1,1,0,0,1,1,1v8a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V19a1,1,0,0,1,1-1H8.02A1.979,1.979,0,0,0,10,16.02v-.04A1.979,1.979,0,0,0,8.02,14H4a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V16A2,2,0,0,0,28,14Z" fill={color} fillRule="evenodd" />
        <path id="Path_5" data-name="Path 5" d="M11.413,9.387,14,6.754V23a1,1,0,0,0,1,1h2a1,1,0,0,0,1-1V7.057l.26.042L20.587,9.4a2.017,2.017,0,0,0,2.833,0,1.969,1.969,0,0,0,0-2.807L17.346.581a2.017,2.017,0,0,0-2.833,0l-5.934,6a1.97,1.97,0,0,0,0,2.806A2.016,2.016,0,0,0,11.413,9.387Z" fill={color} fillRule="evenodd" />
      </g>
    </g>
  </svg>
);