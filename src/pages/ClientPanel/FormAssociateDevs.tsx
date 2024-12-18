import { useState } from 'react';

import { toast } from 'react-toastify';

import { Button, Select } from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall } from '~/providers';

export const FormAssociateDevs = ({
  clientId, devsList, unitsList, groupsList, onSuccess, onCancel,
}): JSX.Element => {
  const [state, render] = useStateVar({
    submitting: false,
    dacs: null,
    duts: null,
  });
  const [formData, set_formData] = useState({
    unit: null,
    group: null,
  });
  state.dacs = devsList.filter((dev) => dev.type === 'DAC');
  state.duts = devsList.filter((dev) => dev.type === 'DUT');

  async function confirm() {
    let success = false;
    try {
      // @ts-ignore
      if ((!state.dacs.length) && (!state.duts.length)) {
        alert('Nenhum dispositivo para associar');
        return;
      }
      // @ts-ignore
      if (!formData.unit) {
        alert('Unidade não selecionada');
        return;
      }
      // @ts-ignore
      if (state.dacs.length && (!formData.group)) {
        alert('Máquina não selecionada');
        return;
      }
      state.submitting = true; render();
      // @ts-ignore
      for (const dev of state.dacs) {
        await apiCall('/dac/set-dac-info', {
          // @ts-ignore
          DAC_ID: dev.DEV_ID, CLIENT_ID: clientId, UNIT_ID: formData.unit.UNIT_ID, GROUP_ID: formData.group.GROUP_ID,
        }).then((data) => ({ data }));
      }
      // @ts-ignore
      for (const dev of state.duts) {
        // @ts-ignore
        await apiCall('/dut/set-dut-info', { DEV_ID: dev.DEV_ID, CLIENT_ID: clientId, UNIT_ID: formData.unit.UNIT_ID }).then((data) => ({ data }));
      }
      success = true;
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.submitting = false; render();
    if (success) onSuccess({});
  }

  function set_group(item) {
    formData.group = item;
    if (item && !formData.unit) {
      const unit = unitsList.find((unit) => unit.UNIT_ID === item.UNIT_ID);
      if (unit) formData.unit = unit;
    }
    set_formData({ ...formData });
  }

  return (
    <div>
      <Select
        options={unitsList}
        propLabel="UNIT_NAME"
        value={formData.unit}
        placeholder="Unidade"
        onSelect={(item) => { set_formData({ ...formData, unit: item, group: null }); }}
      />
      <div style={{ paddingTop: '10px' }} />
      {/* @ts-ignore */}
      {groupsList && (state.dacs.length > 0)
        && (
        <Select
        // @ts-ignore
          options={groupsList.filter((group) => ((!formData.unit) || group.UNIT_ID === formData.unit.UNIT_ID))}
          propLabel="GROUP_NAME"
          value={formData.group}
          placeholder="Máquina"
          // eslint-disable-next-line react/jsx-no-bind
          onSelect={set_group}
          // @ts-ignore
          disabled={!formData.unit}
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
