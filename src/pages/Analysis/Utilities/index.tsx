import { useEffect, useRef, useState } from 'react';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Loader, NewTable,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { AnalysisLayout } from '../AnalysisLayout';
import { Headers2 } from '../Header';
import { UtilFilter } from './UtilityFilter';
import {
  BadSignalIcon,
  BatteryFullIcon,
  BatteryIcon,
  BatteryLowIcon,
  BatteryMidIcon,
  EnergyNobreakIcon,
  GoodSignalIcon,
  GreatSignalIcon,
  InformationIcon,
  NoSignalIcon,
  NobreakOffIcon,
  RegularSignalIcon,
  LightOnIcon,
  LightOffIcon,
} from '~/icons';
import { IconDiv, StyledLink } from './styles';
import { ApiResps, apiCall } from '~/providers';
import ReactTooltip from 'react-tooltip';
import i18n from '~/i18n';
import { CSVLink } from 'react-csv';
import { getUserProfile } from '~/helpers/userProfile';
import { useTranslation } from 'react-i18next';
import { setValueState, ajustParams } from '~/helpers/genericHelper';
import { withTransaction } from '@elastic/apm-rum-react';
import { AnalysisEmpty } from '../AnalysisEmpty';
import { IntegrsList } from 'pages/Analysis/Integrations/IntegrsList/index';

const t = i18n.t.bind(i18n);
const CSVHeaderNobreak = [
  { label: t('cliente'), key: 'CLIENT_NAME' },
  { label: t('estado'), key: 'STATE_UF' },
  { label: t('cidade'), key: 'CITY_NAME' },
  { label: t('unidade'), key: 'UNIT_NAME' },
  { label: t('nome'), key: 'NAME' },
  { label: t('ativo'), key: 'DAT_CODE' },
  { label: t('dispositivo'), key: 'DEVICE_CODE' },
  { label: t('status'), key: 'STATUS' },
  { label: t('duracaoMedia'), key: 'averageDur' },
  { label: t('autonomia'), key: 'autonon' },
  { label: t('conexao'), key: 'connection' },
];
const CSVHeaderIllumination = [
  { label: t('cliente'), key: 'CLIENT_NAME' },
  { label: t('estado'), key: 'STATE_UF' },
  { label: t('cidade'), key: 'CITY_NAME' },
  { label: t('unidade'), key: 'UNIT_NAME' },
  { label: t('nome'), key: 'NAME' },
  { label: t('dispositivo'), key: 'DEVICE_CODE' },
  { label: t('status'), key: 'STATUS' },
  { label: t('conexao'), key: 'connection' },
];

type NobreakItem = ApiResps['/dmt/get-dmt-nobreak-list'][number];
type IlluminationItem = ApiResps['/dal/get-dal-illumination-list'][number];
type UtilityItem = NobreakItem | IlluminationItem;
type UtilityItemPartial = Partial<NobreakItem> & Partial<IlluminationItem>;

function getUtilityType(application: string) {
  switch (application) {
    case 'Iluminação': return 'iluminacao';
    case 'Nobreak': return 'nobreak';
    default: return '';
  }
}

export const Utilities = (): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const { t } = useTranslation();
  const history = useHistory();
  const commonColumns = [
    {
      name: 'state',
      value: t('estado'),
      accessor: 'STATE_UF',
      width: '5%',
      render: (props) => (
        props.STATE_UF || '-'
      ),
    },
    {
      name: 'city',
      value: t('cidade'),
      accessor: 'CITY_NAME',
      width: '10%',
      render: (props) => (
        props.CITY_NAME || '-'
      ),
    },
    {
      name: 'client',
      value: t('cliente'),
      accessor: 'CLIENT_NAME',
      width: '10%',
      render: (props) => (
        props.CLIENT_NAME || '-'
      ),
    },
    {
      name: 'unit',
      value: t('unidade'),
      accessor: 'UNIT_NAME',
      width: '15%',
      render: (props) => (
        <StyledLink to={`/analise/unidades/${props.UNIT_ID}`}>
          {props.UNIT_NAME || '-'}
        </StyledLink>
      ),
    },
    {
      name: 'name',
      value: t('nome'),
      accessor: 'NAME',
      width: '15%',
      render: (props) => (
        <StyledLink to={`/analise/utilitario/${getUtilityType(props.APPLICATION)}/${props.ID}/informacoes`}>
          {props.NAME}
        </StyledLink>
      ),
    },
  ];
  const csvLinkEl = useRef();
  const [state, render, setState] = useStateVar({
    isLoading: !profile.manageAllClients,
    needFilter: profile.manageAllClients || profile.manageSomeClient,
    utilities: [] as UtilityItem[],
    filteredUtilities: [] as UtilityItem[],
    nobreakColumns: [
      ...commonColumns,
      {
        name: 'asset',
        value: t('ativo'),
        accessor: 'DAT_CODE',
        width: '10%',
        render: (props) => (
          props.DAT_CODE || '-'
        ),
      },
      {
        name: 'device',
        value: t('dispositivo'),
        accessor: 'DMT_CODE',
        width: '10%',
        render: (props) => (
          <div>
            {props.DMT_CODE ? (
              <StyledLink to={`/analise/dispositivo/${props.DMT_CODE}/informacoes`}>
                {props.DMT_CODE}
              </StyledLink>
            ) : '-'}
          </div>
        ),
      },
      {
        name: 'status',
        value: 'Status',
        accessor: 'status',
        width: '10%',
        render: (props) => (
          (
            <div data-tip data-for={`${props.NAME}status`}>
              { getStatusIcon(props.status) }
              { getToolTip(`${props.NAME}status`, props.status ? props.status : 'Sem informação') }
            </div>
          ) || '-'
        ),
      },
      {
        name: 'battery_duration',
        value: 'Dur. Média',
        accessor: 'averageDur',
        render: (props) => (
          (
            <div data-tip data-for={`${props.NAME}averageDur`}>
              { getDurationIcon(props.averageDur) }
              { getToolTip(`${props.NAME}averageDur`, props.averageDur ? props.averageDur : 'Sem informação') }
            </div>
          )
          || '-'
        ),
      },
      {
        name: 'auton',
        value: 'Auton.',
        accessor: 'autonon',
        render: (props) => (
          <div data-tip data-for={`${props.NAME}autonon`}>
            { getDurationIcon(props.autonon) }
            { getToolTip(`${props.NAME}autonon`, props.autonon ? props.autonon : 'Sem informação') }
          </div>
        ),
      },
      {
        name: 'connection',
        value: t('conexao'),
        accessor: 'connection',
        width: 'auto',
        render: (props) => (
          (
            <div data-tip data-for={`${props.NAME}connection`}>
              { getConnectionIcon(props.connection) }
              { getToolTip(`${props.NAME}connection`, props.connection ? props.connection : 'Sem informação') }
            </div>
          ) || '-'
        ),
      },
    ],
    illuminationColumns: [
      ...commonColumns,
      {
        name: 'device',
        value: t('dispositivo'),
        accessor: 'DAL_CODE',
        width: '10%',
        render: (props) => (
          <div>
            {props.DAL_CODE || props.DMT_CODE || props.DAM_ILLUMINATION_CODE ? (
              <StyledLink to={`/analise/dispositivo/${props.DAL_CODE || props.DMT_CODE || props.DAM_ILLUMINATION_CODE}/informacoes`}>
                {props.DAL_CODE || props.DMT_CODE || props.DAM_ILLUMINATION_CODE}
              </StyledLink>
            ) : '-'}
          </div>
        ),
      },
      {
        name: 'status',
        value: 'Status',
        accessor: 'status',
        width: '10%',
        render: (props) => (
          (
            <div data-tip data-for={`${props.NAME}status`} style={{ display: 'flex' }}>
              <span>{getIlluminationStatusIcon(props.status)}</span>
              <span style={{ marginLeft: '5px' }}>{getIlluminationStatus(props.status, t)}</span>
              { getToolTip(`${props.NAME}status`, props.status != null ? getIlluminationStatus(props.status, t) : 'Sem informação') }
            </div>
          ) || '-'
        ),
      },
      {
        name: 'connection',
        value: t('conexao'),
        accessor: 'connection',
        width: '5%',
        render: (props) => (
          (
            <div data-tip data-for={`${props.NAME}connection`}>
              { getConnectionIcon(props.connection) }
              { getToolTip(`${props.NAME}connection`, props.connection ? props.connection : 'Sem informação') }
            </div>
          ) || '-'
        ),
      },
    ],
    selectedState: setValueState('filterStates') as any | any[],
    selectedCity: setValueState('filterCity') as any | any[],
    selectedUnit: setValueState('filterUnit') as any | any[],
    selectedConnection: [] as any | any[],
    selectedClientFilter: setValueState('filterClient') as any | any[],
    selectedStatus: [] as any | any[],
    csvData: [] as {}[],
  });
  async function clearFilters() {
    state.selectedCity = [];
    state.selectedClientFilter = [];
    state.selectedState = [];
    state.selectedConnection = [];
    state.selectedUnit = [];
    state.selectedStatus = [];

    render();
    await handleGetData();
  }

  function filter() {
    state.isLoading = true;
    render();
    const selectedStatusConvert = handleSelectedStatusConvert();
    state.filteredUtilities = state.utilities
      .filter((dev: UtilityItemPartial) => (state.selectedState.length > 0 && state.selectedState.includes(dev.STATE_ID?.toString())) || state.selectedState.length === 0)
      .filter((dev: UtilityItemPartial) => (state.selectedCity.length > 0 && state.selectedCity.includes(dev.CITY_ID?.toString())) || state.selectedCity.length === 0)
      .filter((dev: UtilityItemPartial) => (state.selectedUnit.length > 0 && state.selectedUnit.includes(dev.UNIT_ID?.toString())) || state.selectedUnit.length === 0)
      .filter((dev: UtilityItemPartial) => (state.selectedClientFilter.length > 0 && state.selectedClientFilter.includes(dev.CLIENT_ID?.toString())) || state.selectedClientFilter.length === 0)
      .filter((dev: UtilityItemPartial) => (state.selectedConnection.length > 0 && state.selectedConnection.includes(dev.connection)) || state.selectedConnection.length === 0)
      .filter((dev: UtilityItemPartial) => (selectedStatusConvert.length > 0 && selectedStatusConvert.includes(dev.status)) || selectedStatusConvert.length === 0);

    state.isLoading = false; render();
  }

  function getToolTip(id, name) {
    return (
      <ReactTooltip
        id={id}
        place="top"
        effect="solid"
        delayHide={100}
        offset={{ top: 0, left: 10 }}
        textColor="#000000"
        border
        backgroundColor="rgba(255, 255, 255, 0.97)"
      >
        { name }
      </ReactTooltip>
    );
  }

  function handleSelectedStatusConvert() {
    return state.selectedStatus.map((item) => (item === 1 ? true : item)).map((item) => (item === 0 ? false : item));
  }

  const queryPars = queryString.parse(history.location.search);
  const linkBase = history.location.pathname;

  async function handleGetData() {
    try {
      setState({ isLoading: true });
      if (state.needFilter !== null) setState({ needFilter: false });
      const selectedStatusConvert = handleSelectedStatusConvert();
      if (queryPars.dispositivo === 'nobreak' || !queryPars.dispositivo) {
        state.utilities = await apiCall('/dmt/get-dmt-nobreak-list', {
          INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients || !!profile.permissions.isInstaller,
          clientIds: (state.selectedClientFilter.length > 0) ? ajustParams(state.selectedClientFilter) : undefined,
          stateIds: (state.selectedState.length > 0) ? ajustParams(state.selectedState) : undefined,
          cityIds: (state.selectedCity.length > 0) ? ajustParams(state.selectedCity) : undefined,
          unitIds: (state.selectedUnit.length > 0) ? ajustParams(state.selectedUnit) : undefined,
          connection: (state.selectedConnection.length > 0) ? ajustParams(state.selectedConnection) : undefined,
          status: (selectedStatusConvert.length > 0) ? ajustParams(selectedStatusConvert) : undefined,
        });
        state.filteredUtilities = state.utilities;
      }
      if (queryPars.dispositivo === 'iluminacao') {
        state.utilities = await apiCall('/dal/get-dal-illumination-list', {
          INCLUDE_INSTALLATION_UNIT: !!profile.manageAllClients || !!profile.permissions.isInstaller,
          clientIds: (state.selectedClientFilter.length > 0) ? ajustParams(state.selectedClientFilter) : undefined,
          stateIds: (state.selectedState.length > 0) ? ajustParams(state.selectedState) : undefined,
          cityIds: (state.selectedCity.length > 0) ? ajustParams(state.selectedCity) : undefined,
          unitIds: (state.selectedUnit.length > 0) ? ajustParams(state.selectedUnit) : undefined,
          connection: (state.selectedConnection.length > 0) ? ajustParams(state.selectedConnection) : undefined,

        });
        state.filteredUtilities = state.utilities;
      }
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('erroCarregarDados'));
    }
    if (state.needFilter === null) setState({ needFilter: true });
    setState({ isLoading: false });
  }

  function selectColumns() {
    if (queryPars.dispositivo === 'iluminacao') {
      return state.illuminationColumns;
    }
    return state.nobreakColumns;
  }

  useEffect(() => {
    if (!state.needFilter) {
      handleGetData();
    }
  }, [queryPars.dispositivo]);

  useEffect(() => {
    filter();
  }, [state.utilities]);

  const getCsvData = async () => {
    state.isLoading = true; render();
    const formatterCSV = state.filteredUtilities.map((dev: UtilityItemPartial) => ({
      CLIENT_NAME: dev.CLIENT_NAME ?? '-',
      STATE_UF: dev.STATE_UF ?? '-',
      CITY_NAME: dev.CITY_NAME ?? '-',
      NAME: dev.NAME ?? '-',
      UNIT_NAME: dev.UNIT_NAME ?? '-',
      DAT_CODE: dev.DAT_CODE ?? '-',
      DEVICE_CODE: (dev.DMT_CODE || dev.DAL_CODE) ?? '-',
      STATUS: (queryPars.dispositivo === 'nobreak' ? dev.status : getIlluminationStatus(dev.status, t)) ?? '-',
      averageDur: dev.averageDur ?? '-',
      autonon: dev.autonon ?? '-',
      connection: dev.connection ?? '-',
    }));

    state.csvData = formatterCSV;
    render();

    setTimeout(() => {
      (csvLinkEl as any).current.link.click();
      window.location.reload();
    }, 1000);
    state.isLoading = false; render();
  };

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaUtilitarios')}</title>
      </Helmet>
      <>
        <UtilFilter
          state={state}
          render={render}
          onAply={async () => { await handleGetData(); filter(); }}
          listFilters={['cidade', 'estado', 'cliente', 'status', 'conexao', 'unidade']}
          clearFilters={clearFilters}
          exportFunc={() => getCsvData()}
          csvHeader={queryPars.dispositivo === 'nobreak' ? CSVHeaderNobreak : CSVHeaderIllumination}
          lengthArrayResult={state.filteredUtilities.length}
        />
        <CSVLink
          headers={queryPars.dispositivo === 'nobreak' ? CSVHeaderNobreak : CSVHeaderIllumination}
          data={state.csvData}
          filename={t('utilitario')}
          separator=";"
          asyncOnClick
          enclosingCharacter={"'"}
          ref={csvLinkEl}
        />
        {state.needFilter && (
          <>
            <AnalysisEmpty />
          </>
        )}
        {state.isLoading && <Loader variant="primary" />}
        {!state.isLoading && state.filteredUtilities.length && !state.needFilter ? (
          <NewTable
            data={state.filteredUtilities}
            columns={selectColumns()}
            pageSize={20}
            noSearchBar
          />
        ) : !state.isLoading && !state.filteredUtilities.length && !state.needFilter && (
          <h3>Não há utilitários cadastrados </h3>
        )}
      </>
    </>
  );
};

function getIlluminationStatus(status, t) {
  if (status != null) {
    return status ? t('ligadoMinusculo') : t('desligadoMinusculo');
  }
  return status;
}

function getIlluminationStatusIcon(status) {
  if (status != null) {
    return status ? (
      <IconDiv>
        <LightOnIcon />
      </IconDiv>
    ) : (
      <IconDiv>
        <LightOffIcon />
      </IconDiv>
    );
  }

  return (
    <IconDiv>
      <InformationIcon />
    </IconDiv>
  );
}

function getStatusIcon(status) {
  switch (status) {
    case 'Bateria':
      return (
        <IconDiv>
          <BatteryIcon />
          <div style={{ marginLeft: '7px' }}>Bateria</div>
        </IconDiv>
      );
    case 'Rede Elétrica':
      return (
        <IconDiv>
          <EnergyNobreakIcon />
          <div style={{ marginLeft: '7px' }}>Rede elétrica</div>
        </IconDiv>
      );
    case 'Desligado':
      return (
        <IconDiv>
          <NobreakOffIcon color="#CFCFCF" />
          <div style={{ marginLeft: '7px' }}>Desligado</div>
        </IconDiv>
      );
    default:
      return (
        <IconDiv>
          <InformationIcon />
        </IconDiv>
      );
  }
}

function getConnectionIcon(connection) {
  switch (connection) {
    case 'ONLINE':
      return (
        <GreatSignalIcon width="25" heigth="19" />
      );
    case 'good':
      return (
        <GoodSignalIcon />
      );
    case 'LATE':
      return (
        <RegularSignalIcon />
      );
    case 'bad':
      return (
        <BadSignalIcon />
      );
    default:
      return (
        <NoSignalIcon width="25" heigth="19" />
      );
  }
}

function getDurationIcon(duration: number) {
  if (duration > 80) {
    return (
      <IconDiv>
        <BatteryFullIcon />
        <div style={{ marginLeft: '7px' }}>{ `${duration}%` }</div>
      </IconDiv>
    );
  }
  if (duration < 50 && duration > 20) {
    return (
      <IconDiv>
        <BatteryMidIcon />
        <div style={{ marginLeft: '7px' }}>{ `${duration}%` }</div>
      </IconDiv>
    );
  }
  if (duration < 20) {
    return (
      <IconDiv>
        <BatteryLowIcon />
        <div style={{ marginLeft: '7px' }}>{ `${duration}%` }</div>
      </IconDiv>
    );
  }

  return (
    <IconDiv>
      <InformationIcon />
    </IconDiv>
  );
}

export default withTransaction('Utilities', 'component')(Utilities);
