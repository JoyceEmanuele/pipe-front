import { Flex } from 'reflexbox';
import OrderIcon from '~/assets/img/order.svg';
import { Table } from '~/components';
import { IconWiFiRealTime } from '../../../UnitDetailDACsDAMs/components/MosaicListItem/styles';
import { t } from 'i18next';
import {
  TransparentLink, TableItemCell,
} from '../../styles';
import { UtilityIcon } from '~/icons';
import { formatRssiIcon, getIlluminationStatus, getIlluminationMode } from '../MosaicCard';
import { ToggleSwitchMini } from 'components/ToggleSwitch';
import { DALSchedule } from 'pages/Analysis/SchedulesModals/DAL_Schedule';
import { useState } from 'react';
import { getUserProfile } from '~/helpers/userProfile';

function getIlluminationColumns(permissionProfile: boolean) {
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
          <Flex alignItems="center" style={{ fontSize: '14px' }}>
            <Flex justifyContent="center" style={{ width: '50px' }}>
              <UtilityIcon />
            </Flex>
            <Flex flexDirection="column">
              <TransparentLink to={`/analise/utilitario/iluminacao/${props.row.original.ID}/informacoes`}>
                {props.row.original.NAME}
              </TransparentLink>
              <div style={{ color: '#7B7B7B', fontSize: '11.8px' }}>
                {props.row.original.DAT_CODE && (
                  <TransparentLink to={`/analise/utilitario/iluminacao/${props.row.original.ID}/informacoes`}>
                    <span>{`${props.row.original.DAT_CODE} /`}</span>
                  </TransparentLink>
                )}
                {(props.row.original.DAL_CODE || props.row.original.DMT_CODE || props.row.original.DAM_ILLUMINATION_CODE) && (
                  <TransparentLink to={`/analise/dispositivo/${props.row.original.DAL_CODE || props.row.original.DMT_CODE || props.row.original.DAM_ILLUMINATION_CODE}/informacoes`}>
                    <span>{props.row.original.DAL_CODE || props.row.original.DMT_CODE || props.row.original.DAM_ILLUMINATION_CODE}</span>
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
          {t('automacao')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'Automation',
      Cell: (props) => (
        <TableItemCell>
          {props.row.original.PORT ? (
            <Flex alignItems="center">
              <span style={{ fontSize: '11px', color: '#6D6D6D', fontWeight: 500 }}>Auto</span>
              <ToggleSwitchMini
                onOff={false}
                checked={getIlluminationMode(props.row.original, props.row.original.telemetry) === 'MANUAL'}
                style={{ margin: '0 5px', cursor: 'unset' }}
              />
              <span style={{ fontSize: '11px', color: '#6D6D6D', fontWeight: 500 }}>{t('manual')}</span>
            </Flex>
          ) : '-'}
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
            {getIlluminationStatus(props.row.original, props.row.original.telemetry)}
          </Flex>
        </TableItemCell>
      ),
    },
    {
      Header: () => (
        <span>
          {t('programacao')}
          {' '}
          <img src={OrderIcon} />
        </span>
      ),
      accessor: 'Auton',
      Cell: (props) => (
        <TableItemCell>
          {props.row.original.PORT && props.row.original.DAL_CODE ? (
            <DALSchedule
              deviceCode={props.row.original.DAL_CODE}
              illumId={props.row.original.ID}
              illumName={props.row.original.NAME}
              canEdit={permissionProfile}
              isModal
              onlyIcon
            />
          ) : '-'}
        </TableItemCell>
      ),
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

export const IlluminationTable = ({ filterIlluminations }): React.ReactElement => {
  const [profile] = useState(getUserProfile);
  const utilityInfo = filterIlluminations?.length > 0 && filterIlluminations[0];
  let permissionProfile = (utilityInfo && utilityInfo?.CLIENT_ID
    ? profile.adminClientProg?.CLIENT_MANAGE.some((item) => item === utilityInfo?.CLIENT_ID)
    : false) || profile.manageAllClients;

  if (permissionProfile === false || permissionProfile === undefined) {
    permissionProfile = !!profile.adminClientProg?.UNIT_MANAGE.some((item) => item === utilityInfo?.UNIT_ID);
  }

  const illuminationColumns = getIlluminationColumns(permissionProfile);
  return (
    <Flex flexWrap="wrap" style={{ maxHeight: '505px', overflowY: 'auto' }}>
      <Table style={{ borderRadius: '0px' }} columns={illuminationColumns} data={filterIlluminations} border={false} dense={false} />
    </Flex>
  );
};
