import { useEffect, useMemo } from 'react';

import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Box } from 'reflexbox';
import moment from 'moment';

import {
  Loader, Checkbox, Select, NewTable, InputSearch, Button,
} from 'components';
import { HealthIcon, healthLevelDesc } from 'components/HealthIcon';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallDownload } from 'providers';

import { SingleDatePicker, DateRangePicker } from 'react-dates';
import { t } from 'i18next';

import { AdminLayout } from '../AdminLayout';
import {
  SelectContainer,
  LoaderContainer,
  Scroll,
  FaultsRow,
  StyledLink,
  TransparentLink,
  Container,
} from './styles';
import { FaultsLayout } from '../FaultsLayout';
import { FaultAction } from '../../../providers/types/api-private';
import { withTransaction } from '@elastic/apm-rum-react';
import { useLocation } from 'react-router-dom';

type Fault = {
  id: string;
  origem: string;
  desc: string;
  primDet: string;
  ultDet: string;
  status: string;
  lastAction: FaultAction,
  statusDesc: string;
  checked?: boolean;
}

type Dev = {
  DEV_ID: string;
  CLIENT_NAME: string;
  UNIT_NAME: string;
  UNIT_ID: number;
  H_INDEX: number;
  hLevelDesc: string;
  faults: Fault[];
};

const APPROVAL_DESCS = {
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
  ERASED: 'Apagado',
  PENDING: 'Pendente',
  RESTABLISHED: 'Restabelecido',
  RESTAB_WAITING: 'Restabelecimento esperando falha pendente',
  RESTAB_PENDING: 'Restabelecimento manual pendente',
};

export function FaultsList(): JSX.Element {
  const [state, render, setState] = useStateVar({
    loading: false,
    searchText: '',
    selectPositionX: 223,
    selectPositionY: 1536,
    filterOpts: [
      { value: 'PENDING', label: 'Pendentes' }, // o valor padrão é "PENDING"
      { value: 'APPROVED', label: 'Aprovadas' },
      { value: 'REJECTED', label: 'Reprovadas' },
      { value: 'RESTAB_WAITING', label: 'Restabelecimento esperando falha pendente' },
      { value: 'ALL', label: 'Todas' },
    ],
    statusSelection: null as null|{ value: string, label: string },
    healthSelection: null as null|{ value: string, label: string },
    unitSelection: 0 as number,
    clientSelection: 0 as number,
    dataSelection: null as null|{ value: string, label: string },
    devs: [] as Dev[],
    faults_count: 0,
    dateStart: null as null|moment.Moment,
    dateEnd: null as null|moment.Moment,
    tomorrow: moment(moment().add(1, 'days').format('YYYY-MM-DD')),
    focusedInput: null as 'endDate'|'startDate'|null,
    focused: false,
    isModalOpen: false,
    multiDays: false,
  });
  const { pathname } = useLocation();

  const faultType: 'dac'|'dut'| undefined = useMemo(() => {
    const splitPath = pathname.split('/');
    const faultType = splitPath[splitPath.length - 1];
    console.log(faultType);
    if (faultType === 'dac' || faultType === 'dut') {
      return faultType;
    }
  }, [pathname]);

  useEffect(() => {
    loadData();
  }, [faultType]);

  function filterFaultsBySearchTerms(dac, searchTerms, filteredFaults) {
    for (const term of searchTerms) {
      if (shouldSkipTerm(dac, term)) {
        continue;
      }
      filteredFaults = filterFaultRowsByTerm(filteredFaults, term);
      if (!filteredFaults.length) {
        break;
      }
    }
    return filteredFaults;
  }

  function shouldSkipTerm(dev, term) {
    return (
      (dev.CLIENT_NAME || '').toLowerCase().includes(term)
      || (dev.UNIT_NAME || '').toLowerCase().includes(term)
      || (dev.DEV_ID || '').toLowerCase().includes(term)
      || (dev.hLevelDesc || '').toLowerCase().includes(term)
    );
  }

  function filterFaultRowsByTerm(filteredFaults, term) {
    return filteredFaults.filter((faultRow) => (
      (faultRow.origem || '').toLowerCase().includes(term)
        || (faultRow.desc || '').toLowerCase().includes(term)
    ));
  }

  function applyFilters(filteredFaults, dataSelection, dateStart, dateEnd) {
    if (dataSelection && dataSelection.value !== 'ALL') {
      filteredFaults = filteredFaults.filter((faultRow) => (faultRow.status || '') === dataSelection?.value);
    }

    if (dateStart) {
      filteredFaults = filteredFaults.filter((faultRow) => {
        const faultDate = moment(faultRow.primDet);
        return faultDate.isSameOrAfter(dateStart, 'day');
      });
    }

    if (dateEnd) {
      filteredFaults = filteredFaults.filter((faultRow) => {
        const faultDate = moment(faultRow.primDet);
        return faultDate.isSameOrBefore(dateEnd, 'day');
      });
    }

    return filteredFaults;
  }

  const filteredDacs = useMemo(() => {
    const searchTerms = state.searchText.toLowerCase().split(' ').map((x) => x.trim()).filter((x) => !!x);
    if (!searchTerms.length && state.dataSelection?.value === 'ALL' && !state.dateStart && !state.dateEnd) {
      state.faults_count = state.devs.length;
      return state.devs;
    }
    const auxiliarFilteredDacs: Dev[] = [];

    for (const dac of state.devs) {
      if (dac.faults !== undefined) {
        let filteredFaults = dac.faults;

        filteredFaults = applyFilters(filteredFaults, state.dataSelection, state.dateStart, state.dateEnd);

        filteredFaults = filterFaultsBySearchTerms(dac, searchTerms, filteredFaults);

        if (filteredFaults && filteredFaults.length) {
          auxiliarFilteredDacs.push({ ...dac, faults: filteredFaults });
        }
      }
    }
    state.faults_count = auxiliarFilteredDacs.length;
    return auxiliarFilteredDacs;
  },
  [state.devs, state.searchText, state.dataSelection]);

  async function loadData() {
    setState({ loading: true });
    try {
      const { list: faultyDacs, expirationLimit } = await apiCall('/dev/get-faults', { devType: faultType });

      state.devs = [];

      for (const item of faultyDacs) {
        const faults: Fault[] = [];

        if (item.fdetected) {
          Object.values(item.fdetected).forEach((falha) => {
            faults.push(buildFaultLine(falha, expirationLimit));
          });
        }
        const hLevelDesc = healthLevelDesc[String(item.H_INDEX)];
        state.devs.push(Object.assign(item, { faults, hLevelDesc, rowkey: item.DEV_ID }));
      }
    } catch (err) {
      console.log(err);
    }
    setState({ loading: false });
  }

  function buildFaultLine(
    falha: {
        id: string;
        origin: string;
        faultName: string;
        faultLevel: number;
        lastActionTime: number;
        lastAction: FaultAction;
        lastDet: number;
        lastRiseTS: string;
        firstRiseTS: string;
    },
    expirationLimit?: number,
  ) {
    if (expirationLimit && (falha?.lastActionTime < expirationLimit)) {
      if (falha.lastAction === 'ERASED' || falha.lastAction === 'REJECTED') {
        const falhaTemp: { lastAction?: string } = falha;
        delete falhaTemp.lastAction;
      }
    }

    let desc = falha.faultName || '-';
    let status: string = falha.lastAction || 'PENDING';
    if (falha.lastAction === 'RESTAB_PENDING') {
      desc = `(Restabelecimento) ${desc}`;
      status = 'Pendente';
    }
    return {
      id: falha.id,
      origem: falha.origin || '-',
      desc,
      primDet: (falha?.firstRiseTS?.substring(0, 19)?.replace('T', ' ')) || '-',
      ultDet: (falha?.lastRiseTS?.substring(0, 19)?.replace('T', ' ')) || '-',
      status,
      statusDesc: APPROVAL_DESCS[falha.lastAction],
      lastAction: falha.lastAction,
    };
  }

  async function exportFaults() {
    try {
      const exportResponse = await apiCallDownload('/export-dacs-faults', {});
      const link = document.getElementById('downloadLink') as any;
      if (link !== null) {
        if (link.href !== '#') window.URL.revokeObjectURL(link.href);
        link.href = window.URL.createObjectURL(exportResponse.data);
        link.download = exportResponse.headers.filename || 'Falhas.xlsx';
        link.click();
        toast.success('Exportado com sucesso.');
      } else {
        throw new Error();
      }
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível exportar!');
    }
  }

  function handleFaultItemClick(event, fault: { checked?: boolean }) {
    state.selectPositionX = event.clientX - 300;
    state.selectPositionY = event.clientY;
    fault.checked = !fault.checked;
    render();
  }

  const TABLE_COLUMNS = [
    {
      name: 'client',
      value: t('cliente'),
      accessor: 'CLIENT_NAME',
    },
    {
      name: 'unit',
      value: t('unidade'),
      accessor: 'UNIT_NAME',
      render: (props: Dev) => ((props.UNIT_NAME) ? <StyledLink to={`/analise/unidades/${props.UNIT_ID}`}>{props.UNIT_NAME || '-'}</StyledLink> : (props.UNIT_NAME || '-')),
    },
    {
      name: 'dev',
      value: t('dispositivo'),
      accessor: 'DEV_ID',
      render: ({ DEV_ID }: Dev) => <StyledLink to={`/analise/dispositivo/${DEV_ID}/saude`}>{DEV_ID}</StyledLink>,
    },
    {
      name: 'health_now',
      value: t('saudeAtual'),
      accessor: 'H_INDEX',
      render: ({ H_INDEX }: Dev) => <HealthIcon health={(H_INDEX || 0).toString()} label={healthLevelDesc[String(H_INDEX)]} />,
    },
    {
      name: 'origin',
      value: t('origem'),
      sortable: false,
      accessor: 'fault.origem',
      render: ({ faults }: Dev) => (
        <FaultsRow style={{ height: `${faults.length * 28}px` }}>
          {faults.map((fault) => <div key={fault.id}>{fault.origem}</div>)}
        </FaultsRow>
      ),
    },
    {
      name: 'fault',
      value: t('falhasDetectadas'),
      sortable: false,
      accessor: 'fault.desc',
      render: ({ faults }: Dev) => (
        <FaultsRow style={{ height: `${faults.length * 28}px` }}>
          {faults.map((fault) => <div key={fault.id}>{fault.desc}</div>)}
        </FaultsRow>
      ),
    },
    {
      name: 'first_alert',
      value: t('1oAlerta'),
      sortable: false,
      accessor: 'fault.primDet',
      render: ({ faults }: Dev) => (
        <FaultsRow style={{ height: `${faults.length * 28}px` }}>
          {faults.map((fault) => <div key={fault.id}>{fault.primDet}</div>)}
        </FaultsRow>
      ),
    },
    {
      name: 'last_alert',
      value: t('ultimaDet'),
      sortable: false,
      accessor: 'fault.ultDet',
      render: ({ faults, DEV_ID }: Dev) => (
        <TransparentLink to={`/analise/dispositivo/${DEV_ID}/historico`}>
          <FaultsRow style={{ height: `${faults.length * 28}px` }}>
            {faults.map((fault) => <div key={fault.id}>{fault.ultDet}</div>)}
          </FaultsRow>
        </TransparentLink>
      ),
    },
    {
      name: 'status',
      value: 'Status',
      sortable: false,
      accessor: 'fault.status',
      render: ({ faults }: Dev) => (
        <FaultsRow style={{ height: `${faults.length * 28}px` }}>
          {faults.map((fault) => <div key={fault.id}>{APPROVAL_DESCS[fault.status] || fault.status}</div>)}
        </FaultsRow>
      ),
    },
    {
      name: 'checkbox',
      value: '',
      sortable: false,
      checkable: true,
      checkValue: [{ value: 'faults', type: 'array' }, { value: 'checked', type: 'check' }],
      width: 50,
      render: ({ faults, DEV_ID }: Dev) => (
        <FaultsRow style={{ height: `${faults.length * 28}px` }}>
          {faults.map((fault) => (
            <Checkbox
              key={fault.id}
              checked={fault.checked || false}
              onClick={(event) => handleFaultItemClick(event, fault)}
            />
          ))}
        </FaultsRow>
      ),
    },
  ];

  const selectedDacFaults = [] as { devId: string, faultId: string, state: string }[];
  state.devs.forEach((dev) => {
    dev.faults.forEach((fault) => {
      if (fault.checked) {
        selectedDacFaults.push({ devId: dev.DEV_ID, faultId: fault.id, state: fault.lastAction });
      }
    });
  });

  function onMultidaysClick() {
    state.multiDays = !state.multiDays;
    if (!state.multiDays) {
      state.dateEnd = state.dateStart;
    }
    console.log(state.multiDays);
    render();
  }

  return (
    <Container>
      <Helmet>
        <title>Diel Energia - DACs com Falha</title>
      </Helmet>
      <AdminLayout />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '23px' }}>
        <FaultsLayout />
      </div>
      {state.loading ? (
        <LoaderContainer>
          <Loader variant="primary" />
          <span>Carregando</span>
        </LoaderContainer>
      ) : (
        <>
          <br />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
              <InputSearch
                id="search"
                name="search"
                placeholder="Pesquisar"
                value={state.searchText}
                onChange={(e) => setState({ searchText: e.target.value })}
              />
            </Box>
            <Box width={[1, 1, 1, 1, 1, 1 / 5]} minWidth="280px">
              <Select
                options={state.filterOpts}
                value={state.dataSelection}
                placeholder="Tipo"
                onSelect={(opt) => { state.dataSelection = opt; render(); }}
                notNull
              />
            </Box>
            <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
              <Button style={{ width: '120px' }} onClick={exportFaults} variant="primary">Exportar</Button>
              <a id="downloadLink" href="#" />
            </Box>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginRight: '20px' }}>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
            >
              <h3>
                {state.faults_count}
                {' '}
                falha(s) encontrada(s)
              </h3>
            </div>
          </div>
          {(selectedDacFaults.length > 0) && (
          <SelectContainer style={{ width: '280px', top: state.selectPositionY, left: state.selectPositionX }}>
            <Select
              options={[{ label: 'Aprovar', value: 'approve' }, { label: 'Reprovar', value: 'reject' }, { label: 'Apagar', value: 'erase' }, { label: 'Não verificar', value: 'disable' }]}
              value={null}
              placeholder={`${selectedDacFaults.length} selecionada(s)`}
              onSelect={(opt) => { applyActionToSelectedDacs(opt.value, selectedDacFaults); }}
            />
          </SelectContainer>
          )}
          <Scroll>
            <NewTable
              noSearchBar
              data={filteredDacs}
              columns={TABLE_COLUMNS}
              pageSize={20}
            />
          </Scroll>
        </>
      )}
    </Container>
  );
}

export async function applyActionToSelectedDacs(action: 'approve'|'reject'|'erase'|'disable', selectedFaults: { devId: string, faultId: string, state: string}[]) {
  try {
    if (!selectedFaults.length) return;

    if (action === 'approve') {
      if (!window.confirm('Deseja alterar o índice de saúde e confirmar a(s) falha(s)?')) return;
      for (const falha of selectedFaults) {
        let faultAction: 'APPROVED'|'REJECTED'|'ERASED'|'RESTABLISHED' = 'APPROVED';
        if (falha.state === 'RESTAB_PENDING') {
          faultAction = 'RESTABLISHED';
        }
        await apiCall('/dac/detected-fault-confirmation', {
          devId: falha.devId, faultId: falha.faultId, action: faultAction,
        });
      }
      window.location.reload();
      return;
    }

    if (action === 'reject') {
      if (!window.confirm('Deseja reprovar a(s) falha(s)?')) return;
      for (const falha of selectedFaults) {
        let faultAction: 'APPROVED'|'REJECTED'|'ERASED'|'RESTABLISHED' = 'REJECTED';
        if (falha.state === 'RESTAB_PENDING') {
          faultAction = 'APPROVED';
        }
        await apiCall('/dac/detected-fault-confirmation', {
          devId: falha.devId, faultId: falha.faultId, action: faultAction,
        });
      }
      window.location.reload();
      return;
    }

    if (action === 'erase') {
      if (!window.confirm('Deseja ignorar a(s) falha(s)?')) return;
      for (const falha of selectedFaults) {
        await apiCall('/dac/detected-fault-confirmation', {
          devId: falha.devId, faultId: falha.faultId, action: 'ERASED',
        });
      }
      window.location.reload();
      return;
    }

    if (action === 'disable') {
      if (!window.confirm('Deseja desativar a verificação da(s) falha(s)?')) return;
      for (const falha of selectedFaults) {
        await apiCall('/ignore-fault-check', {
          dev_id: falha.devId, faultId: falha.faultId, ignore: true,
        });
      }
      window.location.reload();
      return;
    }
  } catch (err) {
    console.log(err); toast.error('Houve erro');
  }
}

export default withTransaction('FaultsListDAC', 'component')(FaultsList);
