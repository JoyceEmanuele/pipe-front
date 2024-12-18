import { Box, Flex } from 'reflexbox';
import { colors } from '../../styles/colors';

import {
  Circular,
  Circle,
} from './styles';

export const LoaderWithText = ({ variant, text }: { variant?: 'primary'|'secondary', text: string }): JSX.Element => (
  <Flex flexDirection="column" justifyContent="center" alignItems="center" height="calc(100vh - 210px)">
    <div style={{ width: '50px' }}>
      <Circular viewBox="25 25 50 50">
        <Circle
          stroke={variant === 'secondary' ? colors.White : colors.A350}
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke-miterlimit="10"
        />
      </Circular>
    </div>
    <Box width={['95%', '95%', '70%', '60%', '50%', '50%']} marginTop="8px" textAlign="center">
      {text}
    </Box>
  </Flex>
);
