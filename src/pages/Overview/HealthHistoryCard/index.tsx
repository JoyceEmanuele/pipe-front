import { useMemo, useState } from 'react';
import { Flex, Box } from 'reflexbox';

import {
  Card, Loader,
} from '../../../components';
import { formatHealthIcon, healthLevelColor } from '../../../components/HealthIcon';
import styles from './styles.module.css';
import ReactTooltip from 'react-tooltip';
import { ToggleSwitchMini } from '../../../components/ToggleSwitch';
import { useTranslation } from 'react-i18next';
import { useCard } from '~/contexts/CardContext';
import { LinkIcon } from '~/icons';
import { Link } from 'react-router-dom';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

const levelsList = {
  red: { color: '#e00030', hIndex: 25, buttonText: 'Urgente' },
  orange: { color: '#ff4d00', hIndex: 50, buttonText: 'Em Risco' },
  yellow: { color: '#f8d000', hIndex: 75, buttonText: 'F / Espec.' },
  green: { color: '#5ab365', hIndex: 100, buttonText: 'Correto' },
  deactiv: { color: 'grey', hIndex: 4, buttonText: 'Desativada' },
  others: { color: '#bbbbbb', hIndex: 0, buttonText: 'Sem Info' },
};

export function HealthHistoryCard(props: {
  healthHistory: null|{
    day: string;
    health: {
      green: number;
      yellow: number;
      orange: number;
      red: number;
      deactiv: number;
      others: number;
    };
    powerTR: {
      green: number;
      yellow: number;
      orange: number;
      red: number;
      deactiv: number;
      others: number;
    };
  }[],
  isLoading: boolean,
  render: any,
  state: {
    filter: string;
    showList: boolean;
    showAsHistory: boolean;
    disabledLevels: {
        [level: string]: boolean;
    };
  }
}): JSX.Element {
  const { t } = useTranslation();
  const { state, render } = props;
  return (
    <Box width={[1, 1, 1, 1, 25 / 51, 25 / 51]} mb={40}>
      <Card noPadding>
        <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '12px' }}>
          <Flex
            style={{
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div className={styles.TopTitle}>
              {t('ciclos')}
            </div>
            <div className={styles.TopDate}>{daysRange(props.healthHistory)}</div>
          </Flex>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <span>Saúde Atual</span>
          <ToggleSwitchMini checked={!!styles.TopTitle} style={{ margin: '0 8px' }} />
          <span>{t('Histórico')}</span>
        </div>

        <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '12px' }}>
          {props.isLoading ? (
            <div className={styles.OverLay}>
              <Loader variant="primary" size="large" />
            </div>
          ) : <></>}
          <HealthHistoryContents render={render} state={state} healthHistory={props.healthHistory} />
        </div>
      </Card>
    </Box>
  );
}

export function HealthHistoryContents(props: {
  healthHistory: null|{
    day: string;
    health: {
      green: number;
      yellow: number;
      orange: number;
      red: number;
      deactiv: number;
      others: number;
    };
    powerTR: {
      green: number;
      yellow: number;
      orange: number;
      red: number;
      deactiv: number;
      others: number;
    };
  }[],
  render: any,
  state: {
    filter: string;
    showList: boolean;
    showAsHistory: boolean;
    disabledLevels: {
        [level: string]: boolean;
    };
  }
}): JSX.Element {
  const { t } = useTranslation();
  const { state, render } = props;
  const [isMachine, setIsMachine] = useState(true); // Altera seleção do switch "Máquinas/TRs"
  const isDesktop = window.matchMedia('(min-width: 765px)');
  const isMobile = !isDesktop.matches;
  const healthHistory = useMemo(() => {
    if (!props.healthHistory?.length) return null;

    const levels = {} as {
      [level: string]: {
        color: string
        hIndex: number
        buttonText: string
        selected: boolean
        chartVals_dayPerct_Machine: number[]
        chartVals_dayCount_Machine: number[]
        chartVals_dayPerct_TR: number[]
        chartVals_dayCount_TR: number[]
        lastDay: {
          count: number
          TR: number
          selPercentageMachine: number
          selPercentageTR: number
        }
      }
    };
    for (const [level, lInfo] of Object.entries(levelsList)) {
      levels[level] = {
        color: lInfo.color,
        hIndex: lInfo.hIndex,
        buttonText: lInfo.buttonText,
        selected: !state.disabledLevels[level],
        chartVals_dayPerct_Machine: [],
        chartVals_dayCount_Machine: [],
        chartVals_dayPerct_TR: [],
        chartVals_dayCount_TR: [],
        lastDay: {
          count: 0,
          TR: 0,
          selPercentageMachine: 0,
          selPercentageTR: 0,
        },
      };
    }

    const daysList = [] as {
      day: string,
      dayDMY: string,
      containerSizeMachine: number,
      containerSizeTR: number,
      dayTotalCount: number,
      dayTotalTR: number,
      dayGreenPrctMachine: number,
      dayROYPrctMachine: number,
      dayGreenMachine: number,
      dayROYMachine: number,
      dayGreenPrctTR: number,
      dayROYPrctTR: number,
      dayGreenTR: number,
      dayROYTR: number,
    }[];
    let topValueMachine;
    let topValueTR;
    let vertGridMachine;
    let vertGridTR;
    {
      let maxCount = 0;
      let maxTR = 0;
      for (const dayHealth of props.healthHistory) {
        levels.green.chartVals_dayCount_Machine.push(dayHealth.health.green);
        levels.yellow.chartVals_dayCount_Machine.push(dayHealth.health.yellow);
        levels.orange.chartVals_dayCount_Machine.push(dayHealth.health.orange);
        levels.red.chartVals_dayCount_Machine.push(dayHealth.health.red);
        levels.deactiv.chartVals_dayCount_Machine.push(dayHealth.health.deactiv);
        levels.others.chartVals_dayCount_Machine.push(dayHealth.health.others);

        levels.green.chartVals_dayCount_TR.push(dayHealth.powerTR.green);
        levels.yellow.chartVals_dayCount_TR.push(dayHealth.powerTR.yellow);
        levels.orange.chartVals_dayCount_TR.push(dayHealth.powerTR.orange);
        levels.red.chartVals_dayCount_TR.push(dayHealth.powerTR.red);
        levels.deactiv.chartVals_dayCount_TR.push(dayHealth.powerTR.deactiv);
        levels.others.chartVals_dayCount_TR.push(dayHealth.powerTR.others);

        let daySelectedCount = 0;
        if (levels.green.selected) daySelectedCount += dayHealth.health.green;
        if (levels.yellow.selected) daySelectedCount += dayHealth.health.yellow;
        if (levels.orange.selected) daySelectedCount += dayHealth.health.orange;
        if (levels.red.selected) daySelectedCount += dayHealth.health.red;
        if (levels.deactiv.selected) daySelectedCount += dayHealth.health.deactiv;
        if (levels.others.selected) daySelectedCount += dayHealth.health.others;

        if (daySelectedCount > maxCount) maxCount = daySelectedCount;

        let daySelectedTR = 0;
        if (levels.green.selected) daySelectedTR += dayHealth.powerTR.green;
        if (levels.yellow.selected) daySelectedTR += dayHealth.powerTR.yellow;
        if (levels.orange.selected) daySelectedTR += dayHealth.powerTR.orange;
        if (levels.red.selected) daySelectedTR += dayHealth.powerTR.red;
        if (levels.deactiv.selected) daySelectedTR += dayHealth.powerTR.deactiv;
        if (levels.others.selected) daySelectedTR += dayHealth.powerTR.others;

        if (daySelectedTR > maxTR) maxTR = daySelectedTR;

        levels.green.chartVals_dayPerct_Machine.push(daySelectedCount && levels.green.selected && Math.floor(dayHealth.health.green / daySelectedCount * 1000) / 10 || 0);
        levels.yellow.chartVals_dayPerct_Machine.push(daySelectedCount && levels.yellow.selected && Math.floor(dayHealth.health.yellow / daySelectedCount * 1000) / 10 || 0);
        levels.orange.chartVals_dayPerct_Machine.push(daySelectedCount && levels.orange.selected && Math.floor(dayHealth.health.orange / daySelectedCount * 1000) / 10 || 0);
        levels.red.chartVals_dayPerct_Machine.push(daySelectedCount && levels.red.selected && Math.floor(dayHealth.health.red / daySelectedCount * 1000) / 10 || 0);
        levels.deactiv.chartVals_dayPerct_Machine.push(daySelectedCount && levels.deactiv.selected && Math.floor(dayHealth.health.deactiv / daySelectedCount * 1000) / 10 || 0);
        levels.others.chartVals_dayPerct_Machine.push(daySelectedCount && levels.others.selected && Math.floor(dayHealth.health.others / daySelectedCount * 1000) / 10 || 0);

        levels.green.chartVals_dayPerct_TR.push(daySelectedTR && levels.green.selected && Math.floor(dayHealth.powerTR.green / daySelectedTR * 1000) / 10 || 0);
        levels.yellow.chartVals_dayPerct_TR.push(daySelectedTR && levels.yellow.selected && Math.floor(dayHealth.powerTR.yellow / daySelectedTR * 1000) / 10 || 0);
        levels.orange.chartVals_dayPerct_TR.push(daySelectedTR && levels.orange.selected && Math.floor(dayHealth.powerTR.orange / daySelectedTR * 1000) / 10 || 0);
        levels.red.chartVals_dayPerct_TR.push(daySelectedTR && levels.red.selected && Math.floor(dayHealth.powerTR.red / daySelectedTR * 1000) / 10 || 0);
        levels.deactiv.chartVals_dayPerct_TR.push(daySelectedTR && levels.deactiv.selected && Math.floor(dayHealth.powerTR.deactiv / daySelectedTR * 1000) / 10 || 0);
        levels.others.chartVals_dayPerct_TR.push(daySelectedTR && levels.others.selected && Math.floor(dayHealth.powerTR.others / daySelectedTR * 1000) / 10 || 0);

        let dayTotalCount = 0;
        dayTotalCount += dayHealth.health.green;
        dayTotalCount += dayHealth.health.yellow;
        dayTotalCount += dayHealth.health.orange;
        dayTotalCount += dayHealth.health.red;
        dayTotalCount += dayHealth.health.deactiv;
        dayTotalCount += dayHealth.health.others;

        let dayTotalTR = 0;
        dayTotalTR += dayHealth.powerTR.green;
        dayTotalTR += dayHealth.powerTR.yellow;
        dayTotalTR += dayHealth.powerTR.orange;
        dayTotalTR += dayHealth.powerTR.red;
        dayTotalTR += dayHealth.powerTR.deactiv;
        dayTotalTR += dayHealth.powerTR.others;

        daysList.push({
          day: dayHealth.day,
          dayDMY: `${dayHealth.day.substring(8, 10)}/${dayHealth.day.substring(5, 7)}/${dayHealth.day.substring(0, 4)}`,
          dayTotalCount,
          dayTotalTR,
          containerSizeMachine: daySelectedCount,
          containerSizeTR: daySelectedTR,
          dayGreenPrctMachine: Math.round(dayTotalCount && dayHealth.health.green / dayTotalCount * 1000) / 10,
          dayGreenMachine: dayHealth.health.green,
          dayROYPrctMachine: Math.round(dayTotalCount && (dayHealth.health.red + dayHealth.health.orange + dayHealth.health.yellow) / dayTotalCount * 1000) / 10,
          dayROYMachine: (dayHealth.health.red + dayHealth.health.orange + dayHealth.health.yellow),
          dayGreenPrctTR: Math.round(dayTotalTR && dayHealth.powerTR.green / dayTotalTR * 1000) / 10,
          dayGreenTR: dayHealth.powerTR.green,
          dayROYPrctTR: Math.round(dayTotalTR && (dayHealth.powerTR.red + dayHealth.powerTR.orange + dayHealth.powerTR.yellow) / dayTotalTR * 1000) / 10,
          dayROYTR: (dayHealth.powerTR.red + dayHealth.powerTR.orange + dayHealth.powerTR.yellow),
        });
      }

      let stepMachine;
      if (maxCount > 300) stepMachine = 100;
      else if (maxCount > 30) stepMachine = 10;
      else stepMachine = 5;
      topValueMachine = Math.ceil((maxCount || 1) / stepMachine) * stepMachine;

      let stepTR;
      if (maxTR > 300) stepTR = 100;
      else if (maxTR > 30) stepTR = 10;
      else stepTR = 5;
      topValueTR = Math.ceil((maxTR || 1) / stepTR) * stepTR;

      vertGridMachine = [];
      vertGridTR = [];
      for (let i = 0; i < 5; i++) {
        vertGridMachine.push(topValueMachine / 5 * i);
      }
      for (let i = 0; i < 5; i++) {
        vertGridTR.push(topValueTR / 5 * i);
      }
      vertGridMachine.push(topValueMachine);
      vertGridTR.push(topValueTR);
      vertGridMachine = vertGridMachine.reverse();
      vertGridTR = vertGridTR.reverse();
    }

    for (const dayInfo of daysList) {
      dayInfo.containerSizeMachine = Math.round(dayInfo.containerSizeMachine / topValueMachine * 1000) / 10;
      dayInfo.containerSizeTR = Math.round(dayInfo.containerSizeTR / topValueTR * 1000) / 10;
    }

    const lastPoint = props.healthHistory[props.healthHistory.length - 1];

    levels.green.lastDay.count = lastPoint.health.green;
    levels.yellow.lastDay.count = lastPoint.health.yellow;
    levels.orange.lastDay.count = lastPoint.health.orange;
    levels.red.lastDay.count = lastPoint.health.red;
    levels.deactiv.lastDay.count = lastPoint.health.deactiv;
    levels.others.lastDay.count = lastPoint.health.others;

    levels.green.lastDay.TR = lastPoint.powerTR.green;
    levels.yellow.lastDay.TR = lastPoint.powerTR.yellow;
    levels.orange.lastDay.TR = lastPoint.powerTR.orange;
    levels.red.lastDay.TR = lastPoint.powerTR.red;
    levels.deactiv.lastDay.TR = lastPoint.powerTR.deactiv;
    levels.others.lastDay.TR = lastPoint.powerTR.others;

    let selectedCount = 0;
    let selectedTR = 0;
    for (const lInfo of Object.values(levels)) {
      if (!lInfo.selected) continue;
      selectedCount += lInfo.lastDay.count;
      selectedTR += lInfo.lastDay.TR;
    }
    for (const lInfo of Object.values(levels)) {
      if (!lInfo.selected) continue;
      lInfo.lastDay.selPercentageMachine = selectedCount && Math.round(lInfo.lastDay.count / selectedCount * 100);
      lInfo.lastDay.selPercentageTR = selectedTR && Math.round(lInfo.lastDay.TR / selectedTR * 100);
    }

    return {
      daysList,
      vertGridMachine,
      vertGridTR,
      lastDayDMY: daysList[daysList.length - 1].dayDMY,
      levels,
      selectedCount,
      selectedTR,
    };
  }, [props.healthHistory, state.disabledLevels]);

  function switchLevel(level: string) {
    state.disabledLevels[level] = !state.disabledLevels[level];
    state.disabledLevels = { ...state.disabledLevels }; // Important to re-run useMemo
    render();
  }

  const { cards } = useCard();
  const machineCard = cards.find((card) => card.title === 'Máquinas');

  const healthLevelsLink = {
    Correto: 'Operando corretamente',
    'F / Espec.': 'Fora de especificação',
    'Em Risco': 'Risco iminente',
    Urgente: 'Manutenção urgente',
    Desativada: 'Máquina desativada',
    'Sem Info': 'Sem informação',
  };

  const generateLink = (level: string) => {
    const link = healthLevelsLink[level];
    return link;
  };

  function ToolTipContents(props: { dayIndex: number }) {
    const { dayIndex } = props;
    const dayInfo = healthHistory!.daysList[dayIndex];
    return (
      <>
        <div style={{ lineHeight: 'initial', paddingBottom: '14px' }}>{dayInfo.dayDMY}</div>
        {isMachine
          ? (
            <div style={{ lineHeight: 'initial', paddingBottom: '14px' }}>
              <span>{`${t('totalDeCiclos')}:`}</span>
              <span style={{
                fontWeight: 'bold', fontSize: '115%',
              }}
              >
                {formatNumberWithFractionDigits(dayInfo.dayTotalCount)}
              </span>
            </div>
          )
          : (
            <div style={{ lineHeight: 'initial', paddingBottom: '14px' }}>
              <span>{`${t('capacidadeTotal')}:`}</span>
              <span style={{
                fontWeight: 'bold', fontSize: '16px',
              }}
              >
                {formatNumberWithFractionDigits(dayInfo.dayTotalTR)}
                <span style={{ fontWeight: 'normal', fontSize: '13px' }}> TR</span>
              </span>
            </div>
          )}
        <Flex style={{
          flexWrap: 'wrap', justifyContent: 'space-around', minWidth: '130px', maxWidth: '185px',
        }}
        >
          {Object.entries(healthHistory!.levels).filter(([, x]) => x.selected).map(([lId, level]) => (
            <div key={lId} className={styles.TooltipLevelContainer}>
              <div className={styles.TooltipIconContainer}>
                <div className={styles.StyledBox2}>
                  <div className={styles.Icon} style={{ backgroundColor: healthLevelColor(level.hIndex) }}>
                    {formatHealthIcon(level.hIndex)}
                  </div>
                </div>
              </div>
              {isMachine
                ? (
                  <div style={{
                    fontWeight: 'bold', fontSize: '115%', display: 'flex', flexDirection: 'column',
                  }}
                  >
                    <span>{formatNumberWithFractionDigits(level.chartVals_dayCount_Machine[dayIndex])}</span>
                    <span style={{ fontWeight: 'normal', fontSize: '12px' }}>{`${formatNumberWithFractionDigits(level.chartVals_dayPerct_Machine[dayIndex])}%`}</span>

                  </div>
                )
                : (
                  <div style={{
                    fontWeight: 'bold', fontSize: '14px', display: 'flex', flexDirection: 'column',
                  }}
                  >
                    <span>
                      {formatNumberWithFractionDigits(level.chartVals_dayCount_TR[dayIndex])}
                      <span style={{ fontWeight: 'normal', fontSize: '11px' }}> TR</span>
                    </span>
                    <span style={{ fontWeight: 'normal', fontSize: '12px' }}>{`${formatNumberWithFractionDigits(level.chartVals_dayPerct_TR[dayIndex])}%`}</span>
                  </div>
                )}
            </div>
          ))}
        </Flex>
        <hr />
        <Flex style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <Flex style={{ alignItems: 'center' }}>
              <div className={styles.HealthCircle} style={{ backgroundColor: levelsList.green.color }} />
              {isMachine
                ? <span>{`${formatNumberWithFractionDigits(dayInfo.dayGreenPrctMachine)}%`}</span>
                : <span>{`${formatNumberWithFractionDigits(dayInfo.dayGreenPrctTR)}%`}</span>}
            </Flex>
            {isMachine
              ? <span>{`${formatNumberWithFractionDigits(dayInfo.dayGreenMachine)} ciclos`}</span>
              : <span>{`${formatNumberWithFractionDigits(dayInfo.dayGreenTR)} TR`}</span>}
          </div>
          <div>
            <Flex style={{ alignItems: 'center' }}>
              <div className={styles.HealthCircle} style={{ backgroundColor: levelsList.red.color }} />
              <div className={styles.HealthCircle} style={{ backgroundColor: levelsList.orange.color }} />
              <div className={styles.HealthCircle} style={{ backgroundColor: levelsList.yellow.color }} />
              {isMachine
                ? <span>{`${formatNumberWithFractionDigits(dayInfo.dayROYPrctMachine)}%`}</span>
                : <span>{`${formatNumberWithFractionDigits(dayInfo.dayROYPrctTR)}%`}</span>}
            </Flex>
            {isMachine
              ? <span>{`${formatNumberWithFractionDigits(dayInfo.dayROYMachine)} ${t('ciclos')}`}</span>
              : <span>{`${formatNumberWithFractionDigits(dayInfo.dayROYTR)} TR`}</span>}
          </div>
        </Flex>
      </>
    );
  }

  return (
    <div style={{ fontSize: '75%', fontFamily: 'sans-serif' }}>
      <Flex
        flexDirection="row"
        justifyContent="right"
        alignItems="center"
        marginBottom="12px"
        minWidth="280px"
        style={{
          fontSize: '12px', fontFamily: 'Inter', fontWeight: 400, lineHeight: '20px',
        }}
      >
        <span>{t('ciclos')}</span>
        <ToggleSwitchMini
          checked={!isMachine}
          onClick={() => { setIsMachine(!isMachine); render(); }}
          style={{ marginLeft: '10px', marginRight: '10px' }}
        />
        <span>{t('Valor em TR')}</span>
      </Flex>

      <div className={styles.ChartContainer1}>
        <div className={styles.ChartContainer}>
          {healthHistory && healthHistory.daysList.map((dayInfo, i) => (
            <div key={dayInfo.day} className={styles.BarContainer}>
              <div
                style={{
                  width: '1px',
                  height: '100%',
                  borderLeft: '1px dashed lightgrey',
                  margin: '0 auto',
                }}
              />
            </div>
          ))}
        </div>
        {isMachine
          ? healthHistory && healthHistory.vertGridMachine.map((label, i) => (
            <div
              key={i / (healthHistory.vertGridMachine.length - 1)}
              className={styles.HorizontalGrid}
              style={{
                top: `${Math.round(1000 / (healthHistory.vertGridMachine.length - 1) * i) / 10}%`,
                left: '53px',
                width: 'calc(100% - 63px)',
              }}
            />
          ))
          : healthHistory && healthHistory.vertGridTR.map((label, i) => (
            <div
              key={i / (healthHistory.vertGridTR.length - 1)}
              className={styles.HorizontalGrid}
              style={{
                top: `${Math.round(1000 / (healthHistory.vertGridTR.length - 1) * i) / 10}%`,
                left: '53px',
                width: 'calc(100% - 63px)',
              }}
            />
          ))}

        {isMachine
          ? healthHistory && healthHistory.vertGridMachine.map((label, i) => (
            <span
              key={i / (healthHistory.vertGridMachine.length - 1)}
              className={styles.VerticalLabels}
              style={{ top: `calc(${Math.round(100 / (healthHistory.vertGridMachine.length - 1) * i)}% - 8px)` }}
            >
              {(label !== 0) && formatNumberWithFractionDigits(label)}
            </span>
          ))
          : healthHistory && healthHistory.vertGridTR.map((label, i) => (
            <span
              key={i / (healthHistory.vertGridTR.length - 1)}
              className={styles.VerticalLabels}
              style={{ top: `calc(${Math.round(100 / (healthHistory.vertGridTR.length - 1) * i)}% - 8px)` }}
            >
              {(label !== 0) && formatNumberWithFractionDigits(label)}
            </span>
          ))}
        <div className={styles.ChartContainer}>
          {healthHistory && healthHistory.daysList.map((dayInfo, i) => (
            <div key={dayInfo.day} className={styles.BarContainer}>
              <div
                className={styles.BarSubContainer}
                style={{ height: `${isMachine ? dayInfo.containerSizeMachine : dayInfo.containerSizeTR}%` }}
                data-tip
                data-for={`health-${dayInfo.day}`}
              >
                {isMachine
                  ? Object.entries(healthHistory.levels).filter(([, x]) => x.selected).map(([lId, level]) => (
                    <div key={lId} style={{ height: `${level.chartVals_dayPerct_Machine[i]}%`, backgroundColor: level.color }} />
                  ))
                  : Object.entries(healthHistory.levels).filter(([, x]) => x.selected).map(([lId, level]) => (
                    <div key={lId} style={{ height: `${level.chartVals_dayPerct_TR[i]}%`, backgroundColor: level.color }} />
                  ))}
              </div>
              <ReactTooltip
                id={`health-${dayInfo.day}`}
                place="right"
                border
                textColor="#000000"
                backgroundColor="rgba(255, 255, 255, 0.97)"
                borderColor="#202370"
              >
                <ToolTipContents dayIndex={i} />
              </ReactTooltip>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '5px',
          paddingLeft: '40px',
        }}
      >
        {healthHistory && healthHistory.daysList.map((dayInfo) => (
          <div>
            {dayInfo.dayDMY.substring(0, 5)}
          </div>
        ))}
      </div>
      <Flex marginTop="12px" alignItems="center" minHeight="50px" flexWrap={isMobile ? 'wrap' : 'nowrap'}>
        {healthHistory && (
          <>
            <div style={{ minWidth: '70px', alignSelf: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '115%' }}>Total</div>
              <div>{healthHistory.lastDayDMY}</div>
            </div>
            <div
              style={{
                minWidth: '90px',
                lineHeight: '2em',
                textAlign: 'center',
                marginRight: '10px',
              }}
            >
              {isMachine ? (
                <>
                  <div style={{ fontSize: '21px', fontWeight: 'bold' }}>{formatNumberWithFractionDigits(healthHistory.selectedCount)}</div>
                  <div style={{ fontWeight: 'bold' }}>{t('ciclos')}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
                    {formatNumberWithFractionDigits(healthHistory.selectedTR)}
                    <span style={{ fontSize: '12px', fontWeight: 'normal' }}> TR</span>
                  </div>
                </>
              )}
            </div>
            <div style={{ width: '100%' }}>
              <div>
                <div
                  style={{
                    display: 'flex',
                    height: '20px',
                    width: '100%',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  {isMachine
                    ? Object.entries(healthHistory.levels).filter(([, x]) => x.lastDay.selPercentageMachine).map(([lId, level]) => (
                      <div key={lId} style={{ width: `${level.lastDay.selPercentageMachine}%`, backgroundColor: level.color }} />
                    ))
                    : Object.entries(healthHistory.levels).filter(([, x]) => x.lastDay.selPercentageTR).map(([lId, level]) => (
                      <div key={lId} style={{ width: `${level.lastDay.selPercentageTR}%`, backgroundColor: level.color }} />
                    ))}
                </div>
              </div>
              <Flex style={{ justifyContent: 'space-between' }}>
                <Flex style={{ gap: '18px', marginRight: '14px' }}>
                  {Object.entries(healthHistory.levels).filter(([, x]) => x.selected).map(([lId, level]) => (
                    <div key={lId} className={styles.HorizHealthSubContainer}>
                      <div className={styles.HorizHealthSubTop}>
                        <div className={styles.HealthCircle} style={{ backgroundColor: level.color }} />
                        {isMachine
                          ? <span>{`${level.lastDay.selPercentageMachine}%`}</span>
                          : <span>{`${level.lastDay.selPercentageTR}%`}</span>}
                      </div>
                    </div>
                  ))}
                </Flex>
              </Flex>
            </div>
          </>
        )}
      </Flex>
      <Flex
        style={{
          marginTop: '10px', justifyContent: 'space-between', maxHeight: '120px', flexWrap: isMobile ? 'wrap' : 'nowrap', overflow: 'auto', gap: '5px',
        }}
      >
        {healthHistory && (
          <>
            {Object.entries(healthHistory.levels).map(([lId, level]) => (
              <Flex alignItems="center" justifyContent="center" height={machineCard?.isExpanded ? '37px' : 'auto'} key={lId}>
                <div
                  key={lId}
                  className={state.disabledLevels[lId] ? isMobile ? styles.HealthButtonUnSelectedMobile : styles.HealthButtonUnSelected : isMobile ? styles.HealthButtonSelectedMobile : styles.HealthButtonSelected}
                  style={machineCard?.isExpanded ? { flexDirection: 'row', height: '37px' } : {
                    flexDirection: 'column', height: 'auto', padding: '10px 5px', borderRadius: '8.905px',
                  }}
                  onClick={() => { switchLevel(lId); }}
                >
                  <div className={styles.HealthButtonIconContainer}>
                    <div className={styles.StyledBox}>
                      <div className={styles.Icon} style={{ backgroundColor: healthLevelColor(level.hIndex) }}>
                        {formatHealthIcon(level.hIndex)}
                      </div>
                    </div>
                  </div>
                  {isMachine
                    ? <div className={styles.HealthButtonCount} style={{ fontSize: '18px' }}>{formatNumberWithFractionDigits(level.lastDay.count)}</div>
                    : (
                      <div className={styles.HealthButtonCount} style={{ fontSize: '15px' }}>
                        {formatNumberWithFractionDigits(level.lastDay.TR)}
                        <span style={{ fontWeight: 'normal', fontSize: '11px' }}> TR</span>
                      </div>
                    )}
                  <div className={styles.HealthButtonText}>{t(level.buttonText)}</div>
                </div>
                {machineCard?.isExpanded && (
                <Flex
                  padding="10px"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  className={styles.HealthButtonLink}
                >
                  <Link to={`/analise/maquinas?preFiltered=${generateLink(level.buttonText)}`} target="_blank" rel="noreferrer" style={{ color: '#202370' }}>
                    <LinkIcon width="14px" height="14px" />
                  </Link>
                </Flex>
                )}
              </Flex>
            ))}
          </>
        )}
      </Flex>
    </div>
  );
}

export function daysRange(days: null|({ day: string }[])) {
  if (!days) return '';
  if (!days.length) return '';
  let lastDay = days[days.length - 1].day;
  lastDay = `${lastDay.substring(8, 10)}/${lastDay.substring(5, 7)}/${lastDay.substring(0, 4)}`;
  if (days.length === 1) return lastDay;
  let firstDay = days[0].day;
  firstDay = `${firstDay.substring(8, 10)}/${firstDay.substring(5, 7)}/${firstDay.substring(0, 4)}`;
  return `${firstDay} a ${lastDay}`;
}

// const TopTitle = styled.div`
//   font-family: Inter;
//   font-style: normal;
//   font-weight: bold;
//   font-size: 13px;
//   line-height: 16px;
//   color: ${colors.Black};
// `;

// const TopDate = styled.div`
//   font-family: Inter;
//   font-style: normal;
//   font-weight: 600;
//   font-size: 11px;
//   line-height: 24px;
//   text-align: right;
//   letter-spacing: -0.5px;
//   color: ${colors.GreyDark};
// `;

// const OverLay = styled.div`
//   position: absolute;
//   display: flex;
//   background-color: #eceaea;
//   width: 100%;
//   height: 100%;
//   z-index: 10000000;
//   opacity: 0.4;
//   filter: alpha(opacity=40);
//   top: 0;
//   left: 0;
// `;

// const StyledBox = styled(Box)(
//   (props: { color: string }) => `
//   div {
//     width: 32px;
//     height: 32px;
//     background-color: ${props.color};
//   }
//   svg {
//     width: 20px;
//     height: 20px;
//   }
// `,
// );

// const StyledBox2 = styled(Box)(
//   (props: { color: string }) => `
//   div {
//     width: 20px;
//     height: 20px;
//     background-color: ${props.color};
//   }
//   svg {
//     width: 12px;
//     height: 12px;
//   }
// `,
// );

// const Icon = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin: 0 4px;
//   border-radius: 8px;
// `;
