import { useState } from 'react';

import { toast } from 'react-toastify';

import { Button, Input, Select } from '~/components';
import { apiCall } from '~/providers';

export const FormEditDut = ({
  dutInfo, unitInfo, unitsList, roomTypes, onSuccess, onCancel,
}): JSX.Element => {
  const [, stateChanged] = useState({});
  const [state] = useState({
    changed() { stateChanged({}); },
    submitting: false,
    formData: {
      DEV_ID: dutInfo.DEV_ID,
      ROOM_NAME: (dutInfo && dutInfo.ROOM_NAME) || '',
      unit: unitInfo || (unitsList && dutInfo && dutInfo.UNIT_ID && unitsList.find((unit) => unit.UNIT_ID === dutInfo.UNIT_ID)) || null,
      roomType: (dutInfo && dutInfo.RTYPE_ID && roomTypes.find((item) => item.RTYPE_ID === dutInfo.RTYPE_ID)) || null,
    },
  });

  const { formData } = state;

  async function confirm() {
    let response = null as null|string;
    let action = null;
    try {
      state.submitting = true; state.changed();
      const reqData = {
        DEV_ID: formData.DEV_ID,
        UNIT_ID: formData.unit && formData.unit.UNIT_ID,
        ROOM_NAME: formData.ROOM_NAME || null,
        RTYPE_ID: (formData.roomType && formData.roomType.RTYPE_ID) || null,
        CLIENT_ID: dutInfo.CLIENT_ID,
      };
      // @ts-ignore
      action = 'set';
      if (dutInfo.DEV_ID === '-') {
        response = await apiCall('/environments/edit-environment', {
          ENVIRONMENT_ID: dutInfo.ENVIRONMENT_ID,
          ENVIRONMENT_NAME: reqData.ROOM_NAME,
          RTYPE_ID: reqData.RTYPE_ID,
          UNIT_ID: reqData.UNIT_ID,
          CLIENT_ID: dutInfo.CLIENT_ID,
        });
      }
      if (dutInfo.DEV_ID.startsWith('DUT')) {
        // @ts-ignore
        response = await apiCall('/dut/set-dut-info', { ...reqData, ENVIRONMENT_ID: dutInfo.ENVIRONMENT_ID || undefined }).then((data) => ({ data }));
      }
      if (dutInfo.DEV_ID.startsWith('DRI')) {
        await apiCall('/dri/set-dri-info', { DRI_ID: formData.DEV_ID, UNIT_ID: formData.unit && formData.unit.UNIT_ID });
        response = await apiCall('/dri/update-dri-vav', { VAV_ID: formData.DEV_ID, ROOM_NAME: formData.ROOM_NAME || null, RTYPE_ID: (formData.roomType && formData.roomType.RTYPE_ID) || null });
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.submitting = false; state.changed();
    // @ts-ignore
    if (response && action) onSuccess({ item: response.data, action });
  }

  return (
    <div>
      {unitsList
        && (
        <Select
          options={unitsList}
          propLabel="UNIT_NAME"
          value={formData.unit}
          placeholder="Unidade"
          onSelect={(item) => { toast.warn('Ambiente não pode ser alterado de unidade! Apenas dispositivo relacionado ao ambiente será realocado!'); state.formData.unit = item; state.changed(); }}
        />
        )}
      <Input
        type="text"
        style={{ marginTop: '10px' }}
        value={formData.ROOM_NAME}
        placeholder="Nome do ambiente"
        onChange={(event) => { state.formData.ROOM_NAME = event.target.value; state.changed(); }}
      />
      {(roomTypes.length > 0)
        && (
        <Select
          style={{ marginTop: '10px' }}
          options={roomTypes}
          propLabel="RTYPE_NAME"
          value={formData.roomType}
          placeholder="Tipo de ambiente"
          onSelect={(item) => { state.formData.roomType = item; state.changed(); }}
        />
        )}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
      }}
      >
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <Button style={{ width: '140px' }} onClick={confirm} variant="primary">
          Salvar
        </Button>
        {/* @ts-ignore */}
        <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel} variant="grey">
          Cancelar
        </Button>
      </div>
    </div>
  );
};
