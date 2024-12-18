import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Loader, NewTable } from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall, ApiResps } from '~/providers';
import { AdminLayout } from '../AdminLayout';
import { FaultsLayout } from '../FaultsLayout';
import {
  SelectContainer,
  LoaderContainer,
  Scroll,
  FaultsRow,
  StyledLink,
  TransparentLink,
  Container,
} from './styles';
import { withTransaction } from '@elastic/apm-rum-react';

export const FaultsDisable = (): JSX.Element => {
  const [state, render, setState] = useStateVar({
    loading: false,
    typeFaults: [] as ApiResps['/dac/get-enable-faults-all']['list'],
  });

  const TABLE_COLUMNS = [
    {
      name: 'client',
      value: 'Cliente',
      accessor: 'client',
    },
    {
      name: 'unit',
      value: 'Unidade',
      accessor: 'unit',
      render: (props) => (
        <StyledLink to={`/analise/unidades/${props.unit_id}`}>
          {props.unit}
        </StyledLink>
      ),
    },
    {
      name: 'dac',
      value: 'DAC',
      accessor: 'dev_id',
      render: (props) => (
        <StyledLink to={`/analise/dispositivo/${props.dev_id}/informacoes`}>
          {props.dev_id}
        </StyledLink>
      ),
    },
    {
      name: 'falhas',
      value: 'Falhas',
      accessor: 'fault_id',
    },
    {
      name: 'data',
      value: 'Data',
      accessor: 'timestamp',
      render: (props) => (
        props.timestamp ? new Date(props.timestamp).toLocaleString() : ''
      ),
    },
    {
      name: 'action',
      value: 'Ação',
      accessor: 'enabled',
      render: (props) => (
        props.enabled ? 'Ativação' : 'Desativação'
      ),
    },
    {
      name: 'user',
      value: 'Usuário responsável',
      accessor: 'user',
    },
    {
      name: 'observation',
      value: 'Observação',
      accessor: 'description',
    },
  ];

  async function loadData() {
    try {
      const [
        responseTypeFaults,
      ] = await Promise.all([
        apiCall('/dac/get-enable-faults-all'),
      ]);

      state.typeFaults = responseTypeFaults.list;
      setState({ loading: true });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Container>
      <Helmet>
        <title>Diel Energia - DACs com Falha</title>
      </Helmet>
      <AdminLayout />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '23px' }}>
        <FaultsLayout />
      </div>
      {!state.loading ? (
        <LoaderContainer>
          <Loader variant="primary" />
          <span>Carregando</span>
        </LoaderContainer>
      ) : (
        <>
          <br />
          <Scroll>
            <NewTable
              noSearchBar
              data={state.typeFaults}
              columns={TABLE_COLUMNS}
              pageSize={20}
            />
          </Scroll>
        </>
      )}
    </Container>
  );
};

export default withTransaction('FaultsDisable', 'component')(FaultsDisable);
