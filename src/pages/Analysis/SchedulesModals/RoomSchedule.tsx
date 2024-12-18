import { ChangeEvent, useEffect, useState } from 'react';

import { Flex, Box } from 'reflexbox';
import styled from 'styled-components';

import {
  Button, Input, Loader, RadioButton, Checkbox,
} from 'components';
import { getDayProgDesc } from 'helpers/scheduleData';
import { useStateVar } from 'helpers/useStateVar';
import { EditIcon, TrashIcon } from 'icons';
import { DayProg, FullProg_v4 } from 'providers/types';
import { colors } from 'styles/colors';

const weekDaysList = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom',
};

export function SchedulesList(props: {
  devSched: FullProg_v4,
  wantDelException: ((date: string) => void)|null,
  wantAddProg: (() => void)|null,
  wantEditDay: ((day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => void)|null,
  wantRemoveDay: ((day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun') => void)|null,
  isLoading: boolean,
  readOnly?: boolean,
}): JSX.Element {
  const {
    devSched, wantDelException, wantAddProg, wantEditDay, wantRemoveDay, isLoading,
  } = props;
  const [state, render, setState] = useStateVar({
    dayProgs: [] as {
      day: 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun',
      dayName: string,
      text: string,
      isBlank: boolean,
    }[],
    excepts: [] as { dateYMD: string, date: string, text: string }[],
  });

  useEffect(() => {
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

  return (
    <>
      <Flex>
        <Box width={1}>
          {(!isLoading) ? (
            <>
              <Flex justifyContent="center" alignItems="center">
                <Box width={[1, 1, 1, 1, 1]}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '250px' }} />
                    {(!props.readOnly) && (
                      <Button style={{ width: '100%' }} onClick={wantAddProg || (() => {})} variant="primary">
                        Definir Programação
                      </Button>
                    )}
                    <Box width={[0, 0, 0, 0, 250]}>&nbsp;</Box>
                  </div>
                </Box>
              </Flex>
              <ItemWrapper>
                <Flex flexWrap="wrap">
                  <Box width={[1, 1, 1, 1, (state.excepts.length > 0) ? 1 / 2 : 1]} pr={[0, 0, 0, 0, 40]}>
                    <ItemTitle>Funcionamento</ItemTitle>
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
                      <ItemTitle>Exceções</ItemTitle>
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
  onCancel: () => void,
  isSending: boolean,
}) {
  const {
    devSched, selectedDay, onConfirmProg, onCancel, isSending,
  } = props;

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
    render();
  }

  function validateForm() {
    let start_index = null as null|number;
    if (!/^\d\d:\d\d$/.test(state.start_time)) {
      state.formErrors.start_time = 'O campo de tempo inicial é obrigatório';
    } else {
      const horas = Number(state.start_time.substr(0, 2));
      const minutos = Number(state.start_time.substr(3, 2));
      if (!(horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59)) {
        state.formErrors.start_time = 'Valor inválido';
      } else {
        state.formErrors.start_time = '';
        start_index = horas * 60 + minutos;
      }
    }
    if (!/^\d\d:\d\d$/.test(state.end_time)) {
      state.formErrors.end_time = 'O campo de tempo final é obrigatório';
    } else {
      const horas = Number(state.end_time.substr(0, 2));
      const minutos = Number(state.end_time.substr(3, 2));
      if (!(horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59)) {
        state.formErrors.end_time = 'Valor inválido';
      } else {
        const end_index = horas * 60 + minutos;
        if (start_index != null && !(end_index >= start_index)) {
          state.formErrors.end_time = 'Valor inválido';
        } else {
          state.formErrors.end_time = '';
        }
      }
    }
    if (state.ruleException === 'rule') {
      if (!state.weekDays.some((item) => item.checked)) {
        state.formErrors.days = 'É necessário selecionar no mínimo um dia';
      } else {
        state.formErrors.days = '';
      }
    } else if (state.ruleException === 'exception') {
      if (state.exception_date.length !== 10 || state.exception_date.includes('_')) {
        state.formErrors.days = 'A data da exceção é obrigatória';
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
    }
    // else if (state.ruleException === 'exception') {
    //   const { exception_date } = state;
    //   const day = `${exception_date.substr(6, 4)}-${exception_date.substr(3, 2)}-${exception_date.substr(0, 2)}`;
    //   onConfirmExcept(day, prog);
    // }
  }

  return (
    <Flex flexDirection="column">
      <div>
        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" mb="24px">
          <Box width={[1, 1, 1, 1, 0.35]}>
            <Input
              name="start_time"
              placeholder="De"
              label="De"
              value={state.start_time}
              error={state.formErrors.start_time}
              mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { state.start_time = e.target.value; render(); }}
            />
          </Box>
          <Box width={[1, 1, 1, 1, 0.35]}>
            <Input
              name="end_time"
              placeholder="Até"
              label="Até"
              value={state.end_time}
              error={state.formErrors.end_time}
              mask={[/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => { state.end_time = e.target.value; render(); }}
            />
          </Box>
          <Box>
            <Checkbox
              label="24 horas"
              checked={(state.start_time === '00:00' && state.end_time === '23:59')}
              onClick={() => { state.start_time = '00:00'; state.end_time = '23:59'; render(); }}
            />
          </Box>
        </Flex>
        <Text>Dias</Text>
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
          <Flex alignItems="center" width={[1, 1, 1, 1, 1 / 2]} pl={[0, 0, 0, 0, 30]}>
            <Checkbox
              label="todos os dias"
              checked={(state.weekDays.filter((x) => x.checked).length === 7)}
              onClick={() => { state.weekDays.forEach((x) => x.checked = true); render(); }}
            />
          </Flex>
        </Flex>
        {state.formErrors.days && <ErrorMessage>{state.formErrors.days}</ErrorMessage>}
        <Flex pt="24px" alignItems="center" justifyContent="center" flexWrap="wrap">
          <Box width={[1, 1, 1, 1 / 3, 1 / 3]} mr={[0, 0, 0, '12px', '12px']} mb={['24px', '24px', '24px', 0, 0]}>
            <Button variant="secondary" onClick={() => { onCancel(); }}>
              Voltar
            </Button>
          </Box>
          <Box width={[1, 1, 1, 1 / 3, 1 / 3]} ml={[0, 0, 0, '12px', '12px']}>
            <Button variant="primary" onClick={handleSubmit}>
              {isSending ? <Loader variant="secondary" size="small" /> : 'Salvar'}
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
          <Text>Tem certeza que deseja excluir esta programação?</Text>
        </Box>
      </Flex>
      <Flex alignItems="center" justifyContent="center" flexWrap="wrap">
        <Box width={[1, 1, 1, 1 / 3, 1 / 3]} mr={[0, 0, 0, '12px', '12px']} mb={['24px', '24px', '24px', 0, 0]}>
          <div onClick={() => { onCancel(); }}>
            <Button variant="secondary">Voltar</Button>
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
