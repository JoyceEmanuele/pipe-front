import { Flex } from 'reflexbox';
import {
  ItemTitle,
  IconWrapper,
} from './styles';

import {
  WatchIcon,
} from '../../icons';

interface ComponentProps {
  DEV_ID: string|null,
  SCHEDULES_ACTIVE_QUANTITY: number
  SCHEDULE_TOTAL_QUANTITY: number
  handleOnClick
}

export const ScheduleButton = (props: ComponentProps): JSX.Element => {
  const twoDigits = props.SCHEDULES_ACTIVE_QUANTITY >= 10;

  return (
    <>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        height="48px"
        width="255px"
        alignItems="left"
        mt={2}
        mr={0}
        style={{
          border: '1px solid lightgrey',
          borderRadius: '7px',
          cursor: 'pointer',
        }}
        onClick={() => props.handleOnClick()}
      >
        <div style={{ marginLeft: '11px', marginTop: '5px' }}>
          <IconWrapper>
            <WatchIcon />
          </IconWrapper>
        </div>
        <div style={{
          marginLeft: '10px',
          marginTop: '10px',
          color: '#5B5B5B',
          width: '188px',
        }}
        >
          <ItemTitle>
            Checar Programações
          </ItemTitle>
        </div>
        {props.SCHEDULE_TOTAL_QUANTITY > 2 && (
          <div style={{
            marginLeft: '0px',
            marginTop: '-10px',
            marginRight: '-12px',
            color: '#FFFFFF',
            backgroundColor: '#363BC4',
            width: '20px',
            height: '20px',
            borderRadius: '10px',
          }}
          >
            <div style={{
              marginLeft: !twoDigits ? '7px' : '3px',
              marginTop: '-4px',
              fontSize: '11px',
            }}
            >
              {props.SCHEDULES_ACTIVE_QUANTITY}
            </div>
          </div>
        )}
      </Flex>
    </>
  );
};
