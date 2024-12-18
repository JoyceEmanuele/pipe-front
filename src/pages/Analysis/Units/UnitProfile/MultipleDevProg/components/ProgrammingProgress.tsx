import { ReactElement } from 'react';
import { Flex } from 'reflexbox';
import { ProgressBar } from 'components';
import { TextProgressBar } from '../../styles';

interface ProgrammingProgressProps {
  currentDevices: number;
  totalDevices: number;
}

export const ProgrammingProgress = ({ currentDevices, totalDevices }: ProgrammingProgressProps): ReactElement => {
  function calculateProgress(): number {
    return Math.floor((currentDevices * 100) / totalDevices);
  }

  return (
    <Flex flexDirection="row" width="80%" alignSelf="flex-start" style={{ gap: '0 8px', width: '100%' }}>
      <ProgressBar progress={calculateProgress()} />
      <TextProgressBar>
        {`${currentDevices}/${totalDevices}`}
      </TextProgressBar>
    </Flex>
  );
};
