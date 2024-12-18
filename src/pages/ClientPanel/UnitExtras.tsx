import { useEffect } from 'react';

import { toast } from 'react-toastify';
import styled from 'styled-components';

import {
  ActionButton, Button, Input, Loader,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { EditIcon, DeleteOutlineIcon } from '~/icons';
import { apiCall } from '~/providers';
import { colors } from '~/styles/colors';

export function ExtrasList({
  list, wantDelete, wantEdit, wantAdd,
}) {
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Button variant="primary" onClick={() => wantAdd()}>Adicionar</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Valor</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map((row, index) => (
            <tr key={`${index}\t${row[0]}\t${row[1]}`}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td>
                <ActionButton onClick={() => wantDelete(index)} variant="red-inv">
                  <DeleteOutlineIcon colors={colors.Red} />
                </ActionButton>
                <ActionButton onClick={() => wantEdit(index)} variant="blue-inv">
                  <EditIcon color={colors.LightBlue} />
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export function ExtrasEdit({ editedItem = null, onConfirm, onCancel }) {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isEdit: !!editedItem,
      // @ts-ignore
      name: (editedItem && editedItem[0]) || '',
      // @ts-ignore
      value: (editedItem && editedItem[0]) || '',
      formErrors: {
        name: '',
        value: '',
      },
    };
    return state;
  });

  function validateForm() {
    state.formErrors.name = state.name ? '' : 'O nome é obrigatório';
    state.formErrors.value = state.value ? '' : 'O valor é obrigatório';
    render();
    return !(state.formErrors.name || state.formErrors.value);
  }

  function confirm() {
    if (!validateForm()) return;
    onConfirm([state.name, state.value]);
  }

  return (
    <div>
      <Input
        type="text"
        value={state.name}
        placeholder="Nome"
        onChange={(event) => setState({ name: event.target.value })}
      />
      <Input
        type="text"
        style={{ marginTop: '10px' }}
        value={state.value}
        placeholder="Valor"
        onChange={(event) => setState({ value: event.target.value })}
      />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
      }}
      >
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <Button style={{ width: '140px' }} onClick={confirm} variant="primary">
          {state.isEdit ? 'Salvar' : 'Adicionar'}
        </Button>
        {/* @ts-ignore */}
        <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel} variant="grey">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function FormEditExtras({ unitId, wantClose }) {
  const [state, render, setState] = useStateVar(() => {
    const state = {
      loading: false,
      list: [] as string[][],
      activeView: 'List',
      submitting: false,
      // @ts-ignore
      editedIndex: null as number,
    };
    return state;
  });

  useEffect(() => {
    fetchServerData();
  }, []);

  async function fetchServerData() {
    try {
      state.loading = true; render();
      const unitInfo = await apiCall('/clients/get-unit-info', { unitId });
      const list = JSON.parse(unitInfo.EXTRA_DATA || '[]');
      if (!(list instanceof Array)) throw Error('Invalid EXTRA_DATA.');
      for (const row of list) {
        if (!(row instanceof Array)) throw Error('Invalid EXTRA_DATA.');
        if (row.length !== 2) throw Error('Invalid EXTRA_DATA.');
        if (typeof row[0] !== 'string') throw Error('Invalid EXTRA_DATA.');
        if (typeof row[1] !== 'string') throw Error('Invalid EXTRA_DATA.');
        // if (row && (row.length === 2) && (row[0] || row[1])) { } // OK
        // else continue;
        // state.list.push([
        //   row[0] || '',
        //   row[1] || '',
        // ]);
      }
      state.list = list;
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.loading = false; render();
  }

  async function confirm() {
    try {
      state.submitting = true; render();
      await apiCall('/clients/edit-unit', {
        UNIT_ID: unitId,
        EXTRA_DATA: JSON.stringify(state.list),
      });
      toast.success('Salvo!');
      wantClose();
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.submitting = false; render();
  }

  function onConfirmItem(item) {
    if (state.editedIndex != null) {
      state.list[state.editedIndex] = item;
    } else {
      state.list.push(item);
    }
    console.log(item, state.editedIndex, state.list[state.editedIndex]);
    state.activeView = 'List';
    render();
  }

  function onWantRemoveItem(index: number) {
    if (!window.confirm('Deseja excluir?')) return;
    state.list.splice(index, 1);
    // @ts-ignore
    setState({ activeView: 'List', editedIndex: null });
  }

  let modalContent = null;
  if (state.activeView === 'List') {
    // @ts-ignore
    modalContent = (
      <ExtrasList
        list={state.list}
        // @ts-ignore
        wantAdd={() => setState({ activeView: 'Edit', editedIndex: null })}
        wantEdit={(index) => setState({ activeView: 'Edit', editedIndex: index })}
        wantDelete={(index) => { onWantRemoveItem(index); }}
      />
    );
  }
  if (state.activeView === 'Edit') {
    // @ts-ignore
    modalContent = (
      <ExtrasEdit
      // @ts-ignore
        editedItem={(state.editedIndex == null) ? null : state.list[state.editedIndex]}
        onConfirm={(item) => { onConfirmItem(item); }}
        // @ts-ignore
        onCancel={() => setState({ activeView: 'List', editedIndex: null })}
      />
    );
  }

  return (
    <div>
      {state.loading
        ? <Loader />
        : (
          <>
            {modalContent}
            {(state.activeView === 'List')
            && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
            }}
            >
              {/* eslint-disable-next-line react/jsx-no-bind */}
              <Button style={{ width: '140px' }} onClick={confirm} variant="primary">
                Salvar
              </Button>
              {/* @ts-ignore */}
              <Button style={{ width: '140px', margin: '0 20px' }} onClick={wantClose} variant="grey">
                Cancelar
              </Button>
            </div>
            )}
          </>
        )}
    </div>
  );
}

const Table = styled.table`
  white-space: nowrap;
  & td,th {
    padding: 3px 10px;
    border: 1px solid grey;
  }
`;
