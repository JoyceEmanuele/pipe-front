import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Flex } from 'reflexbox';
import styled from 'styled-components';

import img_fan_0_off from '~/assets/img/cool_ico/fan_0_off.svg';
import img_fan_1_low from '~/assets/img/cool_ico/fan_1_low.svg';
import img_fan_2 from '~/assets/img/cool_ico/fan_2.svg';
import img_fan_3 from '~/assets/img/cool_ico/fan_3.svg';
import img_fan_4_high from '~/assets/img/cool_ico/fan_4_high.svg';
import img_fan_auto from '~/assets/img/cool_ico/fan_auto.svg';
import img_mode_auto from '~/assets/img/cool_ico/mode_auto.svg';
import img_mode_cool from '~/assets/img/cool_ico/mode_cool.svg';
import img_mode_cool_off from '~/assets/img/cool_ico/mode_cool_off.svg';
import img_mode_dry from '~/assets/img/cool_ico/mode_dry.svg';
import img_mode_fan from '~/assets/img/cool_ico/mode_fan.svg';
import img_mode_heat from '~/assets/img/cool_ico/mode_heat.svg';
import img_power from '~/assets/img/cool_ico/power.svg';
import img_power_grey from '~/assets/img/cool_ico/power_grey.svg';
import img_schedule from '~/assets/img/cool_ico/schedule.svg';
import img_swing_1_low from '~/assets/img/cool_ico/swing_1_low.svg';
import img_swing_2 from '~/assets/img/cool_ico/swing_2.svg';
import img_swing_3 from '~/assets/img/cool_ico/swing_3.svg';
import img_swing_4 from '~/assets/img/cool_ico/swing_4.svg';
import img_swing_5_high from '~/assets/img/cool_ico/swing_5_high.svg';
import img_swing_auto from '~/assets/img/cool_ico/swing_auto.svg';
import img_swing_off from '~/assets/img/cool_ico/swing_off.svg';
import {
  Button,
  Input,
  Loader,
  ModalWindow,
  ToggleSwitch,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { EditIcon } from '~/icons';
import { SmallTrashIcon } from '~/icons/Trash';
import { apiCall, ApiResps } from '~/providers';
import { colors } from '~/styles/colors';
import {
  Bluebar, NotyIconStyle, NotyNumStyle, SchedCardContainer, Sidebar,
} from './styles';

interface UnitInfo {
  id: string
  name: string
  system: string
  site: string
  type: number
  activeOperationMode: number
  activeSetpoint: number
  ambientTemperature: number
  activeOperationStatus: number
  activeFanMode: number
  activeSwingMode: number
}

export interface ScheduleInfo {
  id: string
  name: string
  isDisabled: boolean
  powerOnTime: number
  powerOffTime?: number
  setpoint: number
  days: ('Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday')[],
  units?: string[]
}

export function convertCoolAutomationSchedTime(value: number|null|undefined) {
  if (value == null) return '';
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function formatSchedules(scheds: ScheduleInfo[]|undefined) {
  const devsSched = {} as {
    [unitId: string]: ScheduleInfo[],
  };
  if (scheds) {
    for (const sched of scheds) {
      if (sched.units) {
        for (const unitId of sched.units) {
          if (!devsSched[unitId]) devsSched[unitId] = [sched];
          else devsSched[unitId].push(sched);
        }
      }
    }
  }

  return devsSched;
}

export function CoolAutomationRealTime(props: { devInfo: ApiResps['/get-integration-info']['info'], coolAutomation: ApiResps['/get-integration-info']['coolautomation'] }) : JSX.Element {
  // const {} = props;
  const { t } = useTranslation();
  const [width, setWidth] = useState(window.innerWidth);
  const [state, render, setState] = useStateVar({
    loading: true,
    loadingTelemetry: false,
    loadingSchedule: false,
    lastRefresh: 0,
    timerChangeSetpoint: null as null|NodeJS.Timeout,
    allUnits: [] as (UnitInfo & { schedules?: ScheduleInfo[] })[],
    indoorUnits: [] as (UnitInfo & { schedules?: ScheduleInfo[] })[],
    outdoorUnits: [] as (UnitInfo & { schedules?: ScheduleInfo[] })[],
    schedules: formatSchedules(props.coolAutomation?.schedules),
    showScheds: false as boolean,
    selectedScheds: props.coolAutomation?.schedules,
    selectedUnitId: null as null|string,
    unitLastTelemetry: null as null|({
      name: string;
      y: number;
      unit?: string;
    }[]),
    siteTemprt: null as number|null,
    floatingControlMode: null as null|{
      x: number
      y: number
    },
    floatingControlFan: null as null|{
      x: number
      y: number
    },
    floatingControlSwing: null as null|{
      x: number
      y: number
    },
    modalSchedulesList: null as null|{
      list: ScheduleInfo[]
    },
    modalEditSchedule: null as null|{
      addEdit: 'Add'|'Edit'
      scheduleId: string
      name: string
      active: boolean
      start_time: string
      start_time_error: string
      end_time: string
      end_time_error: string
      selectedDays: {
        mon: boolean
        tue: boolean
        wed: boolean
        thu: boolean
        fri: boolean
        sat: boolean
        sun: boolean
      }
      useSetpoint: boolean
      setpointValue: string
    },
  });

  useEffect(() => {
    (async () => {
      try {
        setState({ loading: true });
        await atualizarUnits();
      } catch (err) { toast.error(t('houveErro')); console.error(err); }
      setState({ loading: false });
    })();
    const refreshUnitsTimer = setInterval(() => {
      if (state.lastRefresh > (Date.now() - 15000)) return;
      state.lastRefresh = Date.now();
      // console.log('DBG R1', Date.now());
      atualizarUnits().catch(console.log);
      render();
    }, 1000);
    return () => {
      clearInterval(refreshUnitsTimer);
      if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    };
  }, []);

  useEffect(() => {
    // console.log('DBG P1', Date.now());
    (async () => {
      try {
        state.unitLastTelemetry = null;
        state.siteTemprt = null;
        const selectedUnit = state.allUnits.find((unit) => unit.id === state.selectedUnitId);
        if (!selectedUnit) return;
        // console.log('DBG P2', Date.now());
        setState({ loadingTelemetry: true });
        const [
          { telemetry },
        ] = await Promise.all([
          apiCall('/coolautomation/get-unit-last-telemetry', { coolAutUnitId: selectedUnit.id }),
        ]);
        state.unitLastTelemetry = Object.values(telemetry);
        for (const val of state.unitLastTelemetry) {
          const { name, unit } = parseCoolAutVarName(val.name);
          val.name = name;
          val.unit = unit;
          if (val.name === 'Site temperature') state.siteTemprt = val.y;
        }
        state.unitLastTelemetry = state.unitLastTelemetry.sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });
      } catch (err) { toast.error(t('houveErro')); console.error(err); }
      setState({ loadingTelemetry: false });
      // console.log('DBG P3', Date.now());
    })();
  }, [state.selectedUnitId]);

  async function atualizarUnits() {
    state.lastRefresh = Date.now();
    const [
      { list, valsTransl },
    ] = await Promise.all([
      apiCall('/coolautomation/get-device-units', { coolAutDeviceId: props.devInfo.integrId }),
    ]);
    state.allUnits = list.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
    state.indoorUnits = state.allUnits.filter((unit) => unit.type === 1).map((unit) => {
      const schedules = state.schedules[unit.id];
      return { ...unit, schedules };
    });
    state.outdoorUnits = state.allUnits.filter((unit) => unit.type === 2).map((unit) => {
      const schedules = state.schedules[unit.id];
      return { ...unit, schedules };
    });

    // console.log('DBG P0', Date.now());
    for (const item of state.allUnits) {
      if (item.activeSetpoint != null) item.activeSetpoint = Math.round(item.activeSetpoint);
    }
  }

  function onClickMode(event) {
    if (state.floatingControlMode) {
      state.floatingControlMode = null;
    } else {
      let el = event.target;
      while (el.tagName.toLowerCase() !== 'div') {
        if (!el.parentElement) return;
        if (!el.parentElement.tagName) return;
        el = el.parentElement;
      }
      const rect = el.getBoundingClientRect();
      state.floatingControlMode = null;
      state.floatingControlFan = null;
      state.floatingControlSwing = null;
      state.floatingControlMode = {
        x: rect.x, // event.target.offsetLeft, // event.clientX
        y: rect.y - 5 * 71, // event.target.offsetTop, // event.clientY
      };
    }
    render();
  }
  function onClickFan(event) {
    if (state.floatingControlFan) {
      state.floatingControlFan = null;
    } else {
      let el = event.target;
      while (el.tagName.toLowerCase() !== 'div') {
        if (!el.parentElement) return;
        if (!el.parentElement.tagName) return;
        el = el.parentElement;
      }
      const rect = el.getBoundingClientRect();
      state.floatingControlMode = null;
      state.floatingControlFan = null;
      state.floatingControlSwing = null;
      state.floatingControlFan = {
        x: rect.x,
        y: rect.y - 5 * 71,
      };
    }
    render();
  }
  function onClickSwing(event) {
    if (state.floatingControlSwing) {
      state.floatingControlSwing = null;
    } else {
      let el = event.target;
      while (el.tagName.toLowerCase() !== 'div') {
        if (!el.parentElement) return;
        if (!el.parentElement.tagName) return;
        el = el.parentElement;
      }
      const rect = el.getBoundingClientRect();
      state.floatingControlMode = null;
      state.floatingControlFan = null;
      state.floatingControlSwing = null;
      state.floatingControlSwing = {
        x: rect.x,
        y: rect.y - 5 * 71,
      };
    }
    render();
  }

  function onOffBackgroundColor(operationStatuse: number) {
    // operationStatuses: {"1":"on","2":"off"},
    switch (operationStatuse) {
      case 1: return '#363bc4'; // ON
      case 2: return '#bbbbbb'; // OFF
      default: return '#bbbbbb';
    }
  }
  function getOperationStatusIcon(operationStatus: number) {
    // operationStatuses: {"1":"on","2":"off"},
    switch (operationStatus) {
      case 1: return img_power;
      case 2: return img_power_grey;
      default: return img_power_grey;
    }
  }
  function getOperationModeIcon(operationMode: number) {
    // operationModes: {"0":"COOL","1":"HEAT","2":"AUTO","3":"DRY","5":"FAN"},
    switch (operationMode) {
      case 0: return img_mode_cool;
      case 1: return img_mode_heat;
      case 2: return img_mode_auto;
      case 3: return img_mode_dry;
      case 5: return img_mode_fan;
      default: return img_mode_cool_off;
    }
  }
  function getFanModeIcon(fanMode: number) {
    // fanModes: {"0":"LOW","1":"MEDIUM","2":"HIGH","3":"AUTO","4":"TOP","5":"VERYLOW"},
    switch (fanMode) {
      case 0: return img_fan_1_low;
      case 1: return img_fan_2;
      case 2: return img_fan_3;
      case 3: return img_fan_auto;
      case 4: return img_fan_4_high;
      default: return img_fan_0_off;
    }
  }
  function getSwingModeIcon(swingMode: number) {
    // swingModes: {"0":"vertical","1":"30","2":"45","3":"60","4":"horizontal","5":"auto","6":"off","7":"on"},
    switch (swingMode) {
      case 0: return img_swing_1_low;
      case 1: return img_swing_4;
      case 2: return img_swing_3;
      case 3: return img_swing_2;
      case 4: return img_swing_5_high;
      case 5: return img_swing_auto;
      case 7: return img_swing_auto;
      default: return img_swing_off;
    }
  }

  async function setOperationStatus(unit: { id: string, activeOperationStatus: number }, operationStatus: number) {
    try {
      if (!unit) return;
      await apiCall('/coolautomation/control-unit-operation', {
        unitId: unit.id,
        operationStatus,
      });
      unit.activeOperationStatus = operationStatus;
      toast.info(t('comandoEnviado'));
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  async function setOperationMode(operationMode: number) {
    try {
      const selectedUnit = state.allUnits.find((unit) => unit.id === state.selectedUnitId);
      if (!selectedUnit) return;
      await apiCall('/coolautomation/control-unit-operation', {
        unitId: selectedUnit.id,
        operationMode,
      });
      selectedUnit.activeOperationMode = operationMode;
      toast.info(t('comandoEnviado'));
      setState({ floatingControlMode: null, floatingControlFan: null, floatingControlSwing: null });
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  async function setFanMode(fanMode: number) {
    try {
      const selectedUnit = state.allUnits.find((unit) => unit.id === state.selectedUnitId);
      if (!selectedUnit) return;
      await apiCall('/coolautomation/control-unit-operation', {
        unitId: selectedUnit.id,
        fanMode,
      });
      selectedUnit.activeFanMode = fanMode;
      toast.info(t('comandoEnviado'));
      setState({ floatingControlMode: null, floatingControlFan: null, floatingControlSwing: null });
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  async function setSwingMode(swingMode: number) {
    try {
      const selectedUnit = state.allUnits.find((unit) => unit.id === state.selectedUnitId);
      if (!selectedUnit) return;
      await apiCall('/coolautomation/control-unit-operation', {
        unitId: selectedUnit.id,
        swingMode,
      });
      selectedUnit.activeSwingMode = swingMode;
      toast.info(t('comandoEnviado'));
      setState({ floatingControlMode: null, floatingControlFan: null, floatingControlSwing: null });
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }
  async function sendSSetpoint(setpoint: number) {
    try {
      const selectedUnit = state.allUnits.find((unit) => unit.id === state.selectedUnitId);
      if (!selectedUnit) return;
      await apiCall('/coolautomation/control-unit-operation', {
        unitId: selectedUnit.id,
        setpoint,
      });
      toast.info(t('setpointEnviado'));
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  function changeSetpoint(newSetpoint: number) {
    const selectedUnit = state.allUnits.find((unit) => unit.id === state.selectedUnitId);
    if (state.timerChangeSetpoint) clearTimeout(state.timerChangeSetpoint);
    if (selectedUnit) {
      selectedUnit.activeSetpoint = newSetpoint;
      state.timerChangeSetpoint = setTimeout(() => sendSSetpoint(newSetpoint), 1500);
      render();
    }
  }

  async function showProgramming() {
    try {
      if (!state.selectedUnitId) return;
      state.modalSchedulesList = null;
      state.modalEditSchedule = null;
      setState({ loadingSchedule: true });
      const unitSched = await apiCall('/coolautomation/get-unit-programming', { coolAutUnitId: state.selectedUnitId });
      for (const item of (unitSched.list as any[])) {
        for (const prop of Object.keys(item)) {
          if (prop.includes('nable')) delete item[prop];
          if ((item[prop] instanceof Array) && (item[prop].length === 0)) delete item[prop];
          if (['system', 'unit', 'eWrcDisable'].includes(prop)) delete item[prop];
        }
      }
      if (unitSched.list.length > 0) {
        state.modalSchedulesList = unitSched;
      } else {
        toast.info(t('nenhumaProgramacao'));
      }
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    setState({ loadingSchedule: false });
  }

  function showScheds() {
    try {
      state.showScheds = true;
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  function selectedSchedules(name:string) {
    state.selectedScheds = props.coolAutomation?.schedules.filter((sched) => sched.unitName?.includes(name));
  }

  async function onDeleteClick(item: ScheduleInfo) {
    try {
      if (!window.confirm(t('temCertezaQueDesejaExcluir'))) return;
      // setState({ savingSched: true });
      await apiCall('/coolautomation/delete-unit-schedule', {
        scheduleId: item.id,
      });
      toast.success(t('sucessoExcluirProgramacao'));
      window.location.reload();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  function editAddProgramming(item?: ScheduleInfo) {
    try {
      state.modalEditSchedule = {
        addEdit: item ? 'Edit' : 'Add',
        scheduleId: (item && item.id) || '',
        name: (item && item.name) || '',
        active: !(item && item.isDisabled),
        start_time: item ? convertCoolAutomationSchedTime(item.powerOnTime) : '',
        start_time_error: '',
        end_time: (item && item.powerOffTime != null) ? convertCoolAutomationSchedTime(item.powerOffTime) : '',
        end_time_error: '',
        selectedDays: {
          mon: item ? item.days.includes('Monday') : false,
          tue: item ? item.days.includes('Tuesday') : false,
          wed: item ? item.days.includes('Wednesday') : false,
          thu: item ? item.days.includes('Thursday') : false,
          fri: item ? item.days.includes('Friday') : false,
          sat: item ? item.days.includes('Saturday') : false,
          sun: item ? item.days.includes('Sunday') : false,
        },
        useSetpoint: item ? (item.setpoint != null) : false,
        setpointValue: item ? (item.setpoint != null) ? String(item.setpoint) : '24' : '24',
      };
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  async function saveNewProgramming() {
    try {
      // setState({ savingSched: true });
      if (!state.modalEditSchedule) return;
      if (!state.selectedUnitId) return;

      if (!/^[0-2][0-9]:[0-5][0-9]$/.test(state.modalEditSchedule.start_time)) return toast.error(t('erroHorarioInvalido'));
      if (!/^[0-2][0-9]:[0-5][0-9]$/.test(state.modalEditSchedule.end_time)) return toast.error(t('erroHorarioInvalido'));
      const days = [] as ('Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday')[];
      if (state.modalEditSchedule.selectedDays.mon) days.push('Monday');
      if (state.modalEditSchedule.selectedDays.tue) days.push('Tuesday');
      if (state.modalEditSchedule.selectedDays.wed) days.push('Wednesday');
      if (state.modalEditSchedule.selectedDays.thu) days.push('Thursday');
      if (state.modalEditSchedule.selectedDays.fri) days.push('Friday');
      if (state.modalEditSchedule.selectedDays.sat) days.push('Saturday');
      if (state.modalEditSchedule.selectedDays.sun) days.push('Sunday');

      const { info: newScnhedule } = await apiCall('/coolautomation/add-unit-schedule', {
        unitId: state.selectedUnitId,
        isDisabled: !state.modalEditSchedule.active,
        name: state.modalEditSchedule.name,
        powerOnTime: state.modalEditSchedule.start_time, // "23:59"
        powerOffTime: state.modalEditSchedule.end_time, // "23:59"
        setpoint: state.modalEditSchedule.useSetpoint ? Number(state.modalEditSchedule.setpointValue) : null,
        days, // ('Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday')[]
      });
      state.modalEditSchedule = null;
      render();
      toast.success(t('sucessoProgramacaoAdicionada'));
      window.location.reload();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    // setState({ savingSched: false });
  }

  async function onSaveEditClick() {
    try {
      // setState({ savingSched: true });
      if (!state.modalEditSchedule) return;

      if (!/^[0-2][0-9]:[0-5][0-9]$/.test(state.modalEditSchedule.start_time)) return toast.error(t('erroHorarioInvalido'));
      if (!/^[0-2][0-9]:[0-5][0-9]$/.test(state.modalEditSchedule.end_time)) return toast.error(t('erroHorarioInvalido'));
      const days = [] as ('Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday')[];
      if (state.modalEditSchedule.selectedDays.mon) days.push('Monday');
      if (state.modalEditSchedule.selectedDays.tue) days.push('Tuesday');
      if (state.modalEditSchedule.selectedDays.wed) days.push('Wednesday');
      if (state.modalEditSchedule.selectedDays.thu) days.push('Thursday');
      if (state.modalEditSchedule.selectedDays.fri) days.push('Friday');
      if (state.modalEditSchedule.selectedDays.sat) days.push('Saturday');
      if (state.modalEditSchedule.selectedDays.sun) days.push('Sunday');

      const { info: newSchedule } = await apiCall('/coolautomation/alter-unit-schedule', {
        scheduleId: state.modalEditSchedule.scheduleId,
        isDisabled: !state.modalEditSchedule.active,
        name: state.modalEditSchedule.name,
        powerOnTime: state.modalEditSchedule.start_time, // "23:59"
        powerOffTime: state.modalEditSchedule.end_time, // "23:59"
        setpoint: state.modalEditSchedule.useSetpoint ? Number(state.modalEditSchedule.setpointValue) : null,
        days, // ('Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday')[]
      });
      state.modalEditSchedule = null;
      toast.success(t('sucessoProgramacaoAlterada'));
      window.location.reload();
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
    // setState({ savingSched: false });
  }

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const selectedUnit = state.allUnits.find((unit) => unit.id === state.selectedUnitId);
  const mobileWitdh = width < 1650;
  return (
    <>
      {state.loading && <Loader />}
      {!state.loading && (
        <div>
          {(state.showScheds) && (
          <div style={{ zIndex: 3, position: 'sticky' }}>
            <ModalWindow
              style={{
                padding: '0px',
                width: '55%',
                marginBottom: 'auto',
                marginTop: '8%',
                minWidth: '500px',
                zIndex: 5,
              }}
              topBorder
              onClickOutside={() => {
                if (!state.modalEditSchedule) {
                  setState({ showScheds: false });
                }
              }}
            >
              <Bluebar />
              <Flex
                flexWrap="nowrap"
                flexDirection="column"
                alignItems="left"
                width="768px"
                style={{
                  borderRadius: '10px',
                  width: '100%',
                }}
              />
              <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              >
                <span style={{ fontSize: '18px' }}>{`Total: ${(state.selectedScheds?.length) || 0}`}</span>
                <Button
                  variant="primary"
                  style={{ width: 'fit-content', padding: '6px 15px', backgroundColor: '#363BC4' }}
                  onClick={() => {
                    state.showScheds = false;
                    editAddProgramming();
                  }}
                >
                  {t('adicionarProgramacao')}
                </Button>
              </div>
              <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              }}
              >
                {state.selectedScheds?.map((sched) => (
                  <SchedCard
                    key={sched.id}
                    sched={sched}
                    onEdit={() => {
                      state.showScheds = false;
                      editAddProgramming(sched);
                    }}
                    onDelete={() => onDeleteClick(sched)}
                  />
                ))}
              </div>
            </ModalWindow>
          </div>
          )}
          <div style={{ display: 'flex' }}>
            <div style={{ width: mobileWitdh ? '100%' : '50%' }}>
              <div style={{ border: `1px solid ${colors.GreyDefaultCardBorder}`, borderRadius: '10px', padding: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: colors.BlueSecondary,
                    fontWeight: 'bold',
                  }}
                >
                  <div>{t('ambientes')}</div>
                  <div>
                    <span style={{ fontWeight: 'normal' }}>{`${t('total')} `}</span>
                    {state.indoorUnits.length}
                    <span style={{ fontWeight: 'normal' }}>{` ${t('ambientes')}`}</span>
                  </div>
                </div>
                <div
                  style={{
                    border: `1px solid ${colors.GreyDefaultCardBorder}`,
                    borderRadius: '10px',
                    padding: '10px',
                  }}
                >
                  <div style={{
                    overflowY: 'auto', overflowX: 'auto', width: '100%', whiteSpace: 'nowrap', maxHeight: '260px',
                  }}
                  >
                    <UnitsTable>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>{t('nome')}</th>
                          <th style={{ textAlign: 'left', paddingInline: '20px' }}>{t('modo')}</th>
                          <th style={{ textAlign: 'left', paddingInline: '20px' }}>Set</th>
                          <th style={{ textAlign: 'left', paddingInline: '20px' }}>{t('agora')}</th>
                          <th style={{ textAlign: 'left', paddingInline: '20px' }} />
                          <th style={{ textAlign: 'left' }}>{t('status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.indoorUnits.map((unit) => (
                          <UnitRow
                            key={unit.id}
                            checked={state.selectedUnitId === unit.id}
                            onClick={() => {
                              setState({ selectedUnitId: unit.id });
                              selectedSchedules(unit.name);
                            }}
                          >
                            <td>
                              <div>{unit.name}</div>
                            </td>
                            <td style={{ textAlign: 'left', paddingInline: '20px' }}>
                              <ControlButtonIcon
                                alt={`${unit.activeOperationMode}`}
                                src={getOperationModeIcon(unit.activeOperationMode)}
                                style={{ maxHeight: '22px' }}
                              />
                            </td>
                            <td style={{ textAlign: 'left', paddingInline: '20px' }}>
                              <div>
                                {`${unit.activeSetpoint}`}
                                °C
                              </div>
                            </td>
                            <td style={{ textAlign: 'left', paddingInline: '20px' }}>
                              <div>
                                {`${unit.ambientTemperature}`}
                                °C
                              </div>
                            </td>
                            <td style={{ paddingInline: '20px' }}>
                              {unit.schedules && (
                                <ControlButtonIcon
                                  alt="schedule"
                                  src={img_schedule}
                                  style={{ maxHeight: '22px' }}
                                />
                              )}
                            </td>
                            <td>
                              <div>
                                <ToggleSwitch
                                  checked={unit.activeOperationStatus === 1}
                                  onClick={() => setOperationStatus(unit, (unit.activeOperationStatus === 2) ? 1 : 2)}
                                />
                              </div>
                            </td>
                          </UnitRow>
                        ))}
                      </tbody>
                    </UnitsTable>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: colors.BlueSecondary,
                    fontWeight: 'bold',
                    marginTop: '15px',
                  }}
                >
                  <div>{t('condensadoras')}</div>
                  <div>
                    <span style={{ fontWeight: 'normal' }}>{`${t('total')} `}</span>
                    {state.outdoorUnits.length}
                    <span style={{ fontWeight: 'normal' }}>{` ${t('condensadoras')}`}</span>
                  </div>
                </div>
                <div
                  style={{
                    border: `1px solid ${colors.GreyDefaultCardBorder}`,
                    borderRadius: '10px',
                    padding: '10px',
                  }}
                >
                  <div style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: '180px' }}>
                    <UnitsTable>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>{t('nome')}</th>
                          <th style={{ textAlign: 'left' }} />
                        </tr>
                      </thead>
                      <tbody>
                        {state.outdoorUnits.map((unit) => (
                          <UnitRow key={unit.id} checked={state.selectedUnitId === unit.id} onClick={() => { setState({ selectedUnitId: unit.id }); selectedSchedules(unit.name); }}>
                            <td>
                              <div>{unit.name}</div>
                            </td>
                            <td>
                              {unit.schedules && (
                                <ControlButtonIcon
                                  alt="schedule"
                                  src={img_schedule}
                                  style={{ maxHeight: '22px' }}
                                />
                              )}
                            </td>
                          </UnitRow>
                        ))}
                      </tbody>
                    </UnitsTable>
                  </div>
                </div>
              </div>
            </div>
            {(selectedUnit && (selectedUnit.type === 1)) && (
              <div style={{ width: '50%', paddingLeft: '40px', fontWeight: 'bold' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ paddingBottom: '15px' }}>
                    <div>{t('unidade')}</div>
                    <div style={{ fontSize: '130%' }}>{props.devInfo.UNIT_NAME}</div>
                  </div>
                  <div>
                    <div>{t('maquina')}</div>
                    <div style={{ fontSize: '130%' }}>{selectedUnit.name}</div>
                  </div>
                  <ControlButton
                    style={{ alignSelf: 'end', backgroundColor: onOffBackgroundColor(selectedUnit.activeOperationStatus) }}
                    onClick={() => setOperationStatus(selectedUnit!, (selectedUnit!.activeOperationStatus === 2) ? 1 : 2)}
                  >
                    <ControlButtonIcon alt="on_off" src={getOperationStatusIcon(selectedUnit.activeOperationStatus)} />
                  </ControlButton>
                </div>
                <div>
                  <div>{t('externo')}</div>
                  <div>
                    <span style={{ fontSize: '130%' }}>
                      {(state.siteTemprt != null) ? state.siteTemprt : '-'}
                    </span>
                    {(state.siteTemprt != null) && (
                      <span style={{ color: colors.Grey200 }}> °C</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '15px 0' }}>
                  <div
                    style={{
                      height: '230px',
                      width: '230px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: '0',
                        top: '0',
                      }}
                    >
                      <Dial temperature={Number(selectedUnit.activeSetpoint)} />
                    </div>
                    <div style={{ zIndex: 1 }}>
                      <div style={{ textAlign: 'center' }}>Setpoint</div>
                      <div style={{ textAlign: 'center', display: 'flex', alignItems: 'baseline' }}>
                        <div style={{ alignSelf: 'flex-end', marginRight: '5px' }}>
                          <div
                            style={{
                              border: '8px solid transparent',
                              borderBottomColor: 'black',
                              cursor: 'pointer',
                              marginBottom: '10px',
                            }}
                            onClick={() => changeSetpoint(selectedUnit!.activeSetpoint + 1)}
                          />
                          <div
                            style={{
                              border: '8px solid transparent',
                              borderTopColor: 'black',
                              cursor: 'pointer',
                              marginBottom: '4px',
                            }}
                            onClick={() => changeSetpoint(selectedUnit!.activeSetpoint - 1)}
                          />
                        </div>
                        <span style={{ fontSize: '240%' }}>{selectedUnit.activeSetpoint}</span>
                        <span style={{ color: colors.Grey200 }}>&nbsp;°C</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>{t('agora')}</div>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '130%' }}>{selectedUnit.ambientTemperature}</span>
                        <span style={{ color: colors.Grey200 }}> °C</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'flex' }}>
                    <ControlButton
                      onClick={onClickMode}
                      style={{ margin: '0 10px' }}
                    >
                      <ControlButtonIcon alt="mode" src={getOperationModeIcon(selectedUnit.activeOperationMode)} />
                    </ControlButton>
                    {state.floatingControlMode && (
                      <SelectContainer style={{ left: state.floatingControlMode.x, top: state.floatingControlMode.y }}>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeOperationMode === 0} onClick={() => setOperationMode(0)}>
                            <ControlButtonIcon alt="cool" src={img_mode_cool} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeOperationMode === 1} onClick={() => setOperationMode(1)}>
                            <ControlButtonIcon alt="heat" src={img_mode_heat} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeOperationMode === 2} onClick={() => setOperationMode(2)}>
                            <ControlButtonIcon alt="auto" src={img_mode_auto} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeOperationMode === 3} onClick={() => setOperationMode(3)}>
                            <ControlButtonIcon alt="dry" src={img_mode_dry} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeOperationMode === 5} onClick={() => setOperationMode(5)}>
                            <ControlButtonIcon alt="fan" src={img_mode_fan} />
                          </ControlButton>
                        </div>
                      </SelectContainer>
                    )}

                    <ControlButton
                      onClick={onClickFan}
                      style={{ margin: '0 10px' }}
                    >
                      <ControlButtonIcon alt="fan" src={getFanModeIcon(selectedUnit.activeFanMode)} />
                    </ControlButton>
                    {state.floatingControlFan && (
                      <SelectContainer style={{ left: state.floatingControlFan.x, top: state.floatingControlFan.y }}>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeFanMode === 4} onClick={() => setFanMode(4)}>
                            <ControlButtonIcon alt="high" src={img_fan_4_high} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeFanMode === 2} onClick={() => setFanMode(2)}>
                            <ControlButtonIcon alt="fan_3" src={img_fan_3} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeFanMode === 1} onClick={() => setFanMode(1)}>
                            <ControlButtonIcon alt="fan_2" src={img_fan_2} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeFanMode === 0} onClick={() => setFanMode(0)}>
                            <ControlButtonIcon alt="low" src={img_fan_1_low} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeFanMode === 3} onClick={() => setFanMode(3)}>
                            <ControlButtonIcon alt="auto" src={img_fan_auto} />
                          </ControlButton>
                        </div>
                      </SelectContainer>
                    )}

                    <ControlButton
                      onClick={onClickSwing}
                      style={{ margin: '0 10px' }}
                    >
                      <ControlButtonIcon alt="swing" src={getSwingModeIcon(selectedUnit.activeSwingMode)} />
                    </ControlButton>
                    {state.floatingControlSwing && (
                      <SelectContainer style={{ left: state.floatingControlSwing.x, top: state.floatingControlSwing.y }}>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeSwingMode === 4} onClick={() => setSwingMode(4)}>
                            <ControlButtonIcon alt="high" src={img_swing_5_high} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeSwingMode === 1} onClick={() => setSwingMode(1)}>
                            <ControlButtonIcon alt="swing_4" src={img_swing_4} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeSwingMode === 2} onClick={() => setSwingMode(2)}>
                            <ControlButtonIcon alt="swing_3" src={img_swing_3} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeSwingMode === 3} onClick={() => setSwingMode(3)}>
                            <ControlButtonIcon alt="swing_2" src={img_swing_2} />
                          </ControlButton>
                        </div>
                        <div>
                          <ControlButton noBorder isActive={selectedUnit.activeSwingMode === 0} onClick={() => setSwingMode(0)}>
                            <ControlButtonIcon alt="low" src={img_swing_1_low} />
                          </ControlButton>
                        </div>
                      </SelectContainer>
                    )}

                    <NotyIconStyle>
                      {state.selectedScheds?.length ? <NotyNumStyle>{state.selectedScheds.length}</NotyNumStyle> : null}
                      <ControlButton
                        onClick={() => showScheds()}
                        style={{ margin: '0 10px' }}
                      >
                        {state.loadingSchedule
                          ? <Loader />
                          : <ControlButtonIcon alt={t('programacao')} src={img_schedule} />}
                      </ControlButton>
                    </NotyIconStyle>
                  </div>
                </div>
              </div>
            )}

            {(selectedUnit && (selectedUnit.type === 2)) && (
            <div style={{
              width: '50%', paddingLeft: '40px', fontWeight: 'bold',
            }}
            >

              <div style={{
                display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center',
              }}
              >
                <NotyIconStyle>
                  {state.selectedScheds?.length ? <NotyNumStyle>{state.selectedScheds.length}</NotyNumStyle> : null}
                  <ControlButton
                    onClick={() => showScheds()}
                    style={{ margin: '0 10px' }}
                  >
                    {state.loadingSchedule
                      ? <Loader />
                      : <ControlButtonIcon alt={t('programacao')} src={img_schedule} />}
                  </ControlButton>
                </NotyIconStyle>
              </div>
            </div>
            )}
          </div>

          {state.loadingTelemetry && <Loader />}
          {(selectedUnit && state.unitLastTelemetry) && (
            <div>
              <br />
              <h2>{t('informacoesGerais')}</h2>
              <Card>
                <h3>{selectedUnit.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {state.unitLastTelemetry.map((varItem) => (
                    <InfoCellWrapper key={varItem.name}>
                      <InfoCellTitle>{varItem.name}</InfoCellTitle>
                      <InfoCellValueWrapper>
                        <InfoCellValue>{varItem.y}</InfoCellValue>
                        <InfoCellUnit>
                          &nbsp;
                          {varItem.unit}
                        </InfoCellUnit>
                      </InfoCellValueWrapper>
                    </InfoCellWrapper>
                  ))}
                </div>
              </Card>
            </div>
          )}
          {(state.modalEditSchedule) && (
            <ModalWindow topBorder onClickOutside={() => { setState({ modalEditSchedule: null }); }}>
              <CoolAutomationSchedForm
                modalEditSchedule={state.modalEditSchedule}
                onNewConfirm={saveNewProgramming}
                onEditConfirm={onSaveEditClick}
                onCancel={() => { setState({ modalEditSchedule: null }); }}
              />
            </ModalWindow>
          )}
          {(state.modalSchedulesList && !state.modalEditSchedule) && (
            <ModalWindow topBorder onClickOutside={() => { setState({ modalSchedulesList: null }); }}>
              <div>
                {state.modalSchedulesList.list.map((item) => (
                  <div key={item.id} style={{ cursor: 'pointer' }} onClick={() => editAddProgramming(item)}>
                    {item.name}
                  </div>
                ))}
                <div style={{ cursor: 'pointer' }} onClick={() => editAddProgramming()}>
                  {`+ ${t('botaoAdicionar')}`}
                </div>
              </div>
            </ModalWindow>
          )}
        </div>
      )}
    </>
  );
}

export function parseCoolAutVarName(name: string) {
  const matched = name && name.match(/^(\*)?([^[]+)( \[([^\]]+)\])?$/);
  let unit = undefined as undefined|string;
  if (matched) {
    const [, ast, namePart, , unitPart] = matched;
    name = namePart + (ast || '');
    unit = unitPart;
    if (unit === '-') unit = undefined;
  }
  return { name, unit };
}

export function CoolAutomationSchedForm(props: {
  modalEditSchedule: {
    addEdit: 'Add'|'Edit'
    name: string
    active: boolean
    start_time: string
    start_time_error: string
    end_time: string
    end_time_error: string
    selectedDays: {
      mon: boolean
      tue: boolean
      wed: boolean
      thu: boolean
      fri: boolean
      sat: boolean
      sun: boolean
    }
    useSetpoint: boolean
    setpointValue: string
  },
  onNewConfirm?: () => void
  onEditConfirm?: () => void
  onCancel: () => void
}) {
  const [, render] = useStateVar({});
  const { t } = useTranslation();

  const isEdit = props.modalEditSchedule.addEdit === 'Edit';

  return (
    <div>
      <div style={{ fontWeight: 'bold', fontSize: '120%' }}>{`${isEdit ? t('editar') : t('adicionar')} Programação`}</div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>{t('nome')}</div>
        <Input
          value={props.modalEditSchedule.name}
          onChange={(e) => { props.modalEditSchedule.name = e.target.value; render(); }}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>{t('status')}</div>
        <div style={{ display: 'flex' }}>
          {props.modalEditSchedule.active ? t('ativo') : t('desativado')}
          <ToggleSwitch
            style={{ marginLeft: '12px' }}
            checked={props.modalEditSchedule.active}
            onClick={() => { props.modalEditSchedule.active = !props.modalEditSchedule.active; render(); }}
          />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 'bold',
          marginTop: '10px',
        }}
      >
        <div>
          <div>{t('horarioInicio')}</div>
          <Input
            style={{ width: '100px', padding: '5px', minHeight: '0' }}
            value={props.modalEditSchedule.start_time}
            error={props.modalEditSchedule.start_time_error}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { props.modalEditSchedule!.start_time = e.target.value; render(); }}
          />
        </div>
        <div>
          <div>{t('horarioTermino')}</div>
          <Input
            style={{ width: '100px', padding: '5px', minHeight: '0' }}
            value={props.modalEditSchedule.end_time}
            error={props.modalEditSchedule.end_time_error}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { props.modalEditSchedule!.end_time = e.target.value; render(); }}
          />
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontWeight: 'bold' }}>{t('selecioneOsDias')}</div>
        <div style={{ display: 'flex', paddingTop: '10px', fontSize: '90%' }}>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays.sun} onClick={() => { props.modalEditSchedule.selectedDays.sun = !props.modalEditSchedule.selectedDays.sun; render(); }}>DOM</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays.mon} onClick={() => { props.modalEditSchedule.selectedDays.mon = !props.modalEditSchedule.selectedDays.mon; render(); }}>SEG</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays.tue} onClick={() => { props.modalEditSchedule.selectedDays.tue = !props.modalEditSchedule.selectedDays.tue; render(); }}>TER</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays.wed} onClick={() => { props.modalEditSchedule.selectedDays.wed = !props.modalEditSchedule.selectedDays.wed; render(); }}>QUA</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays.thu} onClick={() => { props.modalEditSchedule.selectedDays.thu = !props.modalEditSchedule.selectedDays.thu; render(); }}>QUI</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays.fri} onClick={() => { props.modalEditSchedule.selectedDays.fri = !props.modalEditSchedule.selectedDays.fri; render(); }}>SEX</WeekDayButton>
          <WeekDayButton checked={props.modalEditSchedule.selectedDays.sat} onClick={() => { props.modalEditSchedule.selectedDays.sat = !props.modalEditSchedule.selectedDays.sat; render(); }}>SAB</WeekDayButton>
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ fontWeight: 'bold' }}>Setpoint &nbsp;</div>
          <ToggleSwitch
            checked={props.modalEditSchedule.useSetpoint}
            onClick={() => { props.modalEditSchedule.useSetpoint = !props.modalEditSchedule.useSetpoint; render(); }}
          />
        </div>
        {(props.modalEditSchedule.useSetpoint) && (
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <div style={{ alignSelf: 'flex-end', marginRight: '5px' }}>
              <div
                style={{
                  border: '8px solid transparent',
                  borderBottomColor: 'black',
                  cursor: 'pointer',
                  marginBottom: '10px',
                }}
                onClick={() => { props.modalEditSchedule.setpointValue = String(Number(props.modalEditSchedule.setpointValue) + 1); render(); }}
              />
              <div
                style={{
                  border: '8px solid transparent',
                  borderTopColor: 'black',
                  cursor: 'pointer',
                  marginBottom: '4px',
                }}
                onClick={() => { props.modalEditSchedule.setpointValue = String(Number(props.modalEditSchedule.setpointValue) - 1); render(); }}
              />
            </div>
            <div style={{ fontSize: '200%', fontWeight: 'bold' }}>{props.modalEditSchedule.setpointValue}</div>
            <div style={{ color: 'grey' }}>&nbsp;°C</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="primary" style={{ width: '150px' }} onClick={isEdit ? props.onEditConfirm : props.onNewConfirm}>
          {isEdit ? t('salvar') : t('adicionar')}
        </Button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={props.onCancel}>{t('cancelar')}</span>
      </div>
    </div>
  );
}

function Dial(props: { temperature: number }) {
  const min = 10;
  const max = 30;
  let percentage = (props.temperature == null) ? NaN : ((props.temperature - min) / (max - min));
  if (percentage > 1) percentage = 1;
  if (percentage < 0) percentage = 0;
  if (!Number.isFinite(percentage)) percentage = NaN;

  function onSvgClick(event) {
    let el = event.target;
    while (el.tagName.toLowerCase() !== 'svg') {
      if (!el.parentElement) return;
      if (!el.parentElement.tagName) return;
      el = el.parentElement;
    }
    const rect = el.getBoundingClientRect();
    console.log('DBG013', rect, event);
  }

  return (
    <svg
      width="230"
      height="230"
      viewBox="0 0 43.93095 43.93095"
      onClick={onSvgClick}
    >
      <g transform="translate(-9.1068883,-56.072787)">
        <path
          style={{
            fill: 'none',
            stroke: '#d9d9d9',
            strokeWidth: 1.05833,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeMiterlimit: 4,
            strokeDasharray: 'none',
            strokeOpacity: 1,
          }}
          transform="scale(-1)"
          d="m -26.111271,-92.230659 a 15.034513,15.034513 0 0 1 9.857829,16.729361 15.034513,15.034513 0 0 1 -14.861396,12.49749 15.034513,15.034513 0 0 1 -14.790544,-12.581262 15.034513,15.034513 0 0 1 9.952198,-16.673395"
        />
        {(!Number.isNaN(percentage)) && (
          <g transform={`rotate(${percentage * 317 - 20.4},31.072363,78.038261)`}>
            <circle
              style={{
                fill: 'none',
                stroke: '#bbbbbb',
                strokeWidth: 0.785182,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
                strokeOpacity: 0.00765806,
              }}
              transform="scale(-1)"
              cx="-31.072363"
              cy="-78.038261"
              r="15.034513"
            />
            <circle
              style={{
                fill: '#363bc4',
                fillOpacity: 1,
                stroke: 'none',
                strokeWidth: 2.96762,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
                strokeOpacity: 1,
              }}
              cx="20.919857"
              cy="89.219666"
              r="1.2549769"
            />
          </g>
        )}
        <circle
          style={{
            fill: 'none',
            fillOpacity: 1,
            stroke: '#2d81ff',
            strokeWidth: 3.92591,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeMiterlimit: 4,
            strokeDasharray: 'none',
            strokeOpacity: 1,
          }}
          cx="31.072363"
          cy="78.038261"
          r="20.00252"
        />
        <rect
          style={{
            fill: '#2d81ff',
            fillOpacity: 1,
            stroke: 'none',
            strokeWidth: 0.252035,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeMiterlimit: 4,
            strokeDasharray: 'none',
          }}
          width="1.7076257"
          height="1.7076257"
          x="27.262398"
          y="91.697784"
          ry="0.54493499"
        />
        <rect
          style={{
            fill: '#e00030',
            fillOpacity: 1,
            stroke: 'none',
            strokeWidth: 0.252035,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeMiterlimit: 4,
            strokeDasharray: 'none',
          }}
          width="1.7076257"
          height="1.7076257"
          x="33.055614"
          y="91.697784"
          ry="0.54493499"
        />
      </g>
    </svg>
  );
}

export function SchedCard(props: {
  sched: any,
  onEdit: () => void
  onDelete: () => void
}): JSX.Element {
  const [, render] = useStateVar({});
  const { t } = useTranslation();

  const { sched, onEdit, onDelete } = props;
  const days = sched.days;

  return (
    <SchedCardContainer>
      <Sidebar active={sched.isDisabled ? '0' : '1'} />
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold' }}>{sched.name}</span>
            <div style={{ display: 'flex' }}>
              <Button
                style={{
                  border: '0px',
                  backgroundColor: 'white',
                  padding: '0px',
                  marginRight: '5px',
                  width: 'fit-content',
                }}
                onClick={onEdit}
              >
                <EditIcon color={colors.Blue300} />
              </Button>
              <Button
                style={{
                  border: '0px',
                  backgroundColor: 'white',
                  padding: '0px',
                  width: 'fit-content',
                }}
                onClick={onDelete}
              >
                <SmallTrashIcon color="red" />
              </Button>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 'bold' }}>{t('status')}</div>
            <div style={{ display: 'flex' }}>
              {sched.isDisabled ? t('inativo') : t('ativo')}
            </div>
          </div>
        </div>

        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: colors.LightGrey_v3,
          borderRadius: '10px',
          margin: '20px 0px 20px 0px',
        }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{t('horarioDeInicio')}</span>
                  <span>{sched.powerOnTime ? formatHours(sched.powerOnTime) : '-'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{t('horarioDeFim')}</span>
                  <span>{sched.powerOffTime ? formatHours(sched.powerOffTime) : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700 }}>Setpoint</div>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
              <div style={{ fontSize: '300%', fontWeight: 'bold' }}>{sched.setpoint}</div>
              <div style={{ color: 'grey' }}>&nbsp;°C</div>
            </div>
          </div>

        </div>
        <div style={{ marginTop: '10px' }}>
          {days && (
            <div style={{ display: 'flex', paddingTop: '10px', fontSize: '90%' }}>
              <WeekDayButton checked={days.find((e) => e === 'Sunday')}>{t('diaDom').toLocaleUpperCase()}</WeekDayButton>
              <WeekDayButton checked={days.find((e) => e === 'Monday')}>{t('diaSeg').toLocaleUpperCase()}</WeekDayButton>
              <WeekDayButton checked={days.find((e) => e === 'Tuesday')}>{t('diaTer').toLocaleUpperCase()}</WeekDayButton>
              <WeekDayButton checked={days.find((e) => e === 'Wednesday')}>{t('diaQua').toLocaleUpperCase()}</WeekDayButton>
              <WeekDayButton checked={days.find((e) => e === 'Thursday')}>{t('diaQui').toLocaleUpperCase()}</WeekDayButton>
              <WeekDayButton checked={days.find((e) => e === 'Friday')}>{t('diaSex').toLocaleUpperCase()}</WeekDayButton>
              <WeekDayButton checked={days.find((e) => e === 'Saturday')}>{t('diaSab').toLocaleUpperCase()}</WeekDayButton>
            </div>
          )}
        </div>
      </div>
    </SchedCardContainer>
  );
}

const formatHours = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const min = minutes % 60;
  const textHours = (`00${hours}`).slice(-2);
  const textMinutes = (`00${min}`).slice(-2);

  return `${textHours}:${textMinutes}`;
};

const InfoCellWrapper = styled.div`
  padding: 20px 40px;
  width: 300px;
`;

const InfoCellValueWrapper = styled.div`
  line-height: initial;
`;

const InfoCellValue = styled.span`
  font-size: 170%;
  font-weight: bold;
`;

const InfoCellUnit = styled.span`
  color: ${colors.Grey200};
  font-size: 120%;
`;

const InfoCellTitle = styled.div`
  font-weight: bold;
  white-space: wrap;
`;

const UnitsTable = styled.table`
  width: 100%;
  & thead th {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
  }
`;

const WeekDayButton = styled.div<{ checked: boolean }>`
  padding: 8px 10px;
  border-radius: 5px;
  margin: 5px;
  background-color: ${({ checked }) => (checked ? 'blue' : 'lightgrey')};
  color: ${({ checked }) => (checked ? 'white' : 'black')};
`;

const ControlButtonIcon = styled.img`
  max-width: 100%;
`;

const ControlButton = styled.div<{ isActive?: boolean, noBorder?: boolean }>`
  border: 1px solid ${colors.GreyDefaultCardBorder};
  ${({ noBorder }) => (noBorder ? 'border: 0;' : '')}
  border-radius: 10px;
  width: 70px;
  height: 70px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ isActive }) => (isActive ? 'border: 2px solid blue;' : '')}
`;

const SelectContainer = styled.div`
  position: fixed;
  background: white;
  border: 1px solid #d3d3d3;
  border-radius: 10px;
`;

const UnitRow = styled.tr<{ checked?: boolean }>`
  ${({ checked }) => (checked ? 'border: 2px solid blue;' : '')}
  height: 40px;
`;

const UnitRowA = styled.tr<{ checked?: boolean }>`
  td {
    padding: 8px;
    &:first-child {
      border-left: 1px solid ${colors.GreyDefaultCardBorder};
    }
    &:last-child {
      border-right: 1px solid ${colors.GreyDefaultCardBorder};
    }
  }
  &:first-child td {
    border-top: 1px solid ${colors.GreyDefaultCardBorder};
    &:first-child {
      border-top-left-radius: 10px;
    }
    &:last-child {
      border-top-right-radius: 10px;
    }
  }
  &:last-child td {
    border-bottom: 1px solid ${colors.GreyDefaultCardBorder};
    &:first-child {
      border-bottom-left-radius: 10px;
    }
    &:last-child {
      border-bottom-right-radius: 10px;
    }
  }
  ${({ checked }) => (checked ? 'border: 2px solid blue;' : '')}
`;

const UnitRowB = styled.tr`
  td {
    & div {
      padding: 15px;
    }
    &:first-child div {
      border-left: 1px solid ${colors.GreyDefaultCardBorder};
    }
    &:last-child div {
      border-right: 1px solid ${colors.GreyDefaultCardBorder};
    }
  }
  &:first-child td {
    & div {
      border-top: 1px solid ${colors.GreyDefaultCardBorder};
    }
    &:first-child div {
      border-top-left-radius: 10px;
    }
    &:last-child div {
      border-top-right-radius: 10px;
    }
  }
  &:last-child td {
    & div {
      border-bottom: 1px solid ${colors.GreyDefaultCardBorder};
    }
    &:first-child div {
      border-bottom-left-radius: 10px;
    }
    &:last-child div {
      border-bottom-right-radius: 10px;
    }
  }
`;

const Card = styled.div`
  margin-top: 15px;
  border-radius: 8px;
  padding: 12px 24px 32px;
  border: 1px solid ${colors.GreyDefaultCardBorder};
  border-top: 10px solid ${colors.BlueSecondary};
`;
