import { useState, useMemo } from 'react';

import { toast } from 'react-toastify';

import {
  Button, Input, Select, Checkbox,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall } from 'providers';

export const FormEditGroup = (props: {
  groupInfo?: {
    GROUP_ID: number
    GROUP_NAME: string
    UNIT_ID: number
    DEV_AUT: string
    DUT_ID: string
  }
  unitInfo?: {
    UNIT_ID: number
    UNIT_NAME: string
  }
  unitsList?: {
    UNIT_ID: number
  }[]
  dutsList?: {
    ROOM_NAME: string
    DEV_ID: string
    UNIT_ID: number
    roomDutLabel?: string
    automationEnabled: boolean
  }[]
  damsList?: {
    DAM_ID: string
    UNIT_ID: number
  }[]
  dacsList?: {
    DAC_ID: string
    GROUP_ID: number
    automationEnabled: boolean
  }[]
  clientId: number
  onSuccess: (result: { item: {}, action: string, changedAssociation: boolean }) => void
  onCancel: () => void
}): JSX.Element => {
  const {
    groupInfo, unitInfo, unitsList, dutsList, damsList, dacsList, clientId, onSuccess, onCancel,
  } = props;
  const [state, render, setState] = useStateVar(() => {
    if (dutsList) {
      for (const dutItem of dutsList) {
        dutItem.roomDutLabel = dutItem.ROOM_NAME ? `${dutItem.ROOM_NAME} (${dutItem.DEV_ID})` : dutItem.DEV_ID;
      }
    }

    const state = {
      submitting: false,
      formData: {
        GROUP_ID: (groupInfo && groupInfo.GROUP_ID) || null,
        GROUP_NAME: (groupInfo && groupInfo.GROUP_NAME) || '',
        unit: unitInfo || (unitsList && groupInfo && groupInfo.UNIT_ID && unitsList.find((unit) => unit.UNIT_ID === groupInfo.UNIT_ID)) || null,
        selectedDacs: {} as { [dacId: string]: boolean },
        autom: (groupInfo && groupInfo.DEV_AUT && damsList && damsList.find((item) => item.DAM_ID === groupInfo.DEV_AUT)) || null,
        dut: (groupInfo && groupInfo.DUT_ID && dutsList && dutsList.find((item) => item.DEV_ID === groupInfo.DUT_ID)) || null,
        associatedDacs: null as null|({ DAC_ID: string, automationEnabled: boolean }[]),
      },
      warningMessage: null as null|string,
    };

    const { formData } = state;
    if (formData.GROUP_ID && dacsList) {
      formData.associatedDacs = dacsList.filter((dac) => dac.GROUP_ID === formData.GROUP_ID);
      for (const dac of dacsList) {
        formData.selectedDacs[dac.DAC_ID] = (dac.GROUP_ID != null && dac.GROUP_ID === formData.GROUP_ID);
      }
    }

    return state;
  });

  const { formData } = state;
  function set_formData(v) { state.formData = v; render(); }
  const isEdit = !!formData.GROUP_ID;

  const filteredDuts = useMemo(() => {
    if (!dutsList) return [];
    if (!formData.unit) return dutsList;
    return dutsList.filter((x) => x.UNIT_ID === formData.unit!.UNIT_ID);
  }, [formData.unit]);
  const filteredDams = useMemo(() => {
    if (!damsList) return [];
    if (!formData.unit) return damsList;
    return damsList.filter((x) => x.UNIT_ID === formData.unit!.UNIT_ID);
  }, [formData.unit]);

  function checkAutomationConstraints() {
    // Check if the machine has DACs with automation enabled
    const automationDevs = [] as string[];
    const selectedAutDacs = [] as string[];
    for (const dac of (formData.associatedDacs || [])) {
      if (dac.automationEnabled && formData.selectedDacs[dac.DAC_ID]) {
        automationDevs.push(dac.DAC_ID);
        selectedAutDacs.push(dac.DAC_ID);
      }
    }

    if (formData.dut && formData.dut.automationEnabled) {
      automationDevs.push(formData.dut.DEV_ID);
    }

    if (formData.autom) {
      if (!automationDevs.includes(formData.autom.DAM_ID)) {
        automationDevs.push(formData.autom.DAM_ID);
      }
    }

    state.warningMessage = null;
    if (automationDevs.length > 1) {
      state.warningMessage = automationDevs.join(', ');
    }

    return selectedAutDacs;
  }

  async function confirm() {
    let response = null as null|{};
    let action = null as null|string;
    let changedAssociation = false;
    try {
      if (!formData.GROUP_NAME) {
        alert('É necessário informar um nome para o grupo');
        return;
      }

      const associations = {
        REL_DEV_AUT: (formData.autom && formData.autom.DAM_ID) || null,
        REL_DUT_ID: (formData.dut && formData.dut.DEV_ID) || null,
      };

      // Check if there is DAC with automation enabled
      for (const dac of (formData.associatedDacs || [])) {
        if (dac.automationEnabled) {
          if (associations.REL_DEV_AUT && (associations.REL_DEV_AUT !== dac.DAC_ID)) {
            alert(`Não é permitido selecionar 2 dispositivos de automação\nna mesma máquina: ${associations.REL_DEV_AUT} e ${dac.DAC_ID}`);
            return;
          }
          associations.REL_DEV_AUT = dac.DAC_ID;
        }
      }

      // Check if selected DUT has automation enabled
      if (associations.REL_DEV_AUT && associations.REL_DUT_ID) {
        if (formData.dut!.automationEnabled) {
          alert(`Não é permitido selecionar 2 dispositivos de automação\nna mesma máquina: ${associations.REL_DEV_AUT} e ${associations.REL_DUT_ID}`);
          return;
        }
      }

      if (isEdit) {
        // if (state.originalDuts && state.originalDuts.some(dutId => dutId !== reqData.REL_DUT_ID)) {
        //   changedAssociation = true;
        // } else if (state.originalDams.length !== formData.dams.length) {
        //   changedAssociation = true;
        // } else {
        //   for (const damId of reqData.damIds) {
        //     if (!state.originalDams.includes(damId)) {
        //       changedAssociation = true;
        //     }
        //   }
        // }
        state.submitting = true; render();
        if (formData.associatedDacs) {
          for (const dac of formData.associatedDacs) {
            if (!formData.selectedDacs[dac.DAC_ID]) {
              changedAssociation = true;
              await apiCall('/dac/set-dac-info', { DAC_ID: dac.DAC_ID, GROUP_ID: null });
            }
          }
        }
        response = await apiCall('/clients/edit-group', {
          GROUP_ID: formData.GROUP_ID!,
          GROUP_NAME: formData.GROUP_NAME!,
          REL_DEV_AUT: associations.REL_DEV_AUT,
          REL_DUT_ID: associations.REL_DUT_ID,
          CLIENT_ID: clientId,
        });
        action = 'edit';
      } else {
        if (!formData.unit) {
          alert('É necessário selecionar a unidade');
          return;
        }
        state.submitting = true; render();
        response = await apiCall('/dac/add-new-group', {
          UNIT_ID: (formData.unit && formData.unit.UNIT_ID),
          GROUP_NAME: formData.GROUP_NAME!,
          REL_DAM_ID: (associations.REL_DEV_AUT?.startsWith('DAM') || associations.REL_DEV_AUT?.startsWith('DAC')) && associations.REL_DEV_AUT || null,
          REL_DRI_ID: associations.REL_DEV_AUT?.startsWith('DRI') && associations.REL_DEV_AUT || null,
          REL_DEV_AUT: associations.REL_DEV_AUT,
          REL_DUT_ID: associations.REL_DUT_ID,
          CLIENT_ID: clientId,
        });
        action = 'new';
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.submitting = false; render();
    if (response && action) onSuccess({ item: response, action, changedAssociation });
  }

  const selectedAutDacs = checkAutomationConstraints();
  let allowedDams;
  if (selectedAutDacs.length > 0) {
    allowedDams = filteredDams.filter((dam) => selectedAutDacs.includes(dam.DAM_ID));
  } else {
    allowedDams = filteredDams;
  }

  return (
    <div>
      {unitsList && (
        <Select
          options={unitsList}
          propLabel="UNIT_NAME"
          value={formData.unit}
          placeholder="Unidade"
          onSelect={(item) => { set_formData({ ...formData, unit: item }); }}
          disabled={isEdit}
        />
      )}
      {((!unitsList) && unitInfo && unitInfo.UNIT_NAME) && (
        <div>
          <span style={{ marginRight: '10px' }}>Unidade:</span>
          <span>{unitInfo.UNIT_NAME}</span>
        </div>
      )}
      <Input
        type="text"
        style={{ marginTop: '10px' }}
        value={formData.GROUP_NAME}
        label="Nome da máquina"
        validation={state.formData.GROUP_NAME.length > 250}
        error={state.formData.GROUP_NAME.length > 250 ? 'O campo deve ter entre 3 e 250 caracteres.' : undefined}
        onChange={(event) => set_formData({ ...formData, GROUP_NAME: event.target.value })}
      />
      {((filteredDams.length > 0) || (groupInfo && groupInfo.DEV_AUT)) && (
        <Select
          style={{ marginTop: '10px' }}
          options={allowedDams}
          propLabel="DAM_ID"
          value={formData.autom}
          placeholder="Automação"
          onSelect={(item) => { formData.autom = item; render(); }}
        />
      )}
      {((filteredDuts.length > 0) || (groupInfo && groupInfo.DUT_ID)) && (
        <Select
          style={{ marginTop: '10px' }}
          options={filteredDuts}
          propLabel="roomDutLabel"
          value={formData.dut}
          placeholder="Ambiente associado"
          onSelect={(item) => { formData.dut = item; render(); }}
        />
      )}
      {(dacsList || []).map((dac) => (
        <Checkbox
          key={dac.DAC_ID}
          label={dac.DAC_ID + (dac.automationEnabled ? ' (aut)' : '')}
          checked={formData.selectedDacs[dac.DAC_ID]}
          onClick={() => { formData.selectedDacs[dac.DAC_ID] = !formData.selectedDacs[dac.DAC_ID]; render(); }}
          style={{ marginTop: '10px' }}
        />
      ))}
      {(state.warningMessage) && (
        <div style={{ paddingTop: '15px', color: 'red' }}>
          Múltiplos dispositivos de automação selecionados:
          {' '}
          <br />
          {state.warningMessage}
        </div>
      )}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
        }}
      >
        <Button style={{ width: '140px' }} onClick={confirm} variant="primary">
          {isEdit ? 'Salvar' : 'Adicionar'}
        </Button>
        <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel} variant="grey">
          Cancelar
        </Button>
      </div>
    </div>
  );
};
