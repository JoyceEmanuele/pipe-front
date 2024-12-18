import { useEffect, useState } from 'react';
import OrderIcon from '~/assets/img/order.svg';
import { Table } from '~/components';
import { getCardColor, getColorCo2, getColorHumi } from '../..';
import { getUserProfile } from '~/helpers/userProfile';
import { formatRssiIcon, rssiDesc } from '../../..';
import { t } from 'i18next';
import {
  TableItemLabel, TableItemTemperature, TransparentLink, TableItemCell, InfoInvisibleDuts,
} from './styles';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { IconWiFiRealTime } from '../../../UnitDetailDACsDAMs/components/MosaicListItem/styles';

const dutColumns = [
  {
    Header: () => (
      <span>
        {t('ambiente')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'ROOM_NAME',
    Cell: (props) => (
      <TableItemCell>
        <TransparentLink style={{ fontSize: 13 }} to={`/analise/dispositivo/${props.row.original.DEV_ID}/informacoes`}>{props.row.original.ROOM_NAME}</TransparentLink>
      </TableItemCell>
    ),
  },
  {
    Header: () => (
      <span>
        {t('temperatura')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'Temperature',
    Cell: (props) => (
      <TableItemTemperature>
        <TableItemCell>{props.row.original.Temperature && props.row.original.Temperature !== '-' && props.row.original.status === 'ONLINE' ? `${formatNumberWithFractionDigits(props.row.original.Temperature)}ºC` : '-'}</TableItemCell>
        {
          (props.row.original.Temperature && (props.row.original.TUSEMIN || props.row.original.TUSEMAX)) && (
            <TableItemCell style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div
                style={{
                  width: 15,
                  height: 15,
                  backgroundColor: getCardColor(props.row.original.Temperature && props.row.original.Temperature !== '-' && props.row.original.status === 'ONLINE' ? props.row.original.Temperature : null, props.row.original.temprtAlert, props.row.original.TUSEMIN, props.row.original.TUSEMAX),
                  borderRadius: 5,
                }}
              />
              {(props.row.original.TUSEMIN && props.row.original.TUSEMAX) && `${formatNumberWithFractionDigits(props.row.original.TUSEMIN)}°C a ${formatNumberWithFractionDigits(props.row.original.TUSEMAX)}°C`}
            </TableItemCell>
          )
        }
      </TableItemTemperature>
    ),
  },
  {
    Header: () => (
      <span>
        {t('umidade')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'Humidity',
    Cell: (props) => (
      <TableItemTemperature>
        <TableItemCell>{props.row.original.Humidity ? `${formatNumberWithFractionDigits(props.row.original.Humidity)}%` : '-'}</TableItemCell>
        {
          (props.row.original.Humidity && (props.row.original.HUMIMAX || props.row.original.HUMIMIN)) && (
            <TableItemCell style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 15,
                  height: 15,
                  backgroundColor: getColorHumi(props.row.original.Humidity, props.row.original.HUMIMAX, props.row.original.HUMIMIN),
                  borderRadius: 5,
                }}
              />
              {`${props.row.original.HUMIMIN ? formatNumberWithFractionDigits(props.row.original.HUMIMIN) : '- '}% a ${props.row.original.HUMIMAX ? formatNumberWithFractionDigits(props.row.original.HUMIMAX) : '- '}%`}
            </TableItemCell>
          )
        }
      </TableItemTemperature>
    ),
  },
  {
    Header: () => (
      <span>
        CO2
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'eCO2',
    Cell: (props) => (
      <TableItemTemperature>
        <TableItemCell>
          {props.row.original.eCO2 ? `${formatNumberWithFractionDigits(props.row.original.eCO2)}ppm` : '-'}
        </TableItemCell>
        {
          (props.row.original.CO2MAX && props.row.original.eCO2) && (
            <TableItemCell style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 15,
                  height: 15,
                  backgroundColor: getColorCo2(props.row.original.eCO2, props.row.original.CO2MAX),
                  borderRadius: 5,
                }}
              />
              {props.row.original.CO2MAX ? `${formatNumberWithFractionDigits(props.row.original.CO2MAX)}ppm` : ''}
            </TableItemCell>
          )
        }
      </TableItemTemperature>
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
      <IconWiFiRealTime style={{ marginTop: '18px', marginLeft: '6px' }}>
        {formatRssiIcon(rssiDesc(props.row.original.RSSI, props.row.original.status))}
      </IconWiFiRealTime>
    ),
  },
];

export const DutTable = ({ notVisible, filterDuts }): React.ReactElement => {
  const [profile] = useState(getUserProfile);
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  const [listViewInvisibleDuts, setListViewInvisibleDuts] = useState(false);

  useEffect(() => {
    function handleWindowResize() {
      setWindowWidth(getWindowWidth());
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [listViewInvisibleDuts]);

  function getWindowWidth() {
    const { innerWidth } = window;
    return { innerWidth };
  }

  function rowDut(props) {
    return (
      <TableItemLabel color={getCardColor(props.row.original.Temperature && props.row.original.Temperature !== '-' && props.row.original.status === 'ONLINE' ? props.row.original.Temperature : null, props.row.original.temprtAlert, props.row.original.TUSEMIN, props.row.original.TUSEMAX)}>
        <div />
        <span>{props.row.original.ROOM_NAME && ((windowWidth.innerWidth < 992) && (props.row.original.ROOM_NAME.length > 40) ? props.row.original.ROOM_NAME.slice(0, 40).concat('...') : props.row.original.ROOM_NAME)}</span>
      </TableItemLabel>
    );
  }

  const countInvisible = notVisible.length;
  const allDuts = [...filterDuts, ...notVisible];
  return (
    <>
      <Table style={{ borderRadius: '0px' }} columns={dutColumns} data={listViewInvisibleDuts ? allDuts : filterDuts} border={false} dense={false} />
      {
        (profile.permissions.isAdminSistema && countInvisible > 0) && (
          <InfoInvisibleDuts>
            {
              listViewInvisibleDuts ? (
                <>
                  <p>
                    {t('exibindo')}
                    {' '}
                    <b>{countInvisible}</b>
                    {' '}
                    { countInvisible > 1 ? t('ambientesInvisiveis') : t('ambienteInvisivel') }
                    .
                  </p>
                  <h6 onClick={() => setListViewInvisibleDuts(!listViewInvisibleDuts)}>{t('ocultar')}</h6>
                </>
              ) : (
                <>
                  <p>
                    <b>{countInvisible}</b>
                    {' '}
                    { countInvisible > 1 ? t('ambientesInvisiveisParaCliente') : t('ambienteInvisivelparaOCliente')}
                    .
                  </p>
                  <h6 onClick={() => setListViewInvisibleDuts(!listViewInvisibleDuts)}>{t('exibir')}</h6>
                </>
              )
            }
          </InfoInvisibleDuts>
        )
      }

    </>
  );
};
