import React, { useState, useEffect, useMemo } from 'react';

import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { WithContext as ReactTags } from 'react-tag-input';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import {
  DataTable, Button, EmptyWrapper, Loader, StatusBox, Checkbox, Select,
} from '~/components';
import { ModalWindow } from '~/components/ModalWindow';
import { getUserProfile } from '~/helpers/userProfile';
import { useStateVar } from '~/helpers/useStateVar';
import { TermometerSubIcon } from '~/icons';
import { AnalysisLayout } from '~/pages/Analysis/AnalysisLayout';
import { saveSessionStorageItem, removeSessionStorageItem, getSessionStorageItem } from '~/helpers/cachedStorage';
import { ApiResps, apiCall } from '../../../../providers';
import { colors } from '~/styles/colors';

import {
  DesktopTable,
  MobileTable,
  StyledSpan,
  StyledLink,
  SearchInput,
  Label,
  BtnClean,
  BtnInput,
} from './styles';

import '~/assets/css/ReactTags.css';
import { FilterItem } from '../../AnalysisFilters';
import { ToggleSwitchMini } from '~/components/ToggleSwitch';
import { FullProg_v4 } from '~/providers/types';
import { OrderableHeaderCell, TableColumn } from '~/components/DataTable';
import i18n from '~/i18n';
import { UtilFilter } from '../../Utilities/UtilityFilter';
import { ajustParams, setValueState } from '~/helpers/genericHelper';
import { withTransaction } from '@elastic/apm-rum-react';
import { AnalysisEmpty } from '../../AnalysisEmpty';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const t = i18n.t.bind(i18n);

const descOper = {
  allow: t('liberadoMin'),
  forbid: t('bloqueadoMin'),
  onlyfan: t('ventilacao'),
  enabling: t('habilitando'),
  disabling: t('bloqueando'),
  eco: 'Eco-Mode',
};

const CSVHeader = [
  { label: t('cliente'), key: 'CLIENT_NAME' },
  { label: t('estado'), key: 'state' },
  { label: t('cidade'), key: 'city' },
  { label: t('unidade'), key: 'unit' },
  { label: t('maquina'), key: 'group' },
  { label: t('dispositivo'), key: 'devId' },
  { label: t('diasDaSemana.seg'), key: 'mon' },
  { label: t('diasDaSemana.ter'), key: 'tue' },
  { label: t('diasDaSemana.qua'), key: 'wed' },
  { label: t('diasDaSemana.qui'), key: 'thu' },
  { label: t('diasDaSemana.sex'), key: 'fri' },
  { label: t('diasDaSemana.sab'), key: 'sat' },
  { label: t('diasDaSemana.dom'), key: 'sun' },
  { label: t('modo'), key: 'mode' },
  { label: 'Setpoint', key: 'setpoint' },
  { label: t('rele'), key: 'relay' },
  { label: t('temperatura'), key: 'temperature' },
  { label: t('conexao'), key: 'status' },
  { label: t('ultimoVisto'), key: 'lastCommTs' },
];

const KeyCodes = {
  comma: 188,
  slash: 191,
  enter: [10, 13],
};

const delimiters = [...KeyCodes.enter, KeyCodes.comma, KeyCodes.slash];

export const DamsList = (): JSX.Element => {
  const csvLinkEl = React.useRef();
  const [profile] = useState(getUserProfile);
  const [isProg, setIsProg] = useState(false); // Altera seleção do switch "Informações Exibidas"
  const [isDesktop, setIsDesktop] = useState(true); // Exibe ou não o switch de programação horária
  const history = useHistory();

  const [state, render, setState] = useStateVar(() => {
    const state = {
      firstLoading: null as boolean | null,
      dielClientId: null,
      actionOpts: [] as { label: string, value: string }[],
      clientsList: [] as { CLIENT_ID: number, NAME: string }[],
      selectedClientFilter: setValueState('filterClient') as any | any[],
      selectedClient: null,
      wantSetClient: false,
      ownershipOpts: [
        { value: 'CLIENTS', label: t('deClientes') },
        { value: 'N-COMIS', label: t('naoComissionados') }, // aqueles com DEV_ID default de firmware
        { value: 'N-ASSOC', label: t('naoAssociados') }, // Aqueles que já tem DEV_ID próprio, mas não possuem cliente associado
        { value: 'MANUFAC', label: t('comissionadosFabrica') }, // Aqueles que já tem DEV_ID próprio, e possuem cliente SERDIA
        { value: 'D-TESTS', label: t('emTestes') }, // Aqueles que estão associados ao cliente DIEL ENERGIA LTDA.
        { value: 'ALLDEVS', label: t('todos') },
      ],
      ownershipFilter: null,
      isLoading: !profile.manageAllClients && !profile.manageSomeClient, // setIsLoading
      csvData: [], // setCsvData
      environments: [], // setEnvironments
      searchState: [] as { id: string, text: string }[],
      searchValue: '' as string,
      tablePage: 1,
      tablePageSize: 50,
      totalItems: 0,
      selectedState: setValueState('filterStates') as any | any[],
      selectedCity: setValueState('filterCity') as any | any[],
      selectedUnit: setValueState('filterUnit') as any | any[],
      selectedControlType: [] as any | any[],
      selectedOperationStatus: [] as any | any[],
      selectedEcoMode: [] as any | any[],
      selectedConnection: [] as any | any[],
      selectedDevId: '',
      filters: [] as FilterItem[],
      orderBy: null as null | [string, 'ASC' | 'DESC'],
      needFilter: profile.manageAllClients || profile.manageSomeClient,
      selectedTemperature: [] as string[],
    };

    if (profile.viewAllClients) {
      // @ts-ignore
      state.ownershipFilter = state.ownershipOpts[0];
    }

    if (profile.permissions.isAdminSistema) {
      state.actionOpts = [{ label: t('definirProgramacao'), value: 'set-schedule' }, { label: t('excluir'), value: 'delete' }, { label: t('atribuirCliente'), value: 'set-client' }];
    } else if (profile.manageAllClients) {
      state.actionOpts = [{ label: t('definirProgramacao'), value: 'set-schedule' }, { label: t('atribuirCliente'), value: 'set-client' }];
    } else if (profile.manageSomeClient) {
      // @ts-ignore
      state.actionOpts = [{ label: t('definirProgramacao'), value: 'set-schedule' }];
    }

    return state;
  });

  useEffect(() => {
    const screenSize = window.matchMedia('(max-width: 768px)');

    setIsDesktop(!screenSize.matches);
  }, []);

  async function applyActionToSelected(action, list) {
    try {
      const selectedDevs = list.filter((dev) => dev.checked);

      if (!selectedDevs.length) return;

      if (action === 'delete') {
        if (!window.confirm(t('desejaExcluirDams', { value: selectedDevs.length }))) {
          return;
        }
        for (const dev of selectedDevs) {
          if (dev.isDut) {
            await apiCall('/dut/delete-dut-info', { dutId: dev.devId }).then((data) => ({ data }));
          } else if (dev.isDri) {
            await apiCall('/dri/delete-dri-info', { driId: dev.devId }).then((data) => ({ data }));
          } else {
            await apiCall('/dam/delete-dam-info', { damId: dev.DAM_ID }).then((data) => ({ data }));
          }
        }
        window.location.reload();
        return;
      }
      if (action === 'set-client') {
        state.wantSetClient = true; render();
        return;
      }
      if (action === 'set-schedule') {
        const ids = selectedDevs.map((x) => x.DEV_ID);
        const onlyDuts = !selectedDevs.some((dev) => !dev.isDut);
        // TODO: programação em batelada de DUT
        history.push(`/analise/programacao-dams/?ids=${encodeURIComponent(ids.join('*'))}`);
        return;
      }
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  async function confirmSetClient() {
    try {
      // @ts-ignore
      const selectedDevs = state.environments.filter((dev) => dev.checked);
      if (!selectedDevs.length) {
        toast.error(t('erroNenhumDispositivoSelecionado'));
        return;
      }

      // @ts-ignore
      const clientId = state.selectedClient && state.selectedClient.CLIENT_ID;

      if (!clientId) {
        toast.error(t('erroClienteNaoSelecionadoInvalido'));
        return;
      }

      for (const dev of selectedDevs) {
        // @ts-ignore
        if (dev.isDut) {
          // @ts-ignore
          await apiCall('/dut/set-dut-info', { DEV_ID: dev.devId, CLIENT_ID: clientId });
        } else {
          // @ts-ignore
          await apiCall('/dam/set-dam-info', { DAM_ID: dev.DAM_ID, CLIENT_ID: clientId });
        }
      }

      window.location.reload();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  const outputJSXSchedule = (schedule: string) => {
    if (schedule === 'Sem info') {
      return (
        <Flex flexDirection="column">
          <Box fontWeight="bold" color="black">
            {t('sem')}
          </Box>
          <Box fontWeight="bold" color="black">
            info
          </Box>
        </Flex>
      );
    }

    if (schedule === 'Mult. progs.') {
      return (
        <Flex flexDirection="column">
          <Box fontWeight="bold" color="black">
            {t('mult.')}
          </Box>
          <Box fontWeight="bold" color="black">
            {t('progs.')}
          </Box>
        </Flex>
      );
    }

    if (schedule === '24h/dia') {
      return <StyledSpan>{schedule}</StyledSpan>;
    }

    if (schedule === 'Desligado') {
      return <StyledSpan>{schedule}</StyledSpan>;
    }

    const [start, end] = schedule.split(' - ');
    return (
      <Flex flexDirection="column" alignItems="start">
        <StyledSpan>{start}</StyledSpan>
        <StyledSpan style={{ paddingLeft: '12px' }}>-</StyledSpan>
        <StyledSpan>{end}</StyledSpan>
      </Flex>
    );
  };

  const outputSchedule = (schedule: string, hasMultSchedule?: boolean) => {
    if (schedule === '- - -') return !hasMultSchedule ? 'Sem info' : 'Mult. progs.';

    if (schedule === '00:00 - 23:59') return '24h/dia';

    return schedule;
  };

  function orderColumn(column: TableColumn) {
    return (
      <OrderableHeaderCell onColumnClick={onColumnClick} column={column} orderBy={state.orderBy} />
    );
  }

  async function onColumnClick(column: { accessor: string }) {
    if (state.orderBy && (state.orderBy[1] === 'ASC') && (state.orderBy[0] === column.accessor)) {
      state.orderBy = [column.accessor, 'DESC'];
    } else {
      state.orderBy = [column.accessor, 'ASC'];
    }
    render();
    await handleGetDAMS();
  }

  const [columns, columnsMobile] = useMemo(() => {
    const columnsDesktop = [] as TableColumn[];
    const columnsMobile = [] as TableColumn[];

    columnsDesktop.push({
      // @ts-ignore
      Header: t('estado'),
      // @ts-ignore
      accessor: 'col_STATE_ID',
      // @ts-ignore
      Cell: (props) => <StyledSpan>{props.state}</StyledSpan>,
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('cidade'),
      // @ts-ignore
      accessor: 'col_CITY_NAME',
      // @ts-ignore
      Cell: (props) => <StyledSpan>{props.city}</StyledSpan>,
      HeaderCell: orderColumn,
    });
    if (profile.viewMultipleClients) {
      columnsDesktop.push({
        // @ts-ignore
        Header: t('cliente'),
        // @ts-ignore
        accessor: 'col_CLIENT_NAME',
        // @ts-ignore
        Cell: (props) => (props.CLIENT_NAME ? <StyledSpan>{props.CLIENT_NAME}</StyledSpan> : '-'),
        HeaderCell: orderColumn,
      });
    }
    columnsDesktop.push({
      // @ts-ignore
      Header: t('unidade'),
      // @ts-ignore
      accessor: 'col_UNIT_NAME',
      // @ts-ignore
      Cell: (props) => <>{props.unit.id && props.unit.name ? <StyledLink to={`/analise/unidades/${props.unit.id}`}><StyledSpan onClick={saveSessionFilters}>{props.unit.name}</StyledSpan></StyledLink> : '-'}</>,
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('maquina'),
      // @ts-ignore
      accessor: 'col_MACHINE_NAME',
      // @ts-ignore
      Cell: (props) => (
        <StyledLink to={`/analise/dispositivo/${props.devId}/informacoes`} style={props.damInop ? { color: 'red' } : {}}>
          <StyledSpan>
            {(props.group && props.group.length > 100 ? (props.group).slice(0, 100).concat('...') : props.group || '-')}
          </StyledSpan>
        </StyledLink>
      ),
      HeaderCell: orderColumn,
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('dispositivo'),
      // @ts-ignore
      accessor: 'col_DEV_ID',
      // @ts-ignore
      Cell: (props) => (
        <>
          {props.devId
            ? (
              <StyledLink to={`/analise/dispositivo/${props.devId}/informacoes`} style={props.damInop ? { color: 'red' } : {}}>
                <StyledSpan onClick={saveSessionFilters}>{props.devId}</StyledSpan>
              </StyledLink>
            )
            : (
              '-'
            )}
        </>
      ),
      HeaderCell: orderColumn,
    });
    columnsMobile.push({
      // @ts-ignore
      Header: t('dispositivo'),
      // @ts-ignore
      accessor: 'col_DEV_ID',
      // @ts-ignore
      Cell: (props) => (
        <>
          {props.devId
            ? (
              <StyledLink to={`/analise/dispositivo/${props.devId}/informacoes`}>
                <StyledSpan onClick={saveSessionFilters}>{props.devId}</StyledSpan>
              </StyledLink>
            )
            : (
              '-'
            )}
        </>
      ),
      HeaderCell: orderColumn,
    });
    !isProg
      ? columnsDesktop.push({
        // @ts-ignore
        Header: t('controle'),
        // @ts-ignore
        accessor: 'col_MODE',
        // @ts-ignore
        Cell: (props) => (
          <>
            <StyledSpan>{props.mode}</StyledSpan>
          </>
        ),
        HeaderCell: orderColumn,
      })
      : columnsDesktop.push({
        // @ts-ignore
        Header: t('diasDaSemana.seg'),
        // @ts-ignore
        accessor: 'mon',
        // @ts-ignore
        Cell: (props) => (
          <>
            {outputJSXSchedule(props.mon)}
          </>
        ),
      });
    columnsMobile.push({
      // @ts-ignore
      Header: t('controle'),
      // @ts-ignore
      accessor: 'col_MODE',
      // @ts-ignore
      Cell: (props) => (
        <>
          <StyledSpan>{props.mode}</StyledSpan>
        </>
      ),
      HeaderCell: orderColumn,
    });
    !isProg
      ? columnsDesktop.push({
        // @ts-ignore
        Header: t('operacao'),
        // @ts-ignore
        accessor: 'col_STATE',
        // @ts-ignore
        Cell: (props) => (
          <>
            <StyledSpan>{props.relay}</StyledSpan>
          </>
        ),
        HeaderCell: orderColumn,
      })
      : columnsDesktop.push({
        // @ts-ignore
        Header: t('diasDaSemana.ter'),
        // @ts-ignore
        accessor: 'tue',
        // @ts-ignore
        Cell: (props) => (
          <>
            {outputJSXSchedule(props.tue)}
          </>
        ),
      });
    columnsMobile.push({
      // @ts-ignore
      Header: t('operacao'),
      // @ts-ignore
      accessor: 'col_STATE',
      // @ts-ignore
      Cell: (props) => (
        <>
          <StyledSpan>{props.relay}</StyledSpan>
        </>
      ),
      HeaderCell: orderColumn,
    });
    !isProg
      ? columnsDesktop.push({
        // @ts-ignore
        Header: t('modoEco'),
        // @ts-ignore
        accessor: 'col_ECO_MODE_ENABLED',
        // @ts-ignore
        Cell: (props) => (
          <>
            <StyledSpan>{(props.ecoModeEnabled === false) ? t('desabilitado') : (props.ecoModeEnabled === true) ? t('habilitado') : '-'}</StyledSpan>
          </>
        ),
        HeaderCell: orderColumn,
      })
      : columnsDesktop.push({
        // @ts-ignore
        Header: t('diasDaSemana.qua'),
        // @ts-ignore
        accessor: 'wed',
        // @ts-ignore
        Cell: (props) => (
          <>
            {outputJSXSchedule(props.wed)}
          </>
        ),
      });
    !isProg
      ? columnsDesktop.push({
        // @ts-ignore
        Header: 'Setpoint',
        // @ts-ignore
        accessor: 'col_TEMPRT_SETPOINT',
        // @ts-ignore
        Cell: (props) => (
          <>
            <StyledSpan>{formatNumberWithFractionDigits(props.temprtSetpoint)}</StyledSpan>
          </>
        ),
        HeaderCell: orderColumn,
      })
      : columnsDesktop.push({
        // @ts-ignore
        Header: t('diasDaSemana.qui'),
        // @ts-ignore
        accessor: 'thu',
        // @ts-ignore
        Cell: (props) => (
          <>
            {outputJSXSchedule(props.thu)}
          </>
        ),
      });
    !isProg
      ? columnsDesktop.push({
        // @ts-ignore
        Header: t('temperatura'),
        // @ts-ignore
        accessor: 'col_REFERENCE_TEMPERATURE',
        // @ts-ignore
        Cell: (props) => (
          <>
            <TermometerSubIcon color={props.referenceTemperature && (props.specialColor || colors.Green)} />
            <StyledSpan style={{ color: (props.referenceTemperature && (props.specialColor || colors.Green)) }}>{formatNumberWithFractionDigits(props.referenceTemperature) || '-'}</StyledSpan>
          </>
        ),
        HeaderCell: orderColumn,
      })
      : columnsDesktop.push({
        // @ts-ignore
        Header: t('diasDaSemana.sex'),
        // @ts-ignore
        accessor: 'fri',
        // @ts-ignore
        Cell: (props) => (
          <>
            {outputJSXSchedule(props.fri)}
          </>
        ),
      });
    isProg && columnsDesktop.push({
      // @ts-ignore
      Header: t('diasDaSemana.sab'),
      // @ts-ignore
      accessor: 'sat',
      // @ts-ignore
      Cell: (props) => (
        <>
          {outputJSXSchedule(props.sat)}
        </>
      ),
    });
    isProg && columnsDesktop.push({
      // @ts-ignore
      Header: t('diasDaSemana.dom'),
      // @ts-ignore
      accessor: 'sun',
      // @ts-ignore
      Cell: (props) => (
        <>
          {outputJSXSchedule(props.sun)}
        </>
      ),
    });
    columnsDesktop.push({
      // @ts-ignore
      Header: t('conexao'),
      // @ts-ignore
      accessor: 'col_STATUS',
      // @ts-ignore
      Cell: (props) => <StatusBox status={props.status}>{props.status}</StatusBox>,
      HeaderCell: orderColumn,
    });
    columnsMobile.push({
      // @ts-ignore
      Header: t('conexao'),
      // @ts-ignore
      accessor: 'col_STATUS',
      // @ts-ignore
      Cell: (props) => <StatusBox status={props.status}>{props.status}</StatusBox>,
      HeaderCell: orderColumn,
    });

    if (profile.manageAllClients) {
      columnsDesktop.push({
        // @ts-ignore
        Header: t('ultimaVezVisto'),
        // @ts-ignore
        accessor: 'col_LAST_SEEN',
        // @ts-ignore
        Cell: (props) => (props.lastCommTs || '-'),
        HeaderCell: orderColumn,
      });
    }

    if (state.actionOpts.length > 0) {
      columnsDesktop.push({
        // @ts-ignore
        Header: '',
        // @ts-ignore
        accessor: 'col_selection',
        // @ts-ignore
        Cell: (props) => <Checkbox checked={props.checked} onClick={() => { props.checked = !props.checked; render(); }} />,
      });
    }

    return [columnsDesktop, columnsMobile];
  }, [isProg]);

  const getDailySchedule = (
    devId: string,
    dutLastProg: FullProg_v4 | undefined,
    damLastProg: FullProg_v4 | undefined,
    key: string,
    hasMultSchedule: boolean,
  ) => {
    const isDut = devId.includes('DUT');

    if (isDut) {
      if (dutLastProg?.week[key]?.permission === 'forbid') {
        return outputSchedule(t('desligadoMin'));
      }

      const startDate = dutLastProg?.week[key]?.start || '-';
      const endDate = dutLastProg?.week[key]?.end || '-';

      return outputSchedule(`${startDate} - ${endDate}`, hasMultSchedule);
    }

    if (damLastProg?.week[key]?.permission === 'forbid') {
      return outputSchedule(t('desligadoMin'));
    }

    const startDate = damLastProg?.week[key]?.start || '-';
    const endDate = damLastProg?.week[key]?.end || '-';

    return outputSchedule(`${startDate} - ${endDate}`);
  };

  function ajustObjectOfDev(list) {
    for (const dev of list) {
      dev.State = descOper[dev.State] || dev.State;
      if (dev.Mode === 'Auto') dev.Mode = 'Automático';
      // @ts-ignore
      if (dev.lastCommTs) { dev.lastCommTs = dev.lastCommTs.replace('T', ' '); }

      Object.assign(dev, {
        state: dev.STATE_ID || '-',
        city: dev.CITY_NAME || '-',
        unit: { id: dev.UNIT_ID, name: dev.UNIT_NAME } || '-',
        group: dev.machineName || '-',
        devId: dev.DEV_ID || '-',
        mode: dev.Mode || '-',
        relay: dev.State || '-',
        status: dev.status || '-',
        isDut: dev.DEV_ID.includes('DUT'),
        isDri: dev.DEV_ID.includes('DRI'),
        mon: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'mon', dev.DUT_NEED_MULT_SCHEDULES),
        tue: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'tue', dev.DUT_NEED_MULT_SCHEDULES),
        wed: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'wed', dev.DUT_NEED_MULT_SCHEDULES),
        thu: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'thu', dev.DUT_NEED_MULT_SCHEDULES),
        fri: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'fri', dev.DUT_NEED_MULT_SCHEDULES),
        sat: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'sat', dev.DUT_NEED_MULT_SCHEDULES),
        sun: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'sun', dev.DUT_NEED_MULT_SCHEDULES),
      });
    }
  }

  async function handleGetDAMS() {
    try {
      setState({ isLoading: true });
      if (state.needFilter !== null) setState({ needFilter: false });

      loadSessionFilters();

      const [
        { list, totalItems },
      ] = await Promise.all([
        apiCall('/get-autom-devs-list', {
          INCLUDE_INSTALLATION_UNIT: !!profile.viewAllClients || !!profile.permissions.isInstaller,
          includeDacs: true,
          SKIP: (state.tablePage - 1) * state.tablePageSize,
          LIMIT: state.tablePageSize,
          // @ts-ignore
          searchTerms: state.selectedDevId ? [state.selectedDevId.toLowerCase()] : [],
          // @ts-ignore
          ownershipFilter: (state.ownershipFilter && state.ownershipFilter.value) || undefined,
          clientIds: (state.selectedClientFilter.length > 0) ? ajustParams(state.selectedClientFilter) : undefined,
          stateIds: (state.selectedState.length > 0) ? ajustParams(state.selectedState) : undefined,
          cityIds: (state.selectedCity.length > 0) ? ajustParams(state.selectedCity) : undefined,
          unitIds: (state.selectedUnit.length > 0) ? ajustParams(state.selectedUnit) : undefined,
          controlMode: (state.selectedControlType.length > 0) ? state.selectedControlType : undefined,
          operationStatus: (state.selectedOperationStatus.length > 0) ? state.selectedOperationStatus : undefined,
          ecoMode: (state.selectedEcoMode.length > 0) ? state.selectedEcoMode : undefined,
          status: (state.selectedConnection.length > 0) ? state.selectedConnection : undefined,
          orderByProp: state.orderBy && state.orderBy[0]?.substring('col_'.length) || undefined,
          orderByDesc: (state.orderBy && state.orderBy[1] === 'DESC') || undefined,
          temprtAlerts: (state.selectedTemperature.length > 0) ? state.selectedTemperature : undefined,
        }),
      ]);

      verifyAutomationsTemperatureLimits(list);
      ajustObjectOfDev(list);

      state.totalItems = totalItems;
      // @ts-ignore
      // @ts-ignore
      state.environments = list;
    } catch (err) {
      console.log(err);
      toast.error(t('erroCarregarDados'));
    }
    if (state.needFilter === null) setState({ needFilter: true });
    setState({ isLoading: false });
  }

  function verifyAutomationsTemperatureLimits(automationDevice: ApiResps['/get-autom-devs-list']['list']) {
    return automationDevice.map((devAutomation) => {
      let specialColor: string|undefined;

      if (devAutomation.referenceTemperature && devAutomation.temprtAlert) {
        if (devAutomation.temprtAlert === 'low') specialColor = colors.LightBlue;
        else if (devAutomation.temprtAlert === 'high') specialColor = colors.Red;
      }
      return Object.assign(devAutomation, {
        specialColor,
      });
    });
  }

  const getCsvData = async () => {
    state.isLoading = true; render();

    apiCall('/get-autom-devs-list', {
      INCLUDE_INSTALLATION_UNIT: !!profile.viewAllClients || !!profile.permissions.isInstaller,
      // @ts-ignore
      searchTerms: state.selectedDevId ? [state.selectedDevId.toLowerCase()] : [],
      // @ts-ignore
      ownershipFilter: (state.ownershipFilter && state.ownershipFilter.value) || undefined,
      clientIds: (state.selectedClientFilter.length > 0) ? ajustParams(state.selectedClientFilter) : undefined,
      stateIds: (state.selectedState.length > 0) ? ajustParams(state.selectedState) : undefined,
      cityIds: (state.selectedCity.length > 0) ? ajustParams(state.selectedCity) : undefined,
      unitIds: (state.selectedUnit.length > 0) ? ajustParams(state.selectedUnit) : undefined,
      controlMode: (state.selectedControlType.length > 0) ? state.selectedControlType : undefined,
      operationStatus: (state.selectedOperationStatus.length > 0) ? state.selectedOperationStatus : undefined,
      ecoMode: (state.selectedEcoMode.length > 0) ? state.selectedEcoMode : undefined,
      status: (state.selectedConnection.length > 0) ? state.selectedConnection : undefined,
      orderByProp: state.orderBy && state.orderBy[0]?.substring('col_'.length) || undefined,
      orderByDesc: (state.orderBy && state.orderBy[1] === 'DESC') || undefined,
    }).then(({ list }) => {
      const formatterCSV = list.map((dev) => ({
        CLIENT_NAME: dev.CLIENT_NAME || '-',
        state: dev.STATE_ID || '-',
        city: dev.CITY_NAME || '-',
        unit: dev.UNIT_NAME || '-',
        group: dev.machineName || '-',
        devId: dev.DEV_ID || '-',
        mode: dev.Mode || '-',
        setpoint: dev.temprtSetpoint,
        relay: dev.State || '-',
        status: dev.status || '-',
        temperature: dev.referenceTemperature || '-',
        // @ts-ignore
        lastCommTs: (dev.lastCommTs && dev.lastCommTs.replace('T', ' ')) || '-',
        mon: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'mon', dev.DUT_NEED_MULT_SCHEDULES),
        tue: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'tue', dev.DUT_NEED_MULT_SCHEDULES),
        wed: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'wed', dev.DUT_NEED_MULT_SCHEDULES),
        thu: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'thu', dev.DUT_NEED_MULT_SCHEDULES),
        fri: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'fri', dev.DUT_NEED_MULT_SCHEDULES),
        sat: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'sat', dev.DUT_NEED_MULT_SCHEDULES),
        sun: getDailySchedule(dev.DEV_ID, dev.DUT_LASTPROG, dev.DAM_LASTPROG, 'sun', dev.DUT_NEED_MULT_SCHEDULES),
      }));
      // @ts-ignore
      state.csvData = formatterCSV;
      state.isLoading = false; render();

      setTimeout(() => {
        (csvLinkEl as any).current.link.click();
      }, 1000);
    });
  };

  const onPageChange = (page) => {
    state.tablePage = page;
    render();
    handleGetDAMS();
  };

  useEffect(() => {
    if (state.firstLoading) {
      handleGetDAMS();
    }
  }, [state.tablePage]);

  useEffect(() => {
    if (state.firstLoading && !profile.viewAllClients && !profile.viewMultipleClients) {
      state.tablePage = 1;
      render();
      handleGetDAMS();
    }
  }, [state.ownershipFilter]);

  useEffect(() => {
    if (!profile.viewAllClients && !profile.viewMultipleClients) {
      handleGetDAMS();
    }
    state.firstLoading = true;
  }, []);

  function loadSessionFilters() {
    const filters = getSessionStorageItem('automationAnalysisFilters') as null | {
      searchState: [],
      selectedState: [],
      selectedCity: [],
      selectedUnit: [],
      selectedClientFilter?: [],
      selectedControlType: [],
      selectedOperationStatus: [],
      selectedEcoMode: [],
      selectedConnection: [],
      selectedTemperature: [],
    };
    if (filters) {
      state.searchState = filters.searchState || [];
      state.selectedState = filters.selectedState || [];
      state.selectedCity = filters.selectedCity || [];
      state.selectedUnit = filters.selectedUnit || [];
      state.selectedClientFilter = filters.selectedClientFilter || [];
      state.selectedControlType = filters.selectedControlType || [];
      state.selectedOperationStatus = filters.selectedOperationStatus || [];
      state.selectedEcoMode = filters.selectedEcoMode || [];
      state.selectedConnection = filters.selectedConnection || [];
      state.selectedTemperature = filters.selectedTemperature || [];
    }
    render();
    removeSessionStorageItem('automationAnalysisFilters');
  }

  function saveSessionFilters() {
    const filters = {
      searchState: state.searchState,
      selectedState: state.selectedState,
      selectedCity: state.selectedCity,
      selectedUnit: state.selectedUnit,
      selectedControlType: state.selectedControlType,
      selectedOperationStatus: state.selectedOperationStatus,
      selectedEcoMode: state.selectedEcoMode,
      selectedConnection: state.selectedConnection,
    } as any;
    if (state.dielClientId) {
      filters.selectedClientFilter = state.selectedClientFilter;
    }
    saveSessionStorageItem('automationAnalysisFilters', filters);
  }

  async function clearFilters() {
    state.searchState = [];
    state.selectedCity = [];
    state.selectedClientFilter = [];
    state.selectedState = [];
    state.selectedConnection = [];
    state.selectedUnit = [];
    state.selectedControlType = [];
    state.selectedOperationStatus = [];
    state.selectedEcoMode = [];

    render();
    await handleGetDAMS();
  }
  // @ts-ignore
  const selectedDevs = state.environments.filter((dev) => dev.checked);

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaAutomacao')}</title>
      </Helmet>
      <AnalysisLayout />
      <UtilFilter
        state={state}
        render={render}
        onAply={() => { state.tablePage = 1; handleGetDAMS(); }}
        setState={setState}
        clearFilter={clearFilters}
        exportFunc={getCsvData}
        csvHeader={CSVHeader}
        listFilters={['estado', 'cidade', 'unidade', 'cliente', 'conexao', 'controle', 'modoEco', 'operacao', 'tipo', 'progDisp', 'id', 'temperatura']}
        isProg={isProg}
        setProg={(value: string) => { if (value === 'dispositivo') { setIsProg(false); } else { setIsProg(true); } }}
        lengthArrayResult={state.environments.length}
      />
      <Flex flexWrap="wrap" width={1} justifyContent="space-between">
        <Box width={1} pt={24} mb={24}>
          <Flex flexWrap="wrap" justifyContent="space-between" style={{ gap: '20px' }}>
            {(selectedDevs.length > 0) && (
              <Box width={[1, 1, 1, 1, 1, 1 / 5]} minWidth="280px">
                <Select
                  options={state.actionOpts}
                  value={null}
                  placeholder={`${selectedDevs.length} selecionado(s)`}
                  onSelect={(opt) => applyActionToSelected(opt.value, selectedDevs)}
                />
              </Box>
            )}
            <Box width={[1, 1, 1, 1, 1 / 4, 1 / 5]} mb={[24, 24, 24, 24, 0, 0]} minWidth={280} style={{ marginLeft: '15px' }}>
              <CSVLink
                headers={CSVHeader}
                data={state.csvData}
                separator=";"
                enclosingCharacter={"'"}
                filename={t('nomeArquivoListagemAutomacao')}
                asyncOnClick
                ref={csvLinkEl}
              />
            </Box>
          </Flex>
        </Box>
      </Flex>
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
        : !state.needFilter && (
          <>
            <DesktopTable>
              {state.environments
                ? (
                  <DataTable
                    isUnit={false}
                    columns={columns}
                    data={state.environments}
                    onPageChange={onPageChange}
                    currentPage={state.tablePage}
                    pageSize={state.tablePageSize}
                    totalItems={state.totalItems}
                  />
                )
                : (
                  <Flex justifyContent="center" alignItems="center">
                    <Box justifyContent="center" alignItems="center">
                      <StyledSpan>{t('naoFoiPossivelCarregarDados')}</StyledSpan>
                    </Box>
                  </Flex>
                )}
            </DesktopTable>
            <MobileTable>
              {state.environments
                ? (
                  <DataTable
                    isUnit={false}
                    columns={columnsMobile}
                    data={state.environments}
                    onPageChange={onPageChange}
                    currentPage={state.tablePage}
                    pageSize={state.tablePageSize}
                    totalItems={state.totalItems}
                  />
                )
                : (
                  <Flex justifyContent="center" alignItems="center">
                    <Box justifyContent="center" alignItems="center">
                      <StyledSpan>{t('naoFoiPossivelCarregarDados')}</StyledSpan>
                    </Box>
                  </Flex>
                )}
            </MobileTable>
          </>
        )}
      {(state.wantSetClient)
        && (
          // @ts-ignore
          <ModalWindow>
            <h3>{t('selecioneCliente')}</h3>
            <Select
              options={state.clientsList}
              propLabel="NAME"
              value={state.selectedClient}
              placeholder={t('cliente')}
              onSelect={(item) => { state.selectedClient = item; render(); }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
            }}
            >
              <Button style={{ width: '140px' }} onClick={() => { confirmSetClient(); }} variant="primary">
                {t('botaoSalvar')}
              </Button>
              {/* @ts-ignore */}
              <Button style={{ width: '140px', margin: '0 20px' }} onClick={() => { state.wantSetClient = false; render(); }} variant="grey">
                {t('botaoCancelar')}
              </Button>
            </div>
          </ModalWindow>
        )}
    </>
  );
};

const StatusIcon = styled.div<{ color?, status?}>(
  ({ color, status }) => `
  width: 10px;
  height: 10px;
  margin-left: 5px;
  border-radius: 50%;
  border: 2px solid ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  background: ${color || (status === 'ONLINE' ? colors.Blue300 : colors.Grey200)};
  font-weight: bold;
  font-size: 0.8em;
  line-height: 18px;
  color: ${colors.White};
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: capitalize;
`,
);

export default withTransaction('DamsList', 'component')(DamsList);
