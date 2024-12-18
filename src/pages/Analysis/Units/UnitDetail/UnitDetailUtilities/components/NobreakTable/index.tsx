import { Flex } from 'reflexbox';
import OrderIcon from '~/assets/img/order.svg';
import { Table } from '~/components';
import { IconWiFiRealTime } from '../../../UnitDetailDACsDAMs/components/MosaicListItem/styles';
import { t } from 'i18next';
import {
  TransparentLink, TableItemCell,
} from '../../styles';
import { UtilityIcon, InfoIcon } from '~/icons';
import { formatRssiIcon, getNobreakStatus } from '../MosaicCard';

function noInfoItem() {
  return (
    <TableItemCell>
      <Flex style={{ fontSize: '14px' }} alignItems="center">
        <InfoIcon width="25px" height="20px" />
        <Flex flexDirection="column" ml="5px">
          <span>{t('semInformacao')}</span>
        </Flex>
      </Flex>
    </TableItemCell>
  );
}

function getNobreakColumns() {
  return [
    {
      Header: () => (
        <Flex style={{ position: 'absolute' }}>
          <div style={{ width: '54px' }} />
          <span>
            {t('nome')}
            {' '}
            <img src={OrderIcon} />
          </span>
        </Flex>
      ),
      accessor: 'NAME',
      Cell: (props) => (
        <TableItemCell>
          <Flex style={{ fontSize: '14px' }} alignItems="center">
            <Flex style={{ width: '50px' }} justifyContent="center">
              <UtilityIcon />
            </Flex>
            <Flex flexDirection="column">
              <TransparentLink to={`/analise/utilitario/nobreak/${props.row.original.ID}/informacoes`}>
                {props.row.original.NAME}
              </TransparentLink>
              <div style={{ fontSize: '11.8px', color: '#7B7B7B' }}>
                {props.row.original.DAT_CODE && (
                  <TransparentLink to={`/analise/utilitario/nobreak/${props.row.original.ID}/informacoes`}>
                    <span>{`${props.row.original.DAT_CODE} /`}</span>
                  </TransparentLink>
                )}
                {props.row.original.DMT_CODE && (
                  <TransparentLink to={`/analise/dispositivo/${props.row.original.DMT_CODE}/informacoes`}>
                    <span>{props.row.original.DMT_CODE}</span>
                  </TransparentLink>
                )}
              </div>
            </Flex>
          </Flex>
        </TableItemCell>
      ),
    },
    {
      Header: () => (
        <span>
          {t('status')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'Status',
      Cell: (props) => (
        <TableItemCell>
          <Flex style={{ fontSize: '14px' }}>
            {getNobreakStatus(props.row.original, props.row.original.telemetry)}
          </Flex>
        </TableItemCell>
      ),
    },
    {
      Header: () => (
        <span>
          {t('duracaoMedia')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'AvgDuration',
      Cell: (props) => noInfoItem(),
    },
    {
      Header: () => (
        <span>
          {t('autonomia')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'Auton',
      Cell: (props) => noInfoItem(),
    },
    {
      Header: () => (
        <span>
          {t('feedback')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'PORT',
      Cell: (props) => <TableItemCell>{props.row.original.PORT || '-'}</TableItemCell>,
    },
    {
      Header: () => (
        <span>
          {t('conexao')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'status',
      Cell: (props) => (
        <TableItemCell>
          <IconWiFiRealTime style={{ marginLeft: '6px' }}>
            {formatRssiIcon(props.row.original.telemetry)}
          </IconWiFiRealTime>
        </TableItemCell>
      ),
    },
  ];
}

export const NobreakTable = ({ filterNobreaks }): React.ReactElement => {
  const nobreakColumns = getNobreakColumns();
  return (
    <Flex flexWrap="wrap" style={{ maxHeight: '505px', overflowY: 'auto' }}>
      <Table style={{ borderRadius: '0px' }} columns={nobreakColumns} data={filterNobreaks} border={false} dense={false} />
    </Flex>
  );
};
