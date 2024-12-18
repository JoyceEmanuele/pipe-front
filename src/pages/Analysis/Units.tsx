import React, { useEffect, useState } from 'react';
import {
  TempColor,
  RowTemp,
  RowHealth,
  ExpandBtn,
  ExpandAll,
  EnvironmentBox,
  CardMachine,
  StyledBox,
  StyledFlex,
  StyledLink,
  DesktopTable,
  MobileTable,
  StyledSpan,
  IconWrapper,
  HealthIconBox,
} from './styles';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import {
  DataTable,
  Loader,
  EmptyWrapper,
} from '~/components';
import '~/assets/css/ReactTags.css';
import { NewUnitsHealthIcon, unitsHealthIcon } from '~/components/HealthIcon';
import { useStateVar } from '~/helpers/useStateVar';
import { AnalysisLayout } from '~/pages/Analysis/AnalysisLayout';
import { apiCall } from 'providers';
import { colors } from '~/styles/colors';
import {
  TermometerSubIcon,
  UnitIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '../../icons';
import { getUserProfile } from '~/helpers/userProfile';
import { FilterItem } from './AnalysisFilters';
import { useTranslation } from 'react-i18next';
import { UtilFilter } from './Utilities/UtilityFilter';
import moment, { Moment } from 'moment';
import { setValueState } from '~/helpers/genericHelper';

import { FaTools } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { TooltipContainer } from '~/components/ConnectedDevices/styles';
import { TableItemCell } from './Units/UnitDetail/UnitDetailDACsDAMs/components/MachineTable/styles';
import { withTransaction } from '@elastic/apm-rum-react';
import { AnalysisEmpty } from './AnalysisEmpty';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

const delimiters = [...KeyCodes.enter, KeyCodes.comma, KeyCodes.slash];

const StatusCell = (unitName, production, text) => (
  production === 0 ? (
    <>
      <ReactTooltip
        id={`tooltip-${unitName}`}
        place="top"
        border
        textColor="#000000"
        backgroundColor="rgba(255, 255, 255, 0.97)"
        borderColor="#202370"
      >
        <TooltipContainer>
          <strong>
            {text}
          </strong>
        </TooltipContainer>
      </ReactTooltip>
      <TableItemCell data-tip data-for={`tooltip-${unitName}`}>
        <FaTools color={colors.LightBlue} />
      </TableItemCell>
    </>
  ) : (
    <div />
  )
);

type TListFilters = 'estado' | 'cidade' | 'unidade' | 'cliente' | 'statusOperacao' | 'data' | 'grupo';

export const Units = (): JSX.Element => {
  const { t } = useTranslation();
  const csvLinkEl = React.useRef();

  const profile = getUserProfile();

  const [state, render, setState] = useStateVar(() => {
    const state = {
      searchState: [] as { id: string, text: string }[],
      searchValue: '' as string,
      tablePage: 1,
      tablePageSize: 30,
      totalItems: 0,
      lastPageRequestTs: 0,
      isExpanded: false,
      profile,
      orderBy: null as null | [string, 'ASC' | 'DESC'],
      unitsList: [] as {
        hide: boolean
        UNIT_ID: number
        UNIT_NAME: string
        highQtd: number
        goodQtd: number
        lowQtd: number
        offQtd: number
        redHealth: number
        yellowHealth: number
        orangeHealth: number
        greenHealth: number
        greyHealth: number
        blackHealth: number
        dacs: {
          DEV_ID: string
          H_INDEX: number
          insufDutId?: string
          insufDut?: {
            DEV_ID: string
            temprtAlert: 'low'|'high'|'good'|null
            Temperature: number
          }
        }[]
        duts: {
          DEV_ID: string
          temprtAlert: 'low'|'high'|'good'|null
          Temperature: number
          ISVISIBLE: number|null
          eCO2: number
          PLACEMENT: 'AMB'|'INS'|'DUO'
        }[]
        vavs: {
          DEV_ID: string,
          GROUP_NAME?: string,
          GROUP_ID?: number,
          ROOM_NAME: string,
          ISVISIBLE?: number|null,
          Temperature?: number,
          isAuto?: boolean
          temprtAlert: 'low'|'high'|'good'|null,
          status?: string | null,
        }[]
        nobreaks: {
          DAT_CODE: string,
          DMT_CODE: string,
          NOMINAL_POTENTIAL: number,
          NOBREAK_NAME: string,
          NOMINAL_BATERY_LIFE: number,
          INPUT_VOLTAGE: number,
          OUTPUT_VOLTAGE: number
        }[],
        chillers: {
          VARSCFG: string;
          DEVICE_ID: string;
          DEVICE_CODE: string;
        }[],
      }[],
      unitlistfilter: [] as { value: string, name: string }[],
      selectedUnit: setValueState('filterUnit') as string[],
      isLoading: !profile.manageAllClients && !profile.manageSomeClient,
      csvData: [] as { [k: string]: string }[],
      dielClientId: undefined as undefined | number,
      selectedConnection: [],
      manufacturers: [] as {}[],
      ownershipFilter: null as null | { value: string, label: string },
      filters: [] as FilterItem[],
      statesList: [] as { value: string, name: string }[],
      selectedState: setValueState('filterStates') as string[],
      citiesList: [] as { value: string, name: string }[],
      selectedCity: setValueState('filterCity') as string[],
      clientIds: [] as { value: string, name: string }[],
      selectedClientFilter: setValueState('filterClient') as string[],
      selectedStatus: '' as string,
      startOperation: '' as string,
      endOperation: '' as string,
      isUnits: true as boolean,
      tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
      openExportList: false as boolean,
      CSVHeader: [] as any,
      selectedTimeRange: 'Flexível' as string,
      needFilter: profile.manageAllClients || profile.manageSomeClient,
      includeInstallationUnits: !!profile.manageAllClients || !!profile.permissions.isInstaller,
    };

    return state;
  });

  const [informationsUnits, setInformationsUnits] = useState({
    informationsUnitsCheck: {
      checkState: true as boolean,
      checkCity: true as boolean,
      checkUnit: true as boolean,
      checkStatus: true as boolean,
      checkMachines: true as boolean,
      checkEnvironments: true as boolean,
      checkUtilities: true as boolean,
      checkStartMonitoring: true as boolean,
      checkWaterDevices: true as boolean,
      checkEnergyDevices: true as boolean,
      checkAutomationDevices: true as boolean,
      checkMonitoringDevices: true as boolean,
    },
    // 0 = Em instalacao, 1 = Em operacao, 2 = Todas
    statusUnitsCheck: '2' as string | undefined,
    dates: {
      dateStart: null as Moment | null,
      dateEnd: null as Moment | null,
      focusedInput: null as 'endDate' | 'startDate' | null,

    },
    modeExportList: '' as string,
  });

  const formatDate = (dateString) => {
    if (dateString) {
      return `${dateString.slice(8, 10)}/${dateString.slice(5, 7)}/${dateString.slice(0, 4)}`;
    }
  };

  const listFilters: TListFilters[] = [
    'estado',
    'cidade',
    'unidade',
    'cliente',
    'grupo',
  ];

  const columns = [
    {
      Header: t('estado'),
      accessor: 'STATE_ID',
      Cell: (props) => <StyledSpan>{props.STATE_ID}</StyledSpan>,
    },
    {
      Header: t('cidade'),
      accessor: 'CITY_NAME',
      Cell: (props) => <StyledSpan>{props.CITY_NAME}</StyledSpan>,
    },
    {
      Header: t('unidade'),
      accessor: 'UNIT_NAME',
      Cell: (props) => (
        <StyledLink to={`/analise/unidades/${props.chillers?.length > 0 ? 'cag/' : ''}${props.UNIT_ID}`}>
          {props.UNIT_NAME}
        </StyledLink>
      ),
    },
    {
      Header: t('indicesDeSaude'),
      accessor: 'SAUDE_ID',
      Cell: (props) => (
        <Flex flexDirection="column" padding="10px">
          <RowHealth>
            { (props.redHealth > 0) && (
            <TempColor>
              <NewUnitsHealthIcon H_INDEX={25} />
              <div>
                { props.redHealth }
              </div>
            </TempColor>
            ) }
            { (props.yellowHealth > 0) && (
            <TempColor>
              <NewUnitsHealthIcon H_INDEX={75} />
              { props.yellowHealth }
            </TempColor>
            ) }
            { (props.orangeHealth > 0) && (
              <TempColor>
                <NewUnitsHealthIcon H_INDEX={50} />
                { props.orangeHealth }
              </TempColor>
            )}
            { (props.greenHealth > 0) && (
            <TempColor>
              <NewUnitsHealthIcon H_INDEX={100} />
              { props.greenHealth }
            </TempColor>
            ) }
            { (props.greyHealth > 0) && (
            <TempColor>
              <NewUnitsHealthIcon H_INDEX={999} />
              { props.greyHealth }
            </TempColor>
            ) }
            { (props.blackHealth > 0) && (
            <TempColor>
              <NewUnitsHealthIcon H_INDEX={4} />
              { props.blackHealth }
            </TempColor>
            )}
          </RowHealth>
        </Flex>
      ),
    },
    {
      Header: t('ultimaFatura'),
      accessor: 'FATURA_ID',
      Cell: (props) => (
        <Flex flexDirection="column" style={{ textAlign: 'center' }}>
          { (props.TOTAL_CHARGES === 0) ? '-' : (
            <StyledLink to={`/analise/unidades/energyEfficiency/${props.UNIT_ID}`} style={{ textAlign: 'left' }}>
              <div>
                { formatTotal(props.TOTAL_CHARGES, true, 0) }
              </div>
              <div>
                { formatTotal(props.TOTAL_MEASURED, false, 0)}
              </div>
            </StyledLink>
          )}
        </Flex>
      ),
    },
    {
      Header: t('temperaturas'),
      accessor: 'TEMPERATURA_ID',
      Cell: (props) => (
        <Flex flexDirection="column">
          <RowTemp>
            { (props.highQtd > 0) && (
            <TempColor>
              <svg width="15" height="15" style={{ borderRadius: '3px' }}>
                <rect width="15" height="15" style={{ fill: '#FF0000' }} />
              </svg>
              <div>
                { props.highQtd }
              </div>
            </TempColor>
            ) }
            { (props.goodQtd > 0) && (
            <TempColor>
              <svg width="15" height="15" style={{ borderRadius: '3px' }}>
                <rect width="15" height="15" style={{ fill: '#5AB365' }} />
              </svg>
              <div>
                { props.goodQtd }
              </div>
            </TempColor>
            ) }
            { (props.lowQtd > 0) && (
            <TempColor>
              <svg width="15" height="15" style={{ borderRadius: '3px' }}>
                <rect width="15" height="15" style={{ fill: '#2D81FF' }} />
              </svg>
              <div>
                { props.lowQtd }
              </div>
            </TempColor>
            ) }
            { (props.offQtd > 0) && (
            <TempColor>
              <svg width="15" height="15" style={{ borderRadius: '3px' }}>
                <rect width="15" height="15" style={{ fill: '#BBBBBB' }} />
              </svg>
              <div>
                { props.offQtd }
              </div>
            </TempColor>
            ) }
          </RowTemp>
        </Flex>
      ),
    },
  ];

  if (profile.manageAllClients) {
    columns.splice(3, 0, {
      Header: t('status'),
      accessor: 'PRODUCTION',
      Cell: (props) => StatusCell(props.UNIT_NAME, props.PRODUCTION, t('emInstalacao')),
    });
    listFilters.push('data');
    listFilters.push('statusOperacao');
    columns.splice(3, 0,
      {
        Header: t('inicioOperacao'),
        accessor: 'PRODUCTION_TIMESTAMP',
        Cell: (props) => <StyledSpan>{formatDate(props.PRODUCTION_TIMESTAMP)}</StyledSpan>,
      });
    columns.unshift(
      {
        Header: t('cliente'),
        accessor: 'CLIENT_ID',
        Cell: (props) => <StyledSpan>{props.CLIENT_NAME}</StyledSpan>,
      },
    );
  }

  columns.unshift(
    {
      // @ts-ignore
      Header: (
        <ExpandAll
          onClick={() => {
            state.unitsList.forEach((unit) => {
              unit.hide = !state.isExpanded;
            });
            state.isExpanded = !state.isExpanded;
            render();
          }}
        >
          { state.isExpanded ? (<ArrowUpIcon />) : <ArrowDownIcon /> }
        </ExpandAll>
      ),
      accessor: 'UNIT_ID',
      Cell: (props) => (
        <ExpandBtn
          onClick={() => { state.unitsList.forEach((unit) => {
            if (unit.UNIT_ID === props.UNIT_ID) {
              unit.hide = !unit.hide;
            }
          });
          render();
          }}
        >
          { props.hide ? <ArrowUpIcon /> : <ArrowDownIcon />}
          { UnitIcon({ color: '#363BC4' }) }
        </ExpandBtn>
      ),
    },
  );

  function formatTotal(value, isCharge, decimalPlaces) {
    if (isCharge) {
      return `R$ ${formatNumberWithFractionDigits(value, { minimum: decimalPlaces, maximum: decimalPlaces })}`;
    }
    return `${formatNumberWithFractionDigits(value, { minimum: 0, maximum: 0 })} kWh`;
  }

  function handleCSVHeader() {
    if (profile.manageAllClients) state.CSVHeader.push({ label: t('cliente'), key: 'client' });
    if (informationsUnits.modeExportList === 'complete') { handleCSVHeaderComplete(); }
    else if (informationsUnits.modeExportList === 'custom') { handleCSVHeaderCustom(); }
  }

  function handleCSVHeaderComplete() {
    state.CSVHeader.push(
      { label: t('estado'), key: 'state' },
      { label: t('cidade'), key: 'city' },
      { label: t('unidade'), key: 'unit' },
    );
    if (profile.manageAllClients) {
      state.CSVHeader.push(
        { label: t('status'), key: 'status' },
        { label: t('inicioOperacao'), key: 'startOperation' },
      );
    }
    state.CSVHeader.push(
      { label: t('ambientes'), key: 'environment' },
      { label: t('maquinas'), key: 'machines' },
      { label: t('utilitarios'), key: 'utilities' },
      { label: t('dispositivosAgua'), key: 'waterDevices' },
      { label: t('dispositivosEnergia'), key: 'energyDevices' },
      { label: t('dispositivosAutomacao'), key: 'automationDevices' },
      { label: t('dispositivosMonitoramento'), key: 'monitoringDevices' },
    );
  }

  function handleCSVHeaderCustom() {
    if (informationsUnits.informationsUnitsCheck.checkState) state.CSVHeader.push({ label: t('estado'), key: 'state' });
    if (informationsUnits.informationsUnitsCheck.checkCity) state.CSVHeader.push({ label: t('cidade'), key: 'city' });
    if (informationsUnits.informationsUnitsCheck.checkUnit) state.CSVHeader.push({ label: t('unidade'), key: 'unit' });
    if (informationsUnits.informationsUnitsCheck.checkStatus && profile.manageAllClients) state.CSVHeader.push({ label: t('status'), key: 'status' });
    if (informationsUnits.informationsUnitsCheck.checkStartMonitoring && profile.manageAllClients) state.CSVHeader.push({ label: t('inicioOperacao'), key: 'startOperation' });
    if (informationsUnits.informationsUnitsCheck.checkEnvironments) state.CSVHeader.push({ label: t('ambientes'), key: 'environment' });
    if (informationsUnits.informationsUnitsCheck.checkMachines) state.CSVHeader.push({ label: t('maquinas'), key: 'machines' });
    if (informationsUnits.informationsUnitsCheck.checkUtilities) state.CSVHeader.push({ label: t('utilitarios'), key: 'utilities' });
    if (informationsUnits.informationsUnitsCheck.checkWaterDevices) state.CSVHeader.push({ label: t('dispositivosAgua'), key: 'waterDevices' });
    if (informationsUnits.informationsUnitsCheck.checkEnergyDevices) state.CSVHeader.push({ label: t('dispositivosEnergia'), key: 'energyDevices' });
    if (informationsUnits.informationsUnitsCheck.checkAutomationDevices) state.CSVHeader.push({ label: t('dispositivosAutomacao'), key: 'automationDevices' });
    if (informationsUnits.informationsUnitsCheck.checkMonitoringDevices) state.CSVHeader.push({ label: t('dispositivosMonitoramento'), key: 'monitoringDevices' });
  }

  const updateCheckInformations = (info, date) => {
    switch (info) {
      case 'estado': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkState: !informationsUnits.informationsUnitsCheck.checkState } });
        break;
      case 'cidade': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkCity: !informationsUnits.informationsUnitsCheck.checkCity } });
        break;
      case 'unidade': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkUnit: !informationsUnits.informationsUnitsCheck.checkUnit } });
        break;
      case 'status': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkStatus: !informationsUnits.informationsUnitsCheck.checkStatus } });
        break;
      case 'maquinas': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkMachines: !informationsUnits.informationsUnitsCheck.checkMachines } });
        break;
      case 'ambientes': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkEnvironments: !informationsUnits.informationsUnitsCheck.checkEnvironments } });
        break;
      case 'utilitarios': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkUtilities: !informationsUnits.informationsUnitsCheck.checkUtilities } });
        break;
      case 'inicioMonitoramento': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkStartMonitoring: !informationsUnits.informationsUnitsCheck.checkStartMonitoring } });
        break;
      case 'dispositivosAgua': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkWaterDevices: !informationsUnits.informationsUnitsCheck.checkWaterDevices } });
        break;
      case 'dispositivosEnergia': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkEnergyDevices: !informationsUnits.informationsUnitsCheck.checkEnergyDevices } });
        break;
      case 'dispositivosAutomacao': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkAutomationDevices: !informationsUnits.informationsUnitsCheck.checkAutomationDevices } });
        break;
      case 'dispositivosMonitoramento': setInformationsUnits({ ...informationsUnits, informationsUnitsCheck: { ...informationsUnits.informationsUnitsCheck, checkMonitoringDevices: !informationsUnits.informationsUnitsCheck.checkMonitoringDevices } });
        break;
      case '2': setInformationsUnits({ ...informationsUnits, statusUnitsCheck: '2' });
        break;
      case '1': setInformationsUnits({ ...informationsUnits, statusUnitsCheck: '1' });
        break;
      case '0': setInformationsUnits({ ...informationsUnits, statusUnitsCheck: '0' });
        break;
      case 'complete': setInformationsUnits({ ...informationsUnits, modeExportList: 'complete' });
        break;
      case 'custom': setInformationsUnits({ ...informationsUnits, modeExportList: 'custom' });
        break;
      case 'dateStart':
        if (date) setInformationsUnits({ ...informationsUnits, dates: { ...informationsUnits.dates, dateStart: date } });
        break;
      case 'dateEnd':
        if (date) setInformationsUnits({ ...informationsUnits, dates: { ...informationsUnits.dates, dateEnd: date } });
        break;
      case 'focusedInput':
        if (date) setInformationsUnits({ ...informationsUnits, dates: { ...informationsUnits.dates, focusedInput: date } });
        break;
      default:
        break;
    }

    render();
  };

  function verifyUnitAndClientToSend(search) {
    if (search.length === 0) return undefined;
    if (typeof search === 'string') return [Number(search)];
    if (typeof search === 'number') return [search];
    return [...search].map((x) => Number(x));
  }

  const handleGetDacs = async () => {
    try {
      if (state.needFilter !== null) setState({ needFilter: false });
      const now = Date.now();
      state.unitsList = [];
      state.lastPageRequestTs = now;
      setState({ isLoading: true });
      const [{ list, totalItems }] = await Promise.all([
        apiCall('/get-units-list-page', {
          INCLUDE_INSTALLATION_UNIT: state.includeInstallationUnits,
          status: informationsUnits.statusUnitsCheck,
          startOperation: informationsUnits.dates.dateStart ? informationsUnits.dates.dateStart.format('YYYY-MM-DD 00:00:00') : '',
          endOperation: informationsUnits.dates.dateEnd ? informationsUnits.dates.dateEnd.format('YYYY-MM-DD 23:59:59') : '',
          SKIP: (state.tablePage - 1) * state.tablePageSize,
          LIMIT: state.tablePageSize,
          searchTerms: state.searchState?.length ? state.searchState.map((x) => x.text.toLowerCase()) : undefined,
          cityIds: state.selectedCity?.length ? state.selectedCity : undefined,
          stateIds: state.selectedState?.length ? state.selectedState : undefined,
          unitIds: verifyUnitAndClientToSend(state.selectedUnit),
          clientIds: verifyUnitAndClientToSend(state.selectedClientFilter),
        }),
      ]);
      if (state.lastPageRequestTs !== now) return;

      list.forEach((unit) => unit.duts = unit.duts.filter((dut) => ['AMB', 'DUO'].includes(dut.PLACEMENT)));
      state.unitsList = handleHealthUnit(list);
      state.totalItems = totalItems;

      for (const unit of state.unitsList) {
        for (const dac of unit.dacs) {
          if (!dac.insufDutId) continue;
          dac.insufDut = unit.duts.find((x) => x.DEV_ID === dac.insufDutId);
        }
        unit.duts = unit.duts.filter((dut) => !unit.dacs.some((dac) => dac.insufDut === dut));
      }
    } catch (error) {
      console.log(error);
      toast.error(t('erroDadosUnidades'));
    }
    if (state.needFilter === null) setState({ needFilter: true });
    setState({ isLoading: false });
  };

  function handleHealthUnit(list) {
    const unitsList = list.map((unit) => Object.assign(unit, {
      highQtd: (
        (unit.duts.length && unit.duts.filter((dut) => dut.temprtAlert === 'high').length)
        + (unit.vavs.length && unit.vavs.filter((vav) => vav.temprtAlert === 'high').length)
      ),
      goodQtd: (
        (unit.duts.length && unit.duts.filter((dut) => dut.temprtAlert === 'good').length)
        + (unit.vavs.length && unit.vavs.filter((vav) => vav.temprtAlert === 'good').length)
      ),
      lowQtd: (
        (unit.duts.length && unit.duts.filter((dut) => dut.temprtAlert === 'low').length)
        + (unit.vavs.length && unit.vavs.filter((vav) => vav.temprtAlert === 'low').length)
      ),
      offQtd: (
        (unit.duts.length && unit.duts.filter((dut) => dut.temprtAlert === null).length)
        + (unit.vavs.length && unit.vavs.filter((vav) => vav.temprtAlert === null).length)
      ),
      redHealth: unit.dacs.length && unit.dacs.filter((dac) => dac.H_INDEX === 25).length,
      yellowHealth: unit.dacs.length && unit.dacs.filter((dac) => dac.H_INDEX === 75).length,
      blackHealth: unit.dacs.length && unit.dacs.filter((dac) => dac.H_INDEX === 4).length,
      greyHealth: unit.dacs.length && unit.dacs.filter((dac) => dac.H_INDEX === 2).length,
      greenHealth: unit.dacs.length && unit.dacs.filter((dac) => dac.H_INDEX === 100).length,
      orangeHealth: unit.dacs.length && unit.dacs.filter((dac) => dac.H_INDEX === 50).length,
      hide: false,
    }));

    return unitsList;
  }

  function convertDateFormat(date: string) {
    if (date) { return moment(date).format('DD-MM-YYYY'); }
    return date;
  }

  async function getCsvData() {
    setState({ isLoading: true });
    const { list: energy } = await apiCall('/clients/get-units-with-energy-device', {});

    apiCall('/get-units-list-page', {
      INCLUDE_INSTALLATION_UNIT: state.includeInstallationUnits,
      status: informationsUnits.statusUnitsCheck,
      startOperation: informationsUnits.dates.dateStart ? informationsUnits.dates.dateStart.format('YYYY-MM-DD 00:00:00') : '',
      endOperation: informationsUnits.dates.dateEnd ? informationsUnits.dates.dateEnd.format('YYYY-MM-DD 23:59:59') : '',
      searchTerms: state.searchState.map((x) => x.text.toLowerCase()),
      cityIds: state.selectedCity?.length ? state.selectedCity : undefined,
      stateIds: state.selectedState?.length ? state.selectedState : undefined,
      unitIds: state.selectedUnit?.length ? state.selectedUnit?.map((x) => Number(x)) : undefined,
      clientIds: state.selectedClientFilter?.length ? state.selectedClientFilter?.map((x) => Number(x)) : undefined,
    }).then(async ({ list }) => {
      handleCSVHeader();

      const listFilter = [] as any;
      list.forEach((unit) => {
        const energyInfo = energy.filter((energy) => (energy.UNIT_ID === unit.UNIT_ID)) || '';
        const updatedUnit = {
          ...unit,
          energyInfo: energyInfo[0] || null,
        };
        listFilter.push(updatedUnit);
      });

      handleCSVData(listFilter);

      setState({ isLoading: false });

      // @ts-ignore: Object is possibly 'null'.
      csvLinkEl.current.link.click();
    });
    state.CSVHeader = [];
  }

  function getUtilitiesCSV(unit) {
    return [
      ...(unit.nobreaks || []).map((nobreak) => `${nobreak.NOBREAK_NAME ? nobreak.NOBREAK_NAME : '-'}`),
      ...(unit.illumination || []).map((illumination) => `${illumination.NAME ? illumination.NAME : '-'}`),
    ].join(', ');
  }

  function getWaterDevicesCSV(unit) {
    return unit.dmaId !== '' ? unit.dmaId : '-';
  }

  function getEnergyDevicesCSV(unit) {
    return unit.energyInfo ? unit.energyInfo.devices.map((dme) => `${dme.ID}`).join(', ') : '-';
  }

  function getAutomationDevicesCSV(unit) {
    return unit.automation ? unit.automation.map((automation) => `${automation}`).join(', ') : '-';
  }

  function getMonitoringDevicesCSV(unit) {
    return [
      ...(unit.nobreaks || []).map((nobreak) => `${nobreak.DMT_CODE ? nobreak.DMT_CODE : '-'}`),
      ...(unit.duts.map((dut) => `${dut.DEV_ID}`) || '-'),
    ].join(', ');
  }

  function handleCSVData(listFilter) {
    setState({
      csvData: listFilter.map((unit) => ({
        client: unit.CLIENT_NAME || '-',
        state: unit.STATE_ID || '-',
        city: unit.CITY_NAME || '-',
        unit: unit.UNIT_NAME || '-',
        status: unit.PRODUCTION === 1 ? t('emOperacao') : t('emInstalacao'),
        startOperation: convertDateFormat(unit.PRODUCTION_TIMESTAMP) || '-',
        environment: unit.duts.filter((dut) => dut.ROOM_NAME).map((dut) => dut.ROOM_NAME).join(', ') || '-',
        machines: unit.dacs.filter((dac) => dac.GROUP_NAME).map((dac) => dac.GROUP_NAME).join(', ') || '-',
        utilities: getUtilitiesCSV(unit),
        waterDevices: getWaterDevicesCSV(unit),
        energyDevices: getEnergyDevicesCSV(unit),
        automationDevices: getAutomationDevicesCSV(unit),
        monitoringDevices: getMonitoringDevicesCSV(unit),
      })),
    });
  }

  function onPageChange(page) {
    state.tablePage = page;
    render();
    handleGetDacs();
  }

  const setFiltersAndList = async () => {
    state.tablePage = 1;
    await handleGetDacs();
  };

  useEffect(() => {
    if (!profile.manageAllClients && !profile.manageSomeClient) {
      setFiltersAndList();
    }
  }, []);

  async function clearFilters() {
    state.searchState = [];
    state.selectedCity = [];
    state.selectedState = [];
    state.selectedUnit = [];
    state.selectedClientFilter = [];
    state.selectedStatus = '';
    state.startOperation = '';
    state.endOperation = '';
    setInformationsUnits({ ...informationsUnits, statusUnitsCheck: '2' });

    state.isLoading = true;
    render();
    await handleGetDacs();
  }

  return (
    <>
      <Helmet>
        <title>{t('dielEnergiaUnidades')}</title>
      </Helmet>
      <AnalysisLayout />
      <UtilFilter
        state={state}
        render={render}
        onAply={setFiltersAndList}
        setState={setState}
        updateCheckInformations={updateCheckInformations}
        informationsUnits={informationsUnits}
        clearFilter={clearFilters}
        exportFunc={getCsvData}
        csvHeader={state.CSVHeader}
        listFilters={listFilters}
        lengthArrayResult={state.totalItems}
      />
      <Box width={[1, 1, 1, 1, 1 / 4, 1 / 5]} mb={[24, 24, 24, 24, 24, 0]} minWidth={280}>
        <CSVLink
          headers={state.CSVHeader}
          data={state.csvData}
          separator=";"
          enclosingCharacter={"'"}
          filename={t('ListagemDeUnidadesCsv')}
          asyncOnClick
          ref={csvLinkEl}
        />
      </Box>
      {state.needFilter && (
        <>
          <AnalysisEmpty />
        </>
      )}
      {state.isLoading
        ? (
          <EmptyWrapper>
            <Loader variant="primary" size="large" />
          </EmptyWrapper>
        )
        : (!state.needFilter && (
          <>
            <DesktopTable
              style={{
                paddingTop: 16,
              }}
              verifyMobile
            >
              {state.unitsList
                ? (
                  <DataTable
                    isUnit
                    columns={columns}
                    data={state.unitsList}
                    onPageChange={onPageChange}
                    currentPage={state.tablePage}
                    pageSize={state.tablePageSize}
                    totalItems={state.totalItems}
                    verifyMobile
                  />
                )
                : (
                  <Flex justifyContent="center" alignItems="center">
                    <Box justifyContent="center" alignItems="center">
                      <StyledSpan>{t('erroDados')}</StyledSpan>
                    </Box>
                  </Flex>
                )}
            </DesktopTable>
          </>
        ))}
    </>
  );
};

export default withTransaction('Units', 'component')(Units);
