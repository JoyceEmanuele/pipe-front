import { Flex } from 'reflexbox';
import {
  IconWrapper,
} from './styles';
import { ScheduleDut } from '../../providers/types/api-private';
import ReactTooltip from 'react-tooltip';
import { PenIcon } from '../../icons';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

interface ComponentProps {
  cardPosition: number;
  schedule: ScheduleDut,
  hideButtons: boolean,
  onHandleEdit?,
  onHandleDelete?,
}

export const ScheduleViewCard = (props: ComponentProps): JSX.Element => {
  const { t } = useTranslation();
  const dutControlOperation = [
    { label: t('desabilitado'), value: '0_NO_CONTROL' },
    { label: t('modoEco'), value: '1_CONTROL' },
    { label: t('modoSobDemanda'), value: '2_SOB_DEMANDA' },
    { label: t('modoBackup'), value: '3_BACKUP' },
    { label: t('modoBloqueio'), value: '4_BLOCKED' },
    { label: t('modoBackupEco'), value: '5_BACKUP_CONTROL' },
    { label: t('modoEco2'), value: '6_BACKUP_CONTROL_V2' },
    { label: t('modoForcado'), value: '7_FORCED' },
    { label: t('modoEco2'), value: '8_ECO_2' }];

  const borderColor = props.schedule.SCHEDULE_STATUS ? '#363BC4' : '#8E8E8E';
  let operationText = props.schedule.CTRLOPER ? dutControlOperation.find((item) => item.value === props.schedule.CTRLOPER)?.label : '-';
  operationText = props.schedule.PERMISSION === 'allow' ? operationText : t('desligadoMin');

  const showSetPoint = props.schedule.PERMISSION === 'allow' && (['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.schedule.CTRLOPER) || (props.schedule.FORCED_BEHAVIOR === 'dut-forced-cool' && props.schedule.SETPOINT != null));
  const showLtc = props.schedule.PERMISSION === 'allow' && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.schedule.CTRLOPER);
  const showLtiOnDemand = props.schedule.CTRLOPER === '2_SOB_DEMANDA' && !!props.schedule.LTI;
  const showLti = props.schedule.PERMISSION === 'allow' && (['6_BACKUP_CONTROL_V2', '8_ECO_2'].includes(props.schedule.CTRLOPER) || showLtiOnDemand);
  const showForcedOptions = props.schedule.PERMISSION === 'allow' && ['7_FORCED'].includes(props.schedule.CTRLOPER);

  function colorTextDaySelected(day: boolean): string {
    return day ? 'white' : 'black';
  }

  function colorBackgroundDaySelected(day: boolean): string {
    return day ? '#363BC4' : '#D3D3D3';
  }

  function scheduleTitle() {
    const overExtended = props.schedule.SCHEDULE_TITLE.length > 19;
    const nameDisplay = !overExtended ? props.schedule.SCHEDULE_TITLE : `${props.schedule.SCHEDULE_TITLE.substring(0, 19)}...`;

    return (
      <>
        <div style={{ marginTop: '6px', fontSize: '95%' }} data-tip data-for={props.schedule.SCHEDULE_TITLE}>
          <strong>
            {nameDisplay}
          </strong>
        </div>
        {overExtended && (
          <ReactTooltip
            id={props.schedule.SCHEDULE_TITLE}
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
                {props.schedule.SCHEDULE_TITLE}
              </strong>
            </span>
          </ReactTooltip>
        )}
      </>
    );
  }

  function scheduleStatus(): string {
    return props.schedule.SCHEDULE_STATUS ? t('habilitada') : t('desabilitada');
  }

  function forcedOptionMode(): string {
    return props.schedule.FORCED_BEHAVIOR === 'dut-forced-fan' ? t('ventilar') : t('refrigerar');
  }

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="column"
      height="258px"
      width="346px"
      style={{
        borderTop: '1px solid #D7D7D7',
        borderRight: '1px solid #D7D7D7',
        borderBottom: '1px solid #D7D7D7',
        borderLeft: `10px solid ${borderColor}`,
        borderRadius: '5px',
        marginLeft: '10px',
      }}
    >
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '28px',
          marginLeft: '17px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            width: '180px',
          }}
        >
          {scheduleTitle()}
        </div>
        <div
          style={{
            fontSize: '14px',
            marginLeft: '15px',
            fontWeight: 'bold',
          }}
        >
          {t('Programação')}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginLeft: '17px',
        }}
      >
        <div
          style={{
            width: '145px',
          }}
        >
          {!props.hideButtons && (
          <>
            <IconWrapper
              style={{ cursor: 'pointer' }}
              onClick={(e) => { e.preventDefault(); props.onHandleEdit(props.cardPosition); }}
            >
              <PenIcon />
            </IconWrapper>
            <FaRegTrashAlt
              color="#ED193F"
              style={{ marginLeft: '8px', cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                if (window.confirm(`Deseja excluir a programação ${props.schedule.SCHEDULE_TITLE}?`)) {
                  props.onHandleDelete(props.schedule.DUT_SCHEDULE_ID, props.cardPosition);
                }
              }}
            />
          </>
          )}
        </div>
        <div
          style={{
            fontSize: '14px',
            marginLeft: '50px',
          }}
        >
          {scheduleStatus()}
        </div>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '10px',
          marginLeft: '17px',
        }}
      >
        <div style={{ border: '1px solid #ECECEC', width: '293px' }} />
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginTop: '10px',
          marginLeft: '17px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            width: '145px',
          }}
        >
          {t('modoOperacao')}
        </div>
        {showSetPoint && (
          <div
            style={{
              fontSize: '14px',
              marginLeft: '50px',
              fontWeight: 'bold',
            }}
          >
            Setpoint
          </div>
        )}
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginLeft: '17px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            width: '145px',
          }}
        >
          {operationText || '-'}
        </div>
        <Flex
          flexWrap="nowrap"
          flexDirection="row"
          style={{
            marginLeft: '50px',
            height: '32px',
          }}
        >
          {showSetPoint && (
          <>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '22px',
              }}
            >
              {formatNumberWithFractionDigits(props.schedule.SETPOINT ?? '-')}
            </div>
            <div
              style={{
                fontSize: '16px',
                marginTop: '6px',
                marginLeft: '2px',
                color: '#8C8C8C',
              }}
            >
              ºC
            </div>
          </>
          )}
        </Flex>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginLeft: '17px',
          marginTop: '15x',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            width: '40px',
          }}
        >
          {t('inicio')}
        </div>
        <div
          style={{
            fontSize: '14px',
          }}
        >
          {props.schedule.BEGIN_TIME}
        </div>
        {showLtc && (
          <>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginLeft: '122px',
              }}
            >
              LTC
            </div>
            <div
              style={{
                fontSize: '14px',
                marginLeft: '3px',
              }}
            >
              {`${props.schedule.LTC != null ? formatNumberWithFractionDigits(props.schedule.LTC) : '-'} ºC`}
            </div>
          </>
        )}
        {showForcedOptions && (
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginLeft: '122px',
            }}
          >
            {t('funcao')}
          </div>
        )}
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginLeft: '17px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            width: '40px',
          }}
        >
          {t('fim')}
        </div>
        <div
          style={{
            fontSize: '14px',
          }}
        >
          {props.schedule.END_TIME}
        </div>
        {showLti && (
          <>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginLeft: '122px',
              }}
            >
              LTI
            </div>
            <div
              style={{
                fontSize: '14px',
                marginLeft: '7px',
              }}
            >
              {`${props.schedule.LTI != null ? formatNumberWithFractionDigits(props.schedule.LTI) : '-'} ºC`}
            </div>
          </>
        )}
        {showForcedOptions && (
          <div
            style={{
              fontSize: '14px',
              marginLeft: '122px',
            }}
          >
            {forcedOptionMode()}
          </div>
        )}
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="row"
        style={{
          marginLeft: '17px',
          marginTop: '17px',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            backgroundColor: colorBackgroundDaySelected(props.schedule.DAYS.sun),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: colorTextDaySelected(props.schedule.DAYS.sun),
            }}
          >
            {t('diaDom').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: colorBackgroundDaySelected(props.schedule.DAYS.mon),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: colorTextDaySelected(props.schedule.DAYS.mon),
            }}
          >
            {t('diaSeg').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: colorBackgroundDaySelected(props.schedule.DAYS.tue),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: colorTextDaySelected(props.schedule.DAYS.tue),
            }}
          >
            {t('diaTer').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: colorBackgroundDaySelected(props.schedule.DAYS.wed),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: colorTextDaySelected(props.schedule.DAYS.wed),
            }}
          >
            {t('diaQua').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: colorBackgroundDaySelected(props.schedule.DAYS.thu),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: colorTextDaySelected(props.schedule.DAYS.thu),
            }}
          >
            {t('diaQui').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: colorBackgroundDaySelected(props.schedule.DAYS.fri),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: colorTextDaySelected(props.schedule.DAYS.fri),
            }}
          >
            {t('diaSex').toLocaleUpperCase()}
          </div>
        </div>
        <div
          style={{
            width: '34px',
            height: '37px',
            borderRadius: '5px',
            marginLeft: '10px',
            backgroundColor: colorBackgroundDaySelected(props.schedule.DAYS.sat),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              marginTop: '11px',
              color: colorTextDaySelected(props.schedule.DAYS.sat),
            }}
          >
            {t('diaSab').toLocaleUpperCase()}
          </div>
        </div>
      </Flex>
    </Flex>
  );
};
