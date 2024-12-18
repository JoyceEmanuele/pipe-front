import { ChangeEvent, useMemo } from 'react';

// import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import {
  Button, Loader, Input, RadioButton, Checkbox,
} from 'components';
import { getDayProgDesc } from 'helpers/scheduleData';
import { useStateVar } from 'helpers/useStateVar';
import {
  TrashIcon, EditIcon, CheckboxIcon, CloseIcon, AddIcon,
} from 'icons';
import { apiCall } from 'providers';
import { DayProg, FullProg_v4 } from 'providers/types';
import { colors } from 'styles/colors';

const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const dayName = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom',
};

// programmingData = {
//   mon: { permission: "allow", start: "05:30", end: "20:00" },
//   exceptions: {
//     "2020-12-25": { permission: "forbid", start: "00:00", end: "23:59" }
//   },
//   ventilation: 5,
// }

export const FullProgEdit = (props: {
  fullProg: FullProg_v4|null
  onConfirm: (fullProg: FullProg_v4) => void
  onChange: (fullProg: FullProg_v4) => void
  readOnly?: boolean
  devType?: string
  devConfigOpts?: JSX.Element|null
  multiple?: boolean
}): JSX.Element => {
  const { fullProg, onConfirm, onChange } = props;
  const [state, render, setState] = useStateVar(() => {
    const state = {
      isSending: false,
      isLoading: false,
      activePage: 'List',
      editingVentilation: false,
      editingSetpointDut: false,
      submittingVentilation: false,
      ventTime: {} as { begin: string, end: string },
      programmingData: { week: {}, exceptions: {} } as FullProg_v4,
      formValues: {
        allowForbid: 'allow' as 'allow'|'forbid',
        start_time: '',
        end_time: '',
        ruleException: 'rule',
        selectedDays: [] as string[],
        exception_date: '',
        ventInput: '',
        setpointDut: 0,
        clearProg: false,
      },
      formErrors: {
        start_time: '',
        end_time: '',
        days: '',
      },
      holidaysList: [] as {
        DAT_FER: string
        DESC_FER: string
        dateDMY?: string
        checked?: boolean
      }[],
    };

    Promise.resolve().then(async () => {
      const { list } = await apiCall('/get-holidays-list', {});
      state.holidaysList = list || [];
      state.holidaysList.forEach((row) => { row.dateDMY = `${row.DAT_FER.substr(8, 2)}/${row.DAT_FER.substr(5, 2)}/${row.DAT_FER.substr(0, 4)}`; });
    }).catch(console.log);

    return state;
  });

  useMemo(() => {
    if (fullProg) {
      if (!fullProg.week) fullProg.week = {};
      if (!fullProg.exceptions) fullProg.exceptions = {};
      state.programmingData = { week: {}, exceptions: {} };
      const programmingData = state.programmingData;

      let ventilation = (fullProg.ventTime && Number(fullProg.ventTime.end || fullProg.ventTime.begin));
      if (ventilation) {
        programmingData.ventTime = { begin: ventilation, end: ventilation };
      } else {
        ventilation = 0;
      }
      state.formValues.ventInput = (ventilation && String(ventilation)) || '';

      if (fullProg.week.mon) state.programmingData.week.mon = { ...fullProg.week.mon };
      if (fullProg.week.tue) state.programmingData.week.tue = { ...fullProg.week.tue };
      if (fullProg.week.wed) state.programmingData.week.wed = { ...fullProg.week.wed };
      if (fullProg.week.thu) state.programmingData.week.thu = { ...fullProg.week.thu };
      if (fullProg.week.fri) state.programmingData.week.fri = { ...fullProg.week.fri };
      if (fullProg.week.sat) state.programmingData.week.sat = { ...fullProg.week.sat };
      if (fullProg.week.sun) state.programmingData.week.sun = { ...fullProg.week.sun };
      for (const [date, dayProg] of Object.entries(fullProg.exceptions || {})) {
        if (!state.programmingData.exceptions) state.programmingData.exceptions = {};
        state.programmingData.exceptions[date] = {
          ...dayProg,
          dateDMY: `${date.substr(8, 2)}/${date.substr(5, 2)}/${date.substr(0, 4)}`,
        };
      }
    }
    if (onChange) { onChange(state.programmingData); }
  }, [fullProg]);

  const { formValues } = state;
  const { formErrors } = state;
  const { programmingData } = state;

  function set_exception_date(v) { formValues.exception_date = v; formValues.clearProg = false; render(); }
  function set_allowForbid(v) { formValues.allowForbid = v; formValues.clearProg = false; render(); }
  function set_clearProg() { formValues.clearProg = true; render(); }

  function editDayProg(item, day) {
    state.editingVentilation = false;
    state.editingSetpointDut = false;
    formValues.allowForbid = (item && item.permission) || 'allow';
    formValues.start_time = (item && item.start) || '';
    formValues.end_time = (item && item.end) || '';
    if ((!day) || day.length === 'YYYY-MM-DD'.length) {
      formValues.exception_date = '';
      changeExceptionMode('exception');
    } else {
      formValues.selectedDays = day ? [day] : [];
      changeExceptionMode('rule');
    }
    state.activePage = 'Edit';
    render();
  }
  function removeProg(day) {
    if (!window.confirm('Tem certeza?')) return;
    if (!programmingData.exceptions) programmingData.exceptions = {};
    delete programmingData.exceptions[day];
    delete programmingData[day];
    delete programmingData.week[day];

    render();
    if (onChange) { onChange(programmingData); }
  }

  function handleSelectDay(day) {
    if (formValues.selectedDays.includes(day)) {
      formValues.selectedDays = formValues.selectedDays.filter((x) => x !== day);
    } else {
      formValues.selectedDays.push(day);
    }
    changeExceptionMode('rule');
    render();
  }

  function changeExceptionMode(newMode) {
    if (newMode === 'rule') {
      formValues.ruleException = 'rule';
      formValues.exception_date = '';
    } else {
      formValues.ruleException = 'exception';
      formValues.selectedDays = [];
      for (const row of state.holidaysList) {
        row.checked = false;
      }
    }
    formErrors.days = '';
  }

  function validateForm() {
    let start_index = null as null|number;
    if (!/^\d\d:\d\d$/.test(formValues.start_time) && !formValues.clearProg) {
      formErrors.start_time = 'O campo de tempo inicial é obrigatório';
    } else {
      const horas = Number(formValues.start_time.substr(0, 2));
      const minutos = Number(formValues.start_time.substr(3, 2));
      if (!(horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59)) {
        formErrors.start_time = 'Valor inválido';
      } else {
        formErrors.start_time = '';
        start_index = horas * 60 + minutos;
      }
    }
    if (!/^\d\d:\d\d$/.test(formValues.end_time) && !formValues.clearProg) {
      formErrors.end_time = 'O campo de tempo final é obrigatório';
    } else {
      const horas = Number(formValues.end_time.substr(0, 2));
      const minutos = Number(formValues.end_time.substr(3, 2));
      if (!(horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59)) {
        formErrors.end_time = 'Valor inválido';
      } else {
        const end_index = horas * 60 + minutos;
        if (start_index != null && !(end_index >= start_index)) {
          formErrors.end_time = 'Valor inválido';
        } else {
          formErrors.end_time = '';
        }
      }
    }
    if (formValues.ruleException === 'rule') {
      if (!formValues.selectedDays.length) {
        formErrors.days = 'É necessário selecionar no mínimo um dia';
      } else {
        formErrors.days = '';
      }
    } else if (formValues.ruleException === 'exception') {
      const selectedHoliday = state.holidaysList.some((x) => x.checked);
      if ((formValues.exception_date) && !/^\d\d\/\d\d\/\d\d\d\d$/.test(formValues.exception_date)) {
        formErrors.days = 'Data inválida';
      } else if ((!selectedHoliday) && !/^\d\d\/\d\d\/\d\d\d\d$/.test(formValues.exception_date)) {
        formErrors.days = 'É necessário escolher uma data';
      } else {
        formErrors.days = '';
      }
    }
    render();
    return !(formErrors.start_time || formErrors.end_time || formErrors.days);
  }

  async function saveDayProg() {
    try {
      if (!validateForm()) return;
      const dayProg = {
        permission: formValues.allowForbid,
        start: formValues.start_time,
        end: formValues.end_time,
        clearProg: props.multiple ? formValues.clearProg : undefined,
      };
      if (props.multiple) {
        if (formValues.clearProg) {
          for (const day of formValues.selectedDays) {
            programmingData[day] = dayProg;
            programmingData.week[day] = dayProg;
          }
        }
      }
      if (formValues.ruleException === 'rule') {
        for (const day of formValues.selectedDays) {
          programmingData[day] = dayProg;
          programmingData.week[day] = dayProg;
        }
      }
      if (formValues.ruleException === 'exception') {
        const dates = state.holidaysList.filter((x) => x.checked).map((x) => x.dateDMY!);
        if (formValues.exception_date) dates.push(formValues.exception_date);
        for (const dateDMY of dates) {
          const date = `${dateDMY.substr(6, 4)}-${dateDMY.substr(3, 2)}-${dateDMY.substr(0, 2)}`;
          if (!programmingData.exceptions) programmingData.exceptions = {};
          programmingData.exceptions[date] = { ...dayProg, dateDMY };
        }
      }
      state.activePage = 'List';
      render();
      if (onChange) { onChange(programmingData); }
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível adicionar a programação.');
    }
  }

  async function handleSubmit() {
    try {
      await onConfirm(programmingData);
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível salvar a programação.');
    }
  }

  function saveVentilation() {
    const ventilation = (formValues.ventInput && Number(formValues.ventInput)) || 0;
    formValues.ventInput = (ventilation && String(ventilation)) || '';
    if (state.ventTime && props.multiple) {
      programmingData.ventTime = { begin: Number(state.ventTime.begin) || 0, end: Number(state.ventTime.end) || 0 };
    } else if (!state.ventTime && props.multiple) {
      delete programmingData.ventTime;
      state.ventTime = { begin: '0', end: '0' };
    } else {
      programmingData.ventTime = { begin: ventilation, end: ventilation };
    }

    state.editingVentilation = false;
    render();
    if (onChange) { onChange(programmingData); }
  }

  const exceptionsItems = programmingData.exceptions as { [day: string]: DayProg&{ dateDMY: string } };

  const Ventilacao = (
    <div>
      <Flex justifyContent="space-between" alignItems="center">
        <ItemTitle>Ventilação</ItemTitle>
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
                <span>Habilitar tempo de ventilação de:</span>
                <span> &nbsp; &nbsp; &nbsp; </span>
                { (props.multiple)
                  ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <span>Início</span>
                      <span> &nbsp; &nbsp; &nbsp; </span>
                      <Input style={{ width: '100px' }} label="Minutos" value={state.ventTime.begin} onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ ventTime: { begin: event.target.value, end: state.ventTime.end } })} />
                      <span> &nbsp; &nbsp; &nbsp; </span>
                      <span>Fim</span>
                      <span> &nbsp; &nbsp; &nbsp; </span>
                      <Input style={{ width: '100px' }} label="Minutos" value={state.ventTime?.end} onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ ventTime: { begin: state.ventTime.begin, end: event.target.value } })} />
                      <span> &nbsp; &nbsp; &nbsp; </span>
                    </div>
                  )
                  : (
                    <Input style={{ width: '100px' }} label="Minutos" value={state.ventTime.begin} onChange={(event: ChangeEvent<HTMLInputElement>) => setState({ ventTime: { begin: event.target.value, end: state.ventTime.end } })} />
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
                {(programmingData.ventTime && (programmingData.ventTime.begin || programmingData.ventTime.end)) ? (
                  <>
                    <Text>
                      {(programmingData.ventTime.begin)}
                      {' '}
                      minuto(s) após horário permitido inicial e
                      {' '}
                      {(programmingData.ventTime.end)}
                      {' '}
                      minuto(s) antes do horário permitido final
                    </Text>
                  </>
                ) : (
                  <Text>desabilitado</Text>
                )}
                {(!props.readOnly) && (
                  <div style={{ width: '60px', display: 'inline-flex', justifyContent: 'space-between' }}>
                    {(programmingData.ventTime && (programmingData.ventTime.begin || programmingData.ventTime.end)) ? (
                      // @ts-ignore
                      <IconWrapper onClick={() => { state.ventTime = null; saveVentilation(); }}>
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

  const EditProg = (
    <Flex flexDirection="column">
      <div style={{ paddingBottom: '20px' }}>
        <RadioButton label="Permitir" checked={formValues.allowForbid === 'allow' && !formValues.clearProg} onClick={() => set_allowForbid('allow')} />
        <span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span>
        <RadioButton label="Desligar" checked={formValues.allowForbid === 'forbid' && !formValues.clearProg} onClick={() => set_allowForbid('forbid')} />
        <span> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </span>
        {props.multiple && (
          <RadioButton label="Remover programação" checked={formValues.clearProg} onClick={() => set_clearProg()} />
        )}
        {/* <RadioButton label='Remover programação' checked={false} onClick={() => null} /> */}
      </div>
      <Flex flexWrap="wrap" justifyContent="space-around">
        <Box width={[1, 1, 1, 1, 0.45]} mb="24px">
          <Input
            name="start_time"
            placeholder="De"
            label="De"
            value={formValues.start_time}
            error={formErrors.start_time}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            onChange={(e) => { formValues.start_time = e.target.value; render(); }}
          />
        </Box>
        <Box width={[1, 1, 1, 1, 0.45]} mb="24px">
          <Input
            name="end_time"
            placeholder="Até"
            label="Até"
            value={formValues.end_time}
            error={formErrors.end_time}
            mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
            onChange={(e) => { formValues.end_time = e.target.value; render(); }}
          />
        </Box>
        <Box>
          <Checkbox
            label="24 horas"
            checked={(formValues.start_time === '00:00' && formValues.end_time === '23:59')}
            onClick={() => { formValues.start_time = '00:00'; formValues.end_time = '23:59'; render(); }}
          />
        </Box>
      </Flex>
      <Text>Dias</Text>
      <Flex flexWrap="wrap">
        {(formValues.ruleException === 'exception')
          ? (
            <>
              <Flex alignItems="flex-start" width={[1, 1, 1, 1, 0.35]}>
                <Input
                  style={{ width: '10em' }}
                  name="exception_date"
                  placeholder="Dia"
                  label="Dia"
                  value={formValues.exception_date}
                  mask={[/[0-3]/, /[0-9]/, '/', /[0-1]/, /[0-9]/, '/', /[2]/, /[0]/, /[0-9]/, /[0-9]/]}
                  onChange={(e) => { set_exception_date(e.target.value); }}
                  disabled={formValues.ruleException !== 'exception'}
                />
              </Flex>
              {(state.holidaysList.length > 0)
              && (
              <Flex flexDirection="column" width={[1, 1, 1, 1, 0.65]} pl={[0, 0, 0, 0, 30]}>
                {state.holidaysList.map((row) => (
                  <Flex alignItems="center" key={row.DAT_FER}>
                    <Checkbox checked={row.checked} color="primary" onClick={() => { row.checked = !row.checked; render(); }} style={{ padding: '3px' }} />
                    {row.dateDMY}
                    {' '}
                    -
                    {row.DESC_FER}
                  </Flex>
                ))}
              </Flex>
              )}
            </>
          )
          : (
            <>
              <Flex alignItems="center" width={[1, 1, 1, 1, 1 / 2]}>
                {weekDays.map((day) => (
                  <SelectDay
                    key={day}
                    isSelected={formValues.selectedDays.includes(day)}
                    disabled={formValues.ruleException !== 'rule'}
                    onClick={() => { handleSelectDay(day); }}
                  >
                    {dayName[day]}
                  </SelectDay>
                ))}
              </Flex>
            </>
          )}
      </Flex>
      {formErrors.days && <ErrorMessage>{formErrors.days}</ErrorMessage>}
      <Flex pt="24px" alignItems="center" justifyContent="center" flexWrap="wrap">
        <Box width={[1, 1, 1, 1 / 3, 1 / 3]} mr={[0, 0, 0, '12px', '12px']} mb={['24px', '24px', '24px', 0, 0]}>
          <Button variant="secondary" onClick={() => { state.activePage = 'List'; render(); }}>
            Voltar
          </Button>
        </Box>
        <Box width={[1, 1, 1, 1 / 3, 1 / 3]} ml={[0, 0, 0, '12px', '12px']}>
          <Button variant="primary" onClick={saveDayProg}>
            {state.isSending ? <Loader variant="secondary" size="small" /> : 'Salvar'}
          </Button>
        </Box>
      </Flex>
    </Flex>
  );

  const ProgOverview = (
    <div>
      <Flex flexWrap="wrap">
        <Box width={[1, 1, 1, 1, 1 / 2]} pr={[0, 0, 0, 0, 40]}>
          <ItemTitle>Funcionamento</ItemTitle>
          {weekDays.map((day) => (
            <ProgTable key={day}>
              <TextProgTabDay>{dayName[day]}</TextProgTabDay>
              <TextProgTabMode><span>{getDayProgDesc(programmingData[day])}</span></TextProgTabMode>
              <div style={{ display: 'inline-flex', justifyContent: 'space-between' }}>
                {(programmingData[day]) ? (
                  <>
                    <IconWrapper onClick={() => { removeProg(day); }}>
                      <TrashIcon />
                    </IconWrapper>
                  </>
                ) : <div>&nbsp;</div>}
                <IconWrapper onClick={() => { editDayProg(programmingData[day], day); }}>
                  <EditIcon />
                </IconWrapper>
              </div>
            </ProgTable>
          ))}
        </Box>
        <Box width={[1, 1, 1, 1, 1 / 2]} pl={[0, 0, 0, 0, 0]} pb={[20, 20, 20, 20, 0]}>
          <ItemTitle>Exceções</ItemTitle>
          {Object.keys(programmingData.exceptions || {}).map((day) => (
            <ProgTableExc key={day}>
              <TextProgTabDay>{exceptionsItems[day].dateDMY}</TextProgTabDay>
              <TextProgTabMode><span>{getDayProgDesc(programmingData.exceptions![day])}</span></TextProgTabMode>
              <div style={{ display: 'inline-flex', justifyContent: 'space-between' }}>
                <IconWrapper onClick={() => removeProg(day)}>
                  <TrashIcon />
                </IconWrapper>
              </div>
            </ProgTableExc>
          ))}
          <IconWrapper onClick={() => { editDayProg(null, null); }}>
            <AddIcon />
          </IconWrapper>
        </Box>
      </Flex>
      { (!props.devType || (props.devType === 'DAM')) && (
        <ItemWrapper style={{ marginTop: '20px' }}>
          {Ventilacao}
        </ItemWrapper>
      )}
      { props.devConfigOpts && (
        <ItemWrapper style={{ marginTop: '20px' }}>
          { props.devConfigOpts }
        </ItemWrapper>
      )}
      <ItemWrapper style={{ marginTop: '20px' }}>
        <Flex justifyContent="center" alignItems="center" mt="20px">
          <Box width={[1, 1, 1, 1, 1]} pb="24px">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '250px' }} />
              <Button style={{ width: '100%' }} onClick={() => { handleSubmit(); }} variant="primary"> ENVIAR </Button>
              <Box width={[0, 0, 0, 0, 250]}>&nbsp;</Box>
            </div>
          </Box>
        </Flex>
      </ItemWrapper>
    </div>
  );

  return (
    <>
      <Flex>
        <Box width={1}>
          {state.isLoading ? (
            <Flex alignItems="center" justifyContent="center" mt={32}>
              <Box width={1}>
                <Loader variant="primary" />
              </Box>
            </Flex>
          ) : (
            <div>
              {(state.activePage === 'List') && ProgOverview}
              {(state.activePage === 'Edit') && EditProg}
            </div>
          )}
        </Box>
      </Flex>
    </>
  );
};

const Text = styled.p<{ isBold? }>(
  ({ isBold }) => `
    margin-bottom: ${isBold ? 0 : '1em'};
    margin-top: ${isBold ? '1em' : 0};
    color: ${isBold ? colors.Grey300 : colors.Grey400};
    font-weight: ${isBold ? 'bold' : 'normal'};
  `,
);

const SelectDay = styled.div<{ isSelected, disabled }>(
  ({ isSelected, disabled }) => `
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
    background-color: ${disabled ? colors.White : (isSelected ? colors.Blue300 : colors.White)};
    border: 1px solid ${disabled ? colors.Grey200 : colors.Blue300};
    color: ${disabled ? colors.Grey200 : (isSelected ? colors.White : colors.Blue300)};
  `,
);

const ErrorMessage = styled.span`
  color: ${colors.Red};
  font-size: 0.75em;
`;

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
