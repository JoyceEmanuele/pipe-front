import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Box } from 'reflexbox';
import {
  Card, Loader,
} from '../../../components';
import styles from './styles.module.css';
import ReactTooltip from 'react-tooltip';
import { useCard } from '~/contexts/CardContext';
import { formatNumberWithFractionDigits, thousandPointFormat } from '~/helpers/thousandFormatNumber';

const categoriesList = {
  high: { color: '#e00030', buttonText: 'Temperatura Acima do Limite' },
  good: { color: '#5ab365', buttonText: 'Temperatura Dentro do Limite' },
  low: { color: '#2d81ff', buttonText: 'Temperatura Abaixo do Limite' },
  others: { color: '#bbbbbb', buttonText: 'Sem Info' },
} as { [category: string]: { color: string, buttonText: string } };

export function AmbsHistoryCard(props: {
  roomsHistory: null|{
    day: string;
    good: number;
    high: number;
    low: number;
    others: number;
    dutsList?: {
      DEV_ID: string
      ROOM_NAME: string
      TUSEMIN: number
      TUSEMAX: number
      med: number
      max: number
      min: number
      temprtAlert: 'low'|'high'|'good'|null
    }[],
  }[],
  isLoading: boolean,
  render: any,
  state: {
    filter: string;
    showList: boolean;
    showAsHistory: boolean;
    disabledCategories: {
        [category: string]: boolean;
      };
  }
}): JSX.Element {
  const { state, render } = props;
  const { t } = useTranslation();
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
              {t('ambientes')}
            </div>
            <div className={styles.TopDate}>{daysRange(props.roomsHistory)}</div>
          </Flex>
        </div>

        <div style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '12px' }}>
          {props.isLoading ? (
            <div className={styles.OverLay}>
              <Loader variant="primary" size="large" />
            </div>
          ) : <></>}
          <AmbsHistoryContents state={state} render={render} roomsHistory={props.roomsHistory} />
        </div>
      </Card>
    </Box>
  );
}

export function AmbsHistoryContents(props: {
  roomsHistory: null|{
    day: string;
    good: number;
    high: number;
    low: number;
    others: number;
    dutsList?: {
      DEV_ID: string
      ROOM_NAME: string
      TUSEMIN: number
      TUSEMAX: number
      med: number
      max: number
      min: number
      temprtAlert: 'low'|'high'|'good'|null
    }[],
  }[],
  render: any,
  state: {
    filter: string;
    showList: boolean;
    showAsHistory: boolean;
    disabledCategories: {
        [category: string]: boolean;
    };
  }
}): JSX.Element {
  const { state, render } = props;
  const { t } = useTranslation();
  const isDesktop = window.matchMedia('(min-width: 765px)');
  const isMobile = !isDesktop.matches;
  const roomsHistory = useMemo(() => {
    if (!props.roomsHistory?.length) return null;

    const categories = {} as {
      [category: string]: {
        color: string
        buttonText: string
        selected: boolean
        chartVals_dayPerct: number[]
        chartVals_dayCount: number[]
        lastDay: {
          count: number
          selPercentage: number
        }
      }
    };
    for (const [category, cInfo] of Object.entries(categoriesList)) {
      categories[category] = {
        color: cInfo.color,
        buttonText: cInfo.buttonText,
        selected: !state.disabledCategories[category],
        chartVals_dayPerct: [],
        chartVals_dayCount: [],
        lastDay: {
          count: 0,
          selPercentage: 0,
        },
      };
    }

    const daysList = [] as {
      day: string,
      dayDMY: string,
      containerSize: number,
      dutsList?: {
        DEV_ID: string
        limits: string
        color: string
        name: string
        max: string
        min: string
        med: string
      }[]
    }[];
    let topValue;
    let vertGrid;
    {
      let maxCount = 0;
      for (const dayInfo of props.roomsHistory) {
        categories.good.chartVals_dayCount.push(dayInfo.good);
        categories.high.chartVals_dayCount.push(dayInfo.high);
        categories.low.chartVals_dayCount.push(dayInfo.low);
        categories.others.chartVals_dayCount.push(dayInfo.others);

        let daySelectedCount = 0;
        if (categories.good.selected) daySelectedCount += dayInfo.good;
        if (categories.high.selected) daySelectedCount += dayInfo.high;
        if (categories.low.selected) daySelectedCount += dayInfo.low;
        if (categories.others.selected) daySelectedCount += dayInfo.others;

        if (daySelectedCount > maxCount) maxCount = daySelectedCount;

        categories.good.chartVals_dayPerct.push(daySelectedCount && categories.good.selected && Math.floor(dayInfo.good / daySelectedCount * 1000) / 10 || 0);
        categories.high.chartVals_dayPerct.push(daySelectedCount && categories.high.selected && Math.floor(dayInfo.high / daySelectedCount * 1000) / 10 || 0);
        categories.low.chartVals_dayPerct.push(daySelectedCount && categories.low.selected && Math.floor(dayInfo.low / daySelectedCount * 1000) / 10 || 0);
        categories.others.chartVals_dayPerct.push(daySelectedCount && categories.others.selected && Math.floor(dayInfo.others / daySelectedCount * 1000) / 10 || 0);

        let dayTotalCount = 0;
        dayTotalCount += dayInfo.good;
        dayTotalCount += dayInfo.high;
        dayTotalCount += dayInfo.low;
        dayTotalCount += dayInfo.others;

        const dutsList = dayInfo.dutsList && dayInfo.dutsList
          .filter((dut) => {
            if (dut.temprtAlert === 'good') return categories.good.selected;
            if (dut.temprtAlert === 'high') return categories.high.selected;
            if (dut.temprtAlert === 'low') return categories.low.selected;
            return categories.others.selected;
          })
          .sort((a, b) => {
            switch (a.temprtAlert) {
              case 'high': {
                switch (b.temprtAlert) {
                  case 'high': return 0;
                  case 'good': return -1;
                  case 'low': return -1;
                  default: return -1;
                }
              }
              case 'good': {
                switch (b.temprtAlert) {
                  case 'high': return 1;
                  case 'good': return 0;
                  case 'low': return -1;
                  default: return -1;
                }
              }
              case 'low': {
                switch (b.temprtAlert) {
                  case 'high': return 1;
                  case 'good': return 1;
                  case 'low': return 0;
                  default: return -1;
                }
              }
              default: {
                switch (b.temprtAlert) {
                  case 'high': return 1;
                  case 'good': return 1;
                  case 'low': return 1;
                  default: return 0;
                }
              }
            }
          })
          .map((dut) => ({
            DEV_ID: dut.DEV_ID,
            limits: (dut.TUSEMIN != null) && (dut.TUSEMAX != null) && `${formatNumberWithFractionDigits(dut.TUSEMIN)}°C - ${formatNumberWithFractionDigits(dut.TUSEMAX)}°C` || '-',
            color: (categoriesList[dut.temprtAlert || ''] || categoriesList.others).color,
            name: dut.ROOM_NAME || dut.DEV_ID,
            max: (dut.max == null) ? '-' : `${formatNumberWithFractionDigits(dut.max)}°C`,
            min: (dut.min == null) ? '-' : `${formatNumberWithFractionDigits(dut.min)}°C`,
            med: (dut.med == null) ? '-' : `${formatNumberWithFractionDigits(dut.med)}°C`,
          }));

        daysList.push({
          day: dayInfo.day,
          dayDMY: `${dayInfo.day.substring(8, 10)}/${dayInfo.day.substring(5, 7)}/${dayInfo.day.substring(0, 4)}`,
          containerSize: daySelectedCount,
          dutsList,
        });
      }

      let step;
      if (maxCount > 300) step = 100;
      else if (maxCount > 30) step = 10;
      else step = 5;
      topValue = Math.ceil((maxCount || 1) / step) * step;

      vertGrid = [];
      for (let i = 0; i < 5; i++) {
        vertGrid.push(topValue / 5 * i);
      }
      vertGrid.push(topValue);
      vertGrid = vertGrid.reverse();
    }

    for (const dayInfo of daysList) {
      dayInfo.containerSize = Math.round(dayInfo.containerSize / topValue * 1000) / 10;
    }

    const lastPoint = props.roomsHistory[props.roomsHistory.length - 1];

    categories.good.lastDay.count = lastPoint.good;
    categories.high.lastDay.count = lastPoint.high;
    categories.low.lastDay.count = lastPoint.low;
    categories.others.lastDay.count = lastPoint.others;

    let selectedCount = 0;
    for (const cInfo of Object.values(categories)) {
      if (!cInfo.selected) continue;
      selectedCount += cInfo.lastDay.count;
    }
    for (const cInfo of Object.values(categories)) {
      if (!cInfo.selected) continue;
      cInfo.lastDay.selPercentage = selectedCount && Math.round(cInfo.lastDay.count / selectedCount * 100);
    }

    return {
      daysList,
      vertGrid,
      lastDayDMY: daysList[daysList.length - 1].dayDMY,
      categories,
      selectedCount,
    };
  }, [props.roomsHistory, state.disabledCategories]);

  function switchLevel(category: string) {
    state.disabledCategories[category] = !state.disabledCategories[category];
    state.disabledCategories = { ...state.disabledCategories }; // This line is important to force useMemo to update
    render();
  }

  function ToolTipContents(props: { dayIndex: number }) {
    const { dayIndex } = props;
    const dayInfo = roomsHistory!.daysList[dayIndex];
    const dutsList = dayInfo.dutsList;
    return (
      <>
        <div style={{ lineHeight: 'initial', paddingBottom: '14px' }}>{dayInfo.dayDMY}</div>
        {(dutsList) && (
          <>
            <div style={{ display: 'flex' }}>
              {dutsList.map((dut) => (
                <div>
                  <div className={styles.StyledBox2} data-tip data-for={`room-${dut.DEV_ID}`}>
                    <div className={styles.Icon} style={{ backgroundColor: dut.color }}>
                      &nbsp;
                    </div>
                  </div>
                  <ReactTooltip
                    id={`room-${dut.DEV_ID}`}
                    place="right"
                    border
                    textColor="#000000"
                    backgroundColor="white"
                    borderColor="#202370"
                  >
                    <div><b>{`${t('ambiente')}:`}</b></div>
                    <div>{dut.name}</div>
                    <div className={styles.tooltip2Title}><b>{`${t('limiteDeTemperatura')}:`}</b></div>
                    <div>{dut.limits}</div>
                    <Flex className={styles.tooltip2Title} style={{ justifyContent: 'space-between', fontSize: '85%' }}>
                      <div>
                        <div><b>{`${t('Média')}:`}</b></div>
                        <div>{formatNumberWithFractionDigits(dut.med)}</div>
                      </div>
                      <div>
                        <div><b>Máx:</b></div>
                        <div>{formatNumberWithFractionDigits(dut.max)}</div>
                      </div>
                      <div>
                        <div><b>Mín:</b></div>
                        <div>{formatNumberWithFractionDigits(dut.min)}</div>
                      </div>
                    </Flex>
                  </ReactTooltip>
                </div>
              ))}
            </div>
            <hr />
          </>
        )}
        <Flex style={{ flexWrap: 'wrap', minWidth: '130px', maxWidth: '200px' }}>
          {Object.entries(roomsHistory!.categories).filter(([, x]) => x.selected).map(([cId, category]) => (
            <div style={{ width: '50px' }} key={cId} className={styles.TooltipLevelContainer}>
              <div className={styles.TooltipIconContainer}>
                <div className={styles.StyledBox2}>
                  <div className={styles.Icon} style={{ backgroundColor: categoriesList[cId].color }}>
                    &nbsp;
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '120%' }}>
                {thousandPointFormat(category.chartVals_dayCount[dayIndex])}
              </div>
              <div style={{ fontSize: '80%' }}>{`${Math.round(category.chartVals_dayPerct[dayIndex])}%`}</div>
            </div>
          ))}
        </Flex>
      </>
    );
  }

  const { cards } = useCard();
  const envCard = cards.find((card) => card.title === 'Ambientes');

  return (
    <div style={{ fontSize: '75%', fontFamily: 'sans-serif' }}>
      <div className={styles.ChartContainer1}>
        <div className={styles.ChartContainer}>
          {roomsHistory?.daysList.map((dayInfo, i) => (
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
        {roomsHistory?.vertGrid.map((label, i) => (
          <div
            key={i / (roomsHistory.vertGrid.length - 1)}
            className={styles.HorizontalGrid}
            style={{
              top: `${Math.round(1000 / (roomsHistory.vertGrid.length - 1) * i) / 10}%`,
              left: '53px',
              width: 'calc(100% - 63px)',
            }}
          />
        ))}
        {roomsHistory?.vertGrid.map((label, i) => (
          <span
            key={i / (roomsHistory.vertGrid.length - 1)}
            className={styles.VerticalLabels}
            style={{ top: `calc(${Math.round(100 / (roomsHistory.vertGrid.length - 1) * i)}% - 8px)` }}
          >
            {(label !== 0) && thousandPointFormat(label)}
          </span>
        ))}
        <div className={styles.ChartContainer}>
          {roomsHistory?.daysList.map((dayInfo, i) => (
            <div key={dayInfo.day} className={styles.BarContainer}>
              <div
                className={styles.BarSubContainer}
                style={{ height: `${dayInfo.containerSize}%` }}
                data-tip
                data-for={`room-${dayInfo.day}`}
              >
                {Object.entries(roomsHistory.categories).filter(([, x]) => x.selected).map(([cId, category]) => (
                  <div key={cId} style={{ height: `${category.chartVals_dayPerct[i]}%`, backgroundColor: category.color }} />
                ))}
              </div>
              <ReactTooltip
                id={`room-${dayInfo.day}`}
                place="right"
                effect="solid"
                delayHide={100}
                offset={{ top: 0, left: 10 }}
                border
                textColor="#000000"
                backgroundColor="rgba(255, 255, 255, 0.97)"
                borderColor="#202370"
                className={styles.tooltipHolder}
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
        {roomsHistory?.daysList.map((dayInfo) => (
          <div>
            {dayInfo.dayDMY.substring(0, 5)}
          </div>
        ))}
      </div>
      <Flex style={{ marginTop: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        {roomsHistory && (
          <>
            <div style={{ minWidth: '70px', alignSelf: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '115%' }}>Total</div>
              <div>{roomsHistory.lastDayDMY}</div>
            </div>
            <div
              style={{
                minWidth: '70px',
                lineHeight: '2em',
                textAlign: 'center',
                marginRight: '10px',
                paddingTop: '8px',
              }}
            >
              <div style={{ fontSize: '21px', fontWeight: 'bold' }}>{thousandPointFormat(roomsHistory.selectedCount)}</div>
              <div style={{ fontWeight: 'bold' }}>{t('ambientes')}</div>
            </div>
            <div style={{
              width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}
            >
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
                  {Object.entries(roomsHistory.categories).filter(([, x]) => x.lastDay.selPercentage).map(([cId, category]) => (
                    <div key={cId} style={{ width: `${category.lastDay.selPercentage}%`, backgroundColor: category.color }} />
                  ))}
                </div>
              </div>
              <Flex style={{ gap: '18px', marginRight: '14px', justifyContent: 'center' }}>
                {Object.entries(roomsHistory.categories).filter(([, x]) => x.selected).map(([cId, category]) => (
                  <div key={cId} className={styles.HorizHealthSubContainer}>
                    <div className={styles.HorizHealthSubTop}>
                      <div className={styles.HealthCircle} style={{ backgroundColor: category.color }} />
                      <span>{`${category.lastDay.selPercentage}%`}</span>
                    </div>
                  </div>
                ))}
              </Flex>
            </div>
          </>
        )}
      </Flex>
      <Flex flexWrap="wrap" style={{ marginTop: '10px', justifyContent: 'space-evenly', alignItems: 'center' }}>
        {roomsHistory && (
          <>
            {Object.entries(roomsHistory.categories).map(([cId, category]) => (
              <>
                {(envCard?.isExpanded && !isMobile) ? (
                  <div
                    key={cId}
                    className={state.disabledCategories[cId] ? styles.HealthButtonUnSelected : styles.HealthButtonSelected}
                    onClick={() => { switchLevel(cId); }}
                    style={{ flexDirection: 'row', width: '196px' }}
                  >
                    <div className={styles.HealthButtonIconContainer}>
                      <div className={styles.StyledBox}>
                        <div className={styles.Icon} style={{ backgroundColor: categoriesList[cId].color }}>
                         &nbsp;
                        </div>
                      </div>
                    </div>
                    <div className={styles.HealthButtonCount}>
                      {thousandPointFormat(category.lastDay.count)}
                    </div>
                    <div className={styles.HealthButtonText} style={envCard.isExpanded ? { width: '50%' } : {}}>{t(category.buttonText)}</div>
                  </div>
                ) : (
                  <div
                    key={cId}
                    className={state.disabledCategories[cId] ? styles.HealthButtonUnSelected : styles.HealthButtonSelected}
                    onClick={() => { switchLevel(cId); }}
                    style={{ flexDirection: 'column', width: '100px', height: '110px' }}
                  >
                    <div className={styles.HealthButtonIconContainer}>
                      <div className={styles.StyledBox}>
                        <div className={styles.Icon} style={{ backgroundColor: categoriesList[cId].color }}>
                                      &nbsp;
                        </div>
                      </div>
                    </div>
                    <div className={styles.HealthButtonCount}>{thousandPointFormat(category.lastDay.count)}</div>
                    <div className={styles.HealthButtonText}>{t(category.buttonText)}</div>
                  </div>
                )}
              </>
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
