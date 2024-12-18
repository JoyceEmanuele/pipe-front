import { useEffect } from 'react';

import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';

import {
  Input, ModalWindow, ActionButton, Button, Loader, Select,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { DeleteOutlineIcon } from 'icons';
import { apiCall, ApiResps } from 'providers';
import { colors } from 'styles/colors';

import { AdminLayout } from '../AdminLayout';
import { ClientsList } from '../ClientsList';
import {
  TableContainer,
  TableHead,
  TableBody,
  HeaderCell,
  DataCell,
  Row,
  HeaderRow,
  SimpleButton,
} from './styles';
import { withTransaction } from '@elastic/apm-rum-react';

export const DevManufacts = (): JSX.Element => {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      list: [] as {
        IDSTART: string;
        IDEND: string;
        CLIENT_ID: number;
        CLIENT_NAME: string;
      }[],
      manufacturers: [] as {
        CLIENT_ID: number;
        NAME: string;
        PERMS_C: string;
        EMAIL?: string | undefined;
        PICTURE?: string | undefined;
        ENABLED?: string | undefined;
        clientType: ('cliente'|'fabricante'|'mantenedor'|'parceira')[];
        CNPJ?: string | undefined;
        PHONE?: string | undefined;
      }[],
      openModal: false,
      loading: true,
    };
    return state;
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      state.loading = true; render();
      const [
        { list },
        { list: clientsList },
      ] = await Promise.all([
        apiCall('/config/get-manufact-devs', {}),
        apiCall('/clients/get-clients-list', {}),
      ]);
      state.list = list;
      state.manufacturers = clientsList.filter((item) => (item.PERMS_C || '').includes('[F]'));
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.loading = false; render();
  }
  async function deleteItem(item) {
    try {
      if (window.confirm(`Deseja excluir a faixa ${item.IDSTART} - ${item.IDEND}?`)) {
        await apiCall('/config/delete-manufact-devs', { IDSTART: item.IDSTART, IDEND: item.IDEND });
        window.location.reload();
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }
  async function afterCreateItem({ item: responseData }) {
    try {
      state.openModal = false;
      await fetchData();
      toast.success('Sucesso');
    } catch (err) { console.log(err); toast.error('Houve erro'); }
  }

  return (
    <>
      <Helmet>
        <title>Diel Energia - Configurações</title>
      </Helmet>
      <AdminLayout />
      {state.loading && <Loader variant="primary" />}
      {(!state.loading)
        && (
        <div>
          <div style={{ width: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>&nbsp;</div>
              <SimpleButton variant="primary" onClick={() => setState({ openModal: true })}>Adicionar Faixa</SimpleButton>
            </div>
            <TableContainer>
              <TableHead>
                <HeaderRow>
                  <HeaderCell>Faixa</HeaderCell>
                  <HeaderCell>Fabricante</HeaderCell>
                  <HeaderCell />
                </HeaderRow>
              </TableHead>
              <TableBody>
                {state.list.map((item) => (
                  <Row key={item.IDSTART}>
                    <DataCell>{`${item.IDSTART} - ${item.IDEND}`}</DataCell>
                    <DataCell>{item.CLIENT_NAME}</DataCell>
                    <DataCell>
                      <ActionButton onClick={() => deleteItem(item)} variant="red-inv">
                        <DeleteOutlineIcon colors={colors.Red} />
                      </ActionButton>
                    </DataCell>
                  </Row>
                ))}
              </TableBody>
            </TableContainer>
          </div>
          <ClientsList fabricantes />
          {state.openModal
            ? (
              <ModalWindow onClickOutside={undefined}>
                <FormEdit
                  manufacturers={state.manufacturers}
                  onCancel={() => { state.openModal = false; render(); }}
                  onSuccess={afterCreateItem}
                />
              </ModalWindow>
            ) : <> </>}
        </div>
        )}
    </>
  );
};

function FormEdit({ manufacturers, onSuccess, onCancel }) {
  const [state, render, setState] = useStateVar({
    submitting: false,
    IDSTART: '',
    IDEND: '',
    CLIENT_ID_item: manufacturers[0] || null,
  });

  async function confirm() {
    let response = null as null|ApiResps['/config/add-manufact-devs'];
    try {
      state.submitting = true; render();
      const reqData = {
        IDSTART: state.IDSTART,
        IDEND: state.IDEND,
        CLIENT_ID: state.CLIENT_ID_item.CLIENT_ID,
      };
      response = await apiCall('/config/add-manufact-devs', reqData);
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.submitting = false; render();
    if (response) onSuccess({ item: response });
  }

  return (
    <div>
      <Input
        type="text"
        value={state.IDSTART}
        placeholder="ID inicial"
        onChange={(event) => { setState({ IDSTART: event.target.value }); }}
      />
      <div style={{ paddingTop: '10px' }} />
      <Input
        type="text"
        value={state.IDEND}
        placeholder="ID final"
        onChange={(event) => { setState({ IDEND: event.target.value }); }}
      />
      <div style={{ paddingTop: '10px' }} />
      <Select
        options={manufacturers}
        propLabel="NAME"
        value={state.CLIENT_ID_item}
        placeholder="Fabricante"
        onSelect={(item) => { setState({ CLIENT_ID_item: item }); }}
        notNull
      />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
      }}
      >
        <Button style={{ width: '140px' }} onClick={confirm} variant="primary">
          Adicionar
        </Button>
        <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel} variant="grey">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
export default withTransaction('DevManufacts', 'component')(DevManufacts);
