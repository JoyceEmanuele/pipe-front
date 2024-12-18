import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Label, CustomInput, ModalTitle2 } from './styles';
import {
  Button, Input, Select,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, ApiResps } from 'providers';
import { Flex } from 'reflexbox';
import SelectSearch, { fuzzySearch } from 'react-select-search';

export const FormEditHeatExchanger = ({
  clientId, onSuccess, onCancel, heatExchangerInfo,
}): JSX.Element => {
  const [state, render, setState] = useStateVar({
    submitting: false,
    editingExtras: false,
    brandList: [] as string[],
  });
  const fetchData = async () => {
    try {
      const data = await apiCall('/heat-exchanger/get-brands-list-v2', { CLIENT_ID: clientId });
      state.brandList = data.map((e) => e.label);
      render();
    } catch (err) {
      console.log(err);
      toast.error('Houve erro');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [formData] = useState({
    ID: (heatExchangerInfo && heatExchangerInfo.ID) || null,
    NAME: (heatExchangerInfo && heatExchangerInfo.NAME) || '',
    T_MIN: (heatExchangerInfo && heatExchangerInfo.T_MIN) || '',
    T_MAX: (heatExchangerInfo && heatExchangerInfo.T_MAX) || '',
    DELTA_T_MIN: (heatExchangerInfo && heatExchangerInfo.DELTA_T_MIN) || '',
    DELTA_T_MAX: (heatExchangerInfo && heatExchangerInfo.DELTA_T_MAX) || '',
  });

  const isEdit = !!formData.ID;

  async function confirm() {
    let response;
    let action: string|null = null;
    try {
      state.submitting = true; render();
      const reqData = {
        CLIENT_ID: clientId,
        ID: formData.ID || null,
        NAME: formData.NAME || null,
        T_MIN: formData.T_MIN || null,
        T_MAX: formData.T_MAX || null,
        DELTA_T_MIN: formData.DELTA_T_MIN || null,
        DELTA_T_MAX: formData.DELTA_T_MAX || null,
      };

      if (!formData.NAME) { toast.error('Necessário preencher o campo Nome do Tipo de Trocador de Calor.'); state.submitting = false; return; }
      if (!formData.T_MIN) { toast.error('Necessário preencher o campo T-min.'); state.submitting = false; return; }
      if (!formData.T_MAX) { toast.error('Necessário preencher o campo T-max'); state.submitting = false; return; }
      if (!formData.DELTA_T_MIN) { toast.error('Necessário preencher o campo ΔT-min.'); state.submitting = false; return; }
      if (!formData.DELTA_T_MAX) { toast.error('Necessário preencher o campo ΔT-max.'); state.submitting = false; return; }

      if (isEdit) {
        response = await apiCall('/heat-exchanger/set-info-v2', reqData);
        action = 'edit';
      } else {
        response = await apiCall('/heat-exchanger/create-v2', reqData);
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
    <div style={{ margin: '25px' }}>

      <ModalTitle2>{`${isEdit ? 'Editar' : 'Adicionar'} Tipo de Trocador de Calor`}</ModalTitle2>
      <div style={{ paddingTop: '10px' }} />

      <Input
        type="text"
        value={formData.NAME}
        label="Nome do Tipo de Trocador de Calor"
        placeholder="Digite o nome do Tipo de Trocador de Calor"
        onChange={(event) => { formData.NAME = event.target.value; render(); }}
        formLabel="name"
      />
      <div style={{ paddingTop: '10px' }} />
      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Input
          type="number"
          value={formData.T_MIN}
          label="T-min (Saída)"
          placeholder="Temperatura em graus celsius"
          onChange={(event) => { formData.T_MIN = event.target.value; render(); }}
          formLabel="t_min"
        />
        {' '}
        <Input
          type="number"
          value={formData.T_MAX}
          label="T-max (Saída)"
          placeholder="Temperatura em graus celsius"
          onChange={(event) => { formData.T_MAX = event.target.value; render(); }}
          formLabel="t_max"
        />
      </Flex>
      <div style={{ paddingTop: '10px' }} />

      <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
        <Input
          width="100px"
          type="number"
          value={formData.DELTA_T_MIN}
          label="ΔT-min"
          placeholder="Temperatura em graus celsius"
          onChange={(event) => { formData.DELTA_T_MIN = event.target.value; render(); }}
          formLabel="delta_t_min"
        />
        {' '}
        <Input
          type="number"
          value={formData.DELTA_T_MAX}
          label="ΔT-max"
          placeholder="Temperatura em graus celsius"
          onChange={(event) => { formData.DELTA_T_MAX = event.target.value; render(); }}
          formLabel="delta_t_max"
        />
      </Flex>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
      }}
      >
        {/* eslint-disable-next-line react/jsx-no-bind */}
        <Button style={{ width: '100%' }} onClick={confirm} variant="primary">
          {isEdit ? 'EDITAR TIPO DE TROCADOR DE CALOR' : 'ADICIONAR TIPO DE TROCADOR DE CALOR'}
        </Button>
      </div>
    </div>
  );
};
