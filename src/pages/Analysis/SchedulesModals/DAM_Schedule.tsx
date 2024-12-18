import { ChangeEvent, useEffect } from 'react';
import { t } from 'i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import {
  Button, Input, Loader, RadioButton, StatusBox, LayerBackgroundModal, Card, Checkbox,
} from 'components';
import { getCachedDevInfo, getCachedDevInfoSync } from 'helpers/cachedStorage';
import { getDayProgDesc } from 'helpers/scheduleData';
import { useStateVar } from 'helpers/useStateVar';
import { useWebSocketLazy, WSConn } from 'helpers/wsConnection';
import {
  TrashIcon, EditIcon, CheckboxIcon, CloseIcon, TermometerIcon,
} from 'icons';
import { apiCall } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';
import { colors } from 'styles/colors';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export function SchedulesList(props: {
  damId: string
  devSched: FullProg_v4,
  wantDelException: ((date: string) => void)|null,
  // wantSaveVent: ((ventInput: string) => void)|null,
  wantSaveVent: ((ventTime: { begin: string, end: string }) => void)|null,
  wantAddProg: (() => void)|null,
  wantEditDay: ((day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => void)|null,
  wantRemoveDay: ((day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => void)|null,
  isLoading: boolean,
  hideId?: boolean,
  readOnly?: boolean,
  assetLayout?: boolean,
}): JSX.Element {
  const {
    damId, devSched, wantDelException, wantSaveVent, wantAddProg, wantEditDay, wantRemoveDay, isLoading, hideId,
  } = props;
  const [state, render, setState] = useStateVar({
    devInfo: getCachedDevInfoSync(damId),
    editingVentilation: false,
    submittingVentilation: false,
    ventInput: '',
    ventTime: {} as { begin: string, end: string },
    dayProgs: [] as {
      day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun',
      dayName: string,
      text: string,
      isBlank: boolean,
    }[],
    excepts: [] as { dateYMD: string, date: string, text: string }[],
    ecoModeCfg: null as null|string,
    relDutInfo: null as null|{
      REL_DUT_ID: string,
      ROOM_DESC?: string,
      TUSEMIN?: number,
      Temperature?: number,
      status?: string,
    },
    damRealTimeInfo: {} as null|{
      Temperature?: null|number,
      status?: null|string,
    },
  });
  const weekDaysList = {
    mon: t('diasDaSemana.seg'),
    tue: t('diasDaSemana.ter'),
    wed: t('diasDaSemana.qua'),
    thu: t('diasDaSemana.qui'),
    fri: t('diasDaSemana.sex'),
    sat: t('diasDaSemana.sab'),
    sun: t('diasDaSemana.dom'),
  };

  const ecoModeCfgs: { [k: string]: string } = {
    'eco-D': t('desligar'),
    'eco-V': t('ventilar'),
    'eco-C1-V': t('desligarCondensadora2DepoisVentilar'),
    'eco-C2-V': t('desligarCondensadora1DepoisVentilar'),
  };

  const lws = useWebSocketLazy();
  useEffect(() => {
    // if (state.relatedDutId) {
    //   return wsConn.addListener(onWsEvent);
    // }
    (async function () {
      try {
        state.devInfo = await getCachedDevInfo(damId, {});
        if (!state.devInfo) return;
        state.ecoModeCfg = ((state.devInfo.dam?.ENABLE_ECO === 1 || state.devInfo.dam?.ENABLE_ECO === 2) && state.devInfo.dam?.ECO_CFG) || null;
        state.relDutInfo = null;
        if (state.devInfo.dam?.REL_DUT_ID) {
          state.relDutInfo = {
            REL_DUT_ID: state.devInfo.dam!.REL_DUT_ID,
          };
          const dutInfo = await apiCall('/dut/get-dut-info', { DEV_ID: state.relDutInfo.REL_DUT_ID });
          state.relDutInfo.TUSEMIN = dutInfo.info.TUSEMIN;
          state.relDutInfo.ROOM_DESC = dutInfo.info.ROOM_NAME ? `${dutInfo.info.ROOM_NAME}` : '';
          lws.start(onWsOpen, onWsMessage, beforeWsClose);
        }
        else if (state.devInfo.dam?.SELF_REFERENCE) {
          state.damRealTimeInfo = { Temperature: null, state: null };
          lws.start(onWsOpen, onWsMessage, beforeWsClose);
        }
      } catch (err) { console.log(err); toast.error(t('houveErro')); }
    }());
  }, []);

  function onWsOpen(wsConn: WSConn) {
    if (state.relDutInfo && state.relDutInfo.REL_DUT_ID) {
      wsConn.send({ type: 'dutSubscribeRealTime', data: { DUT_ID: state.relDutInfo.REL_DUT_ID } });
    }
    else if (state.devInfo.dam && state.devInfo.dam.SELF_REFERENCE) {
      wsConn.send({ type: 'subscribeStatus', data: { dam_id: damId } });
    }
  }
  function onWsMessage(message: { type: string, data: any }) {
    if (message && message.type === 'dutTelemetry' && state.relDutInfo && message.data.dev_id === state.relDutInfo.REL_DUT_ID) {
      state.relDutInfo.Temperature = message.data && message.data.Temperature;
      state.relDutInfo.status = message.data && message.data.status;
      render();
    }
    if (message && message.type === 'devOnlineStatus' && state.relDutInfo && message.data.dev_id === state.relDutInfo.REL_DUT_ID) {
      state.relDutInfo.status = message.data && message.data.status;
      render();
    }
    if (message && message.type === 'damStatus' && state.damRealTimeInfo && message.data.status && message.data.dev_id === damId && state.devInfo.dam && state.devInfo.dam.SELF_REFERENCE) {
      state.damRealTimeInfo.Temperature = message.data.Temperature || null;
      state.damRealTimeInfo.status = message.data.status;
      render();
    }
  }
  function beforeWsClose(wsConn: WSConn) {
    wsConn.send({ type: 'dutUnsubscribeRealTime' });
    wsConn.send({ type: 'unsubscribeStatus' });
  }

  useEffect(() => {
    const ventilation = devSched.ventTime && (devSched.ventTime.end || devSched.ventTime.begin);
    state.ventInput = (ventilation ? String(ventilation) : '0');
    state.ventTime = {
      begin: devSched.ventTime ? String(devSched.ventTime.begin) : '0',
      end: devSched.ventTime ? String(((devSched.ventTime.end !== null) && (devSched.ventTime.end !== undefined)) ? devSched.ventTime.end : devSched.ventTime.begin) : '0',
    };
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
      if (state.devInfo?.dam?.supportsVentEnd) {
        await wantSaveVent(state.ventTime);
      } else {
        await wantSaveVent({ begin: state.ventInput, end: state.ventInput });
      }
      toast.success(t('sucessoEnviar'));
      state.editingVentilation = false;
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ submittingVentilation: false });
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
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '600px',
              }}
              >
                <span>{t('habilitarTempoDeVentilacao')}</span>
                <span> &nbsp; &nbsp; &nbsp; </span>
                { (state.devInfo?.dam?.supportsVentEnd)
                  ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <div style={{ width: '60px' }}>
                        <span>{t('inicio')}</span>
                      </div>
                      <span> &nbsp; &nbsp; &nbsp; </span>
                      <Input style={{ width: '100px' }} label={t('minutos')} value={state.ventTime.begin} onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ ventTime: { begin: event.target.value, end: state.ventTime.end } })} />
                      <span> &nbsp; &nbsp; &nbsp; </span>
                      <div style={{ width: '60px' }}>
                        <span>{t('fim')}</span>
                      </div>
                      <span> &nbsp; &nbsp; &nbsp; </span>
                      <Input style={{ width: '100px' }} label={t('minutos')} value={state.ventTime.end} onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ ventTime: { begin: state.ventTime.begin, end: event.target.value } })} />
                      <span> &nbsp; &nbsp; &nbsp; </span>
                    </div>
                  )
                  : (
                    <Input style={{ width: '100px' }} label={t('minutos')} value={state.ventInput} onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ ventInput: event.target.value })} />
                  )}
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
                      {(devSched.ventTime.begin)}
                      {' '}
                      {t('minutosAposHorarioPermitidoInicial')}
                      {' '}
                      {(devSched.ventTime.end)}
                      {' '}
                      {t('minutosAntesHorarioPermitidoFinal')}
                    </Text>
                  </>
                ) : (
                  <Text>{t('desabilitado')}</Text>
                )}
                {(!props.readOnly) && (
                  <div style={{ width: '60px', display: 'inline-flex', justifyContent: 'space-between' }}>
                    {(devSched.ventTime && (devSched.ventTime.begin || devSched.ventTime.end)) ? (
                      <IconWrapper onClick={() => { state.ventTime = { begin: '0', end: '0' }; state.ventInput = '0'; saveVentilation(); }}>
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

  const ModoEco = (
    <div>
      <ItemTitle>{t('modoEco')}</ItemTitle>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ paddingTop: '14px' }}>
            {(!state.ecoModeCfg)
              && <Text>{t('desabilitado')}</Text>}
            {(state.ecoModeCfg)
              && (
              <Text>
                {t('acao')}
                {': '}
                {ecoModeCfgs[state.ecoModeCfg] || state.ecoModeCfg}
              </Text>
              )}
          </div>
          {(state.relDutInfo)
            && (
            <>
              <Flex alignItems="center">
                <Text>
                  {t('ambienteRefrigerado')}
                  {' '}
                  {state.relDutInfo.ROOM_DESC || state.relDutInfo.REL_DUT_ID}
                  <a href={`${window.location.protocol}//${window.location.host}/analise/dispositivo/${state.relDutInfo.REL_DUT_ID}/informacoes`}>{`(${state.relDutInfo.REL_DUT_ID})`}</a>
                </Text>
              </Flex>
              <div>
                <Text>
                  {t('limiteDeTemperatura')}
                  {': '}
                  {(state.relDutInfo.TUSEMIN != null) ? `${state.relDutInfo.TUSEMIN} °C` : t('semInformacao')}
                </Text>
              </div>
            </>
            )}
          {state.devInfo?.dam && state.devInfo.dam?.SELF_REFERENCE && (
            <>
              <ItemTitle>{t('modoControle')}</ItemTitle>
              <Text>{t('utilizandoDamIdComoReferencia', { damId })}</Text>
              <StyledText>
                <TermometerIcon />
                {' '}
                {t('temperaturaAmbiente')}
              </StyledText>
              <div>
                <StyledText fontSize="42px">{(state.damRealTimeInfo?.Temperature == null) ? '-' : `${formatNumberWithFractionDigits(state.damRealTimeInfo.Temperature)}°C`}</StyledText>
              </div>
              <div style={{ display: 'flex' }}>
                <Text>
                  <StatusBox status={state.damRealTimeInfo?.status || 'OFFLINE'}>{state.damRealTimeInfo?.status || 'OFFLINE'}</StatusBox>
                </Text>
              </div>
              <div style={{ display: 'flex' }}>
                <Text>
                  {`${t('limiteTemperatura')} ${state.devInfo.dam?.MAXIMUM_TEMPERATURE || '-'}ºC`}
                </Text>
              </div>
            </>
          )}
        </div>
        <Wrapper style={{ textAlign: 'left' }}>
          {(state.relDutInfo)
            && (
            <>
              <StyledText>
                <TermometerIcon />
                {' '}
                {t('temperaturaAmbiente')}
              </StyledText>
              <div>
                <StyledText fontSize="42px">{(state.relDutInfo.Temperature == null) ? '-' : `${formatNumberWithFractionDigits(state.relDutInfo.Temperature)}°C`}</StyledText>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Text style={{ paddingLeft: '7px' }}>
                  <StatusBox status={state.relDutInfo.status || 'OFFLINE'}>{state.relDutInfo.status || 'OFFLINE'}</StatusBox>
                </Text>
              </div>
            </>
            )}
        </Wrapper>
      </div>
    </div>
  );

  const returnDamId = (damId: string) => (damId.startsWith('DAM') ? t('damId') : t('dacId'));

  return (
    <>
      <Flex>
        <Box width={1}>
          {(!isLoading) ? (
            <Flex width="100%" flexDirection="column">
              <Flex width="100%" flexDirection={!props.assetLayout ? 'column' : 'row'}>
                <Flex flexDirection="column">
                  <Flex justifyContent="center" alignItems="center">
                    <Box width={[1, 1, 1, 1, 1]} pb="24px">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '250px' }}>
                          {(!hideId) && (
                            <>
                              <div style={{ color: colors.Grey300, fontWeight: 'bold' }}>
                                { returnDamId(damId) }
                              </div>
                              <StyledLink to={`/analise/dispositivo/${damId}/informacoes`}>
                                {damId}
                              </StyledLink>
                            </>
                          )}
                        </div>
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
                </Flex>
                <Flex flexDirection="column" width="50%">
                  {(damId && (!damId.startsWith('DAC'))) && ( // TODO: FIXME: find a better way to check this
                    <ItemWrapper style={{ marginTop: !props.assetLayout ? '0px' : '44px' }}>
                      {Ventilacao}
                    </ItemWrapper>
                  )}
                  <ItemWrapper>
                    {ModoEco}
                  </ItemWrapper>
                </Flex>
              </Flex>
            </Flex>
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
    mon: t('diasDaSemana.seg'),
    tue: t('diasDaSemana.ter'),
    wed: t('diasDaSemana.qua'),
    thu: t('diasDaSemana.qui'),
    fri: t('diasDaSemana.sex'),
    sat: t('diasDaSemana.sab'),
    sun: t('diasDaSemana.dom'),
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

  function handleSelectDay(day: { checked: boolean }) {
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
      state.formErrors.end_time = t('campoTempoFinalObrigatorio');
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
              label={t('24horas')}
              checked={(state.start_time === '00:00' && state.end_time === '23:59')}
              onClick={() => { state.start_time = '00:00'; state.end_time = '23:59'; render(); }}
            />
          </Box>
        </Flex>
        <Text>{t('dias')}</Text>
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
                placeholder={t('dia')}
                label={t('dia')}
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
            <Button variant="primary">{isRemoving ? <Loader size="small" variant="secondary" /> : 'Excluir'}</Button>
          </div>
        </Box>
      </Flex>
    </>
  );
}

export function DamScheduleSummary(props: { damId: string, assetLayout?: boolean, }) {
  const { damId, assetLayout } = props;
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
      if (damId) {
        state.devSched = await apiCall('/dam/get-programming-v3', { damId });
      }
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <SchedulesList
      hideId
      damId={damId}
      devSched={state.devSched}
      isLoading={state.isLoading}
      readOnly
      wantDelException={null}
      wantSaveVent={null}
      wantAddProg={null}
      wantEditDay={null}
      wantRemoveDay={null}
      assetLayout={assetLayout}
    />
  );
}

// export function parseReceivedProgramming(data: ApiResps['/dam/get-programming-v2']) {

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

const StyledLink = styled(Link)`
  font-size: 1em;
  color: ${colors.Grey400};
`;

const StyledText = styled.span<{ fontSize?: string }>(
  ({ fontSize = '12px' }) => `
  font-size: ${fontSize};
  font-weight: bold;
  color: ${colors.Grey400};
  white-space: nowrap;
  text-align: center;
`,
);

const Wrapper = styled.div`
  text-align: center;
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
