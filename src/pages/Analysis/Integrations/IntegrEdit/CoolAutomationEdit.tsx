import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
  ActionButton,
  ModalWindow,
  ToggleSwitch,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall, ApiResps } from '~/providers';
import { colors } from '~/styles/colors';
import { DeleteOutlineIcon, EditIcon } from '~/icons';

import { convertCoolAutomationSchedTime, CoolAutomationSchedForm, ScheduleInfo } from '../IntegrRealTime/CoolAutomationRealTime';
import { useTranslation } from 'react-i18next';

export const CoolAutomationEdit = (props: {
  schedInfo: ApiResps['/get-integration-info']['coolautomation']
}): JSX.Element => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
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

  async function onDeleteClick(item: ScheduleInfo) {
    try {
      if (!window.confirm(t('temCertezaQueDesejaExcluir'))) return;
      // setState({ savingSched: true });
      await apiCall('/coolautomation/delete-unit-schedule', {
        scheduleId: item.id,
      });
      toast.success(t('sucessoProgramacaoExcluida'));
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

  function editAddProgramming(item: ScheduleInfo) {
    try {
      state.modalEditSchedule = {
        addEdit: item ? 'Edit' : 'Add',
        scheduleId: item && item.id,
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

  async function switchScheduleEnabled(item: ScheduleInfo) {
    try {
      const newState = !item.isDisabled;
      const { info: newSchedule } = await apiCall('/coolautomation/alter-unit-schedule', {
        scheduleId: item.id,
        isDisabled: newState,
      });
      item.isDisabled = newSchedule.isDisabled;
      render();
    } catch (err) { console.log(err); toast.error(t('houveErro')); }
  }

  return (
    <div>
      <div style={{ fontWeight: 'bold', paddingBottom: '35px', fontSize: '1.25em' }}>{t('programacoesAdicionadas')}</div>
      {(props.schedInfo && (props.schedInfo.schedules.length === 0)) && (
        <div>(nenhuma)</div>
      )}
      {(props.schedInfo && (props.schedInfo.schedules.length > 0)) && (
        <CoolAutomationSchedTable
          schedInfo={props.schedInfo}
          onDeleteClick={onDeleteClick}
          onEditClick={editAddProgramming}
          onSwitchClick={switchScheduleEnabled}
        />
      )}
      {(state.modalEditSchedule) && (
        <ModalWindow topBorder onClickOutside={() => { setState({ modalEditSchedule: null }); }}>
          <CoolAutomationSchedForm
            modalEditSchedule={state.modalEditSchedule}
            onEditConfirm={onSaveEditClick}
            onCancel={() => { setState({ modalEditSchedule: null }); }}
          />
        </ModalWindow>
      )}
    </div>
  );
};

export const CoolAutomationSchedTable = (props: {
  schedInfo: ApiResps['/get-integration-info']['coolautomation']
  onDeleteClick?: (item: ScheduleInfo) => void
  onEditClick?: (item: ScheduleInfo) => void
  onSwitchClick?: (item: ScheduleInfo) => void
}): JSX.Element => {
  const { t } = useTranslation();
  const hasActions = !!(props.onDeleteClick || props.onEditClick);
  const daysTransl: { [k: string]: string } = {
    Monday: t('diaSeg').toLocaleUpperCase(),
    Tuesday: t('diaTer').toLocaleUpperCase(),
    Wednesday: t('diaQua').toLocaleUpperCase(),
    Thursday: t('diaQui').toLocaleUpperCase(),
    Friday: t('diaSex').toLocaleUpperCase(),
    Saturday: t('diaSab').toLocaleUpperCase(),
    Sunday: t('diaDom').toLocaleUpperCase(),
  };
  return (
    <div>
      {(props.schedInfo) && (
        <TableScheds style={{ color: colors.Grey400, width: '100%' }}>
          <thead>
            <tr>
              <th>{t('nome')}</th>
              <th>{t('ambiente')}</th>
              <th>{t('status')}</th>
              <th>{t('horarioDeInicio')}</th>
              <th>{t('horarioTermino')}</th>
              <th>{t('temperatura')}</th>
              <th>{t('programacao')}</th>
              {hasActions && <th>{t('acoes')}</th>}
            </tr>
          </thead>
          <tbody>
            {props.schedInfo.schedules.map((rowVar) => (
              <tr key={rowVar.id}>
                <td>{rowVar.name || '-'}</td>
                <td>{rowVar.unitName || rowVar.unit || '-'}</td>
                <td>
                  {props.onSwitchClick && (
                    <ToggleSwitch
                      checked={rowVar.isDisabled !== false}
                      onClick={() => { props.onSwitchClick!(rowVar); }}
                      style={{ marginRight: '10px' }}
                    />
                  )}
                  {(rowVar.isDisabled === false) ? t('ativo') : (rowVar.isDisabled === true) ? t('inativo') : '-'}
                </td>
                <td>{convertCoolAutomationSchedTime(rowVar.powerOnTime) || '-'}</td>
                <td>{convertCoolAutomationSchedTime(rowVar.powerOffTime) || '-'}</td>
                <td>{(rowVar.setpoint == null) ? '-' : `${rowVar.setpoint}°C`}</td>
                <td>{(rowVar.days && rowVar.days.map((x) => daysTransl[x] || x).join('-')) || '-'}</td>
                {hasActions && (
                  <td>
                    {props.onEditClick && (
                      <ActionButton onClick={() => props.onEditClick!(rowVar)} variant="blue-inv">
                        <EditIcon color={colors.LightBlue} />
                      </ActionButton>
                    )}
                    {props.onDeleteClick && (
                      <ActionButton onClick={() => props.onDeleteClick!(rowVar)} variant="red-inv">
                        <DeleteOutlineIcon colors={colors.Red} />
                      </ActionButton>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </TableScheds>
      )}
    </div>
  );
};

export const TableScheds = styled.table`
  white-space: nowrap;
  border-collapse: collapse;
  & tbody {
    & tr {
      height: 35px;
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    & td {
      text-align: left;
      color: ${colors.DarkGrey};
      padding: 0 10px;
      font-size: 0.71rem
    }
  }
  & thead {
    & tr {
      height: 40px;
      display: table-row;
    }
    & th {
      flex: 1;
      justify-content: space-between;
      align-items: center;
      text-align: left;
      padding: 0 10px;
      word-break: normal;
      border-bottom: solid 1px ${colors.Grey};
      font-size: 0.75rem;
    }
  }
`;
