import { useEffect, useState } from 'react';
import { ApiResps, apiCall } from '../../../providers';
import {
  ActionButton,
  Loader,
  NewTable,
} from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { DeleteOutlineIcon, EditIcon } from '~/icons';
import { colors } from '~/styles/colors';
import { useTranslation } from 'react-i18next';
import { FaTools } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { TooltipContainer } from '~/pages/Analysis/Units/UnitDetail/UnitDetailDACsDAMs/styles';
import { TableItemCell } from '~/pages/Analysis/Units/UnitDetail/UnitDetailDACsDAMs/components/MachineTable/styles';
import { GetUsersListType } from '~/metadata/GetUsersList';
import { useParams } from 'react-router-dom';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export const TableUnits = ({
  list, energyMeters, unitsDisp, unitsDispLoading, onDeleteClick, onEditClick, onToggleReportClick, waterList, renderUnits,
}): JSX.Element => {
  const { clientId } = useParams<{ clientId: string }>();
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const [usersList, setUsersList] = useState<GetUsersListType[]>([]);
  const [listChecked, setListChecked] = useState(list.map((item) => ({ ...item, checked: false })));
  const [state, setState] = useState({
    isLoading: true,
    unitsSupervisorsList: [] as { UNIT_ID: number, NOME: string, SOBRENOME: string }[],
  });

  async function getClientUsers(unitId?: number) {
    const response = await apiCall('/users/list-users', { CLIENT_ID: Number(clientId), includeAdmins: false });
    setUsersList(response.list);
  }

  async function getUnitsSupervisors() {
    const data = await apiCall('/clients/get-unit-supervisors', { UNIT_IDS: list.map((unit) => unit.UNIT_ID) });
    const unitsSupervisorsList = data.list;
    setState({ isLoading: false, unitsSupervisorsList });
  }

  useEffect(() => {
    getUnitsSupervisors();
    getClientUsers();
    setListChecked(list.map((item) => ({ ...item, checked: false })));
  }, [list]);

  const columns = [
    {
      name: 'id',
      value: 'ID',
      accessor: 'UNIT_ID',
      width: 47,
    },
    {
      name: 'name',
      value: t('nome'),
      accessor: 'UNIT_NAME',
    },
    {
      name: 'unit_code_celsius',
      value: t('codigoDaUnidade'),
      accessor: 'UNIT_CODE_CELSIUS',
    },
    profile.manageAllClients && {
      name: 'status',
      value: t('status'),
      acessor: 'PRODUCTION',
      render: (props) => (
        props.PRODUCTION === 0 ? (
          <>
            <ReactTooltip
              id={`tooltip-${props.UNIT_ID}`}
              place="top"
              border
              textColor="#000000"
              backgroundColor="rgba(255, 255, 255, 0.97)"
              borderColor="#202370"
            >
              <TooltipContainer>
                <strong>Em instalação</strong>
              </TooltipContainer>
            </ReactTooltip>
            <TableItemCell data-tip data-for={`tooltip-${props.UNIT_ID}`}>
              <FaTools color={colors.LightBlue} />
            </TableItemCell>
          </>
        ) : (
          <div />
        )
      ),
    },
    {
      name: 'country',
      value: t('pais'),
      accessor: 'COUNTRY_NAME',
    },
    {
      name: 'state',
      value: t('estado'),
      accessor: 'STATE_ID',
    },
    {
      name: 'city',
      value: t('cidade'),
      accessor: 'CITY_NAME',
    },
    {
      name: 'latlon',
      value: 'LAT e LONG',
      accessor: 'LATLON',
      width: 160,
      render: (props) => (
        <div data-tip data-for={props.LATLON}>
          {`${props.LATLON}`}
          <ReactTooltip
            id={props.LATLON}
            place="top"
            effect="solid"
            delayHide={100}
            offset={{ top: 0, left: 10 }}
            textColor="#000000"
            border
            backgroundColor="rgba(255, 255, 255, 0.97)"
          >
            <div>
              <h4>{`LAT: ${props.LAT}`}</h4>
              <h4>{`LON: ${props.LON}`}</h4>
            </div>
          </ReactTooltip>
        </div>
      ),
    },
    {
      name: 'devices',
      value: t('dispositivos'),
      accessor: 'DEVICES',
    },
    {
      name: 'disp',
      value: t('disponibilidadeUltimos7Dias'),
      accessor: 'AVAILABILITY_LAST_7_DAYS',
    },
    {
      name: 'resp',
      value: t('responsaveis'),
      accessor: 'RESPONSIBLE',
    },
    profile.manageAllClients && {
      name: 'relatorio',
      value: t('relatorio'),
      accessor: 'REPORT',
      render: (props) => (
        <div onClick={() => onToggleReportClick(props)} style={{ cursor: 'pointer' }}>{props.submitting ? '...' : (props.DISABREP ? '(desativado)' : '(ativado)')}</div>
      ),
    },
    {
      name: 'distributor',
      value: t('distribuidora'),
      accessor: 'DISTRIBUTOR_LABEL',
    },
    {
      name: 'Modelo',
      value: 'Modelo de tarifa',
      accessor: 'MODEL_NAME',
    },
    {
      name: 'energyMeter',
      value: t('medidorEnergia'),
      accessor: 'METER_ENEGY_DEVICE',
      render: (props) => (
        <div>
          {props.ENERGY_METER.length !== 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', margin: '10px 0px' }}>
              {props.ENERGY_METER.map((meter, index) => (
                <>
                  {index === 0 && <span style={{ color: colors.Grey200 }} key={meter}>{meter.MANUFACTURER}</span>}
                  {meter.MANUFACTURER === 'Diel Energia' && (
                    <span>{meter.ENERGY_DEVICE_ID}</span>
                  )}
                  <span>{meter.SERIAL}</span>
                </>
              ))}
            </div>
          ) : ('-')}
        </div>
      ),
    },
    {
      name: 'waterMeter',
      value: t('medidorDeAgua'),
      accessor: 'METER_WATER_INTEGR',
      render: (props) => (
        <div>
          {props.WATER_METER ? (
            <div style={{ display: 'flex', flexDirection: 'column', margin: '10px 0px' }}>
              <span style={{ color: colors.Grey200 }}>{props.WATER_METER.supplier === 'Diel' ? 'Diel Energia' : props.WATER_METER.supplier}</span>
              <span>{props.WATER_METER.integrId}</span>
            </div>
          ) : ('-')}
        </div>
      ),
    },
    profile.manageAllClients && {
      name: 'actions',
      value: t('acoes'),
      sortable: false,
      textAlign: 'center',
      width: 120,
      render: (props) => (
        <div>
          <ActionButton onClick={() => onDeleteClick(props)} variant="red-inv">
            <DeleteOutlineIcon colors={colors.Red} />
          </ActionButton>
          <ActionButton
            onClick={() => onEditClick(
              props,
            )}
            variant="blue-inv"
          >
            <EditIcon color={colors.LightBlue} />
          </ActionButton>
        </div>
      ),
    },
  ].filter((x) => !!x);

  function filterUnitSupervisors(unitId) {
    const unitSupervisors = state.unitsSupervisorsList.filter((unit) => unit.UNIT_ID === unitId);
    if (unitSupervisors && unitSupervisors.length > 0) {
      return (
        <div>
          {unitSupervisors.map((supervisor) => (
            <div key={supervisor.UNIT_ID + supervisor.NOME}>
              {`${supervisor.NOME} ${supervisor.SOBRENOME}`}
            </div>
          ))}
        </div>
      );
    }
    return '-';
  }

  if (state.isLoading) {
    return <Loader />;
  }
  return (
    <>
      {listChecked.map((item) => {
        item.ENERGY_METER = energyMeters.filter((meter) => meter.UNIT_ID === item.UNIT_ID);
        item.WATER_METER = waterList.find((water) => water.UNIT_ID === item.UNIT_ID);
        item.DEVICES = (item.DACS_COUNT + item.DUTS_COUNT || 0 + item.DAMS_COUNT + item.DRIS_COUNT) || '-';
        item.AVAILABILITY_LAST_7_DAYS = unitsDispLoading ? (<Loader />) : (unitsDisp[item.UNIT_ID]?.avgDisp != null ? `${formatNumberWithFractionDigits(unitsDisp[item.UNIT_ID]?.avgDisp.toFixed(1))}%` : '(sem cálculo)');
        item.RESPONSIBLE = state.isLoading ? (<Loader />) : filterUnitSupervisors(item.UNIT_ID);
        item.REPORT = item.submitting ? '...' : (item.DISABREP ? '(desativado)' : '(ativado)');
        item.METER_ENEGY_DEVICE = item.ENERGY_METER.map((x) => x.ENERGY_DEVICE_ID).join(';') || '-';
        item.METER_WATER_INTEGR = (item.WATER_METER && item.WATER_METER.integrId) || '-';
      })}

      <NewTable
        data={listChecked}
        supervisors={usersList}
        columns={columns}
        pageSize={20}
        checkBox
        multipleConfig
        renderUnits={() => { state.isLoading = true; renderUnits(); }}
        keySearch="searchUnits"
      />
    </>
  );
};
