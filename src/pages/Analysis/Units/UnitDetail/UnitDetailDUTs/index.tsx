import { useEffect, useLayoutEffect, useState } from 'react';
import { t } from 'i18next';
import { BsList, BsFillGridFill } from 'react-icons/bs';
import {
  StyledSpan,
  HeaderContainer,
  ViewModeButton,
  MosaicList,
  TableList,
  SearchInput,
  Label,
  Link,
  InvisibleDutsMosaic,
} from './styles';
import { useWebSocket } from '~/helpers/wsConnection';
import { Select, Card, Accordion } from '~/components';
import { MosaicListItem } from './components/MosaicListItem';
import { Flex } from 'reflexbox';
import { DutTable } from './components/DutTable';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { getUserProfile } from '../../../../../helpers/userProfile';
import { PinIcon } from '~/icons';
import { UnitMapProvider } from '../../UnitProfile/UnitMap/UnitMapContext';
import { UnitMapView } from './components/UnitMapView';

function updateDutInfo(message, devsList) {
  const dev = devsList.find((row) => row.DEV_ID === message.dev_id);
  if (dev) {
    dev.status = message.status;
    dev.Temperature = message.Temperature;
    dev.Temperature_1 = message.Temperature_1;
    dev.Humidity = message.Humidity;
    dev.RSSI = message.RSSI;
    if (dev.DEV_ID.startsWith('DRI')) dev.Temperature = message.TempAmb;
    if (dev.Temperature == null) dev.Temperature = '-';
    // if (dev.Humidity == null) dev.Humidity = '-'
    // if (message.status !== 'ONLINE') dev.Temperature = '-';
    return true;
  }
  return false;
}

function createState(stateChanged) {
  return {
    changed() {
      stateChanged({});
    },

    unitId: null,
    duts: [],

    updateDuts(duts) {
      this.duts = duts;
    },
  };
}

export function getCardColor(temp?, tempAlert?, minTemp?, maxTemp?): string {
  if (typeof temp === 'string' && (!minTemp || !maxTemp)) {
    return '#B1B1B1';
  }

  if ((typeof temp === 'number' && !minTemp) || !maxTemp) {
    return '#FFFFFF';
  }

  if (temp && tempAlert === 'good') {
    return '#5AB365';
  }

  if (temp && tempAlert === 'high') {
    return '#E00030';
  }

  if (temp && tempAlert === 'low') {
    return '#2D81FF';
  }

  if (temp != null && temp >= minTemp && temp <= maxTemp) {
    return '#5AB365';
  }

  return '#B1B1B1';
}

export function getColorCo2(co2, co2Max): string {
  if (co2 != null) {
    if (!co2Max) {
      return '#B1B1B1';
    }
    if (co2 <= co2Max) {
      return '#5AB365';
    }
    return '#E00030';
  }
  return '#B1B1B1';
}

export function getColorHumi(humi, humimax, humimin): string {
  if (humi != null && (humimax != null || humimin != null)) {
    if (humimin !== null && humi < humimin && humi < humimax) {
      return '#2D81FF';
    }
    if (
      humimax !== null
      && humimin !== null
      && humi <= humimax
      && humi >= humimin
    ) {
      return '#5AB365';
    }
    if (humimax !== null && humimin === null && humi <= humimax) {
      return '#5AB365';
    }
    if (humimin !== null && humimax === null && humi >= humimin) {
      return '#5AB365';
    }
    return '#E00030';
  }

  return '#B1B1B1';
}

export const UnitDetailDUTs = ({
  unitId,
  duts,
  stateUnitDetail,
  unitMaps,
}): JSX.Element => {
  const [, stateChanged] = useState({});
  const [profile] = useState(getUserProfile);
  const [state] = useState(() => createState(stateChanged));
  const [mosaicViewInvisibleDuts, setMosaicViewInvisibleDuts] = useState(false);
  const [notVisibleDuts, setNotVisibleDuts] = useState(duts.slice(0));
  const [environmentVisualizationOrder, setEnvironmentVisualizationOrder] = useState(t('ordemAlfabetica'));
  const [orderedDuts, setOrderedDuts] = useState(duts.slice(0));
  const [filter, setFilter] = useState<string[]>([]);
  const [environmentContentType, setEnvironmentContentType] = useState('mosaic');
  const [isUpdatedDuts, setIsUpdatedDuts] = useState('');

  state.unitId = unitId;
  if (duts !== state.duts) {
    state.updateDuts(duts);
  }
  useWebSocket(onWsOpen, onWsMessage, beforeWsClose);
  function onWsOpen(wsConn) {
    wsConn.send({
      type: 'dutSubscribeRealTime',
      data: { UNIT_ID: Number(state.unitId) },
    });
    wsConn.send({
      type: 'driSubscribeRealTime',
      data: { UNIT_ID: Number(state.unitId) },
    });
  }
  function onWsMessage(payload) {
    if (payload.type === 'dutTelemetry' || payload.type === 'driTelemetry') {
      if (updateDutInfo(payload.data, state.duts)) {
        setIsUpdatedDuts(payload.data.timestamp);
        state.changed();
      }
    }
  }
  function beforeWsClose(wsConn) {
    wsConn.send({ type: 'dutUnsubscribeRealTime' });
    wsConn.send({ type: 'driUnsubscribeRealTime' });
  }
  function filterRoom(a, b) {
    const x = a.ROOM_NAME.toLowerCase();
    const y = b.ROOM_NAME.toLowerCase();

    return x < y ? -1 : x > y ? 1 : 0;
  }
  function filterTemperatureLower(a, b) {
    const x = a.Temperature && typeof a.Temperature === 'number' ? a.Temperature : 0;
    const y = b.Temperature && typeof b.Temperature === 'number' ? b.Temperature : 0;

    return x - y;
  }
  function filterTemperatureHighest(a, b) {
    const x = a.Temperature && typeof a.Temperature === 'number' ? a.Temperature : 0;
    const y = b.Temperature && typeof b.Temperature === 'number' ? b.Temperature : 0;

    return y - x;
  }
  function filterExeption(a, b) {
    const tempA = a.Temperature && typeof a.Temperature === 'number' ? a.Temperature : 0;
    const tempB = b.Temperature && typeof b.Temperature === 'number' ? b.Temperature : 0;
    let x = 0;
    let y = 0;

    if (tempA > a.TUSEMAX) {
      x = 1;
    } else if (tempA < a.TUSEMIN) {
      x = -1;
    }

    if (tempB > b.TUSEMAX) {
      y = 1;
    } else if (tempB < b.TUSEMIN) {
      y = -1;
    }

    return y - x;
  }

  useEffect(() => {
    let unorderedDuts = duts.slice(0);
    if (filter.length > 0) {
      unorderedDuts = unorderedDuts.filter((dut) => filter.includes(dut.ENVIRONMENT_ID));
    }

    if (environmentVisualizationOrder === t('ordemAlfabetica')) {
      setOrderedDuts(unorderedDuts.sort((a, b) => filterRoom(a, b)));
    } else if (environmentVisualizationOrder === t('menorTemperatura')) {
      setOrderedDuts(
        unorderedDuts.sort((a, b) => filterTemperatureLower(a, b)),
      );
    } else if (environmentVisualizationOrder === t('maiorTemperatura')) {
      setOrderedDuts(
        unorderedDuts.sort((a, b) => filterTemperatureHighest(a, b)),
      );
    } else {
      setOrderedDuts(unorderedDuts.sort((a, b) => filterExeption(a, b)));
    }
    const notVisibleDuts = unorderedDuts.filter((item) => item.ISVISIBLE !== 1);
    setNotVisibleDuts(notVisibleDuts);
    const dutsFilterVisibility = unorderedDuts.filter(
      (item) => item.ISVISIBLE === 1,
    );
    setOrderedDuts(dutsFilterVisibility);
    stateUnitDetail.filteredEnvironments = dutsFilterVisibility;
  }, [duts, environmentVisualizationOrder, filter]);

  useEffect(() => {
    if (unitMaps.length > 0) {
      setEnvironmentContentType('map');
      return;
    }

    if (duts.length >= 10) {
      setEnvironmentContentType('table');
    }
  }, [unitMaps, duts.length]);

  if (state.duts.length === 0) { return <></>; }

  const contentFactory = (option) => {
    const content = {
      mosaic: (
        <MosaicList>
          {orderedDuts.map((environment) => (
            <MosaicListItem key={`ordered-items-${environment.DEV_ID}-${environment.ROOM_NAME}`} dut={environment} />
          ))}
          {mosaicViewInvisibleDuts
            && notVisibleDuts.map((environment) => (
              <MosaicListItem key={`notVisible-items-${environment.DEV_ID}-${environment.ROOM_NAME}`} dut={environment} />
            ))}
          {profile.permissions.isAdminSistema && notVisibleDuts.length > 0 && (
            <InfoDuts
              mosaicViewInvisibleDuts={mosaicViewInvisibleDuts}
              setMosaicViewInvisibleDuts={setMosaicViewInvisibleDuts}
              countInvisibleDuts={notVisibleDuts.length}
            />
          )}
        </MosaicList>
      ),
      table: (
        <TableList>
          <Card noPadding>
            <Flex
              flexWrap="wrap"
              width={1}
              mt="8px"
              style={{
                overflow: 'auto',
                maxHeight: 515,
              }}
            >
              <DutTable notVisible={notVisibleDuts} filterDuts={orderedDuts} />
            </Flex>
          </Card>
        </TableList>
      ),
      map: (
        <div style={{ margin: '18px 0' }}>
          <UnitMapProvider>
            <UnitMapView unitMaps={unitMaps} duts={duts} isUpdatedDuts={isUpdatedDuts} filterDuts={filter} />
          </UnitMapProvider>
        </div>
      ),
    };

    return content[option];
  };

  return (
    <Accordion title={t('ambientes')} opened>
      <>
        <HeaderContainer>
          <Flex>
            <ViewModeButton
              isActive={environmentContentType === 'mosaic'}
              onClick={() => setEnvironmentContentType('mosaic')}
            >
              <span style={{ width: 'max-content' }}>{t('mosaico')}</span>
              <BsFillGridFill style={{ width: '16px', height: '16px' }} />
            </ViewModeButton>
            <ViewModeButton
              isActive={environmentContentType === 'table'}
              onClick={() => setEnvironmentContentType('table')}
            >
              <span style={{ width: 'max-content' }}>{t('lista')}</span>
              <BsList style={{ width: '16px', height: '16px' }} />
            </ViewModeButton>
            {unitMaps.length > 0 && (
              <ViewModeButton
                isActive={environmentContentType === 'map'}
                onClick={() => setEnvironmentContentType('map')}
              >
                <span style={{ width: 'max-content' }}>{t('mapa')}</span>
                <PinIcon
                  color={environmentContentType === 'map' ? '#363bc4' : '#3F3F3F'}
                  style={{ width: '16px', height: '16px' }}
                />
              </ViewModeButton>
            )}
          </Flex>
          <Flex style={{ width: environmentContentType !== 'map' ? '600px' : '' }} flexWrap="wrap">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'auto',
                marginRight: '20px',
                width: '220px',
              }}
            >
              <SearchInput>
                <div style={{ width: '100%' }}>
                  <Label>{t('buscar')}</Label>
                  <SelectSearch
                    options={
                      profile.manageAllClients
                        ? duts.map((dut) => ({
                          value: dut.ENVIRONMENT_ID,
                          name: dut.ROOM_NAME,
                        }))
                        : duts
                          .filter((item) => item.ISVISIBLE === 1)
                          .map((dut) => ({
                            value: dut.ENVIRONMENT_ID,
                            name: dut.ROOM_NAME,
                          }))
                    }
                    value={filter}
                    multiple
                    closeOnSelect={false}
                    printOptions="on-focus"
                    search
                    filterOptions={fuzzySearch}
                    placeholder={t('selecioneAmbientes')}
                    // @ts-ignore
                    onChange={(newFilter) => setFilter(newFilter)}
                  />
                </div>
              </SearchInput>
              <Link
                onClick={() => {
                  setFilter([]);
                }}
              >
                {t('limparCampo')}
              </Link>
            </div>
            {
              environmentContentType !== 'map' && (
                <div style={{ width: '60%' }}>
                  <Select
                    placeholder={t('ordenarPor')}
                    value={environmentVisualizationOrder}
                    onSelect={(value) => {
                      setEnvironmentVisualizationOrder(value);
                    }}
                    options={[
                      'Default',
                      t('maiorTemperatura'),
                      t('menorTemperatura'),
                      t('ordemAlfabetica'),
                    ]}
                    hideSelected
                    disabled={environmentContentType === 'map'}
                  />
                </div>
              )
            }
          </Flex>
        </HeaderContainer>
        {contentFactory(environmentContentType)}
      </>
    </Accordion>
  );
};

type InfoDuts = {
  mosaicViewInvisibleDuts: boolean;
  setMosaicViewInvisibleDuts: React.Dispatch<React.SetStateAction<boolean>>;
  countInvisibleDuts: number;
};

function InfoDuts({
  mosaicViewInvisibleDuts,
  setMosaicViewInvisibleDuts,
  countInvisibleDuts,
}: InfoDuts) {
  return (
    <InvisibleDutsMosaic>
      <p>
        {mosaicViewInvisibleDuts && t('exibindo')}
        {' '}
        <b>{countInvisibleDuts}</b>
        {' '}
        {countInvisibleDuts > 1
          ? t('ambientesInvisiveis')
          : t('ambienteInvisivel')}
        {' '}
        {t('paraOCliente')}
      </p>
      <h6 onClick={() => setMosaicViewInvisibleDuts(!mosaicViewInvisibleDuts)}>
        {!mosaicViewInvisibleDuts ? t('exibir') : t('ocultar')}
      </h6>
    </InvisibleDutsMosaic>
  );
}
