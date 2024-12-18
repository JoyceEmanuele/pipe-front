/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box } from 'reflexbox';
import {
  Loader,
  Button,
  ActionButton,
  InputSearch,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { DeleteOutlineIcon, EditIcon } from 'icons';
import { apiCall } from 'providers';
import { colors } from 'styles/colors';
import { getObjects } from '~/helpers/getObjetcs';
import {
  Scroll,
  Container,
  Head,
  Body,
  HeaderCell,
  HeaderTitle,
  Data,
  Row,
} from './styles';

export const ClientsList = (props: { fabricantes?: boolean }): JSX.Element => {
  const { fabricantes } = props;
  const [state, _render, setState] = useStateVar({
    clients: [] as {
      CLIENT_ID: number;
      NAME: string;
      EMAIL?: string;
      PICTURE?: string;
      ENABLED?: string;
      clientType: ('cliente' | 'fabricante' | 'mantenedor' | 'parceira')[];
    }[],
    clientsFiltered: [] as {
      CLIENT_ID: number;
      NAME: string;
      EMAIL?: string;
      PICTURE?: string;
      ENABLED?: string;
      clientType: ('cliente' | 'fabricante' | 'mantenedor' | 'parceira')[];
    }[],
    loading: false,
    nomesTipos: {} as { [k: string]: string },
    searchText: '',
  });

  useEffect(() => {
    getAllClients();
  }, []);

  const onSearch = (e) => {
    setState({ searchText: e.target.value });

    if (e.target.value) {
      setState({ clientsFiltered: state.clientsFiltered.filter((row) => getObjects(row, e.target.value).length) });
    } else {
      setState({ clientsFiltered: state.clients });
    }
  };

  async function getAllClients() {
    try {
      setState({ loading: true });
      const response = await apiCall('/clients/get-clients-list', { full: true });
      if (response) {
        for (const row of response.list) {
          if (row.ENABLED === '1') row.ENABLED = 'SIM';
          if (row.ENABLED === '0') row.ENABLED = 'NÃO';
        }
        const filterData = response.list.filter((row) => {
          if (fabricantes && !(row.PERMS_C || '').includes('[F]')) return false;
          return true;
        })
          .sort((a, b) => (a.NAME >= b.NAME ? 1 : -1));
        state.nomesTipos = {};
        for (const { cod2, label } of Object.values(response.clientTypes || {})) {
          state.nomesTipos[cod2] = label;
        }
        setState({ clients: filterData });
        setState({ clientsFiltered: filterData });
      }
    } catch (error) { console.log(error); toast.error('Houve erro'); }
    setState({ loading: false });
  }

  async function deleteClient(rowData) {
    try {
      if (!window.confirm(`Deseja excluir o cliente ${rowData.NAME}?`)) return;
      await apiCall('/clients/remove-client', { clientId: rowData.CLIENT_ID, keepDevsData: true });
      window.location.reload();
    } catch (error) { console.log(error); toast.error('Houve erro'); }
  }

  if (state.loading) {
    return <Loader variant="primary" />;
  }
  return (
    <>
      <Box minWidth="200px" width={[1, 1, 1, 1, 1 / 5]} mb={[16, 16, 16, 16, 16, 0]} style={{ marginTop: 30, marginBottom: 0 }}>
        <InputSearch
          id="search"
          name="search"
          placeholder="Pesquisar"
          value={state.searchText}
          onChange={onSearch}
          style={{
            margin: 0,
          }}
        />
      </Box>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '15px' }}>
        <Link to={fabricantes ? '/painel/fabricantes/adicionar' : '/painel/clientes/novo-cliente'}>
          <Button onClick={() => {}} variant="primary" style={{ width: '200px' }}>
            {fabricantes ? 'Novo Fabricante' : 'Nova Empresa'}
          </Button>
        </Link>
      </div>
      <Scroll>
        <Container>
          <Head>
            <Row>
              <HeaderCell>
                <HeaderTitle>
                  <span>Logo</span>
                </HeaderTitle>
              </HeaderCell>
              <HeaderCell>
                <HeaderTitle>
                  <span>Nome</span>
                </HeaderTitle>
              </HeaderCell>
              <HeaderCell>
                <HeaderTitle>
                  <span>Email</span>
                </HeaderTitle>
              </HeaderCell>
              <HeaderCell>
                <HeaderTitle>
                  <span>Tipo</span>
                </HeaderTitle>
              </HeaderCell>
              <HeaderCell>
                <HeaderTitle>
                  <span>Habilitado</span>
                </HeaderTitle>
              </HeaderCell>
              <HeaderCell>
                <HeaderTitle>
                  <span />
                </HeaderTitle>
              </HeaderCell>
            </Row>
          </Head>
          <Body>
            {state.clientsFiltered.map((item) => (
              <Row key={item.CLIENT_ID}>
                <Data>
                  <img src={item.PICTURE} alt-disabled="🖼️" style={{ maxWidth: '100px', maxHeight: '50px' }} />
                </Data>
                <Data>{item.NAME || '-'}</Data>
                <Data>{item.EMAIL || '-'}</Data>
                <Data>{(item.clientType || []).map((x) => state.nomesTipos[x] || x).join(', ')}</Data>
                <Data>{item.ENABLED}</Data>
                <Data>
                  <ActionButton onClick={() => deleteClient(item)} variant="red-inv">
                    <DeleteOutlineIcon colors={colors.Red} />
                  </ActionButton>
                  <Link to={fabricantes ? `/painel/fabricantes/editar/${item.CLIENT_ID}` : `/painel/clientes/editar-cliente/${item.CLIENT_ID}`}>
                    <ActionButton
                      onClick={() => {}}
                      variant="blue-inv"
                    >
                      <EditIcon color={colors.LightBlue} />
                    </ActionButton>
                  </Link>
                </Data>
              </Row>
            ))}
          </Body>
        </Container>
      </Scroll>
    </>
  );
};
