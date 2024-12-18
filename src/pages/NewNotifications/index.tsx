import { t } from 'i18next';
import { Helmet } from 'react-helmet';
import { Flex } from 'reflexbox';
import { useLocation } from 'react-router-dom';
import { Text, TransparentLink, ViewAllContainer } from './styles';
import { CustomAccordion } from '~/components/CustomAccordion';
import { TListFilters, UtilFilter } from '../Analysis/Utilities/UtilityFilter';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall, ApiResps } from '../../providers';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { NewNotificationsLayout } from './Layout';
import moment, { Moment } from 'moment-timezone';
import { CircleCheckFill } from '~/icons/CircleCheckFill';
import { Button, Loader } from '~/components';
import { getUserProfile } from '~/helpers/userProfile';
import { NotificationsEmpty } from './NotificationsEmpty';
import { formatNumberWithFractionDigits, thousandPointFormat } from '~/helpers/thousandFormatNumber';

export const NewNotifications = (): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const { pathname } = useLocation();
  const [state, render, setState] = useStateVar({
    selectedState: [] as string[],
    firstReload: true,
    selectedCity: [] as string[],
    selectedClientFilter: [] as number[],
    selectedUnit: [] as number[],
    selectedNotificationType: [] as number[],
    selectedNotificationSubtype: [] as number[],
    selectedDateStart: undefined as Moment | undefined,
    selectedDateEnd: undefined as Moment | undefined,
    notificationsFilteredFeed:
      [] as ApiResps['/mainservice/notifications/get-notifications']['notifications'],
    notificationsFilteredHistory:
      [] as ApiResps['/mainservice/notifications/get-notifications']['notifications'],
    notificationsFiltered:
      [] as ApiResps['/mainservice/notifications/get-notifications']['notifications'],
    isLoading: false as boolean,
    tabName: pathname.substring(pathname.lastIndexOf('/') + 1) as string,
    callCount: 0 as number,
    tablePageFeed: 1,
    tablePageHistory: 1,
    tablePageSize: 0,
    tablePageSizeFeed: 0,
    tablePageSizeHistory: 0,
    totalItems: 0,
    totalItemsFeed: 0,
    totalItemsHistory: 0,
    feedCanHandle: true as boolean,
    historyCanHandle: true as boolean,
    canHandle: true as boolean,
  });

  const [informationDates, setInformationDates] = useState({
    dates: {
      dateStart: null as Moment | null,
      dateEnd: null as Moment | null,
      focusedInput: null as 'endDate' | 'startDate' | null,
    },
  });

  const listFilters = [
    'estado',
    'cidade',
    'unidade',
    'tipoNotificacao',
    'subtipoNotificacao',
    state.tabName === 'historico' && 'data',
    'cliente',
  ] as TListFilters[];

  const applyFilters = () => {
    handleGetData();
  };

  const clearFilter = () => {
    setState({
      selectedState: [],
      selectedCity: [],
      selectedUnit: [],
      selectedClientFilter: [],
      selectedNotificationType: [],
      selectedNotificationSubtype: [],
    });
  };

  async function handleGetData() {
    try {
      setState({ isLoading: true });
      if (state.tabName === 'feed' && state.feedCanHandle) {
        const { notifications: dataResponse, totalItems } = await apiCall('/mainservice/notifications/get-notifications', {
          isViewed: false,
          cityIds: state.selectedCity?.length > 0 ? state.selectedCity : [],
          stateIds: state.selectedState?.length > 0 ? state.selectedState : [],
          clientIds: state.selectedClientFilter,
          unitIds: state.selectedUnit?.length > 0 ? state.selectedUnit : [],
          typeIds: state.selectedNotificationType,
          subtypeIds: state.selectedNotificationSubtype,
          skip: (state.tablePageFeed - 1) * 10,
        });
        if (state.tablePageFeed === 1) {
          state.notificationsFilteredFeed = dataResponse;
        }
        else {
          state.notificationsFilteredFeed.push(...dataResponse);
        }
        state.tablePageFeed++;
        state.tablePageSizeFeed += 10;
        state.totalItemsFeed = totalItems;

        state.notificationsFiltered = state.notificationsFilteredFeed;
        state.tablePageSize = state.tablePageSizeFeed;
        state.totalItems = state.totalItemsFeed;

        state.feedCanHandle = state.totalItems > state.tablePageSize;
        render();
      }
      if (state.tabName === 'historico' && state.historyCanHandle) {
        const { notifications: dataResponse, totalItems } = await apiCall('/mainservice/notifications/get-notifications', {
          cityIds: state.selectedCity?.length > 0 ? state.selectedCity : [],
          stateIds: state.selectedState?.length > 0 ? state.selectedState : [],
          clientIds: state.selectedClientFilter,
          unitIds: state.selectedUnit?.length > 0 ? state.selectedUnit : [],
          typeIds: state.selectedNotificationType,
          subtypeIds: state.selectedNotificationSubtype,
          dateStart: informationDates.dates.dateStart?.format('YYYY-MM-DD'),
          dateEnd: informationDates.dates.dateEnd?.format('YYYY-MM-DD'),
          skip: (state.tablePageHistory - 1) * 10,
        });
        if (state.tablePageHistory === 1) {
          state.notificationsFilteredHistory = dataResponse;
        }
        else {
          state.notificationsFilteredHistory.push(...dataResponse);
        }
        state.tablePageHistory++;
        state.tablePageSizeHistory += 10;
        state.totalItemsHistory = totalItems;

        state.notificationsFiltered = state.notificationsFilteredHistory;
        state.tablePageSize = state.tablePageSizeHistory;
        state.totalItems = state.totalItemsHistory;

        state.historyCanHandle = state.totalItems > state.tablePageSize;
        render();
      }
      render();
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível carregar os dados das notificações');
    }
    state.isLoading = false;
    render();
  }

  useEffect(() => {
    setState({ tabName: pathname.substring(pathname.lastIndexOf('/') + 1) });
    if (state.tabName !== 'gerenciamento' && state.callCount < 2) {
      handleGetData();
      state.callCount++;
    }
    if (state.tabName === 'feed') {
      state.notificationsFiltered = state.notificationsFilteredFeed;
      state.tablePageSize = state.tablePageSizeFeed;
      state.totalItems = state.totalItemsFeed;
    }

    if (state.tabName === 'historico') {
      state.notificationsFiltered = state.notificationsFilteredHistory;
      state.tablePageSize = state.tablePageSizeHistory;
      state.totalItems = state.totalItemsHistory;
    }

    render();
  }, [pathname]);

  const onPageChange = () => {
    handleGetData();
    state.callCount = 1;
  };
  function getDateSendAccordion(date: string, area: string): string {
    const now = moment().tz(area);
    const dateDetection = moment(date).tz(area);
    const diffMin = now.diff(dateDetection, 'minutes');
    const diffHr = now.diff(dateDetection, 'hours');
    const diffDay = now.diff(dateDetection, 'days');

    if (diffMin === 0) {
      return 'Agora';
    }
    if (diffHr === 0 && now.date() === dateDetection.date()) {
      return `${diffMin} min`;
    }
    if (diffDay === 0 && now.date() === dateDetection.date()) {
      return `${diffHr} hora${diffHr === 1 ? '' : 's'}`;
    }

    if (now.date() - dateDetection.date() === 1) {
      return 'Ontem';
    }
    return dateDetection.format('DD MMM HH:mm');
  }

  function getDateDetectionAccordion(date: string, area: string): string {
    const dateDetection = moment(date).tz(area);
    return dateDetection.format('DD MMM HH:mm');
  }

  const getDescriptionAccordion = (notification) => {
    if (notification.typeName === 'Energia') return getDescriptionAccordionEnergy(notification);
    if (notification.typeName === 'Ambiente') return getDescriptionAccordionEnvironment(notification);
    if (notification.typeName === 'Saúde') return getDescriptionAccordionHealth(notification);
    if (notification.typeName === 'Água') return getDescriptionAccordionWater(notification);
    return '';
  };

  const getDescriptionAccordionEnergy = (notification) => {
    const isGreaterString = notification.energy?.isGreater ? t('maior').toLowerCase() : t('menor').toLowerCase();
    const countUnits = notification.energy?.detections.length > 1 ? `${notification.energy?.detections.length} unidades` : `${notification.energy?.detections.length} unidade`;
    const isCompiledString = `por pelo menos uma hora em ${countUnits} nas últimas 24 horas`;
    const momentString = notification.energy?.isInstantaneous ? 'em uma unidade por pelo menos uma hora' : `${isCompiledString}`;
    return `Consumo de energia ${isGreaterString} que ${notification.energy?.setpoint}kWh ${momentString} `; };

  const getDescriptionAccordionEnvironment = (_notification) => '4 Ambientes apresentaram temperaturas acima do limite nas últimas 24 horas';

  const getDescriptionAccordionHealth = (notification) => {
    switch (notification.machineHealth?.healthIndex) {
      case 1:
        return 'Máquina em manutenção urgente';
      case 2:
        return 'Máquina em risco iminente';
      case 3:
        return 'Máquina fora de especificação ';
      default:
        return 'Máquina operando corretamente';
    }
  };

  const getDescriptionAccordionWater = (notification) => {
    const countUnits = notification.water?.detections.length > 1 ? `${notification.water?.detections.length} unidades` : '1 unidade';
    const isCompiledString = `Possível vazamento de água em ${countUnits} nas últimas 24 horas`;
    return notification.water?.isInstantaneous ? 'Possível vazamento de água na unidade' : `${isCompiledString}`;
  };

  const getTypeAccordion = (type: string) => {
    switch (type) {
      case 'Energia':
        return t('utilitario');
      case 'Água':
        return t('utilitario');
      case 'Saúde':
        return t('maquina');
      default:
        return '';
    }
  };

  async function viewNotification(notificationId) {
    try {
      await apiCall('/mainservice/notifications/view-notification', {
        notificationId,
      });
      resetPagination();
      handleGetData();
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível visualizar a notificação');
    }
  }

  async function viewAllNotifications() {
    try {
      await apiCall('/mainservice/notifications/view-all-notifications', {});
      resetPagination();
      handleGetData();
    } catch (err) {
      console.log(err);
      toast.error('Não foi possível visualizar todas as notificações');
    }
  }

  const getTrasparentLinkTo = (typeName: string, detection) => {
    if (typeName === 'Saúde') return `/analise/unidades/${detection.unitId}`;
    if (typeName === 'Energia') return `/analise/unidades/energyEfficiency/${detection.unitId}`;
    if (typeName === 'Água') return `/analise/unidades/integracao-agua/${detection.unitId}?aba=historico&supplier=diel`;
    if (typeName === 'Máquina') return `/analise/maquina/${detection.machineId}/ativos`;
    if (typeName === 'Ativo') return `/analise/maquina/${detection.machineId}/ativos/${detection.deviceCode}/saude`;
    return '/';
  };

  const getUnitConsumption = (typeName: string, consumption: number) => {
    if (typeName === 'Energia') {
      return `${formatNumberWithFractionDigits(consumption.toFixed(2), { minimum: 0, maximum: 2 })}kWh`;
    }
    if (typeName === 'Água') {
      const measuringUnit = profile.prefsObj.water;
      if (!measuringUnit || measuringUnit === 'cubic') { return `${formatNumberWithFractionDigits((consumption / 1000).toFixed(2), { minimum: 0, maximum: 2 })} m³`; }
      if (measuringUnit === 'liters') { return `${formatNumberWithFractionDigits(consumption, { minimum: 0, maximum: 0 })} L`; }
    }
    else return '';
  };

  function resetPagination() {
    state.feedCanHandle = true;
    state.historyCanHandle = true;
    state.tablePageFeed = 1;
    state.tablePageHistory = 1;
    state.tablePageSize = 0;
    state.tablePageSizeFeed = 0;
    state.tablePageSizeHistory = 0;
    state.totalItems = 0;
    state.totalItemsFeed = 0;
    state.totalItemsHistory = 0;
    state.callCount = 0;
  }

  const updatePeriodDates = (info, date) => {
    switch (info) {
      case 'dateStart':
        if (date) setInformationDates({ dates: { ...informationDates.dates, dateStart: date } });
        break;
      case 'dateEnd':
        if (date) setInformationDates({ dates: { ...informationDates.dates, dateEnd: date } });
        break;
      case 'focusedInput':
        if (date) setInformationDates({ dates: { ...informationDates.dates, focusedInput: date } });
        break;
      default:
        break;
    }

    render();
  };

  return (
    <Flex flexDirection="column" width={1}>
      <Helmet>
        <title>{t('dielEnergiaNotificacoes')}</title>
      </Helmet>
      <NewNotificationsLayout />
      <Flex flexDirection="column">
        <UtilFilter
          state={state}
          render={render}
          setState={setState}
          onAply={() => {
            resetPagination();
            state.firstReload = false;
            applyFilters();
          }}
          onClear={clearFilter}
          listFilters={listFilters}
          isFilterButton
          isPeriodLabel
          isMaxOneMonthPeriod
          informationsUnits={informationDates}
          updateCheckInformations={updatePeriodDates}
          lengthArrayResult={state.firstReload ? undefined : state.totalItems}
        />
        {state.tabName === 'feed' && (
          <Flex style={{ position: 'relative', opacity: state.totalItems === 0 ? 0.5 : 1, 'pointer-events': state.totalItems === 0 ? 'none' : 'all' }}>
            <ViewAllContainer
              onClick={() => {
                viewAllNotifications();
              }}
            >
              <CircleCheckFill width="20px" color="#363BC4" />
              <span>{t('marcarTodasComoLidas')}</span>
            </ViewAllContainer>
          </Flex>
        )}
      </Flex>
      {state.isLoading ? (
        <Flex
          width={1}
          justifyContent="center"
          alignItems="center"
          padding="24px 28px"
        >
          <Loader />
        </Flex>
      ) : (
        <>
          <Flex
            width={1}
            paddingTop="10px"
            paddingBottom="24px"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>
              <strong>{ state.tabName === 'feed' ? t('notificacoes') : t('notificacoesArquivadas')}</strong>
            </Text>
            <Text style={{ marginRight: state.tabName === 'feed' ? '45px' : '20px' }}>
              <strong>
                {t('total')}
                {': '}
              </strong>
              {state.totalItems}
            </Text>
          </Flex>

          {state.totalItems === 0
            ? <NotificationsEmpty />
            : (
              <>
                {state.notificationsFiltered?.map((notification) => (
                  <CustomAccordion
                    key={notification.id}
                    title={getTypeAccordion(notification.typeName)}
                    notificationId={notification.id}
                    notification={notification.energy || notification.water || notification.machineHealth}
                    getToLink={getTrasparentLinkTo}
                    gmt={notification.gmt}
                    area={notification.timezoneArea}
                    time={getDateSendAccordion(notification.dateSend, notification.timezoneArea)}
                    description={getDescriptionAccordion(notification)}
                    type={notification.typeName as 'Energia' | 'Água' | 'Saúde'}
                    subType={!notification.machineHealth
                      ? notification.typeName as
                  | 'Ambiente'
                  | 'Energia'
                  | 'Água'
                      : notification.machineHealth.healthIndexName as
                    | 'Manutenção Urgente'
                    | 'Risco Iminente'
                    | 'Fora de Especialização'
                    | 'Sistema reestabelecido'}
                    tabName={state.tabName}
                    handleViewNotification={viewNotification}
                  >
                    <Flex
                      width={1}
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Text
                        style={{
                          width: '250px',
                          fontSize: '11px',
                          color: '#5B5B5B',
                          fontWeight: 'bold',
                          paddingRight: '10px',
                        }}
                      >
                        {t('unidade')}
                      </Text>

                      {notification.machineHealth?.detections
                          && (
                            <>
                              <Text
                                style={{
                                  width: '40%',
                                  fontSize: '11px',
                                  color: '#5B5B5B',
                                  fontWeight: 'bold',
                                  paddingInline: '10px',
                                }}
                              >
                                {t('maquina')}
                              </Text>
                              <Text
                                style={{
                                  width: '10%',
                                  fontSize: '11px',
                                  color: '#5B5B5B',
                                  fontWeight: 'bold',
                                  paddingInline: '10px',
                                }}
                              >
                                {t('ativo')}
                              </Text>
                              <Text
                                style={{
                                  width: '26%',
                                  fontSize: '11px',
                                  color: '#5B5B5B',
                                  fontWeight: 'bold',
                                  paddingInline: '10px',
                                }}
                              >
                                {t('laudoTecnico')}
                              </Text>
                            </>
                          )}

                      {(notification.energy?.detections || notification.water?.detections)
                          && (
                          <Text
                            style={{
                              width: '150px',
                              fontSize: '11px',
                              color: '#5B5B5B',
                              fontWeight: 'bold',
                            }}
                          >
                            {t('consumo')}
                          </Text>
                          ) }

                      <Text
                        style={{
                          width: '130px',
                          fontSize: '11px',
                          color: '#5B5B5B',
                          fontWeight: 'bold',
                          paddingLeft: '10px',
                        }}
                      >
                        {t('horarioDeteccao')}
                      </Text>
                    </Flex>

                    {(notification.energy?.detections || notification.water?.detections || notification.machineHealth?.detections || []).map((detection) => (
                      <Flex
                        key={detection.unitId}
                        width={1}
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Text
                          style={{
                            width: '250px',
                            fontSize: '11px',
                            color: '#5B5B5B',
                            textDecoration: 'underline',
                            paddingRight: '10px',
                          }}
                        >
                          <TransparentLink
                            to={getTrasparentLinkTo(notification.typeName, detection)}
                          >
                            {detection.unitName}
                          </TransparentLink>
                        </Text>

                        {detection.machineName
                          && (
                            <>
                              <Text
                                style={{
                                  width: '40%',
                                  fontSize: '11px',
                                  color: '#5B5B5B',
                                  textDecoration: 'underline',
                                  paddingInline: '10px',
                                }}
                              >
                                <TransparentLink
                                  to={getTrasparentLinkTo('Máquina', detection)}
                                >
                                  {detection.machineName.length > 100 ? (detection.machineName).slice(0, 100).concat('...') : detection.machineName}
                                </TransparentLink>
                              </Text>

                              <Text
                                style={{
                                  width: '10%',
                                  fontSize: '11px',
                                  color: '#5B5B5B',
                                  textDecoration: 'underline',
                                  paddingInline: '10px',
                                }}
                              >
                                <TransparentLink
                                  to={getTrasparentLinkTo('Ativo', detection)}
                                >
                                  {detection.assetName}
                                </TransparentLink>
                              </Text>

                              <Text
                                style={{
                                  width: '26%',
                                  fontSize: '11px',
                                  color: '#5B5B5B',
                                  paddingInline: '10px',
                                }}
                              >
                                {detection.report}
                              </Text>
                            </>
                          )}

                        {(notification.energy?.detections || notification.water?.detections)
                          && (
                          <Text
                            style={{
                              width: '150px',
                              fontSize: '11px',
                              color: '#5B5B5B',
                            }}
                          >
                            {getUnitConsumption(notification.typeName, detection.consumption)}
                          </Text>
                          )}

                        <Text
                          style={{
                            width: '130px',
                            fontSize: '11px',
                            color: '#5B5B5B',
                            paddingLeft: '10px',
                          }}
                        >
                          {getDateDetectionAccordion(detection.dateDetection, notification.timezoneArea)}
                        </Text>
                      </Flex>
                    ))}
                  </CustomAccordion>
                ))}

                {state.totalItems > state.tablePageSize && (
                <Flex
                  width={1}
                  justifyContent="center"
                  alignItems="center"
                  padding="24px 28px"
                >
                  <Button
                    style={{
                      width: '110px',
                      marginLeft: '20px',
                      marginTop: 3,
                      minWidth: '100px',
                    }}
                    type="button"
                    variant={state.isLoading ? 'disabled' : 'primary'}
                    onClick={() => {
                      onPageChange();
                    }}
                  >
                    {t('verMais')}
                  </Button>
                </Flex>
                )}
              </>
            )}

          {/*

      <CustomAccordion
        title="Ambiente"
        info="4 Unidades"
        time="5 min"
        description="4 Ambientes apresentaram temperaturas acima do limite nas últimas 24 horas"
        type="Environment"
      >
        <Flex width={1} justifyContent="space-between" alignItems="flex-start">
          <Flex
            justifyContent="flex-start"
            alignItems="flex-start"
            flexDirection="column"
            style={{ gap: '21px' }}
          >
            <Text
              style={{ fontSize: '11px', color: '#5B5B5B', fontWeight: 'bold' }}
            >
              Unidade
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: '#5B5B5B',
                textDecoration: 'underline',
              }}
            >
              001-0081 - PA AEROPORTO CONGONHAS
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: '#5B5B5B',
                textDecoration: 'underline',
              }}
            >
              001 - 0110 - SANTO ANDRE
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: '#5B5B5B',
                textDecoration: 'underline',
              }}
            >
              LPU13 - LAPA SP
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: '#5B5B5B',
                textDecoration: 'underline',
              }}
            >
              001-0041 - PIRACICABA
            </Text>
          </Flex>
          <Flex
            justifyContent="flex-start"
            alignItems="flex-start"
            flexDirection="column"
            style={{ gap: '21px' }}
          >
            <Text
              style={{ fontSize: '11px', color: '#5B5B5B', fontWeight: 'bold' }}
            >
              Ambiente
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: '#5B5B5B',
                textDecoration: 'underline',
              }}
            >
              Recepção
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: '#5B5B5B',
                textDecoration: 'underline',
              }}
            >
              Sala Principal
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: '#5B5B5B',
                textDecoration: 'underline',
              }}
            >
              Escritório 02
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: '#5B5B5B',
                textDecoration: 'underline',
              }}
            >
              Sala dos fundos
            </Text>
          </Flex>
          <Flex
            justifyContent="flex-start"
            alignItems="flex-start"
            flexDirection="column"
            style={{ gap: '21px' }}
          >
            <Text
              style={{ fontSize: '11px', color: '#5B5B5B', fontWeight: 'bold' }}
            >
              Temperatura
            </Text>
            <Text style={{ fontSize: '11px', color: '#5B5B5B' }}>27°C</Text>
            <Text style={{ fontSize: '11px', color: '#5B5B5B' }}>27°C</Text>
            <Text style={{ fontSize: '11px', color: '#5B5B5B' }}>27°C</Text>
            <Text style={{ fontSize: '11px', color: '#5B5B5B' }}>27°C</Text>
          </Flex>
          <Flex
            justifyContent="flex-start"
            alignItems="flex-start"
            flexDirection="column"
            style={{ gap: '21px' }}
          >
            <Text
              style={{ fontSize: '11px', color: '#5B5B5B', fontWeight: 'bold' }}
            >
              Limites
            </Text>
            <Text style={{ fontSize: '11px', color: '#5B5B5B' }}>
              18°C a 24°C
            </Text>
            <Text style={{ fontSize: '11px', color: '#5B5B5B' }}>
              18°C a 24°C
            </Text>
            <Text style={{ fontSize: '11px', color: '#5B5B5B' }}>
              18°C a 24°C
            </Text>
            <Text style={{ fontSize: '11px', color: '#5B5B5B' }}>
              18°C a 24°C
            </Text>
          </Flex>
        </Flex>
      </CustomAccordion>

*/}
        </>
      )}
    </Flex>
  );
};
