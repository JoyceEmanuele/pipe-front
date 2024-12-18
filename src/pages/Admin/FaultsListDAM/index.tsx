import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

import {
  Loader, Checkbox, Select, NewTable,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';

import { AdminLayout } from '../AdminLayout';
import {
  LoaderContainer,
  Scroll,
  FaultsRow,
  StyledLink,
  TransparentLink,
  SelectContainer,
} from './styles';
import { FaultsLayout } from '../FaultsLayout';
import { withTransaction } from '@elastic/apm-rum-react';

const approvalDesc = {
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
  ERASED: 'Apagado',
};

function urlText(text) {
  return encodeURIComponent((text || 'null').replace(/ /g, '-'));
}

export const FaultsListDAM = (): JSX.Element => {
  const [state, render, setState] = useStateVar({
    dams: [] as {
      DAM_ID: string
      faults: {
        id: string
        desc: string
        primDet: string
        ultDet: string
        checked?: boolean
      }[]
    }[],
    loading: false,
    selectPositionX: 223,
    selectPositionY: 1536,
    columns: [
      {
        name: 'client',
        value: 'Cliente',
        accessor: 'CLIENT_NAME',
      },
      {
        name: 'unit',
        value: 'Unidade',
        accessor: 'UNIT_NAME',
        render: (props) => ((props.UNIT_NAME) ? <StyledLink to={`/analise/unidades/${props.UNIT_ID}`}>{props.UNIT_NAME || '-'}</StyledLink> : (props.UNIT_NAME || '-')),
      },
      {
        name: 'dam',
        value: 'DAM',
        accessor: 'DAM_ID',
        render: (props) => <StyledLink to={`/analise/dispositivo/${props.DAM_ID}/informacoes`}>{props.DAM_ID}</StyledLink>,
      },
      {
        name: 'fault',
        value: 'Falha',
        sortable: false,
        render: (props) => (
          <FaultsRow style={{ height: `${props.faults.length * 28}px` }}>
            {props.faults.map((fault) => <div key={fault.id}>{fault.desc}</div>)}
          </FaultsRow>
        ),
      },
      {
        name: 'firstAlert',
        value: '1º Alerta',
        sortable: false,
        render: (props) => (
          <FaultsRow style={{ height: `${props.faults.length * 28}px` }}>
            {props.faults.map((fault) => <div key={fault.id}>{fault.primDet}</div>)}
          </FaultsRow>
        ),
      },
      {
        name: 'lastDetec',
        value: 'Última Detecção',
        sortable: false,
        render: (props) => (
          <TransparentLink to={`/analise/dispositivo/${props.DAM_ID}/programacao`}>
            <FaultsRow style={{ height: `${props.faults.length * 28}px` }}>
              {props.faults.map((fault) => <div key={fault.id}>{fault.ultDet}</div>)}
            </FaultsRow>
          </TransparentLink>
        ),
      },
      {
        name: 'checkbox',
        value: '',
        sortable: false,
        checkable: true,
        checkValue: [{ value: 'faults', type: 'array' }, { value: 'checked', type: 'check' }],
        width: 50,
        render: (props) => (
          <FaultsRow style={{ height: `${props.faults.length * 28}px` }}>
            {props.faults.map((fault) => (
              <Checkbox
                key={fault.id}
                checked={fault.checked}
                onClick={(event) => {
                  state.selectPositionX = event.clientX - 300;
                  state.selectPositionY = event.clientY;
                  fault.checked = !fault.checked;
                  render();
                }}
              />
            ))}
          </FaultsRow>
        ),
      },
    ],
  });

  const loadData = () => {
    Promise.resolve().then(async () => {
      setState({ loading: true });
      try {
        const [
          { list: faultyDams },
        ] = await Promise.all([
          apiCall('/get-dams-faults', {}),
        ]);

        state.dams = [];

        for (const item of faultyDams) {
          const faults = [] as (typeof state.dams)[0]['faults'];
          if (item.fdetected) {
            Object.values(item.fdetected).forEach((falha) => {
              faults.push({
                id: falha.id,
                desc: falha.faultName || '-',
                primDet: (falha.firstRiseTS && new Date(falha.firstRiseTS - 3 * 60 * 60 * 1000).toISOString().substr(0, 19).replace('T', ' ')) || '-',
                ultDet: (falha.lastRiseTS && new Date(falha.lastRiseTS - 3 * 60 * 60 * 1000).toISOString().substr(0, 19).replace('T', ' ')) || '-',
              });
            });
          }
          state.dams.push(Object.assign(item, { faults }));
        }
      } catch (err) { console.log(err); }
      setState({ loading: false });
    });
  };

  useEffect(() => {
    render();
    loadData();
  }, []);

  async function applyActionToSelectedDams(action, selectedFaults) {
    try {
      if (!selectedFaults.length) return;

      if (action === 'erase') {
        if (!window.confirm('Deseja ignorar a(s) falha(s)?')) return;
        for (const falha of selectedFaults) {
          await apiCall('/dam/clear-fault-daminop', { damId: falha.devId });
        }
        window.location.reload();
        return;
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  const selectedDamFaults = [] as { devId: string, faultId: string }[];
  state.dams.forEach((dev) => {
    dev.faults.forEach((fault) => {
      if (fault.checked) {
        selectedDamFaults.push({ devId: dev.DAM_ID, faultId: fault.id });
      }
    });
  });

  return (
    <>
      <Helmet>
        <title>Diel Energia - DAMs com Falha</title>
      </Helmet>
      <AdminLayout />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '23px' }}>
        <FaultsLayout />
      </div>
      {state.loading && (
        <LoaderContainer>
          <Loader variant="primary" />
          <span>Carregando</span>
        </LoaderContainer>
      )}
      {(!state.loading)
        && (
        <>
          {(selectedDamFaults.length > 0) && (
          <SelectContainer style={{ width: '280px', top: state.selectPositionY, left: state.selectPositionX }}>
            <Select
              options={[{ label: 'Apagar', value: 'erase' }]}
              value={null}
              placeholder={`${selectedDamFaults.length} selecionada(s)`}
              onSelect={(opt) => { applyActionToSelectedDams(opt.value, selectedDamFaults); }}
            />
          </SelectContainer>
          )}
          <Scroll>
            <NewTable
              data={state.dams}
              columns={state.columns}
              pageSize={20}
            />
          </Scroll>

        </>
        )}
    </>
  );
};

export default withTransaction('FaultsListDAM', 'component')(FaultsListDAM);
