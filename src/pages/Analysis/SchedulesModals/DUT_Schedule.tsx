import { ChangeEvent, useEffect, useMemo } from 'react';

import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import {
  Button, Input, Loader, RadioButton, Checkbox, Select,
} from 'components';
import { getDayProgDesc } from 'helpers/scheduleData';
import { useStateVar } from 'helpers/useStateVar';
import {
  TrashIcon, CloseIcon, CheckboxIcon, EditIcon,
} from 'icons';
import { apiCall } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';
import { colors } from 'styles/colors';
import { t } from 'i18next';

const dutControlOperation = [
  { label: t('desabilitado'), value: '0_NO_CONTROL' },
  { label: t('modoEco'), value: '1_CONTROL' },
  { label: t('modoSobDemanda'), value: '2_SOB_DEMANDA' },
  { label: t('modoBackup'), value: '3_BACKUP' },
  { label: t('modoBloqueio'), value: '4_BLOCKED' },
  { label: t('modoBackupEco'), value: '5_BACKUP_CONTROL' },
  { label: t('modoEco2'), value: '6_BACKUP_CONTROL_V2' },
  { label: t('modoForcado'), value: '7_FORCED' },
] as { label: string, value: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED' }[];

export function SchedulesList(props: {
  devSched: FullProg_v4,
  wantDelException: ((date: string) => void)|null,
  wantSaveVent: ((ventInput: string) => void)|null,
  wantSaveCtrl: ((mode: '0_NO_CONTROL'|'1_CONTROL'|'2_SOB_DEMANDA'|'3_BACKUP'|'4_BLOCKED'|'5_BACKUP_CONTROL'|'6_BACKUP_CONTROL_V2'|'7_FORCED', setPoint: number, LTC: number, LTI: number) => void)|null,
  wantAddProg: (() => void)|null,
  wantEditDay: ((day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => void)|null,
  wantRemoveDay: ((day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => void)|null,
  isLoading: boolean,
  readOnly?: boolean,
  temprtControl?: boolean,
}): JSX.Element {
  const {
    devSched, wantDelException, wantSaveVent, wantSaveCtrl, wantAddProg, wantEditDay, wantRemoveDay, isLoading,
  } = props;
  const weekDaysList = {
    mon: t('diaSeg'),
    tue: t('diaTer'),
    wed: t('diaQua'),
    thu: t('diaQui'),
    fri: t('diaSex'),
    sat: t('diaSab'),
    sun: t('diaDom'),
  };
  const [state, render, setState] = useStateVar(() => ({
    editingTemprtControl: false,
    editingVentilation: false,
    submittingVentilation: false,
    ventInput: '',
    dayProgs: [] as {
      day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun',
      dayName: string,
      text: string,
      isBlank: boolean,
    }[],
    excepts: [] as { dateYMD: string, date: string, text: string }[],
    dutControlOperation,
    CTRLOPER_item: dutControlOperation.find((x) => x.value === (devSched.temprtControl && devSched.temprtControl.mode)),
    TSETPOINT: ((devSched.temprtControl && devSched.temprtControl.temperature) != null) ? devSched.temprtControl!.temperature.toString() : '24',
    LTCRIT: ((devSched.temprtControl && devSched.temprtControl.LTC) != null) ? devSched.temprtControl!.LTC.toString() : '30',
    LTINF: ((devSched.temprtControl && devSched.temprtControl.LTI) != null) ? devSched.temprtControl!.LTI.toString() : '21',
  }));

  useEffect(() => {
    const ventilation = devSched.ventTime && (devSched.ventTime.end || devSched.ventTime.begin);
    state.ventInput = (ventilation ? String(ventilation) : '0');
    const daysList: (keyof typeof weekDaysList)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    if (!devSched.week) devSched.week = {};
    state.dayProgs = daysList.map((day) => ({
      day,
      dayName: weekDaysList[day],
      text: getDayProgDesc((devSched.week && devSched.week[day]) || null),
      isBlank: !(devSched.week && devSched.week[day]),
    }));
    state.excepts = Object.entries(devSched.exceptions || {}).map(([day, prog]) => ({
      dateYMD: day,
      date: `${day.substr(8, 2)}/${day.substr(5, 2)}/${day.substr(0, 4)}`,
      text: getDayProgDesc(prog),
    }));
    render();
  }, [devSched]);

  async function saveVentilation() {
    if (!wantSaveVent) return;
    try {
      setState({ editingVentilation: true, submittingVentilation: true });
      await wantSaveVent(state.ventInput);
      toast.success(t('sucessoEnviar'));
      state.editingVentilation = false;
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
    setState({ submittingVentilation: false });
  }

  function saveTemperatureControl() {
    if (!wantSaveCtrl) return;
    if (!state.CTRLOPER_item) return toast.error(t('erroNecessarioSelecionarModoControleTemperatura'));

    if (['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2'].includes(state.CTRLOPER_item.value)) {
      if (!state.TSETPOINT) return toast.error(t('erroNecessarioSetpointTemperatura'));
    }
    const setPoint = Number(state.TSETPOINT || '24');
    if (!Number.isFinite(setPoint)) return toast.error(t('erroSetpointTemperatura'));

    if (['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2'].includes(state.CTRLOPER_item.value)) {
      if (!state.LTCRIT) return toast.error(t('erroNecessarioLimiarCriticoTemperatura'));
    }
    const LTC = Number(state.LTCRIT || '30');
    if (!Number.isFinite(LTC)) return toast.error(t('erroLimiarCriticoTemperatura'));

    if (['6_BACKUP_CONTROL_V2'].includes(state.CTRLOPER_item.value)) {
      if (!state.LTINF) return toast.error(t('erroNecessarioLimiarTemperaturaInferior'));
    }
    const LTI = Number(state.LTINF || '21');
    if (!Number.isFinite(LTC)) return toast.error(t('erroLimiarTemperaturaInferior'));

    wantSaveCtrl(state.CTRLOPER_item.value, setPoint, LTC, LTI);
    setState({ editingTemprtControl: false });
  }

  const Ventilacao = (
    <div>
      <Flex justifyContent="space-between" alignItems="center">
        <ItemTitle>{t('ventilacao')}</ItemTitle>
      </Flex>
      {
        (state.submittingVentilation)
          ? (
            <Flex alignItems="center" justifyContent="center" mt={32}>
              <Box width={1}>
                <Loader variant="primary" />
              </Box>
            </Flex>
          )
          : (state.editingVentilation)
            ? (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <span>{t('habilitarTempoVentilacao')}</span>
                <span> &nbsp; &nbsp; &nbsp; </span>
                <Input style={{ width: '100px' }} label={t('minutos')} value={state.ventInput} onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ ventInput: event.target.value })} />
                <span> &nbsp; &nbsp; &nbsp; </span>
                <IconWrapper onClick={saveVentilation}>
                  <CheckboxIcon color="green" />
                </IconWrapper>
                <span> &nbsp; &nbsp; &nbsp; </span>
                <IconWrapper onClick={() => setState({ editingVentilation: false })}>
                  <CloseIcon color="red" />
                </IconWrapper>
              </div>
            )
            : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {(devSched.ventTime && (devSched.ventTime.begin || devSched.ventTime.end)) ? (
                  <>
                    <Text>
                      {(devSched.ventTime.begin || devSched.ventTime.end)}
                      {' '}
                      {t('minutosAposHorarioPermitidoInicialEAntesHorarioPermitidoFinal')}
                    </Text>
                  </>
                ) : (
                  <Text>{t('desabilitado')}</Text>
                )}
                {(!props.readOnly) && (
                  <div style={{ width: '60px', display: 'inline-flex', justifyContent: 'space-between' }}>
                    {(devSched.ventTime && (devSched.ventTime.begin || devSched.ventTime.end)) ? (
                      <IconWrapper onClick={() => { state.ventInput = '0'; saveVentilation(); }}>
                        <TrashIcon />
                      </IconWrapper>
                    ) : <div>&nbsp;</div>}
                    <IconWrapper onClick={() => { state.editingVentilation = true; render(); }}>
                      <EditIcon />
                    </IconWrapper>
                  </div>
                )}
              </div>
            )
      }
    </div>
  );

  const TemperatureControl = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ItemTitle>{t('controleTemperatura')}</ItemTitle>
      </div>
      {(!state.editingTemprtControl) && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          {(devSched.temprtControl && devSched.temprtControl.mode) ? (
            <span>{(dutControlOperation.find((x) => x.value === devSched.temprtControl!.mode) || { label: devSched.temprtControl!.mode }).label}</span>
          ) : (
            <span>{t('modoNaoConfigurado')}</span>
          )}
          {(devSched.temprtControl && devSched.temprtControl.mode && ['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2'].includes(devSched.temprtControl.mode)) && (
            <span>
              &nbsp; &nbsp;
              {(devSched.temprtControl.temperature == null) ? '-' : devSched.temprtControl.temperature}
              °C
            </span>
          )}
          {(devSched.temprtControl && devSched.temprtControl.mode && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2'].includes(devSched.temprtControl.mode)) && (
            <span>
              &nbsp; / &nbsp;
              {(devSched.temprtControl.LTC == null) ? '-' : devSched.temprtControl.LTC}
              °C
            </span>
          )}
          {(devSched.temprtControl && devSched.temprtControl.mode && ['6_BACKUP_CONTROL_V2'].includes(devSched.temprtControl.mode)) && (
            <span>
              &nbsp; / &nbsp;
              {(devSched.temprtControl.LTI == null) ? '-' : devSched.temprtControl.LTI}
              °C
            </span>
          )}
          {(!props.readOnly) && (wantSaveCtrl) && (
            <>
              <span>&nbsp; &nbsp; &nbsp; &nbsp;</span>
              <IconWrapper onClick={() => setState({ editingTemprtControl: true })}>
                <EditIcon />
              </IconWrapper>
            </>
          )}
        </div>
      )}
      {(state.editingTemprtControl) && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Select
            options={state.dutControlOperation}
            value={state.CTRLOPER_item}
            placeholder={t('modoOperacao')}
            onSelect={(item) => setState({ CTRLOPER_item: item })}
            notNull
          />
          {(state.CTRLOPER_item && ['1_CONTROL', '2_SOB_DEMANDA', '3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2'].includes(state.CTRLOPER_item.value)) && (
            <div style={{ marginLeft: '12px' }}>
              <Input
                label={t('setpointC')}
                value={state.TSETPOINT}
                style={{ width: '160px' }}
                onChange={(e) => setState({ TSETPOINT: e.target.value })}
              />
            </div>
          )}
          {(state.CTRLOPER_item && ['3_BACKUP', '5_BACKUP_CONTROL', '6_BACKUP_CONTROL_V2'].includes(state.CTRLOPER_item.value)) && (
            <div style={{ marginLeft: '12px' }}>
              <Input
                label={t('ltcC')}
                value={state.LTCRIT}
                style={{ width: '160px' }}
                onChange={(e) => setState({ LTCRIT: e.target.value })}
              />
            </div>
          )}
          {(state.CTRLOPER_item && ['6_BACKUP_CONTROL_V2'].includes(state.CTRLOPER_item.value)) && (
            <div style={{ marginLeft: '12px' }}>
              <Input
                label={t('ltiC')}
                value={state.LTINF}
                style={{ width: '160px' }}
                onChange={(e) => setState({ LTINF: e.target.value })}
              />
            </div>
          )}
          <span> &nbsp; &nbsp; &nbsp; </span>
          <IconWrapper onClick={saveTemperatureControl}>
            <CheckboxIcon color="green" />
          </IconWrapper>
          <span> &nbsp; &nbsp; &nbsp; </span>
          <IconWrapper onClick={() => setState({ editingTemprtControl: false })}>
            <CloseIcon color="red" />
          </IconWrapper>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Flex>
        <Box width={1}>
          {(!isLoading) ? (
            <>
              <Flex justifyContent="center" alignItems="center">
                <Box width={[1, 1, 1, 1, 1]} pb="24px">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '250px' }} />
                    {(!props.readOnly) && (
                      <Button style={{ width: '100%' }} onClick={wantAddProg || (() => {})} variant="primary">
                        {t('definirProgramacao')}
                      </Button>
                    )}
                    <Box width={[0, 0, 0, 0, 250]}>&nbsp;</Box>
                  </div>
                </Box>
              </Flex>
              <ItemWrapper>
                <Flex flexWrap="wrap">
                  <Box width={[1, 1, 1, 1, (state.excepts.length > 0) ? 1 / 2 : 1]} pr={[0, 0, 0, 0, 40]}>
                    <ItemTitle>{t('funcionamento')}</ItemTitle>
                    {state.dayProgs.map((item) => (
                      <ProgTable key={item.day}>
                        <TextProgTabDay>{item.dayName}</TextProgTabDay>
                        <TextProgTabMode><span>{item.text}</span></TextProgTabMode>
                        <div style={{ display: 'inline-flex', justifyContent: 'space-between' }}>
                          {(item.isBlank || props.readOnly)
                            ? <div>&nbsp;</div>
                            : (
                              <>
                                <IconWrapper onClick={() => { wantRemoveDay && wantRemoveDay(item.day); }}>
                                  <TrashIcon />
                                </IconWrapper>
                                <IconWrapper onClick={() => { wantEditDay && wantEditDay(item.day); }}>
                                  <EditIcon />
                                </IconWrapper>
                              </>
                            )}
                        </div>
                      </ProgTable>
                    ))}
                  </Box>
                  {(state.excepts.length > 0) && (
                    <Box width={[1, 1, 1, 1, 1 / 2]} pl={[0, 0, 0, 0, 0]} pb={[20, 20, 20, 20, 0]}>
                      <ItemTitle>{t('excecoes')}</ItemTitle>
                      {state.excepts.map((item) => (
                        <ProgTableExc key={item.date}>
                          <TextProgTabDay>{item.date}</TextProgTabDay>
                          <TextProgTabMode><span>{item.text}</span></TextProgTabMode>
                          <div style={{ display: 'inline-flex', justifyContent: 'space-between' }}>
                            {(!props.readOnly) && (
                              <IconWrapper onClick={() => wantDelException && wantDelException(item.dateYMD)}>
                                <TrashIcon />
                              </IconWrapper>
                            )}
                          </div>
                        </ProgTableExc>
                      ))}
                    </Box>
                  )}
                </Flex>
              </ItemWrapper>
              {(props.temprtControl || devSched.temprtControl) && (
                <ItemWrapper>
                  {TemperatureControl}
                </ItemWrapper>
              )}
              {false && (
                <ItemWrapper>
                  {Ventilacao}
                </ItemWrapper>
              )}
            </>
          ) : (
            <Flex alignItems="center" justifyContent="center" mt={32}>
              <Box width={1}>
                <Loader variant="primary" />
              </Box>
            </Flex>
          )}
        </Box>
      </Flex>
    </>
  );
}

export function SchedulesEdit(props: {
  devSched: FullProg_v4,
  selectedDay: null|('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'),
  onConfirmProg: (days: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')[], prog: DayProg) => void,
  onConfirmExcept: (day: string, prog: DayProg) => void,
  onCancel: () => void,
  isSending: boolean,
}) {
  const {
    devSched, selectedDay, onConfirmProg, onConfirmExcept, onCancel, isSending,
  } = props;
  const weekDaysList = {
    mon: t('diaSeg'),
    tue: t('diaTer'),
    wed: t('diaQua'),
    thu: t('diaQui'),
    fri: t('diaSex'),
    sat: t('diaSab'),
    sun: t('diaDom'),
  };
  const [state, render, setState] = useStateVar(() => {
    const state = {
      exception_date: '',
      ruleException: 'rule' as 'rule'|'exception',
      allowForbid: 'allow' as 'allow'|'forbid',
      weekDays: Object.entries(weekDaysList).map(([day, name]) => ({ name, day: day as keyof typeof weekDaysList, checked: false })),
      start_time: '',
      end_time: '',
      formErrors: {
        start_time: '',
        end_time: '',
        days: '',
      },
    };

    const editProg = selectedDay && devSched.week && devSched.week[selectedDay];
    if (editProg) {
      for (const item of state.weekDays) {
        item.checked = (item.day === selectedDay);
      }
      state.start_time = editProg.start || '';
      state.end_time = editProg.end || '';
    }

    return state;
  });

  function handleSelectDay(day: { checked?: boolean }) {
    day.checked = !day.checked;
    changeExceptionMode('rule');
    // render();
  }

  function changeExceptionMode(newMode: 'rule'|'exception') {
    if (newMode === 'rule') {
      state.ruleException = 'rule';
      state.exception_date = '';
    } else {
      state.ruleException = 'exception';
      for (const day of state.weekDays) {
        day.checked = false;
      }
    }
    state.formErrors.days = '';
    render();
  }

  function validateForm() {
    let start_index = null as null|number;
    if (!/^\d\d:\d\d$/.test(state.start_time)) {
      state.formErrors.start_time = t('erroTempoInicialObrigatorio');
    } else {
      const horas = Number(state.start_time.substr(0, 2));
      const minutos = Number(state.start_time.substr(3, 2));
      if (!(horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59)) {
        state.formErrors.start_time = t('erroValorInvalido');
      } else {
        state.formErrors.start_time = '';
        start_index = horas * 60 + minutos;
      }
    }
    if (!/^\d\d:\d\d$/.test(state.end_time)) {
      state.formErrors.end_time = t('erroTempoFinalObrigatorio');
    } else {
      const horas = Number(state.end_time.substr(0, 2));
      const minutos = Number(state.end_time.substr(3, 2));
      if (!(horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59)) {
        state.formErrors.end_time = t('erroValorInvalido');
      } else {
        const end_index = horas * 60 + minutos;
        if (start_index != null && !(end_index >= start_index)) {
          state.formErrors.end_time = t('erroValorInvalido');
        } else {
          state.formErrors.end_time = '';
        }
      }
    }
    if (state.ruleException === 'rule') {
      if (!state.weekDays.some((item) => item.checked)) {
        state.formErrors.days = t('erroNecessarioSelecionarMinimoUmDia');
      } else {
        state.formErrors.days = '';
      }
    } else if (state.ruleException === 'exception') {
      if (state.exception_date.length !== 10 || state.exception_date.includes('_')) {
        state.formErrors.days = t('erroDataExcecaoObrigatoria');
      } else {
        state.formErrors.days = '';
      }
    }
    render();
    return !(state.formErrors.start_time || state.formErrors.end_time || state.formErrors.days);
  }

  function handleSubmit() {
    if (!validateForm()) return;
    const prog = {
      permission: state.allowForbid,
      start: state.start_time,
      end: state.end_time,
    };
    if (state.ruleException === 'rule') {
      const days = state.weekDays.filter((item) => item.checked).map((item) => item.day);
      onConfirmProg(days, prog);
    } else if (state.ruleException === 'exception') {
      const { exception_date } = state;
      const day = `${exception_date.substr(6, 4)}-${exception_date.substr(3, 2)}-${exception_date.substr(0, 2)}`;
      onConfirmExcept(day, prog);
    }
  }

  return (
    <Flex flexDirection="column">
      <div style={{ paddingBottom: '20px' }}>
        <RadioButton label={t('permitir')} checked={state.allowForbid === 'allow'} onClick={() => setState({ allowForbid: 'allow' })} />
        <span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span>
        <RadioButton label={t('desligar')} checked={state.allowForbid === 'forbid'} onClick={() => setState({ allowForbid: 'forbid' })} />
      </div>
      <div>
        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" mb="24px">
          <Box width={[1, 1, 1, 1, 0.35]}>
            <Input
              name="start_time"
              placeholder={t('de')}
              label={t('de')}
              value={state.start_time}
              error={state.formErrors.start_time}
              mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { state.start_time = e.target.value; render(); }}
            />
          </Box>
          <Box width={[1, 1, 1, 1, 0.35]}>
            <Input
              name="end_time"
              placeholder={t('ate')}
              label={t('ate')}
              value={state.end_time}
              error={state.formErrors.end_time}
              mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { state.end_time = e.target.value; render(); }}
            />
          </Box>
          <Box>
            <Checkbox
              label={t('24Horas')}
              checked={(state.start_time === '00:00' && state.end_time === '23:59')}
              onClick={() => { state.start_time = '00:00'; state.end_time = '23:59'; render(); }}
            />
          </Box>
        </Flex>
        <Text>{t('Dias')}</Text>
        <Flex flexWrap="wrap">
          <Flex alignItems="center" width={[1, 1, 1, 1, 1 / 2]}>
            {state.weekDays.map((item) => (
              <SelectDay
                key={item.day}
                isSelected={item.checked}
                ruleException={state.ruleException}
                onClick={() => { handleSelectDay(item); }}
              >
                {item.name}
              </SelectDay>
            ))}
          </Flex>
          {(!selectedDay) && (
            <Flex alignItems="center" width={[1, 1, 1, 1, 1 / 2]} pl={[0, 0, 0, 0, 30]}>
              <RadioButton label={t('excecao')} checked={state.ruleException === 'exception'} onClick={() => { changeExceptionMode('exception'); }} />
              <span style={{ width: '1em' }}>&nbsp;</span>
              <Input
                style={{ width: '10em' }}
                name="exception_date"
                placeholder={t('Dia')}
                label={t('Dia')}
                value={state.exception_date}
                mask={[/[0-3]/, /[0-9]/, '/', /[0-1]/, /[0-9]/, '/', /[2]/, /[0]/, /[0-9]/, /[0-9]/]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => { setState({ exception_date: e.target.value }); }}
                disabled={state.ruleException !== 'exception'}
              />
            </Flex>
          )}
        </Flex>
        {state.formErrors.days && <ErrorMessage>{state.formErrors.days}</ErrorMessage>}
        <Flex pt="24px" alignItems="center" justifyContent="center" flexWrap="wrap">
          <Box width={[1, 1, 1, 1 / 3, 1 / 3]} mr={[0, 0, 0, '12px', '12px']} mb={['24px', '24px', '24px', 0, 0]}>
            <Button variant="secondary" onClick={onCancel}>
              {t('botaoVoltar')}
            </Button>
          </Box>
          <Box width={[1, 1, 1, 1 / 3, 1 / 3]} ml={[0, 0, 0, '12px', '12px']}>
            <Button variant="primary" onClick={handleSubmit}>
              {isSending ? <Loader variant="secondary" size="small" /> : t('botaoSalvar')}
            </Button>
          </Box>
        </Flex>
      </div>
    </Flex>
  );
}

export function SchedulesRemove(props: {
  selectedDay: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'),
  onConfirm: (day: ('mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun')) => void,
  onCancel: () => void,
  isRemoving: boolean,
}) {
  const {
    selectedDay, onConfirm, onCancel, isRemoving,
  } = props;
  return (
    <>
      <Flex alignItems="center" justifyContent="center">
        <Box mb="16px">
          <Text>{t('desejaExcluirEstaProgramacao')}</Text>
        </Box>
      </Flex>
      <Flex alignItems="center" justifyContent="center" flexWrap="wrap">
        <Box width={[1, 1, 1, 1 / 3, 1 / 3]} mr={[0, 0, 0, '12px', '12px']} mb={['24px', '24px', '24px', 0, 0]}>
          <div onClick={onCancel}>
            <Button variant="secondary">{t('botaoVoltar')}</Button>
          </div>
        </Box>
        <Box width={[1, 1, 1, 1 / 3, 1 / 3]} ml={[0, 0, 0, '12px  ', '12px']}>
          <div onClick={() => onConfirm(selectedDay)}>
            <Button variant="primary">{isRemoving ? <Loader size="small" variant="secondary" /> : t('botaoExcluir')}</Button>
          </div>
        </Box>
      </Flex>
    </>
  );
}

export function DutScheduleSummary(props: { dutId: string }) {
  const { dutId } = props;
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isLoading: true,
      devSched: { week: {}, exceptions: {} } as FullProg_v4,
    };
    return state;
  });

  async function getData() {
    try {
      setState({ isLoading: true });
      state.devSched = await apiCall('/dut/get-programming-v3', { dutId });
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <SchedulesList
      devSched={state.devSched}
      isLoading={state.isLoading}
      readOnly
      wantDelException={null}
      wantSaveVent={null}
      wantSaveCtrl={null}
      wantAddProg={null}
      wantEditDay={null}
      wantRemoveDay={null}
    />
  );
}

const Text = styled.p<{ isBold?: boolean }>(
  ({ isBold }) => `
    margin-bottom: ${isBold ? 0 : '1em'};
    margin-top: ${isBold ? '1em' : 0};
    color: ${isBold ? colors.Grey300 : colors.Grey400};
    font-weight: ${isBold ? 'bold' : 'normal'};
  `,
);

const ProgTable = styled.div`
  display: grid;
  grid-template-columns: 43px 1fr 60px;
  color: ${colors.Grey400};
  padding-top: 12px;
`;

const ProgTableExc = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr 60px;
  color: ${colors.Grey400};
  padding-top: 12px;
`;

const TextProgTabDay = styled.span`
  color: ${colors.Grey300};
  font-weight: bold;
`;

const TextProgTabMode = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`;

const ItemTitle = styled.h3`
  margin-bottom: 0;
  font-weight: bold;
  font-size: 1.25em;
  line-height: 27px;
  color: ${colors.Blue300};
`;

const ItemWrapper = styled.div`
  width: 100%;
  border-top: 2px solid ${colors.Grey050};
`;

const IconWrapper = styled.div`
  cursor: pointer;
`;

const SelectDay = styled.div<{ isSelected: boolean, ruleException: 'rule'|'exception' }>(
  ({ isSelected, ruleException }) => `
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 48px;
    height: 32px;
    box-sizing: border-box;
    border-radius: 8px;
    margin-left: 2px;
    margin-right: 2px;
    background-color: ${ruleException === 'rule' ? (isSelected ? colors.Blue300 : colors.White) : colors.White};
    border: 1px solid ${ruleException === 'rule' ? colors.Blue300 : colors.Grey200};
    color: ${ruleException === 'rule' ? (isSelected ? colors.White : colors.Blue300) : colors.Grey200};
  `,
);

const ErrorMessage = styled.span`
  color: ${colors.Red};
  font-size: 0.75em;
`;
