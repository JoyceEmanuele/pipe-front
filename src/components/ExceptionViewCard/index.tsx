import { Flex } from 'reflexbox';
import {
  IconWrapper,
} from './styles';
import { ScheduleDut, ExceptionDut } from '../../providers/types/api-private';
import { PenIcon } from '../../icons';
import { FaRegTrashAlt } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';

interface ComponentProps {
  exception: ExceptionDut,
  cardPosition?: number,
  schedule?: ScheduleDut,
  hideButtons?: boolean,
  onHandleEdit?,
  onHandleDelete?,
}

export const ExceptionViewCard = (props: ComponentProps): JSX.Element => {
  function exceptionTitle() {
    const overExtended = props.exception.EXCEPTION_TITLE.length > 19;
    const nameDisplay = !overExtended ? props.exception.EXCEPTION_TITLE : `${props.exception.EXCEPTION_TITLE.substring(0, 19)}...`;

    return (
      <>
        <div data-tip data-for={props.exception.EXCEPTION_TITLE}>
          {nameDisplay}
        </div>
        {overExtended && (
          <ReactTooltip
            id={props.exception.EXCEPTION_TITLE}
            place="top"
            effect="solid"
            delayHide={100}
            offset={{ top: 0, left: 10 }}
            textColor="#000000"
            border
            backgroundColor="rgba(255, 255, 255, 0.97)"
          >
            <span style={{ marginTop: '6px', fontSize: '95%' }}>
              <strong>
                {props.exception.EXCEPTION_TITLE}
              </strong>
            </span>
          </ReactTooltip>
        )}
      </>
    );
  }

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="row"
      height="32px"
      width="709px"
      style={{
        borderTop: '1px solid #D7D7D7',
        borderRight: '1px solid #D7D7D7',
        borderBottom: '1px solid #D7D7D7',
        borderLeft: '10px solid #363BC4',
        borderRadius: '5px',
        marginLeft: '10px',
      }}
    >
      <div
        style={{
          marginLeft: '17px',
          marginTop: '5px',
          fontSize: '12px',
          width: '151px',
          fontWeight: 'bold',
        }}
      >
        {exceptionTitle()}
      </div>
      <div
        style={{
          marginLeft: '74px',
          marginTop: '5px',
          fontSize: '12px',
          width: '90px',
        }}
      >
        {props.exception.EXCEPTION_DATE.substring(0, props.exception.REPEAT_YEARLY ? 5 : 10)}
      </div>
      <div
        style={{
          marginLeft: '13px',
          marginTop: '5px',
          fontSize: '12px',
          width: '70px',
        }}
      >
        {`${props.exception.REPEAT_YEARLY ? 'Sim' : 'Não'}`}
      </div>
      <div
        style={{
          marginLeft: '69px',
          marginTop: '5px',
          fontSize: '12px',
          width: '52px',
        }}
      >
        {props.exception.BEGIN_TIME}
      </div>
      <div
        style={{
          marginLeft: '23px',
          marginTop: '5px',
          fontSize: '12px',
          width: '52px',
        }}
      >
        {props.exception.END_TIME}
      </div>
      {!props.hideButtons && (
      <>
        <div
          style={{
            marginLeft: '32px',
            marginTop: '3px',
          }}
        >
          <IconWrapper
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.preventDefault(); props.onHandleEdit(props.cardPosition); }}
          >
            <PenIcon />
          </IconWrapper>
        </div>
        <div
          style={{
            marginLeft: '12px',
            marginTop: '3px',
          }}
        >
          <FaRegTrashAlt
            color="#ED193F"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm(`Deseja excluir a programação ${props.exception.EXCEPTION_TITLE}?`)) {
                props.onHandleDelete(props.exception.DUT_EXCEPTION_ID, props.cardPosition);
              }
            }}
          />
        </div>
      </>
      )}
    </Flex>
  );
};
