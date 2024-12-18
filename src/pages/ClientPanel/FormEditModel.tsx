import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Input } from 'components';
import { useStateVar } from 'helpers/useStateVar';

import { Select } from '~/components/NewSelect';
import { apiCall } from '~/providers';
import { CustomInput, Label } from './styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { RateModels } from './Tables/TableModels';

type typeProps = {
  clientId: number,
  onCancel: () => void,
  itemToEdit?: null | RateModels,
  isEdit?: boolean,
}
export const FormEditModel = ({
  clientId, onCancel, isEdit = false, itemToEdit,
}: typeProps): JSX.Element => {
  const [state, render, setState] = useStateVar({
    submitting: false,
    editingExtras: false,
    options: {} as {
      rateModalities: {
        name: string,
        value: number,
      }[],
      rateGroups: {
        name: string,
        value: number,
      }[],
      rateSubGroups: {
        name: string,
        value: number,
        groupId: number,
      }[],
      distributors: {
        name: string,
        value: number,
      }[],
    },
    groupOptions: [] as string[],
    subGroupOptions: [] as string[],
    rateModalities: [] as string[],
    distributorOptions: [] as { name: string, value: number }[],
    selectedGroup: '',
    selectedSubgroup: '',
    selectedModality: '',
    selectedDistributor: {} as { name: string, value: number },
    modelName: '',
  });

  function getSubGroups(group: string): string[] {
    if (group === 'B') return state.subGroupOptions;
    return [];
  }

  async function loadConfig() {
    const options = await apiCall('/load-model-options', { clientId });
    setState({
      options,
      groupOptions: options.rateGroups.map((group) => group.name).filter((name) => name !== 'A'),
      subGroupOptions: options.rateSubGroups.map((group) => group.name),
      rateModalities: options.rateModalities.map((group) => group.name),
      distributorOptions: options.distributors,
    });
  }

  function loadEdit() {
    if (itemToEdit) {
      state.modelName = itemToEdit.modelName;
      state.selectedDistributor = { name: itemToEdit.distributorLabel, value: itemToEdit.distributorId };
      state.selectedSubgroup = itemToEdit.subGroupName;
      state.selectedModality = itemToEdit.rateModalityName;
      state.selectedGroup = itemToEdit.groupName;
      render();
    }
  }

  useEffect(() => {
    loadConfig();
    loadEdit();
  }, []);

  async function confirm() {
    try {
      const subGroup = state.options.rateSubGroups.find((subgroup) => subgroup.name === state.selectedSubgroup);
      const rateModality = state.options.rateModalities.find((modality) => modality.name === state.selectedModality);

      if (itemToEdit) {
        await apiCall('/update-model-rate', {
          MODEL_ID: itemToEdit.modelId,
          MODEL_NAME: state.modelName,
          DISTRIBUTOR_ID: state.selectedDistributor.value,
          SUBGROUP_ID: subGroup?.value,
          RATEMODALITY_ID: rateModality?.value,
        });
        toast.success('Modelo editado');
        onCancel();
        window.location.reload();
      } else if (subGroup && rateModality) {
        await apiCall('/create-model-rate', {
          CLIENT_ID: clientId,
          MODEL_NAME: state.modelName,
          DISTRIBUTOR_ID: state.selectedDistributor.value,
          SUBGROUP_ID: subGroup.value,
          RATEMODALITY_ID: rateModality.value,
        });
        toast.success('Modelo criado');
        onCancel();
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      toast.error('Houve erro ao criar um modelo');
    }
    state.submitting = false; render();
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '489px', justifyContent: 'space-between', padding: '5%',
    }}
    >
      <h3 style={{ fontWeight: 'bold' }}>
        { itemToEdit ? 'Editar Modelo' : 'Criar novo Modelo' }
      </h3>
      <Input
        label="Nome do Modelo"
        type="text"
        value={state.modelName}
        onChange={(event) => { state.modelName = event.target.value; render(); }}
      />
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <div style={{ width: '46%' }}>

          <Select
            options={state.groupOptions}
            propLabel="group"
            value={state.selectedGroup}
            label="Grupo"
            hideSelected
            onSelect={
            (value) => {
              state.selectedGroup = value;
              state.subGroupOptions = getSubGroups(value);
              state.selectedSubgroup = '';
              render();
            }
        }
          />
        </div>

        <div style={{ width: '46%' }}>
          <Select
            options={state.subGroupOptions}
            propLabel="subGroup"
            value={state.selectedSubgroup}
            label="Subgrupo"
            hideSelected
            onSelect={
          (value) => {
            setState({ selectedSubgroup: value });
          }
        }
          />
        </div>

      </div>

      <Select
        options={state.rateModalities}
        propLabel="rateModel"
        value={state.selectedModality}
        label="Modalidade de Tarifa"
        hideSelected
        onSelect={
          (value) => {
            setState({ selectedModality: value });
          }
        }
      />
      <CustomInput>
        <div style={{ width: '100%', paddingTop: 3 }}>
          <Label>Distribuidores</Label>
          <SelectSearch
            options={state.distributorOptions}
            printOptions="on-focus"
            value={state.selectedDistributor.value?.toString() || ''}
            search
            filterOptions={fuzzySearch}
            onChange={(value) => {
              setState({ selectedDistributor: state.distributorOptions.find((distributor) => distributor.value === Number(value)) });
              console.log(state.selectedDistributor);
            }}
            closeOnSelect={false}
          />
        </div>
      </CustomInput>

      <div style={{
        flexDirection: 'column', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10',
      }}
      >
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <Button style={{ width: '85%' }} onClick={confirm} variant="primary">
          {itemToEdit ? 'Salvar' : 'Adicionar'}
        </Button>
        <div style={{ height: '8px' }} />
        {/* @ts-ignore */}
        <h4 style={{ textDecoration: 'underline', color: '#6C6B6B' }} onClick={onCancel}>
          Cancelar
        </h4>
      </div>
    </div>
  );
};
