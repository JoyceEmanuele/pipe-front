import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import { NewUnitsHealthIcon } from '../../HealthIcon';
import { t } from 'i18next';
import {
  BatteryIcon,
  ChipIcon,
  CircleCheckGreen,
  CircleNotCheckRed,
  CircleWarningYellow,
  EnergyNobreakIcon,
  LuzAcesa,
  LuzApagada,
  NobreakOffIcon,
  WifiMiniOffIcon,
  WifiMiniOnIcon,
} from '../../../icons';
import { useState, useEffect } from 'react';
import {
  Card,
  Header,
  ColTitle,
  ColTitleCenter,
  Col,
  ColCenter,
  BodyList,
  CardsContainer,
  Row,
  StyledLink,
  TempColor,
  HealthIndexIcon,
  HealthToolTipDiv,
  SubTitle,
  ToolTipRowTitle,
  ToolTipTitle,
  HealthDesc,
  HealtLastAtt,
  ChevronBottom,
  ChevronTop,
  ButtonTypeSolution,
  ContainerNobreak,
  ContainerTypeOfSolutionsButton,
  NameStyle,
  ColNobreak,
  NameStyleNobreak,
} from './styles';
import { useStateVar } from '../../../helpers/useStateVar';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

type Props = {
  dacs: {
    GROUP_NAME: string,
    DEV_ID: number
    GROUP_ID?: number,
    status: string,
    DEV_AUTO: string,
    H_INDEX: number,
    H_DESC: string,
    H_DATE: string,
  }[],
  duts: {
    ROOM_NAME: string,
    DEV_ID: string,
    ISVISIBLE: number,
    isAuto: boolean,
    status: string,
    temprtAlert: string,
    Temperature: number,
  }[],
  vavs: {
    DEV_ID: string,
    GROUP_NAME?: string,
    GROUP_ID?: number,
    ISVISIBLE: number,
    ROOM_NAME: string,
    isAuto: boolean,
    Temperature?: number,
    temprtAlert: string,
    status?: string | null,
  }[]
  nobreaks: {
    DAT_CODE: string,
    DMT_CODE: string,
    NOMINAL_POTENTIAL: number,
    NOBREAK_NAME: string,
    NOMINAL_BATERY_LIFE: number,
    INPUT_VOLTAGE: number,
    OUTPUT_VOLTAGE: number,
    NOBREAK_ID: number,
    STATUS: string | null,
    AVERAGEDUR: string | null,
    AUTON: string | null,
    CONNECTION: string | null,
  }[]
  illumination: {
    ID: number,
    NAME: string,
    UNIT_ID: number,
    GRID_VOLTAGE: number,
    GRID_CURRENT: number,
    FEEDBACK: number,
    STATUS: string,
    CONNECTION: string,
    DEVICE_CODE: string
  }[]
  machineWithoutDevices: {
    MACHINE_NAME: string
    MACHINE_ID: number
    DEV_AUTO?: string
  }[]
}

export const Cards = ({
  dacs,
  duts,
  vavs,
  nobreaks,
  illumination,
  machineWithoutDevices,
}: Props): JSX.Element => {
  const environments = [...duts, ...vavs];
  environments.sort((a, b) => {
    if (a.temprtAlert !== b.temprtAlert) {
      if (a.temprtAlert === 'high' && b.temprtAlert !== 'high') return -1;
      if (a.temprtAlert !== 'high' && b.temprtAlert === 'high') return 1;
      if (a.temprtAlert === 'good' && b.temprtAlert !== 'good') return -1;
      if (a.temprtAlert !== 'good' && b.temprtAlert === 'good') return 1;
      if (a.temprtAlert === 'low' && b.temprtAlert !== 'low') return -1;
      if (a.temprtAlert !== 'low' && b.temprtAlert === 'low') return 1;
    }
    if (a.DEV_ID > b.DEV_ID) return -1;
    if (a.DEV_ID < b.DEV_ID) return 1;
    return 0;
  });

  dacs.sort((a, b) => {
    if (a.H_INDEX !== b.H_INDEX) {
      if (a.H_INDEX === 25 && b.H_INDEX !== 25) return -1;
      if (a.H_INDEX !== 25 && b.H_INDEX === 25) return 1;
      if (a.H_INDEX === 75 && b.H_INDEX !== 75) return -1;
      if (a.H_INDEX !== 75 && b.H_INDEX === 75) return 1;
      if (a.H_INDEX === 50 && b.H_INDEX !== 50) return -1;
      if (a.H_INDEX !== 50 && b.H_INDEX === 50) return 1;
      if (a.H_INDEX === 100 && b.H_INDEX !== 100) return -1;
      if (a.H_INDEX !== 100 && b.H_INDEX === 100) return 1;
      if (a.H_INDEX === null || a.H_INDEX === 2 && b.H_INDEX !== null || b.H_INDEX !== 2) return -1;
      if (a.H_INDEX !== null || a.H_INDEX !== 2 && b.H_INDEX === null || b.H_INDEX === 2) return 1;
      if (a.H_INDEX === 4 && b.H_INDEX !== 4) return -1;
      if (a.H_INDEX !== 4 && b.H_INDEX === 4) return 1;
    }
    if (a.DEV_ID > b.DEV_ID) return -1;
    if (a.DEV_ID < b.DEV_ID) return 1;
    return 0;
  });

  const toggleSortCardEnvironments = (col) => {
    if (col === state.sortColEnvironments) {
      setState({
        sortDirEnvironments: state.sortDirEnvironments === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setState({
        sortColEnvironments: col,
        sortDirEnvironments: 'asc',
      });
    }
  };
  const temperatureIcon = (temperature: number, temprtAlert: string): JSX.Element => {
    let color = '#BBBBBB';

    if (temprtAlert === 'low') color = '#2D81FF';
    if (temprtAlert === 'good') color = '#5AB365';
    if (temprtAlert === 'high') color = '#FF0000';
    if (!temprtAlert) color = '#BBBBBB';

    return (
      <TempColor>
        <svg width="14" height="14" style={{ borderRadius: '3px' }}>
          <rect width="14" height="14" style={{ fill: color }} />
        </svg>
        <div>
          { `${formatNumberWithFractionDigits(temperature)}°C` }
        </div>
      </TempColor>
    );
  };

  const [state, render, setState] = useStateVar({
    sortColMachines: 'GROUP_NAME',
    sortDirMachines: 'asc',
    sortColEnvironments: 'ROOM_NAME',
    sortDirEnvironments: 'asc',
    sortColIllumination: 'NAME',
    sortDirIllumination: 'asc',
    sortColNobreak: 'NOBREAK_NAME',
    sortDirNobreak: 'asc',
    typeofSolution: '',
  });

  const bottomEnvironments = state.sortDirEnvironments === 'desc' ? <ChevronBottom /> : <ChevronTop />;

  type TElementSortA = {
    ROOM_NAME: string;
    DEV_ID: string;
    ISVISIBLE: number;
    isAuto: boolean;
    status: string;
    temprtAlert: string;
    Temperature: number;
  }

  type TElementSortB = {
    DEV_ID: string;
    GROUP_NAME?: string;
    GROUP_ID?: number;
    ISVISIBLE: number;
    ROOM_NAME: string;
    isAuto: boolean;
    Temperature?: number;
    temprtAlert: string;
    status?: string | null;
  }

  function sortedDevIdDes(hasIconA: boolean, hasIconB: boolean, a: TElementSortA | TElementSortB, b: TElementSortA | TElementSortB) {
    if (state.sortDirEnvironments === 'desc') {
      if (hasIconA && !hasIconB) {
        return 1;
      }
      if (!hasIconA && hasIconB) {
        return -1;
      }
    } else {
      if (hasIconA && !hasIconB) {
        return -1;
      }
      if (!hasIconA && hasIconB) {
        return 1;
      }
    }
    return a[state.sortColEnvironments] < b[state.sortColEnvironments] ? 1 : -1;
  }

  function sortedRoomName(a: TElementSortA | TElementSortB, b: TElementSortA | TElementSortB) {
    if (state.sortDirEnvironments === 'asc') {
      return (a[state.sortColEnvironments] || '').localeCompare((b[state.sortColEnvironments] || ''), undefined, { sensitivity: 'base' });
    }
    return (b[state.sortColEnvironments] || '').localeCompare((a[state.sortColEnvironments] || ''), undefined, { sensitivity: 'base' });
  }

  const sortedEnviroments = environments ? [...environments].sort((a, b) => {
    const hasIconA = a.isAuto && !a.DEV_ID.startsWith('DUT0') && !a.DEV_ID.startsWith('DUT1') && !a.DEV_ID.startsWith('DUT2');
    const hasIconB = b.isAuto && !b.DEV_ID.startsWith('DUT0') && !b.DEV_ID.startsWith('DUT1') && !b.DEV_ID.startsWith('DUT2');

    if (state.sortColEnvironments === 'ROOM_NAME') {
      return sortedRoomName(a, b);
    }

    if (state.sortColEnvironments === 'DEV_ID') {
      return sortedDevIdDes(hasIconA, hasIconB, a, b);
    }

    if (state.sortDirEnvironments === 'asc') {
      return a[state.sortColEnvironments] < b[state.sortColEnvironments] ? -1 : 1;
    }
    return a[state.sortColEnvironments] < b[state.sortColEnvironments] ? 1 : -1;
  }) : [];

  return (
    <CardsContainer>
      <MachineAndUtilityCardUnit
        state={state}
        setState={setState}
        HealthToolTip={HealthToolTip}
        dacs={dacs}
        vavs={vavs}
        nobreaks={nobreaks}
        illuminations={illumination}
        machineWithoutDevices={machineWithoutDevices}
        render={render}
      />
      <Card>
        <Header>
          <ColTitle onClick={() => toggleSortCardEnvironments('ROOM_NAME')}>
            {t('ambientes')}
            {state.sortColEnvironments === 'ROOM_NAME' ? bottomEnvironments : ''}
          </ColTitle>
          <ColTitleCenter onClick={() => toggleSortCardEnvironments('DEV_ID')}>
            {t('automacao')}
            {state.sortColEnvironments === 'DEV_ID' ? bottomEnvironments : ''}
          </ColTitleCenter>
          <ColTitleCenter onClick={() => toggleSortCardEnvironments('status')}>
            {t('conexao')}
            {state.sortColEnvironments === 'status' ? bottomEnvironments : ''}
          </ColTitleCenter>
          <ColTitleCenter onClick={() => toggleSortCardEnvironments('Temperature')}>
            {t('tempAtual')}
            {state.sortColEnvironments === 'Temperature' ? bottomEnvironments : ''}
          </ColTitleCenter>
        </Header>
        <BodyList>
          { sortedEnviroments.map((env, index) => (
            <>
              {env.ISVISIBLE === 1 && (
                <Row key={env.ROOM_NAME}>
                  <Col to={`/analise/dispositivo/${env.DEV_ID}/informacoes`}>
                    <StyledLink data-tip data-for={`env-${env.ROOM_NAME || env.DEV_ID}-${index}`} to={`/analise/dispositivo/${env.DEV_ID}/informacoes`}>
                      { (env.ROOM_NAME && env.ROOM_NAME.length > 35 ? env.ROOM_NAME.concat('...') : env.ROOM_NAME) }
                    </StyledLink>
                    <ReactTooltip
                      id={`env-${env.ROOM_NAME || env.DEV_ID}-${index}`}
                      place="top"
                      effect="solid"
                      delayHide={100}
                      offset={{ top: 0, left: 10 }}
                      textColor="#000000"
                      border
                      backgroundColor="rgba(255, 255, 255, 0.97)"
                    >
                      { env.ROOM_NAME }
                    </ReactTooltip>
                  </Col>
                  <ColCenter>
                    { (env.isAuto && !env.DEV_ID.startsWith('DUT0') && !env.DEV_ID.startsWith('DUT1') && !env.DEV_ID.startsWith('DUT2'))
                      ? (
                        <StyledLink to={`/analise/dispositivo/${env.DEV_ID}/informacoes`}>
                          { ChipIcon({ color: '#363BC4' }) }
                        </StyledLink>
                      )
                      : '-'}
                  </ColCenter>
                  <ColCenter>
                    { (env.status === 'ONLINE') ? <WifiMiniOnIcon size={17} /> : <WifiMiniOffIcon size={17} /> }
                  </ColCenter>
                  <ColCenter>
                    {env.Temperature ? temperatureIcon(env.Temperature, env.temprtAlert) : '-'}
                  </ColCenter>
                </Row>
              )}
            </>
          ))}
        </BodyList>
      </Card>
    </CardsContainer>
  );
};

type TMachineCardUnit = {
  state: {
    sortColMachines: string
    sortDirMachines: string
    sortColEnvironments: string
    sortDirEnvironments: string
    typeofSolution: string
    sortColIllumination: string,
    sortDirIllumination: string,
    sortColNobreak: string,
    sortDirNobreak: string,
  }
  setState: (o: Partial<{
    sortColMachines: string;
    sortDirMachines: string;
    sortColEnvironments: string;
    sortDirEnvironments: string;
    typeofSolution: string;
  }>) => void,
  HealthToolTip: ({ H_INDEX, H_DESC, H_DATE }: {
    H_INDEX: any;
    H_DESC: any;
    H_DATE: any;
  }) => JSX.Element,
  nobreaks: {
    DAT_CODE: string,
    DMT_CODE: string,
    NOMINAL_POTENTIAL: number,
    NOBREAK_NAME: string,
    NOMINAL_BATERY_LIFE: number,
    INPUT_VOLTAGE: number,
    OUTPUT_VOLTAGE: number,
    NOBREAK_ID: number,
    STATUS: string | null,
    AVERAGEDUR: string | null,
    AUTON: string | null,
    CONNECTION: string | null,
  }[]
  illuminations: {
    ID: number,
    NAME: string,
    UNIT_ID: number,
    GRID_VOLTAGE: number,
    GRID_CURRENT: number,
    STATUS: string,
    FEEDBACK: number,
    DEVICE_CODE: string
  }[]
  render: () => void,
  dacs: {
    GROUP_NAME: string,
    GROUP_ID?: number,
    DEV_ID: number
    status: string,
    DEV_AUTO: string,
    H_INDEX: number,
    H_DESC: string,
    H_DATE: string,
  }[],
  vavs: {
    DEV_ID: string,
    GROUP_NAME?: string,
    GROUP_ID?: number,
    ISVISIBLE: number,
    ROOM_NAME: string,
    isAuto: boolean,
    Temperature?: number,
    temprtAlert: string,
    status?: string | null,
  }[]
  machineWithoutDevices: {
    MACHINE_NAME: string
    MACHINE_ID: number
    DEV_AUTO?: string
  }[]
}

function MachineAndUtilityCardUnit({
  dacs,
  vavs,
  state,
  HealthToolTip,
  setState,
  nobreaks,
  illuminations,
  machineWithoutDevices,
}: TMachineCardUnit) {
  const [stateMachine, _render, setStateMachine] = useStateVar({
    sortColMachines: 'GROUP_NAME',
    sortDirMachines: 'asc',
    sortColIllumination: 'NAME',
    sortDirIllumination: 'asc',
    sortColNobreak: 'NOBREAK_NAME',
    sortDirNobreak: 'asc',
  });
  const dacsVavsList = [
    ...dacs.map((obj) => ({
      ...obj,
      list: 'dac',
      GROUP_NAME: obj.GROUP_NAME ? obj.GROUP_NAME : '',
    })),
    ...vavs.map((obj) => ({
      ...obj,
      list: 'vav',
      DEV_AUTO: obj.DEV_ID,
      GROUP_NAME: obj.GROUP_NAME ? obj.GROUP_NAME : '',
      H_INDEX: null,
      H_DESC: null,
      H_DATE: null,
    })),
    ...machineWithoutDevices.map((obj) => ({
      list: 'machine',
      DEV_ID: null,
      GROUP_ID: obj.MACHINE_ID,
      GROUP_NAME: obj.MACHINE_NAME,
      DEV_AUTO: obj.DEV_AUTO,
      H_INDEX: null,
      H_DESC: null,
      H_DATE: null,
      status: null,
    })),
  ];

  const sortedMachines = dacsVavsList ? [...dacsVavsList].sort((a, b) => {
    if (stateMachine.sortColMachines === 'GROUP_NAME') {
      if (stateMachine.sortDirMachines === 'asc') {
        return a[stateMachine.sortColMachines].localeCompare(b[stateMachine.sortColMachines], undefined, { sensitivity: 'base' });
      }
      return b[stateMachine.sortColMachines].localeCompare(a[stateMachine.sortColMachines], undefined, { sensitivity: 'base' });
    }
    if (stateMachine.sortColMachines === 'DEV_AUTO') {
      return sorted(a[stateMachine.sortColMachines], b[stateMachine.sortColMachines]);
    }
    return ascendSort(a, b);
  }) : [];

  const [typeofSolution, setTypeOfSolution] = useState('');

  function sorted(constA, constB) {
    if (stateMachine.sortDirMachines === 'desc') {
      if (constA && !constB) {
        return 1;
      }
      if (!constA && constB) {
        return -1;
      }
    } else { // ordenação ascendente
      if (constA && !constB) {
        return -1;
      }
      if (!constA && constB) {
        return 1;
      }
    }
    return constA < constB ? 1 : -1;
  }

  function comparativeGeneric(constante, name) {
    if (constante === name) return 1;
    return 0;
  }

  function verifyExist(variavel) {
    if (variavel) return 1;
    return 0;
  }

  function ascendSort(a, b) {
    if (stateMachine.sortDirIllumination === 'asc') {
      return a[stateMachine.sortColIllumination] < b[stateMachine.sortColIllumination] ? -1 : 1;
    }
    return a[stateMachine.sortColIllumination] < b[stateMachine.sortColIllumination] ? 1 : -1;
  }

  const sortedIllumination = illuminations ? [...illuminations].sort((a, b) => {
    if (stateMachine.sortColIllumination === 'NAME') {
      if (stateMachine.sortDirIllumination === 'asc') {
        return a[stateMachine.sortColIllumination].localeCompare(b[stateMachine.sortColIllumination], undefined, { sensitivity: 'base' });
      }
      return b[stateMachine.sortColIllumination].localeCompare(a[stateMachine.sortColIllumination], 'pt', { sensitivity: 'base' });
    }
    if (stateMachine.sortColIllumination === 'DEVICE_CODE') {
      const aDevice = verifyExist(a[stateMachine.sortColIllumination]);
      const bDevice = verifyExist(b[stateMachine.sortColIllumination]);
      return sorted(aDevice, bDevice);
    }
    if (stateMachine.sortColIllumination === 'STATUS') {
      const aStatus = comparativeGeneric(a[stateMachine.sortColIllumination], 'ONLINE');
      const bStatus = comparativeGeneric(b[stateMachine.sortColIllumination], 'ONLINE');
      return sorted(aStatus, bStatus);
    }
    return ascendSort(a, b);
  }) : [];

  const returnGroupName = (dac) => (dac.GROUP_NAME ? dac.GROUP_NAME : '-');

  return (
    <Card>
      <HeaderMachine state={stateMachine} setState={setStateMachine} />
      <BodyList>
        { sortedMachines.map((item, index) => (
          <Row key={`${item.DEV_ID}${item.GROUP_NAME}`}>
            <Col>
              <StyledLink data-tip data-for={`item-${item.GROUP_NAME || item.DEV_ID}-${index}`} to={item.DEV_ID ? `/analise/dispositivo/${item.DEV_ID}/informacoes` : `/analise/maquina/${item.GROUP_ID}/ativos`}>
                <NameStyle>{returnGroupName(item)}</NameStyle>
              </StyledLink>
              <ReactTooltip
                id={`item-${item.GROUP_NAME || item.DEV_ID}-${index}`}
                place="top"
                effect="solid"
                delayHide={100}
                offset={{ top: 0, left: 10 }}
                textColor="#000000"
                border
                backgroundColor="rgba(255, 255, 255, 0.97)"
              >
                { item.GROUP_NAME || item.DEV_ID }
              </ReactTooltip>
            </Col>
            <ColCenter>
              { item.DEV_AUTO ? (
                <StyledLink to={`/analise/dispositivo/${item.DEV_AUTO}/informacoes`}>
                  { ChipIcon({ color: '#363BC4' }) }
                </StyledLink>
              )
                : '-'}
            </ColCenter>
            <ColCenter>
              { (item.status === 'ONLINE') ? <WifiMiniOnIcon size={17} /> : <WifiMiniOffIcon size={17} /> }
            </ColCenter>
            {item.list === 'dac' ? (
              <ColCenter>
                <HealthIndexIcon data-tip data-for={`health-${item.DEV_ID}-${index}`}>
                  { <NewUnitsHealthIcon H_INDEX={item.H_INDEX} /> || '-'}
                </HealthIndexIcon>
                <ReactTooltip
                  id={`health-${item.DEV_ID}-${index}`}
                  place="top"
                  effect="solid"
                  delayHide={100}
                  offset={{ top: 0, left: 10 }}
                  textColor="#000000"
                  border
                  backgroundColor="rgba(255, 255, 255, 0.97)"
                >
                  {item.H_DESC && (
                    <HealthToolTip H_INDEX={item.H_INDEX} H_DESC={item.H_DESC} H_DATE={item.H_DATE} />
                  ) || '-'}
                </ReactTooltip>
              </ColCenter>
            ) : <ColCenter />}
          </Row>
        ))}
      </BodyList>
      {
        (nobreaks.length > 0 || illuminations.length > 0) && (
          <ContainerNobreak>
            <ButtonsTypeOfSolution
              nobreaks={nobreaks}
              illumination={illuminations}
              typeofSolution={typeofSolution}
              setTypeOfSolution={setTypeOfSolution}
            />
            <BodyList style={{
              marginTop: '45px',
              padding: '0px',
            }}
            >
              <HeaderSolutions state={stateMachine} setState={setStateMachine} typeofSolution={typeofSolution} />
              <BodyList style={{
                border: 'none',
                paddingLeft: typeofSolution === 'nobreak' ? 24 : 7,
              }}
              >
                <TypeSolutionNobreak typeofSolution={typeofSolution} nobreaks={nobreaks} />
                <TypeSolutionIllumination typeofSolution={typeofSolution} sortedIllumination={sortedIllumination} />
              </BodyList>
            </BodyList>
          </ContainerNobreak>
        )
      }
    </Card>
  );
}

function TypeSolutionNobreak({ typeofSolution, nobreaks }) {
  return (
    <>
      { typeofSolution === 'nobreak' && nobreaks.map((item, index) => (
        <Row key={item.DEV_ID}>
          <ColNobreak>
            <StyledLink
              data-tip
              data-for={`nobreak-${item.NOBREAK_NAME || item.NOBREAK_ID}-${index}`}
              to={`/analise/utilitario/nobreak/${item.NOBREAK_ID}/informacoes`}
            >
              <NameStyleNobreak>{item.NOBREAK_NAME}</NameStyleNobreak>
            </StyledLink>
            <ReactTooltip
              id={`nobreak-${item.NOBREAK_NAME || item.NOBREAK_ID}-${index}`}
              place="top"
              effect="solid"
              delayHide={100}
              offset={{ top: 0, left: 10 }}
              textColor="#000000"
              border
              backgroundColor="rgba(255, 255, 255, 0.97)"
            >
              { item.NOBREAK_NAME }
            </ReactTooltip>
          </ColNobreak>
          <ColCenter>
            { item.DMT_CODE ? (
              <StyledLink to={`/analise/dispositivo/${item.DMT_CODE}/informacoes`}>
                { ChipIcon({ color: '#363BC4' }) }
              </StyledLink>
            )
              : '-'}
          </ColCenter>
          <ColCenter>
            {
              item.STATUS === 'Rede Elétrica' && (
                <EnergyNobreakIcon />
              )
            }
            {
              item.STATUS === 'Bateria' && (
                <BatteryIcon />
              )
            }
            {
              item.STATUS === 'Desligado' && (
                <NobreakOffIcon color="#CFCFCF" />
              )
            }
            {
              (item.STATUS !== 'Desligado' && item.STATUS !== 'Sem luz' && item.STATUS !== 'Com luz') && (
                '-'
              )
            }
          </ColCenter>
          <ColCenter>
            { item.AVERAGEDUR ? (
              <>{`${item.AVERAGEDUR}min`}</>
            )
              : '-'}
          </ColCenter>
          <ColCenter>
            {
              !item.AUTON && (
                '-'
              )
            }
            {
              (item.AUTON) && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '70%',
                }}
                >
                  {
                    (Number(item.AUTON) < 70 && Number(item.AUTON) >= 30) && (
                      <CircleWarningYellow />
                    )
                  }
                  {
                    (Number(item.AUTON) > 70) && (
                      <CircleCheckGreen />
                    )
                  }
                  {
                    (Number(item.AUTON) < 30) && (
                      <CircleNotCheckRed />
                    )
                  }
                  {`${Number(item.AUTON)}%`}
                </div>
              )
            }
          </ColCenter>
          <ColCenter>
            { (item.CONNECTION === 'ONLINE') ? <WifiMiniOnIcon size={17} /> : <WifiMiniOffIcon size={17} /> }
          </ColCenter>
        </Row>
      ))}
    </>
  );
}

function TypeSolutionIllumination({ typeofSolution, sortedIllumination }) {
  function returnStatusIconIllumination(status) {
    if (status === 'Ligado') {
      return <LuzAcesa />;
    }
    if (status === 'Desligado') {
      return <LuzApagada />;
    }
    return '-';
  }
  return (
    <>
      { typeofSolution === 'illumination' && sortedIllumination.map((item, index) => (
        <Row
          key={`${item.DEVICE_CODE}${item.ID}${item.NAME}`}
          style={{
            paddingLeft: typeofSolution === 'nobreak' ? 18 : 10,
          }}
        >
          <Col>
            <StyledLink data-tip data-for={`illumination-${item.NAME || item.ID}-${index}`} to={`/analise/utilitario/iluminacao/${item.ID}/informacoes`}>
              <NameStyle>{item.NAME}</NameStyle>
            </StyledLink>
            <ReactTooltip
              id={`illumination-${item.NAME || item.ID}-${index}`}
              place="top"
              effect="solid"
              delayHide={100}
              offset={{ top: 0, left: 10 }}
              textColor="#000000"
              border
              backgroundColor="rgba(255, 255, 255, 0.97)"
            >
              { item.NAME }
            </ReactTooltip>
          </Col>
          <ColCenter
            style={{
              marginLeft: 10,
            }}
          >
            { item?.DEVICE_CODE ? (
              <StyledLink to={`/analise/dispositivo/${item.DEVICE_CODE}/informacoes`}>
                { ChipIcon({ color: '#363BC4' }) }
              </StyledLink>
            )
              : '-'}
          </ColCenter>
          <ColCenter>
            {returnStatusIconIllumination(item.STATUS)}
          </ColCenter>
          <ColCenter>
            { (item.CONNECTION === 'ONLINE') ? <WifiMiniOnIcon size={17} /> : <WifiMiniOffIcon size={17} /> }
          </ColCenter>
        </Row>
      ))}
    </>
  );
}

function HeaderMachine({ state, setState }) {
  const bottomMachines = state.sortDirMachines === 'desc' ? <ChevronBottom /> : <ChevronTop />;
  const toggleSortCardMachines = (col) => {
    if (col === state.sortColMachines) {
      setState({
        sortDirMachines: state.sortDirMachines === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setState({
        sortColMachines: col,
        sortDirMachines: 'asc',
      });
    }
  };
  return (
    <Header>
      <ColTitle onClick={() => toggleSortCardMachines('GROUP_NAME')}>
        {t('maquinas')}
        {state.sortColMachines === 'GROUP_NAME' ? bottomMachines : ''}
      </ColTitle>
      <ColTitleCenter onClick={() => toggleSortCardMachines('DEV_AUTO')}>
        {t('automacao')}
        {state.sortColMachines === 'DEV_AUTO' ? bottomMachines : ''}
      </ColTitleCenter>
      <ColTitleCenter onClick={() => toggleSortCardMachines('status')}>
        {t('conexao')}
        {state.sortColMachines === 'status' ? bottomMachines : ''}
      </ColTitleCenter>
      <ColTitleCenter onClick={() => toggleSortCardMachines('H_INDEX')}>
        {t('saude')}
        {state.sortColMachines === 'H_INDEX' ? bottomMachines : ''}
      </ColTitleCenter>
    </Header>
  );
}

function ButtonsTypeOfSolution({
  nobreaks,
  illumination,
  typeofSolution,
  setTypeOfSolution,
}) {
  const arraySolutions = [
  ] as { solution: string, label: string }[];

  if (nobreaks.length > 0) {
    arraySolutions.push({
      solution: 'nobreak',
      label: 'Nobreak',
    });
  }

  if (illumination.length > 0) {
    arraySolutions.push({
      solution: 'illumination',
      label: 'Iluminação',
    });
  }

  useEffect(() => {
    setTypeOfSolution(arraySolutions[0].solution);
  }, []);

  return (
    <ContainerTypeOfSolutionsButton>
      {
        arraySolutions.map((item) => (
          <ButtonTypeSolution
            key={item.label}
            onClick={() => { setTypeOfSolution(item.solution); }}
            isClicked={typeofSolution === item.solution}
          >
            {item.label}
          </ButtonTypeSolution>
        ))
      }
    </ContainerTypeOfSolutionsButton>
  );
}

function HeaderSolutions({ state, setState, typeofSolution }) {
  const bottomIllumination = state.sortDirIllumination === 'desc' ? <ChevronBottom /> : <ChevronTop />;
  const toggleSortCardIllumination = (col) => {
    if (col === state.sortColIllumination) {
      setState({
        sortDirIllumination: state.sortDirIllumination === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setState({
        sortColIllumination: col,
        sortDirIllumination: 'asc',
      });
    }
  };

  const arrayHeaderNobreak = [
    {
      label: 'Monit.',
      value: 'monit',
    },
    {
      label: 'Status',
      value: 'status',
    },
    {
      label: 'Dur. Média',
      value: 'averageDur',
    },
    {
      label: 'Autonomia',
      value: 'autonomy',
    },
    {
      label: 'Conexão',
      value: 'conection',
    },
  ];

  const arrayHeaderIllumination = [
    {
      value: 'DEVICE_CODE',
      label: 'Dispositivo',
      onClick: () => toggleSortCardIllumination('DEVICE_CODE'),
    },
    {
      value: 'STATUS',
      label: 'Status',
      onClick: () => toggleSortCardIllumination('STATUS'),
    },
    {
      value: 'CONNECTION',
      label: 'Conexão',
      onClick: () => toggleSortCardIllumination('CONNECTION'),
    },
  ];

  return (
    <Header style={{
      backgroundColor: 'rgba(196, 196, 196, 0.11)',
      width: '100%',
      paddingLeft: typeofSolution === 'nobreak' ? 18 : 10,
      paddingRight: '8px',
    }}
    >
      <ColTitle onClick={() => toggleSortCardIllumination('NAME')}>
        {t('utilitarios')}
        {state.sortColIllumination === 'NAME' ? bottomIllumination : ''}
      </ColTitle>
      {
        typeofSolution === 'nobreak' && (
          arrayHeaderNobreak.map((item) => (
            <ColTitleCenter
              key={item.label}
            >
              {item.label}
            </ColTitleCenter>
          ))
        )
      }
      {
        typeofSolution === 'illumination' && (
          arrayHeaderIllumination.map((item) => (
            <ColTitleCenter
              key={item.label}
              onClick={item.onClick}
            >
              {item.label}
              {state.sortColIllumination === item.value ? bottomIllumination : ''}
            </ColTitleCenter>
          ))
        )
      }
    </Header>
  );
}

const HealthToolTip = ({ H_INDEX, H_DESC, H_DATE }): JSX.Element => {
  let title = t('equipamentoOffline');
  if (H_INDEX === 25) title = t('manutencaoUrgente');
  if (H_INDEX === 50) title = t('riscoIminente');
  if (H_INDEX === 75) title = t('foraDeEspecificacao');
  if (H_INDEX === 100) title = t('funcionandoCorretamente');
  if (H_INDEX === 4) title = t('equipamentoDesativado');

  return (
    <HealthToolTipDiv>
      <ToolTipRowTitle>
        <NewUnitsHealthIcon H_INDEX={H_INDEX} />
        <ToolTipTitle>
          { title }
        </ToolTipTitle>
      </ToolTipRowTitle>
      <SubTitle>{t('laudoTecnico')}</SubTitle>
      <HealthDesc>{ H_DESC }</HealthDesc>
      <HealtLastAtt>
        { getLastAtt(H_DATE) }
      </HealtLastAtt>
    </HealthToolTipDiv>
  );

  function getLastAtt(date: string) {
    if (moment().diff(moment(date), 'minutes') < 60) {
      return `${t('haMinutos', { time: moment().diff(moment(date), 'minutes') })}`;
    }
    if (moment().diff(moment(date), 'h') < 24) {
      return `${t('haHoras', { hour: moment().diff(moment(date), 'h'), min: moment().diff(moment(date), 'minutes') })}`;
    }
    if (moment().diff(moment(date), 'd') < 7) {
      return `${t('haDias', { day: moment().diff(moment(date), 'd') })}`;
    }
    if (moment().diff(moment(date), 'weeks') < 4) {
      return `${t('haSemanas', { week: moment().diff(moment(date), 'weeks') })}`;
    }
    if (moment().diff(moment(date), 'months') < 12) {
      return `${t('haMeses', { month: moment().diff(moment(date), 'months') })}`;
    }
    return `${t('haAnos', { year: moment().diff(moment(date), 'y') })}`;
  }
};
