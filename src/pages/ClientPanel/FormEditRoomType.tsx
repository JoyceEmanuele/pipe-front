import { ChangeEvent, useEffect, useState } from 'react';

import { toast } from 'react-toastify';

import { Button, Input, Checkbox } from 'components';
import parseDecimalNumber from 'helpers/parseDecimalNumber';
import { useStateVar } from 'helpers/useStateVar';
import { SchedulesList, SchedulesRemove, SchedulesEdit } from 'pages/Analysis/SchedulesModals/RoomSchedule';
import { apiCall } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';

type TDayString = ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun');

function verifyExistOrReturnString(item) {
  if (item != null && String(item)) {
    return String(item);
  }
  return '';
}

export const FormEditRoomType = (props: {
  roomTypeInfo: {
    RTYPE_ID: number
    RTYPE_NAME: string
    TUSEMIN: number
    TUSEMAX: number
    fullProg: FullProg_v4
    CO2MAX: number
    HUMIMAX: number
    HUMIMIN: number
  }
  clientId: number
  onSuccess: (pars: { action: string, item: {} }) => void
  onCancel: () => void
}): JSX.Element => {
  const {
    roomTypeInfo, clientId, onSuccess, onCancel,
  } = props;
  const [state, render, setState] = useStateVar({
    schedulesTypeActive: 'List',
    submitting: false,
    editDayString: null as null|TDayString,
    monTypesSelected: [] as string[],
    formData: {
      RTYPE_ID: (roomTypeInfo?.RTYPE_ID) || null,
      RTYPE_NAME: (roomTypeInfo?.RTYPE_NAME) || '',
      TUSEMIN: verifyExistOrReturnString(roomTypeInfo?.TUSEMIN),
      TUSEMAX: verifyExistOrReturnString(roomTypeInfo?.TUSEMAX),
      fullProg: (roomTypeInfo?.fullProg) || {},
      CO2MAX: verifyExistOrReturnString(roomTypeInfo?.CO2MAX),
      HUMIMAX: verifyExistOrReturnString(roomTypeInfo?.HUMIMAX),
      HUMIMIN: verifyExistOrReturnString(roomTypeInfo?.HUMIMIN),
    },
  });
  const { formData } = state;
  const isEdit = !!formData.RTYPE_ID;

  useEffect(() => {
    if (formData.TUSEMAX || formData.TUSEMIN) {
      state.monTypesSelected.push('temp');
      render();
    }
    if (formData.CO2MAX) {
      state.monTypesSelected.push('co2');
      render();
    }
    if (formData.HUMIMAX || formData.HUMIMIN) {
      state.monTypesSelected.push('humi');
      render();
    }
  }, []);

  function verifyExistItemOrReturnNull(type, item) {
    if (!state.monTypesSelected.includes(type)) {
      return null;
    }
    if (item) {
      return parseDecimalNumber(item);
    }
    return null;
  }

  function validateParams() {
    let isOk = true;
    if (state.monTypesSelected.includes('co2')) {
      if (Number(state.formData.CO2MAX) < 0) {
        toast.error('CO2 não pode ser negativo');
        isOk = false;
      }
    }
    if (state.monTypesSelected.includes('humi')) {
      if (Number(state.formData.HUMIMIN) < 0 || Number(state.formData.HUMIMAX) < 0) {
        toast.error('Umidade não pode ser negativa');
        isOk = false;
      }
      if (Number(state.formData.HUMIMIN) > 100 || Number(state.formData.HUMIMAX) > 100) {
        toast.error('Umidade não pode ser maior que 100%');
        isOk = false;
      }
      if (Number(state.formData.HUMIMAX) < Number(state.formData.HUMIMIN)) {
        toast.error('Umidade máxima não pode ser menor que a mínima');
        isOk = false;
      }
    }
    if (state.monTypesSelected.includes('temp')) {
      if (Number(state.formData.TUSEMAX) < Number(state.formData.TUSEMIN)) {
        toast.error('Temperatura máxima não pode ser menor que a mínima');
        isOk = false;
      }
    }
    return isOk;
  }

  async function confirm() {
    let response = null as null|{};
    let action = null as null|string;
    if (!formData.RTYPE_NAME) {
      alert('É necessário definir o nome');
      return;
    }
    if (Object.keys(formData.fullProg.week).length === 0) {
      alert('É necessário definir uma programação');
      return;
    }
    if (!validateParams()) {
      return;
    }
    try {
      state.submitting = true; render();
      if (isEdit) {
        response = await apiCall('/clients/edit-roomtype', {
          RTYPE_ID: formData.RTYPE_ID!,
          RTYPE_NAME: formData.RTYPE_NAME,
          TUSEMIN: verifyExistItemOrReturnNull('temp', formData.TUSEMIN),
          TUSEMAX: verifyExistItemOrReturnNull('temp', formData.TUSEMAX),
          CLIENT_ID: clientId,
          workPeriods: fullProgToWorkPeriods(formData.fullProg),
          CO2MAX: verifyExistItemOrReturnNull('co2', formData.CO2MAX),
          HUMIMAX: verifyExistItemOrReturnNull('humi', formData.HUMIMAX),
          HUMIMIN: verifyExistItemOrReturnNull('humi', formData.HUMIMIN),
        });
        action = 'edit';
      } else {
        response = await apiCall('/clients/add-new-roomtype', {
          RTYPE_ID: formData.RTYPE_ID || null,
          RTYPE_NAME: formData.RTYPE_NAME,
          TUSEMIN: verifyExistItemOrReturnNull('temp', formData.TUSEMIN),
          TUSEMAX: verifyExistItemOrReturnNull('temp', formData.TUSEMAX),
          CLIENT_ID: clientId,
          workPeriods: fullProgToWorkPeriods(formData.fullProg),
          CO2MAX: verifyExistItemOrReturnNull('co2', formData.CO2MAX),
          HUMIMAX: verifyExistItemOrReturnNull('humi', formData.HUMIMAX),
          HUMIMIN: verifyExistItemOrReturnNull('humi', formData.HUMIMIN),
        });
        action = 'new';
      }
    } catch (err) { console.log(err); toast.error('Houve erro'); }
    state.submitting = false; render();
    if (response && action) onSuccess({ item: response, action });
  }

  async function onConfirmProg(days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[], prog: DayProg) {
    if (state.schedulesTypeActive === 'Edit' && ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(state.editDayString!)) {
      delete formData.fullProg.week[state.editDayString!];
    }
    for (const selectedDay of days) {
      formData.fullProg.week[selectedDay] = prog;
    }
    state.editDayString = null;
    state.schedulesTypeActive = 'List';
    render();
  }

  function onConfirmRemoveProg(day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') {
    delete formData.fullProg.week[day];
    state.schedulesTypeActive = 'List';
    render();
  }

  let modalContent = null as null|JSX.Element;
  if (state.schedulesTypeActive === 'Edit') {
    modalContent = (
      <SchedulesEdit
        devSched={formData.fullProg}
        selectedDay={state.editDayString}
        onCancel={() => { state.schedulesTypeActive = 'List'; render(); }}
        onConfirmProg={onConfirmProg}
        isSending={false}
      />
    );
  }
  if (state.schedulesTypeActive === 'Remove') {
    modalContent = (
      <SchedulesRemove
        selectedDay={state.editDayString!}
        onConfirm={onConfirmRemoveProg}
        onCancel={() => setState({ schedulesTypeActive: 'List', editDayString: null })}
        isRemoving={false}
      />
    );
  }
  if (state.schedulesTypeActive === 'Add') {
    modalContent = (
      <SchedulesEdit
        devSched={formData.fullProg}
        selectedDay={null}
        onCancel={() => { state.schedulesTypeActive = 'List'; render(); }}
        onConfirmProg={onConfirmProg}
        isSending={false}
      />
    );
  }
  if (state.schedulesTypeActive === 'List') {
    modalContent = (
      <SchedulesList
        devSched={formData.fullProg}
        wantAddProg={() => { state.schedulesTypeActive = 'Add'; render(); }}
        wantRemoveDay={(dayString) => { state.editDayString = dayString; state.schedulesTypeActive = 'Remove'; render(); }}
        wantEditDay={(dayString) => { state.editDayString = dayString; state.schedulesTypeActive = 'Edit'; render(); }}
        wantDelException={null}
        isLoading={false}
      />
    );
  }

  return (
    <div>
      {(state.schedulesTypeActive === 'List')
        && (
        <div>
          <Input
            type="text"
            value={formData.RTYPE_NAME}
            placeholder="Nome do tipo de ambiente *"
            onChange={(event: ChangeEvent<HTMLInputElement>) => { state.formData.RTYPE_NAME = event.target.value; render(); }}
          />
          <div style={{ paddingTop: '25px', fontWeight: 'bold' }}>Monitoramento:</div>
          <div>
            <Checkbox
              label="Temperatura"
              checked={state.monTypesSelected.includes('temp')}
              onClick={() => {
                state.monTypesSelected.includes('temp') ? state.monTypesSelected = state.monTypesSelected.filter((r) => r !== 'temp') : state.monTypesSelected.push('temp');
                render();
              }}
            />
            <div style={{ paddingTop: '10px' }} />
            <Checkbox
              label="Umidade"
              checked={state.monTypesSelected.includes('humi')}
              onClick={() => {
                state.monTypesSelected.includes('humi') ? state.monTypesSelected = state.monTypesSelected.filter((r) => r !== 'humi') : state.monTypesSelected.push('humi');
                render();
              }}
            />
            <div style={{ paddingTop: '10px' }} />
            <Checkbox
              label="CO2"
              checked={state.monTypesSelected.includes('co2')}
              onClick={() => {
                state.monTypesSelected.includes('co2') ? state.monTypesSelected = state.monTypesSelected.filter((r) => r !== 'co2') : state.monTypesSelected.push('co2');
                render();
              }}
            />
          </div>
          {state.monTypesSelected.includes('temp') && (
            <div style={{
              paddingTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '15px',
            }}
            >
              <Input
                type="text"
                value={formData.TUSEMIN}
                placeholder="Temperatura mínima [°C]"
                onChange={(event: ChangeEvent<HTMLInputElement>) => { state.formData.TUSEMIN = event.target.value; render(); }}
              />
              <Input
                type="text"
                value={formData.TUSEMAX}
                placeholder="Temperatura máxima [°C]"
                onChange={(event: ChangeEvent<HTMLInputElement>) => { state.formData.TUSEMAX = event.target.value; render(); }}
              />
            </div>
          )}
          {state.monTypesSelected.includes('humi') && (
            <div style={{
              paddingTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '15px',
            }}
            >
              <Input
                style={{ border: Number(state.formData.HUMIMIN) < 0 || Number(state.formData.HUMIMIN) > 100 ? '1px solid red' : '1px solid gray' }}
                type="text"
                value={formData.HUMIMIN}
                placeholder="Umidade mínima [%]"
                onChange={(event: ChangeEvent<HTMLInputElement>) => { state.formData.HUMIMIN = event.target.value; render(); }}
              />
              <Input
                style={{ border: Number(state.formData.HUMIMAX) < 0 || Number(state.formData.HUMIMAX) > 100 ? '1px solid red' : '1px solid gray' }}
                type="text"
                value={formData.HUMIMAX}
                placeholder="Umidade máxima [%]"
                onChange={(event: ChangeEvent<HTMLInputElement>) => { state.formData.HUMIMAX = event.target.value; render(); }}
              />
            </div>
          )}
          {state.monTypesSelected.includes('co2') && (
            <div style={{
              paddingTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '15px',
            }}
            >
              <Input
                style={{ border: Number(state.formData.CO2MAX) < 0 ? '1px solid red' : '1px solid gray' }}
                type="number"
                value={formData.CO2MAX}
                placeholder="CO2 máximo [ppm]"
                onChange={(event: ChangeEvent<HTMLInputElement>) => { state.formData.CO2MAX = event.target.value; render(); }}
              />
            </div>
          )}
        </div>
        )}
      <div style={{ paddingTop: '20px' }}>
        {modalContent}
      </div>
      {(state.schedulesTypeActive === 'List')
        && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '30px',
        }}
        >
          <Button style={{ width: '140px' }} onClick={confirm} variant="primary">
            {isEdit ? 'Salvar' : 'Adicionar'}
          </Button>
          <Button style={{ width: '140px', margin: '0 20px' }} onClick={onCancel}>
            Cancelar
          </Button>
        </div>
        )}
    </div>
  );
};

// in ts version 4.1.2 prog.start and prog.end erro ts2532 object possibly undefined !!
function fullProgToWorkPeriods(fullProg: FullProg_v4) {
  const workPeriods: { [day: string]: string } = {};
  for (const [day, prog] of Object.entries(fullProg.week || {})) {
    workPeriods[day] = `enabled;${prog.start}-${prog.end}`;
  }
  for (const [day, prog] of Object.entries(fullProg.exceptions || {})) {
    workPeriods[day] = `enabled;${prog.start}-${prog.end}`;
  }
  return workPeriods;
}
