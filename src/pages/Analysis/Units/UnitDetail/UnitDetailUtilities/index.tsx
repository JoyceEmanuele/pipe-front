import { useEffect, useState } from 'react';
import { BsList, BsFillGridFill } from 'react-icons/bs';
import { useParams } from 'react-router';
import { t } from 'i18next';
import { Flex } from 'reflexbox';
import {
  HeaderContainer,
  ViewModeButton,
  SearchInput,
  Label,
  BtnClean,
  StyledSpan,
  MosaicContainer,
} from './styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { Select, Card, Accordion } from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { ApiResps, apiCall } from '~/providers';
import { MosaicCard, MosaicCardProps } from './components/MosaicCard';
import { NobreakTable } from './components/NobreakTable';
import { useWebSocketLazy } from '~/helpers/wsConnection';
import { IlluminationTable } from './components/IlluminationTable';

export const UnitDetailUtilities = (
  props: {
    openScheduleDialogFor: (devId: string) => void;
  },
): JSX.Element => {
  const { openScheduleDialogFor } = props;
  const routeParams = useParams<{ unitId: string }>();
  const [mosaicView, setMosaicView] = useState(true);
  const [utilitiesVisualizationOrder, setUtilitiesVisualizationOrder] = useState(t('selecioneOrdemDeVisualizacao'));
  const [filter, setFilter] = useState<string[]>([]);
  const [state, render, setState] = useStateVar({
    unitId: Number(routeParams.unitId),
    isLoading: false,
    tab: 'nobreak',
    startedWslNobreak: false,
    startedWslIllumination: false,
    loadedData: false,
    nobreaks: [] as any,
    illuminations: [] as any,
    nobreaksList: [] as ApiResps['/dmt/get-dmt-nobreak-list-unit'],
    illuminationsList: [] as ApiResps['/dal/get-dal-illumination-list'],
    dmtIds: [] as string[],
    dalIds: [] as string[],
    damIds: [] as string[],
    nobreaksListOpts: [] as { value: string, name: string }[],
    illuminationsListOpts: [] as { value: string, name: string }[],
    telemetries: {} as {[devId: string]: {}},
  });

  const [orderedNobreaksList, setOrderedNobreaksList] = useState<ApiResps['/dmt/get-dmt-nobreak-list-unit']>();
  const [orderedIlluminationsList, setOrderedIlluminationsList] = useState<ApiResps['/dal/get-dal-illumination-list']>();

  const wslNoBreak = useWebSocketLazy();
  const wslIllumination = useWebSocketLazy();

  function onWsOpen(wsConn) {
    if (state.dmtIds.length && state.tab === 'nobreak') {
      wsConn.send({ type: 'dmtSubscribeRealTime', data: { UNIT_ID: state.unitId } });
    }
    if (state.dalIds.length && state.tab === 'illumination') {
      wsConn.send({ type: 'dalSubscribeRealTime', data: { UNIT_ID: state.unitId } });
    }
    if (state.damIds.length && state.tab === 'illumination') {
      wsConn.send({ type: 'subscribeStatus', data: { unit_id: state.unitId } });
    }
  }

  function onWsMessage(response) {
    if (response && (response.type === 'dmtTelemetry' || response.type === 'dalTelemetry' || response.type === 'damStatus')) {
      state.telemetries[response.data.dev_id] = { ...response.data, safeWaitMode: false };
      render();
      getUtilitiesStatus();
    }
  }

  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dmtUnsubscribeRealTime' });
    wsConn.send({ type: 'dalUnsubscribeRealTime' });
    wsConn.send({ type: 'unsubscribeStatus' });
  }

  function getUtilitiesStatus() {
    if (state.tab === 'nobreak') {
      state.nobreaks?.length && state.nobreaks.map((nobreak) => {
        nobreak.status = getNobreakStatus({ ...nobreak, DEVICE_CODE: nobreak.DMT_CODE }, state.telemetries[nobreak.DMT_CODE]);
      });
    }
    if (state.tab === 'illumination') {
      state.illuminations?.length && state.illuminations.map((illum) => {
        illum.status = getIlluminationStatus({ ...illum }, state.telemetries[illum.DAL_CODE || illum.DMT_CODE || illum.DAM_ILLUMINATION_CODE]);
      });
    }
  }

  function getNobreakStatus(
    utilityInfo: MosaicCardProps['utilityInfo'],
    telemetry: MosaicCardProps['telemetry'],
  ) {
    if (utilityInfo.PORT && utilityInfo.PORT_ELETRIC && telemetry?.status === 'ONLINE') {
      const electricNetworkPort = `F${utilityInfo.PORT_ELETRIC}`;
      const nobreakPort = `F${utilityInfo.PORT}`;
      if (telemetry[electricNetworkPort]) {
        return 'status-rede';
      }
      if (telemetry[nobreakPort]) {
        return 'status-bateria';
      }
      return 'status-desligado';
    }
    return 'status-null';
  }

  function getIlluminationStatus(
    utilityInfo: MosaicCardProps['utilityInfo'],
    telemetry: MosaicCardProps['telemetry'],
  ) {
    if (telemetry?.status === 'ONLINE') {
      let illumStatus;
      if (telemetry.dev_id?.startsWith('DMT') && utilityInfo.PORT) {
        const illumPort = `F${utilityInfo.PORT}`;
        illumStatus = telemetry[illumPort];
      }
      if (telemetry.dev_id?.startsWith('DAL') && utilityInfo.FEEDBACK) {
        const illumPort = utilityInfo.FEEDBACK - 1;
        illumStatus = telemetry.Feedback?.[illumPort];
      }
      if (illumStatus != null) {
        return illumStatus ? 'status-ligada' : 'status-desligada';
      }
    }
    return 'status-null';
  }

  async function getUtilitiesInfo() {
    setState({ isLoading: true });
    try {
      await Promise.all([
        apiCall('/dmt/get-dmt-nobreak-list-unit', { UNIT_ID: state.unitId }).then((list) => state.nobreaksList = list),
        apiCall('/dal/get-dal-illumination-list', { unitIds: [state.unitId] }).then((list) => state.illuminationsList = list),
      ]);
      const dmtIds = [] as string[];
      const dalIds = [] as string[];
      const damIds = [] as string[];
      const nobreaksUtilities = [] as { value: string, name: string }[];
      const illuminationsUtilities = [] as { value: string, name: string }[];
      state.nobreaksList.forEach((nobreak) => { if (nobreak.DMT_CODE) dmtIds.push(nobreak.DMT_CODE); nobreaksUtilities.push({ value: nobreak.NAME, name: nobreak.NAME }); });
      state.illuminationsList.forEach((illum) => {
        if (illum.DMT_CODE) dmtIds.push(illum.DMT_CODE);
        if (illum.DAL_CODE) dalIds.push(illum.DAL_CODE);
        if (illum.DAM_ILLUMINATION_CODE) damIds.push(illum.DAM_ILLUMINATION_CODE);
        illuminationsUtilities.push({ value: illum.NAME, name: illum.NAME });
      });
      state.nobreaks = state.nobreaksList.map((nobreak) => ({ ...nobreak, status: null }));
      state.illuminations = state.illuminationsList.map((illumination) => ({ ...illumination, status: null }));

      if (state.nobreaks.length === 0 && state.illuminations.length > 0) state.tab = 'illumination';
      render();

      state.nobreaksListOpts = nobreaksUtilities;
      state.illuminationsListOpts = illuminationsUtilities;
      state.dmtIds = dmtIds;
      state.dalIds = dalIds;
      state.damIds = damIds;
    } catch (err) {
      console.log(err);
    }
    setState({ isLoading: false });
    state.loadedData = true;
    if (state.tab === 'nobreak' && !state.startedWslNobreak) {
      wslNoBreak.start(onWsOpen, onWsMessage, beforeWsClose);
      state.startedWslNobreak = true;
    }
    else if (state.tab === 'illumination' && !state.startedWslIllumination) {
      wslIllumination.start(onWsOpen, onWsMessage, beforeWsClose);
      state.startedWslIllumination = true;
    }
    render();
    formatData();
  }

  function ascendingOrderStatus(a, b) {
    const order = state.tab === 'nobreak' ? {
      'status-rede': 3, 'status-bateria': 2, 'status-desligado': 1,
    } : { 'status-ligada': 2, 'status-desligada': 1 };

    const statusA = order[a.status] || 0;
    const statusB = order[b.status] || 0;

    return statusB - statusA;
  }

  function descendingOrderStatus(a, b) {
    const order = state.tab === 'nobreak' ? {
      'status-rede': 3, 'status-bateria': 2, 'status-desligado': 1,
    } : { 'status-ligada': 2, 'status-desligada': 1 };

    const statusA = order[a.status] || 0;
    const statusB = order[b.status] || 0;

    return statusA - statusB;
  }

  function sortingAlphabetNobreak(unorderedNobreaks) {
    const orderedNobreaksSort = [...unorderedNobreaks].sort((a, b) => {
      const x = a.NAME.toLowerCase();
      const y = b.NAME.toLowerCase();

      return x < y ? -1 : x > y ? 1 : 0;
    });
    return orderedNobreaksSort;
  }

  function sortingAscendingStatusNobreak(unorderedNobreaks) {
    const orderedNobreaksSort = [...unorderedNobreaks].sort((a, b) => ascendingOrderStatus(a, b));
    return orderedNobreaksSort;
  }

  function sortingDescendingStatusNobreak(unorderedNobreaks) {
    const orderedNobreaksSort = [...unorderedNobreaks].sort((a, b) => descendingOrderStatus(a, b));
    return orderedNobreaksSort;
  }

  function sortingAlphabetIllumination(unorderedIlluminations) {
    const orderedIlluminationsSort = [...unorderedIlluminations].sort((a, b) => {
      const x = a.NAME.toLowerCase();
      const y = b.NAME.toLowerCase();

      return x < y ? -1 : x > y ? 1 : 0;
    });
    return orderedIlluminationsSort;
  }

  function sortingAscendingStatusIllumination(unorderedIlluminations) {
    const orderedIlluminationsSort = [...unorderedIlluminations].sort((a, b) => ascendingOrderStatus(a, b));
    return orderedIlluminationsSort;
  }

  function sortingDescendingStatusIllumination(unorderedIlluminations) {
    const orderedIlluminationsSort = [...unorderedIlluminations].sort((a, b) => descendingOrderStatus(a, b));
    return orderedIlluminationsSort;
  }

  function formatData() {
    let unorderedNobreaks = state.nobreaks;
    let orderedNobreaks = unorderedNobreaks;
    let unorderedIlluminations = state.illuminations;
    let orderedIlluminations = unorderedIlluminations;

    if (state.nobreaks.length) {
      if (filter.length > 0) {
        unorderedNobreaks = unorderedNobreaks.filter((group) => filter.includes(group.NAME));
        orderedNobreaks = unorderedNobreaks;
      }

      if (utilitiesVisualizationOrder === t('ordemAlfabetica')) { orderedNobreaks = sortingAlphabetNobreak(unorderedNobreaks); }

      else if (utilitiesVisualizationOrder === t('crescenteStatus')) { orderedNobreaks = sortingAscendingStatusNobreak(unorderedNobreaks); }

      else if (utilitiesVisualizationOrder === t('decrescenteStatus')) { orderedNobreaks = sortingDescendingStatusNobreak(unorderedNobreaks); }
    }
    if (state.illuminations.length) {
      if (filter.length > 0) {
        unorderedIlluminations = unorderedIlluminations.filter((group) => filter.includes(group.NAME));
        orderedIlluminations = unorderedIlluminations;
      }
      if (utilitiesVisualizationOrder === t('ordemAlfabetica')) { orderedIlluminations = sortingAlphabetIllumination(unorderedIlluminations); }

      else if (utilitiesVisualizationOrder === t('crescenteStatus')) { orderedIlluminations = sortingAscendingStatusIllumination(unorderedIlluminations); }

      else if (utilitiesVisualizationOrder === t('decrescenteStatus')) { orderedIlluminations = sortingDescendingStatusIllumination(unorderedIlluminations); }
    }
    setOrderedNobreaksList(orderedNobreaks);
    setOrderedIlluminationsList(orderedIlluminations);
    render();
  }

  useEffect(() => {
    getUtilitiesInfo();
  }, []);

  useEffect(() => {
    formatData();
  }, [utilitiesVisualizationOrder, state.tab, filter]);

  useEffect(() => {
    if (state.loadedData) {
      if (state.tab === 'nobreak' && !state.startedWslNobreak) {
        wslNoBreak.start(onWsOpen, onWsMessage, beforeWsClose);
        state.startedWslNobreak = true;
      }
      else if (state.tab === 'illumination' && !state.startedWslIllumination) {
        wslIllumination.start(onWsOpen, onWsMessage, beforeWsClose);
        state.startedWslIllumination = true;
      }
    }
  }, [state.tab, state.loadedData]);

  function getBackgroundTabs(tab: string) {
    return state.tab === tab ? 'transparent' : '#f4f4f4';
  }

  function getCursorTabs(tab: string) {
    return state.tab === tab ? undefined : 'pointer';
  }

  function getBorderBottomTabs(tab: string) {
    return state.tab === tab ? 'none' : '1px solid lightgrey';
  }

  function renderTabs() {
    return (
      <>
        {state.nobreaks.length && state.illuminations.length ? (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '140px 6px 140px auto', height: '5px', paddingLeft: '0px', marginTop: '10px',
            }}
            >
              <span
                style={{
                  border: '1px solid lightgrey',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  backgroundColor: getBackgroundTabs('nobreak'),
                  height: '5px',
                }}
              />
              <span />
              <span
                style={{
                  border: '1px solid lightgrey',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  backgroundColor: getBackgroundTabs('illumination'),
                  height: '5px',
                }}
              />
              <span />
              <span />
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '140px 6px 140px auto', paddingLeft: '0px', height: '25px',
            }}
            >
              <span
                style={{
                  borderRight: '1px solid lightgrey',
                  borderLeft: '1px solid lightgrey',
                  textAlign: 'center',
                  fontSize: '90%',
                  borderBottom: getBorderBottomTabs('nobreak'),
                  backgroundColor: getBackgroundTabs('nobreak'),
                  cursor: getCursorTabs('nobreak'),
                }}
                onClick={() => setState({ tab: 'nobreak' })}
              >
                Nobreaks
              </span>
              <span
                style={{
                  borderBottom: '1px solid lightgrey',
                }}
              />
              <span
                style={{
                  borderLeft: '1px solid lightgrey',
                  borderRight: '1px solid lightgrey',
                  textAlign: 'center',
                  fontSize: '90%',
                  borderBottom: getBorderBottomTabs('illumination'),
                  backgroundColor: getBackgroundTabs('illumination'),
                  cursor: getCursorTabs('illumination'),
                }}
                onClick={() => setState({ tab: 'illumination' })}
              >
                {t('iluminacao')}
              </span>
              <span
                style={{
                  borderBottom: '1px solid lightgrey',
                }}
              />
            </div>
          </>
        )

          : (
            <>
              <div style={{
                display: 'grid', gridTemplateColumns: '140px 6px 140px auto', height: '5px', paddingLeft: '0px', marginTop: '10px',
              }}
              >
                <span
                  style={{
                    border: '1px solid lightgrey',
                    borderBottom: 'none',
                    borderRadius: '6px 6px 0 0',
                    backgroundColor: 'transparent',
                    height: '5px',
                  }}
                />
                <span />

                <span />
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '140px 1fr 140px auto', paddingLeft: '0px', height: '25px',
              }}
              >
                <span
                  style={{
                    borderRight: '1px solid lightgrey',
                    borderLeft: '1px solid lightgrey',
                    textAlign: 'center',
                    fontSize: '90%',
                    borderBottom: 'none',
                    backgroundColor: 'transparent',
                    cursor: undefined,
                  }}
                >
                  {state.nobreaks.length ? 'Nobreaks' : t('iluminacao')}
                </span>
                <span
                  style={{
                    borderBottom: '1px solid lightgrey',
                  }}
                />
                <span
                  style={{
                    borderBottom: '1px solid lightgrey',
                  }}
                />
              </div>
            </>
          )}

      </>
    );
  }

  if (!state.nobreaks.length && !state.illuminations.length) { return <></>; }
  return (
    <Accordion title={t('utilitarios')} opened>
      <>
        <HeaderContainer>
          <Flex>
            <ViewModeButton
              isActive={mosaicView}
              onClick={() => setMosaicView(true)}
            >
              <span style={{ width: 'max-content' }}>{t('mosaico')}</span>
              <BsFillGridFill style={{ width: '16px', height: '16px' }} />
            </ViewModeButton>
            <ViewModeButton
              isActive={!mosaicView}
              onClick={() => setMosaicView(false)}
            >
              <span style={{ width: 'max-content' }}>{t('lista')}</span>
              <BsList style={{ width: '16px', height: '16px' }} />
            </ViewModeButton>
          </Flex>

          <Flex style={{ width: '600px' }} flexWrap="wrap">
            <div
              style={{
                display: 'flex', flexDirection: 'column', height: 'auto', marginRight: '20px', width: '220px',
              }}
            >
              <SearchInput>
                <div style={{ width: 'fit-content' }}>
                  <Label>{t('buscar')}</Label>
                  <SelectSearch
                    options={state.tab === 'nobreak' ? state.nobreaksListOpts : state.illuminationsListOpts}
                    value={filter}
                    multiple
                    closeOnSelect={false}
                    printOptions="on-focus"
                    search
                    filterOptions={fuzzySearch}
                    placeholder={t('selecionarUtilitarios')}
                  // @ts-ignore
                    onChange={(newFilter) => setFilter(newFilter)}
                  />
                </div>
              </SearchInput>
              <BtnClean onClick={() => { setFilter([]); }}>{t('limparCampo')}</BtnClean>
            </div>
            <div style={{ width: '60%' }}>
              <Select
                placeholder={t('ordenarPor')}
                value={utilitiesVisualizationOrder}
                onSelect={(value) => {
                  setUtilitiesVisualizationOrder(value);
                }}
                options={[t('Default'), t('crescenteStatus'), t('decrescenteStatus'), t('ordemAlfabetica')]}
                hideSelected
              />
            </div>
          </Flex>
        </HeaderContainer>

        {renderTabs()}

        {mosaicView && (
          <MosaicContainer>
            {state.tab === 'nobreak'
            && (orderedNobreaksList?.length ? orderedNobreaksList.map((nobreak) => (
              <MosaicCard key={nobreak.ID} utilityInfo={{ ...nobreak, DEVICE_CODE: nobreak.DMT_CODE }} telemetry={state.telemetries[nobreak.DMT_CODE]} />
            ))
              : <StyledSpan>{t('erroNaoForamEncontradosResultadosOuServico')}</StyledSpan>)}

            {state.tab === 'illumination'
            && (orderedIlluminationsList?.length ? orderedIlluminationsList.map((illum) => (
              <MosaicCard key={illum.ID} utilityInfo={{ ...illum }} telemetry={state.telemetries[illum.DAL_CODE || illum.DMT_CODE || illum.DAM_ILLUMINATION_CODE]} openScheduleDialogFor={openScheduleDialogFor} />
            ))
              : <StyledSpan>{t('erroNaoForamEncontradosResultadosOuServico')}</StyledSpan>)}
          </MosaicContainer>
        )}

        {!mosaicView && (
          <Card noPadding>
            {state.tab === 'nobreak' ? (
              <NobreakTable filterNobreaks={orderedNobreaksList && orderedNobreaksList.map((nobreak) => ({ ...nobreak, telemetry: state.telemetries[nobreak.DMT_CODE] }))} />
            ) : <></>}
            {state.tab === 'illumination' ? (
              <IlluminationTable filterIlluminations={orderedIlluminationsList && orderedIlluminationsList.map((illum) => ({ ...illum, telemetry: state.telemetries[illum.DAL_CODE || illum.DMT_CODE || illum.DAM_ILLUMINATION_CODE] }))} openScheduleDialogFor={openScheduleDialogFor} />
            ) : <></>}
          </Card>
        )}
      </>
    </Accordion>
  );
};
