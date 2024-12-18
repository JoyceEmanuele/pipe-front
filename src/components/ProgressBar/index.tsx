import { StyledProgress, StyledProgressDone } from './style';

interface ProgressBarProps {
  progress: string | number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <StyledProgress>
    <StyledProgressDone style={{
      opacity: 1,
      width: `${progress}%`,
    }}
    />
  </StyledProgress>
);
