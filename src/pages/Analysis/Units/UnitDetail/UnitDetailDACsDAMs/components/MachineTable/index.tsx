import { useEffect, useState } from 'react';
import { t } from 'i18next';
import { Table } from '~/components';
import { formatHealthIcon } from '~/components/HealthIcon';
import { IMachineTableItem } from '../../constants';
import {
  Icon, StatusBox, TableExpandButton, TransparentLink, TableItemCell,
} from './styles';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import { TooltipContainer } from '../../styles';
import { InfoIcon, VAVClosedIcon, VAVOpenedIcon } from '~/icons';
import { Flex } from 'reflexbox';
import { IconWiFiRealTime } from '../MosaicListItem/styles';
import { formatRssiIcon, rssiDesc } from '../../..';

export const MachineTable = ({ machineItems }): React.ReactElement => {
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());

  useEffect(() => {
    function handleWindowResize() {
      setWindowWidth(getWindowWidth());
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  function getWindowWidth() {
    const { innerWidth } = window;
    return { innerWidth };
  }

  const [rows, setRows] = useState<IMachineTableItem>([]);

  useEffect(() => {
    setRows(machineItems);
  }, [machineItems]);

  const machineColumns = [
    {
      Header: () => (
        <span>
          {' '}
        </span>
      ),
      accessor: 'GROUP_ID',
      enableSorting: false,
      Cell: (props) => (
        <>
          {
            props.row.original.isExpandable
              ? (
                <TableExpandButton
                  type="button"
                  onClick={() => {
                    setRows(rows.map((machineItem) => {
                      if (machineItem.GROUP_ID === props.row.original.GROUP_ID) {
                        if (!machineItem.isExpandable) {
                          machineItem.hide = !machineItem.hide;
                          machineItem.backgroundColor = machineItem.hide ? undefined : '#e6e6e6';
                        } else {
                          machineItem.isExpanded = !machineItem.isExpanded;
                          machineItem.backgroundColor = machineItem.isExpanded ? '#e6e6e6' : undefined;
                        }
                      }
                      return machineItem;
                    }));
                  }}
                >
                  {props.row.original.isExpanded ? '-' : '+'}
                </TableExpandButton>
              )
              : null
          }
        </>
      ),
    },
    {
      Header: () => (
        <span>
          TAG
        </span>
      ),
      accessor: 'DAC_NAME',
      Cell: (props) => (
        <TransparentLink to={`/analise/dispositivo/${props.row.original.DAC_ID}/informacoes`}>
          <TableItemCell>{props.row.original.DAC_NAME}</TableItemCell>
        </TransparentLink>
      ),
    },
    {
      Header: () => (
        <span>
          {t('maquina')}
        </span>
      ),
      accessor: 'GROUP_NAME',
      Cell: (props) => getTableMachine(props, windowWidth),
    },
    {
      Header: () => (
        <span>
          {t('ativo')}
        </span>
      ),
      accessor: 'DAT_ID',
      Cell: (props) => (
        <TransparentLink to={`/analise/dispositivo/${props.row.original.DAT_ID}/informacoes`}>
          <TableItemCell>{props.row.original.DAT_ID}</TableItemCell>
        </TransparentLink>
      ),
    },
    {
      Header: () => (
        <span>
          {t('dispositivo')}
        </span>
      ),
      accessor: 'DAC_ID',
      Cell: (props) => (
        <TransparentLink to={`/analise/dispositivo/${props.row.original.DAC_ID}/informacoes`}>
          <TableItemCell>{props.row.original.DAC_ID}</TableItemCell>
        </TransparentLink>
      ),
    },
    {
      Header: () => (
        <span>
          {t('saude')}
        </span>
      ),
      accessor: 'H_INDEX',
      Cell: (props) => (
        (props.row.original.DAC_ID && props.row.original.DAC_APPL !== 'trocador-de-calor')
          ? (
            <Icon health={props.row.original.H_INDEX}>
              {formatHealthIcon(props.row.original.H_INDEX)}
            </Icon>
          )
          : (
            <>
              <InfoIcon data-tip data-for={props.row.original.DAT_ID} color="#6A6A6A" />
              <ReactTooltip
                id={props.row.original.DAT_ID}
                place="top"
                backgroundColor="#636363"
                effect="solid"
              >
                <Flex maxWidth="154px" color="white" fontSize="10px" fontWeight="500" lineHeight="11px">
                  <span>
                    Este
                    <strong style={{ fontWeight: '700' }}> Ativo </strong>
                    não é
                    <br />
                    monitorado remotamente
                    <br />
                    pela Diel Energia.
                  </span>
                </Flex>
              </ReactTooltip>
            </>
          )
      ),
    },
    {
      Header: () => (
        <span>
          {t('historico')}
        </span>
      ),
      accessor: 'lastCommTS',
      Cell: (props) => (
        <>
          {props.row.original.lastCommTS ? (
            <TableItemCell>
              {getLastAtt(props.row.original.lastCommTS)}
            </TableItemCell>
          ) : null}
        </>
      ),
    },
    {
      Header: () => (
        <span>
          {t('vidaUtil')}
        </span>
      ),
      accessor: 'lifespan',
      Cell: () => (
        <TableItemCell>-</TableItemCell>
      ),
    },
    {
      Header: () => (
        <span>
          Status
        </span>
      ),
      accessor: 'Lcmp',
      Cell: (props) => {
        if (props.row.original.DAC_APPL === 'trocador-de-calor' && props.row.original.DAC_TYPE === 'tipo-trocador-de-calor') {
          return '-';
        }

        if (((props.row.original.status === 'ONLINE') && (props.row.original.Lcmp != null))) {
          if (props.row.original.isVAV) {
            return props.row.original.Lcmp ? (
              <VAVOpenedIcon />
            ) : (
              <VAVClosedIcon />
            );
          }
          return (
            <>
              <StatusBox isPrimary={false} status={props.row.original.Lcmp}>
                {[t('desligadoMinusculo'), t('ligadoMinusculo')][props.row.original.Lcmp] || props.row.original.Lcmp }
              </StatusBox>
            </>
          );
        }
        return null;
      },
    },
    {
      Header: () => (
        <span>
          {t('conexao')}
        </span>
      ),
      accessor: 'status',
      Cell: (props) => (
        <Flex justifyContent="initial">
          {(props.row.original.status && props.row.original.DAC_ID) ? (
            <IconWiFiRealTime style={{ marginTop: '18px' }}>
              {formatRssiIcon(rssiDesc(props.row.original.RSSI, props.row.original.status))}
            </IconWiFiRealTime>
          )
            : (
              <InfoIcon data-tip data-for={props.row.original.DAT_ID} color="#6A6A6A" />
            )}
        </Flex>
      ),
    },
  ];

  function getLastAtt(date: string) {
    if (moment().diff(moment(date), 'minutes') < 60) {
      return `Há ${moment().diff(moment(date), 'minutes')} minutos`;
    }
    if (moment().diff(moment(date), 'h') < 24) {
      return `Há ${moment().diff(moment(date), 'h')}:${moment().diff(moment(date), 'minutes')}h`;
    }
    if (moment().diff(moment(date), 'd') < 7) {
      return `Há ${moment().diff(moment(date), 'd')} dias`;
    }
    if (moment().diff(moment(date), 'weeks') < 4) {
      return `Há ${moment().diff(moment(date), 'weeks')} semanas`;
    }
    if (moment().diff(moment(date), 'months') < 12) {
      return `Há ${moment().diff(moment(date), 'months')} meses`;
    }

    return `Há ${moment().diff(moment(date), 'y')} anos`;
  }

  return (
    <Table
      columns={machineColumns}
      data={rows}
      border={false}
      dense={false}
      disableSortBy
    />
  );
};

function getTableMachine(props, windowWidth) {
  return (
    <>
      {
        props.row.original.GROUP_NAME && ((props.row.original.GROUP_NAME.length > 80) && (windowWidth.innerWidth > 1440)
          ? (
            <TableItemCell>
              {`${props.row.original.GROUP_NAME.substring(0, 80)}...`}
            </TableItemCell>
          )
          : (
            <>
              <TableItemCell data-tip data-for={props.row.original.GROUP_ID.toString()}>
                {(props.row.original.GROUP_NAME.length > 40) && (windowWidth.innerWidth < 1440) ? `${props.row.original.GROUP_NAME.substring(0, 40)}...` : props.row.original.GROUP_NAME}
              </TableItemCell>
              <ReactTooltip
                id={props.row.original.GROUP_ID.toString()}
                place="top"
                border
                textColor="#000000"
                backgroundColor="rgba(255, 255, 255, 0.97)"
                borderColor="#202370"
              >
                <TooltipContainer>
                  <span>{t('maquina')}</span>
                  <strong>{props.row.original.GROUP_NAME}</strong>
                </TooltipContainer>
              </ReactTooltip>
            </>
          ))
      }
    </>
  );
}
