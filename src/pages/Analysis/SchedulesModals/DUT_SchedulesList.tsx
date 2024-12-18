import { Flex } from 'reflexbox';
import '~/assets/css/ReactTags.css';
import {
  ScheduleViewCard,
  ExceptionViewCard,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { useHistory } from 'react-router-dom';
import { ScheduleDut, ExceptionDut } from '../../../providers/types/api-private';

export const DutSchedulesList = (props: {
  schedules: ScheduleDut[]
  exceptions: ExceptionDut[]
}): JSX.Element => {
  const history = useHistory();
  const [state, render, setState] = useStateVar({
    submitting: false,
    editingExtras: false,
    isLoading: false as boolean,
    key: 1 as number,
    showExceptions: false as boolean,
  });

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="row"
      alignItems="left"
      width="791px"
      height="677px"
      style={{
        borderTop: '15px solid #363BC4',
        borderRadius: '5px',
      }}
    >
      <Flex
        flexWrap="nowrap"
        flexDirection="column"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 6px 150px auto',
            height: '5px',
            marginTop: '24px',
          }}
        >
          <span
            style={{
              borderTop: '1px solid lightgrey',
              borderRight: '1px solid lightgrey',
              borderRadius: '6px 6px 0 0',
              backgroundColor: state.showExceptions ? '#f4f4f4' : 'transparent',
            }}
          />
          <span />
          <span
            style={{
              border: '1px solid lightgrey',
              borderBottom: 'none',
              borderRadius: '6px 6px 0 0',
              backgroundColor: state.showExceptions ? 'transparent' : '#f4f4f4',
            }}
          />
          <span />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 6px 150px auto' }}>
          <span
            style={{
              borderRight: '1px solid lightgrey',
              textAlign: 'center',
              fontSize: '90%',
              borderBottom: state.showExceptions ? '1px solid lightgrey' : 'none',
              backgroundColor: state.showExceptions ? '#f4f4f4' : 'transparent',
              cursor: state.showExceptions ? 'pointer' : undefined,
              fontWeight: state.showExceptions ? 'normal' : 'bold',
            }}
            onClick={() => { state.showExceptions && setState({ showExceptions: !state.showExceptions, showList: false }); }}
          >
            Programações
          </span>
          <span
            style={{
              borderBottom: '1px solid lightgrey',
            }}
          />
          <span
            style={{
              borderLeft: '1px solid lightgrey',
              borderRight: '1px solid lightgrey',
              textAlign: 'center',
              fontSize: '90%',
              borderBottom: state.showExceptions ? 'none' : '1px solid lightgrey',
              backgroundColor: state.showExceptions ? 'transparent' : '#f4f4f4',
              cursor: (!state.showExceptions) ? 'pointer' : undefined,
              fontWeight: !state.showExceptions ? 'normal' : 'bold',
            }}
            onClick={() => { (!state.showExceptions) && setState({ showExceptions: !state.showExceptions }); }}
          >
            Exceções
          </span>
          <span
            style={{
              borderBottom: '1px solid lightgrey',
            }}
          />
        </div>
        <div style={{
          fontSize: '16px',
          marginTop: '24px',
          marginLeft: '37px',
        }}
        >
          {`Total: ${!state.showExceptions ? props.schedules.length : props.exceptions.length}`}
        </div>
        {!state.showExceptions && (
          <>
            {props.schedules.map((schedule, index) => (index % 2 === 0
              ? (
                <Flex
                  style={{
                    marginTop: index === 0 ? '32px' : '10px',
                    marginLeft: '37px',
                  }}
                  flexDirection="row"
                >
                  <ScheduleViewCard cardPosition={index} schedule={schedule} hideButtons />
                  {index + 1 < props.schedules.length ? <ScheduleViewCard cardPosition={index} schedule={props.schedules[index + 1]} hideButtons /> : <></>}
                </Flex>
              )
              : (
                <></>
              )))}
          </>
        )}
        {state.showExceptions && props.exceptions.length > 0 && (
          <>
            <Flex
              style={{
                marginTop: '25px',
                marginLeft: '43px',
              }}
              flexDirection="row"
            >
              <div
                style={{
                  fontWeight: 'bold',
                  width: '42px',
                  fontSize: '13px',
                }}
              >
                Título
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  marginLeft: '193px',
                  width: '42px',
                  fontSize: '13px',
                }}
              >
                Data
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  marginLeft: '61px',
                  width: '111px',
                  fontSize: '13px',
                }}
              >
                Repetir todo ano
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  marginLeft: '28px',
                  width: '42px',
                  fontSize: '13px',
                }}
              >
                Início
              </div>
              <div
                style={{
                  fontWeight: 'bold',
                  marginLeft: '33px',
                  width: '30px',
                  fontSize: '13px',
                }}
              >
                Fim
              </div>
            </Flex>
            {props.exceptions.map((exception, index) => (
              <Flex
                style={{
                  marginTop: '5px',
                  marginLeft: '16px',
                }}
                flexDirection="column"
              >
                <ExceptionViewCard exception={exception} hideButtons />
              </Flex>
            ))}
          </>
        )}
      </Flex>
    </Flex>
  );
};
