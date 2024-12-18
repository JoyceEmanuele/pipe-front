import { Box, Flex } from 'reflexbox';
import { ProgressBarChildren, ProgressBarContainer } from './styles';
import { useEffect, useState } from 'react';

export default function ProgressBar(props: { progress: number | null, title: string, disabled?: boolean }): JSX.Element {
  const { progress, title, disabled } = props;

  const [counterState, setCounter] = useState(0);
  useEffect(() => {
    let timer;
    clearInterval(timer);
    timer = setInterval(() => {
      if (counterState === (progress ?? 0)) {
        clearInterval(timer);
        return;
      }
      setCounter((prev) => (prev > (progress ?? 0) ? prev - 1 : prev + 1));
    }, (10));
    return () => clearInterval(timer);
  }, [counterState, progress]);

  return (
    <Flex flexDirection="column">
      <Box>
        {!disabled && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{`${counterState.toString().padStart(2, '0')}% `}</span>}
        <span style={{ fontSize: '10px', color: disabled ? '#D9D9D9' : 'unset' }}>{title}</span>
      </Box>
      <ProgressBarContainer>
        <ProgressBarChildren progress={disabled ? 0 : (counterState ?? 0)} />
      </ProgressBarContainer>
    </Flex>
  );
}
