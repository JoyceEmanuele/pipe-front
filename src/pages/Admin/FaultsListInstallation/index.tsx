import {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { Box } from 'reflexbox';
import moment from 'moment';

import {
  Loader, NewTable, InputSearch, Button,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';

import { AdminLayout } from '../AdminLayout';
import {
  LoaderContainer,
  Scroll,
  FaultsRow,
  StyledLink,
  Container,
} from './styles';
import { FaultsLayout } from '../FaultsLayout';
import { withTransaction } from '@elastic/apm-rum-react';

type Fault = {
    fault_name: string,
    dev_id: string,
    fault_time?: string,
    return_time?: string,
    notif_type: 'Detect' | 'Return',
}

type Dac = {
  DAC_ID: string;
  CLIENT_NAME: string;
  UNIT_NAME: string;
  UNIT_ID: number;
  faults: Fault[];
};

export function FaultsListInstallation(): JSX.Element {
  const [state, render, setState] = useStateVar({
    loading: false,
    searchText: '',
    selectPositionX: 223,
    selectPositionY: 1536,
    dacs: [] as Dac[],
    csvData: [] as {
      DAC_ID: string,
      CLIENT_NAME: string,
      UNIT_NAME: string,
      falha: string,
      dataEntrada: string,
      dataSaida: string,
    }[],
  });

  const CSVheader = [
    { label: 'Cliente', key: 'CLIENT_NAME' },
    { label: 'Unidade', key: 'UNIT_NAME' },
    { label: 'Dispositivo', key: 'DAC_ID' },
    { label: 'Falha', key: 'falha' },
    { label: 'Data de Entrada', key: 'dataEntrada' },
    { label: 'Data de Saída', key: 'dataSaida' },
  ];

  const csvLinkEl = useRef();

  useEffect(() => {
    loadData();
  }, []);

  const filteredDacs = useMemo(() => {
    const searchTerms = state.searchText.toLowerCase().split(' ').map((x) => x.trim()).filter((x) => !!x);
    if (!searchTerms.length) return state.dacs;
    const auxiliarFilteredDacs: Dac[] = [];

    for (const dac of state.dacs) {
      if (dac.faults !== undefined) {
        let filteredFaults = dac.faults;
        for (const term of searchTerms) {
          if ((dac.CLIENT_NAME || '').toLowerCase().includes(term)) { continue; }
          if ((dac.UNIT_NAME || '').toLowerCase().includes(term)) { continue; }
          if ((dac.DAC_ID || '').toLowerCase().includes(term)) { continue; }
          filteredFaults = filteredFaults.filter((faultRow) => (faultRow.fault_name || '').toLowerCase().includes(term));

          if (!filteredFaults.length) break;
        }

        if (filteredFaults && filteredFaults.length) {
          auxiliarFilteredDacs.push({ ...dac, faults: filteredFaults });
        }
      }
    }
    return auxiliarFilteredDacs;
  },
  [state.dacs, state.searchText]);

  async function loadData() {
    setState({ loading: true });
    try {
      const reqParams = {
        startTime: moment().add(-2, 'w').format('YYYY-MM-DDThh:mm:ss'), // não usa toISOString pois seria necessário retirar a timezone.
      };
      const { falhas: faultyDacs, dacs: dacInfos, success } = await apiCall('/dac/get-installation-faults', reqParams);
      state.dacs = [];

      for (const [devId, faults] of Object.entries(faultyDacs)) {
        const dacFaults: Fault[] = [];
        for (const faultsList of Object.values(faults)) {
          faultsList.sort((a, b) => {
            if (a.fault_time > b.fault_time) {
              return 1;
            }
            if (a.fault_time < b.fault_time) {
              return -1;
            }
            return 0;
          });

          const filteredFaults = faultsList.filter((fault, index, list) => {
            // o objetivo é ter somente a primeira ocorrência de cada estado (detectado ou retornado) para montar uma entrada na lista para cada par.
            if (index === 0) return true; // sempre mantém o primeiro
            const former = list[index - 1];
            if (fault.notif_type === former.notif_type) return false; // se notif_type não variar, descartar o atual
            return true;
          });

          for (const fault of filteredFaults) {
            fault.fault_time = fault.fault_time.replace('T', ' ');
            if (fault.notif_type === 'Return') {
              if (dacFaults.length === 0) continue;
              dacFaults[dacFaults.length - 1].return_time = fault.fault_time;
            }
            else if (fault.notif_type === 'Detect') {
              dacFaults.push(fault);
            }
          }
        }

        const dacInfo = dacInfos[devId] || {};

        const dac: Dac = {
          DAC_ID: devId,
          CLIENT_NAME: dacInfo.CLIENT_NAME || '-',
          UNIT_ID: dacInfo.UNIT_ID || 0,
          UNIT_NAME: dacInfo.UNIT_NAME || '-',
          faults: dacFaults,
        };
        if (dacFaults.length > 0) {
          state.dacs.push(dac);
        }
      }
    } catch (err) {
      console.log(err);
    }
    setState({ loading: false });
  }

  async function exportFaults() {
    try {
      const flattenedData = state.dacs.flatMap((dac) => dac.faults.map((fault) => ({
        DAC_ID: dac.DAC_ID,
        CLIENT_NAME: dac.CLIENT_NAME,
        UNIT_ID: dac.UNIT_ID,
        UNIT_NAME: dac.UNIT_NAME,
        falha: fault.fault_name,
        dataEntrada: fault.fault_time || '-',
        dataSaida: fault.return_time || '-',
      })));
      state.csvData = flattenedData;
      render();
      setTimeout(() => {
        (csvLinkEl as any).current.link.click();
      }, 1000);
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
      value: 'Cliente',
      accessor: 'CLIENT_NAME',
    },
    {
      name: 'unit',
      value: 'Unidade',
      accessor: 'UNIT_NAME',
      render: (props: Dac) => ((props.UNIT_NAME) ? <StyledLink to={`/analise/unidades/${props.UNIT_ID}`}>{props.UNIT_NAME || '-'}</StyledLink> : (props.UNIT_NAME || '-')),
    },
    {
      name: 'dac',
      value: 'DAC',
      accessor: 'DAC_ID',
      render: ({ DAC_ID }: Dac) => (
        <StyledLink
          to={`/analise/dispositivo/${DAC_ID}/saude`}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {DAC_ID}
        </StyledLink>
      ),
    },
    {
      name: 'falha',
      value: 'Falha',
      accessor: null,
      render: ({ faults }: Dac) => (
        <FaultsRow
          style={{
            height: `${faults.length * 28}px`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {faults.map((fault) => (
            <div
              key={fault.fault_name}
            >
              {fault.fault_name}
            </div>
          ))}
        </FaultsRow>
      ),
    },
    {
      name: 'first_alert',
      value: 'Data de Entrada',
      sortable: true,
      accessor: null,
      render: ({ faults }: Dac) => (
        <FaultsRow
          style={{
            height: `${faults.length * 28}px`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {faults.map((fault) => <div key={fault.fault_name}>{fault.fault_time}</div>)}
        </FaultsRow>
      ),
    },
    {
      name: 'last_alert',
      value: 'Data de Saída',
      sortable: true,
      accessor: null,
      render: ({ faults, DAC_ID }: Dac) => (
        <FaultsRow
          style={{
            height: `${faults.length * 28}px`,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {faults.map((fault) => <div key={fault.fault_name}>{fault.return_time || '-'}</div>)}
        </FaultsRow>
      ),
    },
  ];

  return (
    <Container>
      <Helmet>
        <title>Diel Energia - DACs com Falha de Instalação</title>
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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
              <InputSearch
                id="search"
                name="search"
                placeholder="Pesquisar"
                value={state.searchText}
                onChange={(e) => setState({ searchText: e.target.value })}
              />
            </Box>
            <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]}>
              <Button style={{ width: '120px' }} onClick={exportFaults} variant="primary">Exportar</Button>
              <CSVLink
                headers={CSVheader}
                data={state.csvData}
                filename="FalhasDeInstalacao.csv"
                separator=";"
                asyncOnClick
                enclosingCharacter={"'"}
                ref={csvLinkEl}
              />
            </Box>
          </div>
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

export default withTransaction('FaultsListInstallation', 'component')(FaultsListInstallation);
