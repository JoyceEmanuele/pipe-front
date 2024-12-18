import {
  Button, Card, Divider, ImageZoom,
  SelectMultiple,
} from '~/components';
import {
  SelectOptionStyled,
  SelectSearchStyled,
  SelectedContent,
  UnitMapViewMapFooter,
  UnitMapViewMapHeader,
} from './styles';
import { useEffect, useState } from 'react';
import { UnitMapModal } from '../UnitMapModal';
import { useUnitMap } from '../UnitMapContext';
import { DeviceResponseData, UnitMapData } from '~/metadata/UnitMap.model';
import {
  CheckIcon, EditPenIcon, InfoIcon, PinIcon,
} from '~/icons';
import moment from 'moment';
import i18n from '~/i18n';
import { useTranslation } from 'react-i18next';
import { apiCall } from '~/providers';
import { useParams } from 'react-router-dom';
import { Label, SearchInput } from '~/pages/Overview/Default/styles';
import { SelectSearchOption } from 'react-select-search';
import { useStateVar } from '~/helpers/useStateVar';
import ReactTooltip from 'react-tooltip';
import { HoverExportList } from '~/pages/Analysis/Utilities/UtilityFilter/styles';

interface UnitMapViewMapProps {
  unitMapData: UnitMapData;
  unitName: string;
}

export const UnitMapViewMap: React.FC<UnitMapViewMapProps> = ({
  unitMapData,
  unitName,
}) => {
  moment.locale(i18n.language === 'pt' ? 'pt-BR' : 'en');
  const { t } = useTranslation();

  const {
    pinsData,
    isEditing,
    setUnitMap,
    setPins,
    addPin,
    removePin,
    movePin,
    resetPins,
    setIsShowListUnitMap,
    setIsEditingFlow,
    resetUnitMap,
    handleEditUnitMap,
    handleCreateUnitMap,
    handleAddPoints,
  } = useUnitMap();
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const { unitId } = useParams<{ unitId: string }>();

  const [state, render, setState] = useStateVar(() => ({
    devices: [] as (DeviceResponseData & SelectSearchOption & { checked: boolean })[],
    selectedDevices: [] as string[],
    selectedValuesFullInfo: [] as any[],
  }));

  const handleGetUnitDevices = async () => {
    const response = await apiCall('/unit/list-devs-unit', {
      UNIT_ID: Number(unitId),
    });
    let points = [] as string[];
    if (unitMapData.POINTS && unitMapData.POINTS?.length > 0) {
      points = unitMapData.POINTS?.map((point) => `${point.DUT_ID}`);
    }
    state.devices = response.map((device) => ({
      name: device.ROOM_NAME,
      value: `${device.DUT_ID}`,
      checked: points.includes(`${device.DUT_ID}`),
      ...device,
    }));
    render();
  };

  const handleChangePins = (value) => {
    value.value = value.value.toString();
    const arrayValues = state.selectedValuesFullInfo.map((item) => item.value);
    if (arrayValues.find((item) => item === value.value)) {
      const newPinId = arrayValues.filter(
        (a) => !pinsData?.some((b) => `${a}` === `${b.DUT_ID}`),
      );
      const dutInfo = state.devices.find(
        (item) => item.value === newPinId[0],
      );
      if (!dutInfo) return;

      addPin({
        ...dutInfo,
        POINT_X: `${100}`,
        POINT_Y: `${100}`,
      });
    } else {
      const removePinId = pinsData.filter(
        (a) => !arrayValues?.some((b) => `${a.DUT_ID}` === `${b}`),
      );
      removePin(Number(removePinId[0]?.DUT_ID));
    }
    render();
  };

  function verifySelected(value) {
    value.checked = !value.checked;
    value.value = value.value?.toString();
    if (state.selectedValuesFullInfo.some((item) => item.value === value.value)) {
      const filterDevicesSelected = state.selectedDevices.filter((item) => item !== value.value);
      setState({ selectedDevices: [...filterDevicesSelected] });
      setState({ selectedValuesFullInfo: state.selectedValuesFullInfo.filter((item) => item.value !== value.value?.toString()) });
      return;
    }
    setState({ selectedDevices: [...state.selectedDevices, value.value] });
    setState({ selectedValuesFullInfo: [...state.selectedValuesFullInfo, value] });
  }

  const renderOption = (option) => (
    <SelectOptionStyled
      type="button"
      selected={option.checked}
    >
      <SelectedContent>
        <p>{option.name}</p>
        <span onClick={() => window.open(`/analise/dispositivo/${option.DEV_ID}/informacoes`, '_blank', 'noopener')}>
          {option.DEV_ID}
        </span>
      </SelectedContent>
      {option.checked && (
        <CheckIcon />
      )}
    </SelectOptionStyled>
  );

  useEffect(() => {
    handleGetUnitDevices();
  }, []);

  useEffect(() => {
    if (unitMapData.POINTS && unitMapData.POINTS?.length > 0) {
      const pinsApi = unitMapData.POINTS?.map((point) => (point));
      setPins(pinsApi);
      state.selectedDevices = unitMapData.POINTS?.map((point) => `${point.DUT_ID}`);
      state.selectedValuesFullInfo = unitMapData.POINTS?.map((item) => ({
        ...item, value: `${item.DUT_ID}`, name: item.ROOM_NAME, checked: true,
      }));
      render();
    }
  }, []);

  useEffect(() => {
    state.selectedDevices = pinsData.map((pin) => `${pin.DUT_ID}`);

    render();
  }, [pinsData]);

  return (
    <Card noPadding>
      <UnitMapViewMapHeader>
        <div>
          <PinIcon />
          <div>
            <div className="mapName">
              <h2>{unitMapData.NAME_GP}</h2>
              <EditPenIcon handleClick={() => setOpenEditModal(true)} style={{ cursor: 'pointer' }} />
            </div>
            <span>{unitName}</span>
          </div>
        </div>

        <div>
          <SearchInput>
            <SelectSearchStyled style={{ width: '100%', paddingTop: 3, position: 'relative' }}>
              <Label className="searchTitle" style={{ position: 'absolute', zIndex: '20', top: '10px' }}>
                {t('adicionarDUT')}
                <InfoIcon width="12px" data-tip data-for="startOperation" color="#BDBDBD" style={{ marginLeft: '8px' }} />
                <ReactTooltip
                  id="startOperation"
                  place="top"
                  effect="solid"
                >

                  <HoverExportList>
                    {t('selecioneNestalista')}
                  </HoverExportList>

                </ReactTooltip>
              </Label>
              <SelectMultiple
                options={state.devices}
                values={state.selectedValuesFullInfo}
                multiple
                haveFuzzySearch
                emptyLabel=""
                propLabel="name"
                placeholder=""
                onSelect={(value) => { verifySelected(value); handleChangePins(value); }}
                customElements={renderOption}
                styleBox={{
                  border: 'none', paddingTop: '0px', fontWeight: 'normal', padding: '0px',
                }}
              />
            </SelectSearchStyled>
          </SearchInput>
        </div>
      </UnitMapViewMapHeader>
      <Divider height={1} />
      <div>
        {unitMapData.file?.preview && (
          <ImageZoom
            imageUrl={unitMapData.file.preview}
            pins={pinsData}
            onPinDrag={movePin}
          />
        )}

        {unitMapData.IMAGE && (
          <ImageZoom
            imageUrl={unitMapData.IMAGE}
            pins={pinsData}
            onPinDrag={movePin}
          />
        )}
      </div>
      <Divider height={1} />
      <UnitMapViewMapFooter>
        <a
          onClick={() => {
            setIsShowListUnitMap(true);
            setIsEditingFlow(false);
            resetPins();
            resetUnitMap();
          }}
        >
          {t('cancelar')}
        </a>
        <Button
          variant="primary"
          onClick={async () => {
            if (isEditing) {
              const POINTS = pinsData.map((pin) => ({ x: pin.POINT_X, y: pin.POINT_Y, ...pin }));
              await handleEditUnitMap({ ...unitMapData, POINTS });
            } else {
              const points = pinsData.map((pin) => ({
                DUT_ID: pin.DUT_ID,
                x: Number(pin.POINT_X),
                y: Number(pin.POINT_Y),
              }));
              const groundPlanId = await handleCreateUnitMap(
                unitId,
                unitMapData,
              );

              if (groundPlanId !== -1 && points.length > 0) {
                await handleAddPoints(groundPlanId, Number(unitId), points);
              }
            }
            setIsShowListUnitMap(true);
            setIsEditingFlow(false);
            resetPins();
            resetUnitMap();
          }}
        >
          {t('salvarEFinalizar')}
        </Button>
      </UnitMapViewMapFooter>
      <div>
        {openEditModal && (
          <UnitMapModal
            isEditing
            unitMap={unitMapData}
            handleConfirmModal={(data) => setUnitMap(data)}
            handleCloseModal={() => setOpenEditModal(false)}
          />
        )}
      </div>
    </Card>
  );
};
