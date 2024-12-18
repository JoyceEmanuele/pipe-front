import { useState, useMemo, useEffect } from 'react';

import { toast } from 'react-toastify';
import styled from 'styled-components';

import { Button, Input, ActionButton } from 'components';
import parseDecimalNumber from 'helpers/parseDecimalNumber';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import { SelectMultiple } from '~/components/NewSelectMultiple';
import { Select } from '~/components/NewSelect';
import { GetUsersListType } from '~/metadata/GetUsersList';
import { DeleteOutlineIcon, CloseIcon } from '~/icons';
import { colors } from '~/styles/colors';

import { FormEditExtras } from './UnitExtras';

export const FormEditAssociation = ({
  clientId, onSuccess, onCancel, associationInfo, unitsList, associationsList,
}): JSX.Element => {
  const [state, render, setState] = useStateVar({
    submitting: false,
    editingExtras: false,
    selectedUnit: null as null|{ UNIT_ID: number },
    unitGroupsList: [] as {
      GROUP_ID: number;
      GROUP_NAME: string;
      DEV_AUT: string;
      DUT_ID: string;
      UNIT_ID: number;
      UNIT_NAME: string;
      CITY_NAME: string;
      STATE_ID: string;
  }[],
    selectedGroups: [] as {
      GROUP_ID: number|null;
      GROUP_NAME: string|null;
      DEV_AUT: string|null;
      DUT_ID: string|null;
      UNIT_ID: number|null;
      UNIT_NAME: string|null;
      CITY_NAME: string|null;
      STATE_ID: string|null;
      POSITION: number|null;
  }[],
  });
  const [formData] = useState({
    // @ts-ignore
    ASSOC_ID: (associationInfo && associationInfo.ASSOC_ID) || null,
    // @ts-ignore
    ASSOC_NAME: (associationInfo && associationInfo.ASSOC_NAME) || '',
    // @ts-ignore
    GROUPS: (associationInfo && associationInfo.GROUPS) || null,
    UNIT_ID: (associationInfo && associationInfo.UNIT_ID) || null,
  });
  const isEdit = !!formData.ASSOC_ID;

  async function getUnitGroups() {
    const groupsList = await apiCall('/clients/get-groups-list', { unitIds: (state.selectedUnit && [state.selectedUnit.UNIT_ID]) || undefined });
    state.unitGroupsList = groupsList;
    render();
  }

  function addGroup() {
    const list = state.selectedGroups;
    list.push({
      GROUP_ID: null,
      GROUP_NAME: null,
      DEV_AUT: null,
      DUT_ID: null,
      UNIT_ID: null,
      UNIT_NAME: null,
      CITY_NAME: null,
      STATE_ID: null,
      POSITION: null,
    });
    setState({ selectedGroups: list });
  }

  useEffect(() => {
    if (isEdit) {
      state.selectedGroups = [...associationInfo.GROUPS];
      setState({ selectedUnit: unitsList.find((unit) => unit.UNIT_ID === associationInfo.UNIT_ID) });
    }
    if (state.selectedUnit) {
      getUnitGroups();
    }
  }, [state.selectedUnit]);

  async function confirm() {
    let response: ({ ASSOC_ID: number} | null) = null;
    let action = null;
    try {
      state.submitting = true; render();
      const groups = state.selectedGroups.map((group) => ({ GROUP_ID: group.GROUP_ID, POSITION: group.POSITION }));
      groups.forEach((group) => {
        if (!group.GROUP_ID || !group.POSITION) {
          throw Error('Todas as máquinas devem estar preenchidas');
        }
      });
      const reqData = {
        ASSOC_ID: formData.ASSOC_ID || undefined,
        CLIENT_ID: clientId,
        ASSOC_NAME: formData.ASSOC_NAME || null,
        UNIT_ID: formData.UNIT_ID || null,
        GROUPS: groups,
      };
      if (isEdit) {
        // @ts-ignore
        response = await apiCall('/clients/edit-association', reqData);
        // @ts-ignore
        action = 'edit';
      } else {
        // @ts-ignore
        response = await apiCall('/clients/add-new-association', reqData);
        // @ts-ignore
        action = 'new';
      }
    } catch (err) {
      console.log(err);
      toast.error('Houve erro');
    }
    state.submitting = false; render();
    if (response && action) onSuccess({ item: response, action });
  }

  return (
    <ModalContainer>
      <ModalHeader>
        <h3 style={{ margin: '0px', color: '#fff' }}>{`${isEdit ? 'Editar' : 'Adicionar'} Grupo de Máquinas`}</h3>
        <IconWrapper
          onClick={() => onCancel()}
        >
          <CloseIcon color={colors.White} />
        </IconWrapper>
      </ModalHeader>
      <ModalContent>
        <div>
          <h3>Geral</h3>
          <div style={{
            display: 'flex', flexFlow: 'row nowrap', justifyContent: 'space-between', alignItems: 'center',
          }}
          >
            <div style={{ width: '48%' }}>
              <Input
                type="text"
                value={formData.ASSOC_NAME}
                label="Nome do Grupo"
                placeholder="Digite um nome para este grupo"
                onChange={(event) => { formData.ASSOC_NAME = event.target.value; render(); }}
              />
            </div>
            <div style={{ width: '48%' }}>
              <Select
                options={unitsList}
                propLabel="UNIT_NAME"
                value={state.selectedUnit}
                // error={extraErrors.clients}
                label="Unidade"
                hideSelected
                placeholder="Selecione a unidade"
                onSelect={
                  (value) => {
                    formData.UNIT_ID = value.UNIT_ID;
                    setState({ selectedUnit: value });
                  }
                }
              />
            </div>
          </div>
        </div>
        <div style={{ paddingTop: '30px' }} />
        <div style={{
          display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center',
        }}
        >
          <h3 style={{ margin: '0px' }}>Adicionar Máquinas ao Grupo</h3>
          <Button
            style={{
              width: '150px', borderColor: '#4950CC', color: '#4950CC', backgroundColor: 'white', borderRadius: '15px',
            }}
            onClick={addGroup}
          >
            Adicionar
          </Button>
        </div>
        {state.selectedGroups.map((group, index) => (
          <div
            style={{
              display: 'flex', flexFlow: 'row nowrap', width: '100%', alignItems: 'center', padding: '20px 20px', border: '0.7px solid #818181', borderRadius: '5px', marginTop: '20px',
            }}
            key={index}
          >
            <Select
              style={{ width: '100%', paddingRight: '10px' }}
              options={state.unitGroupsList}
              propLabel="GROUP_NAME"
              value={group.GROUP_NAME}
              label="Nome da Máquina"
              placeholder="Selecione uma máquina cadastrada"
              hideSelected
              onSelect={
                (value) => {
                  state.selectedGroups[index] = { ...value, POSITION: index + 1 };
                  render();
                }
              }
            />
            <Input
              type="text"
              value={group.POSITION?.toString() || ''}
              label="Ordem"
              placeholder={`#${index + 1}`}
              onChange={(event) => {
                if (!Number.isNaN(Number(event.target.value))) {
                  state.selectedGroups[index].POSITION = Number(event.target.value);
                  render();
                }
              }}
            />
            <ActionButton onClick={() => { state.selectedGroups.splice(index, 1); render(); }} variant="red-inv" style={{ marginLeft: '10px' }}>
              <DeleteOutlineIcon colors={colors.Red} />
            </ActionButton>
          </div>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
        }}
        >
          {/* eslint-disable-next-line react/jsx-no-bind */}
          <Button style={{ width: '200px' }} onClick={confirm} variant="primary">
            {isEdit ? 'Salvar Grupo' : 'Adicionar Grupo'}
          </Button>
          {/* @ts-ignore */}
          <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel} variant="grey">
            Cancelar
          </Button>
        </div>
      </ModalContent>
    </ModalContainer>
  );
};

const FakeLink = styled.span`
  color: black;
  text-decoration: underline;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  cursor: pointer;
`;

const ModalContainer = styled.div`
  width: 100%;
  border-radius: 4px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #4950CC;
  color: #fff;
  margin: 0px 0px;
  border-radius: 5px 5px 0px 0px;
  padding: 20px 20px;
  height: 40px;
  align-items: center;
`;

const ModalContent = styled.div`
  padding: 50px;
`;
