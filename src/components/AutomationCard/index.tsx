import { useMemo } from 'react';
import { t } from 'i18next';

import { Flex, Box } from 'reflexbox';

import OrderIcon from '../../assets/img/order.svg';
import {
  Card, Table, Loader,
} from '..';
import { useStateVar } from '../../helpers/useStateVar';
import { colors } from '../../styles/colors';
import Pagination from 'rc-pagination';

import {
  Line,
  TopTitle,
  ItemTitle,
  ItemSubTitle,
  ItemValue,
  ItemVal,
  ItemLegend,
  ItemTitleCol,
  ItemValueTR,
  BtnList,
  StyledLink,
  CellLabel,
  OverLay,
} from './styles';
import { ICard, useCard } from '../../contexts/CardContext';
import { CardManager } from '../CardManager';

const automationColumns = [
  {
    Header: () => (
      <span>
        {t('unidade')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'UNIT_NAME',
    // disableSortBy: true,
    Cell: ({ row }) => (
      <CellLabel>{row.original.UNIT_NAME}</CellLabel>
    ),
  },
  {
    Header: () => (
      <span>
        {t('dispositivo')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'automDevId',
    // disableSortBy: true,
    Cell: (props) => <div><StyledLink to={`/analise/dispositivo/${props.row.original.automDevId}/informacoes`}>{props.row.original.automDevId}</StyledLink></div>,
  },
  {
    Header: () => (
      <span>
        {t('estrategia')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'strategy',
    // disableSortBy: true,
    Cell: (props) => <CellLabel>{props.row.original.strategy}</CellLabel>,
  },
  {
    Header: () => (
      <span>
        {t('metodo')}
        {' '}
        <img src={OrderIcon} />
      </span>
    ),
    accessor: 'method',
    // disableSortBy: true,
    Cell: ({ row }) => <CellLabel>{row.original.method}</CellLabel>,
  },
];

const pageLocale = {
  prev_page: t('paginaAnterior'),
  next_page: t('proximaPagina'),
  prev_5: t('5paginasAnteriores'),
  next_5: t('proximas5paginas'),
  prev_3: t('3paginasAnteriores'),
  next_3: t('proximas3paginas'),
};

type AutomationCardProps = {
  automationStats: any;
  automationList: any;
  maxWidth?: any;
  marginLeft: number;
  marginRight: number;
  isLoading: boolean;
  automationPag?: {
    tablePage: number,
    tablePageSize: number,
    totalItems: number,
  }
  onPageChange?: (page: number) => void
}

export const AutomationCard = ({
  automationStats,
  automationList,
  maxWidth = null,
  marginLeft = 0,
  marginRight = 0,
  isLoading = false,
  automationPag,
  onPageChange,
}: AutomationCardProps): JSX.Element => {
  const [state, render] = useStateVar(() => ({
    showList: false,
    filter: t('unidade'),
  }));
  const processedAutomation = useMemo(() => ((automationList) || [])
    .filter((x) => !!x.UNIT_NAME)
    .map((dev) => {
      let strategy;
      let method;

      if (dev.useSchedule && dev.useEcoMode) strategy = t('total');
      else if (!dev.useSchedule && !dev.useEcoMode) strategy = t('nada');
      else if (dev.useSchedule) strategy = t('programacao');
      else strategy = t('controle');

      if (dev.automDevType === 'dac') method = t('bloqueio');
      else if (dev.automDevType === 'dut') method = t('infra-vermelho');
      else method = t('controladoras');

      return {
        UNIT_NAME: dev.UNIT_NAME,
        automDevId: dev.automDevId,
        strategy,
        method,
      };
    })
    .sort((a, b) => {
      if (state.filter === t('unidade')) {
        if (a.UNIT_NAME < b.UNIT_NAME) return -1;
        if (a.UNIT_NAME > b.UNIT_NAME) return 1;
        return 0;
      }
      if (state.filter === t('dispositivo')) {
        if (a.automDevId < b.automDevId) return -1;
        if (a.automDevId > b.automDevId) return 1;
        return 0;
      }
      if (state.filter === t('estrategia')) {
        if (a.strategy < b.strategy) return -1;
        if (a.strategy > b.strategy) return 1;
        return 0;
      }
      if (state.filter === t('metodo')) {
        if (a.method < b.method) return -1;
        if (a.method > b.method) return 1;
        return 0;
      }
      return 0;
    }), [automationList, state.filter]);

  const getTotalAutomatedMachines = (automationStats && automationStats.automated && automationStats.automated.machines) || 0;
  const getTotalNoTAutomatedMachines = (automationStats && automationStats.notAutomated && automationStats.notAutomated.machines) || 0;
  const getTotalMachines = getTotalAutomatedMachines + getTotalNoTAutomatedMachines;
  const getTotalTRAutomatedMachines = (automationStats && automationStats.automated && automationStats.automated.powerTR) || 0;

  const { cards } = useCard();
  const automationCard = cards.find((card) => card.title === 'Automação');

  return (
    <Box
      width={automationCard?.isExpanded ? 1 : [1, 1, 1, 1, 25 / 51, 25 / 51]}
      mb={40}
      ml={marginLeft}
      mr={marginRight}
      style={{ maxWidth: maxWidth || 'none' }}
    >
      <Card>

        <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
          <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
            <TopTitle>{t('automacao')}</TopTitle>
          </Box>
          <CardManager card={automationCard as ICard} />
        </Flex>

        {isLoading ? (
          <OverLay>
            <Loader variant="primary" size="large" />
          </OverLay>
        ) : (
          <></>
        )}

        <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" mt={35} pl={15} pr={15} pb={30}>

          <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} pl={20} pr={20}>
            <Box width={1 / 3} justifyContent="center">
              <ItemTitle>
                {t('total')}
              </ItemTitle>
              <ItemSubTitle>
                {`${t('maquinas')}  Autom.`}
              </ItemSubTitle>
            </Box>
            <Box width={1 / 3}>
              <ItemValue>
                <ItemVal>
                  {getTotalAutomatedMachines}
                </ItemVal>
              </ItemValue>
            </Box>
            <Box width={1 / 3}>
              <Flex style={{ height: 15 }}>
                <div style={{
                  background: colors.BlueSecondary,
                  width: `${(getTotalAutomatedMachines / getTotalMachines) * 100}%`,
                  height: '100%',
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                }}
                />
                <div style={{
                  background: colors.LightLightGrey_v3,
                  width: `${(getTotalNoTAutomatedMachines / getTotalMachines) * 100}%`,
                  height: '100%',
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                }}
                />
              </Flex>
              <Flex justifyContent="center" alignItems="center" width={1}>
                <ItemLegend>
                  {Math.round(getTotalTRAutomatedMachines)}
                  {' '}
                  TR
                </ItemLegend>
              </Flex>
            </Box>
          </Flex>

          <Line />

          <Flex flexWrap="wrap" justifyContent="space-around" width={1} mt={17}>
            <Box width={1 / 2}>

              <Flex flexWrap="wrap" alignItems="center" width={1} mt={10}>
                <Box>
                  <ItemTitleCol>
                    {t('estrategia')}
                  </ItemTitleCol>
                </Box>
              </Flex>

              <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10}>
                <Box width={1 / 2}>
                  <ItemTitle>
                    {t('programacao')}
                  </ItemTitle>
                  <ItemSubTitle>
                    {`${t('total')} ${t('maquinas')}`}
                  </ItemSubTitle>
                </Box>
                <Box width={1 / 2}>
                  <ItemValue>
                    <ItemVal>{automationStats.scheduleOnly.machines}</ItemVal>
                  </ItemValue>
                  <ItemValueTR>
                    {automationStats.scheduleOnly.powerTR}
                    TR
                  </ItemValueTR>
                </Box>
              </Flex>
              <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10}>
                <Box width={1 / 2}>
                  <ItemTitle>
                    {t('controle')}
                  </ItemTitle>
                  <ItemSubTitle>
                    {`${t('total')} ${t('maquinas')}`}
                  </ItemSubTitle>
                </Box>
                <Box width={1 / 2}>
                  <ItemValue>
                    <ItemVal>{automationStats.ecoOnly.machines}</ItemVal>
                  </ItemValue>
                  <ItemValueTR>
                    {automationStats.ecoOnly.powerTR}
                    TR
                  </ItemValueTR>
                </Box>
              </Flex>
              <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10}>
                <Box width={1 / 2}>
                  <ItemTitle>
                    {t('total')}
                  </ItemTitle>
                  <ItemSubTitle>
                    {`${t('Prog.')} + ${t('controle')}`}
                  </ItemSubTitle>
                </Box>
                <Box width={1 / 2}>
                  <ItemValue>
                    <ItemVal>{automationStats.scheduleAndEco.machines}</ItemVal>
                  </ItemValue>
                  <ItemValueTR>
                    {automationStats.scheduleAndEco.powerTR}
                    TR
                  </ItemValueTR>
                </Box>
              </Flex>
              <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10}>
                <Box width={1 / 2}>
                  <ItemTitle>
                    {t('nada')}
                  </ItemTitle>
                  <ItemSubTitle>
                    {`${t('total')} ${t('maquinas')}`}
                  </ItemSubTitle>
                </Box>
                <Box width={1 / 2}>
                  <ItemValue>
                    <ItemVal>{automationStats.noEcoNoSched.machines}</ItemVal>
                  </ItemValue>
                  <ItemValueTR>
                    {automationStats.noEcoNoSched.powerTR}
                    TR
                  </ItemValueTR>
                </Box>
              </Flex>
            </Box>

            <Box width={1 / 2}>
              <Flex flexWrap="wrap" alignItems="center" width={1} mt={10}>
                <Box>
                  <ItemTitleCol>
                    {t('metodo')}
                  </ItemTitleCol>
                </Box>
              </Flex>

              <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10}>
                <Box width={1 / 2}>
                  <ItemTitle>
                    {t('Infra-vermelho')}
                  </ItemTitle>
                  <ItemSubTitle>
                    {`${t('total')} ${t('maquinas')}`}
                  </ItemSubTitle>
                </Box>
                <Box width={1 / 2}>
                  <ItemValue>
                    <ItemVal>{automationStats.dutAutomation.machines}</ItemVal>
                  </ItemValue>
                  <ItemValueTR>
                    {automationStats.dutAutomation.powerTR}
                    TR
                  </ItemValueTR>
                </Box>
              </Flex>
              <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10}>
                <Box width={1 / 2}>
                  <ItemTitle>
                    {t('bloqueio')}
                  </ItemTitle>
                  <ItemSubTitle>
                    {t('condensadoras')}
                  </ItemSubTitle>
                </Box>
                <Box width={1 / 2}>
                  <ItemValue>
                    <ItemVal>{automationStats.dacAutomation.machines}</ItemVal>
                  </ItemValue>
                  <ItemValueTR>
                    {automationStats.dacAutomation.powerTR}
                    TR
                  </ItemValueTR>
                </Box>
              </Flex>
              <Flex flexWrap="wrap" justifyContent="space-around" alignItems="center" width={1} mt={10}>
                <Box width={1 / 2}>
                  <ItemTitle>
                    {t('controladoras')}
                  </ItemTitle>
                  <ItemSubTitle>
                    {t('central')}
                  </ItemSubTitle>
                </Box>
                <Box width={1 / 2}>
                  <ItemValue>
                    <ItemVal>{automationStats.damAutomation.machines}</ItemVal>
                  </ItemValue>
                  <ItemValueTR>
                    {automationStats.damAutomation.powerTR}
                    TR
                  </ItemValueTR>
                </Box>
              </Flex>
            </Box>
          </Flex>

        </Flex>

        <Flex flexWrap="wrap" flexDirection="row-reverse" justifyContent="space-between" alignItems="flex-end" width={1} pl={15}>
          <Box>
            <BtnList onClick={() => {
              state.showList = !state.showList;
              render();
            }}
            >
              {t('verLista')}
            </BtnList>
          </Box>
        </Flex>

        {state.showList
          ? (
            <Flex flexDirection="column">
              <Flex
                flexWrap="wrap"
                width={1}
                mt={10}
              >
                <Table
                  style={{
                    overflow: 'auto', height: '300px', borderCollapse: 'separate', boxShadow: 'none',
                  }}
                  columns={automationColumns}
                  data={processedAutomation}
                  dense
                  border={false}
                />
              </Flex>
              {automationPag && onPageChange && (
                <Flex justifyContent="flex-end" width={1} pt={10} mt={10} style={{ borderTop: '0.7px solid rgba(0,0,0,0.2)' }}>
                  <Pagination
                    className="ant-pagination"
                    defaultCurrent={automationPag.tablePage}
                    total={automationPag.totalItems}
                    locale={pageLocale}
                    pageSize={automationPag.tablePageSize}
                    onChange={(current) => onPageChange(current)}
                  />
                </Flex>
              )}
            </Flex>
          ) : (
            <>
            </>
          )}

      </Card>
    </Box>
  );
};
