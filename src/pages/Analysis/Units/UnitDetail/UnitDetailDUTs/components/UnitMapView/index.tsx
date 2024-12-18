import {
  Card, Checkbox, Divider, ImageZoom,
} from '~/components';
import { PinIcon } from '~/icons';
import {
  CheckboxLine,
  SelectOptionStyled,
  SelectSearchStyled,
  SelectedContent,
  UnitMapListMapsHeader,
} from './styles';
import { Label, SearchInput } from '~/pages/Overview/Default/styles';
import SelectSearch, { SelectSearchOption, fuzzySearch } from 'react-select-search';
import { useUnitMap } from '~/pages/Analysis/Units/UnitProfile/UnitMap/UnitMapContext';
import { useEffect, useState } from 'react';
import {
  UnitMapApiResponseData,
  UnitMapPointsResponseData,
} from '~/metadata/UnitMap.model';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import i18n from '~/i18n';

type UnitMapsData = UnitMapApiResponseData & { name: string, value: number}
type DutsData = {
  DEV_ID: string;
  Temperature: string | number;
  Humidity?: number;
  eCO2?: number;
  status: string
}

export const UnitMapView: React.FC<{ unitMaps: UnitMapsData[]; duts: DutsData[]; isUpdatedDuts: string, filterDuts: string[] }> = ({
  unitMaps, duts, isUpdatedDuts, filterDuts,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const [selectedUnitMap, setSelectedUnitMap] = useState<UnitMapApiResponseData & SelectSearchOption>();
  const [showHiddenEnvironment, setShowHiddenEnvironment] = useState(false);
  const [countHiddenEnvironment, setCountHiddenEnvironment] = useState(0);
  const [mapPinsFilter, setMapPinsFilter] = useState<UnitMapPointsResponseData[] | undefined>([]);

  const { pinsData, setPins, resetPins } = useUnitMap();

  const handleSwitchUnitMap = (unitMapId) => {
    resetPins();
    const newUnitMap = unitMaps.find((map) => map.GROUNDPLAN_ID === unitMapId);

    if (!newUnitMap || !newUnitMap.POINTS) return;

    setSelectedUnitMap(newUnitMap);

    const visiblePoints = newUnitMap.POINTS.filter((point) => point.ISVISIBLE === 1);
    handleSetPoints(duts, visiblePoints);

    const counterHiddenEnvironment = newUnitMap.POINTS.filter((pin) => pin.ISVISIBLE === 0).length;
    setCountHiddenEnvironment(counterHiddenEnvironment);

    setShowHiddenEnvironment(false);
  };

  const handleSetPoints = (duts, points) => {
    const pins = points.map((pin) => {
      const dut = duts.find((dut) => dut.DEV_ID === pin.DEV_ID);

      const defaultPin = {
        POINT_ID: pin.POINT_ID,
        DUT_ID: pin.DUT_ID,
        POINT_X: pin.POINT_X,
        POINT_Y: pin.POINT_Y,
        DEV_ID: pin.DEV_ID,
        ROOM_NAME: pin.ROOM_NAME,
        ISVISIBLE: pin.ISVISIBLE,
      };

      if (!dut) return defaultPin;

      if (dut?.status === 'OFFLINE' || dut?.status === 'LATE') {
        return defaultPin;
      }

      const formattedPin = {
        HUMIMAX: dut.HUMIMAX,
        HUMIMIN: dut.HUMIMIN,
        HUMIDITY: dut.Humidity,
        TUSEMAX: dut.TUSEMAX,
        TUSEMIN: dut.TUSEMIN,
        TEMPERATURE: dut.Temperature === '-' ? undefined : Number(dut?.Temperature),
        CO2MAX: dut.CO2MAX,
        eCO2: dut.eCO2,
        ...defaultPin,
      };

      return formattedPin;
    });
    setPins(pins);
  };

  useEffect(() => {
    setSelectedUnitMap(unitMaps[0]);

    if (!unitMaps[0].POINTS) return;

    const visiblePoints = unitMaps[0].POINTS.filter((point) => point.ISVISIBLE === 1);
    handleSetPoints(duts, visiblePoints);

    const counterHiddenEnvironment = unitMaps[0].POINTS.filter((pin) => pin.ISVISIBLE === 0).length;
    setCountHiddenEnvironment(counterHiddenEnvironment);
  }, [unitMaps]);

  useEffect(() => {
    const arrayIdFilterDuts = filterDuts.map((item) => Number(item));
    let newPoints: UnitMapPointsResponseData[] | undefined = [];
    if (arrayIdFilterDuts.length > 0) {
      newPoints = selectedUnitMap?.POINTS?.filter((item) => arrayIdFilterDuts.includes(item.ENVIRONMENT_ID));
    } else {
      newPoints = selectedUnitMap?.POINTS?.map((item) => item);
    }
    if (!showHiddenEnvironment) newPoints = newPoints?.filter((point) => point.ISVISIBLE === 1);
    setMapPinsFilter(newPoints);
  }, [selectedUnitMap, filterDuts, pinsData]);

  useEffect(() => {
    if (pinsData.length > 0) {
      handleSetPoints(duts, pinsData);
    }
  }, [isUpdatedDuts]);

  const renderOption = (propsOption, option, _snapshot) => (
    <SelectOptionStyled
      {...propsOption}
      type="button"
      selected={_snapshot.selected}
    >
      <SelectedContent>
        <p>{option.name}</p>
        <span>{option.DEV_ID}</span>
      </SelectedContent>
    </SelectOptionStyled>
  );

  return (
    <Card noPadding>
      <UnitMapListMapsHeader>
        <div style={{ display: 'flex', gap: '8px' }}>
          <PinIcon />
          <div>
            <h2>{selectedUnitMap?.NAME_GP}</h2>
            <p>
              {t('total')}
              {' '}
              {selectedUnitMap ? selectedUnitMap.POINTS?.length : '-'}
              {' '}
              {t('pontosDeMedicao')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SearchInput>
            <SelectSearchStyled style={{ width: '100%', paddingTop: 3 }}>
              <Label>{t('mapasCadastrados')}</Label>
              <SelectSearch
                options={unitMaps}
                value={`${selectedUnitMap?.GROUNDPLAN_ID}`}
                printOptions="on-focus"
                search
                filterOptions={fuzzySearch}
                placeholder={t('mapasCadastrados')}
                onChange={handleSwitchUnitMap}
                renderOption={renderOption}
              />
            </SelectSearchStyled>
          </SearchInput>
          {countHiddenEnvironment !== 0 && (
            <CheckboxLine>
              <Checkbox
                checked={showHiddenEnvironment}
                onClick={() => {
                  if (!selectedUnitMap || !selectedUnitMap.POINTS) return;

                  if (!showHiddenEnvironment) {
                    handleSetPoints(duts, selectedUnitMap.POINTS);

                    setShowHiddenEnvironment(true);

                    return;
                  }

                  const visiblePoints = selectedUnitMap.POINTS.filter((point) => point.ISVISIBLE === 1);
                  handleSetPoints(duts, visiblePoints);

                  setShowHiddenEnvironment(false);
                }}
                size={15}
                color="primary"
              />
              <span>
                {t('ambientesOcultos')}
                {' '}
                (
                {countHiddenEnvironment}
                )
              </span>
            </CheckboxLine>
          )}
        </div>
      </UnitMapListMapsHeader>
      <Divider height={1} />
      <div>
        {selectedUnitMap?.IMAGE && (
          <ImageZoom
            imageUrl={selectedUnitMap.IMAGE}
            pins={mapPinsFilter || []}
            hasDragPin={false}
            onPinDrag={() => {}}
          />
        )}
      </div>
    </Card>
  );
};
