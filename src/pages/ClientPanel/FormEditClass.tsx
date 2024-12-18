import { useState, useMemo, useEffect } from 'react';

import { toast } from 'react-toastify';
import styled from 'styled-components';

import {
  Button, Input, SelectMultiple,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';
import { handlePaste } from '~/helpers/pasteHelper';
import { ButtonClear } from '../Analysis/styles';
import { t } from 'i18next';

export const FormEditClass = ({
  clientId, onSuccess, onCancel, classInfo, unitsList,
}): JSX.Element => {
  const [state, render, setState] = useStateVar({
    listUnitsSelect: unitsList.map((item) => ({ value: item.UNIT_ID, name: item.UNIT_NAME, checked: false })) as { name: string, value: number, checked: boolean }[],
    submitting: false,
    editingExtras: false,
    isLoading: false,
    selectedUnits: [] as any,
    formData: {
      CLASS_ID: (classInfo && classInfo.CLASS_ID) || null,
      // @ts-ignore
      CLASS_TYPE: (classInfo && classInfo.CLASS_TYPE) || '',
      // @ts-ignore
      CLASS_NAME: (classInfo && classInfo.CLASS_NAME) || '',
    },
    isEdit: !!(classInfo && classInfo.CLASS_ID),
  });

  async function getClassUnits() {
    if (state.formData.CLASS_ID) {
      const { list: oldClassUnitsList } = await apiCall('/clients/get-class-units', { CLASS_ID: state.formData.CLASS_ID, CLIENT_ID: clientId });
      const oldClassUnitsIds = oldClassUnitsList.map((unit) => unit.UNIT_ID);
      state.listUnitsSelect.forEach((item) => { if (oldClassUnitsIds.includes(item.value)) item.checked = true; });
      render();
    }
  }

  useEffect(() => {
    setState({ listUnitsSelect: unitsList.map((item) => ({ value: item.UNIT_ID, name: item.UNIT_NAME, checked: false })) });
    getClassUnits();
  }, []);

  async function confirm() {
    let response: ({ CLASS_ID: number} | null) = null;
    let action = null;
    try {
      state.submitting = true; render();
      const reqData = {
        CLASS_ID: state.formData.CLASS_ID || undefined,
        CLIENT_ID: clientId,
        CLASS_TYPE: state.formData.CLASS_TYPE || null,
        CLASS_NAME: state.formData.CLASS_NAME || null,
      };
      if (state.isEdit) {
        // @ts-ignore
        response = await apiCall('/clients/edit-client-class', reqData);
        const unitIdsList = state.listUnitsSelect.filter((x) => x.checked).map((item) => item.value);
        await apiCall('/clients/set-class-units', { UNIT_IDS: unitIdsList, CLASS_ID: reqData.CLASS_ID, CLIENT_ID: clientId });
        // @ts-ignore
        action = 'edit';
      } else {
        // @ts-ignore
        response = await apiCall('/clients/add-client-class', reqData);
        const unitIdsList = state.listUnitsSelect.filter((x) => x.checked).map((item) => item.value);
        await apiCall('/clients/set-class-units', { UNIT_IDS: unitIdsList, CLASS_ID: response?.CLASS_ID, CLIENT_ID: clientId });
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

  // function onStateSelected(item) {
  //   formData.state_item = item;
  //   // @ts-ignore
  //   const selectedState = formData.state_item && formData.state_item.STATE_ID;
  //   // @ts-ignore
  //   if (formData.city_item && formData.city_item.STATE_ID !== selectedState) {
  //     formData.city_item = null;
  //   }
  //   render();
  // }

  // if (formData.city_item && !formData.state_item) {
  //   // @ts-ignore
  //   formData.state_item = states.find((item) => item.STATE_ID === formData.city_item.STATE_ID);
  // }

  // const filtCities = useMemo(() => {
  //   if (!formData.state_item) return cities;
  //   // @ts-ignore
  //   return cities.filter((city) => city.STATE_ID === formData.state_item.STATE_ID);
  // }, [formData.state_item, cities]);

  function setUnits(pastedItems) {
    const matchingUnits = (state.listUnitsSelect || []).filter((unit) => pastedItems?.includes(unit.name)).map((unit) => unit);
    const onlyIds = matchingUnits.map((item) => item.value);
    state.listUnitsSelect.forEach((item) => {
      if (onlyIds.includes(item.value)) item.checked = true;
    });
    render();
  }

  function handleSelectItem(value) {
    const item = state.listUnitsSelect.find((item) => item.value === value.value);
    if (item) item.checked = !value.checked;
    render();
  }

  function clearSelected() {
    state.listUnitsSelect = state.listUnitsSelect.map((item) => ({ ...item, checked: false }));
    render();
  }

  return (
    <div>
      <Input
        type="text"
        value={state.formData.CLASS_TYPE}
        placeholder="Tipo da Classe"
        name="Tipo da Classe"
        onChange={(event) => { state.formData.CLASS_TYPE = event.target.value; render(); }}
      />
      <div style={{ paddingTop: '10px' }} />
      <Input
        type="text"
        value={state.formData.CLASS_NAME}
        placeholder="Nome da Classe"
        name="Nome da Classe"
        onChange={(event) => { state.formData.CLASS_NAME = event.target.value; render(); }}
      />
      <div style={{ paddingTop: '10px', paddingBottom: '10px' }} onPaste={(e) => handlePaste(e, setUnits)}>
        <SelectMultiple
          options={state.listUnitsSelect}
          values={state.listUnitsSelect.filter((x) => x.checked)}
          haveFuzzySearch
          search
          propLabel="name"
          placeholder="Unidades"
          onSelect={(item) => handleSelectItem(item)}
        />
        <div
          style={{
            width: '100%', display: 'flex', gap: 10, padding: '5px 0px 0px 0px', justifyContent: 'space-between',
          }}
        >
          <ButtonClear type="button" onClick={() => clearSelected()}>
            <span style={{ textAlign: 'end', color: '#363BC4' }}>{t('limpar')}</span>
          </ButtonClear>
        </div>
      </div>
      {(state.isEdit)
    && (
    <div style={{ paddingTop: '10px' }}>
      <FakeLink onClick={() => setState({ editingExtras: true })}>Metadados</FakeLink>
    </div>
    )}
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
};

const FakeLink = styled.span`
  color: black;
  text-decoration: underline;
  cursor: pointer;
`;
